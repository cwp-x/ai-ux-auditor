/* =========================================
   features/home/homeView.js
   Renders the home page UI:
   header, hero section, and URL input card.
   Pure rendering — no event logic here.
   ========================================= */

import { CONFIG } from '../../core/config.js';

/* ─────────────────────────────────────────
   renderHome(container)
   Injects the full home view HTML into
   the given container element.
   ───────────────────────────────────────── */
export function renderHome(container) {
  container.innerHTML = `

    <!-- ── Header ── -->
    <header class="header">
      <div class="container">
        <div class="header__inner">

          <div class="logo">
            <svg class="logo__icon" width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="url(#logoGrad)"/>
              <path d="M8 14c0-3.314 2.686-6 6-6s6 2.686 6 6"
                stroke="#fff" stroke-width="2" stroke-linecap="round"/>
              <circle cx="14" cy="18" r="2.5" fill="#fff"/>
              <defs>
                <linearGradient id="logoGrad" x1="0" y1="0" x2="28" y2="28">
                  <stop offset="0%"   stop-color="#6366f1"/>
                  <stop offset="100%" stop-color="#8b5cf6"/>
                </linearGradient>
              </defs>
            </svg>
            <span>${CONFIG.APP_NAME}</span>
          </div>

          <nav class="header__nav">
            <span class="badge badge--accent">AI-Powered</span>
          </nav>

        </div>
      </div>
    </header>

    <!-- ── Hero ── -->
    <section class="hero container">
      <div class="hero__eyebrow">
        <span class="dot dot--pulse"></span>
        Instant Analysis
      </div>
      <h1 class="hero__title">${CONFIG.APP_NAME}</h1>
      <p class="hero__subtitle">
        Paste any URL. Get a comprehensive UX audit powered by AI in seconds.
      </p>
    </section>

    <!-- ── Input card ── -->
    <div class="input-region container">
      <div class="input-card">

        <div class="input-card__inner">
          <div class="input-wrapper">

            <span class="input-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="6.5" cy="6.5" r="5"
                  stroke="currentColor" stroke-width="1.5"/>
                <path d="m10.5 10.5 3.5 3.5"
                  stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </span>

            <input
              type="url"
              id="urlInput"
              class="url-input"
              placeholder="${CONFIG.COPY.PLACEHOLDER}"
              autocomplete="off"
              spellcheck="false"
            />

          </div>

          <button id="analyzeBtn" class="btn-primary">
            <span class="btn__text">${CONFIG.COPY.BTN_IDLE}</span>
            <span class="btn__icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor" stroke-width="1.5"
                  stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
            <span class="btn__spinner" aria-hidden="true"></span>
          </button>

        </div>

        <p class="input-hint">${CONFIG.COPY.HINT}</p>

      </div>
    </div>

  `;
}

/* ─────────────────────────────────────────
   getUrlInputEl()
   Returns the URL input DOM element.
   Called by homeEvents after render.
   ───────────────────────────────────────── */
export function getUrlInputEl() {
  return document.getElementById('urlInput');
}

/* ─────────────────────────────────────────
   getAnalyzeBtnEl()
   Returns the Analyze button DOM element.
   Called by homeEvents after render.
   ───────────────────────────────────────── */
export function getAnalyzeBtnEl() {
  return document.getElementById('analyzeBtn');
}

/* ─────────────────────────────────────────
   setAnalyzeBtnState(loading)
   Toggles the button between idle and
   loading state. Disables it while loading.
   ───────────────────────────────────────── */
export function setAnalyzeBtnState(loading) {
  const btn      = getAnalyzeBtnEl();
  const textEl   = btn?.querySelector('.btn__text');
  if (!btn) return;

  if (loading) {
    btn.disabled = true;
    btn.classList.add('is-loading');
    if (textEl) textEl.textContent = CONFIG.COPY.BTN_LOADING;
  } else {
    btn.disabled = false;
    btn.classList.remove('is-loading');
    if (textEl) textEl.textContent = CONFIG.COPY.BTN_IDLE;
  }
}

/* ─────────────────────────────────────────
   flashInvalidInput()
   Briefly highlights the input card border
   red to signal invalid input.
   ───────────────────────────────────────── */
export function flashInvalidInput() {
  const inner = document.querySelector('.input-card__inner');
  if (!inner) return;
  inner.style.borderColor = 'rgba(239, 68, 68, 0.6)';
  setTimeout(() => {
    inner.style.borderColor = '';
  }, 1400);
}