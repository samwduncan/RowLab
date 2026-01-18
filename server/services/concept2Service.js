import crypto from 'crypto';
import { prisma } from '../db/connection.js';
import { bulkCreateWorkouts } from './workoutService.js';

const C2_AUTH_URL = 'https://log.concept2.com/oauth/authorize';
const C2_TOKEN_URL = 'https://log.concept2.com/oauth/access_token';
const C2_API_URL = 'https://log.concept2.com/api';

/**
 * Generate OAuth authorization URL
 */
export function getAuthorizationUrl(athleteId, redirectUri) {
  const state = crypto.randomBytes(16).toString('hex');

  // Store state temporarily (in production, use Redis or DB)
  // For now, encode athleteId in state
  const stateData = Buffer.from(JSON.stringify({ athleteId, nonce: state })).toString('base64url');

  const params = new URLSearchParams({
    client_id: process.env.CONCEPT2_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'user:read results:read',
    state: stateData,
  });

  return `${C2_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(code, redirectUri) {
  const response = await fetch(C2_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: process.env.CONCEPT2_CLIENT_ID,
      client_secret: process.env.CONCEPT2_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(refreshToken) {
  const response = await fetch(C2_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: process.env.CONCEPT2_CLIENT_ID,
      client_secret: process.env.CONCEPT2_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error('Token refresh failed');
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || refreshToken,
    expiresIn: data.expires_in,
  };
}

/**
 * Store OAuth tokens for an athlete
 */
export async function storeTokens(athleteId, c2UserId, tokens) {
  const expiresAt = new Date();
  expiresAt.setSeconds(expiresAt.getSeconds() + tokens.expiresIn);

  await prisma.concept2Auth.upsert({
    where: { athleteId },
    update: {
      c2UserId,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenExpiresAt: expiresAt,
    },
    create: {
      athleteId,
      c2UserId,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenExpiresAt: expiresAt,
    },
  });
}

/**
 * Get valid access token (refresh if needed)
 */
export async function getValidToken(athleteId) {
  const auth = await prisma.concept2Auth.findUnique({
    where: { athleteId },
  });

  if (!auth) {
    throw new Error('No Concept2 connection');
  }

  // Check if token is expired (with 5 min buffer)
  const now = new Date();
  const expiresAt = new Date(auth.tokenExpiresAt);
  expiresAt.setMinutes(expiresAt.getMinutes() - 5);

  if (now > expiresAt) {
    // Refresh the token
    const newTokens = await refreshAccessToken(auth.refreshToken);
    await storeTokens(athleteId, auth.c2UserId, newTokens);
    return newTokens.accessToken;
  }

  return auth.accessToken;
}

/**
 * Get Concept2 user profile
 */
export async function getC2UserProfile(accessToken) {
  const response = await fetch(`${C2_API_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get C2 user profile');
  }

  const data = await response.json();
  return data.data;
}

/**
 * Fetch workouts from Concept2 API
 */
export async function fetchC2Workouts(accessToken, fromDate = null) {
  const params = new URLSearchParams({
    type: 'rower',
  });

  if (fromDate) {
    params.append('from', fromDate.toISOString().split('T')[0]);
  }

  const response = await fetch(`${C2_API_URL}/users/me/results?${params}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch C2 workouts');
  }

  const data = await response.json();
  return data.data || [];
}

/**
 * Convert C2 workout to our format
 */
export function convertC2Workout(c2Workout, athleteId) {
  return {
    athleteId,
    source: 'concept2_sync',
    c2LogbookId: String(c2Workout.id),
    date: c2Workout.date,
    distanceM: c2Workout.distance,
    durationSeconds: c2Workout.time ? c2Workout.time / 10 : null, // C2 stores in 0.1s
    strokeRate: c2Workout.stroke_rate,
    calories: c2Workout.calories_total,
    dragFactor: c2Workout.drag_factor,
    rawData: c2Workout,
  };
}

/**
 * Sync workouts for an athlete
 */
export async function syncAthleteWorkouts(athleteId, teamId) {
  const auth = await prisma.concept2Auth.findUnique({
    where: { athleteId },
    include: { athlete: true },
  });

  if (!auth) {
    throw new Error('No Concept2 connection');
  }

  // Verify athlete belongs to team
  if (auth.athlete.teamId !== teamId) {
    throw new Error('Athlete not in team');
  }

  const accessToken = await getValidToken(athleteId);

  // Fetch workouts since last sync (or last 30 days)
  const fromDate = auth.lastSyncedAt || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const c2Workouts = await fetchC2Workouts(accessToken, fromDate);

  // Convert and import
  const workouts = c2Workouts.map(w => convertC2Workout(w, athleteId));
  const result = await bulkCreateWorkouts(teamId, workouts);

  // Update last synced timestamp
  await prisma.concept2Auth.update({
    where: { athleteId },
    data: { lastSyncedAt: new Date() },
  });

  return {
    ...result,
    totalFetched: c2Workouts.length,
  };
}

/**
 * Disconnect Concept2 account
 */
export async function disconnectC2(athleteId, teamId) {
  const auth = await prisma.concept2Auth.findUnique({
    where: { athleteId },
    include: { athlete: true },
  });

  if (!auth) {
    throw new Error('No Concept2 connection');
  }

  if (auth.athlete.teamId !== teamId) {
    throw new Error('Athlete not in team');
  }

  await prisma.concept2Auth.delete({
    where: { athleteId },
  });

  return { disconnected: true };
}

/**
 * Get Concept2 connection status for an athlete
 */
export async function getC2Status(athleteId) {
  const auth = await prisma.concept2Auth.findUnique({
    where: { athleteId },
  });

  if (!auth) {
    return { connected: false };
  }

  return {
    connected: true,
    c2UserId: auth.c2UserId,
    lastSyncedAt: auth.lastSyncedAt,
  };
}

/**
 * Parse OAuth state parameter
 */
export function parseState(state) {
  try {
    const decoded = Buffer.from(state, 'base64url').toString();
    return JSON.parse(decoded);
  } catch {
    throw new Error('Invalid state parameter');
  }
}
