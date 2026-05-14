/**
 * PHASE_95 — WebApp Pilot UAT / Staff Trial Runbook — Runtime
 *
 * Purpose:
 *   Expose the pilot scope, role-specific UAT scripts, feedback schema,
 *   issue triage matrix, and go/no-go criteria as machine-readable
 *   structures that the Phase 95 Test Console can validate.
 *
 * Phase 96 add-on:
 *   CbvWebAppUat_getUserFlowViPointers() — Vietnamese user-flow pointers + doc paths
 *   (advisory; depends on 998F for live flow JSON + canonical URL when loaded).
 *
 * Read-first only. No mutation. No write actions. No AppSheet Bot.
 * No AI runtime. No production claim.
 */

var CBV_WEBAPP_UAT_PHASE_ID = 'PHASE_95_WEBAPP_PILOT_UAT_STAFF_TRIAL_RUNBOOK';
var CBV_WEBAPP_UAT_CONTRACT_VERSION = 'CBV_TCS_V1';

/* ------------------------------------------------------------------ */
/* Static catalogues                                                   */
/* ------------------------------------------------------------------ */

var CBV_WEBAPP_UAT_OPERATIONAL_ROUTES = [
  '/workspace',
  '/home-alert/my-queue',
  '/home-alert/sla',
  '/home-alert/timeline',
  '/home-alert/kanban',
  '/runtime/health',
  '/reports',
  '/admin/reference'
];

var CBV_WEBAPP_UAT_SUPPORT_ENDPOINTS = ['?action=ping'];

var CBV_WEBAPP_UAT_ROLES = ['Admin', 'Supervisor', 'Operator'];

var CBV_WEBAPP_UAT_OUT_OF_SCOPE = [
  'New WebApp feature',
  'Write actions',
  'Mutation runtime',
  'Controlled writeback',
  'AI assist',
  'Automation runtime',
  'AppSheet Bot',
  'Production certification'
];

var CBV_WEBAPP_UAT_SAFETY_RULES = [
  'No auto assign',
  'No auto resolve',
  'No auto escalate',
  'No production claim',
  'No drag-drop save (Kanban / Timeline)',
  'No mutation / writeback in WebApp',
  'No AppSheet Bot',
  'No AI runtime',
  'No ENV-A',
  'No queue intelligence',
  'No destructive migration'
];

var CBV_WEBAPP_UAT_DURATION = {
  preparation: '0.5 day — prepare device matrix, accounts, sample data verification.',
  trial: '3 working days — Operator (day 1), Supervisor (day 2), Admin (day 3); overlap allowed.',
  triage: '0.5 day — issue triage + signoff drafting.'
};

var CBV_WEBAPP_UAT_PARTICIPANT_GUIDANCE = {
  admin: 'At least 1 admin (governance + runtime health + report viewer).',
  supervisor: 'At least 1 supervisor (SLA / Timeline / Kanban).',
  operator: 'At least 2 operators (My Queue / Workspace / mobile + desktop).'
};

/** Phase 96 — Vietnamese UX doc pointers (repo paths; advisory for staff briefing). */
var CBV_WEBAPP_UAT_PHASE96_VI_DOC_PATHS = [
  'docs/webapp/WEBAPP_USER_FLOW_GUIDE_VI.md',
  'docs/webapp/WEBAPP_OPERATOR_QUICK_GUIDE_VI.md',
  'docs/webapp/WEBAPP_SUPERVISOR_QUICK_GUIDE_VI.md',
  'docs/webapp/WEBAPP_ADMIN_QUICK_GUIDE_VI.md',
  'docs/webapp/WEBAPP_LINKS_AND_ROUTES_VI.md',
  'docs/webapp/WEBAPP_VI_LABEL_DICTIONARY.md',
  'docs/webapp/WEBAPP_UAT_VIETNAMESE_COPY_CHECKLIST.md',
  'docs/webapp/PHASE_96_WEBAPP_VIETNAMESE_UX_REFACTOR_USER_FLOW_GUIDE.md'
];

