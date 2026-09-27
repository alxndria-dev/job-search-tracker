"use client";

import { ApplicationDialog } from "@/components/huntr/application-dialog";
import { DeleteApplicationDialog } from "@/components/huntr/delete-application-dialog";
import {
  ImportErrorDialog,
  ImportReplaceDialog,
} from "@/components/huntr/import-dialogs";
import { MetricsCards } from "@/components/huntr/metrics-cards";
import { PageHeader } from "@/components/huntr/page-header";
import { PipelineTable } from "@/components/huntr/pipeline-table";
import { TimelineDialog } from "@/components/huntr/timeline-dialog";
import { useApplications } from "@/hooks/use-applications";
import { blank } from "@/lib/pipeline";

export default function Home() {
  const {
    applications,
    query,
    setQuery,
    stageFilter,
    setStageFilter,
    actionFilter,
    setActionFilter,
    hideClosed,
    setHideClosed,
    editing,
    setEditing,
    pendingDelete,
    setPendingDelete,
    sort,
    toggleSort,
    visible,
    active,
    due,
    stale,
    noAction,
    timelineApplication,
    setTimelineId,
    upsertApplication,
    saveApplication,
    updateStage,
    updateStatus,
    updateFit,
    updateSentiment,
    deleteApplication,
    importData,
    pendingImport,
    setPendingImport,
    confirmImport,
    importError,
    setImportError,
    exportData,
  } = useApplications();

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 pb-16 sm:px-7">
      <PageHeader
        onExport={exportData}
        onImport={importData}
        onAdd={() => setEditing(blank())}
      />
      <MetricsCards
        activeCount={active.length}
        due={due}
        stale={stale}
        noAction={noAction}
        hideClosed={hideClosed}
        query={query}
        stageFilter={stageFilter}
        actionFilter={actionFilter}
        onActiveOpportunities={() => {
          setHideClosed(true);
          setQuery("");
          setStageFilter("all");
          setActionFilter("all");
        }}
        onActionFilter={setActionFilter}
      />
      {/* <WeeklyReality active={active} applications={applications} /> */}
      <PipelineTable
        applications={visible}
        query={query}
        onQueryChange={setQuery}
        stageFilter={stageFilter}
        onStageFilterChange={setStageFilter}
        actionFilter={actionFilter}
        onActionFilterChange={setActionFilter}
        hideClosed={hideClosed}
        onHideClosedChange={setHideClosed}
        sort={sort}
        onSort={toggleSort}
        onEdit={setEditing}
        onStageChange={updateStage}
        onStatusChange={updateStatus}
        onFitChange={updateFit}
        onSentimentChange={updateSentiment}
        onTimeline={setTimelineId}
        onDelete={setPendingDelete}
      />
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
        isNew={
          !!editing && !applications.some((item) => item.id === editing.id)
        }
      />
      <TimelineDialog
        application={timelineApplication}
        onClose={() => setTimelineId(null)}
        onChange={upsertApplication}
      />
      <DeleteApplicationDialog
        application={pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        onConfirm={() =>
          pendingDelete && deleteApplication(pendingDelete.id)
        }
      />
      <ImportReplaceDialog
        applications={pendingImport}
        onOpenChange={(open) => !open && setPendingImport(null)}
        onConfirm={confirmImport}
      />
      <ImportErrorDialog
        message={importError}
        onOpenChange={(open) => !open && setImportError(null)}
      />
    </main>
  );
}
