import { type ReactNode } from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type PipelineView = "applications" | "watchlist";

export const pipelineViewStorageKey = "jobtrackr-pipeline-view";

export function PipelineTabs({
  view,
  onViewChange,
}: {
  view: PipelineView;
  onViewChange: (view: PipelineView) => void;
}) {
  const tabs: { id: PipelineView; label: string }[] = [
    { id: "applications", label: "Applications" },
    { id: "watchlist", label: "Watchlist" },
  ];
  return (
    <div
      role="tablist"
      aria-label="Pipeline views"
      className="flex w-full items-end justify-center gap-1 px-px max-md:ml-0 md:ml-10 md:w-auto md:justify-start"
    >
      {tabs.map((tab) => {
        const selected = view === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`${tab.id}-tab`}
            aria-controls="pipeline"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            className={cn(
              "relative rounded-t-xl px-5 py-3 text-base font-medium transition-colors",
              selected
                ? "z-10 -mb-px border border-b-0 border-foreground/10 bg-card text-foreground"
                : "border border-transparent border-b-0 text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )}
            onClick={() => onViewChange(tab.id)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export function PipelinePanel({
  view,
  onViewChange,
  toolbar,
  filters,
  children,
}: {
  view: PipelineView;
  onViewChange: (view: PipelineView) => void;
  toolbar: ReactNode;
  filters?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="mt-5 flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:justify-between">
        <div className="flex w-full flex-wrap justify-end gap-2.5 md:order-2 md:w-auto">
          {toolbar}
        </div>
        <PipelineTabs view={view} onViewChange={onViewChange} />
      </div>
      <Card
        id="pipeline"
        role="tabpanel"
        aria-labelledby={`${view}-tab`}
        className="min-h-0 flex-1 overflow-hidden rounded-xl border border-foreground/10 ring-0"
      >
        {filters ? (
          <CardHeader className="shrink-0 gap-4">{filters}</CardHeader>
        ) : null}
        <CardContent className="min-h-0 flex-1 overflow-auto">
          {children}
        </CardContent>
      </Card>
    </section>
  );
}
