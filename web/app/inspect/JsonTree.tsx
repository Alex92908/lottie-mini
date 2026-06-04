"use client";
import { useMemo, useState, useEffect, useRef, useCallback, memo } from "react";
import type { JsonValue, Path, Patch, ValueType } from "../../lib/json-patch";
import { typeOf, defaultFor, parseAs } from "../../lib/json-patch";

// ---- utilities ----

function pathKey(path: Path): string {
  // Stable string id for Set membership. Won't collide because we always
  // bracket arrays and dot objects.
  let s = "$";
  for (const seg of path) {
    if (typeof seg === "number") s += `[${seg}]`;
    else s += `.${seg}`;
  }
  return s;
}

function isContainer(v: JsonValue): v is JsonValue[] | { [k: string]: JsonValue } {
  return v !== null && typeof v === "object";
}

function previewPrimitive(v: JsonValue): { display: string; truncated: boolean } {
  if (v === null) return { display: "null", truncated: false };
  if (typeof v === "boolean") return { display: String(v), truncated: false };
  if (typeof v === "number") return { display: String(v), truncated: false };
  if (typeof v === "string") {
    if (v.startsWith("data:") && v.length > 80) {
      return { display: `"${v.slice(0, 32)}…" (${(v.length / 1024).toFixed(1)} KB)`, truncated: true };
    }
    if (v.length > 200) {
      return { display: `"${v.slice(0, 60)}…" (${v.length} chars)`, truncated: true };
    }
    return { display: JSON.stringify(v), truncated: false };
  }
  return { display: "", truncated: false };
}

function summary(v: JsonValue): string {
  if (Array.isArray(v)) return `Array(${v.length})`;
  if (v && typeof v === "object") return `Object {${Object.keys(v).length}}`;
  return "";
}

function buildMatchIndex(root: JsonValue, q: string): { ancestors: Set<string>; matches: Set<string> } {
  const ancestors = new Set<string>();
  const matches = new Set<string>();
  if (!q) return { ancestors, matches };
  const qLower = q.toLowerCase();

  function visit(v: JsonValue, path: Path, key: string | number | null): boolean {
    const pk = pathKey(path);
    let hit = false;
    if (key !== null && String(key).toLowerCase().includes(qLower)) hit = true;
    if (!isContainer(v)) {
      const s = v === null ? "null" : String(v).toLowerCase();
      if (s.includes(qLower)) hit = true;
    }
    if (hit) matches.add(pk);

    if (isContainer(v)) {
      let childHit = false;
      if (Array.isArray(v)) {
        for (let i = 0; i < v.length; i++) {
          if (visit(v[i], [...path, i], i)) childHit = true;
        }
      } else {
        for (const k of Object.keys(v)) {
          if (visit(v[k], [...path, k], k)) childHit = true;
        }
      }
      if (childHit) ancestors.add(pk);
      return hit || childHit;
    }
    return hit;
  }
  visit(root, [], null);
  return { ancestors, matches };
}

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

// ---- value editor (inline input) ----

interface EditorProps {
  value: JsonValue;
  onCommit: (v: JsonValue) => void;
  onCancel: () => void;
}

function ValueEditor({ value, onCommit, onCancel }: EditorProps) {
  const type = typeOf(value);
  const initial = type === "string" ? (value as string)
                : type === "null" ? "null"
                : String(value);
  const [text, setText] = useState(initial);
  const [err, setErr] = useState("");
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => { ref.current?.focus(); ref.current?.select(); }, []);

  if (type === "boolean") {
    return (
      <button
        className="jt-bool-toggle"
        autoFocus
        onClick={() => onCommit(!(value as boolean))}
        onBlur={onCancel}
      >
        {String(!(value as boolean))} ↻
      </button>
    );
  }
  if (type === "null") {
    // Null can only stay null via inline edit. To change type, use delete + add.
    return <span style={{ color: "var(--muted)" }}>null (delete + add to change type)</span>;
  }

  const commit = () => {
    try {
      onCommit(parseAs(type, text));
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <input
        ref={ref}
        className="jt-edit-input"
        type={type === "number" ? "number" : "text"}
        value={text}
        onChange={(e) => { setText(e.target.value); setErr(""); }}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") onCancel();
        }}
        onBlur={commit}
      />
      {err && <span style={{ color: "var(--red)", fontSize: 11 }}>{err}</span>}
    </span>
  );
}

// ---- add-child form ----

interface AddFormProps {
  parentIsArray: boolean;
  depth: number;
  onAdd: (key: string | number, value: JsonValue) => void;
  onCancel: () => void;
}

