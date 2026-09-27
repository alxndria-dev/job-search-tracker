import {
  applicationStatuses,
  currentStages,
  prettySentiment,
  prettyStage,
  prettyStatus,
  sentiments,
} from "@/lib/applications";

export const stageFilterItems = {
  all: "All stages",
  ...Object.fromEntries(
    currentStages.map((stage) => [stage, prettyStage(stage)]),
  ),
};

export const actionFilterItems = {
  all: "Any action state",
  due: "Action due",
  stale: "Likely cold",
  none: "No next action",
};

export const stageItems = Object.fromEntries(
  currentStages.map((stage) => [stage, prettyStage(stage)]),
);

export const statusItems = Object.fromEntries(
  applicationStatuses.map((status) => [status, prettyStatus(status)]),
);

export const fitScores = ["1", "2", "3", "4", "5"] as const;

export const fitItems = Object.fromEntries(
  fitScores.map((score) => [score, score]),
);

export const fitGuide = [
  ["1", "speculative"],
  ["2", "stretch"],
  ["3", "credible match"],
  ["4", "strong match"],
  ["5", "exceptional match"],
] as const;

export const sentimentItems = Object.fromEntries(
  sentiments.map((sentiment) => [sentiment, prettySentiment(sentiment)]),
);
