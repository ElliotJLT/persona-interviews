import type { Citation, Message } from "./types";

export interface Transcript {
  messages: Message[];
  citations: Citation[];
}

const KEY = "personas.interview.";
const listeners = new Set<() => void>();
const cache = new Map<string, Transcript>();

/**
 * Transcripts live in the browser, which makes them an external store rather
 * than component state. Reading them through this module keeps the server
 * render and the hydrated render in agreement, and means a saved interview is
 * still there after a reload, which is the whole point of saving it.
 */
export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function readTranscript(id: string, seed: Transcript): Transcript {
  const cached = cache.get(id);
  if (cached) return cached;

  if (typeof window !== "undefined") {
    const stored = window.localStorage.getItem(KEY + id);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Transcript;
        cache.set(id, parsed);
        return parsed;
      } catch {
        // A corrupt entry should not take the interview down with it.
      }
    }
  }

  cache.set(id, seed);
  return seed;
}

export function writeTranscript(id: string, next: Transcript): void {
  cache.set(id, next);
  window.localStorage.setItem(KEY + id, JSON.stringify(next));
  for (const listener of listeners) listener();
}

/** Start over: drop the stored thread so the interview reopens empty. */
export function clearTranscript(id: string): void {
  const empty: Transcript = { messages: [], citations: [] };
  cache.set(id, empty);
  window.localStorage.setItem(KEY + id, JSON.stringify(empty));
  for (const listener of listeners) listener();
}

/** Impure by nature, so kept out of component bodies. */
export function messageId(suffix = ""): string {
  return `msg_${Date.now().toString(36)}${suffix}`;
}

export function timestamp(): string {
  return new Date().toISOString();
}
