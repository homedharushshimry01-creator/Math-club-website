import { useState } from "react";
import {
  Send,
  CheckCircle2,
  Paperclip,
  Type,
  User,
  Mail,
  GraduationCap,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { MAX_UPLOAD_BYTES, storeUpload, submissionsApi } from "../lib/db";

export default function SubmitProblem() {
  const [form, setForm] = useState({
    studentName: "",
    studentEmail: "",
    grade: "",
    problemText: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.studentName || !form.problemText) {
      setError("Please add your name and describe the problem.");
      return;
    }
    if (file && file.size > MAX_UPLOAD_BYTES) {
      setError("File is too large. Maximum size is 100 MB per file.");
      return;
    }
    setSubmitting(true);
    try {
      const fileUpload = file ? await storeUpload(file) : undefined;
      await submissionsApi.create({
        studentName: form.studentName,
        studentEmail: form.studentEmail,
        grade: form.grade,
        problemText: form.problemText,
        fileName: file?.name,
        fileStorageId: fileUpload?.fileStorageId,
      });
      setSubmitted(true);
      setForm({ studentName: "", studentEmail: "", grade: "", problemText: "" });
      setFile(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="math-pattern min-h-[60vh]">
        <div className="mx-auto max-w-2xl px-4 py-20 sm:px-6">
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200/80">
            <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="mt-5 font-serif text-2xl font-bold text-slate-900">
              Problem sent!
            </h2>
            <p className="mt-2 text-slate-600">
              Thank you. The admin will review your problem and get back to you
              with a worked solution as soon as possible.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="btn btn-primary mt-6"
            >
              Submit another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="math-pattern min-h-[60vh]">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-8 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-brand-800 ring-1 ring-brand-100 shadow-sm">
            <Send className="h-3.5 w-3.5" /> Direct help channel
          </span>
          <h1 className="mt-3 font-serif text-3xl font-bold text-slate-900 sm:text-4xl">
            Submit a Problem
          </h1>
          <p className="mt-2 text-slate-600">
            Stuck on something? Type it out or upload a clear photo — the Math
            Club admin will reply with a full solution.
          </p>
        </header>

        <form
          onSubmit={onSubmit}
          className="rounded-3xl bg-white p-7 shadow-sm ring-1 ring-slate-200/80 sm:p-9"
        >
          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              Icon={User}
              label="Your Name"
              required
              value={form.studentName}
              onChange={(v) => update("studentName", v)}
              placeholder="e.g. A. Fathima"
            />
            <Field
              Icon={Mail}
              label="Email (optional)"
              type="email"
              value={form.studentEmail}
              onChange={(v) => update("studentEmail", v)}
              placeholder="you@school.lk"
            />
            <Field
              Icon={GraduationCap}
              label="Grade / Level"
              value={form.grade}
              onChange={(v) => update("grade", v)}
              placeholder="e.g. Grade 11, A/L, O/L"
            />
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-800">
                <span className="inline-flex items-center gap-1.5">
                  <ImageIcon className="h-4 w-4 text-slate-500" /> Photo of the
                  problem (optional)
                </span>
              </label>
              <label
                htmlFor="file"
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 px-4 py-3 text-sm text-slate-600 hover:bg-slate-100"
              >
                <Paperclip className="h-4 w-4 text-slate-500" />
                <span className="flex-1 truncate">
                  {file ? file.name : "Click to attach a file (JPG, JPEG, PDF)"}
                </span>
                {file && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setFile(null);
                    }}
                    className="text-slate-400 hover:text-red-600"
                    aria-label="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </label>
              <input
                id="file"
                type="file"
                accept=".jpg,.jpeg,.pdf,image/jpeg,application/pdf"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>

          <div className="mt-5">
            <label className="mb-1.5 block text-sm font-semibold text-slate-800">
              <span className="inline-flex items-center gap-1.5">
                <Type className="h-4 w-4 text-slate-500" /> The Problem{" "}
                <span className="text-red-500">*</span>
              </span>
            </label>
            <textarea
              required
              rows={7}
              value={form.problemText}
              onChange={(e) => update("problemText", e.target.value)}
              placeholder={
                "Describe the problem or paste it here.\nYou can also use plain text, e.g.\n\nFind dy/dx if y = sin(x²) · ln(x)."
              }
              className="input font-mono text-sm"
            />
          </div>

          <div className="mt-6 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              By submitting, you agree to let the club admin review your problem
              and reply via the email you provided.
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary sm:w-auto"
            >
              {submitting ? "Sending…" : "Send to Admin"}{" "}
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  Icon,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-800">
        <span className="inline-flex items-center gap-1.5">
          <Icon className="h-4 w-4 text-slate-500" /> {label}{" "}
          {required && <span className="text-red-500">*</span>}
        </span>
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="input"
      />
    </div>
  );
}
