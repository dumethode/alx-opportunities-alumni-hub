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
        <a href="#resume-builder" className="alx-btn alx-btn-secondary rounded-2xl px-4 py-3 text-sm font-semibold">Resume builder</a>
        <a href="#cover-letter-builder" className="alx-btn alx-btn-secondary rounded-2xl px-4 py-3 text-sm font-semibold">Cover letter builder</a>
        <a href="/tracker" className="alx-btn alx-btn-secondary rounded-2xl px-4 py-3 text-sm font-semibold">Opportunity tracker</a>
      </div>
      <ResourceSection />
    </div>
  );
}
