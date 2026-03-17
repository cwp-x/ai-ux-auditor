/* =========================================
   features/report/reportRender.js
   Pure rendering functions for the report.
   Handles score ring animation, issue cards,
   and recommendation items.
   No event logic. No API calls.
   ========================================= */

import { CONFIG }                                              from '../../core/config.js';
import { getScoreMeta, getIssueDescription, escapeHtml } from './reportUtils.js';

/* ─────────────────────────────────────────
   renderScore(score)
   Animates the SVG ring and count-up number.
   Sets the ring color and grade badge.
   ───────────────────────────────────────── */
export function renderScore(score) {
  const arc      = document.getElementById('scoreArc');
  const numEl    = document.getElementById('scoreText');
  const gradeEl  = document.getElementById('scoreGrade');

  if (!arc || !numEl || !gradeEl) return;

  const { color, label, cls } = getScoreMeta(score);

  // Apply ring color
  arc.style.stroke = color;

  // Grade badge
  gradeEl.textContent = label;
  gradeEl.className   = `score-grade ${cls}`;

  // Animate count-up + arc fill
  _animateRing(arc, numEl, score);
}

/* ─────────────────────────────────────────
   renderIssues(issues)
   Clears and re-renders the issues list
   as individual issue cards.
   ───────────────────────────────────────── */
export function renderIssues(issues) {
  const container = document.getElementById('issuesList');
  if (!container) return;

  container.innerHTML = '';

  if (!issues.length) {
    container.innerHTML = `
      <p class="empty-state">No issues detected. Great work!</p>
    `;
    return;
  }

  issues.forEach((issue, i) => {
    const card = _createIssueCard(issue, i);
    container.appendChild(card);
  });
}

/* ─────────────────────────────────────────
   renderRecommendations(recs)
   Clears and re-renders the recommendations
   list as green checklist items.
   ───────────────────────────────────────── */
export function renderRecommendations(recs) {
  const container = document.getElementById('recsList');
  if (!container) return;

  container.innerHTML = '';

  if (!recs.length) {
    container.innerHTML = `
      <p class="empty-state">No recommendations at this time.</p>
    `;
    return;
  }

  recs.forEach((rec, i) => {
    const item = _createRecItem(rec, i);
    container.appendChild(item);
  });
}

/* ─────────────────────────────────────────
   _createIssueCard(issue, index)
   Builds and returns a single issue card
   DOM element with staggered animation.
   ───────────────────────────────────────── */
function _createIssueCard(issue, index) {
  const desc = getIssueDescription(issue);

  const card = document.createElement('div');
  card.className = 'issue-item';
  card.style.animationDelay = `${index * 80}ms`;

  card.innerHTML = `
    <div class="issue-item__title">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M7 1L13 12H1L7 1Z"
          stroke="#f59e0b" stroke-width="1.4" stroke-linejoin="round"/>
        <path d="M7 5.5v2.5"
          stroke="#f59e0b" stroke-width="1.4" stroke-linecap="round"/>
        <circle cx="7" cy="10" r=".7" fill="#f59e0b"/>
      </svg>
      ${escapeHtml(issue)}
    </div>
    <div class="issue-item__desc">${escapeHtml(desc)}</div>
  `;

  return card;
}

/* ─────────────────────────────────────────
   _createRecItem(rec, index)
   Builds and returns a single recommendation
   item DOM element with staggered animation.
   ───────────────────────────────────────── */
function _createRecItem(rec, index) {
  const item = document.createElement('div');
  item.className = 'rec-item';
  item.style.animationDelay = `${index * 80 + 160}ms`;

  item.innerHTML = `
    <div class="rec-item__check">
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="M2 5l2.5 2.5L8 3"
          stroke="#22c55e" stroke-width="1.5"
          stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    <div class="rec-item__text">${escapeHtml(rec)}</div>
  `;

  return item;
}

/* ─────────────────────────────────────────
   _animateRing(arcEl, numEl, targetScore)
   Animates the SVG arc stroke-dashoffset
   and the numeric count-up simultaneously
   using requestAnimationFrame.
   ───────────────────────────────────────── */
function _animateRing(arcEl, numEl, targetScore) {
  const duration     = CONFIG.RING.ANIMATION_MS;
  const circumference = CONFIG.RING.CIRCUMFERENCE;
  const startTime    = performance.now();

  // Reset before animating
  arcEl.style.strokeDashoffset = circumference;
  numEl.textContent = '0';

  function tick(now) {
    const elapsed  = now - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Ease-out cubic
    const eased  = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * targetScore);

    numEl.textContent            = current;
    arcEl.style.strokeDashoffset = circumference * (1 - (eased * targetScore) / 100);

    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

// getScoreMeta, getIssueDescription, escapeHtml
// are imported from reportUtils.js above.