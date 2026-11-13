import type { Metadata } from "next";
import { IBM_Plex_Sans_Thai, Sarabun } from "next/font/google";
import { AppProvider } from "@/components/providers/AppProvider";
import "./globals.css";

const sarabun = Sarabun({
  variable: "--font-sarabun",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
});

const ibm = IBM_Plex_Sans_Thai({
  variable: "--font-ibm",
  subsets: ["thai", "latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "AssessFlow — ระบบประเมินพนักงาน",
  description: "Employee Assessment Workflow Platform",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className={`${sarabun.variable} ${ibm.variable} h-full`}>
      <body className="min-h-full antialiased">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
