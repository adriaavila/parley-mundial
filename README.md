# Parleyia · La Jugada Mundialera

Parleyia es una quiniela social para vivir el Mundial 2026 con amigos: cada persona crea su perfil, se une a ligas privadas, pronostica marcadores partido por partido y comparte su ranking como una story.

El repositorio se llama `parlai-mundial`, pero la experiencia de producto se presenta como **Parleyia**.

## Que incluye

- Calendario de fase de grupos con 72 partidos, sedes, ciudades, grupos y selecciones cargadas en la app.
- Picks con marcador exacto y bonus por partido, bloqueados automaticamente cuando empieza el encuentro.
- Ligas privadas con codigo de invitacion de 6 caracteres.
- Sincronizacion en tiempo real con Convex para perfiles, ligas, membresias, picks y tablas.
- Registro e inicio de sesion con email y password, mas sesiones persistentes.
- Tabla de posiciones por liga, actividad reciente y ranking personal.
- Vista para compartir invitaciones, top 5, ranking y rivalidades como imagen descargable o via Web Share API.
- Exportacion de picks a JSON y calendario del Mundial a `.ics`.
- PWA basica con manifest, icono SVG, metadata social y Open Graph dinamico.

## Stack

- **Next.js 16** con App Router, React 19 y Turbopack.
- **Tailwind CSS 4** con tokens y estilos propios en `src/app/globals.css`.
- **Convex** para datos, queries, mutations y suscripciones en vivo.
- **Node test runner** para pruebas unitarias de scoring.
- Preparado para deploy en **Vercel**.

> Importante: este proyecto usa Next.js 16. Antes de cambiar APIs, convenciones o estructura de archivos de Next, revisa la documentacion local en `node_modules/next/dist/docs/`.

## Requisitos

- Node.js compatible con Next.js 16.
- pnpm.
- Una deployment de Convex.

## Configuracion local

Instala dependencias:

```bash
pnpm install
```

Crea `.env.local`:

```bash
NEXT_PUBLIC_CONVEX_URL=https://<tu-deployment>.convex.cloud
CONVEX_DEPLOYMENT=dev:<tu-deployment>

# Opcional: usado para metadata canonical, OG y Twitter cards.
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

En una terminal, sincroniza schema y funciones de Convex:

```bash
pnpm dlx convex dev
```

En otra terminal, arranca la app:

```bash
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Scripts

| Comando | Proposito |
| --- | --- |
| `pnpm dev` | Servidor de desarrollo de Next.js |
| `pnpm build` | Build de produccion |
| `pnpm start` | Servir el build de produccion localmente |
| `pnpm lint` | ESLint |
| `pnpm test` | Pruebas unitarias del scoring |
| `pnpm dlx convex dev` | Desarrollo local de Convex con schema y funciones |
| `pnpm dlx convex deploy` | Deploy de Convex |

## Flujo de producto

1. El usuario crea cuenta o inicia sesion.
2. Crea una liga privada o entra a una existente con codigo.
3. Recorre el calendario por grupo, partido o seleccion.
4. Guarda marcadores antes del cierre de cada partido.
5. Sus picks se replican en las ligas donde participa.
6. La tabla de su liga se actualiza con picks, exactos, resultados correctos y puntos.
7. Puede compartir una imagen social o exportar sus picks/calendario.

## Estructura

```text
src/app/
  page.tsx              App principal: inicio, partidos, tabla, liga, share y perfil
  globals.css           Sistema visual, responsive layout y componentes
  providers.tsx         ConvexReactClient y ConvexProvider
  layout.tsx            Metadata, fonts, viewport y root shell
  manifest.ts           Manifest PWA
  opengraph-image.tsx   Imagen OG dinamica
  error.tsx             Error boundary de App Router
  not-found.tsx         Pantalla 404
  icon.svg              Icono de la app

src/lib/
  scoring.js            Reglas de puntuacion compartidas
  scoring.d.ts          Tipos publicos del scorer

convex/
  schema.ts             Tablas e indices
  users.ts              Signup, login, sesiones, perfil y usuario anonimo legacy
  leagues.ts            Crear, unirse, listar, miembros y salir de ligas
  picks.ts              Guardar picks, actividad reciente y leaderboard

tests/
  scoring.test.mjs      Pruebas de puntuacion
```

## Modelo de datos

Convex define cinco tablas principales:

- `users`: perfil, email, hash/salt de password, handle, avatar y equipo favorito.
- `sessions`: tokens hasheados con expiracion para mantener sesion.
- `leagues`: nombre, codigo privado y owner.
- `memberships`: relacion usuario-liga con rol.
- `picks`: marcador, bonus, usuario, liga, fixture y fecha de actualizacion.

Los indices estan pensados para las consultas principales de la app: usuario por sesion, liga por codigo, ligas de un usuario, miembros de una liga y picks por liga/usuario/partido.

## Scoring

La regla de puntuacion vive en `src/lib/scoring.js` y se prueba en `tests/scoring.test.mjs`.

- Marcador exacto: 5 puntos.
- Resultado correcto sin exacto: 3 puntos.
- Diferencia de gol correcta: 1 punto.
- Goles del local correctos: 1 punto.
- Goles del visitante correctos: 1 punto.
- Partido sin resultado cargado: 0 puntos.

Un marcador exacto puede llegar a 8 puntos porque tambien coincide con diferencia y goles de ambos equipos.

En `convex/picks.ts`, `MATCH_RESULTS` esta preparado como fuente de resultados oficiales, pero actualmente esta vacio. Hasta que se carguen resultados, las tablas muestran picks y actividad, con puntos en cero.

## Deploy

1. Crea o selecciona una deployment de Convex.
2. Configura variables en Vercel:

```bash
NEXT_PUBLIC_CONVEX_URL=https://<production-deployment>.convex.cloud
NEXT_PUBLIC_SITE_URL=https://<tu-dominio>
```

3. Despliega Convex antes o durante el build:

```bash
npx convex deploy --cmd 'pnpm build'
```

4. Importa el repo en Vercel y usa pnpm como package manager.

## Notas de desarrollo

- `convex/_generated` y `next-env.d.ts` se generan localmente y estan ignorados por Git.
- `.env*`, `.next/`, `node_modules/` y builds locales no se versionan.
- La UI vive mayoritariamente en `src/app/page.tsx`; si crece mucho, el siguiente paso natural es separar pantallas y componentes.
- Las selecciones y fixtures estan hardcodeados en el cliente por ahora. Para produccion, conviene moverlos a una fuente versionada o a Convex.

## Roadmap

- Cargar resultados reales y automatizar el scoring.
- Agregar autenticacion gestionada o social login.
- Separar componentes grandes de la pantalla principal.
- Mejorar permisos de liga para admins y owner.
- Anadir notificaciones antes del cierre de partidos.
- Importar fixtures/resultados desde una fuente externa confiable.
