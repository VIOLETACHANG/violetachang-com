import { defineCollection, z } from 'astro:content';

const noticias = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    category: z.string(),
    author: z.string().default('Violeta Chang B.'),
    authorRole: z.string().optional(),
    image: z.string().optional(),
    photoCredit: z.string().optional(),
    videoUrl: z.string().optional(),
    sponsored: z.boolean().default(false),
    sponsorName: z.string().optional(),
  }),
});

export const collections = { noticias };
