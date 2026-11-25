import { defineCollection, z } from 'astro:content';

const noticias = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    urlSlug: z.string().optional(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.string(),
    author: z.string().optional(),
    authorType: z.enum(['Persona', 'Organización']).optional().default('Persona'),
    authorUrl: z.union([z.string().url(), z.literal('')]).optional(),
    authorRole: z.string().optional(),
    image: z.string().optional(),
    imageMobile: z.string().optional(),
    photoCredit: z.string().optional(),
    videoUrl: z.string().optional(),
    tags: z.array(z.string()).optional().default([]),
    titular_principal: z.boolean().optional().default(false),
    es_comunicado: z.boolean().optional().default(false),
    sponsored: z.boolean().optional().default(false),
    sponsorName: z.string().optional(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
  }),
});

export const collections = { noticias };
