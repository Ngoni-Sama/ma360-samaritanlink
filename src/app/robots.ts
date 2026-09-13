import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/app/", "/api/", "/site"],
    },
    sitemap: "https://ma360-samaritanlink.vercel.app/sitemap.xml",
  };
}
