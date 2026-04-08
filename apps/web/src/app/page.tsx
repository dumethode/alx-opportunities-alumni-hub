import Link from "next/link";
import { ArrowRight, BadgeCheck, CalendarDays, MapPin, ShieldCheck, Sparkles } from "lucide-react";

import { EventCard, NewsletterCard, OpportunityCard, TestimonialCard } from "@/components/cards";
import { AnimatedCounter, CarouselStrip, HeroAtmosphere, HeroBackdrop, HeroSlides, RoleMarquee } from "@/components/effects";
import { HubMap } from "@/components/map";
import { GlassCard, SectionHeading } from "@/components/ui";
import { api } from "@/lib/api";

export default async function HomePage() {
  const home = await api.getHome();

  return (
    <div>
      <section className="py-10 md:py-14">
        <div className="content-grid">
          <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
            <GlassCard className="on-media hero-glow relative overflow-hidden px-7 py-8 md:px-10 md:py-12">
              <HeroBackdrop
                images={[
                  { src: "/media/home/hero-1.jpg", alt: "ALX community moment 1" },
                  { src: "/media/home/highlight-1.jpg", alt: "ALX community highlight 1" },
                  { src: "/media/home/hero-3.jpg", alt: "ALX community moment 3" },
                  { src: "/media/home/highlight-3.jpg", alt: "ALX community highlight 3" },
                ]}
              />
              <HeroAtmosphere />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(88,240,255,0.22),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.10),transparent_44%)]" />
              <div className="relative space-y-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-cyan-100">
                  <Sparkles className="h-4 w-4" />
                  ALX Opportunities and Alumni Hub
                </div>

                <div className="max-w-3xl space-y-4">
                  <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white md:text-6xl">
                    Opportunities, events, and career momentum in one place.
                  </h1>
                  <HeroSlides
                    items={[
                      "Discover opportunities that feel relevant.",
                      "Share listings with a WhatsApp snapshot.",
                      "Track reads, deadlines, and next steps.",
                    ]}
                  />
                  <p className="max-w-2xl text-base leading-8 text-slate-200 md:text-lg">
                    Browse verified listings, stay close to hub events, access document builders, and get support services designed for real application progress.
                  </p>
                </div>

                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/opportunities"
                    className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950"
                  >
                    Browse opportunities
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/events"
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-white/6 px-5 py-3 text-sm font-semibold text-white"
                  >
                    View events
                  </Link>
                </div>

                <div className="grid gap-3 md:grid-cols-4">
                  <AnimatedCounter label="Live opportunities" value={home.stats.opportunities} />
                  <AnimatedCounter label="Active events" value={home.stats.events} />
                  <AnimatedCounter label="Community signals" value={home.stats.alumni} />
                  <AnimatedCounter label="Member services" value={home.stats.services} />
                </div>

                {home.featured_opportunities[0] ? (
                  <div className="spotlight-card rounded-[24px] border border-cyan-300/15 bg-slate-950/45 p-5 shadow-[0_24px_70px_rgba(7,16,34,0.34)] backdrop-blur-xl md:max-w-sm">
                    <div className="text-xs uppercase tracking-[0.25em] text-cyan-200">
                      Opportunity spotlight
                    </div>
                    <div className="mt-3 text-lg font-semibold text-white">
                      {home.featured_opportunities[0].title}
                    </div>
                    <div className="mt-1 text-sm text-cyan-100">
                      {home.featured_opportunities[0].organization}
                    </div>
                    <div className="mt-3 text-sm leading-7 text-slate-300">
                      {home.featured_opportunities[0].excerpt}
                    </div>
                    <div className="mt-4">
                      <Link
                        href={`/opportunities/${home.featured_opportunities[0].slug}`}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 transition hover:text-white"
                      >
                        Read more
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ) : null}
              </div>
            </GlassCard>

            <div className="space-y-6">
              <GlassCard className="relative overflow-hidden p-0">
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(4,27,110,0.62),rgba(18,91,255,0.18))]" />
                <div className="relative grid grid-cols-2 gap-0">
                  {[
                    { src: "/media/home/hero-2.jpg", alt: "ALX community moment 2" },
                    { src: "/media/home/hero-4.jpg", alt: "ALX community moment 4" },
                    { src: "/media/home/highlight-2.jpg", alt: "ALX community highlight 2" },
                    { src: "/media/home/highlight-1.jpg", alt: "ALX community highlight 1" },
                  ].map((item) => (
                    <div key={item.src} className="group relative aspect-[4/3] overflow-hidden">
                      <img
                        src={item.src}
                        alt={item.alt}
                        className="h-full w-full object-cover opacity-90 transition duration-700 group-hover:scale-[1.06]"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(4,27,110,0.05),rgba(4,27,110,0.36))]" />
                    </div>
                  ))}
                </div>
              </GlassCard>

              <GlassCard className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="text-sm uppercase tracking-[0.28em] text-[var(--alx-accent-text)]">
                    Member tools
                  </div>
                  <ShieldCheck className="h-5 w-5 text-[var(--alx-accent-text)]" />
                </div>
                <div className="space-y-2">
                  <div className="text-xl font-semibold text-[var(--alx-text-strong)]">
                    Save, track, and move faster
                  </div>
                  <p className="text-sm leading-7 text-[var(--alx-text-muted)]">
                    Sign in to bookmark opportunities, manage your tracker, and create share snapshots built for WhatsApp.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/auth/sign-in"
                    className="rounded-2xl bg-[var(--alx-cta)] px-4 py-2 text-sm font-semibold text-[var(--alx-cta-text)]"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/resources"
                    className="rounded-2xl border border-[color:var(--alx-border)] bg-[var(--alx-panel)] px-4 py-2 text-sm text-[var(--alx-text-strong)] transition hover:bg-[var(--alx-pill)]"
                  >
                    Document builders
                  </Link>
                </div>
              </GlassCard>

              <GlassCard className="space-y-4">
                <div className="text-sm uppercase tracking-[0.28em] text-[var(--alx-accent-text)]">
                  Trust and clarity
                </div>
                <p className="text-sm leading-7 text-[var(--alx-text-muted)]">
                  Featured listings are reviewed for clarity and legitimacy before they are promoted in the hub.
                </p>
                <div className="inline-flex items-center gap-2 text-sm text-[var(--alx-text-muted)]">
                  <BadgeCheck className="h-4 w-4 text-[var(--alx-accent-text)]" />
                  Reviewed listings and practical support
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="content-grid space-y-6">
          <SectionHeading
            eyebrow="Career Tracks"
            title="Explore roles that ALX learners are moving into"
            description="A fast way to scan where your next opportunity can take you."
          />
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <RoleMarquee
              title="Popular roles and categories"
              items={[
                "Data Analyst",
                "Software Engineer",
                "Product Analyst",
                "Business Analyst",
                "Solutions Engineer",
                "AI Specialist",
                "Frontend Developer",
                "Backend Developer",
                "DevOps Engineer",
                "Cybersecurity Analyst",
                "UI Designer",
                "Project Manager",
                "Internships",
                "Fellowships",
                "Scholarships",
                "Funding",
              ]}
            />
            <GlassCard className="space-y-3">
              <div className="text-lg font-semibold text-[var(--alx-text-strong)]">Quick paths</div>
              <p className="text-sm leading-7 text-[var(--alx-text-muted)]">
                Use category tabs on Opportunities to switch fast. New listings appear with deadlines and reads count.
              </p>
              <div className="grid gap-3">
                <Link
                  href="/opportunities?category=jobs"
                  className="inline-flex items-center justify-between rounded-2xl border border-[color:var(--alx-border)] bg-[var(--alx-panel)] px-4 py-3 text-sm font-semibold text-[var(--alx-text-strong)] transition hover:bg-[var(--alx-pill)]"
                >
                  Jobs
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/opportunities?category=internships"
                  className="inline-flex items-center justify-between rounded-2xl border border-[color:var(--alx-border)] bg-[var(--alx-panel)] px-4 py-3 text-sm font-semibold text-[var(--alx-text-strong)] transition hover:bg-[var(--alx-pill)]"
                >
                  Internships
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/opportunities?category=scholarships"
                  className="inline-flex items-center justify-between rounded-2xl border border-[color:var(--alx-border)] bg-[var(--alx-panel)] px-4 py-3 text-sm font-semibold text-[var(--alx-text-strong)] transition hover:bg-[var(--alx-pill)]"
                >
                  Scholarships
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="content-grid space-y-6">
          <SectionHeading
            eyebrow="Featured Opportunities"
            title="Fresh openings with practical context"
            description="Short-card browsing stays public, while members can save, track, and move faster."
            action={{ href: "/opportunities", label: "See all opportunities" }}
          />
          <div className="flex flex-wrap gap-3">
            <Link href="/opportunities?category=jobs" className="rounded-full border border-[color:var(--alx-border)] bg-[var(--alx-panel)] px-4 py-2 text-sm text-[var(--alx-text-strong)] transition hover:bg-[var(--alx-pill)]">Jobs</Link>
            <Link href="/opportunities?category=internships" className="rounded-full border border-[color:var(--alx-border)] bg-[var(--alx-panel)] px-4 py-2 text-sm text-[var(--alx-text-strong)] transition hover:bg-[var(--alx-pill)]">Internships</Link>
            <Link href="/opportunities?category=fellowships" className="rounded-full border border-[color:var(--alx-border)] bg-[var(--alx-panel)] px-4 py-2 text-sm text-[var(--alx-text-strong)] transition hover:bg-[var(--alx-pill)]">Fellowships</Link>
            <Link href="/opportunities?category=scholarships" className="rounded-full border border-[color:var(--alx-border)] bg-[var(--alx-panel)] px-4 py-2 text-sm text-[var(--alx-text-strong)] transition hover:bg-[var(--alx-pill)]">Scholarships</Link>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {home.featured_opportunities.map((opportunity: any) => (
              <OpportunityCard key={opportunity.id} opportunity={opportunity} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="content-grid space-y-6">
          <SectionHeading
            eyebrow="Events"
            title="Momentum-building sessions across the ALX network"
            description="Career nights, networking breakfasts, mentoring touchpoints, and relationship-led programming."
            action={{ href: "/events", label: "Explore events" }}
          />
          <div className="section-fade-guard">
            <CarouselStrip>
              {home.featured_events.map((event: any) => (
                <div key={event.id} className="min-w-[320px] snap-start lg:min-w-[360px]">
                  <EventCard event={event} />
                </div>
              ))}
            </CarouselStrip>
          </div>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="content-grid">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="space-y-6">
              <SectionHeading
                eyebrow="Testimonials"
                title="Built to feel supportive, useful, and launch-ready"
                description="A serious hub for career execution, not just a listing board."
              />
              <div className="section-fade-guard">
                <CarouselStrip>
                  {home.testimonials.map((testimonial: any) => (
                    <div key={testimonial.id} className="min-w-[300px] snap-start lg:min-w-[340px]">
                      <TestimonialCard testimonial={testimonial} />
                    </div>
                  ))}
                </CarouselStrip>
              </div>
            </div>

            <div className="space-y-6">
              <SectionHeading
                eyebrow="ALX Hubs"
                title="Real spaces behind the platform"
                description="Two hubs, ready for events, mentorship, and relationship management support."
              />
              <HubMap items={home.hub_locations} />
              <div className="grid gap-4 md:grid-cols-2">
                {home.hub_locations.map((hub: any) => (
                  <GlassCard key={hub.id} className="space-y-2">
                    <div className="text-lg font-semibold text-[var(--alx-text-strong)]">{hub.name}</div>
                    <p className="text-sm text-[var(--alx-text-muted)]">{hub.address}</p>
                    <div className="flex items-center gap-2 text-sm text-[var(--alx-text-muted)]">
                      <MapPin className="h-4 w-4 text-[var(--alx-accent-text)]" />
                      Kigali, Rwanda
                    </div>
                    <div className="pt-2">
                      <Link href="/contact" className="text-sm font-semibold text-[var(--alx-link)] hover:text-[var(--alx-link-strong)]">
                        View contact details
                      </Link>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="content-grid space-y-6">
          <SectionHeading
            eyebrow="Newsletters"
            title="Stay close to new openings and relationship updates"
            description="Bi-weekly memos help learners and alumni keep track of the most relevant signals."
          />
          <div className="grid gap-6 md:grid-cols-2">
            {home.newsletters.map((newsletter: any) => (
              <NewsletterCard key={newsletter.id} newsletter={newsletter} />
            ))}
          </div>
          <div>
            <Link href="/newsletters" className="inline-flex rounded-2xl border border-[color:var(--alx-border)] bg-[var(--alx-panel)] px-5 py-3 text-sm font-semibold text-[var(--alx-text-strong)] transition hover:bg-[var(--alx-pill)]">
              Browse newsletter archive
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

