import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl space-y-3">
        <div className="inline-flex rounded-full border border-[color:var(--alx-border)] bg-[var(--alx-panel)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--alx-accent-text)]">
          {eyebrow}
        </div>
        <div className="space-y-2">
          <h2 className="alx-heading text-4xl font-bold leading-[1.05] text-[var(--alx-text-strong)] md:text-5xl">
            {title}
          </h2>
          <p className="text-base leading-8 text-[var(--alx-text-muted)]">
            {description}
          </p>
        </div>
      </div>
      {action ? (
        <Link
          href={action.href}
          className="inline-flex items-center gap-2 rounded-full border border-[color:var(--alx-border)] bg-[var(--alx-panel)] px-4 py-2 text-sm font-semibold text-[var(--alx-text-strong)] transition hover:bg-[var(--alx-pill)]"
        >
          {action.label}
          <ArrowRight className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}

export function GlassCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`alx-card rounded-[28px] border p-6 backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}

export function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-[color:var(--alx-border)] bg-[var(--alx-panel-muted)] px-4 py-4">
      <div className="text-2xl font-semibold text-[var(--alx-text-strong)]">{value}</div>
      <div className="mt-1 text-sm text-[var(--alx-text-muted)]">{label}</div>
    </div>
  );
}