function AddChildForm({ parentIsArray, depth, onAdd, onCancel }: AddFormProps) {
  const [type, setType] = useState<ValueType>("string");
  const [key, setKey] = useState("");
  const [val, setVal] = useState("");
  const [err, setErr] = useState("");

  const submit = () => {
    if (!parentIsArray && !key.trim()) {
      setErr("key required"); return;
    }
    try {
      const value = type === "object" || type === "array" || type === "null"
        ? defaultFor(type)
        : parseAs(type, val);
      onAdd(parentIsArray ? Number.MAX_SAFE_INTEGER : key.trim(), value);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div className="jt-add-form" style={{ paddingLeft: depth * 14 + 12 }}>
      <select
        className="jt-edit-input"
        value={type}
        onChange={(e) => setType(e.target.value as ValueType)}
      >
        <option value="string">string</option>
        <option value="number">number</option>
        <option value="boolean">boolean</option>
        <option value="null">null</option>
        <option value="object">{"{ } object"}</option>
        <option value="array">{"[ ] array"}</option>
      </select>
      {!parentIsArray && (
        <input
          className="jt-edit-input"
          placeholder="key"
          value={key}
          onChange={(e) => { setKey(e.target.value); setErr(""); }}
        />
      )}
      {(type === "string" || type === "number" || type === "boolean") && (
        <input
          className="jt-edit-input"
          placeholder={type === "boolean" ? "true / false" : "value"}
          value={val}
          onChange={(e) => { setVal(e.target.value); setErr(""); }}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
        />
      )}
      <button className="ctrl-btn" onClick={submit}>add</button>
      <button className="ctrl-btn" onClick={onCancel}>cancel</button>
      {err && <span style={{ color: "var(--red)", fontSize: 11 }}>{err}</span>}
    </div>
  );
}

// ---- node ----

interface NodeProps {
  k: string | number | null;
  v: JsonValue;
  path: Path;
  pkey: string;
  depth: number;
  q: string;
  matchAncestors: Set<string>;
  matchPaths: Set<string>;
  expandAll: boolean;
  readOnly: boolean;
  onPatch: (p: Patch) => void;
}

const Node = memo(function Node(props: NodeProps) {
  const { k, v, path, pkey, depth, q, matchAncestors, matchPaths, expandAll, readOnly, onPatch } = props;
  const container = isContainer(v);
  const shouldAutoOpen = expandAll || matchAncestors.has(pkey) || matchPaths.has(pkey);
  const [open, setOpen] = useState(depth < 1 || shouldAutoOpen);
  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => { if (shouldAutoOpen) setOpen(true); }, [shouldAutoOpen]);

  const keyLabel = k === null ? "" : Array.isArray(v) || typeof k === "number" ? `${k}` : `"${k}"`;
  const isMatch = matchPaths.has(pkey);
  const canDelete = !readOnly && path.length > 0;
  const editable = !readOnly && !container && typeOf(v) !== "null";

  const commitValue = useCallback((newVal: JsonValue) => {
    onPatch({ op: "set", path, value: newVal });
    setEditing(false);
  }, [onPatch, path]);

  const remove = useCallback(() => {
    if (path.length === 0) return;
    onPatch({ op: "delete", path });
  }, [onPatch, path]);

  if (!container) {
    return (
      <div className="jt-row" style={{ paddingLeft: depth * 14 }} data-match={isMatch || undefined}>
        <span className="jt-key">{keyLabel && <>{highlight(keyLabel, q)}: </>}</span>
        {editing ? (
          <ValueEditor value={v} onCommit={commitValue} onCancel={() => setEditing(false)} />
        ) : (
          <>
            <span
              className={`jt-val ${editable ? "jt-val-editable" : ""}`}
              onClick={editable ? () => setEditing(true) : undefined}
              title={editable ? "Click to edit" : undefined}
            >
              {highlight(previewPrimitive(v).display, q)}
            </span>
            {canDelete && (
              <button className="jt-act jt-act-del" onClick={remove} title="Delete">✕</button>
            )}
          </>
        )}
      </div>
    );
  }

  const isArray = Array.isArray(v);
  const children = isArray
    ? (v as JsonValue[]).map((child, i) => ({ k: i, v: child, p: [...path, i] as Path }))
    : Object.keys(v as object).map((kk) => ({ k: kk, v: (v as Record<string, JsonValue>)[kk], p: [...path, kk] as Path }));

  return (
    <div className="jt-block">
      <div className="jt-row jt-toggle" style={{ paddingLeft: depth * 14 }} data-match={isMatch || undefined}>
        <span className="jt-caret" onClick={() => setOpen((o) => !o)}>{open ? "▾" : "▸"}</span>
        <span className="jt-key" onClick={() => setOpen((o) => !o)}>
          {keyLabel && <>{highlight(keyLabel, q)}: </>}
        </span>
        <span className="jt-sum" onClick={() => setOpen((o) => !o)}>{summary(v)}</span>
        {!readOnly && open && (
          <button className="jt-act jt-act-add" onClick={() => setAdding(true)} title="Add child">＋</button>
        )}
        {canDelete && (
          <button className="jt-act jt-act-del" onClick={remove} title="Delete">✕</button>
        )}
      </div>
      {open && children.map((c) => (
        <Node
          key={pathKey(c.p)}
          k={c.k}
          v={c.v}
          path={c.p}
          pkey={pathKey(c.p)}
          depth={depth + 1}
          q={q}
          matchAncestors={matchAncestors}
          matchPaths={matchPaths}
          expandAll={expandAll}
          readOnly={readOnly}
          onPatch={onPatch}
        />
      ))}
      {open && adding && (
        <AddChildForm
          parentIsArray={isArray}
          depth={depth + 1}
          onAdd={(key, value) => {
            // For arrays, push at end (json-patch insert clamps to length).
            onPatch({ op: "insert", parent: path, key, value });
            setAdding(false);
          }}
          onCancel={() => setAdding(false)}
        />
      )}
    </div>
  );
});

// ---- root ----

interface JsonTreeProps {
  data: JsonValue;
  lang: "en" | "zh";
  readOnly?: boolean;
  onPatch?: (p: Patch) => void;
}

export default function JsonTree({ data, lang, readOnly = false, onPatch }: JsonTreeProps) {
  const [q, setQ] = useState("");
  const [expandAll, setExpandAll] = useState(false);
  const { ancestors, matches } = useMemo(() => buildMatchIndex(data, q.trim()), [data, q]);

  // Stable callback so memoized children don't re-render on every parent update.
  const noop = useCallback(() => {}, []);
  const patchCb = onPatch ?? noop;

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
          path={[]}
          pkey="$"
          depth={0}
          q={q.trim()}
          matchAncestors={ancestors}
          matchPaths={matches}
          expandAll={expandAll}
          readOnly={readOnly}
          onPatch={patchCb}
        />
      </div>
    </div>
  );
}
