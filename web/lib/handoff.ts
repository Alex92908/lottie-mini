// Cross-page in-memory file handoff.
//
// When the user clicks "Try the Compressor" on /inspect with a file already
// loaded, we don't want to make them drop the file again on /compress.
// We can't pass 70 MB through router state, sessionStorage limits are too
// small, and serializing the whole tree is wasteful.
//
// Solution: a module singleton. Next.js App Router uses client-side
// navigation by default (<Link> / router.push), which keeps modules alive
// across route changes. The receiving page consumes-and-clears.

interface Handoff {
  json: Record<string, unknown>;
  fileName: string;
  /** Source byte size; if unknown, the consumer can recompute via JSON.stringify. */
  size?: number;
}

let pending: Handoff | null = null;

export function setHandoff(h: Handoff): void {
  pending = h;
}

export function consumeHandoff(): Handoff | null {
  const h = pending;
  pending = null;
  return h;
}

export function peekHandoff(): Handoff | null {
  return pending;
}
