import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Lightbulb,
  FileText,
  HelpCircle,
  Calendar,
  Download,
  Sparkles,
  Sigma,
  Pi,
  Infinity as InfinityIcon,
} from "lucide-react";
import { papersApi, type Paper } from "../lib/db";

export default function Home() {
  const [papers, setPapers] = useState<Paper[]>([]);

  useEffect(() => {
    papersApi.list().then((p) => setPapers(p.slice(0, 3)));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="math-pattern relative overflow-hidden">
        <FloatingSymbols />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
          <div className="max-w-3xl fade-up">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-brand-800 ring-1 ring-brand-100 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-accent-500" />
              Since 2026.05.25 · Est. by Nawaz Sir
            </span>
            <h1 className="mt-5 font-serif text-3xl font-bold leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-brand-700 to-accent-500 bg-clip-text text-transparent">
                Km/Km Al Ashraq M.M.V
              </span>{" "}
              (National School)'s{" "}
              <span className="underline decoration-accent-500/60 decoration-4 underline-offset-4">
                Mathematics Club
              </span>
              .
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-slate-700 sm:text-xl">
              A dedicated hub for exploring past papers, tackling weekly
              challenges, and unlocking your mathematical potential.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/papers" className="btn btn-primary">
                Browse Past Papers <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/submit" className="btn btn-ghost">
                Submit a Problem
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main cards */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Card 1 — Problem of the Week */}
          <article className="group relative overflow-hidden rounded-2xl bg-white p-7 shadow-sm ring-1 ring-slate-200/80 transition hover:shadow-md">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-accent-100/70 blur-2xl" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-50 px-3 py-1 text-xs font-semibold text-accent-700">
                  <Lightbulb className="h-3.5 w-3.5" /> Problem of the Week
                </span>
                <span className="text-xs text-slate-500">Week 21 · 2026</span>
              </div>
              <h3 className="mt-4 font-serif text-2xl font-bold text-slate-900">
                The Curious Sum
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Evaluate the infinite series:
              </p>
              <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-900 p-4 font-mono text-sm leading-relaxed text-amber-200">
                <code>
                  {`S = 1 + 2x + 3x² + 4x³ + ⋯\n   = Σₙ₌₁^∞  n·xⁿ⁻¹   for |x| < 1`}
                </code>
              </pre>
              <p className="mt-3 text-sm text-slate-700">
                Find a closed form for <span className="font-mono">S</span> in
                terms of <span className="font-mono">x</span>. Then compute{" "}
                <span className="font-mono">S</span> when{" "}
                <span className="font-mono">x = 1/3</span>.
              </p>
              <Link to="/submit" className="btn btn-accent mt-5 w-full">
                Submit Answer <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </article>

          {/* Card 2 — Latest Resources */}
          <article className="group relative overflow-hidden rounded-2xl bg-white p-7 shadow-sm ring-1 ring-slate-200/80 transition hover:shadow-md">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brand-100/70 blur-2xl" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800">
                  <FileText className="h-3.5 w-3.5" /> Latest Resources
                </span>
                <Link
                  to="/papers"
                  className="text-xs font-semibold text-brand-700 hover:underline"
                >
                  View all →
                </Link>
              </div>
              <h3 className="mt-4 font-serif text-2xl font-bold text-slate-900">
                Recently uploaded
              </h3>
              <ul className="mt-4 space-y-3">
                {papers.length === 0 && (
                  <li className="text-sm text-slate-500">Loading…</li>
                )}
                {papers.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3"
                  >
                    <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-700 text-white">
                      <FileText className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {p.title}
                      </p>
                      <p className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                        <span className="rounded bg-white px-1.5 py-0.5 ring-1 ring-slate-200">
                          {p.type}
                        </span>
                        <span>· {p.level}</span>
                        <span>· {p.year}</span>
                      </p>
                    </div>
                    <Link
                      to="/papers"
                      className="rounded-lg p-2 text-slate-500 hover:bg-white hover:text-brand-700"
                      aria-label="Open"
                    >
                      <Download className="h-4 w-4" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </article>

          {/* Card 3 — Need Help? */}
          <article className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-800 to-brand-950 p-7 text-white shadow-md">
            <div className="absolute -bottom-10 -right-10 h-44 w-44 rounded-full bg-accent-500/30 blur-3xl" />
            <div className="relative flex h-full flex-col">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold ring-1 ring-white/20">
                <HelpCircle className="h-3.5 w-3.5" /> Need Help?
              </span>
              <h3 className="mt-4 font-serif text-2xl font-bold">
                Stuck on a problem?
              </h3>
              <p className="mt-2 text-sm text-white/80">
                Type it out or upload a clear photo. The Math Club admin
                receives it directly and will get back to you with a worked
                solution.
              </p>
              <div className="mt-5 flex-1" />
              <Link
                to="/submit"
                className="btn btn-accent w-full justify-center text-base"
              >
                Submit a Problem <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="mt-3 text-center text-xs text-white/60">
                Average response time: under 24 hours
              </p>
            </div>
          </article>
        </div>

      </section>

      {/* Quick About blurb */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid items-center gap-8 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200/80 sm:p-12 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-50 px-3 py-1 text-xs font-semibold text-accent-700">
              <Calendar className="h-3.5 w-3.5" /> Founded 2026.05.25
            </span>
            <h2 className="mt-3 font-serif text-3xl font-bold text-slate-900 sm:text-4xl">
              A community built around numbers.
            </h2>
            <p className="mt-3 text-slate-700">
              The Mathematics Club of Km/Km Al Ashraq M.M.V (National School)
              brings together curious students who love solving problems. Under
              the guidance of <strong>Nawaz Sir</strong>, members participate
              in weekly challenges, work through past papers, and build
              mathematical confidence together.
            </p>
            <Link
              to="/about"
              className="btn btn-primary mt-5"
            >
              Learn more about the club <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="relative">
            <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-brand-100 via-white to-accent-100 p-6 ring-1 ring-slate-200">
              <svg viewBox="0 0 400 300" className="h-full w-full">
                {/* decorative math graph */}
                <defs>
                  <linearGradient id="lg1" x1="0" x2="1">
                    <stop offset="0%" stopColor="#3754f5" />
                    <stop offset="100%" stopColor="#ff9a3d" />
                  </linearGradient>
                </defs>
                <g stroke="rgba(15,22,71,0.1)" strokeWidth="1">
                  {Array.from({ length: 11 }).map((_, i) => (
                    <line
                      key={"h" + i}
                      x1="0"
                      x2="400"
                      y1={i * 30}
                      y2={i * 30}
                    />
                  ))}
                  {Array.from({ length: 14 }).map((_, i) => (
                    <line
                      key={"v" + i}
                      y1="0"
                      y2="300"
                      x1={i * 30}
                      x2={i * 30}
                    />
                  ))}
                </g>
                <path
                  d="M0 220 C 60 180, 120 60, 200 110 S 340 240, 400 80"
                  fill="none"
                  stroke="url(#lg1)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <text x="20" y="40" fontFamily="JetBrains Mono" fontSize="14" fill="#1a2789">
                  f(x) = sin(x) + x/3
                </text>
                <text x="20" y="270" fontFamily="JetBrains Mono" fontSize="12" fill="#c84a00">
                  ∫ f(x) dx = -cos(x) + x²/6 + C
                </text>
              </svg>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FloatingSymbols() {
  const items = [
    { Icon: Sigma, top: "12%", left: "85%", size: "h-8 w-8", color: "text-brand-300" },
    { Icon: Pi, top: "65%", left: "92%", size: "h-7 w-7", color: "text-accent-400" },
    { Icon: InfinityIcon, top: "78%", left: "78%", size: "h-8 w-8", color: "text-brand-400" },
    { Icon: Sigma, top: "22%", left: "8%", size: "h-7 w-7", color: "text-accent-300" },
    { Icon: InfinityIcon, top: "50%", left: "4%", size: "h-7 w-7", color: "text-brand-300" },
  ];
  return (
    <div className="pointer-events-none absolute inset-0">
      {items.map((it, i) => (
        <div
          key={i}
          className={`absolute ${it.color} ${it.size} float-slow opacity-70`}
          style={{ top: it.top, left: it.left, animationDelay: `${i * 0.7}s` }}
        >
          <it.Icon className="h-full w-full" />
        </div>
      ))}
    </div>
  );
}
