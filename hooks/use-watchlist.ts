import { useEffect, useMemo, useState } from "react";

import { type SortColumn, type SortState } from "@/lib/pipeline";
import {
  type WatchlistItem,
  compareWatchlist,
  filterWatchlist,
  loadWatchlist,
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
    if (column !== "opportunity" && column !== "added") return filtered;
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

  const deleteItem = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
    if (editing?.id === id) setEditing(null);
    setPendingDelete(null);
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
    deleteItem,
  };
}
