import { SavedSection } from "@/components/private-sections";
import { SectionHeading } from "@/components/ui";

export default function SavedPage() {
  return (
    <div className="content-grid page-section space-y-8">
      <SectionHeading
        eyebrow="Saved"
        title="Bookmarked opportunities for later review"
        description="Members can keep promising opportunities close and revisit them when they are ready to apply."
      />
      <SavedSection />
    </div>
  );
}

