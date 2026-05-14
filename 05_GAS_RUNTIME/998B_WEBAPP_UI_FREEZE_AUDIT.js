/**
 * PHASE_94 — WebApp UI Foundation Freeze / UAT Hardening — Audit Runtime
 *
 * Purpose:
 *   Surface the frozen WebApp UI contract (route matrix, UI standard, UAT
 *   checklist) and validate that no Phase 94 helper introduces write /
 *   mutation / auto-* / production-ready recommendations.
 *
 * Read-first only. No new business feature. No mutation.
 */

var CBV_WEBAPP_UI_FREEZE_PHASE_ID = 'PHASE_94_WEBAPP_UI_FOUNDATION_FREEZE_UAT_HARDENING';
var CBV_WEBAPP_UI_FREEZE_CONTRACT_VERSION = 'CBV_TCS_V1';

/**
 * Frozen route matrix. Each route describes the contract operators / supervisors
 * / admins should expect at the pilot tier. Mutation is explicitly forbidden.
 */
var CBV_WEBAPP_UI_FREEZE_ROUTES = [
  {
    route: '/workspace',
    owner: 'WebApp',
    mode: 'READ_FIRST',
    status: 'PILOT',
    page: 'Home Workspace',
    expectedRenderer: 'CbvWebAppPilotRenderer_renderHome',
    requiredRole: '*'
  },
  {
    route: '/workspace/role-home',
    owner: 'WebApp',
    mode: 'READ_FIRST',
    status: 'PILOT',
    page: 'Role-based home',
    expectedRenderer: 'CbvWebAppOpUx_renderRoleHomePage_',
    requiredRole: '*'
  },
  {
    route: '/workspace/today',
    owner: 'WebApp',
    mode: 'READ_FIRST',
    status: 'PILOT',
    page: 'Today operations',
    expectedRenderer: 'CbvWebAppOpUx_renderTodayPage_',
    requiredRole: '*'
  },
  {
    route: '/workspace/guided',
    owner: 'WebApp',
    mode: 'READ_FIRST',
    status: 'PILOT',
    page: 'Guided SOP',
    expectedRenderer: 'CbvWebAppOpUx_renderGuidedPage_',
    requiredRole: '*'
  },
  {
    route: '/home-alert/my-queue',
    owner: 'WebApp + AppSheet lightweight shell',
    mode: 'READ_FIRST',
    status: 'PILOT',
    page: 'My Queue',
    expectedRenderer: 'CbvWebAppPilotRenderer_renderQueue',
    requiredRole: '*'
  },
  {
    route: '/home-alert/sla',
    owner: 'WebApp',
    mode: 'READ_FIRST',
    status: 'PILOT',
    page: 'SLA Dashboard',
    expectedRenderer: 'CbvWebAppPilotRenderer_renderSla',
    requiredRole: '*'
  },
  {
    route: '/home-alert/timeline',
    owner: 'WebApp',
    mode: 'READ_FIRST',
    status: 'PILOT',
    page: 'Timeline',
    expectedRenderer: 'CbvWebAppTimelineKanban_renderTimeline',
    requiredRole: '*'
  },
  {
    route: '/home-alert/kanban',
    owner: 'WebApp',
    mode: 'READ_FIRST',
    status: 'PILOT',
    page: 'Kanban',
    expectedRenderer: 'CbvWebAppTimelineKanban_renderKanban',
    requiredRole: '*'
  },
  {
    route: '/runtime/health',
    owner: 'WebApp',
    mode: 'READ_FIRST',
    status: 'PILOT',
    page: 'Runtime Health',
    expectedRenderer: 'CbvWebAppObservability_renderRuntimeHealth',
    requiredRole: 'ADMIN'
  },
  {
    route: '/reports',
    owner: 'WebApp',
    mode: 'READ_FIRST',
    status: 'PILOT',
    page: 'Report Viewer',
    expectedRenderer: 'CbvWebAppObservability_renderReportViewer',
    requiredRole: 'ADMIN'
  },
  {
    route: '/admin/reference',
    owner: 'WebApp',
    mode: 'READ_FIRST',
    status: 'PILOT',
    page: 'Admin Reference Viewer',
    expectedRenderer: 'CbvWebAppAdminRef_renderReferenceViewer',
    requiredRole: 'ADMIN'
  }
];

var CBV_WEBAPP_UI_FREEZE_SUPPORT_ENDPOINTS = [
  {
    endpoint: '?action=ping',
    owner: 'WebApp dispatcher',
    mode: 'READ_ONLY',
    status: 'SUPPORT',
    page: 'Ping diagnostic JSON',
    expectedHandler: '999_WEBAPP_DOGET_DISPATCHER_FINAL'
  }
];

