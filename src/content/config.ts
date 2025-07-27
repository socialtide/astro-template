import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    author: z.string().default("CLIENT NAME"),
    date: z.date(),
    tags: z.array(z.string()),
    featured: z.boolean().default(false),
    featuredImage: z.string().optional(),
    featuredImageAlt: z.string().optional(),
    readingTime: z.number().optional(),
  }),
});

export const collections = { blog };