import type { JsonFile } from './jsonFile';

/** Versión para la web: el mismo cuaderno, guardado en el navegador (localStorage) en vez de en un archivo. */
export function jsonFile<T>(name: string, fallback: T, sanitize: (raw: unknown) => T, legacyName?: string): JsonFile<T> {
  const key = `juegolin:${name}`;
  const read = (k: string): string | null => {
    try {
      return globalThis.localStorage?.getItem(k) ?? null;
    } catch {
      return null;
    }
  };
  return {
    async read() {
      try {
        const raw = read(key) ?? (legacyName ? read(`juegolin:${legacyName}`) : null);
        return raw === null ? fallback : sanitize(JSON.parse(raw));
      } catch {
        return fallback;
      }
    },
    async write(value) {
      try {
        globalThis.localStorage?.setItem(key, JSON.stringify(value));
      } catch {
        // sin espacio o en modo privado: se sigue sin guardar, la app no se rompe
      }
    },
  };
}
