import { useEffect, useMemo, useState } from "react";

import {
  IMPORT_LIMITS,
  isLikelyJsonImportFile,
  toISO,
} from "@/lib/applications";
import { today } from "@/lib/dates";
import { type SortColumn, type SortState } from "@/lib/pipeline";
import {
  type WatchlistItem,
  compareWatchlist,
  filterWatchlist,
  loadWatchlist,
  parseImportedWatchlist,
  watchlistExportKind,
  watchlistSeed,
  watchlistStorageKey,
} from "@/lib/watchlist";

export function useWatchlist() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortState>(null);
  const [editing, setEditing] = useState<WatchlistItem | null>(null);
  const [pendingDelete, setPendingDelete] = useState<WatchlistItem | null>(
    null,
  );
  const [pendingImport, setPendingImport] = useState<WatchlistItem[] | null>(
    null,
  );
  const [importError, setImportError] = useState<string | null>(null);

  useEffect(() => {
    setItems(loadWatchlist(watchlistSeed));
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(watchlistStorageKey, JSON.stringify(items));
    } catch {
      /* quota or private-mode write failures */
    }
  }, [items, ready]);

  const visible = useMemo(() => {
    const filtered = filterWatchlist(items, query);
    if (!sort) return filtered;
    const direction = sort.direction === "asc" ? 1 : -1;
    const column = sort.column;
    if (column !== "opportunity" && column !== "added" && column !== "fit")
      return filtered;
    return [...filtered].sort(
      (a, b) => compareWatchlist(a, b, column) * direction,
    );
  }, [items, query, sort]);

  const toggleSort = (column: SortColumn) => {
    setSort((current) => {
      if (current?.column !== column) return { column, direction: "asc" };
      if (current.direction === "asc") return { column, direction: "desc" };
      return null;
    });
  };

  const saveItem = (item: WatchlistItem) => {
    setItems((current) =>
      current.some((entry) => entry.id === item.id)
        ? current.map((entry) => (entry.id === item.id ? item : entry))
        : [item, ...current],
    );
    setEditing(null);
  };

  const updateFit = (id: string, fit: number) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, fit } : item)),
    );
  };

  const deleteItem = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
    if (editing?.id === id) setEditing(null);
    setPendingDelete(null);
  };

  const applyImport = (imported: WatchlistItem[]) => {
    setItems(imported);
    setEditing(null);
    setPendingDelete(null);
    setPendingImport(null);
  };

  const importData = async (file: File) => {
    try {
      if (file.size > IMPORT_LIMITS.maxBytes) {
        throw new Error("This file is too large to import.");
      }
      if (!isLikelyJsonImportFile(file)) {
        throw new Error(
          "Import only accepts a JSON file from Export watchlist.",
        );
      }
      const imported = parseImportedWatchlist(await file.text());
      if (items.length) {
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
    const blob = new Blob(
      [JSON.stringify({ kind: watchlistExportKind, items }, null, 2)],
      { type: "application/json" },
    );
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `jobtrackr-watchlist-${toISO(today)}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return {
    items,
    query,
    setQuery,
    sort,
    toggleSort,
    visible,
    editing,
    setEditing,
    pendingDelete,
    setPendingDelete,
    saveItem,
    updateFit,
    deleteItem,
    importData,
    pendingImport,
    setPendingImport,
    confirmImport,
    importError,
    setImportError,
    exportData,
  };
}
