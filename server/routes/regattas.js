import express from 'express';
import { authenticateToken, requireTeam, requireRole } from '../middleware/auth.js';
import * as regattaService from '../services/regattaService.js';
import logger from '../utils/logger.js';

const router = express.Router();

// All routes require authentication and team context
router.use(authenticateToken, requireTeam);

// ============================================
// Regatta Routes
// ============================================

/**
 * GET /api/v1/regattas
 * List all regattas for the active team
 * Query params: limit, offset, season
 */
router.get('/', async (req, res) => {
  try {
    const { limit, offset, season } = req.query;
    const options = {};

    if (limit) options.limit = parseInt(limit, 10);
    if (offset) options.offset = parseInt(offset, 10);
    if (season) options.season = season;

    const regattas = await regattaService.getRegattas(req.user.activeTeamId, options);

    res.json({ success: true, data: { regattas } });
  } catch (err) {
    logger.error('Get regattas error', { error: err.message });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch regattas',
    });
  }
});

/**
 * POST /api/v1/regattas
 * Create a new regatta (OWNER, COACH only)
 */
router.post('/', requireRole('OWNER', 'COACH'), async (req, res) => {
  try {
    const regatta = await regattaService.createRegatta(req.user.activeTeamId, req.body);

    res.status(201).json({ success: true, data: { regatta } });
  } catch (err) {
    logger.error('Create regatta error', { error: err.message });
    res.status(400).json({
      success: false,
      error: err.message || 'Failed to create regatta',
    });
  }
});

/**
 * GET /api/v1/regattas/:id
 * Get a single regatta with races and results
 */
router.get('/:id', async (req, res) => {
  try {
    const regattaId = req.params.id;
    const regatta = await regattaService.getRegattaById(req.user.activeTeamId, regattaId);

    res.json({ success: true, data: { regatta } });
  } catch (err) {
    if (err.message === 'Regatta not found') {
      return res.status(404).json({
        success: false,
        error: 'Regatta not found',
      });
    }
    logger.error('Get regatta error', { error: err.message });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch regatta',
    });
  }
});

/**
 * PATCH /api/v1/regattas/:id
 * Update a regatta (OWNER, COACH only)
 */
router.patch('/:id', requireRole('OWNER', 'COACH'), async (req, res) => {
  try {
    const regattaId = req.params.id;
    const regatta = await regattaService.updateRegatta(req.user.activeTeamId, regattaId, req.body);

    res.json({ success: true, data: { regatta } });
  } catch (err) {
    if (err.message === 'Regatta not found') {
      return res.status(404).json({
        success: false,
        error: 'Regatta not found',
      });
    }
    logger.error('Update regatta error', { error: err.message });
    res.status(400).json({
      success: false,
      error: err.message || 'Failed to update regatta',
    });
  }
});

/**
 * DELETE /api/v1/regattas/:id
 * Delete a regatta and all related data (OWNER, COACH only)
 */
router.delete('/:id', requireRole('OWNER', 'COACH'), async (req, res) => {
  try {
    const regattaId = req.params.id;
    await regattaService.deleteRegatta(req.user.activeTeamId, regattaId);

    res.json({ success: true });
  } catch (err) {
    if (err.message === 'Regatta not found') {
      return res.status(404).json({
        success: false,
        error: 'Regatta not found',
      });
    }
    logger.error('Delete regatta error', { error: err.message });
    res.status(400).json({
      success: false,
      error: err.message || 'Failed to delete regatta',
    });
  }
});

// ============================================
// Event Routes (Regatta -> Event -> Race)
// ============================================

/**
 * POST /api/v1/regattas/:regattaId/events
 * Create an event within a regatta (OWNER, COACH only)
 */
router.post('/:regattaId/events', requireRole('OWNER', 'COACH'), async (req, res) => {
  try {
    const regattaId = req.params.regattaId;
    const event = await regattaService.createEvent(req.user.activeTeamId, regattaId, req.body);

    res.status(201).json({ success: true, data: { event } });
  } catch (err) {
    if (err.message === 'Regatta not found') {
      return res.status(404).json({
        success: false,
        error: 'Regatta not found',
      });
    }
    logger.error('Create event error', { error: err.message });
    res.status(400).json({
      success: false,
      error: err.message || 'Failed to create event',
    });
  }
});

/**
 * PATCH /api/v1/regattas/events/:eventId
 * Update an event (OWNER, COACH only)
 */
