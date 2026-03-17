/* =========================================
   core/config.js
   Application-wide constants and configuration.
   Single place to change endpoints, timeouts,
   score thresholds, and copy strings.
   ========================================= */

export const CONFIG = {

  /* ── App meta ── */
  APP_NAME:    'AI UX Auditor',
  APP_VERSION: '1.0.0',

  /* ── API ── */
  API: {
    ENDPOINT:       '/analyze',
    METHOD:         'POST',
    TIMEOUT_MS:     15000,
    MOCK_DELAY_MS:  1800,   // Simulated latency in demo mode
    USE_MOCK:       true,   // Flip to false when real backend is ready
  },

  /* ── Score thresholds ── */
  SCORE: {
    EXCELLENT: 90,   // >= 90 → green
    GOOD:      70,   // >= 70 → yellow
                     //  < 70 → red
  },

  /* ── Score grade labels ── */
  GRADE: {
    EXCELLENT: 'Excellent',
    GOOD:      'Needs Work',
    POOR:      'Critical',
  },

  /* ── Score colors ── */
  SCORE_COLOR: {
    EXCELLENT: '#22c55e',
    GOOD:      '#f59e0b',
    POOR:      '#ef4444',
  },

  /* ── Score ring geometry ── */
  RING: {
    RADIUS:        50,
    CIRCUMFERENCE: 2 * Math.PI * 50,   // ≈ 314.16
    ANIMATION_MS:  1200,
  },

  /* ── UI copy ── */
  COPY: {
    PLACEHOLDER:       'https://example.com',
    BTN_IDLE:          'Analyze',
    BTN_LOADING:       'Analyzing…',
    HINT:              'Works with any public website URL',
    RESULTS_STATUS:    'Audit complete',
    ERROR_DEFAULT:     'Analysis failed. Please check the URL and try again.',
    ERROR_INVALID_URL: 'Please enter a valid URL starting with https://',
    ERROR_EMPTY:       'Please enter a website URL to analyze.',
    FOOTER:            'Built with AI · Powered by your imagination',
    BTN_DOWNLOAD_IDLE: 'Download Report',
    BTN_DOWNLOAD_BUSY: 'Generating PDF…',
  },

  /* ── PDF export ── */
  PDF: {
    // jsPDF is loaded via CDN in index.html
    FILENAME_PREFIX:  'ux-audit-report',   // final name: ux-audit-report-example.com.pdf
    PAGE_FORMAT:      'a4',
    PAGE_ORIENTATION: 'portrait',
    MARGIN:           14,                  // mm from edges
    FONT_FAMILY:      'helvetica',
    BRAND_COLOR:      [99, 102, 241],      // RGB for accent lines & headings
    GREEN_COLOR:      [34, 197, 94],
    YELLOW_COLOR:     [245, 158, 11],
    RED_COLOR:        [239, 68, 68],
    DARK_BG:          [8, 13, 20],         // page background
    CARD_BG:          [17, 24, 39],        // card fill
    TEXT_PRIMARY:     [241, 245, 249],
    TEXT_MUTED:       [100, 116, 139],
  },

  /* ── Issue descriptions map ──
     Keys are lowercase substrings matched against issue titles.
     Used by reportRender to enrich bare issue strings.        ── */
  ISSUE_DESCRIPTIONS: {
    'cta missing':          'Primary call-to-action button not visible above the fold.',
    'images too large':     'Oversized images are slowing down page load and hurting Core Web Vitals.',
    'navigation cluttered': 'Too many navigation items reduce discoverability and overwhelm users.',
    'font size':            'Text is too small on mobile devices, hurting readability.',
    'contrast':             'Insufficient color contrast fails WCAG accessibility standards.',
    'mobile':               'Layout breaks or degrades significantly on small screens.',
    'load time':            'Page takes too long to become interactive, increasing bounce rate.',
    'form':                 'Form fields lack proper labels or validation feedback.',
    'default':              'This issue may be negatively affecting user experience.',
  },

};