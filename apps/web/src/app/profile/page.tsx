import { ProfileSection } from "@/components/private-sections";
import { SectionHeading } from "@/components/ui";

export default function ProfilePage() {
  return (
    <div className="content-grid page-section space-y-8">
      <SectionHeading
        eyebrow="Profile"
        title="Your account and public-facing member details"
        description="Profile management is role-aware and designed to support alumni discovery, mentorship, and trust."
      />
      <ProfileSection />
    </div>
  );
}

