import {
  Calendar,
  Phone,
  User,
  Users,
  Target,
  BookOpen,
  Trophy,
  Mail,
} from "lucide-react";

export default function About() {
  return (
    <div className="math-pattern min-h-[60vh]">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Hero card */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200/80">
          <div className="relative h-40 bg-gradient-to-r from-brand-800 via-brand-700 to-brand-500 sm:h-52">
            <div className="absolute inset-0 opacity-30">
              <svg viewBox="0 0 800 200" className="h-full w-full" preserveAspectRatio="none">
                <path
                  d="M0 150 C 200 50, 400 220, 600 80 S 800 120, 800 120"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                />
                <path
                  d="M0 100 C 200 200, 400 0, 600 150 S 800 60, 800 60"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  opacity="0.6"
                />
              </svg>
            </div>
            <div className="absolute -bottom-12 left-6 flex items-end gap-4 sm:left-10">
              <div className="rounded-2xl bg-white p-2 shadow-lg ring-1 ring-slate-200">
                <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-gradient-to-br from-brand-700 to-brand-950 sm:h-24 sm:w-24">
                  <span className="font-serif text-3xl font-bold text-white sm:text-4xl">
                    π
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 pb-8 pt-16 sm:px-10 sm:pt-16">
            <h1 className="font-serif text-3xl font-bold text-slate-900 sm:text-4xl">
              Mathematics Club
            </h1>
            <p className="mt-2 max-w-2xl text-slate-600">
              Km/Km Al Ashraq M.M.V (National School), Ninthavur. A student-led
              initiative cultivating mathematical thinking beyond the textbook.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Info
                Icon={Calendar}
                label="Since"
                value="2026.05.25"
                accent="text-brand-800"
              />
              <Info
                Icon={User}
                label="Teacher in-charge"
                value="Nawaz Sir"
                accent="text-accent-600"
              />
              <Info
                Icon={Phone}
                label="Contact No"
                value="+94 77 263 4134"
                accent="text-emerald-700"
              />
            </div>
          </div>
        </div>

        {/* History */}
        <section className="mt-10 rounded-3xl bg-white p-7 shadow-sm ring-1 ring-slate-200/80 sm:p-10">
          <h2 className="font-serif text-2xl font-bold text-slate-900">
            Our History
          </h2>
          <p className="mt-3 text-slate-700">
            The Mathematics Club was founded on{" "}
            <strong>25 May 2026</strong> at Km/Km Al Ashraq M.M.V (National
            School), Ninthavur, under the stewardship of{" "}
            <strong>Nawaz Sir</strong>. What began as a small group of curious
            students meeting after school has grown into a vibrant community
            that tackles a weekly problem together, archives past papers, and
            mentors younger students in algebraic and geometric reasoning.
          </p>
          <p className="mt-3 text-slate-700">
            Our mission is simple: make rigorous thinking joyful. Every Friday a
            new challenge is released, every term the library of model and past
            papers grows, and every member is encouraged to ask{" "}
            <em>"what if?"</em>.
          </p>
        </section>

        {/* Leadership */}
        <section className="mt-8 grid gap-6 sm:grid-cols-2">
          <div className="rounded-3xl bg-white p-7 shadow-sm ring-1 ring-slate-200/80">
            <h3 className="flex items-center gap-2 font-serif text-xl font-bold text-slate-900">
              <Users className="h-5 w-5 text-brand-700" /> Leadership
            </h3>
            <ul className="mt-4 divide-y divide-slate-200 text-sm">
              {[
                ["Teacher in-charge", "Nawaz Sir"],
                ["President", "N.M Thareef Abdullah"],
                ["Vice President", ""],
                ["Secretary", "S. Affly Humaid"],
                ["Vice Secretary", ""],
                ["Treasurer", "M.M Ahamed Akeem"],
              ].map(([role, name]) => (
                <li
                  key={role}
                  className="flex items-center justify-between py-2.5"
                >
                  <span className="text-slate-500">{role}</span>
                  <span className="font-semibold text-slate-900">
                    {name || "To be elected"}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-slate-500">
              Vice President and Vice Secretary will be added once confirmed by
              the club.
            </p>
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-brand-800 to-brand-950 p-7 text-white shadow-md">
            <h3 className="flex items-center gap-2 font-serif text-xl font-bold">
              <Target className="h-5 w-5 text-accent-400" /> What we do
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-white/90">
              <Bullet Icon={BookOpen} text="Curated library of model and past papers, free for all students." />
              <Bullet Icon={Trophy} text="Weekly problem-solving challenges with recognition for top solvers." />
              <Bullet Icon={Users} text="Peer-mentorship circles and revision sessions before exams." />
              <Bullet Icon={Mail} text="Direct help channel — submit any problem and get a worked solution." />
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}

function Info({
  Icon,
  label,
  value,
  accent,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
      <span
        className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200 ${accent}`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </div>
        <div className="font-semibold text-slate-900">{value}</div>
      </div>
    </div>
  );
}

function Bullet({
  Icon,
  text,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  text: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/20">
        <Icon className="h-3.5 w-3.5 text-accent-400" />
      </span>
      <span>{text}</span>
    </li>
  );
}