function CbvWebAppUat_getUserFlowViPointers() {
  var data = {
    phase: 'PHASE_96_WEBAPP_VIETNAMESE_UX_REFACTOR_USER_FLOW_GUIDE',
    noteVi: 'Nhãn WebApp pilot đã Việt hóa (Phase 96). Script UAT tiếng Anh (A1–A10 / S1–S9 / O1–O9) giữ nguyên — dùng các tài liệu tiếng Việt dưới đây khi hướng dẫn nhân sự; kiểm tra footer an toàn tiếng Việt trên mọi route.',
    canonicalWebAppUrl: (function () {
      try {
        if (typeof CbvWebAppRouteUrl_getBaseUrl === 'function') return CbvWebAppRouteUrl_getBaseUrl();
        if (typeof CBV_WEBAPP_VI_CANONICAL_EXEC_URL === 'string') return CBV_WEBAPP_VI_CANONICAL_EXEC_URL;
      } catch (e) { /* ignore */ }
      return '(998H_WEBAPP_ROUTE_URL_HELPER.js — xem docs/webapp/WEBAPP_LINKS_AND_ROUTES_VI.md)';
    })(),
    operatorFlow: (function () {
      try { return (typeof CbvWebAppVi_getUserFlowGuide === 'function') ? CbvWebAppVi_getUserFlowGuide('operator') : null; }
      catch (e) { return null; }
    })(),
    supervisorFlow: (function () {
      try { return (typeof CbvWebAppVi_getUserFlowGuide === 'function') ? CbvWebAppVi_getUserFlowGuide('supervisor') : null; }
      catch (e) { return null; }
    })(),
    adminFlow: (function () {
      try { return (typeof CbvWebAppVi_getUserFlowGuide === 'function') ? CbvWebAppVi_getUserFlowGuide('admin') : null; }
      catch (e) { return null; }
    })(),
    docPaths: CBV_WEBAPP_UAT_PHASE96_VI_DOC_PATHS.slice()
  };
  return CbvWebAppUat__out_(true, data, [], []);
}

var CBV_WEBAPP_UAT_SEVERITY_LEVELS = ['BLOCKER', 'HIGH', 'MEDIUM', 'LOW', 'OBSERVATION'];

/* ------------------------------------------------------------------ */
/* Envelope                                                            */
/* ------------------------------------------------------------------ */

function CbvWebAppUat__out_(ok, data, warnings, errors) {
  return {
    ok: ok === true,
    data: data || null,
    warnings: warnings || [],
    errors: errors || [],
    checkedAt: (typeof CbvWebAppWorkspace__now_ === 'function') ? CbvWebAppWorkspace__now_() : new Date()
  };
}

/* ------------------------------------------------------------------ */
/* Pilot scope                                                         */
/* ------------------------------------------------------------------ */

function CbvWebAppUat_getPilotScope() {
  var data = {
    phase: CBV_WEBAPP_UAT_PHASE_ID,
    routes: {
      operational: CBV_WEBAPP_UAT_OPERATIONAL_ROUTES.slice(),
      support: CBV_WEBAPP_UAT_SUPPORT_ENDPOINTS.slice()
    },
    roles: CBV_WEBAPP_UAT_ROLES.slice(),
    duration: CBV_WEBAPP_UAT_DURATION,
    participants: CBV_WEBAPP_UAT_PARTICIPANT_GUIDANCE,
    outOfScope: CBV_WEBAPP_UAT_OUT_OF_SCOPE.slice(),
    safetyRules: CBV_WEBAPP_UAT_SAFETY_RULES.slice(),
    dependsOn: ['Phase 94 — WebApp UI Foundation Freeze'],
    expectedOutput: [
      'Filled WEBAPP_PILOT_SIGNOFF_TEMPLATE.md per session.',
      'Feedback rows captured per WEBAPP_UAT_FEEDBACK_SCHEMA.md.',
      'Triaged issue list per WEBAPP_UAT_ISSUE_TRIAGE_MATRIX.md.',
      'Go/No-Go decision per WEBAPP_PILOT_GO_NO_GO_CRITERIA.md.'
    ]
  };
  return CbvWebAppUat__out_(true, data, [], []);
}

/* ------------------------------------------------------------------ */
/* Admin / Supervisor / Operator scripts                               */
/* ------------------------------------------------------------------ */

