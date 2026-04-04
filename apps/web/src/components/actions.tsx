"use client";

import { Download, Share2 } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import { clientApi, resolveAssetUrl } from "@/lib/client-api";
import { SafeImage } from "@/components/safe-image";

export function SaveOpportunityButton({ opportunityId }: { opportunityId: number }) {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    try {
      const response = await clientApi<{ message: string }>(`/saved-opportunities/${opportunityId}`, {
        method: "POST",
      });
      setMessage(response.message);
    } catch {
      setMessage("Sign in to save this opportunity.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={save}
        disabled={loading}
        className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
      >
        {loading ? "Saving..." : "Save opportunity"}
      </button>
      {message ? <div className="text-sm text-cyan-100">{message}</div> : null}
    </div>
  );
}

export function ShareOpportunityButton({
  opportunity,
}: {
  opportunity: {
    title: string;
    slug: string;
    organization: string;
    excerpt?: string | null;
    deadline?: string | null;
    deadline_label?: string | null;
    location?: string | null;
    image_url?: string | null;
  };
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/opportunities/${opportunity.slug}`;
  }, [opportunity.slug]);

  const summary = useMemo(() => {
    const deadline = opportunity.deadline
      ? new Date(opportunity.deadline).toLocaleDateString()
      : opportunity.deadline_label || "Rolling";
    const location = opportunity.location || "Flexible";
    return { deadline, location };
  }, [opportunity.deadline, opportunity.deadline_label, opportunity.location]);

  async function generateSnapshotBlob(): Promise<Blob> {
    const node = cardRef.current;
    if (!node) throw new Error("Unable to generate snapshot right now.");

    const { toBlob } = await import("html-to-image");
    const blob = await toBlob(node, {
      cacheBust: true,
      pixelRatio: 2,
      // Avoid transparent backgrounds so the snapshot looks premium in WhatsApp.
      backgroundColor: "#041B6E",
    });
    if (!blob) throw new Error("Unable to generate snapshot right now.");
    return blob;
  }

  function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function shareViaWhatsApp() {
    setMessage(null);
    setLoading(true);
    try {
      const blob = await generateSnapshotBlob();
      const file = new File([blob], `alx-opportunity-${opportunity.slug}.png`, {
        type: "image/png",
      });

      const text = `ALX Opportunity: ${opportunity.title} at ${opportunity.organization}\n${shareUrl}`;

      const nav = navigator as any;
      const canShareFiles =
        typeof nav?.canShare === "function" && nav.canShare({ files: [file] });

      if (typeof nav?.share === "function" && canShareFiles) {
        await nav.share({
          title: opportunity.title,
          text,
          files: [file],
        });
        setMessage("Shared successfully.");
        return;
      }

      // Fallback: open WhatsApp share with text + link, and download the snapshot so the user can attach it.
      downloadBlob(blob, `alx-opportunity-${opportunity.slug}.png`);
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
      setMessage("Snapshot downloaded. WhatsApp opened with the link, attach the image from your downloads.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Unable to share right now.");
    } finally {
      setLoading(false);
    }
  }

  const imageSrc = resolveAssetUrl(opportunity.image_url) ?? "/media/placeholders/opportunity-default.jpg";

  return (
    <div className="space-y-3">
      <button
        onClick={shareViaWhatsApp}
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
      >
        <Share2 className="h-4 w-4" />
        {loading ? "Preparing share..." : "Share on WhatsApp"}
      </button>
      {message ? <div className="text-sm text-cyan-100">{message}</div> : null}

      {/* Off-screen share snapshot template */}
      <div className="fixed left-[-99999px] top-0 w-[720px]">
        <div ref={cardRef} className="relative overflow-hidden rounded-[36px] border border-white/12 bg-[#041B6E] shadow-[0_40px_120px_rgba(0,0,0,0.55)]">
          <div className="absolute inset-0 opacity-90">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(18,91,255,0.55),transparent_50%),radial-gradient(circle_at_85%_20%,rgba(10,210,255,0.35),transparent_55%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,27,110,0.25),rgba(4,27,110,0.92))]" />
          </div>

          <div className="relative grid grid-cols-[0.9fr_1.1fr] gap-0">
            <div className="relative h-[460px] overflow-hidden">
              <SafeImage
                src={imageSrc}
                fallbackSrc="/media/placeholders/opportunity-default.jpg"
                alt={opportunity.title}
                className="h-full w-full object-cover"
                crossOrigin="anonymous"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,27,110,0.05),rgba(4,27,110,0.88))]" />
              <div className="absolute left-8 top-8 flex items-center gap-3">
                <div className="rounded-2xl bg-white p-2">
                  <img
                    src="https://tse4.mm.bing.net/th/id/OIP.VZDimiCi78ga0VSN9cd1pAHaHa?rs=1&pid=ImgDetMain&o=7&rm=3"
                    alt="ALX"
                    className="h-10 w-10 object-contain"
                    crossOrigin="anonymous"
                  />
                </div>
                <div className="text-xs font-semibold uppercase tracking-[0.28em] text-white/80">Opportunities</div>
              </div>
            </div>

            <div className="p-10">
              <div className="space-y-5">
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-xs uppercase tracking-[0.24em] text-white/85">
                  Snapshot for WhatsApp
                  <Download className="h-4 w-4" />
                </div>
                <div className="space-y-3">
                  <div className="text-4xl font-semibold leading-tight text-white">{opportunity.title}</div>
                  <div className="text-base text-cyan-100">{opportunity.organization}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-3xl border border-white/12 bg-white/8 px-5 py-4">
                    <div className="text-xs uppercase tracking-[0.22em] text-white/65">Deadline</div>
                    <div className="mt-2 text-sm font-semibold text-white">{summary.deadline}</div>
                  </div>
                  <div className="rounded-3xl border border-white/12 bg-white/8 px-5 py-4">
                    <div className="text-xs uppercase tracking-[0.22em] text-white/65">Location</div>
                    <div className="mt-2 text-sm font-semibold text-white">{summary.location}</div>
                  </div>
                </div>
                <div className="rounded-[28px] border border-white/12 bg-white/6 px-6 py-5 text-sm leading-7 text-white/80">
                  {String(opportunity.excerpt || "Open the link for full details and application steps.")}
                </div>
                <div className="rounded-3xl bg-white px-6 py-5">
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-600">Open link</div>
                  <div className="mt-2 text-sm font-semibold text-slate-950">{shareUrl}</div>
                </div>
              </div>
              <div className="mt-6 text-xs text-white/65">
                Shared from ALX Opportunities and Alumni Hub.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
