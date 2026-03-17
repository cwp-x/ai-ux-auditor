/* =========================================
   features/home/homeEvents.js
   All event listeners for the home view.
   Wires up the Analyze button and URL input.
   Calls the API and updates global state.
   No rendering logic lives here.
   ========================================= */

import { CONFIG }                                     from '../../core/config.js';
import { setState, setLoading, setResult, setError,
         clearError }                                 from '../../core/state.js';
import { analyzeUrl }                                 from '../../services/api.js';
import { getUrlInputEl, getAnalyzeBtnEl,
         setAnalyzeBtnState, flashInvalidInput }      from './homeView.js';
import { showResults }                                from '../report/reportView.js';
import { triggerAISummary }                           from '../ai/aiEvents.js';

/* ─────────────────────────────────────────
   initHomeEvents()
   Registers all event listeners for the
   home view. Call once after renderHome().
   ───────────────────────────────────────── */
export function initHomeEvents() {
  const urlInput  = getUrlInputEl();
  const analyzeBtn = getAnalyzeBtnEl();

  if (!urlInput || !analyzeBtn) {
    console.warn('[homeEvents] Required DOM elements not found.');
    return;
  }

  // Click → run analysis
  analyzeBtn.addEventListener('click', _handleAnalyze);

  // Enter key → run analysis
  urlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') _handleAnalyze();
  });

  // Typing → clear any existing error
  urlInput.addEventListener('input', () => {
    clearError();
    _hideErrorBanner();
  });
}

/* ─────────────────────────────────────────
   _handleAnalyze()
   Orchestrates the full analyze flow:
   validate → set loading → call API →
   update state → render results or error.
   ───────────────────────────────────────── */
async function _handleAnalyze() {
  const urlInput = getUrlInputEl();
  const raw      = urlInput?.value.trim() ?? '';

  // ── Validate ──
  if (!raw) {
    _showErrorBanner(CONFIG.COPY.ERROR_EMPTY);
    flashInvalidInput();
    urlInput?.focus();
    return;
  }

  if (!_isValidUrl(raw)) {
    _showErrorBanner(CONFIG.COPY.ERROR_INVALID_URL);
    flashInvalidInput();
    urlInput?.focus();
    return;
  }

  // ── Start loading ──
  _hideErrorBanner();
  setLoading(true);
  setAnalyzeBtnState(true);
  setState({ url: raw });

  try {
    // ── Call API (real or mock) ──
    const result = await analyzeUrl(raw);

    // ── Success: update state and render ──
    setResult(result);
    setLoading(false);
    setAnalyzeBtnState(false);
    showResults(raw, result);

    // ── Automatically trigger AI summary ──
    triggerAISummary(result);

  } catch (err) {
    // ── Failure: show error ──
    const message = err?.message || CONFIG.COPY.ERROR_DEFAULT;
    setError(message);
    setAnalyzeBtnState(false);
    _showErrorBanner(message);
    console.error('[homeEvents] Analysis error:', err);
  }
}

/* ─────────────────────────────────────────
   _isValidUrl(str)
   Returns true for valid http/https URLs.
   ───────────────────────────────────────── */
function _isValidUrl(str) {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/* ─────────────────────────────────────────
   _showErrorBanner(message)
   _hideErrorBanner()
   Controls the error banner element.
   ───────────────────────────────────────── */
function _showErrorBanner(message) {
  let banner = document.getElementById('errorBanner');

  if (!banner) {
    banner = _createErrorBanner();
  }

  const textEl = banner.querySelector('#errorText');
  if (textEl) textEl.textContent = message;
  banner.hidden = false;
}

function _hideErrorBanner() {
  const banner = document.getElementById('errorBanner');
  if (banner) banner.hidden = true;
}

function _createErrorBanner() {
  const banner = document.createElement('div');
  banner.id        = 'errorBanner';
  banner.className = 'error-banner container';
  banner.hidden    = true;
  banner.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6.5" stroke="#ef4444" stroke-width="1.5"/>
      <path d="M8 5v4M8 11v.5" stroke="#ef4444"
        stroke-width="1.5" stroke-linecap="round"/>
    </svg>
    <span id="errorText"></span>
  `;

  // Insert after the input region
  const inputRegion = document.querySelector('.input-region');
  inputRegion?.insertAdjacentElement('afterend', banner);

  return banner;
}