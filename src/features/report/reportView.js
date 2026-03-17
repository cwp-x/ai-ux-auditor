/* =========================================
   features/report/reportView.js
   Builds and inserts the report section
   HTML shell into the page.
   Calls reportRender to populate data.
   Controls report visibility.
   ========================================= */

import { CONFIG }                                           from '../../core/config.js';
import { renderScore, renderIssues, renderRecommendations } from './reportRender.js';
import { stripProtocol }                                    from './reportUtils.js';

/* ── Internal reference to the results region ── */
let _resultsRegion = null;

/* ─────────────────────────────────────────
   showResults(url, result)
   Main entry point called by homeEvents
   after a successful API response.
   Builds the shell, populates data,
   and scrolls the results into view.
   ───────────────────────────────────────── */
export function showResults(url, result) {
  _ensureShell();

  // Populate meta
  const urlDisplay = document.getElementById('auditedUrl');
  if (urlDisplay) urlDisplay.textContent = stripProtocol(url);

  // Render all data sections
  renderScore(result.score);
  renderIssues(result.issues);
  renderRecommendations(result.recommendations);

  // Make visible
  _resultsRegion.hidden = false;

  // Smooth scroll into view
  requestAnimationFrame(() => {
    _resultsRegion.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

/* ─────────────────────────────────────────
   hideResults()
   Hides the results region.
   Called before a new analysis starts.
   ───────────────────────────────────────── */
export function hideResults() {
  if (_resultsRegion) _resultsRegion.hidden = true;
}

/* ─────────────────────────────────────────
   _ensureShell()
   Creates the results region HTML shell
   the first time it's needed and appends
   it to the page. Idempotent — safe to
   call on every analysis.
   ───────────────────────────────────────── */
function _ensureShell() {
  // Already exists — just clear dynamic content
  if (_resultsRegion) {
    _clearDynamicContent();
    return;
  }

  const shell = document.createElement('section');
  shell.id        = 'resultsRegion';
  shell.className = 'results-region container';
  shell.hidden    = true;
  shell.setAttribute('aria-live', 'polite');

  shell.innerHTML = `

    <!-- ── Results header ── -->
    <div class="results-header">
      <div class="results-meta">
        <span class="results-status">${CONFIG.COPY.RESULTS_STATUS}</span>
        <span id="auditedUrl" class="results-url"></span>
      </div>

      <!-- ── Download PDF action bar ── -->
      <div class="results-actions">
        <button id="downloadPdfBtn" class="btn-secondary">
          <span class="btn__icon">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M7.5 2v8M4 7l3.5 3.5L11 7"
                stroke="currentColor" stroke-width="1.5"
                stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 12h11"
                stroke="currentColor" stroke-width="1.5"
                stroke-linecap="round"/>
            </svg>
          </span>
          <span class="btn__text">${CONFIG.COPY.BTN_DOWNLOAD_IDLE}</span>
          <span class="btn__spinner" aria-hidden="true"></span>
        </button>
      </div>

      <div class="divider"></div>
    </div>

    <!-- ── Results grid: Score + Issues ── -->
    <div class="results-grid">

      <!-- Score card -->
      <div class="score-card card">
        <div class="card__label">UX Score</div>
        <div class="score-ring-wrap">
          <svg id="scoreCircle" class="score-ring"
            viewBox="0 0 120 120" width="160" height="160">
            <circle class="score-ring__track" cx="60" cy="60" r="50"/>
            <circle class="score-ring__fill"  cx="60" cy="60" r="50"
              id="scoreArc"/>
          </svg>
          <div class="score-center">
            <span id="scoreText" class="score-number">0</span>
            <span class="score-sublabel">/ 100</span>
          </div>
        </div>
        <div id="scoreGrade" class="score-grade badge"></div>
      </div>

      <!-- Issues card -->
      <div class="issues-card card">
        <div class="card__label">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1L13 12H1L7 1Z"
              stroke="#f59e0b" stroke-width="1.4" stroke-linejoin="round"/>
            <path d="M7 5.5v3"
              stroke="#f59e0b" stroke-width="1.4" stroke-linecap="round"/>
            <circle cx="7" cy="10" r=".75" fill="#f59e0b"/>
          </svg>
          Issues Found
        </div>
        <div id="issuesList" class="issues-list"></div>
      </div>

    </div>

    <!-- ── Recommendations card ── -->
    <div class="recs-card card">
      <div class="card__label">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2.5 7.5l3 3 6-6"
            stroke="#22c55e" stroke-width="1.5"
            stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        AI Recommendations
      </div>
      <div id="recsList" class="recs-list"></div>
    </div>

  `;

  // Append after the page's last child
  document.getElementById('app').appendChild(shell);
  _resultsRegion = shell;
}

/* ─────────────────────────────────────────
   _clearDynamicContent()
   Clears only the data-driven containers
   before re-rendering fresh results.
   Preserves the shell structure.
   ───────────────────────────────────────── */
function _clearDynamicContent() {
  const ids = ['scoreText', 'scoreGrade', 'issuesList', 'recsList', 'auditedUrl'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });

  // Reset score ring
  const arc = document.getElementById('scoreArc');
  if (arc) arc.style.strokeDashoffset = String(CONFIG.RING.CIRCUMFERENCE);
}

// stripProtocol is imported from reportUtils.js above.