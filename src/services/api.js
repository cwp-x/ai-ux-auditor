/* =========================================
   services/api.js
   All backend communication lives here.
   Handles real fetch calls to /analyze,
   request timeouts, response validation,
   and falls back to mock when configured.
   ========================================= */

import { CONFIG }    from '../core/config.js';
import { fetchMock } from './mockData.js';

/* ─────────────────────────────────────────
   analyzeUrl(url)
   Main public function.
   Routes to mock or real fetch depending
   on CONFIG.API.USE_MOCK.

   Returns a validated audit result object:
   {
     score:           number,
     issues:          string[],
     recommendations: string[],
   }

   Throws a descriptive Error on failure.
   ───────────────────────────────────────── */
export async function analyzeUrl(url) {
  if (CONFIG.API.USE_MOCK) {
    return fetchMock(url);
  }
  return _fetchReal(url);
}

/* ─────────────────────────────────────────
   _fetchReal(url)
   Sends a POST request to the backend.
   Applies a timeout, validates the response
   shape, and normalises the data.
   ───────────────────────────────────────── */
async function _fetchReal(url) {
  const controller = new AbortController();
  const timeoutId  = setTimeout(
    () => controller.abort(),
    CONFIG.API.TIMEOUT_MS
  );

  let response;

  try {
    response = await fetch(CONFIG.API.ENDPOINT, {
      method:  CONFIG.API.METHOD,
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ url }),
      signal:  controller.signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw new Error('Network error. Please check your connection.');
  } finally {
    clearTimeout(timeoutId);
  }

  // HTTP-level error
  if (!response.ok) {
    let message = `Server error (${response.status}).`;
    try {
      const body = await response.json();
      if (body?.error) message = body.error;
    } catch {
      // ignore JSON parse failure on error responses
    }
    throw new Error(message);
  }

  // Parse JSON
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('Invalid response from server. Please try again.');
  }

  // Validate and normalise shape
  return _validateResponse(data);
}

/* ─────────────────────────────────────────
   _validateResponse(data)
   Ensures the response has the expected
   shape and coerces types where safe.
   Throws if the response is unusable.
   ───────────────────────────────────────── */
function _validateResponse(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Unexpected response format from server.');
  }

  const score = Number(data.score);
  if (isNaN(score) || score < 0 || score > 100) {
    throw new Error('Invalid score received from server.');
  }

  const issues = Array.isArray(data.issues)
    ? data.issues.filter(i => typeof i === 'string')
    : [];

  const recommendations = Array.isArray(data.recommendations)
    ? data.recommendations.filter(r => typeof r === 'string')
    : [];

  return {
    score:           Math.round(score),
    issues,
    recommendations,
  };
}