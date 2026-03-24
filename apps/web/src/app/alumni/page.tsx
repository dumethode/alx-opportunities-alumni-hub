import { AlumniSection } from "@/components/private-sections";
import { SectionHeading } from "@/components/ui";

export default function AlumniPage() {
  return (
    <div className="content-grid page-section space-y-8">
      <SectionHeading
        eyebrow="Find Alumni"
        title="Searchable alumni discovery for members"
        description="Browse cohort, field, location, company, and expertise signals in a privacy-aware member space."
      />
      <AlumniSection />
    </div>
  );
}

