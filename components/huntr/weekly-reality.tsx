import { type ReactNode } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type Application } from "@/lib/applications";
import { cn } from "@/lib/utils";

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

export function WeeklyReality({
  active,
  applications,
}: {
  active: Application[];
  applications: Application[];
}) {
  const weakFitCount = active.filter((app) => app.fit <= 2).length;
  const momentumCount = applications.filter((app) =>
    ["interview", "test_task", "final", "offer"].includes(app.currentStage),
  ).length;
  const missingEvidence = active.some((app) => !app.fitEvidence.trim());

  return (
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
          tone={missingEvidence ? "danger" : undefined}
        >
          {missingEvidence
            ? "At least one active application has no written proof of fit. If you cannot name it, it is probably not a strong target."
            : "Every active application has recorded fit evidence."}
        </Reality>
      </CardContent>
    </Card>
  );
}
