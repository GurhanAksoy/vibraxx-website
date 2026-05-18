import type { MetadataRoute } from "next";

const BASE_URL = "https://www.vibraxx.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${BASE_URL}/sitemap_index.xml`,
      lastModified: new Date(),
    },
  ];
}