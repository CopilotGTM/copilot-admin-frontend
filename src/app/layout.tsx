import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import Providers from "./providers";
import AuthProvider from "../components/auth-provider";
import { Toaster } from "../components/ui/toaster";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const inter = Inter({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const metadataBase = new URL(process.env.NEXT_PUBLIC_ADMIN_APP_URL ?? "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase,
  title: "Copilot-GTM Admin",
  description: "Copilot-GTM admin operations hub",
  icons: {
    icon: [{ url: "/logo-icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/logo-icon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    title: "Copilot-GTM Admin",
    description: "Copilot-GTM admin operations hub",
    siteName: "Copilot-GTM Admin",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Copilot-GTM",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Copilot-GTM Admin",
    description: "Copilot-GTM admin operations hub",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable, inter.variable)} suppressHydrationWarning>
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased">
        <Providers>
          <Suspense fallback={null}>
            <AuthProvider>{children}</AuthProvider>
          </Suspense>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
