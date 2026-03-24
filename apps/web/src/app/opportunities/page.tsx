import Link from "next/link";

import { OpportunityCard } from "@/components/cards";
import { GlassCard, SectionHeading } from "@/components/ui";
import { api } from "@/lib/api";

const categories = [
  { slug: "", label: "All" },
  { slug: "jobs", label: "Jobs" },
  { slug: "internships", label: "Internships" },
  { slug: "scholarships", label: "Scholarships" },
  { slug: "fellowships", label: "Fellowships" },
  { slug: "funding", label: "Funding" },
  { slug: "tenders", label: "Tenders" },
  { slug: "deals", label: "Deals" },
];

export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string }>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.category) query.set("category", params.category);
  const opportunities = await api.getOpportunities(query);
  const activeCategory = params.category ?? "";

  return (
    <div className="content-grid page-section space-y-10">
      <SectionHeading
        eyebrow="Opportunities"
        title="Jobs, scholarships, internships, fellowships, and more"
        description="Newest opportunities appear first. Members can save them and connect them to their tracker."
      />
      <GlassCard className="space-y-4">
        <div className="text-sm leading-7 text-slate-300">
          Before posting any opportunity, we first check for you regarding being legit, we are here for you.
        </div>
        <div className="overflow-x-auto">
          <div className="flex min-w-max gap-3">
            {categories.map((category) => {
              const href = category.slug ? `/opportunities?category=${category.slug}` : "/opportunities";
              const active = activeCategory === category.slug;
              return (
                <Link
                  key={category.label}
                  href={href}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    active
                      ? "bg-[var(--alx-cta)] font-semibold text-[var(--alx-cta-text)]"
                      : "border border-[color:var(--alx-border)] bg-[var(--alx-panel)] text-[var(--alx-text-muted)] hover:text-[var(--alx-text-strong)]"
                  }`}
                >
                  {category.label}
                </Link>
              );
            })}
          </div>
        </div>
      </GlassCard>
      <div className="grid gap-6 lg:grid-cols-3">
        {opportunities.items.map((opportunity: any) => (
          <OpportunityCard key={opportunity.id} opportunity={opportunity} />
        ))}
      </div>
      {opportunities.items.length === 0 ? (
        <GlassCard className="text-center text-slate-300">
          No opportunities matched the current filters.
        </GlassCard>
      ) : null}
    </div>
  );
}