var CBV_WEBAPP_UI_FREEZE_SAFETY_PHRASES = [
  'No auto assign',
  'No auto resolve',
  'No auto escalate',
  'No production claim'
];

var CBV_WEBAPP_UI_FREEZE_SAFETY_PHRASES_TIMELINE_KANBAN = [
  'No auto assign',
  'No auto resolve',
  'No auto escalate',
  'No production claim',
  'No drag-drop save'
];

var CBV_WEBAPP_UI_FREEZE_FE_STATES = ['loading', 'empty', 'warning', 'error', 'partial', 'ready'];

var CBV_WEBAPP_UI_FREEZE_REQUIRED_DOCS = [
  'docs/webapp/PHASE_94_WEBAPP_UI_FOUNDATION_FREEZE_UAT_HARDENING.md',
  'docs/webapp/WEBAPP_UI_FOUNDATION_STANDARD.md',
  'docs/webapp/WEBAPP_ROUTE_FREEZE_MATRIX.md',
  'docs/webapp/WEBAPP_FE_STATE_FREEZE_STANDARD.md',
  'docs/webapp/WEBAPP_SAFETY_FOOTER_STANDARD.md',
  'docs/webapp/WEBAPP_RESPONSIVE_ACCESSIBILITY_BASELINE.md',
  'docs/webapp/WEBAPP_UAT_MASTER_CHECKLIST.md',
  'docs/webapp/WEBAPP_ROUTE_SMOKE_TEST_MATRIX.md',
  'docs/webapp/WEBAPP_UI_CONSISTENCY_AUDIT.md',
  '00_SYSTEM_BRAIN/002_DECISIONS/033_WEBAPP_UI_FOUNDATION_FREEZE_DECISION.md'
];

/* ------------------------------------------------------------------ */
/* Envelope                                                            */
/* ------------------------------------------------------------------ */

function CbvWebAppUiFreeze__out_(ok, data, warnings, errors) {
  return {
    ok: ok === true,
    data: data || null,
    warnings: warnings || [],
    errors: errors || [],
    checkedAt: (typeof CbvWebAppWorkspace__now_ === 'function') ? CbvWebAppWorkspace__now_() : new Date()
  };
}

/* ------------------------------------------------------------------ */
/* Route freeze matrix                                                 */
/* ------------------------------------------------------------------ */

function CbvWebAppUiFreeze_getRouteFreezeMatrix() {
  var warnings = [];
  var errors = [];

  var routes = CBV_WEBAPP_UI_FREEZE_ROUTES.map(function(r) {
    var reg = null;
    try {
      if (typeof CbvWebAppWorkspace_routeByPath === 'function') reg = CbvWebAppWorkspace_routeByPath(r.route);
    } catch (eR) { /* ignore */ }
    return {
      route: r.route,
      owner: r.owner,
      mode: r.mode,
      status: r.status,
      page: r.page,
      requiredRole: r.requiredRole,
      expectedRenderer: r.expectedRenderer,
      isRegistered: !!reg,
      registeredMode: reg ? String(reg.mode || '') : '',
      registeredTitle: reg ? String(reg.title || '') : '',
      isPilotReady: reg ? reg.isPilotReady === true : false
    };
  });

  routes.forEach(function(row) {
    if (!row.isRegistered) warnings.push('Route not registered in CbvWebAppWorkspace_routeRegistry(): ' + row.route);
    if (row.isRegistered && row.registeredMode !== row.mode) {
      warnings.push('Route mode drift: ' + row.route + ' expected ' + row.mode + ' got ' + row.registeredMode);
    }
  });

  return CbvWebAppUiFreeze__out_(true, {
    routes: routes,
    supportEndpoints: CBV_WEBAPP_UI_FREEZE_SUPPORT_ENDPOINTS.slice(),
    routeCount: routes.length,
    supportCount: CBV_WEBAPP_UI_FREEZE_SUPPORT_ENDPOINTS.length
  }, warnings, errors);
}

/* ------------------------------------------------------------------ */
/* UI standard                                                         */
/* ------------------------------------------------------------------ */

