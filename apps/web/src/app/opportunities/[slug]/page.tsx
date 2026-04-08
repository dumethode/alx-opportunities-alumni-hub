import type { Metadata } from "next";
import Link from "next/link";

import { SaveOpportunityButton, ShareOpportunityButton } from "@/components/actions";
import { OpportunityCard } from "@/components/cards";
import { SafeImage } from "@/components/safe-image";
import { GlassCard } from "@/components/ui";
import { api } from "@/lib/api";
import { resolveAssetUrl } from "@/lib/client-api";

const fallbackOpportunityImage = "/media/placeholders/opportunity-default.jpg";

function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const siteUrl = getSiteUrl();
  const { slug } = await params;

  try {
    const data = await api.getOpportunity(slug);
    const opportunity = data.item as any;
    const title = `${opportunity.title} | ALX Opportunities`;
    const description =
      opportunity.excerpt ||
      `View details and apply for ${opportunity.title} on the ALX Opportunities & Alumni Hub.`;
    const canonical = new URL(`/opportunities/${slug}`, siteUrl).toString();
    const absoluteImage = new URL(`/api/og/opportunity-image/${slug}`, siteUrl).toString();

    return {
      title,
      description,
      alternates: { canonical },
      openGraph: {
        type: "article",
        url: canonical,
        title,
        description,
        siteName: "ALX Opportunities & Alumni Hub",
        images: [
          {
            url: absoluteImage,
            alt: opportunity.title,
            width: 1200,
            height: 630,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [absoluteImage],
      },
    };
  } catch {
    const title = "Opportunity | ALX Opportunities";
    const description = "View opportunity details on the ALX Opportunities & Alumni Hub.";
    const absoluteImage = new URL(fallbackOpportunityImage, siteUrl).toString();
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [{ url: absoluteImage }],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [absoluteImage],
      },
    };
  }
}

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
            <div className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--alx-accent-text)]">
              {opportunity.category}
            </div>
            <h1 className="text-4xl font-semibold text-[var(--alx-text-strong)]">{opportunity.title}</h1>
            <div className="text-base text-[var(--alx-text-muted)]">{opportunity.organization}</div>
          </div>
          <div
            className="rich-content max-w-none [&_li]:my-1"
            dangerouslySetInnerHTML={{ __html: opportunity.description ?? "" }}
          />
          <div className="rounded-3xl border border-[color:var(--alx-border)] bg-[var(--alx-panel-muted)] px-5 py-4 text-sm text-[var(--alx-text-muted)]">
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
            <Link href="/resources" className="alx-btn alx-btn-secondary inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold">
              Add to tracker
            </Link>
          </div>
        </GlassCard>
        <div className="space-y-6">
          <GlassCard className="space-y-3">
            <div className="text-lg font-semibold text-[var(--alx-text-strong)]">Summary</div>
            <p className="text-sm text-[var(--alx-text-muted)]"><strong className="text-[var(--alx-text-strong)]">Compensation:</strong> {opportunity.compensation ?? "Not specified"}</p>
            <p className="text-sm text-[var(--alx-text-muted)]"><strong className="text-[var(--alx-text-strong)]">Location:</strong> {opportunity.location ?? "Flexible"}</p>
            <p className="text-sm text-[var(--alx-text-muted)]"><strong className="text-[var(--alx-text-strong)]">Department:</strong> {opportunity.department ?? "Not specified"}</p>
            <p className="text-sm text-[var(--alx-text-muted)]"><strong className="text-[var(--alx-text-strong)]">Type:</strong> {opportunity.opportunity_type ?? "Not specified"}</p>
            <p className="text-sm text-[var(--alx-text-muted)]"><strong className="text-[var(--alx-text-strong)]">Deadline:</strong> {opportunity.deadline ? new Date(opportunity.deadline).toLocaleDateString() : opportunity.deadline_label ?? "Rolling"}</p>
            <p className="text-sm text-[var(--alx-text-muted)]"><strong className="text-[var(--alx-text-strong)]">Read by:</strong> {opportunity.views_count}</p>
          </GlassCard>
          <div className="space-y-4">
            <div className="text-xl font-semibold text-[var(--alx-text-strong)]">Related opportunities</div>
            {data.related.map((item: any) => (
              <OpportunityCard key={item.id} opportunity={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
