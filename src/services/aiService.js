/**
 * AI Service - Handles communication with the Ollama-backed AI assistant
 */

const API_URL = '/api/ai';

/**
 * Check if AI service is available
 */
export async function checkAIStatus() {
  try {
    const res = await fetch(`${API_URL}/status`);
    if (!res.ok) throw new Error('Status check failed');
    return await res.json();
  } catch (err) {
    return { available: false, error: err.message };
  }
}

/**
 * Send a chat message and get streaming response
 * @param {string} message - User's message
 * @param {object} context - App context (athletes, boats, etc.)
 * @param {function} onChunk - Callback for each text chunk
 * @param {object} options - Additional options (model, etc.)
 * @returns {Promise<string>} - Complete response text
 */
export async function sendChatMessage(message, context, onChunk, options = {}) {
  const { model } = options;

  try {
    const res = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        context,
        model,
        stream: true,
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Chat request failed');
    }

    // Handle streaming response
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

      for (const line of lines) {
        try {
          const data = JSON.parse(line.slice(6)); // Remove 'data: ' prefix
          if (data.text) {
            fullText += data.text;
            onChunk?.(data.text, fullText);
          }
        } catch (e) {
          // Skip malformed JSON
        }
      }
    }

    return fullText;
  } catch (err) {
    throw err;
  }
}

/**
 * Send a chat message without streaming (simpler, for basic use)
 */
export async function sendChatMessageSimple(message, context, options = {}) {
  const { model } = options;

  const res = await fetch(`${API_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      context,
      model,
      stream: false,
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Chat request failed');
  }

  const data = await res.json();
  return data.response;
}

/**
 * Suggested prompts for the rowing assistant
 */
export const SUGGESTED_PROMPTS = [
  {
    text: 'Suggest a Varsity 8+ lineup',
    icon: '🚣',
  },
  {
    text: 'Analyze my roster balance',
    icon: '⚖️',
  },
  {
    text: 'Who should row stroke seat?',
    icon: '🎯',
  },
  {
    text: 'Optimize for speed vs. balance',
    icon: '⚡',
  },
];

export default {
  checkAIStatus,
  sendChatMessage,
  sendChatMessageSimple,
  SUGGESTED_PROMPTS,
};
