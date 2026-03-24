import Link from "next/link";

import { AuthForm } from "@/components/forms";
import { BrandMark } from "@/components/layout";
import { GlassCard } from "@/components/ui";

export default function SignInPage() {
  return (
    <div className="content-grid page-section">
      <div className="mx-auto max-w-md">
        <GlassCard className="space-y-6">
          <BrandMark subline="Member access" />
          <div className="space-y-2">
            <div className="text-sm uppercase tracking-[0.28em] text-cyan-200">Welcome back</div>
            <h1 className="text-3xl font-semibold text-white">Sign in to your ALX Hub account</h1>
            <p className="text-sm leading-7 text-slate-300">
              Access opportunities, resources, mentoring, newsletters, and your member workspace.
            </p>
          </div>
          <AuthForm mode="sign-in" />
          <p className="text-sm text-slate-300">
            Need an account?{" "}
            <Link href="/auth/sign-up" className="text-cyan-200 hover:text-white">
              Create one here
            </Link>
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
