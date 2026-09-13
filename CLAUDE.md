# NARAN Agency — Instrucciones para Claude Code

## Qué es este proyecto

Web de una sola página para **NARAN**, agencia de marketing digital. Es un único archivo `index.html` autocontenido (CSS y JS inline). Sin frameworks, sin build tools. Se abre directamente en el navegador.

Está desplegada en: https://naranagency.netlify.app

## Stack

- HTML + CSS + JS puro, todo en `index.html`
- Animaciones: SVG SMIL (`animateMotion`, `animate`) + CSS keyframes
- Analytics: OpenPanel (snippet en el `<head>`, clientId ya configurado)
- Hosting: Netlify (conectado a GitHub, auto-deploy en cada merge a `main`)
- Repositorio: https://github.com/lluisllinaresgarreta/naranagency.com

## Estructura de archivos

```
naranagency/
├── index.html          ← toda la web aquí
├── assets/
│   ├── tiktok.webp
│   ├── Instagram_icon.png.webp
│   ├── emojisenyora2.png
│   ├── emojisenyorros.png
│   ├── emojisenyora.png
│   └── emojinenros.png
├── netlify.toml
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

# 2. Hacer los cambios en index.html (o assets/)

# 3. Probar en local abriendo index.html en el navegador

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

## Regla anti-conflictos

Este proyecto tiene un único archivo (`index.html`). Para evitar conflictos:
- **No trabajar en la misma sección al mismo tiempo** — coordinaos antes de empezar
- **PRs de vida corta** — crear, revisar y mergear el mismo día si es posible
- **Una tarea por rama** — nunca acumules múltiples cambios no relacionados en una sola rama

## Reglas de código

- No tocar el `index.html` directamente en main — siempre rama + PR
- No inventar datos del negocio (servicios, precios, contacto) — usar solo datos reales
- Si se necesitan imágenes o assets nuevos (logos, emojis, fotos), **pedírselos al usuario** antes de intentar recrearlos con código
- No añadir dependencias externas salvo Google Fonts (ya incluido)
- Mantener todo en el único `index.html` — no crear archivos JS o CSS separados

## Animación SMM (Social Media Management card)

La tarjeta de Social Media tiene una animación SVG compleja:
- 5 avatares con emojis Apple entran desde la izquierda por caminos bezier (ap1–ap5)
- Pasan por el logo central (Instagram / TikTok, alternando cada 5s)
- Salen como tarjetas de notificación hacia la derecha
- Los emojis y caminos se **aleatorizan con JS** en cada carga y cada 6s
- Los logos usan imágenes reales de `assets/` — no SVG a mano

## Deploy

Netlify está conectado a GitHub. **No usar `npx netlify deploy` manualmente** — el deploy ocurre solo al mergear a `main`.

Para preview local: abrir `index.html` directamente en el navegador.
