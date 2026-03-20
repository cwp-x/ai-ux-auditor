/* =========================================
   features/report/reportPDF.js
   Generates and downloads a styled PDF
   of the UX audit report using jsPDF.
   Loaded via CDN in index.html.
   No UI rendering. No event wiring.
   ========================================= */

import { CONFIG }   from '/ai-ux-auditor/src/core/config.js';
import { getState } from '/ai-ux-auditor/src/core/state.js';
import { getScoreMeta, getIssueDescription,
         buildPdfFilename, formatDate } from '/ai-ux-auditor/src/features/report/reportUtils.js';

/* ─────────────────────────────────────────
   generatePDF()
   Public entry point called by reportEvents.
   Reads current state, builds the PDF,
   and triggers a browser download.
   Returns a promise so the caller can
   manage the button loading state.
   ───────────────────────────────────────── */
export async function generatePDF() {
  const { result, url } = getState();

  if (!result || !result.score) {
    throw new Error('No audit result available to export.');
  }

  // jsPDF is loaded globally via CDN script tag
  const { jsPDF } = window.jspdf;
  if (!jsPDF) {
    throw new Error('PDF library not loaded. Please refresh and try again.');
  }

  const doc = new jsPDF({
    orientation: CONFIG.PDF.PAGE_ORIENTATION,
    unit:        'mm',
    format:      CONFIG.PDF.PAGE_FORMAT,
  });

  const M          = CONFIG.PDF.MARGIN;       // margin mm
  const pageW      = doc.internal.pageSize.getWidth();
  const pageH      = doc.internal.pageSize.getHeight();
  const contentW   = pageW - M * 2;
  let   cursorY    = M;

  // ── Helper: add new page if content overflows ──
  function checkPageBreak(neededHeight = 20) {
    if (cursorY + neededHeight > pageH - M) {
      doc.addPage();
      cursorY = M;
      _drawPageBackground(doc, pageW, pageH);
    }
  }

  // ── 1. Page background ──
  _drawPageBackground(doc, pageW, pageH);

  // ── 2. Header bar ──
  cursorY = _drawHeader(doc, M, cursorY, contentW, url);

  // ── 3. Score section ──
  cursorY = _drawScoreSection(doc, M, cursorY, contentW, result.score);

  // ── 4. Issues section ──
  cursorY = _drawIssuesSection(doc, M, cursorY, contentW, result.issues, checkPageBreak);

  // ── 5. Recommendations section ──
  cursorY = _drawRecsSection(doc, M, cursorY, contentW, result.recommendations, checkPageBreak);

  // ── 6. Footer ──
  _drawFooter(doc, M, pageH, pageW, url);

  // ── 7. Download ──
  const filename = _buildFilename(url);
  doc.save(filename);
}

/* ════════════════════════════════════════
   SECTION RENDERERS
   ════════════════════════════════════════ */

function _drawPageBackground(doc, pageW, pageH) {
  const [r, g, b] = CONFIG.PDF.DARK_BG;
  doc.setFillColor(r, g, b);
  doc.rect(0, 0, pageW, pageH, 'F');
}

function _drawHeader(doc, M, y, contentW, url) {
  const [ar, ag, ab] = CONFIG.PDF.BRAND_COLOR;

  // Accent top bar
  doc.setFillColor(ar, ag, ab);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 1.5, 'F');

  y = 14;

  // App name
  doc.setFont(CONFIG.PDF.FONT_FAMILY, 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...CONFIG.PDF.TEXT_PRIMARY);
  doc.text(CONFIG.APP_NAME, M, y);

  y += 7;

  // Subtitle
  doc.setFont(CONFIG.PDF.FONT_FAMILY, 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...CONFIG.PDF.TEXT_MUTED);
  doc.text('UX Audit Report', M, y);

  // Audited URL on the right
  const displayUrl = url.replace(/^https?:\/\//, '');
  doc.setFontSize(8);
  doc.setTextColor(...CONFIG.PDF.TEXT_MUTED);
  doc.text(displayUrl, doc.internal.pageSize.getWidth() - M, y, { align: 'right' });

  y += 5;

  // Divider line
  doc.setDrawColor(ar, ag, ab);
  doc.setLineWidth(0.3);
  doc.line(M, y, M + contentW, y);

  return y + 8;
}