function CbvWebAppUat_getAdminScript() {
  var data = {
    role: 'Admin',
    estimatedMinutes: 25,
    routes: ['/workspace', '/runtime/health', '/reports', '/admin/reference', '?action=ping'],
    steps: [
      { id: 'A1', action: 'Hit ?action=ping', expected: 'JSON response; handler 999_WEBAPP_DOGET_DISPATCHER_FINAL.' },
      { id: 'A2', action: 'Open /workspace', expected: 'Home Workspace renders with READ_FIRST badge + safety footer.' },
      { id: 'A3', action: 'Open /runtime/health', expected: 'Per-phase health cards visible; missing CBV_TEST_REPORTS surfaces as warning, not crash.' },
      { id: 'A4', action: 'Open /reports', expected: 'Reports list visible or empty-state; no delete / no edit buttons.' },
      { id: 'A5', action: 'Open /admin/reference', expected: 'Governance / enums / user-role / feature-flag / system-registry / UI-contract / route-registry sections visible.' },
      { id: 'A6', action: 'Inspect /admin/reference user list', expected: 'Emails masked (e.g. o***x@domain).' },
      { id: 'A7', action: 'Inspect /admin/reference for secrets/tokens/keys', expected: 'Values are masked everywhere; never plain text.' },
      { id: 'A8', action: 'Confirm safety footer on every operational route', expected: 'Exact phrases present: No auto assign, No auto resolve, No auto escalate, No production claim. (Timeline/Kanban also include No drag-drop save.)' },
      { id: 'A9', action: 'Verify no edit / save / delete / toggle / drag-drop save controls anywhere', expected: 'None visible. No fake action buttons.' },
      { id: 'A10', action: 'Record feedback per WEBAPP_UAT_FEEDBACK_SCHEMA.md', expected: 'Filled rows for each route or one row per anomaly.' }
    ],
    passCriteria: 'All 10 steps PASS; no secrets surfaced; safety footer verbatim on every operational route.',
    warnCriteria: 'Up to 2 MEDIUM/LOW issues with workarounds documented in feedback.',
    failCriteria: 'Any BLOCKER, secret leak, missing safety phrase, mutation control surfaced, or production-ready claim observed.'
  };
  return CbvWebAppUat__out_(true, data, [], []);
}

function CbvWebAppUat_getSupervisorScript() {
  var data = {
    role: 'Supervisor',
    estimatedMinutes: 25,
    routes: ['/workspace', '/home-alert/sla', '/home-alert/timeline', '/home-alert/kanban'],
    steps: [
      { id: 'S1', action: 'Open /workspace', expected: 'Home Workspace renders; understand at-a-glance status.' },
      { id: 'S2', action: 'Open /home-alert/sla', expected: 'SLA widgets visible; breached / warning states clearly labelled.' },
      { id: 'S3', action: 'Inspect SLA breached cards', expected: 'Text + colour together; never colour-only.' },
      { id: 'S4', action: 'Open /home-alert/timeline', expected: 'HOME_ALERT rows ordered by recency; safety footer includes "No drag-drop save".' },
      { id: 'S5', action: 'Open /home-alert/kanban', expected: 'Columns grouped by STATUS; safety footer includes "No drag-drop save".' },
      { id: 'S6', action: 'Attempt to drag a Kanban card', expected: 'Card is not draggable; no save action triggered.' },
      { id: 'S7', action: 'Verify workload visibility (My Queue + SLA + Kanban)', expected: 'Supervisor can identify load distribution across operators in read-only view.' },
      { id: 'S8', action: 'Verify warning / partial / empty states render coherently', expected: 'Text describes the state; no white screen on empty data.' },
      { id: 'S9', action: 'Record feedback per WEBAPP_UAT_FEEDBACK_SCHEMA.md', expected: 'Filled rows reflect at-a-glance comprehension.' }
    ],
    passCriteria: 'All 9 steps PASS; supervisor confidently interprets SLA / Timeline / Kanban; no drag-drop save observed.',
    warnCriteria: 'Up to 2 MEDIUM usability issues (e.g. badge wording) with workarounds documented.',
    failCriteria: 'Any BLOCKER, working drag-drop save, hidden mutation, missing safety phrase, or supervisor unable to interpret SLA / Timeline / Kanban.'
  };
  return CbvWebAppUat__out_(true, data, [], []);
}

