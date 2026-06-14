import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Download,
  FileText,
  Calendar,
  GraduationCap,
  Filter,
  Tag,
} from "lucide-react";
import { papersApi, type Paper } from "../lib/db";

export default function PastPapers() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [type, setType] = useState<"All" | Paper["type"]>("All");
  const [level, setLevel] = useState<string>("All");

  useEffect(() => {
    papersApi.list().then((p) => {
      setPapers(p);
      setLoading(false);
    });
  }, []);

  const levels = useMemo(
    () => ["All", ...Array.from(new Set(papers.map((p) => p.level)))],
    [papers]
  );

  const filtered = useMemo(() => {
    return papers.filter((p) => {
      const matchesQ =
        !q ||
        p.title.toLowerCase().includes(q.toLowerCase()) ||
        p.year.includes(q) ||
        p.level.toLowerCase().includes(q.toLowerCase());
      const matchesT = type === "All" || p.type === type;
      const matchesL = level === "All" || p.level === level;
      return matchesQ && matchesT && matchesL;
    });
  }, [papers, q, type, level]);

  function handleDownload(p: Paper) {
    if (p.fileDataUrl) {
      const a = document.createElement("a");
      a.href = p.fileDataUrl;
      a.download = p.fileName;
      a.click();
    } else {
      // For seeded/sample papers that don't have a real file uploaded
      // we generate a small placeholder PDF on the fly so the
      // "Download" button always works in the demo.
      generatePlaceholderPdf(p);
    }
  }

  return (
    <div className="math-pattern min-h-[60vh]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-slate-900 sm:text-4xl">
            Past Papers Portal
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Browse and download Model Papers and Past Papers uploaded by the
            Mathematics Club admin. Use the search and filters to find exactly
            what you need.
          </p>
        </header>

        {/* Filters */}
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by title, year, or level…"
                className="input pl-9"
              />
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3">
              <Filter className="h-4 w-4 text-slate-500" />
              <select
                value={type}
                onChange={(e) => setType(e.target.value as typeof type)}
                className="bg-transparent py-2 text-sm font-semibold text-slate-800 outline-none"
              >
                <option value="All">All types</option>
                <option value="Model Paper">Model</option>
                <option value="Past Paper">Past</option>
              </select>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3">
              <GraduationCap className="h-4 w-4 text-slate-500" />
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="bg-transparent py-2 text-sm font-semibold text-slate-800 outline-none"
              >
                {levels.map((l) => (
                  <option key={l} value={l}>
                    {l === "All" ? "All levels" : l}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing <strong>{filtered.length}</strong> of{" "}
              <strong>{papers.length}</strong> papers
            </span>
            {(q || type !== "All" || level !== "All") && (
              <button
                onClick={() => {
                  setQ("");
                  setType("All");
                  setLevel("All");
                }}
                className="font-semibold text-brand-700 hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="mt-6">
          {loading ? (
            <Skeleton />
          ) : filtered.length === 0 ? (
            <EmptyState onReset={() => { setQ(""); setType("All"); setLevel("All"); }} />
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {filtered.map((p) => (
                <li
                  key={p.id}
                  className="group flex items-start gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80 transition hover:shadow-md"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-700 text-white shadow">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-slate-900">
                      {p.title}
                    </h3>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                      <span className="inline-flex items-center gap-1 rounded-md bg-brand-50 px-1.5 py-0.5 font-semibold text-brand-800">
                        <Tag className="h-3 w-3" /> {p.type}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <GraduationCap className="h-3 w-3" /> {p.level}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {p.year}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-slate-500">
                      {p.fileName} · uploaded{" "}
                      {new Date(p.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDownload(p)}
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-500 text-white shadow hover:bg-accent-600"
                    aria-label="Download"
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <li
          key={i}
          className="flex animate-pulse items-start gap-4 rounded-2xl bg-white p-5 ring-1 ring-slate-200/80"
        >
          <div className="h-12 w-12 rounded-xl bg-slate-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-2/3 rounded bg-slate-200" />
            <div className="h-3 w-1/2 rounded bg-slate-200" />
            <div className="h-3 w-1/3 rounded bg-slate-200" />
          </div>
          <div className="h-10 w-10 rounded-xl bg-slate-200" />
        </li>
      ))}
    </ul>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-10 text-center">
      <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <Search className="h-5 w-5" />
      </div>
      <h3 className="mt-3 font-serif text-lg font-semibold text-slate-900">
        No papers found
      </h3>
      <p className="mt-1 text-sm text-slate-600">
        Try a different search term or clear the filters.
      </p>
      <button onClick={onReset} className="btn btn-ghost mt-4">
        Reset filters
      </button>
    </div>
  );
}

// Generate a minimal valid PDF on the fly for seeded papers that
// don't have a real uploaded file attached. This keeps the "Download"
// button functional in the demo environment.
function generatePlaceholderPdf(p: Paper) {
  const title = p.title.replace(/[()\\]/g, "");
  const text = `Mathematics Club - ${p.type} - ${title} (Level: ${p.level}, Year: ${p.year})`;
  const pdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length ${text.length + 60} >>
stream
BT
/F1 18 Tf
72 720 Td
(${text}) Tj
0 -30 Td
/F1 12 Tf
(Uploaded via the Mathematics Club admin panel.) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000056 00000 n
0000000103 00000 n
0000000201 00000 n
0000000${(300 + text.length).toString().padStart(3, "0")} 00000 n
trailer
<< /Size 6 /Root 1 0 R >>
startxref
${400 + text.length}
%%EOF`;
  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = p.fileName || "paper.pdf";
  a.click();
  URL.revokeObjectURL(url);
}