function CbvWebAppUiFreeze_getUiStandard() {
  var standard = {
    pageHeader: {
      title: 'Required',
      routeChip: 'Required (shows current route)',
      readFirstBadge: 'Required on every operational route'
    },
    nav: [
      'Workspace', 'My Queue', 'SLA', 'Timeline', 'Kanban',
      'Runtime', 'Reports', 'Admin Reference'
    ],
    cards: {
      theme: 'Dark operational',
      hierarchy: 'Title → meta → metric badge → optional sub-detail',
      badges: 'Reusable cbv-badge classes (ok / warn / crit)',
      buttons: 'No fake action buttons; no mutation triggers'
    },
    states: CBV_WEBAPP_UI_FREEZE_FE_STATES.slice(),
    safetyFooter: {
      base: CBV_WEBAPP_UI_FREEZE_SAFETY_PHRASES.slice(),
      timelineKanban: CBV_WEBAPP_UI_FREEZE_SAFETY_PHRASES_TIMELINE_KANBAN.slice(),
      forbiddenClaims: ['production ready', 'prod ready', 'auto-heal recommended']
    },
    readFirst: {
      rule: 'Every operational route must declare mode = READ_FIRST',
      noMutationButtons: true,
      noWriteback: true,
      noHiddenAutomation: true
    },
    responsive: {
      desktop: 'Usable >= 1024px viewport',
      tablet: 'Usable 768px–1023px viewport',
      mobile: 'Scroll-safe; no horizontal overflow required for basic reading',
      criticalText: 'Never clipped at any supported breakpoint'
    },
    accessibility: {
      contrast: 'Readable contrast on dark theme (WCAG AA target)',
      labels: 'Meaningful labels on buttons / links / inputs',
      visibleText: 'All interactive elements expose visible text or aria-label',
      statusEncoding: 'Status not encoded by colour only; text always present',
      warningText: 'Warnings / errors always include human-readable copy'
    }
  };
  return CbvWebAppUiFreeze__out_(true, standard, [], []);
}

/* ------------------------------------------------------------------ */
/* UAT checklist                                                       */
/* ------------------------------------------------------------------ */

function CbvWebAppUiFreeze_getUatChecklist() {
  var checklist = {
    routeSmoke: CBV_WEBAPP_UI_FREEZE_ROUTES.map(function(r) {
      return {
        route: r.route,
        check: 'Open ?route=' + r.route + ' and confirm page title "' + r.page + '" renders.'
      };
    }).concat(CBV_WEBAPP_UI_FREEZE_SUPPORT_ENDPOINTS.map(function(s) {
      return { route: s.endpoint, check: 'Hit ' + s.endpoint + ' and confirm JSON ping handler response.' };
    })),
    dataVisibility: [
      'Workspace shows Home dashboard cards (or empty / warning state).',
      'My Queue shows queue cards (or empty / warning state).',
      'SLA shows SLA widgets (or warning if columns missing).',
      'Timeline shows ordered HOME_ALERT rows.',
      'Kanban shows columns grouped by STATUS.',
      'Runtime Health shows per-phase cards + system health.',
      'Reports shows recent reports list.',
      'Admin Reference shows governance, enums, user/role, feature flag, system registry, UI contract, route registry.'
    ],
    warningStates: [
      'Missing sheet → warning card visible.',
      'Missing function → warning card visible, not a crash.',
      'Partial data → partial-state messaging visible.',
      'Empty data → empty-state messaging visible.',
      'Error in renderer → fallback placeholder visible (no white screen).'
    ],
    noMutationUI: [
      'No edit / save / delete / toggle / assign / resolve / escalate buttons anywhere.',
      'No drag-drop save in Kanban.',
      'No writeback in Timeline.',
      'No toggle feature in Admin Reference.',
      'No delete report in Reports.'
    ],
    responsive: [
      'Desktop renders without scroll for primary cards.',
      'Tablet renders cards full-width and readable.',
      'Mobile renders cards stacked, no horizontal overflow blocks reading.',
      'Critical text (status, route, safety) never clipped.'
    ],
    accessibility: [
      'Contrast passes on dark theme cards.',
      'All buttons / links display visible text.',
      'Status badges combine text + colour, never colour alone.',
      'Warning/error text is human-readable.'
    ],
    reportAudit: [
      'Test Console Phase 90/91/92/93/94 run cleanly (GO or GO_WITH_WARNINGS).',
      'No production-ready claim in any report.',
      'No auto-heal recommendation in any report.',
      'Latest reports copy successfully via Copy Latest Report dialog.'
    ],
    governance: [
      'Secrets / tokens / API keys never rendered as plain values (Phase 93 masking confirmed).',
      'Emails masked in Admin Reference.',
      'Missing reference sheets surface as warnings only.'
    ]
  };
  return CbvWebAppUiFreeze__out_(true, checklist, [], []);
}

/* ------------------------------------------------------------------ */
/* Validate                                                            */
/* ------------------------------------------------------------------ */

