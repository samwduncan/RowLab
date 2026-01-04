import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { getPromptForModel, ROWING_EXPERT_PROMPT } from '../prompts/rowing-expert.js';

const router = express.Router();

// Ollama configuration
const OLLAMA_ENDPOINT = process.env.OLLAMA_ENDPOINT || 'http://localhost:11434';
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || 'phi4-mini-reasoning:3.8b';

// Get the appropriate prompt based on model size
const getSystemPrompt = (modelName) => {
  return getPromptForModel(modelName || DEFAULT_MODEL);
};

/**
 * Check Ollama status (read-only)
 * Ollama is controlled via systemd/Home Assistant, not RowLab
 */
router.get('/running', async (req, res) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(`${OLLAMA_ENDPOINT}/api/tags`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    res.json({ running: response.ok });
  } catch (err) {
    res.json({ running: false });
  }
});

/**
 * Check Ollama availability and list models
 */
router.get('/status', async (req, res) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(`${OLLAMA_ENDPOINT}/api/tags`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const models = data.models?.map(m => ({
        name: m.name,
        size: m.size,
        modified: m.modified_at,
      })) || [];

      res.json({
        available: true,
        endpoint: OLLAMA_ENDPOINT,
        models,
        defaultModel: DEFAULT_MODEL,
      });
    } else {
      res.json({ available: false, error: 'Ollama not responding' });
    }
  } catch (err) {
    res.json({
      available: false,
      error: err.name === 'AbortError' ? 'Connection timeout' : err.message,
    });
  }
});

/**
 * Chat with AI assistant
 * Supports streaming responses
 */
router.post('/chat', async (req, res) => {
  const { message, context, model, stream = true } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Build context string from app state
  let contextStr = '';
  if (context) {
    if (context.athletes?.length) {
      const portCount = context.athletes.filter(a => a.side === 'P' || a.side === 'B').length;
      const starboardCount = context.athletes.filter(a => a.side === 'S' || a.side === 'B').length;
      const coxCount = context.athletes.filter(a => a.side === 'Cox').length;
      contextStr += `\nRoster: ${context.athletes.length} athletes (${portCount} port, ${starboardCount} starboard, ${coxCount} coxswains)`;

      // Include top athletes by erg if available
      const withErg = context.athletes.filter(a => a.ergScore).sort((a, b) => a.ergScore - b.ergScore);
      if (withErg.length > 0) {
        contextStr += `\nTop 5 by erg: ${withErg.slice(0, 5).map(a => `${a.lastName} (${a.ergScore})`).join(', ')}`;
      }
    }

    if (context.activeBoats?.length) {
      contextStr += `\nActive boats: ${context.activeBoats.map(b => {
        const filled = b.seats?.filter(s => s.athlete).length || 0;
        const total = b.seats?.length || 0;
        return `${b.boatConfig?.name || 'Boat'} (${filled}/${total} filled)`;
      }).join(', ')}`;
    }
  }

  const fullPrompt = contextStr
    ? `Current app state:${contextStr}\n\nUser question: ${message}`
    : message;

  try {
    const ollamaRes = await fetch(`${OLLAMA_ENDPOINT}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model || DEFAULT_MODEL,
        prompt: fullPrompt,
        system: getSystemPrompt(model),
        stream: stream,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          num_predict: 500,
        },
      }),
    });

    if (!ollamaRes.ok) {
      const error = await ollamaRes.text();
      console.error('Ollama error:', error);
      return res.status(502).json({ error: 'AI service error', details: error });
    }

    if (stream) {
      // Stream response
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const reader = ollamaRes.body.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(Boolean);

          for (const line of lines) {
            try {
              const json = JSON.parse(line);
              if (json.response) {
                res.write(`data: ${JSON.stringify({ text: json.response, done: json.done })}\n\n`);
              }
              if (json.done) {
                res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
              }
            } catch (e) {
              // Skip malformed JSON
            }
          }
        }
      } finally {
        res.end();
      }
    } else {
      // Non-streaming response
      const data = await ollamaRes.json();
      res.json({ response: data.response, done: true });
    }
  } catch (err) {
    console.error('AI chat error:', err);
    res.status(500).json({ error: 'Failed to connect to AI service', details: err.message });
  }
});

/**
 * Pull a model (admin only)
 */
router.post('/pull-model', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { model } = req.body;
  if (!model) {
    return res.status(400).json({ error: 'Model name required' });
  }

  try {
    const ollamaRes = await fetch(`${OLLAMA_ENDPOINT}/api/pull`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: model, stream: false }),
    });

    if (ollamaRes.ok) {
      res.json({ success: true, message: `Model ${model} pulled successfully` });
    } else {
      const error = await ollamaRes.text();
      res.status(502).json({ error: 'Failed to pull model', details: error });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to connect to Ollama', details: err.message });
  }
});

export default router;
