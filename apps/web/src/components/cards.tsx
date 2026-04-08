import Link from "next/link";
import { CalendarDays, Clock3, ExternalLink, MapPin, Sparkles } from "lucide-react";

import { resolveAssetUrl } from "@/lib/client-api";
import { EventItem, Newsletter, Opportunity, Testimonial } from "@/lib/types";
import { GlassCard } from "@/components/ui";
import { SafeImage } from "@/components/safe-image";

const fallbackOpportunityImage = "/media/placeholders/opportunity-default.jpg";

export function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  const deadlineText = opportunity.deadline
    ? new Date(opportunity.deadline).toLocaleDateString()
    : opportunity.deadline_label ?? "Rolling";
  const primaryImage = resolveAssetUrl(opportunity.image_url);
  const expired = Boolean(opportunity.is_expired);

  return (
    <GlassCard className="group flex h-full flex-col justify-between gap-6 overflow-hidden p-0 transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_90px_rgba(18,91,255,0.18)]">
      <SafeImage
        src={primaryImage}
        fallbackSrc={fallbackOpportunityImage}
        alt={opportunity.title}
        className="h-48 w-full object-cover transition duration-500 group-hover:scale-[1.03]"
      />
      <div className="flex h-full flex-col justify-between gap-6 p-6">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-[color:var(--alx-border)] bg-[var(--alx-pill-active)] px-3 py-1 text-xs font-semibold text-[var(--alx-text-strong)]">
            {opportunity.category}
          </span>
          {expired ? (
            <span className="rounded-full border border-red-400/25 bg-red-500/12 px-3 py-1 text-xs font-semibold text-red-100">
              Deadline passed
            </span>
          ) : null}
          <span className="rounded-full border border-[color:var(--alx-border)] bg-[var(--alx-panel-muted)] px-3 py-1 text-xs text-[var(--alx-text-muted)]">
            {opportunity.views_count} reads
          </span>
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-[var(--alx-text-strong)]">{opportunity.title}</h3>
          <div className="text-sm text-[var(--alx-text-muted)]">{opportunity.organization}</div>
        </div>
        <p className="text-sm leading-7 text-[var(--alx-text-muted)]">{opportunity.excerpt}</p>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-[var(--alx-text-soft)]">
          <span>{opportunity.location ?? "Flexible location"}</span>
          <span className={expired ? "text-red-200" : ""}>
            Deadline <span className={expired ? "font-semibold" : ""}>{deadlineText}</span>
          </span>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Link
            href={`/opportunities/${opportunity.slug}`}
            className="alx-btn alx-btn-primary inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold"
          >
            Read More
            <ExternalLink className="h-4 w-4" />
          </Link>
          {opportunity.apply_url ? (
            <a
              href={opportunity.apply_url}
              target="_blank"
              rel="noopener noreferrer"
              className="alx-apply-cta w-full rounded-2xl px-4 py-3 text-sm font-semibold"
            >
              Apply
              <ExternalLink className="h-4 w-4" />
            </a>
          ) : (
            <div className="flex items-center justify-center rounded-2xl border border-[color:var(--alx-border)] bg-[var(--alx-panel-muted)] px-4 py-3 text-sm font-semibold text-[var(--alx-text-muted)]">
              Apply link TBA
            </div>
          )}
        </div>
      </div>
      </div>
    </GlassCard>
  );
}

export function EventCard({ event }: { event: EventItem }) {
  return (
    <GlassCard className="glass-card-balanced group space-y-5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_80px_rgba(4,27,110,0.16)]">
      <div className="flex items-center justify-between">
        <span className="rounded-full border border-[color:var(--alx-border)] bg-[var(--alx-pill-active)] px-3 py-1 text-xs font-semibold text-[var(--alx-text-strong)]">
          {event.category}
        </span>
        <span className="rounded-full border border-[color:var(--alx-border)] bg-[var(--alx-panel-muted)] px-3 py-1 text-xs uppercase tracking-[0.18em] text-[var(--alx-text-muted)]">
          {event.status}
        </span>
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-[var(--alx-text-strong)]">{event.title}</h3>
        <p className="text-sm leading-7 text-[var(--alx-text-muted)]">{event.summary}</p>
      </div>
      <div className="space-y-2 text-sm text-[var(--alx-text-muted)]">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-[var(--alx-accent-text)]" />
          <span className="min-w-0 break-words">{new Date(event.start_at).toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-[var(--alx-accent-text)]" />
          <span className="min-w-0 break-words">{event.venue_name ?? event.location_text ?? "Venue TBA"}</span>
        </div>
      </div>
      <Link href={`/events/${event.slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--alx-link)] transition hover:text-[var(--alx-link-strong)]">
        View details
        <ExternalLink className="h-4 w-4" />
      </Link>
    </GlassCard>
  );
}

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <GlassCard className="glass-card-balanced group space-y-4 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_80px_rgba(12,145,210,0.16)]">
      <Sparkles className="h-6 w-6 text-[var(--alx-accent-text)]" />
      <p className="text-base leading-8 text-[var(--alx-text-muted)]">“{testimonial.quote}”</p>
      <div className="text-sm text-[var(--alx-text-muted)]">
        <div className="font-semibold text-[var(--alx-text-strong)]">{testimonial.name}</div>
        <div>
          {testimonial.role}
          {testimonial.company ? ` · ${testimonial.company}` : ""}
        </div>
      </div>
    </GlassCard>
  );
}

export function NewsletterCard({ newsletter }: { newsletter: Newsletter }) {
  return (
    <GlassCard className="glass-card-balanced space-y-4 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(4,27,110,0.14)]">
      <div className="flex items-center justify-between">
        <span className="rounded-full border border-[color:var(--alx-border)] bg-[var(--alx-panel-muted)] px-3 py-1 text-xs text-[var(--alx-text-muted)]">
          Newsletter
        </span>
        <span className="inline-flex items-center gap-2 text-xs text-[var(--alx-text-soft)]">
          <Clock3 className="h-3.5 w-3.5" />
          {new Date(newsletter.published_at).toLocaleDateString()}
        </span>
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-[var(--alx-text-strong)]">{newsletter.title}</h3>
        <p className="text-sm leading-7 text-[var(--alx-text-muted)]">{newsletter.summary}</p>
      </div>
      <Link href={`/newsletters/${newsletter.slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--alx-link)] hover:text-[var(--alx-link-strong)]">
        Open newsletter
        <ExternalLink className="h-4 w-4" />
      </Link>
    </GlassCard>
  );
}
