import type { MetadataRoute } from "next";

// A private invitation: nothing here should be crawled (handoff §37).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", disallow: "/" },
  };
}
