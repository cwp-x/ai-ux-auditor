/* =========================================
   features/report/reportUtils.js
   Shared utility functions used across
   reportRender.js, reportPDF.js, and
   reportView.js.
   Pure functions only — no DOM manipulation,
   no API calls, no side effects.
   ========================================= */

import { CONFIG } from '../../core/config.js';

/* ─────────────────────────────────────────
   getScoreMeta(score)
   Returns color, label, and CSS class
   for a given score value based on CONFIG
   thresholds.

   @param  score  number  0–100
   @returns { color: string, label: string, cls: string, pdfColor: number[] }
   ───────────────────────────────────────── */
export function getScoreMeta(score) {
  if (score >= CONFIG.SCORE.EXCELLENT) {
    return {
      color:    CONFIG.SCORE_COLOR.EXCELLENT,
      label:    CONFIG.GRADE.EXCELLENT,
      cls:      'badge--green',
      pdfColor: CONFIG.PDF.GREEN_COLOR,
    };
  }
  if (score >= CONFIG.SCORE.GOOD) {
    return {
      color:    CONFIG.SCORE_COLOR.GOOD,
      label:    CONFIG.GRADE.GOOD,
      cls:      'badge--yellow',
      pdfColor: CONFIG.PDF.YELLOW_COLOR,
    };
  }
  return {
    color:    CONFIG.SCORE_COLOR.POOR,
    label:    CONFIG.GRADE.POOR,
    cls:      'badge--red',
    pdfColor: CONFIG.PDF.RED_COLOR,
  };
}

/* ─────────────────────────────────────────
   getIssueDescription(issue)
   Looks up a human-readable description
   for a given issue string using keyword
   matching against CONFIG.ISSUE_DESCRIPTIONS.
   Falls back to the 'default' entry.

   @param  issue  string
   @returns string
   ───────────────────────────────────────── */
export function getIssueDescription(issue) {
  const key = issue.toLowerCase();
  for (const [k, v] of Object.entries(CONFIG.ISSUE_DESCRIPTIONS)) {
    if (k !== 'default' && key.includes(k)) return v;
  }
  return CONFIG.ISSUE_DESCRIPTIONS['default'];
}

/* ─────────────────────────────────────────
   escapeHtml(str)
   Escapes HTML special characters to
   prevent XSS when inserting strings
   into innerHTML.

   @param  str  string
   @returns string
   ───────────────────────────────────────── */
export function escapeHtml(str) {
  return String(str)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#39;');
}

/* ─────────────────────────────────────────
   stripProtocol(url)
   Removes http:// or https:// from a URL
   string for cleaner display purposes.

   @param  url  string
   @returns string
   ───────────────────────────────────────── */
export function stripProtocol(url) {
  return url.replace(/^https?:\/\//, '');
}

/* ─────────────────────────────────────────
   buildPdfFilename(url)
   Generates a safe, readable PDF filename
   from a URL string.
   Example: https://my-site.com → ux-audit-report-my-site-com.pdf

   @param  url  string
   @returns string
   ───────────────────────────────────────── */
export function buildPdfFilename(url) {
  const clean = url
    .replace(/^https?:\/\//, '')
    .replace(/[^a-z0-9]/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
    .slice(0, 40);
  return `${CONFIG.PDF.FILENAME_PREFIX}-${clean}.pdf`;
}

/* ─────────────────────────────────────────
   formatDate()
   Returns the current date as a readable
   string for use in PDF footers etc.
   Example: "March 17, 2026"

   @returns string
   ───────────────────────────────────────── */
export function formatDate() {
  return new Date().toLocaleDateString('en-US', {
    year:  'numeric',
    month: 'long',
    day:   'numeric',
  });
}

/* ─────────────────────────────────────────
   clampScore(score)
   Ensures a score value stays within
   the valid 0–100 range.

   @param  score  number
   @returns number
   ───────────────────────────────────────── */
export function clampScore(score) {
  return Math.max(0, Math.min(100, Math.round(Number(score))));
}

/* ─────────────────────────────────────────
   isValidUrl(str)
   Returns true for valid http/https URLs.
   Shared between homeEvents and any other
   module that needs URL validation.

   @param  str  string
   @returns boolean
   ───────────────────────────────────────── */
export function isValidUrl(str) {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}