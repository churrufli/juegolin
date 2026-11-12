# Cómo aportar a Juegolín

¡Gracias! Cualquier persona puede proponer cambios. Una persona del proyecto los revisa antes de que entren.

## Lo que más ayuda

1. **Un juego nuevo** (o una variante de uno existente).
2. **Mejorar una ficha**: pasos más claros, material más preciso, un aviso de seguridad que falta.
3. **Ilustraciones** en el estilo de tinta de la app (varios juegos aún no tienen dibujo).
4. **Fallos y accesibilidad** de la app.

## Paso a paso

1. Haz un *fork* del repositorio y crea una rama.
2. Haz **un solo cambio** por propuesta (un juego, una mejora…). Así se revisa rápido.
3. Antes de enviar, ejecuta:
   ```bash
   npm ci
   npm run validar      # comprueba el catálogo
   npm run typecheck
   npm test
   ```
4. Abre un *pull request* y rellena la lista de comprobación. Una revisión automática repite esas pruebas.

## Si lo haces con una IA

Es bienvenido. Dile a tu IA que lea [AGENTS.md](AGENTS.md) antes de empezar, **lee tú el resultado** y envíalo como
cualquier otra propuesta. Las aportaciones de IA se revisan igual que las demás.

## Normas

- **Con tus palabras.** No copies textos de libros, webs o PDF: los juegos son de todos, la redacción es de quien
  la escribe. Si conoces el nombre original o regional, ponlo en `alias`.
- **Seguridad primero.** Ante la duda, pon el aviso. Ver [AGENTS.md](AGENTS.md).
- **Sin datos personales ni claves**, ni en los textos ni en los archivos.
- **Respeto.** Juegos para niños y jóvenes: nada que excluya, humille o asuste.
- **Licencias.** Tu aportación se publica con las licencias del proyecto: código MIT, contenido CC BY 4.0.

No cambies la versión, la firma ni los archivos de compilación: eso lo hace el equipo al publicar.