function _drawScoreSection(doc, M, y, contentW, score) {
  const { color, label } = _scoreMeta(score);

  // Section label
  y = _drawSectionLabel(doc, M, y, 'UX SCORE');

  // Score card background
  const cardH = 28;
  _drawCard(doc, M, y, contentW, cardH);

  // Large score number
  doc.setFont(CONFIG.PDF.FONT_FAMILY, 'bold');
  doc.setFontSize(32);
  doc.setTextColor(...color);
  doc.text(String(score), M + 10, y + 18);

  // /100
  doc.setFont(CONFIG.PDF.FONT_FAMILY, 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...CONFIG.PDF.TEXT_MUTED);
  doc.text('/ 100', M + 26, y + 18);

  // Grade pill text
  doc.setFont(CONFIG.PDF.FONT_FAMILY, 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...color);
  doc.text(label.toUpperCase(), M + contentW - 10, y + 18, { align: 'right' });

  // Score bar
  const barY    = y + 22;
  const barW    = contentW - 20;
  const barH    = 3;
  const filled  = (score / 100) * barW;

  doc.setFillColor(30, 42, 58);
  doc.roundedRect(M + 10, barY, barW, barH, 1.5, 1.5, 'F');

  doc.setFillColor(...color);
  doc.roundedRect(M + 10, barY, filled, barH, 1.5, 1.5, 'F');

  return y + cardH + 8;
}

function _drawIssuesSection(doc, M, y, contentW, issues, checkPageBreak) {
  if (!issues.length) return y;

  y = _drawSectionLabel(doc, M, y, 'ISSUES FOUND');

  issues.forEach((issue) => {
    const desc    = _getIssueDesc(issue);
    const lines   = doc.splitTextToSize(desc, contentW - 24);
    const cardH   = 10 + lines.length * 5;

    checkPageBreak(cardH + 4);
    _drawCard(doc, M, y, contentW, cardH);

    // Warning icon color strip
    doc.setFillColor(...CONFIG.PDF.YELLOW_COLOR);
    doc.rect(M, y, 2, cardH, 'F');

    // Issue title
    doc.setFont(CONFIG.PDF.FONT_FAMILY, 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...CONFIG.PDF.YELLOW_COLOR);
    doc.text(`⚠  ${issue}`, M + 6, y + 7);

    // Description
    doc.setFont(CONFIG.PDF.FONT_FAMILY, 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...CONFIG.PDF.TEXT_MUTED);
    doc.text(lines, M + 6, y + 12);

    y += cardH + 3;
  });

  return y + 4;
}

function _drawRecsSection(doc, M, y, contentW, recs, checkPageBreak) {
  if (!recs.length) return y;

  y = _drawSectionLabel(doc, M, y, 'AI RECOMMENDATIONS');

  recs.forEach((rec) => {
    const lines = doc.splitTextToSize(rec, contentW - 20);
    const cardH = 8 + lines.length * 5;

    checkPageBreak(cardH + 4);
    _drawCard(doc, M, y, contentW, cardH);

    // Green accent strip
    doc.setFillColor(...CONFIG.PDF.GREEN_COLOR);
    doc.rect(M, y, 2, cardH, 'F');

    // Check mark
    doc.setFont(CONFIG.PDF.FONT_FAMILY, 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...CONFIG.PDF.GREEN_COLOR);
    doc.text('✔', M + 5, y + 7);

    // Rec text
    doc.setFont(CONFIG.PDF.FONT_FAMILY, 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(134, 239, 172); // green-300
    doc.text(lines, M + 12, y + 7);

    y += cardH + 3;
  });

  return y;
}

function _drawFooter(doc, M, pageH, pageW, url) {
  const footerY = pageH - 8;

  doc.setFont(CONFIG.PDF.FONT_FAMILY, 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...CONFIG.PDF.TEXT_MUTED);
  doc.text(CONFIG.APP_NAME, M, footerY);

  doc.text(`Generated ${formatDate()}`, pageW - M, footerY, { align: 'right' });
}

/* ════════════════════════════════════════
   DRAWING HELPERS
   ════════════════════════════════════════ */

function _drawSectionLabel(doc, M, y, label) {
  doc.setFont(CONFIG.PDF.FONT_FAMILY, 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...CONFIG.PDF.BRAND_COLOR);
  doc.text(label, M, y);
  return y + 6;
}

function _drawCard(doc, M, y, contentW, cardH) {
  const [r, g, b] = CONFIG.PDF.CARD_BG;
  doc.setFillColor(r, g, b);
  doc.setDrawColor(30, 42, 58);
  doc.setLineWidth(0.2);
  doc.roundedRect(M, y, contentW, cardH, 2, 2, 'FD');
}

/* ════════════════════════════════════════
   UTILITIES
   ════════════════════════════════════════ */

function _scoreMeta(score)      { return getScoreMeta(score); }
function _getIssueDesc(issue)   { return getIssueDescription(issue); }
function _buildFilename(url)    { return buildPdfFilename(url); }
