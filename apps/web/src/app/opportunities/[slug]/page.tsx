import Link from "next/link";

import { SaveOpportunityButton, ShareOpportunityButton } from "@/components/actions";
import { OpportunityCard } from "@/components/cards";
import { SafeImage } from "@/components/safe-image";
import { GlassCard } from "@/components/ui";
import { api } from "@/lib/api";
import { resolveAssetUrl } from "@/lib/client-api";

const fallbackOpportunityImage = "/media/placeholders/opportunity-default.jpg";

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
          <SafeImage
            src={resolveAssetUrl(opportunity.image_url)}
            fallbackSrc={fallbackOpportunityImage}
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
          <div
            className="prose prose-invert max-w-none text-base leading-8 text-slate-200 [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-semibold [&_li]:my-1"
            dangerouslySetInnerHTML={{ __html: opportunity.description ?? "" }}
          />
          <div className="rounded-3xl border border-white/10 bg-slate-950/50 px-5 py-4 text-sm text-slate-300">
            Featured listings are reviewed for clarity and legitimacy before they are promoted in the hub.
          </div>
          {opportunity.is_expired ? (
            <div className="rounded-3xl border border-red-400/25 bg-red-500/12 px-5 py-4 text-sm text-red-100">
              This opportunity deadline has passed. You can still review the listing, but confirm whether applications are still open.
            </div>
          ) : null}
          <div className="flex flex-wrap gap-4">
            {opportunity.apply_url ? (
              <a
                href={opportunity.apply_url}
                target="_blank"
                rel="noopener noreferrer"
                className="alx-apply-cta rounded-2xl px-5 py-3 text-sm font-semibold"
              >
                Apply now
              </a>
            ) : null}
            <ShareOpportunityButton opportunity={opportunity} />
            <SaveOpportunityButton opportunityId={opportunity.id} />
            <Link href="/resources" className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white">
              Add to tracker
            </Link>
          </div>
        </GlassCard>
        <div className="space-y-6">
          <GlassCard className="space-y-3">
            <div className="text-lg font-semibold text-white">Summary</div>
            <p className="text-sm text-slate-300"><strong className="text-white">Compensation:</strong> {opportunity.compensation ?? "Not specified"}</p>
            <p className="text-sm text-slate-300"><strong className="text-white">Location:</strong> {opportunity.location ?? "Flexible"}</p>
            <p className="text-sm text-slate-300"><strong className="text-white">Department:</strong> {opportunity.department ?? "Not specified"}</p>
            <p className="text-sm text-slate-300"><strong className="text-white">Type:</strong> {opportunity.opportunity_type ?? "Not specified"}</p>
            <p className="text-sm text-slate-300"><strong className="text-white">Deadline:</strong> {opportunity.deadline ? new Date(opportunity.deadline).toLocaleDateString() : opportunity.deadline_label ?? "Rolling"}</p>
            <p className="text-sm text-slate-300"><strong className="text-white">Read by:</strong> {opportunity.views_count}</p>
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
