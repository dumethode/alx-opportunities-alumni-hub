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
    <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl space-y-3">
        <div className="inline-flex rounded-full border border-[color:var(--alx-border)] bg-[var(--alx-panel)] px-3 py-1 text-xs uppercase tracking-[0.28em] text-[var(--alx-accent-text)]">
          {eyebrow}
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight text-[var(--alx-text-strong)] md:text-4xl">
            {title}
          </h2>
          <p className="text-sm leading-7 text-[var(--alx-text-muted)] md:text-base">
            {description}
          </p>
        </div>
      </div>
      {action ? (
        <Link
          href={action.href}
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--alx-accent-text)] transition hover:text-[var(--alx-text-strong)]"
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
      className={`rounded-[28px] border border-[color:var(--alx-border)] bg-[var(--alx-panel)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.18)] backdrop-blur-xl ${className}`}
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
