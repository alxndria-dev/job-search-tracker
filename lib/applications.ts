export type ApplicationState = "active" | "on_hold" | "closed";

export type CurrentStage =
  | "applied"
  | "1st interview"
  | "2nd interview"
  | "3rd interview"
  | "test task"
  | "final round"
  | "offer";

export type Outcome =
  | "rejected"
  | "withdrawn"
  | "ghosted"
  | "no_response"
  | "other";

export type TimelineEventType =
  | CurrentStage
  | "on_hold"
  | "closed"
  | "note"
  | "sentiment";

export type Sentiment = "good" | "neutral" | "bad";

export type TimelineEvent = {
  id: string;
  occurredOn: string;
  type: TimelineEventType;
  title: string;
  note?: string;
};

export type Application = {
  id: string;
  company: string;
  role: string;
  jobUrl: string;
  state: ApplicationState;
  currentStage: CurrentStage;
  sentiment: Sentiment;
  outcome?: Outcome;
  timeline: TimelineEvent[];
  fit: number;
  appliedDate: string;
  followUpDate: string;
  nextAction: string;
  fitEvidence: string;
  risks: string;
  learning: string;
};

export const previousStorageKey = "huntr-applications-v2";
export const storageKey = "huntr-applications-v3";
export const hideClosedStorageKey = "huntr-hide-closed";

export const currentStages: CurrentStage[] = [
  "applied",
  "1st interview",
  "2nd interview",
  "3rd interview",
  "test task",
  "final round",
  "offer",
];

export const applicationStates: ApplicationState[] = [
  "active",
  "on_hold",
  "closed",
];

export const outcomes: Outcome[] = [
  "rejected",
  "withdrawn",
  "ghosted",
  "no_response",
  "other",
];

export type ApplicationStatus = "active" | "on_hold" | Outcome;

export const applicationStatuses: ApplicationStatus[] = [
  "active",
  "on_hold",
  ...outcomes,
];

export const sentiments: Sentiment[] = ["good", "neutral", "bad"];

export const IMPORT_LIMITS = {
  maxBytes: 1_000_000,
  maxApplications: 500,
  maxTimelineEvents: 100,
  maxId: 128,
  maxShort: 200,
  maxUrl: 2048,
  maxText: 8_000,
} as const;

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

export const isLikelyJsonImportFile = (file: File) => {
  const name = file.name.toLowerCase();
  if (name.endsWith(".json")) return true;
  return file.type === "application/json" || file.type === "text/json";
};

const clip = (value: string, max: number) =>
  value.length <= max ? value : value.slice(0, max);

const sanitizeId = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > IMPORT_LIMITS.maxId) return "";
  if (/[\0-\x1f\x7f]/.test(trimmed)) return "";
  return trimmed;
};

const sanitizeIsoDate = (value: string, fallback = "") => {
  const trimmed = value.trim();
  return isoDatePattern.test(trimmed) ? trimmed : fallback;
};

const sanitizeFit = (value: number) => {
  if (!Number.isFinite(value)) return 3;
  return Math.min(5, Math.max(1, Math.round(value)));
};
const currentStageSet = new Set<string>(currentStages);
const stateSet = new Set<string>(applicationStates);
const outcomeSet = new Set<string>(outcomes);
const sentimentSet = new Set<string>(sentiments);

export const toISO = (date: Date) => date.toISOString().slice(0, 10);

const shortMonths = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sept",
  "Oct",
  "Nov",
  "Dec",
] as const;

export const formatDayMonth = (iso: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!match) return "";
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return "";
  return `${day} ${shortMonths[month - 1]}`;
};

export const prettyStage = (stage: CurrentStage) => {
  switch (stage) {
    case "1st interview":
      return "1st Interview";
    case "2nd interview":
      return "2nd Interview";
    case "3rd interview":
      return "3rd Interview";
    case "test task":
      return "Test task";
    case "final round":
      return "Final round";
    default:
      return stage[0].toUpperCase() + stage.slice(1);
  }
};

export const prettyState = (state: ApplicationState) => {
  switch (state) {
    case "on_hold":
      return "On hold";
    case "closed":
      return "Closed";
    default:
      return "Active";
  }
};

export const prettyOutcome = (outcome: Outcome) => {
  switch (outcome) {
    case "no_response":
      return "No response";
    case "other":
      return "Other";
    default:
      return outcome[0].toUpperCase() + outcome.slice(1);
  }
};

export const prettyStatus = (status: ApplicationStatus) => {
  if (status === "active" || status === "on_hold") return prettyState(status);
  return prettyOutcome(status);
};

