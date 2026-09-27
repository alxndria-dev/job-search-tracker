"use client";

import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { Download, Plus, Search, Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Stage =
  | "applied"
  | "screen"
  | "interview"
  | "final"
  | "offer"
  | "rejected"
  | "closed";
type Application = {
  id: string;
  company: string;
  role: string;
  stage: Stage;
  fit: number;
  appliedDate: string;
  followUpDate: string;
  nextAction: string;
  fitEvidence: string;
  risks: string;
  learning: string;
};
const storageKey = "huntr-applications-v2";
const allStages: Stage[] = [
  "applied",
  "screen",
  "interview",
  "final",
  "offer",
  "rejected",
  "closed",
];
const activeStages: Stage[] = [
  "applied",
  "screen",
  "interview",
  "final",
  "offer",
];
const today = new Date();
const toISO = (date: Date) => date.toISOString().slice(0, 10);
const offset = (days: number) =>
  toISO(new Date(today.getTime() + days * 86400000));
const seed: Application[] = [
  {
    id: "nory",
    company: "Nory",
    role: "Product Designer",
    stage: "interview",
    fit: 4,
    appliedDate: offset(-17),
    followUpDate: offset(2),
    nextAction: "Prepare questions for Head of Product interview",
    fitEvidence:
      "B2B AI, complex workflows, product-design-engineering background.",
    risks: "Restaurant domain knowledge is new; process may be slow.",
    learning: "Make the AI collaboration and operational experience concrete.",
  },
  {
    id: "linear",
    company: "Linear",
    role: "Staff Product Designer",
    stage: "applied",
    fit: 5,
    appliedDate: offset(-8),
    followUpDate: offset(6),
    nextAction: "Send focused portfolio follow-up",
    fitEvidence:
      "Design systems, async operating model, high-bar product craft.",
    risks: "Exceptionally competitive; portfolio must carry the case.",
    learning: "",
  },
  {
    id: "checkly",
    company: "Checkly",
    role: "Product Designer",
    stage: "closed",
    fit: 4,
    appliedDate: offset(-32),
    followUpDate: "",
    nextAction: "",
    fitEvidence: "Developer tooling and design-engineering overlap.",
    risks: "Interview was cancelled without context.",
    learning: "Follow up once, then close it.",
  },
  {
    id: "example",
    company: "Example Co",
    role: "Senior Product Designer",
    stage: "applied",
    fit: 2,
    appliedDate: offset(-23),
    followUpDate: "",
    nextAction: "",
    fitEvidence: "Interesting product space.",
    risks: "Weak direct evidence of fit and unclear remote policy.",
    learning: "",
  },
];
const prettyStage = (stage: Stage) =>
  stage === "final" ? "Final round" : stage[0].toUpperCase() + stage.slice(1);
const daysTo = (date: string) =>
  Math.ceil(
    (new Date(date).getTime() - new Date(toISO(today)).getTime()) / 86400000,
  );
function actionState(app: Application) {
  if (!activeStages.includes(app.stage)) return "done";
  if (!app.nextAction.trim()) return "none";
  if (app.followUpDate && daysTo(app.followUpDate) <= 0) return "due";
  if (!app.followUpDate && app.appliedDate && daysTo(app.appliedDate) < -14)
    return "stale";
  return "planned";
}
const blank = (): Application => ({
  id: crypto.randomUUID(),
  company: "",
  role: "",
  stage: "applied",
  fit: 3,
  appliedDate: toISO(today),
  followUpDate: "",
  nextAction: "",
  fitEvidence: "",
  risks: "",
  learning: "",
});
const stageFilterItems = {
  all: "All stages",
  applied: prettyStage("applied"),
  screen: prettyStage("screen"),
  interview: prettyStage("interview"),
  final: prettyStage("final"),
  offer: prettyStage("offer"),
  rejected: prettyStage("rejected"),
  closed: prettyStage("closed"),
};
const actionFilterItems = {
  all: "Any action state",
  due: "Action due",
  stale: "Likely cold",
  none: "No next action",
};
const stageItems = Object.fromEntries(
  allStages.map((stage) => [stage, prettyStage(stage)]),
);
const fitItems = {
  "5": "5 — strong evidence",
  "4": "4 — strong evidence",
  "3": "3 — plausible",
  "2": "2 — stretch",
  "1": "1 — stretch",
};

export default function Home() {
  const [applications, setApplications] = useState<Application[]>(seed);
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [editing, setEditing] = useState<Application | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Application | null>(null);
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) setApplications(JSON.parse(saved));
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) localStorage.setItem(storageKey, JSON.stringify(applications));
  }, [applications, ready]);
  const active = applications.filter((app) => activeStages.includes(app.stage));
  const due = active.filter((app) => actionState(app) === "due").length,
    stale = active.filter((app) => actionState(app) === "stale").length,
    noAction = active.filter((app) => actionState(app) === "none").length;
  const visible = useMemo(
    () =>
      applications.filter(
        (app) =>
          `${app.company} ${app.role}`
            .toLowerCase()
            .includes(query.toLowerCase()) &&
          (stageFilter === "all" || app.stage === stageFilter) &&
          (actionFilter === "all" || actionState(app) === actionFilter),
      ),
    [applications, query, stageFilter, actionFilter],
  );
  const saveApplication = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const app: Application = {
      id: String(values.get("id")),
      company: String(values.get("company")).trim(),
      role: String(values.get("role")).trim(),
      stage: values.get("stage") as Stage,
      fit: Number(values.get("fit")),
      appliedDate: String(values.get("appliedDate")),
      followUpDate: String(values.get("followUpDate")),
      nextAction: String(values.get("nextAction")).trim(),
      fitEvidence: String(values.get("fitEvidence")).trim(),
      risks: String(values.get("risks")).trim(),
      learning: String(values.get("learning")).trim(),
    };
    setApplications((current) =>
      current.some((item) => item.id === app.id)
        ? current.map((item) => (item.id === app.id ? app : item))
        : [app, ...current],
    );
    setEditing(null);
  };
  const updateStage = (id: string, stage: Stage) => {
    setApplications((current) =>
      current.map((item) => (item.id === id ? { ...item, stage } : item)),
    );
  };
  const deleteApplication = (id: string) => {
    setApplications((current) => current.filter((item) => item.id !== id));
    if (editing?.id === id) setEditing(null);
    setPendingDelete(null);
  };
  const exportData = () => {
    const blob = new Blob([JSON.stringify(applications, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `huntr-backup-${toISO(today)}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  };
  const weakFitCount = active.filter((app) => app.fit <= 2).length;
  const momentumCount = applications.filter((app) =>
    ["interview", "final", "offer"].includes(app.stage),
  ).length;
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 pb-16 sm:px-7">
      <header className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
        <div>
          <p className="mb-1.5 font-mono text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
            Job search, without the self-deception
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">Huntr.</h1>
        </div>
        <div className="flex w-full gap-2.5 sm:w-auto">
          <Button
            variant="outline"
            className="flex-1 sm:flex-none"
            onClick={exportData}
          >
            <Download />
            Export data
          </Button>
          <Button
            className="flex-1 sm:flex-none"
            onClick={() => setEditing(blank())}
          >
            <Plus />
            Add application
          </Button>
        </div>
      </header>

      <section className="mt-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          [
            active.length,
            "Active opportunities",
            "A pipeline is not progress unless it has a next move.",
          ],
          [
            due,
            "Actions due now",
            due
              ? "These can still change an outcome."
              : "Nothing urgent today.",
          ],
          [
            stale,
            "Likely cold",
            stale
              ? "Stop counting silence as an active lead."
              : "No stale applications.",
          ],
          [
            noAction,
            "No next action",
            noAction
              ? "Decide: follow up, archive, or wait for a reason."
              : "Every active role has a move.",
          ],
        ].map(([number, label, copy]) => (
          <Card key={String(label)}>
            <CardHeader>
              <CardDescription className="font-mono text-[11px] tracking-[0.08em] uppercase">
                {label}
              </CardDescription>
              <CardTitle className="text-4xl tracking-tight">{number}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{copy}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="mt-5">
        <CardHeader className="border-b">
          <CardDescription className="font-mono text-[11px] tracking-[0.08em] uppercase">
            Weekly reality check
          </CardDescription>
          <CardTitle>What the pipeline is telling you</CardTitle>
          <p className="text-sm text-muted-foreground">
            Stored only in this browser
          </p>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3.5 pt-0 sm:grid-cols-2 lg:grid-cols-3">
          <Reality
            title="Fit quality"
            tone={weakFitCount ? "warning" : undefined}
          >
            {weakFitCount
              ? `${weakFitCount} active role${weakFitCount === 1 ? " is" : "s are"} scored 1–2. Do not let stretches crowd out stronger evidence-led applications.`
              : "Your active roles have at least plausible evidence of fit."}
          </Reality>
          <Reality title="Pipeline signal">
            {momentumCount
              ? `${momentumCount} application${momentumCount === 1 ? " has" : "s have"} moved beyond an initial screen. Capture what created momentum.`
              : "No applications have reached interview yet. Review role targeting and proof of fit, not just volume."}
          </Reality>
          <Reality
            title="Evidence check"
            tone={active.some((app) => !app.fitEvidence.trim()) ? "danger" : undefined}
          >
            {active.some((app) => !app.fitEvidence.trim())
              ? "At least one active application has no written proof of fit. If you cannot name it, it is probably not a strong target."
              : "Every active application has recorded fit evidence."}
          </Reality>
        </CardContent>
      </Card>

      <Card className="mt-5" id="pipeline">
        <CardHeader className="gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardDescription className="font-mono text-[11px] tracking-[0.08em] uppercase">
              Pipeline
            </CardDescription>
            <CardTitle>Applications</CardTitle>
          </div>
          <div className="flex w-full flex-wrap gap-2.5 sm:w-auto">
            <div className="relative min-w-0 flex-1 sm:min-w-52">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search company or role"
                aria-label="Search applications"
                className="pl-8"
              />
            </div>
            <Select
              value={stageFilter}
              onValueChange={(value) => {
                if (value) setStageFilter(value);
              }}
              items={stageFilterItems}
            >
              <SelectTrigger aria-label="Filter by stage" className="min-w-40 flex-1 sm:flex-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(stageFilterItems).map(([value, label]) => (
                  <SelectItem value={value} key={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={actionFilter}
              onValueChange={(value) => {
                if (value) setActionFilter(value);
              }}
              items={actionFilterItems}
            >
              <SelectTrigger
                aria-label="Filter by action state"
                className="min-w-40 flex-1 sm:flex-none"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(actionFilterItems).map(([value, label]) => (
                  <SelectItem value={value} key={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table className="min-w-[800px]">
            <TableHeader>
              <TableRow>
                <TableHead>Opportunity</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Fit</TableHead>
                <TableHead>Next action</TableHead>
                <TableHead>Follow-up</TableHead>
                <TableHead className="text-right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.length ? (
                visible.map((app) => (
                  <ApplicationRow
                    application={app}
                    key={app.id}
                    onEdit={() => setEditing(app)}
                    onStageChange={(stage) => updateStage(app.id, stage)}
                    onDelete={() => setPendingDelete(app)}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-muted-foreground"
                  >
                    No applications match these filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ApplicationDialog
        application={editing}
        onClose={() => setEditing(null)}
        onSave={saveApplication}
        onDelete={
          editing && applications.some((item) => item.id === editing.id)
            ? () => {
                setPendingDelete(editing);
                setEditing(null);
              }
            : undefined
        }
      />
      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete application?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
                ? `${pendingDelete.company || "This application"} will be removed from this browser. This cannot be undone.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => pendingDelete && deleteApplication(pendingDelete.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

function Reality({
  title,
  tone,
  children,
}: {
  title: string;
  tone?: "warning" | "danger";
  children: ReactNode;
}) {
  return (
    <Alert
      variant={tone === "danger" ? "destructive" : "default"}
      className={cn(tone === "warning" && "border-amber-200 bg-amber-50")}
    >
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}

function ApplicationRow({
  application: app,
  onEdit,
  onStageChange,
  onDelete,
}: {
  application: Application;
  onEdit: () => void;
  onStageChange: (stage: Stage) => void;
  onDelete: () => void;
}) {
  const state = actionState(app);
  const followUp =
    state === "due"
      ? "Follow up due"
      : state === "stale"
        ? "Likely cold"
        : state === "none"
          ? "No next action"
          : app.followUpDate || "—";
  return (
    <TableRow>
      <TableCell>
        <strong className="block">{app.company}</strong>
        <span className="mt-0.5 block text-xs text-muted-foreground">
          {app.role}
        </span>
      </TableCell>
      <TableCell>
        <Select
          value={app.stage}
          onValueChange={(value) => {
            if (value) onStageChange(value as Stage);
          }}
          items={stageItems}
        >
          <SelectTrigger
            size="sm"
            aria-label={`Change stage for ${app.company}`}
            className="min-w-36"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false} align="start">
            {allStages.map((stage) => (
              <SelectItem value={stage} key={stage}>
                {prettyStage(stage)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <strong className="block">{app.fit}/5</strong>
        <span className="mt-0.5 block text-xs text-muted-foreground">
          {app.fit >= 4
            ? "evidence-led"
            : app.fit <= 2
              ? "stretch"
              : "plausible"}
        </span>
      </TableCell>
      <TableCell className="max-w-xs whitespace-normal">
        {app.nextAction || (
          <em className="text-muted-foreground">Not defined</em>
        )}
      </TableCell>
      <TableCell
        className={cn(
          "text-xs font-medium",
          state === "due" && "text-amber-700",
          state === "stale" && "text-destructive",
          state === "none" && "text-muted-foreground",
        )}
      >
        {followUp}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          <Button variant="link" onClick={onEdit}>
            Review
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onDelete}
            aria-label={`Delete ${app.company}`}
          >
            <Trash2 />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function ApplicationDialog({
  application,
  onClose,
  onSave,
  onDelete,
}: {
  application: Application | null;
  onClose: () => void;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
  onDelete?: () => void;
}) {
  return (
    <Dialog open={!!application} onOpenChange={(open) => !open && onClose()}>
      {application && (
        <DialogContent
          className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"
          aria-describedby={undefined}
        >
          <form onSubmit={onSave} key={application.id}>
            <DialogHeader>
              <DialogDescription className="font-mono text-[11px] tracking-[0.08em] uppercase">
                Application
              </DialogDescription>
              <DialogTitle>
                {application.company ? "Review application" : "Add application"}
              </DialogTitle>
            </DialogHeader>
            <input type="hidden" name="id" value={application.id} />
            <div className="my-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                name="company"
                label="Company"
                required
                value={application.company}
              />
              <Field name="role" label="Role" required value={application.role} />
              <div className="grid gap-2">
                <Label htmlFor="stage">Stage</Label>
                <Select
                  name="stage"
                  defaultValue={application.stage}
                  items={stageItems}
                >
                  <SelectTrigger id="stage" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {allStages.map((stage) => (
                      <SelectItem value={stage} key={stage}>
                        {prettyStage(stage)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fit">Fit score (1–5)</Label>
                <Select
                  name="fit"
                  defaultValue={String(application.fit)}
                  items={fitItems}
                >
                  <SelectTrigger id="fit" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(fitItems).map(([value, label]) => (
                      <SelectItem value={value} key={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Field
                name="appliedDate"
                label="Applied date"
                type="date"
                value={application.appliedDate}
              />
              <Field
                name="followUpDate"
                label="Follow-up date"
                type="date"
                value={application.followUpDate}
              />
              <Field
                name="nextAction"
                label="Next action"
                className="sm:col-span-2"
                value={application.nextAction}
                placeholder="e.g. Follow up with recruiter"
              />
              <TextAreaField
                name="fitEvidence"
                label="Evidence of fit"
                value={application.fitEvidence}
                placeholder="Specific evidence, not a feeling."
              />
              <TextAreaField
                name="risks"
                label="Risks / gaps"
                value={application.risks}
                placeholder="What may make this a poor use of time?"
              />
              <TextAreaField
                name="learning"
                label="What I learned"
                value={application.learning}
                placeholder="Add after a screen, interview or outcome."
              />
            </div>
            <DialogFooter>
              {onDelete ? (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={onDelete}
                >
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

function Field({
  name,
  label,
  value,
  type = "text",
  className,
  ...props
}: {
  name: string;
  label: string;
  value: string;
  type?: string;
  className?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        defaultValue={value}
        type={type}
        {...props}
      />
    </div>
  );
}

function TextAreaField({
  name,
  label,
  value,
  ...props
}: {
  name: string;
  label: string;
  value: string;
  placeholder?: string;
}) {
  return (
    <div className="grid gap-2 sm:col-span-2">
      <Label htmlFor={name}>{label}</Label>
      <Textarea id={name} name={name} defaultValue={value} rows={3} {...props} />
    </div>
  );
}
