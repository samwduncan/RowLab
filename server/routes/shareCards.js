import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { generateShareCard, getShareCard, deleteShareCard } from '../services/shareCardService.js';

const router = express.Router();

/**
 * POST /api/v1/share-cards/generate
 * Generate a new share card
 */
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const { workoutId, cardType, format, options, teamId } = req.body;

    // Validation
    if (!cardType) {
      return res.status(400).json({ error: 'cardType is required' });
    }

    if (!format) {
      return res.status(400).json({ error: 'format is required' });
    }

    const validCardTypes = [
      'erg_summary',
      'erg_charts',
      'pr_celebration',
      'regatta_result',
      'regatta_summary',
      'season_recap',
      'team_leaderboard',
    ];

    if (!validCardTypes.includes(cardType)) {
      return res.status(400).json({
        error: `Invalid cardType. Must be one of: ${validCardTypes.join(', ')}`,
      });
    }

    const validFormats = ['1:1', '9:16'];
    if (!validFormats.includes(format)) {
      return res.status(400).json({
        error: `Invalid format. Must be one of: ${validFormats.join(', ')}`,
      });
    }

    // For most card types, workoutId is required
    const workoutRequiredTypes = ['erg_summary', 'erg_charts', 'pr_celebration', 'regatta_result'];
    if (workoutRequiredTypes.includes(cardType) && !workoutId) {
      return res.status(400).json({
        error: `workoutId is required for ${cardType} card type`,
      });
    }

    // Generate the card
    const result = await generateShareCard({
      workoutId: workoutId || null,
      cardType,
      format,
      options: options || {},
      userId: req.user.id,
      teamId: teamId || null,
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Share card generation error:', error);

    // Handle specific errors
    if (error.message === 'Workout not found') {
      return res.status(404).json({ error: error.message });
    }

    if (error.message.includes('Python service')) {
      return res.status(503).json({
        error: 'Share card rendering service unavailable. Please try again later.',
      });
    }

    res.status(500).json({
      error: error.message || 'Failed to generate share card',
    });
  }
});

/**
 * GET /api/v1/share-cards/:shareId
 * Get share card metadata (public endpoint - no auth)
 */
router.get('/:shareId', async (req, res) => {
  try {
    const { shareId } = req.params;

    const shareCard = await getShareCard(shareId);

    res.json(shareCard);
  } catch (error) {
    console.error('Get share card error:', error);

    if (error.message === 'Share card not found') {
      return res.status(404).json({ error: error.message });
    }

    if (error.message === 'Share card has expired') {
      return res.status(410).json({ error: error.message }); // 410 Gone
    }

    res.status(500).json({ error: 'Failed to retrieve share card' });
  }
});

/**
 * DELETE /api/v1/share-cards/:shareId
 * Delete a share card (requires ownership)
 */
router.delete('/:shareId', authenticateToken, async (req, res) => {
  try {
    const { shareId } = req.params;

    const result = await deleteShareCard(shareId, req.user.id);

    res.json(result);
  } catch (error) {
    console.error('Delete share card error:', error);

    if (error.message === 'Share card not found') {
      return res.status(404).json({ error: error.message });
    }

    if (error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }

    res.status(500).json({ error: 'Failed to delete share card' });
  }
});

export default router;
