import { ContactForm } from "@/components/forms";
import { HubMap } from "@/components/map";
import { GlassCard, SectionHeading } from "@/components/ui";
import { api } from "@/lib/api";

export default async function ContactPage() {
  const locations = await api.getLocations();
  return (
    <div className="content-grid page-section space-y-10">
      <SectionHeading
        eyebrow="Contact"
        title="Reach the ALX relationship management team"
        description="Use the form for opportunities, events, support services, mentorship, or community questions. Expected response time is within 48 business hours."
      />
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <GlassCard className="space-y-5">
          <div className="text-xl font-semibold text-white">Send a message</div>
          <div className="text-sm leading-7 text-slate-300">
            For direct support, you can also email <a href="mailto:support@alxafrica.com" className="text-cyan-200 hover:text-white">support@alxafrica.com</a>.
          </div>
          <ContactForm />
        </GlassCard>
        <div className="space-y-6">
          <HubMap items={locations.items} />
          <div className="grid gap-4 md:grid-cols-2">
            {locations.items.map((item: any) => (
              <GlassCard key={item.id} className="space-y-2">
                <div className="text-lg font-semibold text-white">{item.name}</div>
                <p className="text-sm text-slate-300">{item.address}</p>
                <a href={`tel:${item.phone}`} className="block text-sm text-slate-300 hover:text-white">{item.phone}</a>
                <a href={`mailto:${item.email}`} className="block text-sm text-cyan-100 hover:text-white">{item.email}</a>
                <a href={item.directions_url} target="_blank" rel="noreferrer" className="inline-flex text-sm text-cyan-200 hover:text-white">
                  Open directions
                </a>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
