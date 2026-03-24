"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  ChevronDown,
  ChevronRight,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Moon,
  PencilLine,
  SunMedium,
  User,
  UserRound,
  X,
} from "lucide-react";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";

import { NewsletterSignupForm } from "@/components/forms";
import { clientApi, resolveAssetUrl } from "@/lib/client-api";
import type { MeResponse } from "@/lib/types";

const logoUrl =
  "https://tse4.mm.bing.net/th/id/OIP.VZDimiCi78ga0VSN9cd1pAHaHa?rs=1&pid=ImgDetMain&o=7&rm=3";

const primaryLinks = [
  { href: "/", label: "Home" },
  { href: "/opportunities", label: "Opportunities" },
  { href: "/events", label: "Events" },
  { href: "/about", label: "About" },
];

const overflowLinks = [
  { href: "/contact", label: "Contact" },
  { href: "/resources", label: "Resources" },
  { href: "/alumni", label: "Find Alumni" },
  { href: "/services", label: "Services" },
  { href: "/newsletters", label: "Newsletter" },
];

const footerColumns = [
  {
    title: "Explore",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/opportunities", label: "Opportunities" },
      { href: "/events", label: "Events" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/resources#resume-builder", label: "Resume Builder" },
      { href: "/resources#cover-letter-builder", label: "Cover Letter Builder" },
      { href: "/tracker", label: "Opportunity Tracker" },
      { href: "/services#mentorship", label: "Mentorship" },
    ],
  },
  {
    title: "Services",
    links: [
      { href: "/alumni", label: "Find Alumni" },
      { href: "/services#community-groups", label: "Community Groups" },
      { href: "/services#supporting-letter", label: "Supporting Letter" },
      { href: "/newsletters", label: "Newsletter" },
    ],
  },
];

export function BrandMark({
  compact = false,
  subline = "Opportunities & Alumni Hub",
}: {
  compact?: boolean;
  subline?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="overflow-hidden rounded-2xl border border-[color:var(--alx-border)] bg-white p-1 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
        <img
          src={logoUrl}
          alt="ALX logo"
          className={compact ? "h-10 w-10 object-contain" : "h-12 w-12 object-contain"}
        />
      </div>
      <div className="min-w-0">
        <div className="text-sm uppercase tracking-[0.35em] text-[var(--alx-accent-text)]">ALX</div>
        <div className="truncate text-sm text-[var(--alx-text-strong)]">{subline}</div>
      </div>
    </div>
  );
}

function NavLink({
  href,
  label,
  pathname,
  onClick,
}: {
  href: string;
  label: string;
  pathname: string;
  onClick?: () => void;
}) {
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`rounded-full px-3 py-2 text-sm transition ${
        active
          ? "bg-[var(--alx-pill-active)] text-[var(--alx-text-strong)]"
          : "text-[var(--alx-text-muted)] hover:bg-[var(--alx-pill)] hover:text-[var(--alx-text-strong)]"
      }`}
    >
      {label}
    </Link>
  );
}

function ThemeToggle({
  theme,
  toggle,
}: {
  theme: "dark" | "light";
  toggle: () => void;
}) {
  return (
    <button
      onClick={toggle}
      className="rounded-2xl border border-[color:var(--alx-border)] bg-[var(--alx-panel)] p-2 text-[var(--alx-text-strong)] transition hover:bg-[var(--alx-pill)]"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <SunMedium className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

function AvatarButton({ me }: { me: MeResponse }) {
  const avatarUrl = resolveAssetUrl(me.profile.avatar_url);
  const initials = me.profile.full_name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return avatarUrl ? (
    <img
      src={avatarUrl}
      alt={me.profile.full_name}
      className="h-9 w-9 rounded-full border border-[color:var(--alx-border)] object-cover"
    />
  ) : (
    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--alx-border)] bg-[var(--alx-pill)] text-xs font-semibold text-[var(--alx-text-strong)]">
      {initials || "AL"}
    </div>
  );
}

