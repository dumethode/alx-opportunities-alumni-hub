import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SiteShell } from "@/components/layout";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "ALX Opportunities & Alumni Hub",
  description: "Premium career, events, and alumni community platform for ALX learners and alumni.",
  icons: {
    icon: "https://tse4.mm.bing.net/th/id/OIP.VZDimiCi78ga0VSN9cd1pAHaHa?rs=1&pid=ImgDetMain&o=7&rm=3",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
