import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import siteData from "../data/site.json";

export async function GET(context) {
  const posts = await getCollection("blog");

  return rss({
    title: `${siteData.siteName} Blog`,
    description: siteData.defaultDescription,
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
      link: `/blog/${post.slug}/`,
      author: `${post.data.author}@example.com (${post.data.author})`,
      categories: post.data.tags,
    })),
    customData: `<language>en-us</language>`,
  });
}
