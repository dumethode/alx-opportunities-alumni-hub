import Link from "next/link";

import { AuthForm } from "@/components/forms";
import { BrandMark } from "@/components/layout";
import { GlassCard } from "@/components/ui";

export default function SignUpPage() {
  return (
    <div className="content-grid page-section">
      <div className="mx-auto max-w-md">
        <GlassCard className="space-y-6">
          <BrandMark subline="Create your member profile" />
          <div className="space-y-2">
            <div className="text-sm uppercase tracking-[0.28em] text-cyan-200">Join the platform</div>
            <h1 className="text-3xl font-semibold text-white">Create your ALX Hub account</h1>
            <p className="text-sm leading-7 text-slate-300">
              Register to unlock resources, alumni discovery, trackers, mentoring, newsletters, and support services.
            </p>
          </div>
          <AuthForm mode="sign-up" />
          <p className="text-sm text-slate-300">
            Already a member?{" "}
            <Link href="/auth/sign-in" className="text-cyan-200 hover:text-white">
              Sign in
            </Link>
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
