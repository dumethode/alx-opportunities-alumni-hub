"use client";

import dynamic from "next/dynamic";

const DynamicMap = dynamic(() => import("@/components/map-inner"), {
  ssr: false,
  loading: () => (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 text-sm text-slate-300">
      Loading hub map...
    </div>
  ),
});

export function HubMap({
  items,
}: {
  items: Array<{ name: string; latitude: string; longitude: string; address: string }>;
}) {
  return <DynamicMap items={items} />;
}