function CbvWebAppUiFreeze_validate() {
  var warnings = [];
  var errors = [];

  var detail = {
    routesRegistered: {},
    routesModeOk: {},
    supportEndpoints: CBV_WEBAPP_UI_FREEZE_SUPPORT_ENDPOINTS.slice(),
    docsExpected: CBV_WEBAPP_UI_FREEZE_REQUIRED_DOCS.slice(),
    dispatcherLastDocumented: 'documented in 05_GAS_RUNTIME/CLASP_PUSH_ORDER.md (runtime cannot inspect local .clasp.json from Apps Script)',
    noMutationExposed: true,
    mutationProbe: [],
    mutationAllowlist: [],
    safetyPhrasesPresent: false
  };

  // Required routes registered + mode is READ_FIRST
  try {
    var reg = (typeof CbvWebAppWorkspace_routeRegistry === 'function') ? (CbvWebAppWorkspace_routeRegistry() || []) : [];
    CBV_WEBAPP_UI_FREEZE_ROUTES.forEach(function(r) {
      var match = null;
      for (var i = 0; i < reg.length; i++) {
        if (String(reg[i].route) === r.route) { match = reg[i]; break; }
      }
      detail.routesRegistered[r.route] = !!match;
      detail.routesModeOk[r.route] = !!(match && String(match.mode || '') === r.mode);
      if (!match) errors.push('Frozen route not registered: ' + r.route);
      else if (String(match.mode || '') !== r.mode) errors.push('Frozen route mode drift: ' + r.route + ' (expected ' + r.mode + ' got ' + match.mode + ')');
    });
  } catch (eReg) {
    warnings.push('Route registry inspection skipped: ' + (eReg && eReg.message ? eReg.message : String(eReg)));
  }

  // Doc presence cannot be inspected from Apps Script runtime → WARNING only.
  warnings.push('Doc presence is not validated at runtime (Apps Script cannot read local repo files). Documented in CLASP_PUSH_ORDER.md and PHASE_94 docs.');

  // 999 dispatcher last in filePushOrder: runtime cannot read .clasp.json, so WARNING only.
  warnings.push('999_WEBAPP_DOGET_DISPATCHER_FINAL.js must remain absolute last in .clasp.json filePushOrder (verified locally; runtime cannot self-check).');

  // Safety phrases present in our handoff text
  try {
    var handoff = (typeof CBV_WEBAPP_UI_FREEZE_HANDOFF_PROMPT === 'string') ? CBV_WEBAPP_UI_FREEZE_HANDOFF_PROMPT : '';
    detail.safetyPhrasesPresent = CBV_WEBAPP_UI_FREEZE_SAFETY_PHRASES.every(function(p) { return handoff.indexOf(p) >= 0; });
    if (!detail.safetyPhrasesPresent) warnings.push('Safety phrases incomplete in CBV_WEBAPP_UI_FREEZE_HANDOFF_PROMPT.');
  } catch (eS) {
    warnings.push('Safety phrase scan skipped: ' + (eS && eS.message ? eS.message : String(eS)));
  }

  // ---------------------------------------------------------------------
  // Mutation-name probe (Phase 94-scoped). Verb-at-start with allowlist.
  // ---------------------------------------------------------------------
  detail.mutationAllowlist = [
    'CbvWebAppUiFreeze_getRouteFreezeMatrix',
    'CbvWebAppUiFreeze_getUiStandard',
    'CbvWebAppUiFreeze_getUatChecklist',
    'CbvWebAppUiFreeze_validate'
  ];
  var allowPatterns = [
    /^CbvWebAppUiFreeze__/,
    /^CbvWebAppUiFreeze_TestConsole_/,
    /^CbvWebAppUiFreeze_get/
  ];
  var verbRe = /^(set|update|create|delete|save|mutate|assign|escalate|resolve|complete|toggle|enable|disable|grant|revoke|provision|deprovision|edit|reset|rotate|heal|repair)[A-Z]/;

  function isMutationName(name) {
    if (typeof name !== 'string') return false;
    if (name.indexOf('CbvWebAppUiFreeze_') !== 0) return false;
    if (detail.mutationAllowlist.indexOf(name) >= 0) return false;
    for (var i = 0; i < allowPatterns.length; i++) {
      if (allowPatterns[i].test(name)) return false;
    }
    var action = name.replace(/^CbvWebAppUiFreeze_/, '').replace(/^_+/, '');
    return verbRe.test(action);
  }

  try {
    var globals = (typeof this !== 'undefined') ? this : {};
    var keys = Object.keys(globals || {});
    for (var k = 0; k < keys.length; k++) {
      var n = keys[k];
      if (isMutationName(n) && typeof globals[n] === 'function') {
        detail.noMutationExposed = false;
        detail.mutationProbe.push(n);
      }
    }
  } catch (eProbe) {
    warnings.push('Mutation probe skipped: ' + (eProbe && eProbe.message ? eProbe.message : String(eProbe)));
  }
  if (!detail.noMutationExposed) {
    errors.push('Phase 94 namespace exposes mutation-like functions: ' + detail.mutationProbe.join(', '));
  }

  var ok = errors.length === 0;
  return CbvWebAppUiFreeze__out_(ok, detail, warnings, errors);
}