function CbvWebAppUat_getOperatorScript() {
  var data = {
    role: 'Operator',
    estimatedMinutes: 25,
    routes: ['/workspace', '/home-alert/my-queue'],
    devices: ['Desktop 1280x800', 'Tablet 1024x768', 'Mobile 414x896', 'Mobile 360x800'],
    steps: [
      { id: 'O1', action: 'Open /workspace on desktop', expected: 'Home Workspace renders comfortably; safety footer visible.' },
      { id: 'O2', action: 'Open /home-alert/my-queue on desktop', expected: 'Queue cards visible; status badges show text + colour.' },
      { id: 'O3', action: 'Read each queue card', expected: 'Operator can articulate next action from the card without external help.' },
      { id: 'O4', action: 'Open /home-alert/my-queue on tablet', expected: 'Cards full-width or two-column; readable without zoom.' },
      { id: 'O5', action: 'Open /home-alert/my-queue on mobile', expected: 'Cards stacked; no horizontal overflow for reading; safety footer visible at bottom.' },
      { id: 'O6', action: 'Inspect each card for fake action buttons', expected: 'No Save / Edit / Delete / Toggle / Assign / Resolve / Escalate buttons.' },
      { id: 'O7', action: 'Read "next action" text on a queue card', expected: 'Wording is understandable; no jargon that prevents action.' },
      { id: 'O8', action: 'Verify safety footer on every route', expected: 'Exact phrases visible: No auto assign, No auto resolve, No auto escalate, No production claim.' },
      { id: 'O9', action: 'Record feedback per WEBAPP_UAT_FEEDBACK_SCHEMA.md', expected: 'Filled rows include speed / usability / confusion ratings.' }
    ],
    passCriteria: 'All 9 steps PASS; operator articulates next action without help on at least 80% of cards; mobile baseline holds.',
    warnCriteria: 'Up to 2 MEDIUM wording / spacing issues documented; no BLOCKER.',
    failCriteria: 'Any BLOCKER, operator cannot use My Queue, mobile critical text clipped, or any mutation button visible.'
  };
  return CbvWebAppUat__out_(true, data, [], []);
}

/* ------------------------------------------------------------------ */
/* Feedback schema                                                     */
/* ------------------------------------------------------------------ */

function CbvWebAppUat_getFeedbackSchema() {
  var fields = [
    { name: 'UAT_ID', type: 'STRING', required: true, description: 'Unique row identifier (e.g. UAT-2026-05-13-001).' },
    { name: 'SESSION_ID', type: 'STRING', required: true, description: 'Session grouping ID (one per role/day).' },
    { name: 'TEST_DATE', type: 'DATE', required: true, description: 'ISO date of the test.' },
    { name: 'TESTER_EMAIL', type: 'STRING', required: true, description: 'Tester corporate email.' },
    { name: 'TESTER_ROLE', type: 'ENUM', required: true, allowed: ['Admin', 'Supervisor', 'Operator'], description: 'Role under test.' },
    { name: 'ROUTE', type: 'STRING', required: true, description: 'WebApp route or ?action=ping.' },
    { name: 'DEVICE_TYPE', type: 'ENUM', required: true, allowed: ['Desktop', 'Tablet', 'Mobile'], description: 'Device category.' },
    { name: 'SCENARIO', type: 'STRING', required: true, description: 'Step ID from the role-specific script (A1..A10 / S1..S9 / O1..O9) or free-form scenario name.' },
    { name: 'RESULT', type: 'ENUM', required: true, allowed: ['PASS', 'WARN', 'FAIL'], description: 'Step result.' },
    { name: 'SEVERITY', type: 'ENUM', required: true, allowed: CBV_WEBAPP_UAT_SEVERITY_LEVELS.slice(), description: 'Severity per triage matrix.' },
    { name: 'SPEED_RATING', type: 'INT', required: false, range: '1-5', description: 'Subjective speed rating (5 = fastest).' },
    { name: 'USABILITY_RATING', type: 'INT', required: false, range: '1-5', description: 'Subjective usability rating (5 = easiest).' },
    { name: 'CONFUSION_POINT', type: 'TEXT', required: false, description: 'Where the tester got confused.' },
    { name: 'ERROR_MESSAGE', type: 'TEXT', required: false, description: 'Verbatim error / warning text observed.' },
    { name: 'SUGGESTED_FIX', type: 'TEXT', required: false, description: 'Tester-suggested fix or wording change.' },
    { name: 'IS_BLOCKER', type: 'BOOL', required: true, description: 'True only if SEVERITY = BLOCKER.' },
    { name: 'CREATED_AT', type: 'TIMESTAMP', required: true, description: 'ISO timestamp of capture.' }
  ];
  return CbvWebAppUat__out_(true, { fields: fields, fieldCount: fields.length, allowedSeverities: CBV_WEBAPP_UAT_SEVERITY_LEVELS.slice() }, [], []);
}

/* ------------------------------------------------------------------ */
/* Issue triage matrix                                                 */
/* ------------------------------------------------------------------ */

