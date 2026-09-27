"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  type Application,
  makeTimelineEvent,
  removeTimelineEvent,
  sortTimelineNewestFirst,
  toISO,
} from "@/lib/applications";
import { today } from "@/lib/dates";

export function TimelineDialog({
  application,
  onClose,
  onChange,
}: {
  application: Application | null;
  onClose: () => void;
  onChange: (application: Application) => void;
}) {
  const [noteDate, setNoteDate] = useState(toISO(today));
  const [noteTitle, setNoteTitle] = useState("");
  const [noteBody, setNoteBody] = useState("");
  useEffect(() => {
    setNoteDate(toISO(today));
    setNoteTitle("");
    setNoteBody("");
  }, [application?.id]);
  const addTimelineNote = () => {
    const title = noteTitle.trim();
    if (!application || !title) return;
    onChange({
      ...application,
      timeline: [
        ...application.timeline,
        makeTimelineEvent("note", title, noteDate || toISO(today), noteBody),
      ],
    });
    setNoteTitle("");
    setNoteBody("");
    setNoteDate(toISO(today));
  };
  return (
    <Dialog open={!!application} onOpenChange={(open) => !open && onClose()}>
      {application && (
        <DialogContent
          className="max-h-[90vh] overflow-y-auto sm:max-w-lg"
          aria-describedby={undefined}
        >
          <DialogHeader>
            <DialogDescription className="font-mono text-[11px] tracking-[0.08em] uppercase">
              Activity timeline
            </DialogDescription>
            <DialogTitle>
              {application.company || "Application"} timeline
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="timelineNoteDate">Date</Label>
                <Input
                  id="timelineNoteDate"
                  type="date"
                  value={noteDate}
                  onChange={(event) => setNoteDate(event.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="timelineNoteTitle">Title</Label>
                <Input
                  id="timelineNoteTitle"
                  value={noteTitle}
                  onChange={(event) => setNoteTitle(event.target.value)}
                  placeholder="e.g. Hiring manager call"
                />
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="timelineNoteBody">Note</Label>
                <Textarea
                  id="timelineNoteBody"
                  value={noteBody}
                  onChange={(event) => setNoteBody(event.target.value)}
                  placeholder="Optional context"
                  rows={2}
                />
              </div>
              <div className="sm:col-span-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={addTimelineNote}
                  disabled={!noteTitle.trim()}
                >
                  Add timeline note
                </Button>
              </div>
            </div>
            <ol className="grid gap-3">
              {sortTimelineNewestFirst(application.timeline).map((event) => (
                <li
                  key={event.id}
                  className="flex items-start gap-2 rounded-lg border border-border px-3 py-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[11px] tracking-[0.06em] text-muted-foreground uppercase">
                      {event.occurredOn}
                    </p>
                    <p className="text-sm font-medium">{event.title}</p>
                    {event.note ? (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {event.note}
                      </p>
                    ) : null}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Delete ${event.title}`}
                    onClick={() =>
                      onChange(removeTimelineEvent(application, event.id))
                    }
                  >
                    <Trash2 />
                  </Button>
                </li>
              ))}
            </ol>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
}
