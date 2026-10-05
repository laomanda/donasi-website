import type {
  FinancialNote,
  FinancialNoteSummary,
} from "@/types/finance";
import { invalidateBalanceSheetCache } from "./balanceSheetCache";
import { invalidateActivityStatementCache } from "./activityStatementCache";

export const FINANCIAL_NOTES_FRESH_TTL_MS = 60 * 1000; // 60 seconds
export const FINANCIAL_NOTES_MAX_STALE_TTL_MS = 5 * 60 * 1000; // 5 minutes
export const FINANCIAL_NOTES_SUMMARY_FRESH_TTL_MS = 90 * 1000; // 90 seconds
export const FINANCIAL_NOTES_DETAIL_FRESH_TTL_MS = 90 * 1000; // 90 seconds

const MAX_LIST_ENTRIES = 30;
const MAX_SUMMARY_ENTRIES = 20;
const MAX_DETAIL_ENTRIES = 50;

export interface FinancialNotesCacheEntry<T> {
  data: T;
  timestamp: number;
}

// In-memory cache stores
const notesListCache = new Map<string, FinancialNotesCacheEntry<FinancialNote[]>>();
const notesSummaryCache = new Map<string, FinancialNotesCacheEntry<FinancialNoteSummary>>();
const noteDetailCache = new Map<string, FinancialNotesCacheEntry<FinancialNote>>();

// In-flight request maps for deduplication
const inFlightNotesRequests = new Map<string, Promise<FinancialNote[]>>();
const inFlightSummaryRequests = new Map<string, Promise<FinancialNoteSummary>>();
const inFlightDetailRequests = new Map<string, Promise<FinancialNote>>();

// Helper to check freshness
export function isFinancialNoteCacheFresh<T>(
  entry: FinancialNotesCacheEntry<T> | null | undefined,
  ttlMs = FINANCIAL_NOTES_FRESH_TTL_MS
): boolean {
  if (!entry) return false;
  return Date.now() - entry.timestamp < ttlMs;
}

export function isFinancialNoteCacheValid<T>(
  entry: FinancialNotesCacheEntry<T> | null | undefined,
  maxStaleMs = FINANCIAL_NOTES_MAX_STALE_TTL_MS
): boolean {
  if (!entry) return false;
  return Date.now() - entry.timestamp < maxStaleMs;
}

// 1. Notes List Cache Accessors
export function getFinancialNotesListCache(key: string): FinancialNotesCacheEntry<FinancialNote[]> | null {
  const entry = notesListCache.get(key);
  if (!entry) return null;
  if (!isFinancialNoteCacheValid(entry)) {
    notesListCache.delete(key);
    return null;
  }
  return entry;
}

export function setFinancialNotesListCache(key: string, data: FinancialNote[]): void {
  if (notesListCache.size >= MAX_LIST_ENTRIES) {
    const oldestKey = notesListCache.keys().next().value;
    if (oldestKey) notesListCache.delete(oldestKey);
  }
  notesListCache.set(key, { data, timestamp: Date.now() });
}

export function getFinancialNotesInFlight(key: string): Promise<FinancialNote[]> | undefined {
  return inFlightNotesRequests.get(key);
}

export function setFinancialNotesInFlight(key: string, promise: Promise<FinancialNote[]> | null): void {
  if (promise) {
    inFlightNotesRequests.set(key, promise);
  } else {
    inFlightNotesRequests.delete(key);
  }
}

// 2. Summary Cache Accessors
export function getFinancialNotesSummaryCache(key: string): FinancialNotesCacheEntry<FinancialNoteSummary> | null {
  const entry = notesSummaryCache.get(key);
  if (!entry) return null;
  if (!isFinancialNoteCacheValid(entry)) {
    notesSummaryCache.delete(key);
    return null;
  }
  return entry;
}

export function setFinancialNotesSummaryCache(key: string, data: FinancialNoteSummary): void {
  if (notesSummaryCache.size >= MAX_SUMMARY_ENTRIES) {
    const oldestKey = notesSummaryCache.keys().next().value;
    if (oldestKey) notesSummaryCache.delete(oldestKey);
  }
  notesSummaryCache.set(key, { data, timestamp: Date.now() });
}

export function getFinancialNotesSummaryInFlight(key: string): Promise<FinancialNoteSummary> | undefined {
  return inFlightSummaryRequests.get(key);
}

export function setFinancialNotesSummaryInFlight(key: string, promise: Promise<FinancialNoteSummary> | null): void {
  if (promise) {
    inFlightSummaryRequests.set(key, promise);
  } else {
    inFlightSummaryRequests.delete(key);
  }
}

// 3. Detail Cache Accessors
export function getFinancialNoteDetailCache(key: string): FinancialNotesCacheEntry<FinancialNote> | null {
  const entry = noteDetailCache.get(key);
  if (!entry) return null;
  if (!isFinancialNoteCacheValid(entry)) {
    noteDetailCache.delete(key);
    return null;
  }
  return entry;
}

export function setFinancialNoteDetailCache(key: string, data: FinancialNote): void {
  if (noteDetailCache.size >= MAX_DETAIL_ENTRIES) {
    const oldestKey = noteDetailCache.keys().next().value;
    if (oldestKey) noteDetailCache.delete(oldestKey);
  }
  noteDetailCache.set(key, { data, timestamp: Date.now() });
}

export function getFinancialNoteDetailInFlight(key: string): Promise<FinancialNote> | undefined {
  return inFlightDetailRequests.get(key);
}

export function setFinancialNoteDetailInFlight(key: string, promise: Promise<FinancialNote> | null): void {
  if (promise) {
    inFlightDetailRequests.set(key, promise);
  } else {
    inFlightDetailRequests.delete(key);
  }
}

// Invalidation Helpers
export function invalidateFinancialNotesListCache(): void {
  notesListCache.clear();
  inFlightNotesRequests.clear();
}

export function invalidateFinancialNotesSummaryCache(): void {
  notesSummaryCache.clear();
  inFlightSummaryRequests.clear();
}

export function invalidateFinancialNoteDetailCache(id?: number | string): void {
  if (id !== undefined) {
    const key = `finance:financial-note:${id}`;
    noteDetailCache.delete(key);
    inFlightDetailRequests.delete(key);
  } else {
    noteDetailCache.clear();
    inFlightDetailRequests.clear();
  }
}

/**
 * Complete mutation invalidation for Financial Notes.
 * Also invalidates Balance Sheet and Activity Statement caches so embedded notes are refreshed.
 */
export function invalidateAllFinancialNotesCache(noteId?: number | string): void {
  invalidateFinancialNotesListCache();
  invalidateFinancialNotesSummaryCache();
  if (noteId !== undefined) {
    invalidateFinancialNoteDetailCache(noteId);
  } else {
    invalidateFinancialNoteDetailCache();
  }

  // Cross-finance cache invalidation for statement pages embedding CLK notes
  try {
    invalidateBalanceSheetCache();
    invalidateActivityStatementCache();
  } catch {
    // Graceful fallback if caches not initialized
  }
}
