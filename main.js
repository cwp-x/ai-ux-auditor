/* =========================================
   main.js
   Application entry point.
   Boots all layers in correct order:
   1. Render home UI
   2. Wire home events
   3. Wire report events (delegated)
   ========================================= */

import { renderHome }       from './src/features/home/homeView.js';
import { initHomeEvents }   from './src/features/home/homeEvents.js';
import { initReportEvents } from './src/features/report/reportEvents.js';

/* ─────────────────────────────────────────
   boot()
   Single initialization function.
   Called once the DOM is ready.
   ───────────────────────────────────────── */
function boot() {
  const app = document.getElementById('app');

  if (!app) {
    console.error('[main] #app element not found. Cannot boot.');
    return;
  }

  // Step 1 — Render the home view (header + hero + input card) into #app
  renderHome(app);

  // Step 2 — Wire home events (Analyze button click, Enter key, URL input)
  initHomeEvents();

  // Step 3 — Wire report events via delegation (Download PDF button)
  initReportEvents();

  console.info('[AI UX Auditor] ✓ App booted successfully.');
}

/* ─────────────────────────────────────────
   Wait for DOM before booting.
   Handles both deferred and inline script
   execution contexts safely.
   ───────────────────────────────────────── */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}