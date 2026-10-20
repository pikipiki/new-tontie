# Déploiement gratuit

## URLs de prod

| Hébergeur | URL | Mise à jour |
|-----------|-----|-------------|
| **GitHub Pages** | https://pikipiki.github.io/new-tontie/ | `git push` sur `main` (workflow Actions) |
| **Netlify** | https://tontie-goonks.netlify.app/ | `git push` (branche connectée) |

Le repo doit être **public** pour GitHub Pages (compte perso gratuit).

### GitHub Pages (une fois)

1. **Settings** → **Pages** → Source : **GitHub Actions**
2. Workflow **Deploy GitHub Pages** vert sur `main`

Build CI : `GITHUB_PAGES=true` → `base: ./` et chemins via `publicUrl()` dans le code.

## itch.io (upload manuel)

Utile si un joueur ne joint pas Netlify / `github.io` :

1. `npm run build`
2. Zip **`dist/`** → [itch.io](https://itch.io) → projet **HTML** → jouable dans le navigateur

## Local

```bash
npm run dev      # http://localhost:5173
npm run build    # dist/ (Netlify / Pages)
npm run preview  # servir dist/ en local
```
