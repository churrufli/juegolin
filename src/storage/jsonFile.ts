import { File, Paths } from 'expo-file-system';

export interface JsonFile<T> {
  read(): Promise<T>;
  write(value: T): Promise<void>;
}

/** Archivo JSON en la carpeta de documentos de la app, con escrituras en cola para no pisarse. */
export function jsonFile<T>(name: string, fallback: T, sanitize: (raw: unknown) => T, legacyName?: string): JsonFile<T> {
  let queue: Promise<void> = Promise.resolve();
  const file = () => new File(Paths.document, name);

  return {
    async read() {
      try {
        const current = file();
        const f = current.exists || !legacyName ? current : new File(Paths.document, legacyName);
        if (!f.exists) return fallback;
        return sanitize(JSON.parse(await f.text()));
      } catch {
        return fallback;
      }
    },
    write(value) {
      queue = queue
        .then(async () => {
          const f = file();
          if (!f.exists) f.create();
          await f.write(JSON.stringify(value));
        })
        .catch(() => undefined);
      return queue;
    },
  };
}
