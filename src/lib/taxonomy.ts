export const ALL_CATEGORIES = [
  'Política',
  'Economía',
  'Actualidad',
  'Opinión',
  'Cultura y Eventos',
  'Deportes',
  'Ciencia y Tecnología',
  'Educación',
  'Medioambiente',
  'Crónica',
  'Chile',
] as const;

export const MAIN_MENU_CATEGORIES = [
  'Política',
  'Economía',
  'Actualidad',
  'Opinión',
  'Cultura y Eventos',
  'Deportes',
  'Ciencia y Tecnología',
  'Educación',
  'Medioambiente',
  'Crónica',
] as const;

export function slugifyTaxonomy(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' y ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
