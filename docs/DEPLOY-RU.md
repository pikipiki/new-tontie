# Miroir Russie — Yandex Object Storage + CDN

Hébergement statique du dossier `dist/` en **Russie**, pour les joueurs qui ne joignent pas Netlify / `*.workers.dev` (timeouts `ERR_TIMED_OUT`).

Stack : [Yandex Object Storage](https://yandex.cloud/en/docs/storage/) (API S3) + [Yandex Cloud CDN](https://yandex.cloud/en/docs/cdn/).

## 1. Compte et bucket

1. Créer un compte sur [console.yandex.cloud](https://console.yandex.cloud/) (carte ou trial).
2. Créer un **cloud** et un **folder** (catalogue).
3. **Object Storage** → **Create bucket**
   - Name : ex. `tontie-goonks` (global unique).
   - Region : `ru-central1`.
   - Access : **Public** (lecture publique des objets) ou restreint + policy ci‑dessous.
4. Bucket → **Website** :
   - Hosting : **Enabled**
   - Home page : `index.html`
   - Error page : `index.html` (optionnel, pour refresh direct sur une URL future)

## 2. Accès pour le déploiement (clés S3)

1. **IAM** → **Service accounts** → Create → name `tontie-deploy`.
2. Rôle : `storage.editor` sur le folder (ou `storage.admin` pour tests).
3. Service account → **Create static access key** → noter **Key ID** et **Secret**.

Ne jamais committer ces clés. Les mettre dans `.env` local ou les **GitHub Actions secrets**.

## 3. Lecture publique des fichiers

Si le bucket n’est pas « Public » :

Bucket → **Security** → **Bucket policy** (exemple) :

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::VOTRE-BUCKET/*"]
    }
  ]
}
```

Remplacer `VOTRE-BUCKET` par le nom du bucket.

## 4. CDN (HTTPS pour les joueurs)

1. **Cloud CDN** → **Create resource**
2. **Origin** : bucket Object Storage (choisir le bucket).
3. **Domain names** : laisser le hostname CDN par défaut (`*.cdn.yandexcloud.net`) ou ajouter un domaine perso (DNS CNAME).
4. Activer **HTTPS** (certificat géré par Yandex si domaine custom).

URL à envoyer aux joueurs en Russie : **l’URL CDN** (pas l’endpoint S3 brut).

Test depuis l’Europe : [check-host.net](https://check-host.net/) → nœuds **Moscow** / **Saint Petersburg**.

## 5. Déploiement depuis ta machine

Prérequis : [AWS CLI v2](https://aws.amazon.com/cli/) (compatible endpoint Yandex).

```bash
cp .env.example .env
# Renseigner YC_S3_* dans .env

npm run deploy:yandex
```

Variables (`.env`) :

| Variable | Exemple |
|----------|---------|
| `YC_S3_ACCESS_KEY_ID` | clé du service account |
| `YC_S3_SECRET_ACCESS_KEY` | secret |
| `YC_S3_BUCKET` | `tontie-goonks` |
| `YC_S3_ENDPOINT` | `https://storage.yandexcloud.net` (défaut) |
| `YC_S3_REGION` | `ru-central1` (défaut) |

## 6. Déploiement auto (GitHub Actions)

À chaque push sur `main`, le workflow `.github/workflows/deploy-yandex.yml` peut synchroniser `dist/` **si** les secrets repo sont définis :

| Secret GitHub | Contenu |
|---------------|---------|
| `YC_S3_ACCESS_KEY_ID` | Key ID |
| `YC_S3_SECRET_ACCESS_KEY` | Secret |
| `YC_S3_BUCKET` | nom du bucket |

Settings → Secrets and variables → Actions → **New repository secret**.

Sans ces secrets, le job est ignoré (pas d’échec de CI).

## 7. Coexistence avec Netlify / Cloudflare

| Cible | Rôle |
|-------|------|
| Netlify / Workers | EU, dev, toi |
| Yandex CDN | joueurs en Russie |

Même `git push` sur `main` : Netlify/Cloudflare rebuild côté Ouest ; le workflow Yandex met à jour le miroir **si** les secrets sont configurés.

## Dépannage

- **403** sur le site : policy bucket ou ACL objet.
- **404** sur `/assets/…` : relancer `npm run deploy:yandex` (sync `--delete`).
- **Toujours timeout en RU** : vérifier l’URL CDN sur check-host Moscow ; essayer un autre opérateur / Wi‑Fi côté joueur.
