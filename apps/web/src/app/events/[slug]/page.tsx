import Link from "next/link";

import { GlassCard } from "@/components/ui";
import { api } from "@/lib/api";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { item } = await api.getEvent(slug);

  return (
    <div className="content-grid page-section">
      <GlassCard className="space-y-6">
        <div className="space-y-2">
          <div className="text-sm uppercase tracking-[0.28em] text-cyan-200">{item.category}</div>
          <h1 className="text-4xl font-semibold text-white">{item.title}</h1>
          <p className="text-base leading-8 text-slate-300">{item.description}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4 text-sm text-slate-300">
            <div className="font-medium text-white">Starts</div>
            <div>{new Date(item.start_at).toLocaleString()}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4 text-sm text-slate-300">
            <div className="font-medium text-white">Ends</div>
            <div>{new Date(item.end_at).toLocaleString()}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4 text-sm text-slate-300">
            <div className="font-medium text-white">Venue</div>
            <div>{item.venue_name ?? item.location_text ?? "TBA"}</div>
          </div>
        </div>
        <Link href="/contact" className="inline-flex w-fit rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950">
          Contact the team
        </Link>
      </GlassCard>
    </div>
  );
}

