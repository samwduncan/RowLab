import { prisma } from '../db/connection.js';

/**
 * Get latest whiteboard for team
 */
export async function getLatestWhiteboard(teamId) {
  const whiteboard = await prisma.whiteboard.findFirst({
    where: { teamId },
    orderBy: { date: 'desc' },
    include: {
      author: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return whiteboard;
}

/**
 * Get whiteboard by ID
 */
export async function getWhiteboardById(teamId, id) {
  const whiteboard = await prisma.whiteboard.findFirst({
    where: { id, teamId },
    include: {
      author: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!whiteboard) {
    throw new Error('Whiteboard not found');
  }

  return whiteboard;
}

/**
 * Create or update whiteboard (upsert by teamId + date)
 */
export async function createOrUpdateWhiteboard(teamId, authorId, { date, content }) {
  const whiteboard = await prisma.whiteboard.upsert({
    where: {
      teamId_date: { teamId, date },
    },
    update: {
      content,
      authorId,
    },
    create: {
      teamId,
      date,
      content,
      authorId,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return whiteboard;
}

/**
 * Delete whiteboard
 */
export async function deleteWhiteboard(teamId, id) {
  // Verify whiteboard exists and belongs to team
  const existing = await prisma.whiteboard.findFirst({
    where: { id, teamId },
  });

  if (!existing) {
    throw new Error('Whiteboard not found');
  }

  await prisma.whiteboard.delete({
    where: { id },
  });

  return { deleted: true };
}
