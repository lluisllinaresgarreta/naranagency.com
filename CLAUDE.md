# NARAN Agency — Instrucciones para Claude Code

## Qué es este proyecto

Web de **NARAN**, agencia de marketing digital en Barcelona: una home y 5 páginas de servicio. HTML + CSS + JS puro, sin frameworks ni build tools.

Dominio: https://naranagency.com (Netlify, también en https://naranagency.netlify.app)

## Stack

- HTML por página; estilos compartidos en `assets/css/naran.css` (los tokens de diseño están en `:root`) y estilos propios de cada página inline en su `<style>`
- Motor de animación compartido: `assets/js/naran.js` (las páginas se enganchan con `NARAN.ready(fn)`)
- Librerías locales en `assets/js/vendor/`: GSAP, ScrollTrigger, SplitText y Lenis (scroll suave solo en escritorio)
- Tipografía Inter alojada en local (`assets/fonts/`)
- Analytics: OpenPanel (snippet en el `<head>` de cada página, clientId ya configurado)
- SEO: `robots.txt`, `sitemap.xml`, canonical y Open Graph en cada página
- Hosting: Netlify (conectado a GitHub, auto-deploy en cada merge a `main`)
- Repositorio: https://github.com/lluisllinaresgarreta/naranagency.com

## Estructura de archivos

```
naranagency.com/
├── index.html                  ← home
├── servicios/
│   ├── social-media-management.html
│   ├── diseno-web-shopify.html
│   ├── optimizacion-cro.html
│   ├── paid-media-funnels.html
│   └── growth-system.html
├── assets/
│   ├── css/naran.css           ← design system compartido
│   ├── js/naran.js             ← animaciones compartidas
│   ├── js/vendor/              ← GSAP, ScrollTrigger, SplitText, Lenis
│   ├── fonts/                  ← Inter (woff2)
│   ├── video/ covers/ videos/ clients/
├── robots.txt
├── sitemap.xml                 ← actualizar si se añade o renombra una página
├── netlify.toml                ← cabeceras + redirecciones 301 de las URLs antiguas
└── CLAUDE.md
```

## Workflow obligatorio — leer antes de tocar código

La rama `main` está **protegida**. Nunca se hace push directo a main.
GitHub bloquea el merge si la rama no está actualizada con main — siempre hay que sincronizar antes de crear el PR.

```
# 1. Partir siempre del main más reciente
git checkout main
git pull origin main
git checkout -b feature/nombre-descriptivo

# 2. Hacer los cambios en las páginas HTML o en assets/

# 3. Probar en local con un servidor: python3 -m http.server 8080

# 4. Antes de crear el PR, sincronizar con main por si alguien mergeó algo
git fetch origin
git merge origin/main   # si hay cambios nuevos, los incorpora

# 5. Subir la rama y crear PR
git add .
git commit -m "descripción del cambio"
git push origin feature/nombre-descriptivo
gh pr create --title "título" --body "descripción"

# 6. El PR necesita 1 aprobación antes de mergear
# 7. Al mergear a main → Netlify despliega automáticamente
```

Netlify genera una **preview URL** automática para cada PR — úsala para revisar antes de aprobar.


## Reglas de código

- No tocar nada directamente en main — siempre rama + PR
- No inventar datos del negocio (servicios, precios, contacto) — usar solo datos reales
- Si se necesitan imágenes o assets nuevos (logos, emojis, fotos), **pedírselos al usuario** antes de intentar recrearlos con código
- No añadir dependencias externas: las librerías van en `assets/js/vendor/`
- Usar los tokens de `:root` en `naran.css` para colores, radios y sombras; no meter colores sueltos nuevos
- Respetar `prefers-reduced-motion`: toda animación nueva debe pasar por `NARAN.reduced`

## Deploy

Netlify está conectado a GitHub. **No usar `npx netlify deploy` manualmente** — el deploy ocurre solo al mergear a `main`.

Para preview local: `python3 -m http.server 8080` en la raíz y abrir http://localhost:8080 (los vídeos y fuentes no cargan bien abriendo el archivo directamente).
