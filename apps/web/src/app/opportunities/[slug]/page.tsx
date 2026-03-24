import Link from "next/link";

import { SaveOpportunityButton } from "@/components/actions";
import { OpportunityCard } from "@/components/cards";
import { GlassCard } from "@/components/ui";
import { api } from "@/lib/api";
import { resolveAssetUrl } from "@/lib/client-api";

const fallbackOpportunityImage =
  "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=80";

export default async function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await api.getOpportunity(slug);
  const opportunity = data.item;

  return (
    <div className="content-grid page-section">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <GlassCard className="space-y-6">
          <img
            src={resolveAssetUrl(opportunity.image_url) ?? fallbackOpportunityImage}
            alt={opportunity.title}
            className="h-72 w-full rounded-[22px] object-cover"
          />
          <div className="space-y-3">
            <div className="text-sm uppercase tracking-[0.28em] text-cyan-200">
              {opportunity.category}
            </div>
            <h1 className="text-4xl font-semibold text-white">{opportunity.title}</h1>
            <div className="text-base text-cyan-100">{opportunity.organization}</div>
          </div>
          <p className="text-base leading-8 text-slate-200">{opportunity.description}</p>
          <div className="rounded-3xl border border-white/10 bg-slate-950/50 px-5 py-4 text-sm text-slate-300">
            Before posting any opportunity, we first check for you regarding being legit, we are here for you.
          </div>
          <div className="flex flex-wrap gap-4">
            {opportunity.apply_url ? (
              <Link href={opportunity.apply_url} className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950">
                Apply now
              </Link>
            ) : null}
            <SaveOpportunityButton opportunityId={opportunity.id} />
            <Link href="/resources" className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white">
              Add to tracker
            </Link>
          </div>
        </GlassCard>
        <div className="space-y-6">
          <GlassCard className="space-y-3">
            <div className="text-lg font-semibold text-white">Summary</div>
            <p className="text-sm text-slate-300">Compensation: {opportunity.compensation ?? "Not specified"}</p>
            <p className="text-sm text-slate-300">Location: {opportunity.location ?? "Flexible"}</p>
            <p className="text-sm text-slate-300">Department: {opportunity.department ?? "Not specified"}</p>
            <p className="text-sm text-slate-300">Type: {opportunity.opportunity_type ?? "Not specified"}</p>
            <p className="text-sm text-slate-300">Deadline: {opportunity.deadline ? new Date(opportunity.deadline).toLocaleDateString() : opportunity.deadline_label ?? "Rolling"}</p>
            <p className="text-sm text-slate-300">Read by: {opportunity.views_count}</p>
          </GlassCard>
          <div className="space-y-4">
            <div className="text-xl font-semibold text-white">Related opportunities</div>
            {data.related.map((item: any) => (
              <OpportunityCard key={item.id} opportunity={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
