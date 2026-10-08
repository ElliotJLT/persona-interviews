import type { Metadata } from "next";
import { Funnel_Display } from "next/font/google";
import { AppShell } from "@/components/app-shell";
import { getShellData } from "@/lib/shell-data";
import "./globals.css";

// One typeface for body and display alike.
const funnel = Funnel_Display({
  variable: "--font-funnel",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Persona interviews",
  description:
    "Interview the personas who answered your simulated survey, with every claim traced to its source",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${funnel.variable} h-full antialiased`}
    >
      <body className="h-full overflow-hidden">
        <AppShell data={getShellData()}>{children}</AppShell>
      </body>
    </html>
  );
}
