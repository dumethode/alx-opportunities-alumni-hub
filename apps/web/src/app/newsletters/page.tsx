import { NewsletterArchiveSection } from "@/components/private-sections";
import { SectionHeading } from "@/components/ui";

export default function NewslettersPage() {
  return (
    <div className="content-grid page-section space-y-8">
      <SectionHeading
        eyebrow="Newsletter Archive"
        title="Bi-weekly memos for members"
        description="Browse published memo updates with clean date structure and a focused reading experience."
      />
      <NewsletterArchiveSection />
    </div>
  );
}

