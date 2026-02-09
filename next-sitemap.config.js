/** @type {import("next-sitemap").IConfig} */
const siteUrl = (
  process.env.NEXT_PUBLIC_APP_URL || "https://www.shelfcue.com"
).replace(/\/$/, "");

module.exports = {
  siteUrl,
  generateRobotsTxt: true,
  sitemapSize: 7000,
  exclude: ["/server-sitemap.xml"],
  robotsTxtOptions: {
    policies: [{ userAgent: "*", allow: "/" }],
  },
};
