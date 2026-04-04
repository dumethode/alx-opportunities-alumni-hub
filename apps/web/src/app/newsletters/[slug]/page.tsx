import Link from "next/link";

import { GlassCard, SectionHeading } from "@/components/ui";
import { api } from "@/lib/api";

export default async function NewsletterDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await api.getNewsletter(slug);
  const newsletter = data.item;

  return (
    <div className="content-grid page-section space-y-8">
      <SectionHeading
        eyebrow="Newsletter"
        title={newsletter.title}
        description={newsletter.summary}
        action={{ href: "/newsletters", label: "Back to archive" }}
      />

      <GlassCard className="overflow-hidden p-0">
        {/* Render newsletter HTML directly for a premium email-style reading experience. */}
        <div
          className="bg-white"
          dangerouslySetInnerHTML={{ __html: newsletter.content ?? "" }}
        />
      </GlassCard>

      <div>
        <Link href="/newsletters" className="inline-flex rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
          Back to archive
        </Link>
      </div>
    </div>
  );
}

