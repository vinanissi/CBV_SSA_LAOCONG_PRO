/** OCMS CaseReadModel — read-only projection types (contract V0). */

export type Confidence = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';

export type CaseTypeCode =
  | 'HO_SO'
  | 'OPERATIONS'
  | 'FINANCE'
  | 'INVOICE'
  | 'MEMBERSHIP'
  | 'COMPLAINT'
  | 'PROJECT'
  | 'SUPPORT'
  | 'COMPLIANCE'
  | 'DOCUMENT';

export type CaseReadSource =
  | 'TASK_ANCHORED'
  | 'HO_SO_ANCHORED'
  | 'ALERT_ANCHORED'
  | 'FINANCE_ANCHORED'
  | 'MANUAL_CASE_KEY'
  | 'MIXED';

export type DeriveSource =
  | 'TASK_MAIN'
  | 'TASK_UPDATE_LOG'
  | 'TASK_CHECKLIST'
  | 'TASK_ATTACHMENT'
  | 'HOME_ALERT'
  | 'HO_SO_MASTER'
  | 'HO_SO_FILE'
  | 'HO_SO_UPDATE_LOG'
  | 'FINANCE_TRANSACTION'
  | 'FINANCE_LOG'
  | 'INFERRED'
  | 'UNAVAILABLE';

export type SourceRuntime =
  | 'TASK_GS_01'
  | 'HOME_ALERT'
  | 'HO_SO_RF06'
  | 'FINANCE_RF06'
  | 'WORKER'
  | 'UNKNOWN';

export type DiscoveryOutcome = 'RESOLVED' | 'PARTIAL' | 'NONE';

export type StripVisibilityLevel = 'HIDDEN' | 'MINIMAL' | 'STANDARD' | 'EXPANDED';

export interface ActorRef {
  actorId: string | null;
  displayName: string | null;
  roleSource: DeriveSource;
  confidence: Confidence;
}

export interface LifecycleField {
  code: string;
  label: string;
  since: string | null;
  source: DeriveSource;
  confidence: Confidence;
}

export interface ResultField {
  code: string;
  group: string;
  label: string;
  source: DeriveSource;
  confidence: Confidence;
}

export interface ResponsibilityField {
  responsible: ActorRef | null;
  support: ActorRef[];
  reviewer: ActorRef[];
  escalation: ActorRef[];
  watcher: ActorRef[];
}

export interface RelationField {
  targetType: string;
  targetId: string;
  role: string;
  label: string | null;
  source: DeriveSource;
  confidence: Confidence;
  projectionKey?: string;
}

export interface MemoryRecentItem {
  memoryType: string;
  label: string;
  at: string | null;
  actor: ActorRef | null;
  sourceRuntime: SourceRuntime;
  deepLink: string | null;
}

export interface MemorySummaryField {
  lastActivityAt: string | null;
  lastActivityText: string | null;
  counts: {
    timeline: number;
    checklist: number;
    attachments: number;
    comments: number;
    decisions: number;
    handoffs: number;
    evidence: number;
  };
  recent: MemoryRecentItem[];
}

export interface PermissionsField {
  canView: boolean;
  canOpenSource: boolean;
  canOpenRelated: boolean;
  canSeePrivateFields: boolean;
  canMutateTask: boolean;
}

export interface DiscoveryCandidate {
  rank: number;
  source: CaseReadSource;
  anchorField: string;
  anchorId: string | null;
  caseKeyHint: string;
  selected: boolean;
  excludedReason?: string;
}

export interface DiagnosticsField {
  confidence: Confidence;
  missingRelations: string[];
  missingProjections: string[];
  staleSources: SourceRuntime[];
  warnings: string[];
  runtimeState: 'NOT_WIRED' | 'WIRED';
  discoveryCandidates?: DiscoveryCandidate[];
  discoveryOutcome?: DiscoveryOutcome;
}

export interface CaseReadModel {
  caseKey: string;
  caseType: CaseTypeCode;
  title: string;
  lifecycle: LifecycleField;
  result: ResultField | null;
  responsibility: ResponsibilityField;
  relations: RelationField[];
  workItems: unknown[];
  memorySummary: MemorySummaryField;
  projections: Record<string, unknown>;
  permissions: PermissionsField;
  source: CaseReadSource;
  diagnostics: DiagnosticsField;
}

export interface CaseContextStripLink {
  label: string;
  href: string;
}

export interface CaseContextStripView {
  level: StripVisibilityLevel;
  caseTypeLabel: string;
  lifecycleLabel: string;
  /** Prominent case title for operator scan. */
  caseTitle?: string;
  /** Human identity — not raw canonical caseKey. */
  caseIdentityLabel?: string;
  /** Operator-safe key display (e.g. TASK:id) — never canonical OPERATIONS:TASK:… */
  safeKeyLabel?: string;
  /** Canonical source + Vietnamese label, e.g. TASK_ANCHORED · Theo công việc */
  discoveryLine?: string;
  /** Canonical source for tooltip / a11y — not shown as primary label. */
  discoverySourceCode?: CaseReadSource;
  discoverySourceLabel?: string;
  relationsSummary?: string;
  /** Action-oriented relation text, e.g. "2 việc liên quan". */
  relationsActionLabel?: string;
  /** Responsible name or honest missing label. */
  responsibleDisplay?: string;
  responsibleLabel?: string;
  /** OK or joined diagnostic issues. */
  diagnosticsStatus?: string;
  diagnosticsSummary?: string;
  visibilityLabel?: string;
  titleLine?: string;
  primaryRelation?: { label: string; link?: CaseContextStripLink };
  targetRelation?: { label: string; link?: CaseContextStripLink };
  resultLabel?: string;
  reviewerLabel?: string;
  recentLines: string[];
  warnings: string[];
  collapsed: boolean;
}
