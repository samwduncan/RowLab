import express from 'express';
import {
  getAnalyticsPMC,
  getAnalyticsVolume,
  deriveInsights,
} from '../../services/analyticsService.js';

const router = express.Router();

const VALID_PMC_RANGES = ['30d', '90d', '180d', '365d', 'all'];
const VALID_VOL_RANGES = ['4w', '12w', '6m', '1y'];
const VALID_GRANULARITIES = ['weekly', 'monthly'];
const VALID_METRICS = ['distance', 'duration'];

// GET /api/u/analytics/pmc
router.get('/pmc', async (req, res, next) => {
  try {
    const range = req.query.range || '90d';
    if (!VALID_PMC_RANGES.includes(range)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_RANGE', message: `Invalid range: ${range}` },
      });
    }
    const sport = req.query.sport || null;
    const data = await getAnalyticsPMC(req.user.id, range, sport);
    const insights = deriveInsights(data, data._settings);

    // Remove internal _settings from response
    const { _settings, ...responseData } = data;

    res.json({ success: true, data: { ...responseData, insights } });
  } catch (err) {
    next(err);
  }
});

// GET /api/u/analytics/volume
router.get('/volume', async (req, res, next) => {
  try {
    const range = req.query.range || '12w';
    if (!VALID_VOL_RANGES.includes(range)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_RANGE', message: `Invalid range: ${range}` },
      });
    }
    const granularity = req.query.granularity || 'weekly';
    if (!VALID_GRANULARITIES.includes(granularity)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_GRANULARITY', message: `Invalid granularity: ${granularity}` },
      });
    }
    const metric = req.query.metric || 'distance';
    if (!VALID_METRICS.includes(metric)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_METRIC', message: `Invalid metric: ${metric}` },
      });
    }
    const data = await getAnalyticsVolume(req.user.id, range, granularity, metric);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

export default router;
