const listeners = new Set<() => void>();
let sourcesOpen = false;

/**
 * Whether the sources column is showing. It lives outside the components
 * because the control sits in the conversation and the column itself is a peer
 * of it in the layout, so neither owns the other.
 */
export function subscribeUi(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSourcesOpen(): boolean {
  return sourcesOpen;
}

export function setSourcesOpen(next: boolean): void {
  sourcesOpen = next;
  for (const listener of listeners) listener();
}