router.patch('/events/:eventId', requireRole('OWNER', 'COACH'), async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const event = await regattaService.updateEvent(req.user.activeTeamId, eventId, req.body);

    res.json({ success: true, data: { event } });
  } catch (err) {
    if (err.message === 'Event not found') {
      return res.status(404).json({
        success: false,
        error: 'Event not found',
      });
    }
    logger.error('Update event error', { error: err.message });
    res.status(400).json({
      success: false,
      error: err.message || 'Failed to update event',
    });
  }
});

/**
 * DELETE /api/v1/regattas/events/:eventId
 * Delete an event and cascade to races (OWNER, COACH only)
 */
router.delete('/events/:eventId', requireRole('OWNER', 'COACH'), async (req, res) => {
  try {
    const eventId = req.params.eventId;
    await regattaService.deleteEvent(req.user.activeTeamId, eventId);

    res.json({ success: true });
  } catch (err) {
    if (err.message === 'Event not found') {
      return res.status(404).json({
        success: false,
        error: 'Event not found',
      });
    }
    logger.error('Delete event error', { error: err.message });
    res.status(400).json({
      success: false,
      error: err.message || 'Failed to delete event',
    });
  }
});

/**
 * POST /api/v1/regattas/events/:eventId/races
 * Add a race to an event (OWNER, COACH only)
 */
router.post('/events/:eventId/races', requireRole('OWNER', 'COACH'), async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const race = await regattaService.addRaceToEvent(req.user.activeTeamId, eventId, req.body);

    res.status(201).json({ success: true, data: { race } });
  } catch (err) {
    if (err.message === 'Event not found') {
      return res.status(404).json({
        success: false,
        error: 'Event not found',
      });
    }
    logger.error('Add race to event error', { error: err.message });
    res.status(400).json({
      success: false,
      error: err.message || 'Failed to add race',
    });
  }
});

// ============================================
// Race Routes
// ============================================

/**
 * POST /api/v1/regattas/:regattaId/races
 * Add a race to a regatta (OWNER, COACH only)
 */
router.post('/:regattaId/races', requireRole('OWNER', 'COACH'), async (req, res) => {
  try {
    const regattaId = req.params.regattaId;
    const race = await regattaService.addRace(req.user.activeTeamId, regattaId, req.body);

    res.status(201).json({ success: true, data: { race } });
  } catch (err) {
    if (err.message === 'Regatta not found') {
      return res.status(404).json({
        success: false,
        error: 'Regatta not found',
      });
    }
    logger.error('Add race error', { error: err.message });
    res.status(400).json({
      success: false,
      error: err.message || 'Failed to add race',
    });
  }
});

/**
 * PATCH /api/v1/regattas/races/:raceId
 * Update a race (OWNER, COACH only)
 */
router.patch('/races/:raceId', requireRole('OWNER', 'COACH'), async (req, res) => {
  try {
    const raceId = req.params.raceId;
    const race = await regattaService.updateRace(req.user.activeTeamId, raceId, req.body);

    res.json({ success: true, data: { race } });
  } catch (err) {
    if (err.message === 'Race not found') {
      return res.status(404).json({
        success: false,
        error: 'Race not found',
      });
    }
    logger.error('Update race error', { error: err.message });
    res.status(400).json({
      success: false,
      error: err.message || 'Failed to update race',
    });
  }
});

/**
 * DELETE /api/v1/regattas/races/:raceId
 * Delete a race (OWNER, COACH only)
 */
router.delete('/races/:raceId', requireRole('OWNER', 'COACH'), async (req, res) => {
  try {
    const raceId = req.params.raceId;
    await regattaService.deleteRace(req.user.activeTeamId, raceId);

    res.json({ success: true });
  } catch (err) {
    if (err.message === 'Race not found') {
      return res.status(404).json({
        success: false,
        error: 'Race not found',
      });
    }
    logger.error('Delete race error', { error: err.message });
    res.status(400).json({
      success: false,
      error: err.message || 'Failed to delete race',
    });
  }
});

// ============================================
// Result Routes
// ============================================

/**
 * POST /api/v1/regattas/races/:raceId/results
 * Add a single result to a race (OWNER, COACH only)
 */
router.post('/races/:raceId/results', requireRole('OWNER', 'COACH'), async (req, res) => {
  try {
    const raceId = req.params.raceId;
    const result = await regattaService.addResult(req.user.activeTeamId, raceId, req.body);

    res.status(201).json({ success: true, data: { result } });
  } catch (err) {
    if (err.message === 'Race not found') {
      return res.status(404).json({
        success: false,
        error: 'Race not found',
      });
    }
    logger.error('Add result error', { error: err.message });
    res.status(400).json({
      success: false,
      error: err.message || 'Failed to add result',
    });
  }
});

