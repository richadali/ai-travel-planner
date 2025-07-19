const fs = require("fs");
const path = require("path");

// Define the base URL
const BASE_URL = "https://aitravelplanner.richadali.dev";

// Define the static pages
const staticPages = [
  { url: "/", changefreq: "daily", priority: 1.0 },
  { url: "/login", changefreq: "monthly", priority: 0.5 },
  { url: "/dashboard", changefreq: "daily", priority: 0.8 },
  { url: "/destinations/paris", changefreq: "weekly", priority: 0.6 },
  { url: "/destinations/new-york", changefreq: "weekly", priority: 0.6 },
  { url: "/destinations/tokyo", changefreq: "weekly", priority: 0.6 },
  { url: "/destinations/london", changefreq: "weekly", priority: 0.6 },
  { url: "/destinations/dubai", changefreq: "weekly", priority: 0.6 },
];

// Generate the sitemap XML
function generateSitemap() {
  const today = new Date().toISOString();

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  // Add static pages
  staticPages.forEach((page) => {
    sitemap += `
  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
  });

  sitemap += `
</urlset>`;

  return sitemap;
}

// Generate the sitemap index XML
function generateSitemapIndex() {
  const today = new Date().toISOString();

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${BASE_URL}/sitemap.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>`;
}

// Write the sitemap files
function writeSitemaps() {
  const publicDir = path.join(__dirname, "..", "public");

  // Ensure the public directory exists
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Write the sitemap.xml file
  fs.writeFileSync(path.join(publicDir, "sitemap.xml"), generateSitemap());

  // Write the sitemap-index.xml file
  fs.writeFileSync(
    path.join(publicDir, "sitemap-index.xml"),
    generateSitemapIndex()
  );

  console.log("Sitemaps generated successfully!");
}

// Run the script
writeSitemaps();
