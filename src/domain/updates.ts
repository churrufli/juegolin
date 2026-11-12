import build from '../data/build.json';

/** Repositorio cuyas Releases de GitHub publican las APK. */
export const RELEASES_REPO = 'churrufli/juegolin';
export const RELEASES_PAGE = `https://github.com/${RELEASES_REPO}/releases`;

/** Número de compilación de esta APK: lo escribe la compilación de GitHub en build.json (0 en desarrollo). */
export const BUILD: number = build.build;

export interface Release {
  readonly build: number;
  readonly name: string;
  readonly url: string;
  readonly apk: string | null;
}

/** Saca el número de compilación de una etiqueta como «v0.2.0-build134». */
export const buildOf = (tag: string): number => Number(/build(\d+)/.exec(tag)?.[1] ?? 0);

/** De la lista de Releases de la API de GitHub, la compilación más nueva con APK. */
export function newestRelease(raw: unknown): Release | null {
  if (!Array.isArray(raw)) return null;
  let best: Release | null = null;
  for (const r of raw) {
    if (typeof r !== 'object' || r === null) continue;
    const o = r as Record<string, unknown>;
    if (o.draft === true || typeof o.tag_name !== 'string') continue;
    const n = buildOf(o.tag_name);
    if (n === 0 || (best && best.build >= n)) continue;
    const assets = Array.isArray(o.assets) ? (o.assets as Record<string, unknown>[]) : [];
    const apk = assets.find((a) => typeof a.name === 'string' && a.name.endsWith('.apk'));
    best = {
      build: n,
      name: typeof o.name === 'string' && o.name ? o.name : o.tag_name,
      url: typeof o.html_url === 'string' ? o.html_url : RELEASES_PAGE,
      apk: typeof apk?.browser_download_url === 'string' ? apk.browser_download_url : null,
    };
  }
  return best;
}

export type UpdateCheck = { readonly kind: 'new'; readonly release: Release } | { readonly kind: 'current' } | { readonly kind: 'error' };

export async function checkForUpdate(current = BUILD, fetcher: typeof fetch = fetch): Promise<UpdateCheck> {
  try {
    const res = await fetcher(`https://api.github.com/repos/${RELEASES_REPO}/releases?per_page=20`, { headers: { Accept: 'application/vnd.github+json' } });
    if (!res.ok) return { kind: 'error' };
    const release = newestRelease(await res.json());
    if (!release) return { kind: 'error' };
    return release.build > current ? { kind: 'new', release } : { kind: 'current' };
  } catch {
    return { kind: 'error' };
  }
}
