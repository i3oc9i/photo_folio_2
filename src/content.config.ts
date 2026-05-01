import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const photos = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/photos" }),
  schema: z.object({
    title: z.string(),
    year: z.number(),
    location: z.string().optional(),
    series: z.string().optional(),
    image: z.string(),
    alt: z.string(),
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
    story: z.string().optional(),
    order: z.number().default(0),
  }),
});

const series = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/series" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    cover: z.string().optional(),
    year: z.number().optional(),
    order: z.number().default(0),
  }),
});

export const collections = { photos, series };
