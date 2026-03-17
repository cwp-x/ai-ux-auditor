/* =========================================
   services/mockData.js
   Realistic mock API responses for demo mode.
   Used when CONFIG.API.USE_MOCK is true.
   No network calls are made in mock mode.
   ========================================= */

import { CONFIG } from '../core/config.js';

/* ─────────────────────────────────────────
   MOCK RESPONSE POOL
   Multiple realistic audit results so
   repeated analyses feel varied.
   ───────────────────────────────────────── */

const MOCK_RESPONSES = [

  {
    score: 78,
    issues: [
      'CTA Missing',
      'Images Too Large',
      'Navigation Cluttered',
    ],
    recommendations: [
      'Add a prominent CTA button in the hero section',
      'Compress and lazy-load images to improve LCP',
      'Simplify navigation to 5 items or fewer',
    ],
  },

  {
    score: 91,
    issues: [
      'Font Size Too Small on Mobile',
      'Form Labels Missing',
    ],
    recommendations: [
      'Increase base font size to at least 16px on mobile',
      'Add visible labels to all form input fields',
      'Add aria-label attributes for screen reader support',
    ],
  },

  {
    score: 54,
    issues: [
      'CTA Missing',
      'Low Color Contrast',
      'Mobile Layout Broken',
      'Load Time Too Slow',
    ],
    recommendations: [
      'Add a high-contrast CTA above the fold',
      'Ensure text-to-background contrast ratio exceeds 4.5:1',
      'Fix responsive breakpoints for screens below 480px',
      'Enable gzip compression and use a CDN',
    ],
  },

  {
    score: 83,
    issues: [
      'Images Too Large',
      'Navigation Cluttered',
    ],
    recommendations: [
      'Convert images to WebP format and add lazy loading',
      'Consolidate navigation into a max of 6 top-level items',
      'Add a sticky header for easier navigation on scroll',
    ],
  },

];

/* ─────────────────────────────────────────
   getMockResponse(url)
   Returns a mock audit result.
   Deterministically picks a response based
   on the URL string so the same URL always
   returns the same result in demo mode.
   ───────────────────────────────────────── */
function getMockResponse(url) {
  // Simple hash: sum char codes mod pool length
  const hash = [...url].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = hash % MOCK_RESPONSES.length;
  return MOCK_RESPONSES[index];
}

/* ─────────────────────────────────────────
   fetchMock(url)
   Simulates the network delay from config
   then resolves with a mock audit result.
   Rejects ~10% of the time to let error
   handling be testable in demo mode.
   ───────────────────────────────────────── */
export async function fetchMock(url) {
  await _delay(CONFIG.API.MOCK_DELAY_MS);

  // Simulate occasional failure (10% chance)
  if (Math.random() < 0.10) {
    throw new Error('Mock network error: request failed');
  }

  return getMockResponse(url);
}

/* ─────────────────────────────────────────
   _delay(ms)
   Internal helper — returns a promise that
   resolves after the given milliseconds.
   ───────────────────────────────────────── */
function _delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}