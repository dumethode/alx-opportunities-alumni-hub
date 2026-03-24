import { BrandMark } from "@/components/layout";
import { GlassCard } from "@/components/ui";

export default function ForgotPasswordPage() {
  return (
    <div className="content-grid page-section">
      <div className="mx-auto max-w-md">
        <GlassCard className="space-y-4">
          <BrandMark subline="Password support" />
          <div className="text-sm uppercase tracking-[0.28em] text-cyan-200">Password help</div>
          <h1 className="text-3xl font-semibold text-white">Forgot password flow</h1>
          <p className="text-sm leading-7 text-slate-300">
            Reset email delivery is the remaining step here. Until that is wired, use the contact team for manual help if needed.
          </p>
          <a href="mailto:support@alxafrica.com" className="inline-flex w-fit rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950">
            Contact support
          </a>
        </GlassCard>
      </div>
    </div>
  );
}