export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [me, setMe] = useState<MeResponse | null>(null);
  const isAdmin = me?.role === "admin";
  const allLinks = useMemo(
    () => [...primaryLinks, ...overflowLinks, ...(isAdmin ? [{ href: "/admin", label: "Admin Panel" }] : [])],
    [isAdmin],
  );
  const overflowActive = overflowLinks.some((link) => pathname.startsWith(link.href));
  const moreRef = useRef<HTMLDivElement | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("alx-theme");
    const nextTheme = savedTheme === "light" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    clientApi<MeResponse>("/auth/me").then(setMe).catch(() => setMe(null));
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("alx-theme", theme);
  }, [theme]);

  useEffect(() => {
    setMoreOpen(false);
    setProfileOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (moreRef.current && !moreRef.current.contains(target)) {
        setMoreOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  async function logout() {
    await clientApi("/auth/logout", { method: "POST" }).catch(() => undefined);
    setMe(null);
    setProfileOpen(false);
    window.location.href = "/";
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--alx-bg)] text-[var(--alx-text)] transition-colors duration-300">
      <div className="pointer-events-none absolute inset-0 bg-[var(--alx-shell-gradient)]" />
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[color:var(--alx-border)] bg-[var(--alx-header)] backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 md:px-8">
          <Link href="/" className="min-w-0 shrink-0">
            <BrandMark />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {primaryLinks.map((link) => (
              <NavLink key={link.href} {...link} pathname={pathname} />
            ))}
            <div ref={moreRef} className="relative">
              <button
                onClick={() => setMoreOpen((value) => !value)}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm transition ${
                  overflowActive || moreOpen
                    ? "bg-[var(--alx-pill-active)] text-[var(--alx-text-strong)]"
                    : "text-[var(--alx-text-muted)] hover:bg-[var(--alx-pill)] hover:text-[var(--alx-text-strong)]"
                }`}
                aria-expanded={moreOpen}
              >
                More
                <ChevronDown className={`h-4 w-4 transition duration-200 ${moreOpen ? "rotate-180" : ""}`} />
              </button>
              <div
                className={`absolute right-0 top-12 w-60 origin-top rounded-3xl border border-[color:var(--alx-border)] bg-[var(--alx-panel-strong)] p-3 shadow-[0_18px_50px_rgba(0,0,0,0.18)] transition duration-200 ${
                  moreOpen ? "visible scale-100 opacity-100" : "invisible scale-95 opacity-0"
                }`}
              >
                <div className="grid gap-1">
                  {overflowLinks.map((link) => (
                    <NavLink
                      key={link.href}
                      {...link}
                      pathname={pathname}
                      onClick={() => setMoreOpen(false)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle theme={theme} toggle={() => setTheme((value) => (value === "dark" ? "light" : "dark"))} />
            <Link
              href="/notifications"
              className="rounded-2xl border border-[color:var(--alx-border)] bg-[var(--alx-panel)] p-2 text-[var(--alx-text-strong)] transition hover:bg-[var(--alx-pill)]"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
            </Link>
            {isAdmin ? (
              <Link
                href="/admin"
                className="hidden rounded-2xl border border-[color:var(--alx-border)] bg-[var(--alx-panel)] px-4 py-2 text-sm font-medium text-[var(--alx-text-strong)] transition hover:bg-[var(--alx-pill)] lg:inline-flex"
              >
                Admin Panel
              </Link>
            ) : null}
            {me ? (
              <div ref={profileRef} className="relative hidden sm:block">
                <button
                  onClick={() => setProfileOpen((value) => !value)}
                  className="rounded-full"
                  aria-expanded={profileOpen}
                  aria-label="Open profile menu"
                >
                  <AvatarButton me={me} />
                </button>
                <div
                  className={`absolute right-0 top-12 w-56 origin-top rounded-3xl border border-[color:var(--alx-border)] bg-[var(--alx-panel-strong)] p-3 shadow-[0_18px_50px_rgba(0,0,0,0.18)] transition duration-200 ${
                    profileOpen ? "visible scale-100 opacity-100" : "invisible scale-95 opacity-0"
                  }`}
                >
                  <div className="border-b border-[color:var(--alx-border)] pb-3 text-sm">
                    <div className="font-semibold text-[var(--alx-text-strong)]">{me.profile.full_name}</div>
                    <div className="text-[var(--alx-text-muted)]">{me.email}</div>
                  </div>
                  <div className="mt-3 grid gap-1">
                    {isAdmin ? (
                      <Link href="/admin" onClick={() => setProfileOpen(false)} className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm text-[var(--alx-text-muted)] transition hover:bg-[var(--alx-pill)] hover:text-[var(--alx-text-strong)]">
                        <UserRound className="h-4 w-4" />
                        Admin Panel
                      </Link>
                    ) : null}
                    <Link href="/profile" onClick={() => setProfileOpen(false)} className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm text-[var(--alx-text-muted)] transition hover:bg-[var(--alx-pill)] hover:text-[var(--alx-text-strong)]">
                      <User className="h-4 w-4" />
                      View Profile
                    </Link>
                    <Link href="/profile?edit=1" onClick={() => setProfileOpen(false)} className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm text-[var(--alx-text-muted)] transition hover:bg-[var(--alx-pill)] hover:text-[var(--alx-text-strong)]">
                      <PencilLine className="h-4 w-4" />
                      Edit Profile
                    </Link>
                    <button onClick={logout} className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-left text-sm text-[var(--alx-text-muted)] transition hover:bg-[var(--alx-pill)] hover:text-[var(--alx-text-strong)]">
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                href="/auth/sign-in"
                className="hidden rounded-2xl border border-[color:var(--alx-border)] bg-[var(--alx-pill)] px-4 py-2 text-sm font-medium text-[var(--alx-text-strong)] transition hover:bg-[var(--alx-pill-active)] md:inline-flex"
              >
                Sign in
              </Link>
            )}
            <button
              onClick={() => setMobileOpen((value) => !value)}
              className="rounded-2xl border border-[color:var(--alx-border)] bg-[var(--alx-panel)] p-2 text-[var(--alx-text-strong)] transition hover:bg-[var(--alx-pill)] lg:hidden"
              aria-label="Toggle navigation"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
        {mobileOpen ? (
          <div className="border-t border-[color:var(--alx-border)] bg-[var(--alx-panel-strong)] px-5 py-4 lg:hidden">
            <nav className="grid gap-2">
              {allLinks.map((link) => (
                <NavLink
                  key={link.href}
                  {...link}
                  pathname={pathname}
                  onClick={() => setMobileOpen(false)}
                />
              ))}
              {me ? (
                <>
                  {isAdmin ? (
                    <Link href="/admin" onClick={() => setMobileOpen(false)} className="rounded-full px-3 py-2 text-sm text-[var(--alx-text-muted)] transition hover:bg-[var(--alx-pill)] hover:text-[var(--alx-text-strong)]">
                      Admin Panel
                    </Link>
                  ) : null}
                  <Link href="/profile" onClick={() => setMobileOpen(false)} className="rounded-full px-3 py-2 text-sm text-[var(--alx-text-muted)] transition hover:bg-[var(--alx-pill)] hover:text-[var(--alx-text-strong)]">
                    View Profile
                  </Link>
                  <button onClick={logout} className="rounded-full px-3 py-2 text-left text-sm text-[var(--alx-text-muted)] transition hover:bg-[var(--alx-pill)] hover:text-[var(--alx-text-strong)]">
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/sign-up"
                  onClick={() => setMobileOpen(false)}
                  className="mt-2 inline-flex items-center justify-center rounded-2xl bg-[var(--alx-cta)] px-4 py-3 text-sm font-semibold text-[var(--alx-cta-text)]"
                >
                  Create account
                </Link>
              )}
            </nav>
          </div>
        ) : null}
      </header>

      <main className="relative z-10 pt-24 md:pt-28">{children}</main>

      <footer className="relative z-10 mt-24 border-t border-[color:var(--alx-border)] bg-[var(--alx-footer)] transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-5 py-14 md:px-8">
          <div className="grid gap-10 xl:grid-cols-[1.05fr_1.35fr_0.9fr]">
            <div className="space-y-5 rounded-[28px] border border-[color:var(--alx-border)] bg-[var(--alx-panel)] p-6">
              <BrandMark subline="Career, community, and support for ALX learners and alumni" />
              <p className="max-w-md text-sm leading-7 text-[var(--alx-text-muted)]">
                A trusted ALX product layer for opportunities, mentoring, alumni discovery, events, supporting letters, and practical career momentum.
              </p>
              <div className="grid gap-3">
                <a
                  href="mailto:support@alxafrica.com"
                  className="inline-flex items-center gap-2 text-sm text-[var(--alx-text-muted)] transition hover:text-[var(--alx-text-strong)]"
                >
                  <Mail className="h-4 w-4 text-[var(--alx-accent-text)]" />
                  support@alxafrica.com
                </a>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 text-sm text-[var(--alx-text-muted)] transition hover:text-[var(--alx-text-strong)]"
                >
                  <MapPin className="h-4 w-4 text-[var(--alx-accent-text)]" />
                  ALX Tech Hub at Deco Center, ALX Hub at Zaria Court
                </Link>
              </div>
            </div>

            <div className="grid gap-8 sm:grid-cols-3">
              {footerColumns.map((column) => (
                <div key={column.title} className="space-y-4">
                  <div className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--alx-accent-text)]">
                    {column.title}
                  </div>
                  <div className="grid gap-3">
                    {column.links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="inline-flex items-center gap-2 text-sm text-[var(--alx-text-muted)] transition hover:text-[var(--alx-text-strong)]"
                      >
                        <ChevronRight className="h-3.5 w-3.5 text-[var(--alx-accent-text)]" />
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-5 rounded-[28px] border border-[color:var(--alx-border)] bg-[var(--alx-panel)] p-6">
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--alx-accent-text)]">
                  Newsletter
                </div>
                <p className="mt-3 text-sm leading-7 text-[var(--alx-text-muted)]">
                  Subscribe for ALX opportunity memos, community updates, and hub announcements.
                </p>
              </div>
              <NewsletterSignupForm />
              <div className="grid gap-2 text-sm text-[var(--alx-text-muted)]">
                <a href="mailto:support@alxafrica.com" className="transition hover:text-[var(--alx-text-strong)]">
                  support@alxafrica.com
                </a>
                <a href="mailto:community@alxafrica.com" className="transition hover:text-[var(--alx-text-strong)]">
                  community@alxafrica.com
                </a>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-[color:var(--alx-border)] pt-5 text-xs text-[var(--alx-text-soft)] md:flex-row md:items-center md:justify-between">
            <p>© 2026 ALX Opportunities & Alumni Hub. Built for meaningful learner and alumni support.</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/about" className="transition hover:text-[var(--alx-text-strong)]">About</Link>
              <Link href="/contact" className="transition hover:text-[var(--alx-text-strong)]">Contact</Link>
              <Link href="/newsletters" className="transition hover:text-[var(--alx-text-strong)]">Newsletter</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
