import Link from "next/link";
import { ArrowRight, BadgeCheck, ShieldCheck, Sparkles } from "lucide-react";

import { EventCard, NewsletterCard, OpportunityCard, TestimonialCard } from "@/components/cards";
import { AnimatedCounter, CarouselStrip, HeroAtmosphere, HeroBackdrop, HeroSlides, Reveal, RoleMarquee } from "@/components/effects";
import { HubMap } from "@/components/map";
import { GlassCard, SectionHeading } from "@/components/ui";
import { api } from "@/lib/api";

export default async function HomePage() {
  const home = await api.getHome();

  return (
    <div>
      <section className="content-grid page-section">
        <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
          <Reveal className="h-full">
          <GlassCard className="hero-glow relative overflow-hidden px-7 py-8 md:px-10 md:py-12">
            <HeroBackdrop
              images={[
                { src: "/media/home/hero-1.jpg", alt: "ALX community moment 1" },
                { src: "/media/home/highlight-1.jpg", alt: "ALX community highlight 1" },
                { src: "/media/home/hero-3.jpg", alt: "ALX community moment 3" },
                { src: "/media/home/highlight-3.jpg", alt: "ALX community highlight 3" },
              ]}
            />
            <HeroAtmosphere />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(88,240,255,0.25),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.12),transparent_40%)]" />
            <div className="relative space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-cyan-100">
                <Sparkles className="h-4 w-4" />
                Premium ALX ecosystem
              </div>
              <div className="max-w-3xl space-y-4">
                <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white md:text-6xl">
                  Find open opportunities and upcoming events.
                </h1>
                <HeroSlides
                  items={[
                    "Discover opportunities that feel vetted and relevant.",
                    "Build stronger applications with polished resources.",
                    "Stay close to alumni, mentors, events, and support.",
                  ]}
                />
                <p className="max-w-2xl text-base leading-8 text-slate-200 md:text-lg">
                  Discover real openings, follow application momentum, access resources, book mentorship, and stay close to the ALX relationship management ecosystem.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <Link href="/auth/sign-up" className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950">
                  Unlock member tools
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/opportunities" className="inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-white/6 px-5 py-3 text-sm font-semibold text-white">
                  Browse opportunities
                </Link>
              </div>
              <div className="grid gap-3 md:grid-cols-4">
                <AnimatedCounter label="Live opportunities" value={home.stats.opportunities} />
                <AnimatedCounter label="Active events" value={home.stats.events} />
                <AnimatedCounter label="Community signals" value={home.stats.alumni} />
                <AnimatedCounter label="Member services" value={home.stats.services} />
              </div>
              {home.featured_opportunities[0] ? (
                <div className="spotlight-card rounded-[24px] border border-cyan-300/15 bg-slate-950/45 p-5 shadow-[0_24px_70px_rgba(7,16,34,0.36)] backdrop-blur-xl md:max-w-sm">
                  <div className="text-xs uppercase tracking-[0.25em] text-cyan-200">Opportunity spotlight</div>
                  <div className="mt-3 text-lg font-semibold text-white">{home.featured_opportunities[0].title}</div>
                  <div className="mt-1 text-sm text-cyan-100">{home.featured_opportunities[0].organization}</div>
                  <div className="mt-3 text-sm leading-7 text-slate-300">{home.featured_opportunities[0].excerpt}</div>
                  <div className="mt-4">
                    <Link href={`/opportunities/${home.featured_opportunities[0].slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 transition hover:text-white">
                      Open spotlight
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ) : null}
            </div>
          </GlassCard>
          </Reveal>
          <div className="space-y-6">
            <Reveal delay={40}>
              <GlassCard className="relative overflow-hidden p-0">
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(4,27,110,0.62),rgba(18,91,255,0.18))]" />
                <div className="relative grid grid-cols-2 gap-0">
                  {[
                    { src: "/media/home/hero-1.jpg", alt: "ALX community moment 1" },
                    { src: "/media/home/hero-2.jpg", alt: "ALX community moment 2" },
                    { src: "/media/home/hero-3.jpg", alt: "ALX community moment 3" },
                    { src: "/media/home/hero-4.jpg", alt: "ALX community moment 4" },
                  ].map((item) => (
                    <div key={item.src} className="group relative aspect-[4/3] overflow-hidden">
                      <img
                        src={item.src}
                        alt={item.alt}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                      />
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_55%)] opacity-70" />
                    </div>
                  ))}
                </div>
                <div className="absolute left-5 top-5 rounded-full border border-white/25 bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-white backdrop-blur">
                  ALX Moments
                </div>
              </GlassCard>
            </Reveal>
            <Reveal delay={80}>
            <GlassCard className="space-y-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-1 h-5 w-5 text-cyan-200" />
                <div>
                  <div className="text-lg font-semibold text-white">Why create an account?</div>
                  <p className="mt-2 text-sm leading-7 text-slate-300">
                    Unlock resume and cover-letter builders, alumni access, opportunity tracking, mentorship requests, newsletters, bookmarks, and notifications.
                  </p>
                </div>
              </div>
            </GlassCard>
            </Reveal>
            <Reveal delay={160}>
            <GlassCard className="space-y-4 spotlight-card">
              <div className="text-sm uppercase tracking-[0.28em] text-cyan-200">Trust promise</div>
              <p className="text-base leading-8 text-slate-100">
                Before posting any opportunity, we first check for you regarding being legit, we are here for you.
              </p>
              <div className="inline-flex items-center gap-2 text-sm text-slate-300">
                <BadgeCheck className="h-4 w-4 text-cyan-200" />
                Reviewed listings and practical support
              </div>
            </GlassCard>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="content-grid page-section">
        <Reveal>
          <SectionHeading
            eyebrow="Career Tracks"
            title="Explore roles that ALX learners are moving into"
            description="A fast way to scan where your next opportunity can take you."
          />
        </Reveal>
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Reveal>
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
          </Reveal>
          <Reveal delay={120}>
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1">
              {[
                {
                  title: "Community moments",
                  body: "See what the ALX network looks like in action, then join opportunities that keep you moving.",
                  image: "/media/home/highlight-2.jpg",
                },
                {
                  title: "Events with momentum",
                  body: "Career nights, masterclasses, and networking sessions that plug you into real people.",
                  image: "/media/home/highlight-1.jpg",
                },
                {
                  title: "Support services",
                  body: "Mentorship bookings and supporting letters, designed to reduce application friction.",
                  image: "/media/home/highlight-3.jpg",
                },
              ].map((card) => (
                <GlassCard key={card.title} className="group relative overflow-hidden p-0">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="h-52 w-full object-cover transition duration-700 group-hover:scale-[1.05]"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,27,110,0.08),rgba(4,27,110,0.82))]" />
                  <div className="relative space-y-2 p-6">
                    <div className="text-lg font-semibold text-white">{card.title}</div>
                    <p className="text-sm leading-7 text-cyan-50">{card.body}</p>
                  </div>
                </GlassCard>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="content-grid page-section">
        <Reveal>
        <SectionHeading
          eyebrow="Featured Opportunities"
          title="Fresh openings with practical context"
          description="Short-card browsing stays public, while members can save, track, and move faster."
          action={{ href: "/opportunities", label: "See all opportunities" }}
        />
        </Reveal>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/opportunities?category=jobs" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10">Jobs</Link>
          <Link href="/opportunities?category=internships" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10">Internships</Link>
          <Link href="/opportunities?category=fellowships" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10">Fellowships</Link>
          <Link href="/opportunities?category=scholarships" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10">Scholarships</Link>
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {home.featured_opportunities.length ? (
            home.featured_opportunities.map((opportunity: any) => (
              <Reveal key={opportunity.id} delay={opportunity.id * 40}>
                <OpportunityCard opportunity={opportunity} />
              </Reveal>
            ))
          ) : (
            ["Career roles", "Internships", "Scholarships"].map((label) => (
              <Reveal key={label}>
                <GlassCard className="group flex h-full flex-col justify-between gap-6 overflow-hidden p-0">
                  <img
                    src="/media/placeholders/opportunity-default.jpg"
                    alt="ALX opportunity placeholder"
                    className="h-48 w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                  />
                  <div className="space-y-4 p-6">
                    <div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100">
                      {label}
                    </div>
                    <div className="text-xl font-semibold text-white">Opportunities are syncing</div>
                    <p className="text-sm leading-7 text-slate-300">
                      New featured opportunities will appear here as soon as admins publish them.
                    </p>
                    <Link href="/opportunities" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 transition hover:text-white">
                      Browse all opportunities
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </GlassCard>
              </Reveal>
            ))
          )}
        </div>
      </section>

      <section className="content-grid page-section">
        <Reveal>
        <SectionHeading
          eyebrow="Events"
          title="Momentum-building sessions across the ALX network"
          description="Career nights, networking breakfasts, mentoring touchpoints, and relationship-led programming."
          action={{ href: "/events", label: "Explore events" }}
        />
        </Reveal>
        <div className="section-fade-guard mt-8">
          <CarouselStrip>
            {home.featured_events.map((event: any) => (
              <div key={event.id} className="min-w-[320px] snap-start lg:min-w-[360px]">
                <EventCard event={event} />
              </div>
            ))}
          </CarouselStrip>
        </div>
      </section>

      <section className="content-grid page-section">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <Reveal>
              <SectionHeading
              eyebrow="Testimonials"
              title="Built to feel supportive, useful, and launch-ready"
              description="The product should feel like a serious career operating system, not just a listing board."
              />
            </Reveal>
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
            <Reveal>
              <SectionHeading
              eyebrow="ALX Hubs"
              title="Real spaces behind the platform"
              description="Visitors can discover both hubs immediately, while members gain deeper access to services and support."
              />
            </Reveal>
            <HubMap items={home.hub_locations} />
            <div className="grid gap-4 md:grid-cols-2">
              {home.hub_locations.map((hub: any) => (
                <Reveal key={hub.id} delay={hub.id * 50}>
                <GlassCard className="space-y-2 spotlight-card">
                  <div className="text-lg font-semibold text-white">{hub.name}</div>
                  <p className="text-sm text-slate-300">{hub.address}</p>
                  <a href={`mailto:${hub.email}`} className="block text-sm text-cyan-100 hover:text-white">{hub.email}</a>
                  <div className="pt-2">
                    <Link href="/contact" className="text-sm text-cyan-200 hover:text-white">View contact details</Link>
                  </div>
                </GlassCard>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="content-grid page-section">
        <Reveal>
        <SectionHeading
          eyebrow="Newsletters"
          title="Stay close to new openings and relationship updates"
          description="Bi-weekly memos help learners and alumni keep track of the most relevant signals."
        />
        </Reveal>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {home.newsletters.map((newsletter: any) => (
            <Reveal key={newsletter.id} delay={newsletter.id * 60}>
              <NewsletterCard newsletter={newsletter} />
            </Reveal>
          ))}
        </div>
        <div className="mt-6">
          <Link href="/newsletters" className="inline-flex rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
            Browse newsletter archive
          </Link>
        </div>
      </section>
    </div>
  );
}