function CbvWebAppUat_getIssueTriageMatrix() {
  var data = {
    levels: [
      { severity: 'BLOCKER', signoffImpact: 'Blocks pilot signoff', actionRule: 'Must be fixed before signoff. No waiver allowed.' },
      { severity: 'HIGH', signoffImpact: 'Conditional', actionRule: 'Must be fixed or explicitly waived in the signoff template; max 2 waived per pilot.' },
      { severity: 'MEDIUM', signoffImpact: 'Non-blocking', actionRule: 'Tracked follow-up; documented in signoff appendix.' },
      { severity: 'LOW', signoffImpact: 'Non-blocking', actionRule: 'Logged for backlog; no immediate action required.' },
      { severity: 'OBSERVATION', signoffImpact: 'Informational', actionRule: 'Captured for future polish; not actionable in pilot.' }
    ],
    examples: {
      BLOCKER: 'Route crashes; secret value rendered in plain text; drag-drop save executes; mutation button surfaces.',
      HIGH: 'Safety footer missing one of the four base phrases; warning state renders as colour-only badge; operator cannot read mobile critical text.',
      MEDIUM: 'Wording ambiguous on a queue card; tablet layout double-line clip on long title; missing tooltip.',
      LOW: 'Minor padding inconsistency between cards; non-critical alignment quirk.',
      OBSERVATION: 'Suggested polish (e.g. icon ideas, copy improvements) with no functional defect.'
    }
  };
  return CbvWebAppUat__out_(true, data, [], []);
}

/* ------------------------------------------------------------------ */
/* Go / No-Go criteria                                                 */
/* ------------------------------------------------------------------ */

function CbvWebAppUat_getGoNoGoCriteria() {
  var data = {
    GO: [
      'All operational routes open and render the expected page.',
      'No BLOCKER captured.',
      'No security leakage (no secrets / tokens / keys in plain text; emails masked).',
      'No mutation UI surfaced (no edit / delete / toggle / save / drag-drop save / assign / resolve / escalate buttons).',
      'Operators understand the main queue workflow without external help on at least 80% of cards.',
      'Supervisor can interpret SLA, Timeline, and Kanban states.',
      'Admin can read runtime health, reports, and governance summaries.'
    ],
    GO_WITH_WARNINGS: [
      'No BLOCKER captured.',
      'At most 2 HIGH severity issues, each with an explicit waiver recorded in the signoff template.',
      'MEDIUM items captured as tracked follow-ups (no immediate fix required).',
      'All GO criteria above otherwise met.'
    ],
    NO_GO: [
      'Any BLOCKER captured.',
      'Any security leak (plain-text secret / token / API key / unmasked email).',
      'Any route crashes or white-screens on a supported breakpoint.',
      'Any fake mutation UI visible (button that looks like it writes but does nothing — operators may try anyway).',
      'Operator cannot use the My Queue core workflow.',
      'Any production-ready claim observed in WebApp UI / reports / handoffs.'
    ],
    waiverRule: 'A waiver is a written, signed acknowledgement in the signoff template explaining (a) the HIGH issue, (b) the planned fix window, and (c) the operational mitigation in the meantime. Waivers are append-only; they cannot be silently rescinded.',
    nextStepOnGo: 'Plan Phase 96 — Controlled WebApp Action Design / Mutation Guard Blueprint.',
    nextStepOnGoWithWarnings: 'Plan Phase 96 — Controlled WebApp Action Design / Mutation Guard Blueprint; track HIGH waivers as the first items.',
    nextStepOnNoGo: 'Plan Phase 96 — UAT Fix Pack (NOT mutation design). Address BLOCKERs and re-run the relevant scripts before scheduling another pilot.'
  };
  return CbvWebAppUat__out_(true, data, [], []);
}

/* ------------------------------------------------------------------ */
/* Validate                                                            */
/* ------------------------------------------------------------------ */

