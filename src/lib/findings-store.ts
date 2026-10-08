import type { Finding } from "./types";

const KEY = "personas.findings";
const listeners = new Set<() => void>();

/**
 * Findings are the exit from the research: quotes a client pins while
 * interviewing, held across every conversation in the project. Like the
 * transcripts they live in the browser, so they are an external store rather
 * than component state, and survive a reload the way saved work has to.
 */

/** Stable reference so useSyncExternalStore never loops. Replaced on write. */
let current: Finding[] | null = null;
const EMPTY: Finding[] = [];

function load(): Finding[] {
  if (current) return current;
  if (typeof window === "undefined") return EMPTY;

  const stored = window.localStorage.getItem(KEY);
  if (stored) {
    try {
      current = JSON.parse(stored) as Finding[];
      return current;
    } catch {
      // A corrupt entry should not take the findings drawer down with it.
    }
  }
  current = EMPTY;
  return current;
}

function commit(next: Finding[]): void {
  current = next;
  window.localStorage.setItem(KEY, JSON.stringify(next));
  for (const listener of listeners) listener();
}

export function subscribeFindings(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function readFindings(): Finding[] {
  return load();
}

/** Server render has no browser storage, so it always sees an empty list. */
export function serverFindings(): Finding[] {
  return EMPTY;
}

/** One saved finding per message: the message id is the toggle's identity. */
export function findingIdFor(messageId: string): string {
  return `fnd_${messageId}`;
}

export function isSaved(messageId: string): boolean {
  const id = findingIdFor(messageId);
  return load().some((finding) => finding.id === id);
}

export function toggleFinding(finding: Finding): void {
  const existing = load();
  const without = existing.filter((entry) => entry.id !== finding.id);
  if (without.length !== existing.length) {
    commit(without);
    return;
  }
  commit([finding, ...existing]);
}

export function removeFinding(id: string): void {
  commit(load().filter((finding) => finding.id !== id));
}
