import { AdminSection } from "@/components/private-sections";
import { GlassCard, SectionHeading } from "@/components/ui";

export default function AdminPage() {
  return (
    <div className="content-grid page-section space-y-8">
      <SectionHeading
        eyebrow="Admin"
        title="Content management and platform oversight"
        description="Admins can manage opportunities, events, newsletters, testimonials, community groups, and hub locations from the backend-driven control surface."
      />
      <AdminSection />
      <GlassCard className="space-y-3">
        <div className="text-lg font-semibold text-white">Admin foundation included</div>
        <p className="text-sm leading-7 text-slate-300">
          This control surface now gives admins visible create, edit, and delete actions for the main presentation content, while role checks remain enforced by the backend.
        </p>
      </GlassCard>
    </div>
  );
}
