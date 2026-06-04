// Tiny structural patch system for editing arbitrary JSON.
//
// Why not bring in json-patch / immer?
//   - json-patch (RFC 6902) operates on JSON Pointer strings; we want
//     compile-time-safe structural arrays and tight Lottie integration.
//   - immer adds ~20 KB minified for what is, here, ~80 lines of code.
//
// Path representation: ["assets", 0, "p"] — strings index objects,
// numbers index arrays. Empty path [] = the root itself.
//
// All operations return a NEW root (structural sharing on the spine to
// the edit, deep-copy is avoided so a 70 MB tree stays performant).

export type JsonValue =
  | string | number | boolean | null
  | JsonValue[]
  | { [k: string]: JsonValue };

export type Path = (string | number)[];

export type Patch =
  | { op: "set"; path: Path; value: JsonValue }
  | { op: "delete"; path: Path }
  | { op: "insert"; parent: Path; key: string | number; value: JsonValue };

// ---- helpers ----

function getAt(root: JsonValue, path: Path): JsonValue {
  let cur: JsonValue = root;
  for (const seg of path) {
    if (cur == null || typeof cur !== "object") {
      throw new Error(`Path broken at segment "${String(seg)}"`);
    }
    cur = (cur as Record<string | number, JsonValue>)[seg as never];
  }
  return cur;
}

/** Clone container along the spine to `path` and return new root + parent at path. */
function cloneSpine(root: JsonValue, path: Path): { newRoot: JsonValue; ptr: JsonValue } {
  if (path.length === 0) {
    // Cloning whole root — caller will replace via set.
    return Array.isArray(root)
      ? { newRoot: [...root], ptr: [...root] }
      : root && typeof root === "object"
      ? { newRoot: { ...root }, ptr: { ...root } }
      : { newRoot: root, ptr: root };
  }
  // Walk down, cloning each container.
  const cloneOne = (v: JsonValue): JsonValue =>
    Array.isArray(v) ? [...v] : v && typeof v === "object" ? { ...v } : v;

  const newRoot = cloneOne(root);
  let ptr = newRoot;
  for (let i = 0; i < path.length - 1; i++) {
    const seg = path[i];
    const child = cloneOne((ptr as Record<string | number, JsonValue>)[seg as never]);
    (ptr as Record<string | number, JsonValue>)[seg as never] = child;
    ptr = child;
  }
  return { newRoot, ptr };
}

// ---- public ops ----

export function applyPatch(root: JsonValue, patch: Patch): JsonValue {
  if (patch.op === "set") {
    if (patch.path.length === 0) return patch.value;
    const { newRoot, ptr } = cloneSpine(root, patch.path);
    const last = patch.path[patch.path.length - 1];
    (ptr as Record<string | number, JsonValue>)[last as never] = patch.value;
    return newRoot;
  }
  if (patch.op === "delete") {
    if (patch.path.length === 0) {
      throw new Error("Cannot delete root");
    }
    const { newRoot, ptr } = cloneSpine(root, patch.path);
    const last = patch.path[patch.path.length - 1];
    if (Array.isArray(ptr)) {
      (ptr as JsonValue[]).splice(last as number, 1);
    } else {
      delete (ptr as Record<string, JsonValue>)[last as string];
    }
    return newRoot;
  }
  // insert: add into a container at `parent`
  const parentClone = cloneSpine(root, patch.parent);
  const parent = parentClone.ptr;
  if (Array.isArray(parent)) {
    const idx = Math.min(Math.max(0, patch.key as number), parent.length);
    parent.splice(idx, 0, patch.value);
  } else if (parent && typeof parent === "object") {
    (parent as Record<string, JsonValue>)[patch.key as string] = patch.value;
  } else {
    throw new Error("Insert target is not a container");
  }
  return parentClone.newRoot;
}

/** Produce the inverse patch BEFORE applying `patch` to `root`. */
export function invertPatch(root: JsonValue, patch: Patch): Patch {
  if (patch.op === "set") {
    const prev = getAt(root, patch.path);
    return { op: "set", path: patch.path, value: prev };
  }
  if (patch.op === "delete") {
    const prev = getAt(root, patch.path);
    const parent = patch.path.slice(0, -1);
    return { op: "insert", parent, key: patch.path[patch.path.length - 1], value: prev };
  }
  // insert → delete the inserted slot afterwards
  return { op: "delete", path: [...patch.parent, patch.key] };
}

// ---- history ----

export interface History {
  past: Patch[];   // inverse patches (apply to undo)
  future: Patch[]; // forward patches (apply to redo)
}

export const emptyHistory = (): History => ({ past: [], future: [] });

/** Apply a patch to root + record the inverse for undo. Clears redo stack. */
export function commit(
  root: JsonValue,
  patch: Patch,
  hist: History,
  limit = 100,
): { root: JsonValue; hist: History } {
  const inverse = invertPatch(root, patch);
  const newRoot = applyPatch(root, patch);
  const past = [...hist.past, inverse];
  if (past.length > limit) past.shift();
  return { root: newRoot, hist: { past, future: [] } };
}

export function undo(
  root: JsonValue,
  hist: History,
): { root: JsonValue; hist: History } | null {
  if (hist.past.length === 0) return null;
  const inverse = hist.past[hist.past.length - 1];
  const forward = invertPatch(root, inverse);
  const newRoot = applyPatch(root, inverse);
  return {
    root: newRoot,
    hist: {
      past: hist.past.slice(0, -1),
      future: [...hist.future, forward],
    },
  };
}

export function redo(
  root: JsonValue,
  hist: History,
): { root: JsonValue; hist: History } | null {
  if (hist.future.length === 0) return null;
  const forward = hist.future[hist.future.length - 1];
  const inverse = invertPatch(root, forward);
  const newRoot = applyPatch(root, forward);
  return {
    root: newRoot,
    hist: {
      past: [...hist.past, inverse],
      future: hist.future.slice(0, -1),
    },
  };
}

// ---- type inference for new values ----

export type ValueType = "string" | "number" | "boolean" | "null" | "object" | "array";

export function typeOf(v: JsonValue): ValueType {
  if (v === null) return "null";
  if (Array.isArray(v)) return "array";
  return typeof v as ValueType;
}

export function defaultFor(type: ValueType): JsonValue {
  switch (type) {
    case "string": return "";
    case "number": return 0;
    case "boolean": return false;
    case "null": return null;
    case "object": return {};
    case "array": return [];
  }
}

/** Parse a user-typed value back into its source type. Throws on bad input. */
export function parseAs(type: ValueType, text: string): JsonValue {
  switch (type) {
    case "string": return text;
    case "number": {
      const n = Number(text);
      if (!Number.isFinite(n)) throw new Error(`Not a number: ${text}`);
      return n;
    }
    case "boolean": {
      if (text === "true") return true;
      if (text === "false") return false;
      throw new Error(`Not a boolean: ${text}`);
    }
    case "null": return null;
    default: throw new Error(`Cannot parse complex type: ${type}`);
  }
}
