import { EventCard } from "@/components/cards";
import { CarouselStrip } from "@/components/effects";
import { GlassCard, SectionHeading, StatPill } from "@/components/ui";
import { api } from "@/lib/api";

export default async function EventsPage() {
  const events = await api.getEvents();

  return (
    <div className="content-grid page-section space-y-10">
      <SectionHeading
        eyebrow="Events"
        title="Career-forward sessions with community energy"
        description="Browse all events, upcoming moments, and past sessions from the ALX ecosystem."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatPill label="All events" value={events.counts.all} />
        <StatPill label="Past events" value={events.counts.past} />
        <StatPill label="Upcoming events" value={events.counts.upcoming} />
      </div>
      <GlassCard className="space-y-4">
        <div className="text-sm uppercase tracking-[0.22em] text-cyan-200">Featured Flow</div>
        <div className="text-lg font-semibold text-white">Upcoming sessions, workshops, and alumni moments</div>
        <div className="text-sm leading-7 text-slate-300">
          Events now use stronger contrast for categories, statuses, and action links so the page stays premium and easy to scan.
        </div>
      </GlassCard>
      <CarouselStrip>
        {events.items.map((event: any) => (
          <div key={event.id} className="min-w-[320px] snap-start lg:min-w-[360px]">
            <EventCard event={event} />
          </div>
        ))}
      </CarouselStrip>
      {events.items.length === 0 ? (
        <GlassCard className="text-center text-slate-300">No events are available right now.</GlassCard>
      ) : null}
    </div>
  );
}
