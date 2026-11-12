# Guía para IAs y personas que aportan a Juegolín

Lee este archivo entero antes de cambiar nada. Hazlo todo en **español de España**.

## Qué es

Juegolín: app móvil y web con un catálogo de juegos infantiles de siempre, para quien los dirige (familias,
profesorado, monitores). Lema: *Dadle el móvil a los niños y que jueguen.* Sin cuentas, sin anuncios, sin internet.
Los textos hablan a personas adultas, en tono cercano y claro, sin tecnicismos.

## Reglas generales

- **Un cambio por propuesta.** Un juego, o una mejora. No mezcles.
- Antes de enviar: `npm run validar && npm run typecheck && npm test`. Deben pasar.
- **No toques** `package.json` (versión), `app.json`, `plugins/`, `.github/workflows/` ni las licencias, salvo que la
  propuesta trate justo de eso.
- **Nunca** incluyas datos personales, correos, claves ni contraseñas.
- **Con palabras propias.** No copies texto de libros, webs ni PDF. Un juego popular no tiene dueño; su redacción sí.
- No cambies el tono de los textos que ya existen.

## Añadir un juego

Edita `src/data/games.json` y añade un objeto a `juegos`. El formato exacto está en `docs/juego.schema.json` y
`npm run validar` te dice qué falta. Mira un ejemplo completo, como `pilla-pilla`, antes de empezar.

Campos y criterios:

- `id`: en minúsculas, sin tildes y con guiones (`pilla-pilla`). Debe ser único.
- `nombre`: **el nombre en español** del juego. Los demás nombres (de otras regiones o países) van en `alias`.
  Antes de añadir, busca en el catálogo por nombre y alias: **no dupliques**; si ya existe, añade tu versión a
  `variantes` y tu nombre a `alias`.
- `resumen`: una frase de **140 letras como máximo**.
- `edades`: `3-5`, `6-8`, `9-12`, `familia` (todos juntos). Pon las que de verdad pueden jugarlo.
- `entorno`, `espacio`, `terreno`: dónde se juega. `terreno` es texto libre («Patio, parque o campo despejado»).
- `intensidad`: `calma`, `moderada` o `alta` (carreras y esfuerzo).
- `materiales` (lista cerrada) y `materialesDetalle` (texto): si solo hace falta el cuerpo, `["ninguno"]`.
- `participantes`: `min` y `max` (`null` si no hay tope). `grupo` y `organizacion` se deducen de ahí.
- `duracion`, `ruido`, `dificultad`, `habilidades`, `colecciones`, `herramientas`: valores de las listas del esquema.
  `herramientas` son las que ayudan a dirigirlo en la app: `turnos`, `marcador`, `sorteo`, `temporizador`.
- `origen`: `{ "tipo": "popular-espanol" | "otro-pais" | "moderno", "lugar": "España" }`.
- `soloEnCoche`: `true` **solo** si hace falta ir en coche, tren o autobús (matrículas, mirar por la ventanilla).
  Un juego de viaje que vale en cualquier sitio lleva `false`.
- `seccion`: la familia del juego (`tradicionales`, `agilidad`, `presentacion`, `tranquilos`, `viaje`,
  `grandes-juegos`, `acecho`, `nocturnos`).
- `pasos`: **tres listas obligatorias**: `preparacion`, `comoSeJuega` y `comoSeGana`. Frases cortas, en imperativo
  o en presente, de una en una. Si no hay ganador, dilo («No hay final: se juega hasta que os canséis»).
- `variantes`: frases sueltas, cada una autocontenida.
- No añadas campos que no estén en el esquema.

Si el juego es de los más clásicos de España, puedes proponer añadirlo a `destacados.destacados` (lista ordenada de
más a menos conocido); el equipo lo decidirá.

### Seguridad: ante la duda, pon el aviso

`seguridad` es una o dos frases concretas (nunca «ten cuidado»). `requiereAdulto: true` cuando un adulto debe
organizarlo o vigilarlo; entonces `seguridad` explica por qué (el validador lo exige). Pon aviso si el juego tiene:

- **Ojos tapados o vueltas**: espacio despejado, sin escalones, alguien atento.
- **Carreras y persecuciones**: terreno despejado, nadie empuja ni agarra.
- **Cuerdas, gomas, atados**: nunca al cuello; nudos que se suelten de un tirón.
- **Objetos duros lanzados** (palos, piedras, bolas): solo con la zona libre, nunca a la cara.
- **Piezas pequeñas, monedas, canicas, semillas**: se tragan; avisa para menores de 4 a 6 años.
- **Comida, olores, caramelos**: alergias, atragantamiento, nada de productos de limpieza.
- **Globos**: los trozos son peligrosos para menores de 8 años; látex.
- **Sillas, bancos, alturas, personas en brazos**: estables, bajas, sin subir de pie.
- **Esconderse, noche, bosque, calle, agua, fuego**: zona delimitada, adultos que la conozcan, lejos de peligros.

## Ilustraciones (opcional)

Un juego sin dibujo muestra un icono, y es válido. Para añadir uno:

- Estilo de **tinta**: trazo de línea, sin relleno, sin texto, sin marcas de agua, sobre fondo transparente.
- Archivo `assets/juegos/<id>.webp`, de unos 560 px de lado mayor y menos de 80 KB.
- Regístralo en `src/ui/illustrations.ts` (orden alfabético, igual que los demás).
- El dibujo debe ser **tuyo** o de una IA con licencia que permita publicarlo con CC BY 4.0.

## Código

TypeScript estricto, sin librería de navegación (`App.tsx` y zustand), sin dependencias nuevas sin motivo, sin
servicios de expo.dev. La interfaz es propia (`src/ui`): no uses diálogos nativos del sistema, usa `Dialog.tsx`.
Accesibilidad obligatoria: etiquetas para TalkBack, objetivos táctiles de 44 dp o más, contraste AA en los
cuatro estilos, y nunca transmitir algo solo con el color. Escribe pruebas en `src/domain/__tests__` para la
lógica nueva.

## Licencias

Código: MIT (`LICENSE`). Juegos, ilustraciones y textos: CC BY 4.0 (`LICENSE-CONTENIDO.md`). Al enviar una
propuesta aceptas que se publique así.
