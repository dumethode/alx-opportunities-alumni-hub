import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SiteShell } from "@/components/layout";
import "./globals.css";

export const metadata: Metadata = {
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
    <html lang="en">
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
