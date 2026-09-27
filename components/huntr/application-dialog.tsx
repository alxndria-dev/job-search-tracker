"use client";

import { FormEvent, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

import { Field, TextAreaField } from "@/components/huntr/form-fields";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type Application,
  type ApplicationStatus,
  type CurrentStage,
  type Sentiment,
  appendStageEvent,
  applicationStatuses,
  applySentiment,
  applyStatus,
  currentStages,
  prettySentiment,
  prettyStage,
  prettyStatus,
  sentiments,
  statusFromApplication,
  toISO,
} from "@/lib/applications";
import { today } from "@/lib/dates";
import {
  fitGuide,
  fitItems,
  fitScores,
  sentimentItems,
  stageItems,
  statusItems,
} from "@/lib/select-options";
import { cn } from "@/lib/utils";

export function ApplicationDialog({
  application,
  onClose,
  onSave,
  onDelete,
  isNew = false,
}: {
  application: Application | null;
  onClose: () => void;
  onSave: (application: Application) => void;
  onDelete?: () => void;
  isNew?: boolean;
}) {
  const [draft, setDraft] = useState<Application | null>(application);
  const [errors, setErrors] = useState<{ company?: string; role?: string }>(
    {},
  );
  useEffect(() => {
    setDraft(application);
    setErrors({});
  }, [application]);
  const saveDraft = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft) return;
    const values = new FormData(event.currentTarget);
    const company = String(values.get("company")).trim();
    const role = String(values.get("role")).trim();
    const nextErrors = {
      ...(company ? {} : { company: "Company is required." }),
      ...(role ? {} : { role: "Role is required." }),
    };
    if (nextErrors.company || nextErrors.role) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    const appliedDate = String(values.get("appliedDate") ?? draft.appliedDate);
    let timeline = draft.timeline;
    const submitted = timeline.find((item) => item.type === "applied");
    if (submitted && appliedDate && submitted.occurredOn !== appliedDate) {
      timeline = timeline.map((item) =>
        item.id === submitted.id ? { ...item, occurredOn: appliedDate } : item,
      );
    }
    onSave({
      ...draft,
      company,
      role,
      jobUrl: String(values.get("jobUrl")).trim(),
      fit: Number(values.get("fit")),
      appliedDate,
      followUpDate: String(values.get("followUpDate") ?? draft.followUpDate),
      nextAction: String(values.get("nextAction") ?? draft.nextAction).trim(),
      fitEvidence: String(values.get("fitEvidence")).trim(),
      risks: String(values.get("risks")).trim(),
      learning: String(values.get("learning") ?? draft.learning).trim(),
      timeline,
      outcome: draft.state === "closed" ? (draft.outcome ?? "other") : undefined,
    });
  };
  return (
    <Dialog open={!!application} onOpenChange={(open) => !open && onClose()}>
      {draft && (
        <DialogContent
          className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"
          aria-describedby={undefined}
        >
          <form onSubmit={saveDraft} noValidate key={draft.id}>
            <DialogHeader>
              <DialogDescription className="font-mono text-[11px] tracking-[0.08em] uppercase">
                Application
              </DialogDescription>
              <DialogTitle>
                {isNew ? "Add application" : "Review application"}
              </DialogTitle>
            </DialogHeader>
            <div className="my-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                name="company"
                label="Company"
                required
                value={draft.company}
                error={errors.company}
              />
              <Field
                name="role"
                label="Role"
                required
                value={draft.role}
                error={errors.role}
              />
              <Field
                name="jobUrl"
                label="Job URL"
                className="sm:col-span-2"
                value={draft.jobUrl}
                placeholder="https://"
                inputMode="url"
              />
              {!isNew ? (
                <div className="grid gap-2">
                  <Label htmlFor="state">State</Label>
                  <Select
                    value={statusFromApplication(draft)}
                    onValueChange={(value) => {
                      if (!value) return;
                      setDraft((current) =>
                        current
                          ? applyStatus(
                              current,
                              value as ApplicationStatus,
                              toISO(today),
                            )
                          : current,
                      );
                    }}
                    items={statusItems}
                  >
                    <SelectTrigger id="state" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {applicationStatuses.map((status) => (
                        <SelectItem value={status} key={status}>
                          {prettyStatus(status)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}
              {!isNew ? (
                <div className="grid gap-2">
                  <Label htmlFor="currentStage">Current stage</Label>
                  <Select
                    value={draft.currentStage}
                    onValueChange={(value) => {
                      if (!value) return;
                      setDraft((current) =>
                        current
                          ? appendStageEvent(
                              current,
                              value as CurrentStage,
                              toISO(today),
                            )
                          : current,
                      );
                    }}
                    items={stageItems}
                  >
                    <SelectTrigger id="currentStage" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currentStages.map((stage) => (
                        <SelectItem value={stage} key={stage}>
                          {prettyStage(stage)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}
              <div
                className={cn(
                  "grid gap-4 sm:col-span-2",
                  isNew ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2",
                )}
              >
                <div className="grid gap-2">
                  <Label htmlFor="fit">Fit score (1–5)</Label>
                  <Select
                    name="fit"
                    defaultValue={String(draft.fit)}
                    items={fitItems}
                  >
                    <SelectTrigger id="fit" className="w-full tabular-nums">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fitScores.map((score) => (
                        <SelectItem value={score} key={score}>
                          {score}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {!isNew ? (
                  <div className="grid gap-2">
                    <Label htmlFor="sentiment">Sentiment</Label>
                    <Select
                      value={draft.sentiment}
                      onValueChange={(value) => {
                        if (!value) return;
                        setDraft((current) =>
                          current
                            ? applySentiment(
                                current,
                                value as Sentiment,
                                toISO(today),
                              )
                            : current,
                        );
                      }}
                      items={sentimentItems}
                    >
                      <SelectTrigger id="sentiment" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sentiments.map((sentiment) => (
                          <SelectItem value={sentiment} key={sentiment}>
                            {prettySentiment(sentiment)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : null}
                <p
                  className={cn(
                    "text-xs text-muted-foreground",
                    !isNew && "sm:col-span-2",
                  )}
                >
                  {fitGuide
                    .map(([score, meaning]) => `${score} ${meaning}`)
                    .join(" · ")}
                </p>
              </div>
              {!isNew ? (
                <Field
                  name="appliedDate"
                  label="Applied date"
                  type="date"
                  value={draft.appliedDate}
                />
              ) : null}
              {!isNew ? (
                <Field
                  name="followUpDate"
                  label="Follow-up date"
                  type="date"
                  value={draft.followUpDate}
                />
              ) : null}
              {!isNew ? (
                <Field
                  name="nextAction"
                  label="Next action"
                  className="sm:col-span-2"
                  value={draft.nextAction}
                  placeholder="e.g. Follow up with recruiter"
                />
              ) : null}
              <TextAreaField
                name="fitEvidence"
                label="Evidence of fit"
                value={draft.fitEvidence}
                placeholder="Specific evidence, not a feeling."
              />
              <TextAreaField
                name="risks"
                label="Risks / gaps"
                value={draft.risks}
                placeholder="What may make this a poor use of time?"
              />
              {!isNew ? (
                <TextAreaField
                  name="learning"
                  label="What I learned"
                  value={draft.learning}
                  placeholder="Add after a screen, interview or outcome."
                />
              ) : null}
            </div>
            <DialogFooter>
              {onDelete ? (
                <Button type="button" variant="destructive" onClick={onDelete}>
                  <Trash2 />
                  Delete
                </Button>
              ) : null}
              <div className="flex flex-col-reverse gap-2 sm:ml-auto sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit">Save application</Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      )}
    </Dialog>
  );
}
