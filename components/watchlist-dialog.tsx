"use client";

import { FormEvent, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

import { Field, TextAreaField } from "@/components/form-fields";
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
import { fitGuide, fitItems, fitScores } from "@/lib/select-options";
import { type WatchlistItem } from "@/lib/watchlist";

export function WatchlistDialog({
  item,
  onClose,
  onSave,
  onDelete,
  isNew = false,
}: {
  item: WatchlistItem | null;
  onClose: () => void;
  onSave: (item: WatchlistItem) => void;
  onDelete?: () => void;
  isNew?: boolean;
}) {
  const [draft, setDraft] = useState<WatchlistItem | null>(item);
  const [companyError, setCompanyError] = useState("");
  useEffect(() => {
    setDraft(item);
    setCompanyError("");
  }, [item]);
  const saveDraft = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft) return;
    const values = new FormData(event.currentTarget);
    const company = String(values.get("company")).trim();
    if (!company) {
      setCompanyError("Company is required.");
      return;
    }
    onSave({
      ...draft,
      company,
      role: String(values.get("role")).trim(),
      jobUrl: String(values.get("jobUrl")).trim(),
      fit: Number(values.get("fit")) || draft.fit,
      fitEvidence: String(values.get("fitEvidence")).trim(),
      risks: String(values.get("risks")).trim(),
    });
  };
  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      {draft ? (
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <form noValidate onSubmit={saveDraft} key={draft.id}>
          <DialogHeader>
            <DialogTitle>
              {isNew ? "Add to watchlist" : "Edit watchlist item"}
            </DialogTitle>
            <DialogDescription>
              Save a company before you apply. Role is optional.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 sm:grid-cols-2">
            <Field
              name="company"
              label="Company"
              value={draft.company}
              required
              error={companyError}
            />
            <Field name="role" label="Role" value={draft.role} />
            <Field
              name="jobUrl"
              label="Job URL"
              value={draft.jobUrl}
              className="sm:col-span-2"
              placeholder="https://"
              inputMode="url"
            />
            <div className="grid gap-2 sm:col-span-2">
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
              <p className="text-xs text-muted-foreground">
                {fitGuide
                  .map(([score, meaning]) => `${score} ${meaning}`)
                  .join(" · ")}
              </p>
            </div>
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
          </div>
          <DialogFooter>
            {onDelete ? (
              <Button
                type="button"
                variant="ghost"
                className="mr-auto text-destructive"
                onClick={onDelete}
              >
                <Trash2 />
                Delete
              </Button>
            ) : null}
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