export const prettySentiment = (sentiment: Sentiment) => {
  switch (sentiment) {
    case "good":
      return "Good";
    case "bad":
      return "Bad";
    default:
      return "Neutral";
  }
};

export const statusFromApplication = (app: Application): ApplicationStatus => {
  if (app.state === "closed") return app.outcome ?? "other";
  return app.state;
};

export const normalizeApplication = (app: Application): Application => ({
  id: clip(app.id, IMPORT_LIMITS.maxId),
  company: clip(app.company, IMPORT_LIMITS.maxShort),
  role: clip(app.role, IMPORT_LIMITS.maxShort),
  jobUrl: clip(app.jobUrl?.trim() ?? "", IMPORT_LIMITS.maxUrl),
  state: app.state,
  currentStage: app.currentStage,
  sentiment: isSentiment(app.sentiment) ? app.sentiment : "neutral",
  outcome: app.state === "closed" ? (app.outcome ?? "other") : undefined,
  timeline: app.timeline.slice(0, IMPORT_LIMITS.maxTimelineEvents),
  fit: sanitizeFit(app.fit),
  appliedDate: sanitizeIsoDate(app.appliedDate, app.appliedDate),
  followUpDate: app.followUpDate
    ? sanitizeIsoDate(app.followUpDate, "")
    : "",
  nextAction: clip(app.nextAction, IMPORT_LIMITS.maxText),
  fitEvidence: clip(app.fitEvidence, IMPORT_LIMITS.maxText),
  risks: clip(app.risks, IMPORT_LIMITS.maxText),
  learning: clip(app.learning, IMPORT_LIMITS.maxText),
});

export const jobUrlHref = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return null;
  return `https://${trimmed}`;
};

export const stageEventTitle = (stage: CurrentStage) => {
  switch (stage) {
    case "applied":
      return "Application submitted";
    case "1st interview":
      return "1st Interview";
    case "2nd interview":
      return "2nd Interview";
    case "3rd interview":
      return "3rd Interview";
    case "test task":
      return "Test task";
    case "final round":
      return "Final round";
    case "offer":
      return "Offer";
  }
};

export const makeTimelineEvent = (
  type: TimelineEventType,
  title: string,
  occurredOn: string,
  note?: string,
  id = crypto.randomUUID(),
): TimelineEvent => ({
  id,
  occurredOn,
  type,
  title,
  ...(note?.trim() ? { note: note.trim() } : {}),
});

export const sortTimelineNewestFirst = (events: TimelineEvent[]) =>
  events
    .map((event, index) => ({ event, index }))
    .sort((a, b) => {
      const byDate = b.event.occurredOn.localeCompare(a.event.occurredOn);
      return byDate !== 0 ? byDate : b.index - a.index;
    })
    .map(({ event }) => event);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isCurrentStage = (value: unknown): value is CurrentStage =>
  typeof value === "string" && currentStageSet.has(value);

const isApplicationState = (value: unknown): value is ApplicationState =>
  typeof value === "string" && stateSet.has(value);

const isOutcome = (value: unknown): value is Outcome =>
  typeof value === "string" && outcomeSet.has(value);

const isSentiment = (value: unknown): value is Sentiment =>
  typeof value === "string" && sentimentSet.has(value);

const isTimelineEventType = (value: unknown): value is TimelineEventType =>
  typeof value === "string" &&
  (currentStageSet.has(value) ||
    value === "on_hold" ||
    value === "closed" ||
    value === "note" ||
    value === "sentiment");

const parseTimeline = (value: unknown): TimelineEvent[] => {
  if (!Array.isArray(value)) return [];
  return value.slice(0, IMPORT_LIMITS.maxTimelineEvents).flatMap((item) => {
    if (!isRecord(item)) return [];
    if (typeof item.id !== "string") return [];
    if (typeof item.occurredOn !== "string") return [];
    if (!isTimelineEventType(item.type)) return [];
    if (typeof item.title !== "string") return [];
    const id = sanitizeId(item.id);
    const occurredOn = sanitizeIsoDate(item.occurredOn);
    if (!id || !occurredOn) return [];
    const event: TimelineEvent = {
      id,
      occurredOn,
      type: item.type,
      title: clip(item.title, IMPORT_LIMITS.maxShort),
    };
    if (typeof item.note === "string" && item.note.trim()) {
      event.note = clip(item.note.trim(), IMPORT_LIMITS.maxText);
    }
    return [event];
  });
};

