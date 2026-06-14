import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  Upload,
  FileText,
  Trash2,
  Pencil,
  Save,
  X,
  Inbox,
  Search,
  Download,
  RefreshCcw,
  Mail,
  Send,
  Calendar,
  GraduationCap,
  Tag,
  Eye,
  LogOut,
  Shield,
  CheckCircle2,
  Clock,
  FileImage,
} from "lucide-react";
import {
  papersApi,
  submissionsApi,
  MAX_UPLOAD_BYTES,
  storeUpload,
  type Paper,
  type Submission,
} from "../lib/db";
import { useAuth } from "../lib/auth";

type Tab = "papers" | "inbox";

export default function Admin() {
  const { isAdmin, logout } = useAuth();
  const [tab, setTab] = useState<Tab>("papers");
  const [papers, setPapers] = useState<Paper[]>([]);
  const [subs, setSubs] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    const [p, s] = await Promise.all([papersApi.list(), submissionsApi.list()]);
    setPapers(p);
    setSubs(s);
    setLoading(false);
  }

  useEffect(() => {
    if (isAdmin) refresh();
  }, [isAdmin]);

  if (!isAdmin) {
    return <Navigate to="/admin-login" replace />;
  }

  return (
    <div className="math-pattern min-h-[80vh]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
              <Shield className="h-3.5 w-3.5" /> Admin authenticated
            </span>
            <h1 className="mt-3 font-serif text-3xl font-bold text-slate-900 sm:text-4xl">
              Admin Dashboard
            </h1>
            <p className="mt-1 text-slate-600">
              Manage papers, view student submissions, and keep the club
              running smoothly.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refresh}
              className="btn btn-ghost"
              title="Refresh"
            >
              <RefreshCcw className="h-4 w-4" /> Refresh
            </button>
            <button onClick={logout} className="btn btn-danger">
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex items-center gap-1 rounded-xl bg-white p-1 shadow-sm ring-1 ring-slate-200/80 w-fit">
          <TabButton
            active={tab === "papers"}
            onClick={() => setTab("papers")}
            Icon={FileText}
            label="Papers"
            count={papers.length}
          />
          <TabButton
            active={tab === "inbox"}
            onClick={() => setTab("inbox")}
            Icon={Inbox}
            label="Submissions"
            count={subs.length}
            dot={subs.some((s) => s.status === "new")}
          />
        </div>

        {loading ? (
          <p className="text-slate-500">Loading…</p>
        ) : tab === "papers" ? (
          <PapersTab
            papers={papers}
            onChange={async () => {
              const p = await papersApi.list();
              setPapers(p);
            }}
          />
        ) : (
          <InboxTab
            subs={subs}
            onChange={async () => {
              const s = await submissionsApi.list();
              setSubs(s);
            }}
          />
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  Icon,
  label,
  count,
  dot,
}: {
  active: boolean;
  onClick: () => void;
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  count: number;
  dot?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "relative inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors",
        active ? "bg-brand-700 text-white shadow" : "text-slate-700 hover:bg-slate-100",
      ].join(" ")}
    >
      <Icon className="h-4 w-4" /> {label}
      <span
        className={[
          "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
          active ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700",
        ].join(" ")}
      >
        {count}
      </span>
      {dot && (
        <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-accent-500 ring-2 ring-white" />
      )}
    </button>
  );
}

/* ============================================================
   PAPERS TAB
   ============================================================ */
