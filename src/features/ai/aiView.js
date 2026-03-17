/* =========================================
   features/ai/aiView.js
   Renders the AI-generated summary card.
   Sits between the results grid and the
   issues section in the report.
   Pure rendering — no API calls here.
   ========================================= */

/* ─────────────────────────────────────────
   injectAISummaryCard()
   Creates and inserts the AI summary card
   shell into the DOM after the results grid.
   Idempotent — safe to call multiple times.
   ───────────────────────────────────────── */
export function injectAISummaryCard() {
  // Remove existing card if re-analyzing
  document.getElementById('aiSummaryCard')?.remove();

  const card = document.createElement('div');
  card.id        = 'aiSummaryCard';
  card.className = 'card ai-summary-card';
  card.innerHTML = `
    <div class="card__label">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M7 1.5C4 1.5 1.5 4 1.5 7S4 12.5 7 12.5 12.5 10 12.5 7 10 1.5 7 1.5Z"
          stroke="#6366f1" stroke-width="1.4"/>
        <path d="M5 7c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2"
          stroke="#6366f1" stroke-width="1.4" stroke-linecap="round"/>
        <circle cx="7" cy="7" r=".75" fill="#6366f1"/>
      </svg>
      AI Summary
    </div>
    <div id="aiSummaryContent" class="ai-summary__content">
      <div class="ai-summary__skeleton">
        <div class="skeleton-line skeleton-line--long"></div>
        <div class="skeleton-line skeleton-line--medium"></div>
        <div class="skeleton-line skeleton-line--short"></div>
      </div>
    </div>
  `;

  // Insert after results-grid, before recs-card
  const recsCard = document.querySelector('.recs-card');
  if (recsCard) {
    recsCard.insertAdjacentElement('beforebegin', card);
  } else {
    // Fallback — append to results region
    document.getElementById('resultsRegion')?.appendChild(card);
  }

  return card;
}

/* ─────────────────────────────────────────
   renderAISummary(text)
   Replaces the skeleton loader with the
   actual AI-generated summary text.
   Supports simple markdown-style **bold**.
   ───────────────────────────────────────── */
export function renderAISummary(text) {
  const content = document.getElementById('aiSummaryContent');
  if (!content) return;

  // Convert **bold** markdown to <strong>
  const html = _parseMarkdown(text);

  content.innerHTML = `
    <p class="ai-summary__text">${html}</p>
  `;

  // Trigger fade-in
  content.classList.add('ai-summary__content--loaded');
}

/* ─────────────────────────────────────────
   renderAISummaryError()
   Shows a subtle error state inside the
   card if the API call fails.
   ───────────────────────────────────────── */
export function renderAISummaryError() {
  const content = document.getElementById('aiSummaryContent');
  if (!content) return;

  content.innerHTML = `
    <p class="ai-summary__error">
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <circle cx="6.5" cy="6.5" r="5.5" stroke="#ef4444" stroke-width="1.3"/>
        <path d="M6.5 4v3M6.5 8.5v.5" stroke="#ef4444"
          stroke-width="1.3" stroke-linecap="round"/>
      </svg>
      Could not generate AI summary. All other results are still available.
    </p>
  `;
}

/* ─────────────────────────────────────────
   _parseMarkdown(text)
   Converts **bold** to <strong> tags.
   Escapes HTML first to prevent XSS.
   ───────────────────────────────────────── */
function _parseMarkdown(text) {
  const escaped = text
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;');

  return escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}