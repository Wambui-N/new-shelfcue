/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: 'https://www.shelfcue.com', // ← replace with your live domain
    generateRobotsTxt: true,         // generates robots.txt automatically
    sitemapSize: 7000,               // splits large sitemaps if needed
    exclude: ['/server-sitemap.xml'], // optional, skip internal routes
    robotsTxtOptions: {
      policies: [
        { userAgent: '*', allow: '/' },
      ],
    },
  };
  