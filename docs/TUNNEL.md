# Tunnel privé vers `localhost` (test rapide Russie / amis)

Expose ton **serveur de dev local** via une URL **HTTPS temporaire**. Seules les personnes qui ont le lien peuvent ouvrir le jeu (pas listé sur Google).

> **Attention :** si ton amie ne joint déjà pas `*.trycloudflare.com` / Cloudflare, ce tunnel peut aussi timeout — le miroir [Yandex](DEPLOY-RU.md) reste la solution durable.

## Une commande

```bash
npm run dev:tunnel
```

Ça démarre Vite (`localhost:5173`) + **cloudflared** (Quick Tunnel). Dans le terminal, copie la ligne :

`https://xxxx.trycloudflare.com`

Envoie **ce lien** à ton amie (Telegram, etc.). Garde le terminal ouvert tant qu’elle joue.

Chaque tunnel a une URL différente (`xxxx.trycloudflare.com`) : **tu n’as rien à ajouter dans la config** — `vite.config.ts` utilise `allowedHosts: true` en dev pour tous ces hôtes.

## Déjà en `npm run dev` ?

Deuxième terminal :

```bash
npm run tunnel
```

(`tunnel` seul, sans relancer Vite.)

## Variables

| Variable | Défaut |
|----------|--------|
| `TONTIE_DEV_PORT` | `5173` |

## Sécurité

- URL aléatoire, courte durée de vie — OK pour un test entre amis.
- Ne laisse pas tourner des heures sur un réseau public.
- Pour la prod en Russie : [DEPLOY-RU.md](DEPLOY-RU.md).

## Alternative (sans npm)

[Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/) installé :

```bash
npm run dev
cloudflared tunnel --url http://127.0.0.1:5173
```
