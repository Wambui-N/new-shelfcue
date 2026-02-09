import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { AuthProvider } from "@/contexts/AuthContext";

const satoshi = localFont({
  src: [
    {
      path: "../../public/fonts/Satoshi-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/Satoshi-LightItalic.otf",
      weight: "300",
      style: "italic",
    },
    {
      path: "../../public/fonts/Satoshi-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Satoshi-Italic.otf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../../public/fonts/Satoshi-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/Satoshi-MediumItalic.otf",
      weight: "500",
      style: "italic",
    },
    {
      path: "../../public/fonts/Satoshi-Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/Satoshi-BoldItalic.otf",
      weight: "700",
      style: "italic",
    },
    {
      path: "../../public/fonts/Satoshi-Black.otf",
      weight: "900",
      style: "normal",
    },
    {
      path: "../../public/fonts/Satoshi-BlackItalic.otf",
      weight: "900",
      style: "italic",
    },
  ],
  variable: "--font-satoshi",
  display: "swap",
});

const BASE_URL =
  (typeof process.env.NEXT_PUBLIC_APP_URL !== "undefined"
    ? process.env.NEXT_PUBLIC_APP_URL
    : "https://www.shelfcue.com"
  ).replace(/\/$/, "");

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
  metadataBase: new URL(BASE_URL),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ShelfCue - Beautiful Google Sheets Form Builder",
    description:
      "Create branded, responsive forms that connect directly to Google Sheets. No Zapier needed. The perfect Google Forms alternative for small businesses.",
    url: BASE_URL,
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
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "ShelfCue",
              description:
                "Beautiful Google Sheets form builder. Create branded, responsive forms that connect directly to Google Sheets without Zapier.",
              url: BASE_URL,
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "17",
                priceCurrency: "USD",
                availability: "https://schema.org/InStock",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.9",
                ratingCount: "1000",
              },
              creator: {
                "@type": "Organization",
                name: "Made with Make",
                url: "https://madewithmake.com",
              },
            }),
          }}
        />
      </head>
      <body
        className={`${satoshi.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>{children}</AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