/**
 * POST /api/v1/regattas/races/:raceId/results/batch
 * Batch add results to a race (OWNER, COACH only)
 */
router.post('/races/:raceId/results/batch', requireRole('OWNER', 'COACH'), async (req, res) => {
  try {
    const raceId = req.params.raceId;
    const { results } = req.body;

    if (!results || !Array.isArray(results)) {
      return res.status(400).json({
        success: false,
        error: 'results must be an array',
      });
    }

    const createdResults = await regattaService.batchAddResults(
      req.user.activeTeamId,
      raceId,
      results
    );

    res.status(201).json({ success: true, data: { results: createdResults } });
  } catch (err) {
    if (err.message === 'Race not found') {
      return res.status(404).json({
        success: false,
        error: 'Race not found',
      });
    }
    logger.error('Batch add results error', { error: err.message });
    res.status(400).json({
      success: false,
      error: err.message || 'Failed to add results',
    });
  }
});

/**
 * PATCH /api/v1/regattas/results/:resultId
 * Update a result (OWNER, COACH only)
 */
router.patch('/results/:resultId', requireRole('OWNER', 'COACH'), async (req, res) => {
  try {
    const resultId = req.params.resultId;
    const result = await regattaService.updateResult(req.user.activeTeamId, resultId, req.body);

    res.json({ success: true, data: { result } });
  } catch (err) {
    if (err.message === 'Result not found') {
      return res.status(404).json({
        success: false,
        error: 'Result not found',
      });
    }
    logger.error('Update result error', { error: err.message });
    res.status(400).json({
      success: false,
      error: err.message || 'Failed to update result',
    });
  }
});

// ============================================
// Checklist Template Routes
// ============================================

/**
 * GET /api/v1/regattas/checklists/templates
 * List all checklist templates for the team
 */
router.get('/checklists/templates', async (req, res) => {
  try {
    const templates = await regattaService.getChecklistTemplates(req.user.activeTeamId);

    res.json({ success: true, data: { templates } });
  } catch (err) {
    logger.error('Get checklist templates error', { error: err.message });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch templates',
    });
  }
});

/**
 * POST /api/v1/regattas/checklists/templates
 * Create a new checklist template (OWNER, COACH only)
 */
router.post('/checklists/templates', requireRole('OWNER', 'COACH'), async (req, res) => {
  try {
    const template = await regattaService.createChecklistTemplate(
      req.user.activeTeamId,
      req.body
    );

    res.status(201).json({ success: true, data: { template } });
  } catch (err) {
    logger.error('Create checklist template error', { error: err.message });
    res.status(400).json({
      success: false,
      error: err.message || 'Failed to create template',
    });
  }
});

/**
 * PATCH /api/v1/regattas/checklists/templates/:id
 * Update a checklist template (OWNER, COACH only)
 */
router.patch('/checklists/templates/:id', requireRole('OWNER', 'COACH'), async (req, res) => {
  try {
    const templateId = req.params.id;
    const template = await regattaService.updateChecklistTemplate(
      req.user.activeTeamId,
      templateId,
      req.body
    );

    res.json({ success: true, data: { template } });
  } catch (err) {
    if (err.message === 'Template not found') {
      return res.status(404).json({
        success: false,
        error: 'Template not found',
      });
    }
    logger.error('Update checklist template error', { error: err.message });
    res.status(400).json({
      success: false,
      error: err.message || 'Failed to update template',
    });
  }
});

/**
 * DELETE /api/v1/regattas/checklists/templates/:id
 * Delete a checklist template (OWNER, COACH only)
 */
router.delete('/checklists/templates/:id', requireRole('OWNER', 'COACH'), async (req, res) => {
  try {
    const templateId = req.params.id;
    await regattaService.deleteChecklistTemplate(req.user.activeTeamId, templateId);

    res.json({ success: true });
  } catch (err) {
    if (err.message === 'Template not found') {
      return res.status(404).json({
        success: false,
        error: 'Template not found',
      });
    }
    logger.error('Delete checklist template error', { error: err.message });
    res.status(400).json({
      success: false,
      error: err.message || 'Failed to delete template',
    });
  }
});

// ============================================
// Race Checklist Routes
// ============================================

/**
 * GET /api/v1/regattas/races/:raceId/checklist
 * Get checklist for a race
 */
