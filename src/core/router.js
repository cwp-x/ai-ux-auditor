/* =========================================
   core/router.js
   View routing and navigation logic.
   Controls which regions of the UI are
   visible and triggers view transitions.
   ========================================= */

/* ── View identifiers ── */
export const VIEWS = {
  HOME:    'home',
  RESULTS: 'results',
  ERROR:   'error',
};

/* ── Internal tracked state ── */
let _currentView = VIEWS.HOME;
const _viewRegistry = {};

/* ─────────────────────────────────────────
   registerView(viewId, element)
   Associate a DOM element with a view ID.
   The router shows/hides these elements
   when navigating between views.
   ───────────────────────────────────────── */
export function registerView(viewId, element) {
  if (!element) {
    console.warn(`[Router] registerView: element not found for view "${viewId}"`);
    return;
  }
  _viewRegistry[viewId] = element;
}

/* ─────────────────────────────────────────
   navigateTo(viewId)
   Show the requested view, hide others.
   Applies enter animation to the target.
   ───────────────────────────────────────── */
export function navigateTo(viewId) {
  if (!_viewRegistry[viewId]) {
    console.warn(`[Router] navigateTo: view "${viewId}" is not registered.`);
    return;
  }

  // Hide all registered views
  Object.entries(_viewRegistry).forEach(([id, el]) => {
    if (id !== viewId) {
      el.hidden = true;
      el.removeAttribute('data-visible');
    }
  });

  // Show the target view
  const target = _viewRegistry[viewId];
  target.hidden = false;
  target.setAttribute('data-visible', 'true');

  _currentView = viewId;
}

/* ─────────────────────────────────────────
   showView(viewId)
   Make a view visible without hiding others.
   Useful for overlays or additive regions.
   ───────────────────────────────────────── */
export function showView(viewId) {
  const el = _viewRegistry[viewId];
  if (!el) {
    console.warn(`[Router] showView: view "${viewId}" is not registered.`);
    return;
  }
  el.hidden = false;
  el.setAttribute('data-visible', 'true');
}

/* ─────────────────────────────────────────
   hideView(viewId)
   Hide a specific view without affecting others.
   ───────────────────────────────────────── */
export function hideView(viewId) {
  const el = _viewRegistry[viewId];
  if (!el) return;
  el.hidden = true;
  el.removeAttribute('data-visible');
}

/* ─────────────────────────────────────────
   getCurrentView()
   Returns the ID of the currently active view.
   ───────────────────────────────────────── */
export function getCurrentView() {
  return _currentView;
}

/* ─────────────────────────────────────────
   isVisible(viewId)
   Returns true if the given view is visible.
   ───────────────────────────────────────── */
export function isVisible(viewId) {
  const el = _viewRegistry[viewId];
  return el ? !el.hidden : false;
}