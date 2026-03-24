import { ResourceSection } from "@/components/private-sections";
import { SectionHeading } from "@/components/ui";

export default function ResourcesPage() {
  return (
    <div className="content-grid page-section space-y-8">
      <SectionHeading
        eyebrow="Resources"
        title="Professional documents and personal tracking tools"
        description="The document builders are structured for real use and keep privacy visible near the download flow."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <a href="#resume-builder" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 transition hover:bg-white/10">Resume builder</a>
        <a href="#cover-letter-builder" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 transition hover:bg-white/10">Cover letter builder</a>
        <a href="/tracker" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 transition hover:bg-white/10">Opportunity tracker</a>
      </div>
      <ResourceSection />
    </div>
  );
}
