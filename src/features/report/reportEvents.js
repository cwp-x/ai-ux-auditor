/* =========================================
   features/report/reportEvents.js
   All event listeners for the report view.
   Currently handles the Download PDF button.
   Wired up after the report shell is built.
   No rendering logic lives here.
   ========================================= */

import { CONFIG }       from '../../core/config.js';
import { generatePDF } from '/ai-ux-auditor/src/features/report/reportpdf.js';

/* ─────────────────────────────────────────
   initReportEvents()
   Uses event delegation on the results
   region so it works even when the shell
   is created dynamically after page load.
   Call once from main.js on app init.
   ───────────────────────────────────────── */
export function initReportEvents() {
  // Delegate from #app so we catch dynamically-inserted buttons
  document.getElementById('app')?.addEventListener('click', async (e) => {
    const btn = e.target.closest('#downloadPdfBtn');
    if (btn) {
      await _handleDownloadPDF(btn);
    }
  });
}

/* ─────────────────────────────────────────
   _handleDownloadPDF(btn)
   Sets the button to loading state,
   calls generatePDF(), then restores the
   button regardless of success or failure.
   ───────────────────────────────────────── */
async function _handleDownloadPDF(btn) {
  if (btn.disabled) return;

  _setBtnLoading(btn, true);

  try {
    await generatePDF();
  } catch (err) {
    console.error('[reportEvents] PDF generation failed:', err);
    _showPdfError(err.message);
  } finally {
    _setBtnLoading(btn, false);
  }
}

/* ─────────────────────────────────────────
   _setBtnLoading(btn, loading)
   Toggles the download button between
   idle and generating states.
   ───────────────────────────────────────── */
function _setBtnLoading(btn, loading) {
  const textEl = btn.querySelector('.btn__text');

  if (loading) {
    btn.disabled = true;
    btn.classList.add('is-loading');
    if (textEl) textEl.textContent = CONFIG.COPY.BTN_DOWNLOAD_BUSY;
  } else {
    btn.disabled = false;
    btn.classList.remove('is-loading');
    if (textEl) textEl.textContent = CONFIG.COPY.BTN_DOWNLOAD_IDLE;
  }
}

/* ─────────────────────────────────────────
   _showPdfError(message)
   Displays a brief error toast below the
   download button when PDF generation fails.
   Auto-removes after 4 seconds.
   ───────────────────────────────────────── */
function _showPdfError(message) {
  // Remove any existing toast
  document.getElementById('pdfErrorToast')?.remove();

  const toast = document.createElement('div');
  toast.id        = 'pdfErrorToast';
  toast.className = 'error-banner';
  toast.style.cssText = `
    max-width: 100%;
    margin: 8px 0 0 0;
    justify-content: flex-end;
  `;
  toast.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="5.5" stroke="#ef4444" stroke-width="1.4"/>
      <path d="M7 4.5v3M7 9v.5" stroke="#ef4444"
        stroke-width="1.4" stroke-linecap="round"/>
    </svg>
    <span>${message || 'Could not generate PDF. Please try again.'}</span>
  `;

  // Insert after the results-actions bar
  const actionsBar = document.querySelector('.results-actions');
  actionsBar?.insertAdjacentElement('afterend', toast);

  // Auto-dismiss
  setTimeout(() => toast.remove(), 4000);
}
