import { ServicesSection } from "@/components/private-sections";
import { SectionHeading } from "@/components/ui";

export default function ServicesPage() {
  return (
    <div className="content-grid page-section space-y-8">
      <SectionHeading
        eyebrow="Other Services"
        title="Mentorship, groups, letters, referrals, and ongoing community support"
        description="These member services create real records in the backend so users and admins can follow status over time."
      />
      <div className="grid gap-4 md:grid-cols-4">
        <a href="#community-groups" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 transition hover:bg-white/10">Community groups</a>
        <a href="#mentorship" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 transition hover:bg-white/10">Mentorship</a>
        <a href="#supporting-letter" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 transition hover:bg-white/10">Supporting letter</a>
        <a href="#newsletter-archive" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 transition hover:bg-white/10">Newsletter archive</a>
      </div>
      <ServicesSection />
    </div>
  );
}
