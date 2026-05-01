import { defineCollection, reference } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const site = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/site" }),
  schema: z.object({
    title: z.string(),
    tagline: z.string().optional(),
    email: z.email().optional(),
    social: z
      .array(z.object({ label: z.string(), url: z.url() }))
      .default([]),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    year: z.number().optional(),
    cover: z.string().optional(),
    order: z.number().default(0),
  }),
});

const photos = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/photos" }),
  schema: z.object({
    title: z.string(),
    image: z.string(),
    alt: z.string(),
    project: reference("projects"),
    story: reference("stories").optional(),
    year: z.number().optional(),
    location: z.string().optional(),
    order: z.number().default(0),
    exif: z
      .object({
        camera: z.string().optional(),
        lens: z.string().optional(),
        focalLength: z.string().optional(),
        aperture: z.string().optional(),
        shutter: z.string().optional(),
        iso: z.number().optional(),
      })
      .optional(),
  }),
});

const stories = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/stories" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date().optional(),
    excerpt: z.string().optional(),
  }),
});

export const collections = { site, projects, photos, stories };