export const isV3Application = (value: unknown): value is Application => {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.company === "string" &&
    typeof value.role === "string" &&
    (value.jobUrl === undefined || typeof value.jobUrl === "string") &&
    isApplicationState(value.state) &&
    isCurrentStage(value.currentStage) &&
    (value.sentiment === undefined || isSentiment(value.sentiment)) &&
    Array.isArray(value.timeline) &&
    typeof value.fit === "number" &&
    Number.isFinite(value.fit) &&
    typeof value.appliedDate === "string" &&
    typeof value.followUpDate === "string" &&
    typeof value.nextAction === "string" &&
    typeof value.fitEvidence === "string" &&
    typeof value.risks === "string" &&
    typeof value.learning === "string" &&
    (value.outcome === undefined || isOutcome(value.outcome))
  );
};

type LegacyMapping = {
  state: ApplicationState;
  currentStage: CurrentStage;
  outcome?: Outcome;
};

const mapLegacyStage = (stage: string): LegacyMapping => {
  switch (stage) {
    case "applied":
      return { state: "active", currentStage: "applied" };
    case "interview":
    case "1st interview":
    case "2nd interview":
    case "3rd interview":
      return { state: "active", currentStage: stage as CurrentStage };
    case "Test task":
    case "test task":
      return { state: "active", currentStage: "test task" };
    case "final round":
      return { state: "active", currentStage: "final round" };
    case "offer":
      return { state: "active", currentStage: "offer" };
    case "on hold":
    case "on_hold":
      return { state: "on_hold", currentStage: "applied" };
    case "rejected":
      return { state: "closed", currentStage: "applied", outcome: "rejected" };
    case "withdrawn":
      return { state: "closed", currentStage: "applied", outcome: "withdrawn" };
    case "ghosted":
      return { state: "closed", currentStage: "applied", outcome: "ghosted" };
    case "no response":
    case "no_response":
      return { state: "closed", currentStage: "applied", outcome: "no_response" };
    case "closed":
      return { state: "closed", currentStage: "applied", outcome: "other" };
    default:
      return { state: "active", currentStage: "applied" };
  }
};

export const migrateLegacyApplication = (
  value: unknown,
  todayISO: string,
): Application | null => {
  if (isV3Application(value)) {
    const id = sanitizeId(value.id);
    if (!id) return null;
    return normalizeApplication({
      id,
      company: value.company,
      role: value.role,
      jobUrl: typeof value.jobUrl === "string" ? value.jobUrl : "",
      state: value.state,
      currentStage: value.currentStage,
      sentiment: isSentiment(value.sentiment) ? value.sentiment : "neutral",
      timeline: parseTimeline(value.timeline),
      fit: value.fit,
      appliedDate: value.appliedDate,
      followUpDate: value.followUpDate,
      nextAction: value.nextAction,
      fitEvidence: value.fitEvidence,
      risks: value.risks,
      learning: value.learning,
      outcome: value.state === "closed" ? value.outcome : undefined,
    });
  }
  if (!isRecord(value) || typeof value.id !== "string") return null;
  const id = sanitizeId(value.id);
  if (!id) return null;
  const appliedDate =
    typeof value.appliedDate === "string" && value.appliedDate
      ? value.appliedDate
      : todayISO;
  const mapping = mapLegacyStage(
    typeof value.stage === "string" ? value.stage : "applied",
  );
  return normalizeApplication({
    id,
    company: typeof value.company === "string" ? value.company : "",
    role: typeof value.role === "string" ? value.role : "",
    jobUrl: typeof value.jobUrl === "string" ? value.jobUrl : "",
    state: mapping.state,
    currentStage: mapping.currentStage,
    sentiment: isSentiment(value.sentiment) ? value.sentiment : "neutral",
    ...(mapping.outcome ? { outcome: mapping.outcome } : {}),
    timeline: [
      makeTimelineEvent("applied", "Application submitted", appliedDate),
    ],
    fit: typeof value.fit === "number" ? value.fit : Number(value.fit) || 3,
    appliedDate,
    followUpDate: typeof value.followUpDate === "string" ? value.followUpDate : "",
    nextAction: typeof value.nextAction === "string" ? value.nextAction : "",
    fitEvidence: typeof value.fitEvidence === "string" ? value.fitEvidence : "",
    risks: typeof value.risks === "string" ? value.risks : "",
    learning: typeof value.learning === "string" ? value.learning : "",
  });
};

