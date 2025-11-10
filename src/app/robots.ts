import type { MetadataRoute } from "next";

const DEFAULT_BASE_URL = "https://www.shelfcue.com";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? DEFAULT_BASE_URL;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    host: baseUrl,
    sitemap: [`${baseUrl.replace(/\/$/, "")}/sitemap.xml`],
  };
}


