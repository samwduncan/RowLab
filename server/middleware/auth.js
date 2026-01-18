import { verifyAccessToken } from '../services/tokenService.js';

/**
 * Verify JWT and attach user to request
 */
export async function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: { code: 'NO_TOKEN', message: 'Authentication required' },
    });
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' },
    });
  }

  req.user = {
    id: payload.sub,
    email: payload.email,
    activeTeamId: payload.activeTeamId,
    activeTeamRole: payload.activeTeamRole,
  };

  next();
}

/**
 * Optional authentication - sets req.user if token valid, continues otherwise
 */
export async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    const payload = verifyAccessToken(token);
    if (payload) {
      req.user = {
        id: payload.sub,
        email: payload.email,
        activeTeamId: payload.activeTeamId,
        activeTeamRole: payload.activeTeamRole,
      };
    }
  }

  next();
}

/**
 * Require specific roles
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user.activeTeamRole) {
      return res.status(403).json({
        success: false,
        error: { code: 'NO_TEAM', message: 'No active team selected' },
      });
    }

    if (!roles.includes(req.user.activeTeamRole)) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Insufficient permissions' },
      });
    }

    next();
  };
}

/**
 * Require active team context
 */
export function requireTeam(req, res, next) {
  if (!req.user.activeTeamId) {
    return res.status(400).json({
      success: false,
      error: { code: 'NO_TEAM', message: 'No active team selected' },
    });
  }
  next();
}

/**
 * Team isolation middleware - ensures queries are scoped to active team
 */
export function teamIsolation(req, res, next) {
  if (!req.user?.activeTeamId) {
    return res.status(400).json({
      success: false,
      error: { code: 'NO_TEAM', message: 'Team context required' },
    });
  }

  // Attach team filter helper
  req.teamFilter = { teamId: req.user.activeTeamId };
  next();
}

// Legacy exports for backward compatibility
export const verifyToken = authenticateToken;
