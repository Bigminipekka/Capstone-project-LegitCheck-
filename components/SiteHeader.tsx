"use client";
 
import { useEffect, useState } from "react";
import Link from "next/link";
 
type Active = "scanner" | "rules" | "how" | "report" | "about";
 
const LINKS: { key: Active; href: string; label: string }[] = [
  { key: "scanner", href: "/", label: "Scanner" },
  { key: "rules", href: "/database", label: "Rules" },
  { key: "how", href: "/how-it-works", label: "How It Works" },
  { key: "report", href: "/report", label: "Report a Scam" },
  { key: "about", href: "/about", label: "About" },
];
 
export default function SiteHeader({ active }: { active?: Active }) {
  const [open, setOpen] = useState(false);
  const [light, setLight] = useState(false);
 
  // Read the current theme once the page has loaded
  useEffect(() => {
    setLight(document.documentElement.classList.contains("light"));
  }, []);
 
  const toggleTheme = () => {
    const next = !light;
    setLight(next);
    document.documentElement.classList.toggle("light", next);
    try {
      localStorage.setItem("legitcheck-theme", next ? "light" : "dark");
    } catch {}
  };
 
  return (
    <header className="relative border-b border-gray-800">
      <div className="flex items-center justify-between px-4 sm:px-8 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            🛡️
          </div>
          <span className="font-bold text-lg">LegitCheck</span>
        </Link>
 
        {/* Desktop menu */}
        <nav className="hidden lg:flex gap-6 text-sm text-gray-300">
          {LINKS.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              className={
                active === link.key
                  ? "text-blue-400 font-medium"
                  : "hover:text-blue-400 transition-colors"
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>
 
        <div className="flex items-center gap-3">
          <span className="hidden sm:flex items-center gap-1 text-xs text-green-400 border border-green-700 rounded-full px-3 py-1">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            SYSTEM ACTIVE
          </span>
 
          {/* Light / dark toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={light ? "Switch to dark mode" : "Switch to light mode"}
            title={light ? "Switch to dark mode" : "Switch to light mode"}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-700 text-gray-300 hover:text-blue-400 hover:border-blue-600 transition-colors"
          >
            {light ? (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
              </svg>
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
              </svg>
            )}
          </button>
 
          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="lg:hidden flex h-10 w-10 items-center justify-center rounded-lg border border-gray-700 text-gray-300 hover:text-blue-400 hover:border-blue-600 transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>
 
      {/* Mobile menu panel */}
      {open && (
        <nav
          id="mobile-menu"
          className="lg:hidden absolute left-0 right-0 top-full z-50 border-b border-gray-800 bg-gray-950 px-4 pb-3 shadow-lg"
        >
          {LINKS.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`block border-t border-gray-800 py-3 text-base ${
                active === link.key
                  ? "text-blue-400 font-medium"
                  : "text-gray-300 hover:text-blue-400"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <p className="border-t border-gray-800 pt-3 text-xs text-green-400 flex items-center gap-1">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            SYSTEM ACTIVE
          </p>
        </nav>
      )}
    </header>
  );
}
 