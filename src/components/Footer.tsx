import { Globe, Send, MessageCircle, AtSign } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-brand-700" />
              <span className="font-serif text-lg font-bold text-slate-900">
                Mathematics Club
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-600 max-w-sm">
              A dedicated hub for exploring past papers, tackling weekly
              challenges, and unlocking your mathematical potential.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900">Contact</h4>
            <p className="mt-1 text-xs text-slate-500">
              +94 77 263 4134 — Nawaz Sir
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900">Follow</h4>
            <div className="mt-2 flex items-center gap-2">
              {[
                { Icon: Globe, label: "Website" },
                { Icon: Send, label: "Telegram" },
                { Icon: MessageCircle, label: "WhatsApp" },
                { Icon: AtSign, label: "Email" },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  aria-label={label}
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-brand-100 hover:text-brand-800 transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6 text-center text-xs text-slate-500">
          © Mathematics Club — Km/Km Al Ashraq M.M.V (National School),
          Ninthavur
        </div>
      </div>
    </footer>
  );
}