router.get('/races/:raceId/checklist', async (req, res) => {
  try {
    const raceId = req.params.raceId;
    const checklist = await regattaService.getRaceChecklist(req.user.activeTeamId, raceId);

    res.json({ success: true, data: { checklist } });
  } catch (err) {
    if (err.message === 'Race not found') {
      return res.status(404).json({
        success: false,
        error: 'Race not found',
      });
    }
    logger.error('Get race checklist error', { error: err.message });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch checklist',
    });
  }
});

/**
 * GET /api/v1/regattas/races/:raceId/checklist/progress
 * Get checklist progress for a race
 */
router.get('/races/:raceId/checklist/progress', async (req, res) => {
  try {
    const raceId = req.params.raceId;
    const progress = await regattaService.getRaceChecklistProgress(
      req.user.activeTeamId,
      raceId
    );

    res.json({ success: true, data: { progress } });
  } catch (err) {
    if (err.message === 'Race not found') {
      return res.status(404).json({
        success: false,
        error: 'Race not found',
      });
    }
    logger.error('Get checklist progress error', { error: err.message });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch progress',
    });
  }
});

/**
 * POST /api/v1/regattas/races/:raceId/checklist
 * Create a checklist for a race from a template (OWNER, COACH only)
 */
router.post('/races/:raceId/checklist', requireRole('OWNER', 'COACH'), async (req, res) => {
  try {
    const raceId = req.params.raceId;
    const { templateId } = req.body;
    const checklist = await regattaService.createRaceChecklist(
      req.user.activeTeamId,
      raceId,
      templateId
    );

    res.status(201).json({ success: true, data: { checklist } });
  } catch (err) {
    if (err.message === 'Race not found') {
      return res.status(404).json({
        success: false,
        error: 'Race not found',
      });
    }
    if (err.message === 'Checklist already exists for this race') {
      return res.status(400).json({
        success: false,
        error: err.message,
      });
    }
    logger.error('Create race checklist error', { error: err.message });
    res.status(400).json({
      success: false,
      error: err.message || 'Failed to create checklist',
    });
  }
});

/**
 * PATCH /api/v1/regattas/checklists/items/:itemId
 * Toggle a checklist item
 */
router.patch('/checklists/items/:itemId', async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const { completed } = req.body;
    const item = await regattaService.updateChecklistItem(
      req.user.activeTeamId,
      itemId,
      completed,
      req.user.id
    );

    res.json({ success: true, data: { item } });
  } catch (err) {
    if (err.message === 'Checklist item not found') {
      return res.status(404).json({
        success: false,
        error: 'Item not found',
      });
    }
    logger.error('Update checklist item error', { error: err.message });
    res.status(400).json({
      success: false,
      error: err.message || 'Failed to update item',
    });
  }
});

// ============================================
// External Ranking Routes
// ============================================

/**
 * GET /api/v1/regattas/rankings/external
 * Get external rankings for the team
 */
router.get('/rankings/external', async (req, res) => {
  try {
    const { boatClass, source, season } = req.query;
    const rankings = await regattaService.getExternalRankings(req.user.activeTeamId, {
      boatClass,
      source,
      season,
    });

    res.json({ success: true, data: { rankings } });
  } catch (err) {
    logger.error('Get external rankings error', { error: err.message });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch rankings',
    });
  }
});

/**
 * POST /api/v1/regattas/rankings/external
 * Add an external ranking (OWNER, COACH only)
 */
router.post('/rankings/external', requireRole('OWNER', 'COACH'), async (req, res) => {
  try {
    const ranking = await regattaService.addExternalRanking(req.user.activeTeamId, req.body);

    res.status(201).json({ success: true, data: { ranking } });
  } catch (err) {
    if (err.message === 'External team not found') {
      return res.status(404).json({
        success: false,
        error: 'External team not found',
      });
    }
    logger.error('Add external ranking error', { error: err.message });
    res.status(400).json({
      success: false,
      error: err.message || 'Failed to add ranking',
    });
  }
});

/**
 * DELETE /api/v1/regattas/rankings/external/:id
 * Delete an external ranking (OWNER, COACH only)
 */
router.delete('/rankings/external/:id', requireRole('OWNER', 'COACH'), async (req, res) => {
  try {
    const rankingId = req.params.id;
    await regattaService.deleteExternalRanking(req.user.activeTeamId, rankingId);

    res.json({ success: true });
  } catch (err) {
    if (err.message === 'Ranking not found') {
      return res.status(404).json({
        success: false,
        error: 'Ranking not found',
      });
    }
    logger.error('Delete external ranking error', { error: err.message });
    res.status(400).json({
      success: false,
      error: err.message || 'Failed to delete ranking',
    });
  }
});

export default router;
