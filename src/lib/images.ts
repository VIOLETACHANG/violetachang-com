const imagePresets = {
  card: 'f_auto,q_auto,w_640,h_360,c_fill,g_auto',
  cardMobile: 'f_auto,q_auto,w_720,h_900,c_fill,g_auto',
  hero: 'f_auto,q_auto,w_1280,h_720,c_fill,g_auto',
  heroMobile: 'f_auto,q_auto,w_960,h_1200,c_fill,g_auto',
  article: 'f_auto,q_auto,w_1600,c_limit',
  articleMobile: 'f_auto,q_auto,w_960,h_1200,c_fill,g_auto',
  social: 'f_auto,q_auto,w_1200,h_630,c_fill,g_auto',
  source: 'f_auto,q_auto',
} as const;

type ImagePreset = keyof typeof imagePresets;

export function articleImageUrl(src: string | undefined, preset: ImagePreset): string | undefined {
  if (!src) return undefined;
  const marker = '/image/upload/';
  const markerIndex = src.indexOf(marker);
  if (markerIndex === -1 || !src.includes('res.cloudinary.com')) return src;

  const rest = src.slice(markerIndex + marker.length);
  const firstSegment = rest.split('/')[0] ?? '';
  if (firstSegment.includes(',')) return src;

  return `${src.slice(0, markerIndex + marker.length)}${imagePresets[preset]}/${rest}`;
}
