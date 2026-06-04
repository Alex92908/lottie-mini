"use client";
import { useMemo, useState, useEffect, memo } from "react";

// ---- types ----
type JsonValue =
  | string | number | boolean | null
  | JsonValue[]
  | { [k: string]: JsonValue };

interface NodeProps {
  k: string | number | null;
  v: JsonValue;
  /** "$" / "$.assets" / "$.assets[0].p" */
  path: string;
  depth: number;
  /** Lowercased search term (already normalized). Empty string = no search. */
  q: string;
  /** Pre-computed map of paths that contain a match (so we can auto-expand). */
  matchAncestors: Set<string>;
  /** Pre-computed map of paths that ARE a match (for direct highlight). */
  matchPaths: Set<string>;
  /** Force-expand-all toggle. */
  expandAll: boolean;
}

// ---- helpers ----

/** Render a value as a short string and tell the caller if it was truncated. */
function previewPrimitive(v: JsonValue): { display: string; truncated: boolean; full: string } {
  if (v === null) return { display: "null", truncated: false, full: "null" };
  if (typeof v === "boolean") return { display: String(v), truncated: false, full: String(v) };
  if (typeof v === "number") return { display: String(v), truncated: false, full: String(v) };
  if (typeof v === "string") {
    // base64 data URLs explode the tree — show length instead.
    if (v.startsWith("data:") && v.length > 80) {
      const head = v.slice(0, 32);
      const tail = (v.length / 1024).toFixed(1);
      return {
        display: `"${head}…" (${tail} KB)`,
        truncated: true,
        full: v,
      };
    }
    if (v.length > 200) {
      return {
        display: `"${v.slice(0, 60)}…" (${v.length} chars)`,
        truncated: true,
        full: v,
      };
    }
    return { display: JSON.stringify(v), truncated: false, full: v };
  }
  return { display: "", truncated: false, full: "" };
}

function isContainer(v: JsonValue): v is JsonValue[] | { [k: string]: JsonValue } {
  return v !== null && typeof v === "object";
}

function summary(v: JsonValue): string {
  if (Array.isArray(v)) return `Array(${v.length})`;
  if (v && typeof v === "object") {
    const n = Object.keys(v).length;
    return `Object {${n}}`;
  }
  return "";
}

/** Build the set of paths containing a match, plus the set of paths IS a match. */
function buildMatchIndex(root: JsonValue, q: string): { ancestors: Set<string>; matches: Set<string> } {
  const ancestors = new Set<string>();
  const matches = new Set<string>();
  if (!q) return { ancestors, matches };
  const qLower = q.toLowerCase();

  function visit(v: JsonValue, path: string, key: string | null): boolean {
    let hit = false;
    if (key !== null && String(key).toLowerCase().includes(qLower)) hit = true;
    if (!Array.isArray(v) && (v === null || typeof v !== "object")) {
      const s = v === null ? "null" : String(v).toLowerCase();
      if (s.includes(qLower)) hit = true;
    }
    if (hit) matches.add(path);

    if (isContainer(v)) {
      let childHit = false;
      if (Array.isArray(v)) {
        for (let i = 0; i < v.length; i++) {
          if (visit(v[i], `${path}[${i}]`, String(i))) childHit = true;
        }
      } else {
        for (const k of Object.keys(v)) {
          if (visit(v[k], `${path}.${k}`, k)) childHit = true;
        }
      }
      if (childHit) ancestors.add(path);
      return hit || childHit;
    }
    return hit;
  }
  visit(root, "$", null);
  return { ancestors, matches };
}

/** Highlight occurrences of q inside text. */
function highlight(text: string, q: string): React.ReactNode {
  if (!q) return text;
  const lower = text.toLowerCase();
  const qLower = q.toLowerCase();
  const parts: React.ReactNode[] = [];
  let last = 0;
  let i = lower.indexOf(qLower);
  while (i >= 0) {
    if (i > last) parts.push(text.slice(last, i));
    parts.push(<mark key={i} style={{ background: "var(--accent2)", color: "#fff", padding: "0 2px", borderRadius: 2 }}>{text.slice(i, i + q.length)}</mark>);
    last = i + q.length;
    i = lower.indexOf(qLower, last);
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

// ---- node ----
const Node = memo(function Node(props: NodeProps) {
  const { k, v, path, depth, q, matchAncestors, matchPaths, expandAll } = props;
  const container = isContainer(v);
  const shouldAutoOpen = expandAll || matchAncestors.has(path) || matchPaths.has(path);

  // depth 0/1 default open; deeper closed. Match-driven auto-expand overrides.
  const [open, setOpen] = useState(depth < 1 || shouldAutoOpen);

  // If a new search forces this branch open, sync state without losing user toggle thereafter.
  useEffect(() => {
    if (shouldAutoOpen) setOpen(true);
  }, [shouldAutoOpen]);

  const keyLabel = k === null ? "" : Array.isArray(v) || typeof k === "number" ? `${k}` : `"${k}"`;
  const isMatch = matchPaths.has(path);

  if (!container) {
    const { display } = previewPrimitive(v);
    return (
      <div className="jt-row" style={{ paddingLeft: depth * 14 }} data-match={isMatch || undefined}>
        <span className="jt-key">{keyLabel && <>{highlight(keyLabel, q)}: </>}</span>
        <span className="jt-val">{highlight(display, q)}</span>
      </div>
    );
  }

  const children = Array.isArray(v)
    ? v.map((child, i) => ({ k: i, v: child, path: `${path}[${i}]` }))
    : Object.keys(v).map((kk) => ({ k: kk, v: v[kk], path: `${path}.${kk}` }));

  return (
    <div className="jt-block">
      <div
        className="jt-row jt-toggle"
        style={{ paddingLeft: depth * 14 }}
        onClick={() => setOpen((o) => !o)}
        data-match={isMatch || undefined}
      >
        <span className="jt-caret">{open ? "▾" : "▸"}</span>
        <span className="jt-key">{keyLabel && <>{highlight(keyLabel, q)}: </>}</span>
        <span className="jt-sum">{summary(v)}</span>
      </div>
      {open && children.map((c) => (
        <Node
          key={c.path}
          k={c.k}
          v={c.v}
          path={c.path}
          depth={depth + 1}
          q={q}
          matchAncestors={matchAncestors}
          matchPaths={matchPaths}
          expandAll={expandAll}
        />
      ))}
    </div>
  );
});

// ---- root ----
export default function JsonTree({ data, lang }: { data: JsonValue; lang: "en" | "zh" }) {
  const [q, setQ] = useState("");
  const [expandAll, setExpandAll] = useState(false);
  const { ancestors, matches } = useMemo(() => buildMatchIndex(data, q.trim()), [data, q]);

  const t = lang === "en"
    ? { search: "Search keys or values…", expand: "Expand all", collapse: "Collapse all", hits: "matches" }
    : { search: "搜索 key 或 value…", expand: "全部展开", collapse: "全部折叠", hits: "处匹配" };

  return (
    <div className="jt-wrap">
      <div className="jt-toolbar">
        <input
          className="jt-input"
          placeholder={t.search}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button className="ctrl-btn" onClick={() => setExpandAll((x) => !x)}>
          {expandAll ? t.collapse : t.expand}
        </button>
        {q && <span className="jt-hits">{matches.size} {t.hits}</span>}
      </div>
      <div className="jt-tree">
        <Node
          k={null}
          v={data}
          path="$"
          depth={0}
          q={q.trim()}
          matchAncestors={ancestors}
          matchPaths={matches}
          expandAll={expandAll}
        />
      </div>
    </div>
  );
}