function CbvWebAppUat_validate() {
  var warnings = [];
  var errors = [];

  var detail = {
    pilotScopeOk: false,
    adminScriptOk: false,
    supervisorScriptOk: false,
    operatorScriptOk: false,
    feedbackSchemaOk: false,
    triageMatrixOk: false,
    goNoGoCriteriaOk: false,
    userFlowViPointersOk: false,
    noMutationExposed: true,
    mutationProbe: [],
    mutationAllowlist: []
  };

  try { detail.pilotScopeOk = !!(CbvWebAppUat_getPilotScope().data && CbvWebAppUat_getPilotScope().data.routes); }
  catch (e1) { warnings.push('pilotScope: ' + (e1 && e1.message ? e1.message : String(e1))); }
  try { detail.adminScriptOk = !!(CbvWebAppUat_getAdminScript().data && Array.isArray(CbvWebAppUat_getAdminScript().data.steps)); }
  catch (e2) { warnings.push('adminScript: ' + (e2 && e2.message ? e2.message : String(e2))); }
  try { detail.supervisorScriptOk = !!(CbvWebAppUat_getSupervisorScript().data && Array.isArray(CbvWebAppUat_getSupervisorScript().data.steps)); }
  catch (e3) { warnings.push('supervisorScript: ' + (e3 && e3.message ? e3.message : String(e3))); }
  try { detail.operatorScriptOk = !!(CbvWebAppUat_getOperatorScript().data && Array.isArray(CbvWebAppUat_getOperatorScript().data.steps)); }
  catch (e4) { warnings.push('operatorScript: ' + (e4 && e4.message ? e4.message : String(e4))); }
  try { detail.feedbackSchemaOk = !!(CbvWebAppUat_getFeedbackSchema().data && Array.isArray(CbvWebAppUat_getFeedbackSchema().data.fields)); }
  catch (e5) { warnings.push('feedbackSchema: ' + (e5 && e5.message ? e5.message : String(e5))); }
  try { detail.triageMatrixOk = !!(CbvWebAppUat_getIssueTriageMatrix().data && Array.isArray(CbvWebAppUat_getIssueTriageMatrix().data.levels)); }
  catch (e6) { warnings.push('triageMatrix: ' + (e6 && e6.message ? e6.message : String(e6))); }
  try { detail.goNoGoCriteriaOk = !!(CbvWebAppUat_getGoNoGoCriteria().data && Array.isArray(CbvWebAppUat_getGoNoGoCriteria().data.GO)); }
  catch (e7) { warnings.push('goNoGoCriteria: ' + (e7 && e7.message ? e7.message : String(e7))); }

  try {
    var ufv = CbvWebAppUat_getUserFlowViPointers();
    detail.userFlowViPointersOk = !!(ufv && ufv.data && ufv.data.docPaths && ufv.data.docPaths.length);
  } catch (e8) { warnings.push('userFlowViPointers: ' + (e8 && e8.message ? e8.message : String(e8))); }
  if (!detail.userFlowViPointersOk) {
    warnings.push('Phase 96 Vietnamese user-flow pointers unavailable — load 998F before 998D or check CbvWebAppUat_getUserFlowViPointers.');
  }

  ['pilotScopeOk', 'adminScriptOk', 'supervisorScriptOk', 'operatorScriptOk', 'feedbackSchemaOk', 'triageMatrixOk', 'goNoGoCriteriaOk'].forEach(function(k) {
    if (!detail[k]) errors.push('Phase 95 artefact missing or malformed: ' + k);
  });

  // Phase 94 freeze dependency (advisory)
  if (typeof CbvWebAppUiFreeze_getRouteFreezeMatrix !== 'function') {
    warnings.push('Phase 94 freeze runtime not loaded — UAT depends on the freeze for route + safety contract.');
  }

  // -------- Mutation probe (Phase 95-scoped) --------
  detail.mutationAllowlist = [
    'CbvWebAppUat_getPilotScope',
    'CbvWebAppUat_getAdminScript',
    'CbvWebAppUat_getSupervisorScript',
    'CbvWebAppUat_getOperatorScript',
    'CbvWebAppUat_getFeedbackSchema',
    'CbvWebAppUat_getIssueTriageMatrix',
    'CbvWebAppUat_getGoNoGoCriteria',
    'CbvWebAppUat_getUserFlowViPointers',
    'CbvWebAppUat_validate'
  ];
  var allowPatterns = [
    /^CbvWebAppUat__/,
    /^CbvWebAppUat_TestConsole_/,
    /^CbvWebAppUat_get/
  ];
  var verbRe = /^(set|update|create|delete|save|mutate|assign|escalate|resolve|complete|toggle|enable|disable|grant|revoke|provision|deprovision|edit|reset|rotate|heal|repair)[A-Z]/;

  function isMutationName(name) {
    if (typeof name !== 'string') return false;
    if (name.indexOf('CbvWebAppUat_') !== 0) return false;
    if (detail.mutationAllowlist.indexOf(name) >= 0) return false;
    for (var i = 0; i < allowPatterns.length; i++) {
      if (allowPatterns[i].test(name)) return false;
    }
    var action = name.replace(/^CbvWebAppUat_/, '').replace(/^_+/, '');
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
    errors.push('Phase 95 namespace exposes mutation-like functions: ' + detail.mutationProbe.join(', '));
  }

  return CbvWebAppUat__out_(errors.length === 0, detail, warnings, errors);
}
