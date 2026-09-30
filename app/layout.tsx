import type { Metadata, Viewport } from "next";
import { Cormorant, Jost } from "next/font/google";
import { FloralCorners } from "@/components/Decor/FloralCorners";
import { MotionProvider } from "@/components/Motion/MotionProvider";
import { themeInitScript } from "@/components/Theme/theme";
import { wedding } from "@/lib/wedding";
import "./globals.css";

// Placeholder pairing until the typography is finalised in Figma.
// Variable font: Cormorant_Garamond's static italic files break Turbopack's dev font loader.
const cormorant = Cormorant({
  variable: "--font-cormorant",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${wedding.couple.displayName} · ${wedding.date.display}`,
  description: `You're invited to the wedding of ${wedding.couple.displayName}, ${wedding.date.display}, ${wedding.location.city}.`,
  // Private invitation: keep every page out of search results (handoff §37).
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#f5f1e8",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme={wedding.settings.theme}
      className={`${cormorant.variable} ${jost.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <FloralCorners />
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
