import {
  type Application,
  IMPORT_LIMITS,
  jobUrlHref,
  toISO,
} from "@/lib/applications";
import { offset, today } from "@/lib/dates";
import { blank } from "@/lib/pipeline";

export type WatchlistItem = {
  id: string;
  company: string;
  role: string;
  jobUrl: string;
  addedDate: string;
};

export const watchlistStorageKey = "jobtrackr-watchlist-v1";

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

const clip = (value: string, max: number) =>
  value.length <= max ? value : value.slice(0, max);

const sanitizeId = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > IMPORT_LIMITS.maxId) return "";
  if (/[\0-\x1f\x7f]/.test(trimmed)) return "";
  return trimmed;
};

const sanitizeIsoDate = (value: string, fallback: string) => {
  const trimmed = value.trim();
  return isoDatePattern.test(trimmed) ? trimmed : fallback;
};

export const blankWatchlist = (): WatchlistItem => ({
  id: crypto.randomUUID(),
  company: "",
  role: "",
  jobUrl: "",
  addedDate: toISO(today),
});

export const applicationFromWatchlist = (
  item: WatchlistItem,
): Application => ({
  ...blank(),
  company: item.company,
  role: item.role,
  jobUrl: item.jobUrl,
});

export const normalizeWatchlistItem = (
  item: WatchlistItem,
): WatchlistItem => ({
  id: clip(item.id, IMPORT_LIMITS.maxId),
  company: clip(item.company.trim(), IMPORT_LIMITS.maxShort),
  role: clip(item.role.trim(), IMPORT_LIMITS.maxShort),
  jobUrl: clip(item.jobUrl.trim(), IMPORT_LIMITS.maxUrl),
  addedDate: sanitizeIsoDate(item.addedDate, toISO(today)),
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export const parseWatchlistPayload = (parsed: unknown): WatchlistItem[] => {
  if (!Array.isArray(parsed)) return [];
  const seen = new Set<string>();
  return parsed.flatMap((item) => {
    if (!isRecord(item)) return [];
    if (typeof item.id !== "string") return [];
    if (typeof item.company !== "string") return [];
    const id = sanitizeId(item.id);
    const company = item.company.trim();
    if (!id || !company || seen.has(id)) return [];
    seen.add(id);
    return [
      normalizeWatchlistItem({
        id,
        company,
        role: typeof item.role === "string" ? item.role : "",
        jobUrl: typeof item.jobUrl === "string" ? item.jobUrl : "",
        addedDate: typeof item.addedDate === "string" ? item.addedDate : "",
      }),
    ];
  });
};

export const loadWatchlist = (seed: WatchlistItem[]): WatchlistItem[] => {
  const current = localStorage.getItem(watchlistStorageKey);
  if (current === null) return seed;
  try {
    return parseWatchlistPayload(JSON.parse(current));
  } catch {
    return seed;
  }
};

export const watchlistHref = jobUrlHref;

export const compareWatchlist = (
  a: WatchlistItem,
  b: WatchlistItem,
  column: "opportunity" | "added",
) => {
  if (column === "added") return a.addedDate.localeCompare(b.addedDate);
  return (
    a.company.localeCompare(b.company, undefined, { sensitivity: "base" }) ||
    a.role.localeCompare(b.role, undefined, { sensitivity: "base" })
  );
};

export const filterWatchlist = (items: WatchlistItem[], query: string) =>
  items.filter((item) =>
    `${item.company} ${item.role}`.toLowerCase().includes(query.toLowerCase()),
  );

export const watchlistSeed: WatchlistItem[] = [
  {
    id: "moss-reed",
    company: "Moss & Reed",
    role: "Product Designer",
    jobUrl: "https://mossreed.example/jobs/product-designer",
    addedDate: offset(-2),
  },
  {
    id: "bluekiln",
    company: "Bluekiln",
    role: "",
    jobUrl: "https://bluekiln.example/careers",
    addedDate: offset(-8),
  },
  {
    id: "paperroute",
    company: "Paperroute",
    role: "Senior Product Designer",
    jobUrl: "",
    addedDate: offset(-14),
  },
];
