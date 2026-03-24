import { ContactForm } from "@/components/forms";
import { HubMap } from "@/components/map";
import { GlassCard, SectionHeading } from "@/components/ui";
import { api } from "@/lib/api";

export default async function AboutPage() {
  const locations = await api.getLocations();

  return (
    <div className="content-grid page-section space-y-12">
      <SectionHeading
        eyebrow="About"
        title="A premium relationship layer for the ALX ecosystem"
        description="The platform is designed to bring opportunities, events, alumni pathways, support services, and trust-building communication into one coherent experience."
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <GlassCard className="space-y-4 lg:col-span-2">
          <div className="text-xl font-semibold text-white">What this hub does</div>
          <p className="text-sm leading-8 text-slate-300">
            It gives visitors an immediate view of opportunities and events, then gives members a deeper operating layer with document generation, tracking, mentorship requests, newsletters, alumni discovery, and practical support from the ALX relationship management team.
          </p>
          <p className="text-sm leading-8 text-slate-300">
            The intent is clear: reduce friction, increase visibility, and make ALX support feel connected, modern, and trustworthy.
          </p>
        </GlassCard>
        <GlassCard className="space-y-3">
          <div className="text-xl font-semibold text-white">Support you can expect</div>
          <ul className="space-y-3 text-sm leading-7 text-slate-300">
            <li>Curated opportunities and legitimacy checks</li>
            <li>Mentorship booking and supporting-letter workflows</li>
            <li>Community groups, chapters, and alumni connections</li>
            <li>Contact pathways with clear response expectations</li>
          </ul>
        </GlassCard>
      </div>
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <SectionHeading
            eyebrow="Hub Map"
            title="ALX hubs in Kigali"
            description="The physical spaces behind the digital product are shown here with clean, directions-ready structure."
          />
          <HubMap items={locations.items} />
        </div>
        <GlassCard className="space-y-5">
          <div className="text-xl font-semibold text-white">Contact the team</div>
          <ContactForm />
        </GlassCard>
      </div>
    </div>
  );
}

