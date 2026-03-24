import { NotificationsSection } from "@/components/private-sections";
import { SectionHeading } from "@/components/ui";

export default function NotificationsPage() {
  return (
    <div className="content-grid page-section space-y-8">
      <SectionHeading
        eyebrow="Notifications"
        title="Important actions and follow-up reminders"
        description="Saved opportunities, mentorship requests, and supporting-letter submissions appear here."
      />
      <NotificationsSection />
    </div>
  );
}

