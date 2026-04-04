import Link from "next/link";

import { GlassCard, SectionHeading } from "@/components/ui";
import { api } from "@/lib/api";

export default async function NewslettersPage() {
  const data = await api.getNewsletters().catch(() => ({ items: [] }));
  const items = (data?.items ?? []) as Array<{
    slug: string;
    title: string;
    summary?: string | null;
    published_at?: string | null;
  }>;

  return (
    <div className="content-grid page-section space-y-8">
      <SectionHeading
        eyebrow="Newsletter Archive"
        title="ALX Kigali Pulse"
        description="Short, practical updates: opportunities, hub moments, and what is next."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {items.length ? (
          items.map((item) => (
            <GlassCard key={item.slug} className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-lg font-semibold text-slate-950 dark:text-white">
                    {item.title}
                  </div>
                  {item.summary ? (
                    <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                      {item.summary}
                    </div>
                  ) : null}
                  {item.published_at ? (
                    <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                      Published{" "}
                      {new Date(item.published_at).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  ) : null}
                </div>
                <Link
                  href={`/newsletters/${item.slug}`}
                  className="inline-flex shrink-0 items-center justify-center rounded-2xl border border-slate-900/10 bg-white px-4 py-2 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-slate-50 active:scale-[0.98] dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                >
                  Read
                </Link>
              </div>
            </GlassCard>
          ))
        ) : (
          <GlassCard className="p-6 md:col-span-2">
            <div className="text-sm text-slate-700 dark:text-slate-300">
              No newsletters have been published yet.
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
