import { DashboardSection } from "@/components/private-sections";
import { GlassCard, SectionHeading } from "@/components/ui";

export default function DashboardPage() {
  return (
    <div className="content-grid page-section space-y-8">
      <SectionHeading
        eyebrow="Dashboard"
        title="Your member workspace"
        description="A focused overview of your saved opportunities, tracker activity, and platform notifications."
      />
      <DashboardSection />
      <GlassCard className="space-y-3">
        <div className="text-lg font-semibold text-white">What members unlock</div>
        <p className="text-sm leading-7 text-slate-300">
          Resume and cover-letter builders, alumni discovery, saved opportunities, application tracking, mentorship support, newsletters, and notification history.
        </p>
      </GlassCard>
    </div>
  );
}

