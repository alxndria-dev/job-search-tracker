"use client";

import { FormEvent, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

import { Field } from "@/components/form-fields";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
    });
  };
  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      {draft ? (
        <DialogContent className="sm:max-w-lg">
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
