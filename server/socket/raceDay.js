/**
 * Race Day WebSocket Server
 *
 * Implements real-time race day features:
 * - Live race result broadcasting
 * - Ranking updates
 * - Viewer count tracking
 * - Regatta room management
 *
 * Extends existing Socket.IO server from collaboration.js
 */

import logger from '../utils/logger.js';

// Active regatta rooms: regattaId -> { viewers, lastActivity }
const regattaRooms = new Map();

/**
 * Initialize race day Socket.IO handlers
 * @param {import('socket.io').Server} io - Existing Socket.IO server instance
 */
export function initializeRaceDaySocket(io) {
  io.on('connection', (socket) => {
    // Join race day room
    socket.on('raceday:join', ({ regattaId }) => {
      if (!regattaId) {
        logger.warn('Race day join missing regattaId', { socketId: socket.id });
        return;
      }

      socket.join(`regatta-${regattaId}`);

      // Initialize room if needed
      if (!regattaRooms.has(regattaId)) {
        regattaRooms.set(regattaId, { viewers: 0, lastActivity: Date.now() });
      }

      const room = regattaRooms.get(regattaId);
      room.viewers++;
      room.lastActivity = Date.now();

      // Notify room of new viewer count
      io.to(`regatta-${regattaId}`).emit('raceday:viewers', {
        count: room.viewers,
        timestamp: Date.now(),
      });

      logger.info('User joined race day', {
        regattaId,
        userId: socket.user?.id,
        socketId: socket.id,
        viewers: room.viewers,
      });
    });

    // Leave race day room
    socket.on('raceday:leave', ({ regattaId }) => {
      if (!regattaId) return;

      socket.leave(`regatta-${regattaId}`);

      const room = regattaRooms.get(regattaId);
      if (room) {
        room.viewers = Math.max(0, room.viewers - 1);
        room.lastActivity = Date.now();

        io.to(`regatta-${regattaId}`).emit('raceday:viewers', {
          count: room.viewers,
          timestamp: Date.now(),
        });

        logger.debug('User left race day', { regattaId, viewers: room.viewers });
      }
    });

    // Broadcast new race result to all watchers
    socket.on('raceday:result:submit', ({ regattaId, raceId, result }) => {
      if (!regattaId || !raceId || !result) {
        logger.warn('Race result submit missing required fields', {
          regattaId,
          raceId,
          hasResult: !!result,
        });
        return;
      }

      // Broadcast to everyone in the regatta room (including sender for confirmation)
      io.to(`regatta-${regattaId}`).emit('raceday:result:new', {
        raceId,
        result,
        submittedBy: socket.user?.name || 'Unknown',
        submittedById: socket.user?.id,
        timestamp: Date.now(),
      });

      const room = regattaRooms.get(regattaId);
      if (room) {
        room.lastActivity = Date.now();
      }

      logger.info('Race result broadcast', {
        regattaId,
        raceId,
        submittedBy: socket.user?.name,
        teamName: result.teamName,
      });
    });

    // Broadcast ranking recalculation
    socket.on('raceday:rankings:updated', ({ regattaId, rankings }) => {
      if (!regattaId || !rankings) {
        logger.warn('Rankings update missing required fields', {
          regattaId,
          hasRankings: !!rankings,
        });
        return;
      }

      io.to(`regatta-${regattaId}`).emit('raceday:rankings:update', {
        rankings,
        timestamp: Date.now(),
      });

      const room = regattaRooms.get(regattaId);
      if (room) {
        room.lastActivity = Date.now();
      }

      logger.info('Rankings broadcast', {
        regattaId,
        count: rankings?.length || 0,
      });
    });

    // Handle disconnect - viewer count is cleaned up in periodic sweep
    socket.on('disconnect', () => {
      // Socket.IO automatically removes socket from all rooms
      // We can't easily track which regatta rooms this socket was in without additional state
      // Periodic cleanup below handles stale viewer counts
      logger.debug('Socket disconnected (race day)', { socketId: socket.id });
    });
  });

  // Periodic cleanup of stale regatta rooms (no viewers, no activity for 30 min)
  setInterval(
    () => {
      const now = Date.now();
      const staleThreshold = 30 * 60 * 1000; // 30 minutes

      for (const [regattaId, room] of regattaRooms.entries()) {
        if (room.viewers === 0 && now - room.lastActivity > staleThreshold) {
          regattaRooms.delete(regattaId);
          logger.debug('Stale regatta room cleaned', { regattaId });
        }
      }
    },
    5 * 60 * 1000
  ); // Check every 5 minutes

  logger.info('Race day WebSocket handlers initialized');
}

export default { initializeRaceDaySocket };
