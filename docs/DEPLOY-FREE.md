# Déploiement gratuit

## URLs de prod

| Hébergeur                                     | URL                                                       | Mise à jour                               |
| --------------------------------------------- | --------------------------------------------------------- | ----------------------------------------- |
| **GitHub Pages** (prod, `main`)               | https://pikipiki.github.io/new-tontie/                    | `git push` sur `main`                     |
| **GitHub Pages** (`codex/playful-adventures`) | https://pikipiki.github.io/new-tontie-playful-adventures/ | `git push` sur `codex/playful-adventures` |
| **Netlify**                                   | https://tontie-goonks.netlify.app/                        | `git push` (branche connectée)            |

Le repo doit être **public** pour GitHub Pages (compte perso gratuit).

### GitHub Pages — prod (`new-tontie`)

1. **Settings** → **Pages** → Source : **GitHub Actions**
2. Workflow **Deploy GitHub Pages** vert sur `main`

Build CI : `GITHUB_PAGES=true` → `base: ./` et chemins via `publicUrl()` dans le code.

### GitHub Pages — branche `codex/playful-adventures` (URL séparée)

Repo hôte : [pikipiki/new-tontie-playful-adventures](https://github.com/pikipiki/new-tontie-playful-adventures) (pas de code source, seulement la branche `gh-pages` générée par CI).

1. Créer le repo public `new-tontie-playful-adventures` (vide ou README).
2. **Deploy key** (write) sur ce repo ; clé privée dans `new-tontie` → **Secrets** → `PLAYFUL_ADVENTURES_PAGES_DEPLOY_KEY`.
3. Sur **new-tontie-playful-adventures** : **Settings** → **Pages** → Deploy from branch **`gh-pages`** / **`/`** (après le premier déploiement réussi).
4. Pousser le workflow `.github/workflows/deploy-playful-adventures-pages.yml` sur `main`, puis travailler / pousser sur `codex/playful-adventures`.

Génération locale de la paire de clés (exemple) :

```bash
ssh-keygen -t ed25519 -f playful-adventures-pages -N "" -C "new-tontie→playful-adventures Pages"
# Public → Deploy keys (allow write) on new-tontie-playful-adventures
# Private → secret PLAYFUL_ADVENTURES_PAGES_DEPLOY_KEY on new-tontie
```

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
