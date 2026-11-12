# Juegolín

**Dadle el móvil a los niños y que jueguen.** · *Ayuda y dinamiza el juego para niños y jóvenes.*

Juegolín es un cuaderno con más de 460 juegos de siempre, pensado para quien los dirige: familias, profesorado y
monitores. Buscas con filtros o con un asistente de preguntas, lees la ficha en tres pasos (preparación, cómo se
juega, cómo se gana), pones en marcha la partida (turnos, marcador, sorteos y temporizador) y apuntas quién ha
jugado en un cuaderno de sellos y firmas. Sin cuentas, sin anuncios y sin internet: todo se guarda en tu móvil.

- **Web:** <https://churrufli.github.io/juegolin/>
- **Android (APK):** [Releases](https://github.com/churrufli/juegolin/releases)

## Ayúdanos a crecer

Juegolín es abierto y **cualquiera puede aportar**, a mano o con ayuda de su IA (Claude, Copilot, ChatGPT…):

- Añadir un juego que falta o mejorar una ficha.
- Revisar avisos de seguridad.
- Dibujar una ilustración, arreglar un fallo o mejorar la accesibilidad.

Cómo hacerlo, en [CONTRIBUTING.md](CONTRIBUTING.md). Si trabajas con una IA, pídele que lea primero
[AGENTS.md](AGENTS.md): le explica el formato, el tono y las normas de seguridad. Cada propuesta pasa una
revisión automática y la aprueba una persona antes de entrar.

¿Solo quieres sugerir un juego? [Abre una propuesta](https://github.com/churrufli/juegolin/issues/new/choose).

## Para desarrollar

Expo SDK 58 + React Native 0.88 + React 19 + TypeScript estricto. Sin librería de navegación (`App.tsx` + zustand),
datos en JSON, interfaz propia en `src/ui` y sin servicios de expo.dev.

```bash
npm ci
npm run validar     # comprueba el catálogo de juegos
npm run typecheck
npm test
npx expo start --web
```

- Catálogo: `src/data/games.json`, con su esquema en `docs/juego.schema.json`.
- Ilustraciones: `assets/juegos/<id>.webp`, registradas en `src/ui/illustrations.ts`.
- Scripts de dibujos, iconos y logo: `scripts/`.

## Accesibilidad

- Contrastes AA comprobados en tests para los 4 estilos (Papiro, Pizarra, Lápices, Contraste alto).
- Etiquetas y estados para TalkBack en todos los controles; anuncios al cambiar de pantalla, turno o sorteo.
- Objetivos táctiles de 44–48 dp, letra «Grande» y respeto del tamaño de letra del sistema.
- Jugadores con color **y forma**. Animaciones mínimas si el sistema lo pide o desde Opciones.

## APK y web

- **Web:** `.github/workflows/web.yml` la publica en GitHub Pages con cada cambio en `main`
  (Settings → Pages → Source: GitHub Actions).
- **APK:** `.github/workflows/apk.yml`, se lanza a mano (Actions → APK Android → Run workflow). Compila arm64 y
  publica en Releases. Para firmar con clave propia, añade los secretos `ANDROID_KEYSTORE_BASE64`,
  `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS` y `ANDROID_KEY_PASSWORD` en Settings → Secrets → Actions.
  Sin ellos se publica como prerelease «PRUEBA», firmada con la clave de depuración.

## Licencias

- Código: [MIT](LICENSE).
- Juegos, ilustraciones y textos: [CC BY 4.0](LICENSE-CONTENIDO.md).
