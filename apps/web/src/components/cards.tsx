import Link from "next/link";
import { CalendarDays, Clock3, ExternalLink, MapPin, Sparkles } from "lucide-react";

import { resolveAssetUrl } from "@/lib/client-api";
import { EventItem, Newsletter, Opportunity, Testimonial } from "@/lib/types";
import { GlassCard } from "@/components/ui";

const fallbackOpportunityImage =
  "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=900&q=80";

export function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  const deadlineText = opportunity.deadline
    ? new Date(opportunity.deadline).toLocaleDateString()
    : opportunity.deadline_label ?? "Rolling";

  return (
    <GlassCard className="group flex h-full flex-col justify-between gap-6 overflow-hidden p-0 transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_90px_rgba(10,175,255,0.18)]">
      <img
        src={resolveAssetUrl(opportunity.image_url) ?? fallbackOpportunityImage}
        alt={opportunity.title}
        className="h-48 w-full object-cover transition duration-500 group-hover:scale-[1.03]"
      />
      <div className="flex h-full flex-col justify-between gap-6 p-6">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100">
            {opportunity.category}
          </span>
          <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
            {opportunity.views_count} reads
          </span>
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-white">{opportunity.title}</h3>
          <div className="text-sm text-cyan-100">{opportunity.organization}</div>
        </div>
        <p className="text-sm leading-7 text-slate-300">{opportunity.excerpt}</p>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>{opportunity.location ?? "Flexible location"}</span>
          <span>
            Deadline {deadlineText}
          </span>
        </div>
        <Link
          href={`/opportunities/${opportunity.slug}`}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#1ee3ff,#1c7eff)] px-4 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.01]"
        >
          Read More
          <ExternalLink className="h-4 w-4" />
        </Link>
      </div>
      </div>
    </GlassCard>
  );
}

export function EventCard({ event }: { event: EventItem }) {
  return (
    <GlassCard className="glass-card-balanced group space-y-5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
      <div className="flex items-center justify-between">
        <span className="rounded-full border border-cyan-300/25 bg-cyan-300/12 px-3 py-1 text-xs font-semibold text-cyan-100">
          {event.category}
        </span>
        <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-200">
          {event.status}
        </span>
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-white">{event.title}</h3>
        <p className="text-sm leading-7 text-slate-300">{event.summary}</p>
      </div>
      <div className="space-y-2 text-sm text-slate-300">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-cyan-200" />
          {new Date(event.start_at).toLocaleString()}
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-cyan-200" />
          {event.venue_name ?? event.location_text ?? "Venue TBA"}
        </div>
      </div>
      <Link href={`/events/${event.slug}`} className="inline-flex items-center gap-2 text-sm font-medium text-cyan-200 transition group-hover:text-white">
        View details
        <ExternalLink className="h-4 w-4" />
      </Link>
    </GlassCard>
  );
}

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <GlassCard className="glass-card-balanced group space-y-4 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_80px_rgba(12,145,210,0.16)]">
      <Sparkles className="h-6 w-6 text-cyan-200" />
      <p className="text-base leading-8 text-slate-200">“{testimonial.quote}”</p>
      <div className="text-sm text-slate-300">
        <div className="font-medium text-white">{testimonial.name}</div>
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
    <GlassCard className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
          Newsletter
        </span>
        <span className="inline-flex items-center gap-2 text-xs text-slate-400">
          <Clock3 className="h-3.5 w-3.5" />
          {new Date(newsletter.published_at).toLocaleDateString()}
        </span>
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-white">{newsletter.title}</h3>
        <p className="text-sm leading-7 text-slate-300">{newsletter.summary}</p>
      </div>
      <Link href="/newsletters" className="inline-flex items-center gap-2 text-sm text-cyan-200 hover:text-white">
        View archive
        <ExternalLink className="h-4 w-4" />
      </Link>
    </GlassCard>
  );
}
