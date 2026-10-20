# Hébergement gratuit (0 €)

Aucune solution **gratuite** ne garantit l’accès depuis la Russie : ça dépend du FAI. Voici les options **sans payer**, par ordre pratique.

## 1. GitHub Pages (recommandé, automatique)

**Coût :** 0 € · **Mise à jour :** chaque `git push` sur `main`.

### Activation (une fois)

1. GitHub → repo `new-tontie` → **Settings** → **Pages**
2. **Build and deployment** → Source : **GitHub Actions**
3. Attendre le workflow **Deploy GitHub Pages** (vert)

### URL à tester

`https://pikipiki.github.io/new-tontie/` (build CI avec `GITHUB_PAGES=true` → `base: ./` + chemins `publicUrl()`)

Envoie ce lien à ton amie. Si ça **timeout** comme Netlify, passe à l’option 2.

---

## 2. itch.io (gratuit, manuel)

Plateforme de jeux HTML5, souvent utilisée en CEI / Russie.

1. Compte sur [itch.io](https://itch.io)
2. `npm run build`
3. **Create new project** → kind **HTML** → uploader le dossier **`dist/`** en zip (ou glisser-déposer)
4. Cocher **This file will be played in the browser**
5. Publier → lien du type `https://votrepseudo.itch.io/tontie`

Pas de sync git : tu re-upload après chaque grosse mise à jour.

---

## 3. Tunnel depuis ton Mac (gratuit, temporaire)

Pour un test **ce soir** sans hébergeur :

| Commande | Réseau |
|----------|--------|
| `npm run dev:tunnel` | Cloudflare (`*.trycloudflare.com`) — peut timeout en RU |
| `npm run tunnel:lt` | localtunnel (`*.loca.lt`) — **autre chemin**, parfois ça passe |

Ton Mac doit rester allumé. Ce n’est pas une « vraie » prod.

---

## 4. Netlify / Cloudflare Workers (déjà en place)

Gratuits pour toi en Europe. Chez ton amie : **timeouts** constatés → ne compte pas dessus pour la Russie.

---

## 5. Yandex sans CDN (gratuit partiel)

Object Storage a un **free tier** (stockage + requêtes), mais :

- le **CDN** (~150 ₽/mois) n’est pas gratuit ;
- l’URL « site web » du bucket peut être **HTTP** ou moins pratique sur mobile.

Voir [DEPLOY-RU.md](DEPLOY-RU.md) seulement si tu acceptes un petit budget CDN plus tard.

---

## Résumé

| Besoin | Gratuit | Fiable en RU |
|--------|---------|----------------|
| GitHub Pages + push | Oui | À tester |
| itch.io | Oui | Souvent OK |
| Tunnel `tunnel:lt` | Oui | Parfois |
| Netlify / CF / trycloudflare | Oui | Souvent non chez elle |
| Yandex CDN | Non | Oui |