export const parseApplicationsPayload = (
  parsed: unknown,
  todayISO: string,
): Application[] => {
  if (!Array.isArray(parsed)) return [];
  return parsed
    .map((item) => migrateLegacyApplication(item, todayISO))
    .filter((item): item is Application => item !== null);
};

export const parseImportedApplications = (
  text: string,
  todayISO: string,
): Application[] => {
  if (text.length > IMPORT_LIMITS.maxBytes) {
    throw new Error("This file is too large to import.");
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("This file is not valid JSON.");
  }
  if (!Array.isArray(parsed)) {
    throw new Error(
      "This file is not a Huntr export. Use a JSON file created with Export data.",
    );
  }
  if (parsed.length > IMPORT_LIMITS.maxApplications) {
    throw new Error(
      `This file has too many records. Import at most ${IMPORT_LIMITS.maxApplications} applications.`,
    );
  }
  const seen = new Set<string>();
  const migrated = parsed.flatMap((item) => {
    const app = migrateLegacyApplication(item, todayISO);
    if (!app) return [];
    if (seen.has(app.id)) return [];
    seen.add(app.id);
    return [app];
  });
  if (!migrated.length) {
    throw new Error(
      "This file is not a Huntr export. Use a JSON file created with Export data.",
    );
  }
  return migrated;
};

export const loadApplications = (
  seed: Application[],
  todayISO: string,
): Application[] => {
  const current = localStorage.getItem(storageKey);
  if (current) {
    try {
      const migrated = parseApplicationsPayload(
        JSON.parse(current),
        todayISO,
      );
      if (migrated.length) return migrated;
    } catch {
      /* fall through */
    }
  }
  const previous = localStorage.getItem(previousStorageKey);
  if (previous) {
    try {
      const migrated = parseApplicationsPayload(
        JSON.parse(previous),
        todayISO,
      );
      if (migrated.length) return migrated;
    } catch {
      /* fall through */
    }
  }
  return seed;
};

export const appendStageEvent = (
  app: Application,
  stage: CurrentStage,
  occurredOn: string,
): Application => {
  if (app.currentStage === stage) return app;
  return {
    ...app,
    currentStage: stage,
    timeline: [
      ...app.timeline,
      makeTimelineEvent(stage, stageEventTitle(stage), occurredOn),
    ],
  };
};

export const applySentiment = (
  app: Application,
  sentiment: Sentiment,
  occurredOn: string,
): Application => {
  if (app.sentiment === sentiment) return app;
  return {
    ...app,
    sentiment,
    timeline: [
      ...app.timeline,
      makeTimelineEvent(
        "sentiment",
        `Sentiment — ${prettySentiment(sentiment)}`,
        occurredOn,
      ),
    ],
  };
};

export const removeTimelineEvent = (
  app: Application,
  eventId: string,
): Application => ({
  ...app,
  timeline: app.timeline.filter((event) => event.id !== eventId),
});

export const applyStatus = (
  app: Application,
  status: ApplicationStatus,
  occurredOn: string,
): Application => {
  if (status === "active" || status === "on_hold") {
    return applyStateChange(app, status, occurredOn);
  }
  return applyStateChange(app, "closed", occurredOn, status);
};

export const applyStateChange = (
  app: Application,
  state: ApplicationState,
  occurredOn: string,
  outcome?: Outcome,
): Application => {
  if (app.state === state) {
    if (state === "closed" && outcome && app.outcome !== outcome) {
      return setClosedOutcome(app, outcome);
    }
    return app;
  }
  if (state === "on_hold") {
    return {
      ...app,
      state,
      outcome: undefined,
      timeline: [
        ...app.timeline,
        makeTimelineEvent("on_hold", "Process on hold", occurredOn),
      ],
    };
  }
  if (state === "closed") {
    const nextOutcome = outcome ?? "other";
    return {
      ...app,
      state,
      outcome: nextOutcome,
      timeline: [
        ...app.timeline,
        makeTimelineEvent(
          "closed",
          `Closed — ${prettyOutcome(nextOutcome)}`,
          occurredOn,
        ),
      ],
    };
  }
  return { ...app, state, outcome: undefined };
};

export const setClosedOutcome = (
  app: Application,
  outcome: Outcome,
): Application => {
  if (app.state !== "closed") return app;
  const timeline = [...app.timeline];
  const last = timeline[timeline.length - 1];
  if (last?.type === "closed") {
    timeline[timeline.length - 1] = {
      ...last,
      title: `Closed — ${prettyOutcome(outcome)}`,
    };
  }
  return { ...app, outcome, timeline };
};
