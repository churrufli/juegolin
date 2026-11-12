import { buildOf, checkForUpdate, newestRelease } from '../updates';

const releases = [
  { tag_name: 'v0.1.0-build102', name: 'Juegolín 0.1.0', html_url: 'https://x/102', draft: false, assets: [{ name: 'a.apk', browser_download_url: 'https://x/a.apk' }] },
  { tag_name: 'v0.2.0-build110', name: '', html_url: 'https://x/110', draft: false, assets: [{ name: 'b.apk', browser_download_url: 'https://x/b.apk' }] },
  { tag_name: 'v0.3.0-build120', draft: true, assets: [] },
];

describe('actualizaciones', () => {
  it('lee el número de compilación de la etiqueta', () => {
    expect(buildOf('v0.2.0-build134')).toBe(134);
    expect(buildOf('v1')).toBe(0);
  });

  it('elige la más nueva que no sea borrador', () => {
    expect(newestRelease(releases)).toEqual({ build: 110, name: 'v0.2.0-build110', url: 'https://x/110', apk: 'https://x/b.apk' });
    expect(newestRelease('nada')).toBeNull();
  });

  it('avisa solo si hay una compilación más nueva', async () => {
    const ok = (async () => ({ ok: true, json: async () => releases })) as unknown as typeof fetch;
    expect((await checkForUpdate(102, ok)).kind).toBe('new');
    expect((await checkForUpdate(110, ok)).kind).toBe('current');
    const down = (async () => ({ ok: false, json: async () => ({}) })) as unknown as typeof fetch;
    expect((await checkForUpdate(102, down)).kind).toBe('error');
    const offline = (async () => { throw new Error('sin red'); }) as unknown as typeof fetch;
    expect((await checkForUpdate(102, offline)).kind).toBe('error');
  });
});
