import { slugifyTaxonomy } from './taxonomy';

export function articleSlug(fileSlug: string, customSlug?: string): string {
  const manualSlug = customSlug?.trim();
  if (!manualSlug) return fileSlug;

  return slugifyTaxonomy(manualSlug) || fileSlug;
}

export function articlePath(fileSlug: string, customSlug?: string): string {
  return `/noticias/${articleSlug(fileSlug, customSlug)}/`;
}
