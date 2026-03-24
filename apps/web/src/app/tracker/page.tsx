import { TrackerSection } from "@/components/private-sections";
import { SectionHeading } from "@/components/ui";

export default function TrackerPage() {
  return (
    <div className="content-grid page-section space-y-8">
      <SectionHeading
        eyebrow="Opportunity Tracker"
        title="Stay organized through long recruitment timelines"
        description="Track status, notes, deadlines, interviews, follow-up dates, and outcomes with persistent member data."
      />
      <TrackerSection />
    </div>
  );
}

