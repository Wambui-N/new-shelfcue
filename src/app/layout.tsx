import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import JsonLd from "@/components/JsonLd";
import { cn } from "@/lib/utils";
import { fontSans } from "@/lib/fonts";

const siteConfig = {
  name: "ShelfCue",
  description:
    "Capture leads, schedule meetings, and automate workflows with smart forms.",
  url: "https://shelfcue.com",
  ogImage: "https://shelfcue.com/og.png",
  links: {
    twitter: "https://twitter.com/shelfcue",
    github: "https://github.com/shelfcue/shelfcue",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: siteConfig.name,
  description: siteConfig.description,
  url: siteConfig.url,
  logo: `${siteConfig.url}/logo.png`,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "29.00",
    priceCurrency: "USD",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "88",
  },
};

export const metadata: Metadata = {
  title:
    "ShelfCue - Beautiful Google Sheets Form Builder | The Best Google Forms Alternative",
  description:
    "Create branded, responsive forms that connect directly to Google Sheets. No Zapier needed. The perfect Google Forms alternative for small businesses. Custom form builder with file uploads, mobile-first design, and automatic Google Sheets sync.",
  keywords: [
    "google forms alternative",
    "form builder for google sheets",
    "customizable form builder",
    "embed google form on website",
    "contact form for small business",
    "no-code form builder",
    "responsive form builder",
    "file upload form google drive",
    "form to google sheets",
    "custom google forms",
  ],
  authors: [{ name: "ShelfCue Team" }],
  creator: "ShelfCue",
  publisher: "ShelfCue",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://shelfcue.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ShelfCue - Beautiful Google Sheets Form Builder",
    description:
      "Create branded, responsive forms that connect directly to Google Sheets. No Zapier needed. The perfect Google Forms alternative for small businesses.",
    url: "https://shelfcue.com",
    siteName: "ShelfCue",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ShelfCue - Beautiful Google Sheets Form Builder",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ShelfCue - Beautiful Google Sheets Form Builder",
    description:
      "Create branded, responsive forms that connect directly to Google Sheets. No Zapier needed.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to Google Fonts for better performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />

        {/* Schema.org structured data */}
      </head>
      <body className={cn("min-h-screen bg-background", fontSans.className)}>
        <Toaster />
        <JsonLd data={jsonLd} />
        <AuthProvider>{children}</AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
