/* =========================================
   features/ai/aiEvents.js
   Orchestrates the AI summary feature.
   Called automatically after a successful
   UX audit analysis.
   Calls the Anthropic API via fetch,
   streams or parses the response, and
   updates the AI summary card via aiView.
   ========================================= */

import { CONFIG }                                         from '../../core/config.js';
import { injectAISummaryCard, renderAISummary,
         renderAISummaryError }                           from './aiView.js';

/* ─────────────────────────────────────────
   triggerAISummary(result)
   Main entry point. Called by homeEvents
   right after a successful audit response.

   @param result  { score, issues, recommendations }
   ───────────────────────────────────────── */
export async function triggerAISummary(result) {
  // 1. Inject card with skeleton loader
  injectAISummaryCard();

  try {
    // 2. Build prompt from audit data
    const prompt = _buildPrompt(result);

    // 3. Call Anthropic API
    const summary = await _callAnthropicAPI(prompt);

    // 4. Render the summary text
    renderAISummary(summary);

  } catch (err) {
    console.error('[aiEvents] AI summary failed:', err);
    renderAISummaryError();
  }
}

/* ─────────────────────────────────────────
   _buildPrompt(result)
   Constructs a concise, structured prompt
   from the audit result data.
   ───────────────────────────────────────── */
function _buildPrompt(result) {
  const issuesList = result.issues.length
    ? result.issues.map(i => `- ${i}`).join('\n')
    : '- None detected';

  const recsList = result.recommendations.length
    ? result.recommendations.map(r => `- ${r}`).join('\n')
    : '- None';

  return `You are a senior UX consultant. A website has just been audited with the following results:

UX Score: ${result.score}/100
Issues Found:
${issuesList}

Recommendations:
${recsList}

Write a concise 2-3 sentence executive summary of this UX audit for a non-technical client. 
Be direct and constructive. Highlight the most critical issue and the most impactful recommendation.
Use **bold** for key terms. Do not use bullet points or headers. Plain paragraph only.`;
}

/* ─────────────────────────────────────────
   _callAnthropicAPI(prompt)
   Sends the prompt to the Anthropic
   Messages API and returns the text response.
   Uses claude-sonnet-4-20250514 model.
   ───────────────────────────────────────── */
async function _callAnthropicAPI(prompt) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type':         'application/json',
      'anthropic-version':    '2023-06-01',
      'anthropic-dangerous-direct-browser-calls': 'true',
    },
    body: JSON.stringify({
      model:      'claude-sonnet-4-20250514',
      max_tokens: 300,
      messages: [
        {
          role:    'user',
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error ${response.status}`);
  }

  const data = await response.json();

  // Extract text from content blocks
  const text = data.content
    ?.filter(block => block.type === 'text')
    ?.map(block => block.text)
    ?.join('')
    ?.trim();

  if (!text) {
    throw new Error('Empty response from Anthropic API.');
  }

  return text;
}