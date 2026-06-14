import { Link, NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu, X, LogIn, LogOut, Shield } from "lucide-react";
import { SchoolLogo, MathClubLogo } from "./Logo";
import { useAuth } from "../lib/auth";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/about", label: "About" },
  { to: "/papers", label: "Past Papers" },
  { to: "/submit", label: "Submit Problem" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAdmin, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={[
        "sticky top-0 z-50 liquid-glass transition-shadow",
        scrolled ? "shadow-[0_8px_30px_-12px_rgba(15,22,71,0.18)]" : "",
      ].join(" ")}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        {/* Left: branding */}
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2.5"
        >
          <div className="flex items-center gap-2.5">
            <SchoolLogo className="h-11 w-11 sm:h-12 sm:w-12" />
            <div className="h-10 w-px bg-slate-200/90" />
            <MathClubLogo className="h-11 w-11 sm:h-12 sm:w-12" />
          </div>
          <div className="hidden leading-tight lg:block">
            <div className="font-sans text-[10px] font-bold uppercase tracking-[0.34em] text-slate-700 sm:text-[11px]">
              Mathematics Club
            </div>
            <div className="mt-0.5 text-sm text-slate-500">
              Al Ashraq National School
            </div>
          </div>
        </Link>

        {/* Center: links */}
        <ul className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  [
                    "px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors",
                    isActive
                      ? "bg-brand-700 text-white shadow"
                      : "text-slate-800 hover:bg-white/70",
                  ].join(" ")
                }
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Right: admin */}
        <div className="hidden items-center gap-2 md:flex">
          {isAdmin ? (
            <>
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-100 px-3 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-200"
              >
                <Shield className="h-4 w-4" /> Dashboard
              </Link>
              <button
                onClick={logout}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white/70 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-white"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </>
          ) : (
            <Link
              to="/admin-login"
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/70 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-white"
            >
              <LogIn className="h-4 w-4" /> Admin Login
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((o) => !o)}
          className="md:hidden inline-flex items-center justify-center rounded-lg bg-white/70 p-2 text-slate-800"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden border-t border-white/60 bg-white/85 backdrop-blur-md">
          <ul className="flex flex-col px-4 py-3">
            {links.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  end={l.end}
                  className={({ isActive }) =>
                    [
                      "block px-3 py-2.5 rounded-lg text-sm font-semibold",
                      isActive
                        ? "bg-brand-700 text-white"
                        : "text-slate-800 hover:bg-slate-100",
                    ].join(" ")
                  }
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
            <li className="mt-1 border-t border-slate-200 pt-2">
              {isAdmin ? (
                <div className="flex gap-2">
                  <Link
                    to="/admin"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-100 px-3 py-2.5 text-sm font-semibold text-emerald-800"
                  >
                    <Shield className="h-4 w-4" /> Dashboard
                  </Link>
                  <button
                    onClick={logout}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2.5 text-sm font-semibold text-slate-800"
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/admin-login"
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2.5 text-sm font-semibold text-slate-800"
                >
                  <LogIn className="h-4 w-4" /> Admin Login
                </Link>
              )}
            </li>
          </ul>
        </div>
      )}

    </header>
  );
}
