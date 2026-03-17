/* =========================================
   core/state.js
   Global application state store.
   Single source of truth for runtime data.
   All reads and writes go through this module.
   ========================================= */

/* ── Initial state shape ── */
const initialState = {
  /* Current URL the user entered */
  url: '',

  /* Whether an analysis request is in-flight */
  isLoading: false,

  /* Whether results have been received and are visible */
  hasResults: false,

  /* The last audit result from the API (or mock) */
  result: {
    score:           0,
    issues:          [],
    recommendations: [],
  },

  /* Error message string, or null if no error */
  error: null,
};

/* ── Internal state object (not exported directly) ── */
let _state = { ...initialState };

/* ── Subscribers list ── */
const _subscribers = [];

/* ─────────────────────────────────────────
   subscribe(listener)
   Register a callback to be called whenever
   state changes. Returns an unsubscribe fn.
   ───────────────────────────────────────── */
export function subscribe(listener) {
  _subscribers.push(listener);
  return () => {
    const index = _subscribers.indexOf(listener);
    if (index > -1) _subscribers.splice(index, 1);
  };
}

/* ─────────────────────────────────────────
   _notify()
   Call all registered subscribers with a
   frozen snapshot of current state.
   ───────────────────────────────────────── */
function _notify() {
  const snapshot = getState();
  _subscribers.forEach(fn => fn(snapshot));
}

/* ─────────────────────────────────────────
   getState()
   Returns a shallow-frozen copy of state
   so callers cannot mutate it directly.
   ───────────────────────────────────────── */
export function getState() {
  return Object.freeze({ ..._state });
}

/* ─────────────────────────────────────────
   setState(patch)
   Merges a partial update into state
   and notifies all subscribers.
   ───────────────────────────────────────── */
export function setState(patch) {
  _state = { ..._state, ...patch };
  _notify();
}

/* ─────────────────────────────────────────
   resetState()
   Restores state to initial values.
   ───────────────────────────────────────── */
export function resetState() {
  _state = { ...initialState };
  _notify();
}

/* ─────────────────────────────────────────
   Convenience setters
   Thin wrappers to keep call-sites readable.
   ───────────────────────────────────────── */

export function setUrl(url) {
  setState({ url });
}

export function setLoading(isLoading) {
  setState({ isLoading });
}

export function setResult(result) {
  setState({
    result,
    hasResults: true,
    error:      null,
  });
}

export function setError(message) {
  setState({
    error:      message,
    isLoading:  false,
    hasResults: false,
  });
}

export function clearError() {
  setState({ error: null });
}