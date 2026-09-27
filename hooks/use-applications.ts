import { useEffect, useMemo, useState } from "react";

import {
  type Application,
  type ApplicationStatus,
  type CurrentStage,
  type Sentiment,
  appendStageEvent,
  applySentiment,
  applyStatus,
  hideClosedStorageKey,
  isLikelyJsonImportFile,
  loadApplications,
  parseImportedApplications,
  IMPORT_LIMITS,
  storageKey,
  toISO,
} from "@/lib/applications";
import { today } from "@/lib/dates";
import {
  type SortColumn,
  type SortState,
  actionState,
  compareApplications,
  filterVisible,
} from "@/lib/pipeline";
import { seed } from "@/lib/seed";

export function useApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [hideClosed, setHideClosed] = useState(false);
  const [editing, setEditing] = useState<Application | null>(null);
  const [timelineId, setTimelineId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Application | null>(null);
  const [pendingImport, setPendingImport] = useState<Application[] | null>(
    null,
  );
  const [importError, setImportError] = useState<string | null>(null);
  const [sort, setSort] = useState<SortState>(null);

  useEffect(() => {
    setApplications(loadApplications(seed, toISO(today)));
    setHideClosed(localStorage.getItem(hideClosedStorageKey) === "true");
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(applications));
    } catch {
      /* quota or private-mode write failures */
    }
  }, [applications, ready]);
  useEffect(() => {
    if (ready) localStorage.setItem(hideClosedStorageKey, String(hideClosed));
  }, [hideClosed, ready]);

  const active = applications.filter((app) => app.state === "active");
  const due = active.filter((app) => actionState(app) === "due").length;
  const stale = active.filter((app) => actionState(app) === "stale").length;
  const noAction = active.filter((app) => actionState(app) === "none").length;

  const visible = useMemo(() => {
    const filtered = filterVisible(applications, {
      query,
      stageFilter,
      actionFilter,
      hideClosed,
    });
    if (!sort) return filtered;
    const direction = sort.direction === "asc" ? 1 : -1;
    return [...filtered].sort(
      (a, b) => compareApplications(a, b, sort.column) * direction,
    );
  }, [applications, query, stageFilter, actionFilter, hideClosed, sort]);

  const toggleSort = (column: SortColumn) => {
    setSort((current) => {
      if (current?.column !== column) return { column, direction: "asc" };
      if (current.direction === "asc") return { column, direction: "desc" };
      return null;
    });
  };

  const timelineApplication =
    applications.find((app) => app.id === timelineId) ?? null;

  const upsertApplication = (app: Application) => {
    setApplications((current) =>
      current.some((item) => item.id === app.id)
        ? current.map((item) => (item.id === app.id ? app : item))
        : [app, ...current],
    );
  };

  const saveApplication = (app: Application) => {
    upsertApplication(app);
    setEditing(null);
  };

  const updateStage = (id: string, stage: CurrentStage) => {
    setApplications((current) =>
      current.map((item) =>
        item.id === id ? appendStageEvent(item, stage, toISO(today)) : item,
      ),
    );
  };

  const updateStatus = (id: string, status: ApplicationStatus) => {
    setApplications((current) =>
      current.map((item) =>
        item.id === id ? applyStatus(item, status, toISO(today)) : item,
      ),
    );
  };

  const updateFit = (id: string, fit: number) => {
    setApplications((current) =>
      current.map((item) => (item.id === id ? { ...item, fit } : item)),
    );
  };

  const updateSentiment = (id: string, sentiment: Sentiment) => {
    setApplications((current) =>
      current.map((item) =>
        item.id === id ? applySentiment(item, sentiment, toISO(today)) : item,
      ),
    );
  };

  const deleteApplication = (id: string) => {
    setApplications((current) => current.filter((item) => item.id !== id));
    if (editing?.id === id) setEditing(null);
    if (timelineId === id) setTimelineId(null);
    setPendingDelete(null);
  };

  const applyImport = (imported: Application[]) => {
    setApplications(imported);
    setEditing(null);
    setTimelineId(null);
    setPendingDelete(null);
    setPendingImport(null);
  };

  const importData = async (file: File) => {
    try {
      if (file.size > IMPORT_LIMITS.maxBytes) {
        throw new Error("This file is too large to import.");
      }
      if (!isLikelyJsonImportFile(file)) {
        throw new Error("Import only accepts a JSON file from Export data.");
      }
      const imported = parseImportedApplications(
        await file.text(),
        toISO(today),
      );
      if (applications.length) {
        setPendingImport(imported);
        return;
      }
      applyImport(imported);
    } catch (error) {
      setImportError(
        error instanceof Error
          ? error.message
          : "This file could not be imported.",
      );
    }
  };

  const confirmImport = () => {
    if (pendingImport) applyImport(pendingImport);
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(applications, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `jobtrackr-backup-${toISO(today)}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return {
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
  };
}
