"use client";

import { useState } from "react";

import { clientApi } from "@/lib/client-api";

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

