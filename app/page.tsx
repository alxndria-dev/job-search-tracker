"use client";

import { useEffect, useState } from "react";

import { ApplicationDialog } from "@/components/application-dialog";
import { DeleteApplicationDialog } from "@/components/delete-application-dialog";
import { DeleteWatchlistDialog } from "@/components/delete-watchlist-dialog";
import {
  ImportErrorDialog,
  ImportReplaceDialog,
} from "@/components/import-dialogs";
import { MetricsCards } from "@/components/metrics-cards";
import { PageHeader } from "@/components/page-header";
import { PipelineTable } from "@/components/pipeline-table";
import { type PipelineView, pipelineViewStorageKey } from "@/components/pipeline-tabs";
import { TimelineDialog } from "@/components/timeline-dialog";
import { WatchlistDialog } from "@/components/watchlist-dialog";
import { WatchlistTable } from "@/components/watchlist-table";
import { useApplications } from "@/hooks/use-applications";
import { useWatchlist } from "@/hooks/use-watchlist";
import { blank } from "@/lib/pipeline";
import { applicationFromWatchlist, blankWatchlist } from "@/lib/watchlist";

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
  const watchlist = useWatchlist();
  const [view, setView] = useState<PipelineView>("applications");
  const [viewReady, setViewReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(pipelineViewStorageKey);
    if (stored === "watchlist") setView("watchlist");
    setViewReady(true);
  }, []);
  useEffect(() => {
    if (viewReady) localStorage.setItem(pipelineViewStorageKey, view);
  }, [view, viewReady]);

  const showApplications = () => setView("applications");

  return (
    <main className="mx-auto flex h-svh max-w-7xl flex-col overflow-hidden px-4 py-8 sm:px-7">
      <PageHeader />
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
          showApplications();
          setHideClosed(true);
          setQuery("");
          setStageFilter("all");
          setActionFilter("all");
        }}
        onActionFilter={(value) => {
          showApplications();
          setActionFilter(value);
        }}
      />
      {view === "watchlist" ? (
        <WatchlistTable
          items={watchlist.visible}
          query={watchlist.query}
          onQueryChange={watchlist.setQuery}
          sort={watchlist.sort}
          onSort={watchlist.toggleSort}
          view={view}
          onViewChange={setView}
          onAdd={() => watchlist.setEditing(blankWatchlist())}
          onApplied={(item) => {
            upsertApplication(applicationFromWatchlist(item));
            watchlist.deleteItem(item.id);
            showApplications();
          }}
          onEdit={watchlist.setEditing}
          onFitChange={(item, fit) => watchlist.updateFit(item.id, fit)}
          onDelete={watchlist.setPendingDelete}
        />
      ) : (
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
          onExport={exportData}
          onImport={importData}
          onAdd={() => setEditing(blank())}
          view={view}
          onViewChange={setView}
        />
      )}
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
      <WatchlistDialog
        item={watchlist.editing}
        isNew={
          !!watchlist.editing &&
          !watchlist.items.some((item) => item.id === watchlist.editing?.id)
        }
        onClose={() => watchlist.setEditing(null)}
        onSave={watchlist.saveItem}
        onDelete={
          watchlist.editing &&
          watchlist.items.some((item) => item.id === watchlist.editing?.id)
            ? () => {
                watchlist.setPendingDelete(watchlist.editing);
                watchlist.setEditing(null);
              }
            : undefined
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
      <DeleteWatchlistDialog
        item={watchlist.pendingDelete}
        onOpenChange={(open) => !open && watchlist.setPendingDelete(null)}
        onConfirm={() =>
          watchlist.pendingDelete &&
          watchlist.deleteItem(watchlist.pendingDelete.id)
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
