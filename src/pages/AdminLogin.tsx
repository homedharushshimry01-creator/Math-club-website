import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Lock, User, ShieldCheck, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useAuth } from "../lib/auth";

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    setTimeout(() => {
      const ok = login(u.trim(), p);
      setBusy(false);
      if (ok) navigate("/admin");
      else setErr("Invalid username or password.");
    }, 350);
  }

  return (
    <div className="math-pattern min-h-[80vh]">
      <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
        <Link
          to="/"
          className="mb-4 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-brand-800"
        >
          <ArrowLeft className="h-4 w-4" /> Back to site
        </Link>

        <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200/80 sm:p-10">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-700 to-brand-950 text-white shadow-lg">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h1 className="mt-4 font-serif text-2xl font-bold text-slate-900">
              Admin Login
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Mathematics Club administration panel.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-800">
                <span className="inline-flex items-center gap-1.5">
                  <User className="h-4 w-4 text-slate-500" /> Username
                </span>
              </label>
              <input
                className="input"
                autoFocus
                autoComplete="username"
                value={u}
                onChange={(e) => setU(e.target.value)}
                placeholder="AANS"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-800">
                <span className="inline-flex items-center gap-1.5">
                  <Lock className="h-4 w-4 text-slate-500" /> Password
                </span>
              </label>
              <div className="relative">
                <input
                  className="input pr-10"
                  type={show ? "text" : "password"}
                  autoComplete="current-password"
                  value={p}
                  onChange={(e) => setP(e.target.value)}
                  placeholder="••••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
                  aria-label={show ? "Hide password" : "Show password"}
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {err && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-800">
                {err}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="btn btn-primary w-full"
            >
              {busy ? "Authenticating…" : "Sign in"}{" "}
              <ShieldCheck className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 rounded-xl bg-slate-50 p-3 text-xs text-slate-500 ring-1 ring-slate-200">
            <strong className="text-slate-700">Prototype credentials:</strong>{" "}
            username <code className="font-mono">AANS</code>, password{" "}
            <code className="font-mono">Mahematics_Club@AANS</code>
          </div>
        </div>
      </div>
    </div>
  );
}