function PapersTab({
  papers,
  onChange,
}: {
  papers: Paper[];
  onChange: () => Promise<void>;
}) {
  const [editing, setEditing] = useState<Paper | null>(null);
  const [q, setQ] = useState("");
  const filtered = papers.filter((p) => {
    if (!q) return true;
    const term = q.toLowerCase();
    return (
      p.title.toLowerCase().includes(term) ||
      p.year.toLowerCase().includes(term) ||
      p.level.toLowerCase().includes(term) ||
      p.type.toLowerCase().includes(term)
    );
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
      {/* Upload form */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80 sm:p-7">
        <div className="mb-4 flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-700 text-white">
            <Upload className="h-4 w-4" />
          </span>
          <h2 className="font-serif text-xl font-bold text-slate-900">
            {editing ? "Edit paper" : "Upload a paper"}
          </h2>
        </div>
        <UploadForm
          editing={editing}
          onSaved={async () => {
            setEditing(null);
            await onChange();
          }}
          onCancel={() => setEditing(null)}
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-serif text-lg font-bold text-slate-900">
              All Papers
            </h2>
            <span className="text-xs text-slate-500 sm:hidden">
              {filtered.length}/{papers.length}
            </span>
          </div>
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="input pl-9"
              placeholder="Search papers…"
            />
          </div>
        </div>
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            No papers uploaded yet.
          </div>
        ) : (
          <>
            <div className="grid gap-3 p-4 md:hidden">
              {filtered.map((p) => (
                <div
                  key={p.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-slate-900">
                        {p.title}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500">
                        <span>{p.type}</span>
                        <span>• {p.level}</span>
                        <span>• {p.year}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditing(p)}
                        className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-brand-700"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <a
                        href={p.fileDataUrl || "#"}
                        download={p.fileName}
                        onClick={(e) => {
                          if (!p.fileDataUrl) e.preventDefault();
                        }}
                        className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-brand-700"
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                      <button
                        onClick={async () => {
                          if (confirm(`Delete "${p.title}"?`)) {
                            await papersApi.remove(p.id);
                            await onChange();
                          }
                        }}
                        className="rounded-md p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-slate-500">
                    Uploaded {new Date(p.uploadedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3">Title</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Year</th>
                  <th className="px-5 py-3">Level</th>
                  <th className="px-5 py-3">Uploaded</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60">
                    <td className="max-w-[260px] truncate px-5 py-3 font-semibold text-slate-900">
                      {p.title}
                    </td>
                    <td className="px-5 py-3">
                      <span className="rounded-md bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-800">
                        {p.type}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-700">{p.year}</td>
                    <td className="px-5 py-3 text-slate-700">{p.level}</td>
                    <td className="px-5 py-3 text-xs text-slate-500">
                      {new Date(p.uploadedAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditing(p)}
                          className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-brand-700"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <a
                          href={p.fileDataUrl || "#"}
                          download={p.fileName}
                          onClick={(e) => {
                            if (!p.fileDataUrl) e.preventDefault();
                          }}
                          className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-brand-700"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                        <button
                          onClick={async () => {
                            if (confirm(`Delete "${p.title}"?`)) {
                              await papersApi.remove(p.id);
                              await onChange();
                            }
                          }}
                          className="rounded-md p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function UploadForm({
  editing,
  onSaved,
  onCancel,
}: {
  editing: Paper | null;
  onSaved: () => Promise<void>;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(editing?.title || "");
  const [year, setYear] = useState(editing?.year || "");
  const [level, setLevel] = useState(editing?.level || "");
  const [type, setType] = useState<Paper["type"]>(editing?.type || "Model Paper");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setTitle(editing?.title || "");
    setYear(editing?.year || "");
    setLevel(editing?.level || "");
    setType(editing?.type || "Model Paper");
    setFile(null);
  }, [editing]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!title || !year || !level) {
      setErr("Please fill in title, year, and level.");
      return;
    }
    if (!editing && !file) {
      setErr("Please attach a PDF or document.");
      return;
    }
    if (file && file.size > MAX_UPLOAD_BYTES) {
      setErr("File is too large. Maximum size is 100 MB per file.");
      return;
    }
    setBusy(true);
    try {
      if (editing) {
        const patch: Partial<Paper> = { title, year, level, type };
        if (file) {
          patch.fileName = file.name;
          const fileUpload = await storeUpload(file, editing.fileStorageId || editing.id);
          patch.fileStorageId = fileUpload.fileStorageId;
        }
        await papersApi.update(editing.id, patch);
      } else {
        const fileUpload = await storeUpload(file!);
        await papersApi.create({
          title,
          year,
          level,
          type,
          fileName: file!.name,
          fileStorageId: fileUpload.fileStorageId,
        });
      }
      setTitle("");
      setYear("");
      setLevel("");
      setType("Model Paper");
      setFile(null);
      await onSaved();
    } catch (err) {
      setErr(err instanceof Error ? err.message : "Upload failed. Try a smaller file.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {err && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {err}
        </div>
      )}
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-800">
          Title
        </label>
        <input
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. A/L Pure Math — 2024 Model"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-800">
            Year
          </label>
          <input
            className="input"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="2024"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-800">
            Level
          </label>
          <input
            className="input"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            placeholder="A/L, O/L, G10…"
          />
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-800">
          Type
        </label>
        <div className="flex gap-2">
          {(["Model Paper", "Past Paper"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={[
                "flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition",
                type === t
                  ? "bg-brand-700 text-white shadow"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200",
              ].join(" ")}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-800">
          File {editing && <span className="text-xs font-normal text-slate-500">(optional — leave to keep current)</span>}
          <span className="ml-2 text-xs font-normal text-slate-500">Max 100 MB</span>
        </label>
        <label
          htmlFor="upfile"
          className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 px-4 py-3 text-sm text-slate-600 hover:bg-slate-100"
        >
          <FileText className="h-4 w-4 text-slate-500" />
          <span className="flex-1 truncate">
            {file
              ? file.name
              : editing
              ? `Current: ${editing.fileName}`
              : "Click to attach PDF / document"}
          </span>
        </label>
        <input
          id="upfile"
          type="file"
          accept=".pdf,.doc,.docx,application/pdf"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </div>

      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={busy} className="btn btn-primary flex-1">
          {busy ? "Saving…" : editing ? "Save changes" : "Upload paper"}{" "}
          <Save className="h-4 w-4" />
        </button>
        {editing && (
          <button type="button" onClick={onCancel} className="btn btn-ghost">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </form>
  );
}

/* ============================================================
   INBOX TAB — student submissions
   ============================================================ */
function InboxTab({
  subs,
  onChange,
}: {
  subs: Submission[];
  onChange: () => Promise<void>;
}) {
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "new" | "reviewed">("all");
  const [viewing, setViewing] = useState<Submission | null>(null);

  const filtered = subs.filter((s) => {
    const matchesQ = !q
      ? true
      : s.studentName.toLowerCase().includes(q.toLowerCase()) ||
        s.problemText.toLowerCase().includes(q.toLowerCase()) ||
        (s.grade || "").toLowerCase().includes(q.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ? true : s.status === statusFilter;
    return matchesQ && matchesStatus;
  });

  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80">
      <div className="flex flex-col items-stretch gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <h2 className="font-serif text-lg font-bold text-slate-900">
          Student Submissions
        </h2>
        <div className="flex flex-col gap-3 sm:w-[32rem]">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-9"
              placeholder="Search submissions…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {[
              ["all", "All"],
              ["new", "New"],
              ["reviewed", "Replied"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatusFilter(value as typeof statusFilter)}
                className={[
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition",
                  statusFilter === value
                    ? "bg-brand-700 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200",
                ].join(" ")}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {subs.length === 0 ? (
        <div className="p-12 text-center">
          <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <Inbox className="h-6 w-6" />
          </div>
          <h3 className="mt-3 font-serif text-lg font-semibold text-slate-900">
            No submissions yet
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            When students submit a problem from the public form, it will
            appear here.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-200">
          {filtered.map((s) => (
            <li
              key={s.id}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-800">
                <UserIcon name={s.studentName} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-slate-900">
                    {s.studentName}
                  </span>
                  {s.replyText ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-semibold text-brand-800">
                      <Send className="h-3 w-3" /> REPLIED
                    </span>
                  ) : s.status === "new" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent-100 px-2 py-0.5 text-[11px] font-semibold text-accent-700">
                      <Clock className="h-3 w-3" /> NEW
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                      <CheckCircle2 className="h-3 w-3" /> REVIEWED
                    </span>
                  )}
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                  {s.problemText}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  {s.studentEmail && (
                    <span className="inline-flex items-center gap-1">
                      <Mail className="h-3 w-3" /> {s.studentEmail}
                    </span>
                  )}
                  {s.grade && (
                    <span className="inline-flex items-center gap-1">
                      <GraduationCap className="h-3 w-3" /> {s.grade}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" />{" "}
                    {new Date(s.submittedAt).toLocaleString()}
                  </span>
                  {s.fileName && (
                    <span className="inline-flex items-center gap-1 text-brand-700">
                      <FileImage className="h-3 w-3" /> {s.fileName}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={() => setViewing(s)}
                  className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-brand-700"
                  title="View"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={async () => {
                    await submissionsApi.toggleStatus(s.id);
                    await onChange();
                  }}
                  className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-emerald-700"
                  title="Toggle reviewed"
                >
                  <CheckCircle2 className="h-4 w-4" />
                </button>
                <button
                  onClick={async () => {
                    if (confirm("Delete this submission?")) {
                      await submissionsApi.remove(s.id);
                      await onChange();
                    }
                  }}
                  className="rounded-md p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {viewing && (
        <SubmissionModal
          sub={viewing}
          onClose={() => setViewing(null)}
          onSaved={async () => {
            await onChange();
          }}
        />
      )}
    </div>
  );
}

function UserIcon({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return <span className="font-semibold">{initials || "?"}</span>;
}

function SubmissionModal({
  sub,
  onClose,
  onSaved,
}: {
  sub: Submission;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [reply, setReply] = useState(sub.replyText || "");
  const [savedReply, setSavedReply] = useState(sub.replyText || "");
  const [savedAt, setSavedAt] = useState<number | null>(sub.repliedAt || null);
  const [history, setHistory] = useState(sub.replyHistory || []);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    setReply(sub.replyText || "");
    setSavedReply(sub.replyText || "");
    setSavedAt(sub.repliedAt || null);
    setHistory(sub.replyHistory || []);
    setNotice(null);
    setSaving(false);
  }, [sub]);

  async function saveReply(sendEmail: boolean) {
    const trimmed = reply.trim();
    if (!trimmed) {
      setNotice("Write a reply first.");
      return;
    }

    setSaving(true);
    setNotice(null);
    const now = Date.now();
    const nextHistory = [
      ...history,
      { id: now.toString(), text: trimmed, createdAt: now },
    ];

    try {
      await submissionsApi.update(sub.id, {
        replyText: trimmed,
        repliedAt: now,
        replyHistory: nextHistory,
        status: "reviewed",
      });
      setSavedReply(trimmed);
      setSavedAt(now);
      setHistory(nextHistory);
      await onSaved();

      if (sendEmail && sub.studentEmail) {
        const subject = `Response to your Mathematics Club problem`;
        const body = `${trimmed}\n\n--\nMathematics Club`;
        const mailto = `mailto:${encodeURIComponent(sub.studentEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(mailto, "_blank", "noopener,noreferrer");
        setNotice("Reply saved and email draft opened.");
      } else if (sendEmail && !sub.studentEmail) {
        setNotice("Reply saved, but no student email was provided.");
      } else {
        setNotice("Reply saved.");
      }
    } catch {
      setNotice("Could not save the reply. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-md p-2 text-slate-500 hover:bg-slate-100"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        <h3 className="font-serif text-xl font-bold text-slate-900">
          {sub.studentName}'s Problem
        </h3>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-600">
          {sub.studentEmail && (
            <span className="inline-flex items-center gap-1">
              <Mail className="h-3 w-3" /> {sub.studentEmail}
            </span>
          )}
          {sub.grade && (
            <span className="inline-flex items-center gap-1">
              <Tag className="h-3 w-3" /> {sub.grade}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3 w-3" />{" "}
            {new Date(sub.submittedAt).toLocaleString()}
          </span>
        </div>
        <div className="mt-5">
          <h4 className="text-sm font-semibold text-slate-800">
            Problem statement
          </h4>
          <pre className="mt-2 max-h-72 overflow-auto rounded-xl bg-slate-900 p-4 font-mono text-sm leading-relaxed text-amber-100">
            {sub.problemText}
          </pre>
        </div>
        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-sm font-semibold text-slate-800">
              Reply to student
            </h4>
            {sub.studentEmail ? (
              <span className="text-xs text-slate-500">
                Will open a mail draft for {sub.studentEmail}
              </span>
            ) : (
              <span className="text-xs text-amber-700">
                No student email provided
              </span>
            )}
          </div>
          <textarea
            rows={6}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Write the worked solution or a short response here..."
            className="input mt-3 font-mono text-sm"
          />
          {notice && (
            <div className="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
              {notice}
            </div>
          )}
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => saveReply(false)}
              disabled={saving}
              className="btn btn-primary flex-1"
            >
              {saving ? "Saving…" : "Save Reply"} <Save className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => saveReply(true)}
              disabled={saving}
              className="btn btn-accent flex-1"
            >
              {saving ? "Preparing…" : "Send Reply"} <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
        {savedReply && (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4">
            <h4 className="text-sm font-semibold text-emerald-800">
              Saved reply
            </h4>
            <p className="mt-2 whitespace-pre-wrap text-sm text-emerald-900">
              {savedReply}
            </p>
            {savedAt && (
              <p className="mt-2 text-xs text-emerald-700">
                Saved on {new Date(savedAt).toLocaleString()}
              </p>
            )}
          </div>
        )}
        {history.length > 1 && (
          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
            <h4 className="text-sm font-semibold text-slate-800">
              Reply history
            </h4>
            <div className="mt-3 space-y-3">
              {history
                .slice()
                .reverse()
                .map((item, index) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3"
                  >
                    <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
                      <span>Reply #{history.length - index}</span>
                      <span>{new Date(item.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                      {item.text}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        )}
        {sub.fileDataUrl && (
          <div className="mt-5">
            <h4 className="text-sm font-semibold text-slate-800">Attachment</h4>
            {sub.fileDataUrl.startsWith("data:image") ? (
              <img
                src={sub.fileDataUrl}
                alt={sub.fileName}
                className="mt-2 max-h-96 rounded-xl border border-slate-200"
              />
            ) : (
              <a
                href={sub.fileDataUrl}
                download={sub.fileName}
                className="btn btn-ghost mt-2"
              >
                <Download className="h-4 w-4" /> Download {sub.fileName}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
