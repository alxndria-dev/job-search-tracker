import {
  type Application,
  applicationStatuses,
  currentStages,
  makeTimelineEvent,
  statusFromApplication,
  toISO,
} from "@/lib/applications";
import { daysTo, offset, today } from "@/lib/dates";

export type SortColumn =
  | "opportunity"
  | "added"
  | "stage"
  | "state"
  | "fit"
  | "followUp";

export type SortDirection = "asc" | "desc";

export type SortState = {
  column: SortColumn;
  direction: SortDirection;
} | null;

export function actionState(app: Application) {
  if (app.state !== "active") return "done";
  if (!app.nextAction.trim()) return "none";
  if (app.followUpDate && daysTo(app.followUpDate) <= 0) return "due";
  if (!app.followUpDate && app.appliedDate && daysTo(app.appliedDate) < -14)
    return "stale";
  return "planned";
}

export const blank = (): Application => ({
  id: crypto.randomUUID(),
  company: "",
  role: "",
  jobUrl: "",
  state: "active",
  currentStage: "applied",
  sentiment: "neutral",
  timeline: [
    makeTimelineEvent("applied", "Application submitted", toISO(today)),
  ],
  fit: 3,
  appliedDate: toISO(today),
  followUpDate: offset(14),
  nextAction: "waiting for response",
  fitEvidence: "",
  risks: "",
  learning: "",
});

const followSortRank = {
  due: 0,
  stale: 1,
  planned: 2,
  none: 3,
  done: 4,
} as const;

export const compareApplications = (
  a: Application,
  b: Application,
  column: SortColumn,
) => {
  switch (column) {
    case "opportunity":
      return (
        a.company.localeCompare(b.company, undefined, { sensitivity: "base" }) ||
        a.role.localeCompare(b.role, undefined, { sensitivity: "base" })
      );
    case "added":
      return a.appliedDate.localeCompare(b.appliedDate);
    case "stage":
      return (
        currentStages.indexOf(a.currentStage) -
        currentStages.indexOf(b.currentStage)
      );
    case "state":
      return (
        applicationStatuses.indexOf(statusFromApplication(a)) -
        applicationStatuses.indexOf(statusFromApplication(b))
      );
    case "fit":
      return a.fit - b.fit;
    case "followUp": {
      const byUrgency =
        followSortRank[actionState(a)] - followSortRank[actionState(b)];
      if (byUrgency !== 0) return byUrgency;
      return (a.followUpDate || "9999-12-31").localeCompare(
        b.followUpDate || "9999-12-31",
      );
    }
  }
};

export const filterVisible = (
  applications: Application[],
  {
    query,
    stageFilter,
    actionFilter,
    hideClosed,
  }: {
    query: string;
    stageFilter: string;
    actionFilter: string;
    hideClosed: boolean;
  },
) =>
  applications.filter(
    (app) =>
      `${app.company} ${app.role}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (stageFilter === "all" || app.currentStage === stageFilter) &&
      (actionFilter === "all" || actionState(app) === actionFilter) &&
      (!hideClosed || app.state !== "closed"),
  );
