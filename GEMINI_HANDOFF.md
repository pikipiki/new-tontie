# Reprise Gemini — tontie-re

> **Mise à jour du 22 octobre 2026, 21 h 40 :** les étapes 1 à 5 ci-dessous ont été réalisées. Toute la chaîne est verte. Résultats et limites restantes : voir [docs/REVIEW-2026-10.md](docs/REVIEW-2026-10.md).

Rapport du 22 octobre 2026. L’utilisateur demande maintenant de transmettre le travail à Gemini et de s’arrêter. **La refonte est avancée mais n’est pas validée définitivement : un nouveau test échoue encore.** Ne pas annoncer que tout est terminé.

## Objectif demandé

Appliquer à `/Users/sevenone./Documents/git/tontie-re` la même démarche que celle déjà terminée sur `goonk-country` : architecture lisible et extensible, code réutilisable, responsabilités séparées, travail de plusieurs développeurs facilité, suppression de redondances et code mort, performances, paramètres partagés nommés/configurables en JSON, robustesse et revue de sécurité. La lisibilité humaine passe avant les abstractions et les micro-optimisations.

La chaîne explicitement exigée par l’utilisateur doit passer intégralement :

```sh
npm run format && npx eslint . --max-warnings 0 && npx vitest run && npm run test:e2e
```

Rejouer aussi compilation, couverture, contrôle d’architecture et audit. Corriger les problèmes observés et refaire une revue ; ne pas réduire les seuils ni désactiver les règles pour obtenir artificiellement du vert.

## Répertoire et état Git à préserver

- Répertoire canonique : `/Users/sevenone./Documents/git/tontie-re`.
- Branche existante : `codex/playful-adventures`.
- HEAD de départ inchangé : `a8c696c399d6d07aca096fd5e8be65c3e18b244e`.
- Aucun commit, push, déploiement ou changement de licence effectué ou demandé.
- Au départ, seul `reports/` était non suivi. **Tout son contenu appartient à l’utilisateur : ne pas le supprimer, le modifier ou l’ajouter à un commit par commodité.** Il comprend notamment les rapports HTML et JSON Brigitta, Julia et Kimber.
- Au moment du rapport : 88 chemins modifiés/supprimés hors index, 219 115 suppressions déjà indexées, plus les nouveaux fichiers de cette refonte.

### Les 219 115 suppressions indexées sont intentionnelles

Le dépôt suivait 220 711 fichiers, dont 211 478 sous `.cache/` et 7 633 sous `scripts/mesh-pipeline/.venv/`. Ce sont des exports reproductibles, dépendances locales et fichiers générés, pas le code applicatif à maintenir.

Ces chemins ont été retirés **uniquement de l’index**, avec `git rm --cached`, puis ignorés dans `.gitignore` :

- `.cache/` ;
- `scripts/mesh-pipeline/.venv/` ;
- `.scannerwork/` ;
- `__pycache__`, fichiers Python compilés et `*.tsbuildinfo` suivis.

**Les 219 115 fichiers existaient toujours sur disque après l’opération, vérification faite.** Ne pas interpréter ces suppressions comme une perte de données et ne pas restaurer ces caches dans Git. Ne pas faire de `git reset --hard`, `git clean`, ni supprimer les copies locales. Aucun historique n’a été réécrit. La liste avant nettoyage existe temporairement dans `/tmp/tontie-generated-tracked-before.zlist`.

## Environnement et commandes

Node fourni dans cet environnement :

```sh
export PATH=/Users/sevenone./.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH
cd /Users/sevenone./Documents/git/tontie-re
node --version   # v24.19.0 lors du travail
```

Le projet déclare maintenant Node >= 24. Les workflows ont été alignés sur Node 24. Le Node système plus ancien peut provoquer des écarts.

Le dépôt est hors des racines autorisées en écriture dans Codex : les modifications et commandes qui écrivent utilisent `sandbox_permissions: require_escalated`, avec une justification liée à cette refonte déjà autorisée. Cela n’impose pas de redemander une confirmation utilisateur.

Les tests Playwright lancent leur propre Chrome sans interface. Sur ce Mac, ils utilisent `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`. Ailleurs : Chromium installé avec `npx playwright install --with-deps chromium`, ou `BROWSER_EXECUTABLE` explicite. Leur serveur possède le port **5196**, avec `strictPort` et `reuseExistingServer: false`. Ne pas arrêter les serveurs ou navigateurs de l’utilisateur ; notamment le serveur historique de Goonk sur 5174.

## Changements déjà effectués

### Architecture et responsabilités

- Huit cycles de dépendances détectés au départ ont été supprimés en corrigeant les dépendances réelles.
- `applyDamage`, `applyCoinDamage`, `syncPlayerAttack` sont dans `src/game/stats.ts`. `combat.ts` réexporte les API existantes.
- `retireHole` est maintenant dans `src/game/engine/shared.ts`, avec réexport depuis `holes.ts`. La progression ne dépend plus du module de spawn pour cette primitive.
- Les imports internes évitent le barrel global des features lorsqu’ils ont besoin d’un module précis.
- `announce` vit dans les primitives partagées ; `adventure/state.ts` le réexporte. Cela supprime le cycle `state` ↔ `weapons`.
- L’audio navigateur a quitté `src/game/` pour `src/audio/` : `banks.ts`, `buffers.ts`, `runtime.ts`, API `index.ts`. Imports et tests mis à jour.
- `SoundBufferCache` déduplique les chargements et invalide les anciens callbacks après remplacement du contexte ; les effets audio obsolètes ne partent plus sur un ancien contexte.
- La classe `GameSession` est dans `src/session/GameSession.ts`, avec ses tests. Ce n’est plus un fichier nommé comme un hook React.
- Les outils de replay utilisant `window` sont dans `src/session/replayTools.ts`. Ils sont chargés dynamiquement uniquement en développement depuis `main.tsx`.
- Les six petits modules de présentation sont regroupés dans `src/game3d/presentation.ts`, API publique conservée.
- Les minuscules modules de layout `mole` et `stage` sont regroupés avec le layout du plateau.
- Des helpers privés reçoivent maintenant explicitement les acteurs/états déjà vérifiés, au lieu d’empiler des gardes impossibles à atteindre.
- Les listes et inscriptions des niveaux personnalisés chargent les valeurs natives avant leurs vérifications.

### Configuration et robustesse

- `src/game/adventure/content.json` contient les missions, textes d’amélioration et noms des rôles. `content.ts` expose des données typées et valide les missions.
- `MISSION_COUNT` remplace le nombre de missions répété dans la progression et certains panneaux.
- `src/config/presentation.json` : qualité graphique, caméra, densité des géométries et fourrure, texture velours, durées des effets.
- `src/config/runtime.json` : rattrapage de boucle et mixage audio.
- Les coordonnées propres aux modèles restent dans les modèles : ne pas transformer chaque sommet en configuration inutile.
- Une campagne étendue avec toutes les améliorations déjà acquises passe désormais au briefing suivant au lieu de rester bloquée sur un panneau sans récompense.
- `numpadToHole` rejette les valeurs fractionnaires.

### Performances

- Une géométrie de fourrure partagée `PLUSH_FUR` remplace la reconstruction de 9 000 brins pour chaque peluche. Le corps était déjà partagé.
- La composition caméra est recalculée à la taille de viewport ; les vecteurs temporaires sont propres à chaque canvas. La secousse reste mise à jour par frame.
- Suppression de `tontiePreload.ts`, qui préchargeait systématiquement plus de vingt modèles alors que plusieurs sont remplacés par les modèles procéduraux. `useGLTF` charge les modèles rendus.
- Police Nunito 700/900 locale via `@fontsource/nunito`, suppression de l’import Google Fonts distant.
- Pas de promesse de FPS mesurés : pas de benchmark comparatif complet sur téléphone physique. Le gros chunk Three/R3F reste signalé par Vite, ne pas simplement masquer cet avertissement.

### Sécurité et erreurs utilisateur

- L’écran d’erreur n’insère plus le message d’exception dans son HTML : il utilise `textContent`. Le bouton de rechargement utilise `addEventListener`, sans attribut JS inline.
- Suppression du `eval` Python dans `scripts/clean-board-holes.mjs`, remplacé par `json.loads`.
- CSP de production dans `scripts/vite/security.mjs`, branchée uniquement au build. Scripts locaux, WASM autorisé pour Ruffle, workers et textures blob autorisés, styles inline nécessaires à MUI ; pas d’`unsafe-eval` JavaScript. Déclaration TypeScript voisine `security.d.mts`.
- Les erreurs du lecteur Ruffle sont réellement affichées ; auparavant certaines étaient invisibles.
- Correction de l’initialisation Ruffle : relire la fabrique sur l’objet global réellement installé et appeler la méthode avec son contexte.
- Le lecteur de référence est redimensionnable sur téléphone.
- **Toute dernière modification à revérifier dans le navigateur** : `loadCanonicalSwf()` retourne les octets dont taille et SHA-256 viennent d’être vérifiés ; Ruffle charge ces octets, sans seconde requête SWF, avec `allowScriptAccess: false`. `verifyCanonicalSwf()` conserve l’API booléenne pour compatibilité.
- Sonar passe par `scripts/run-sonar.mjs` : `.env` lu par Node comme données, pas sourcé comme script ; token transmis par environnement, pas dans les arguments ; installation implicite de scanner refusée. Le serveur Sonar réel n’a pas été appelé.

### Vérification et CI

- Nouveau `scripts/check-architecture.mjs` : résolution TypeScript, imports/réexports/imports dynamiques littéraux, accessibilité des fichiers, cycles runtime en distinguant les imports de types, dépendances interdites moteur → UI/rendu/audio et rendu → composants UI.
- Le dernier contrôle donnait 270 fichiers source, zéro fichier inaccessible, zéro dépendance interdite, zéro cycle. De nouveaux tests ont été ajoutés depuis : relancer pour l’état définitif.
- `test:e2e` lance désormais de vrais tests Playwright, et non uniquement les trois replays du moteur.
- Les anciens tests moteur restent sous `tests/e2e/` et dans Vitest ; commande explicite `npm run test:replay`.
- `playwright.config.mjs` et `e2e/game.spec.ts` : aventure, classique, clavier/pause/son, Ruffle avec vrai canvas et refus d’un SWF altéré ; trois formats (390×844, 844×390, 1280×800). Screenshots et traces dans `artifacts/`, ignoré par Git.
- Playwright d’abord essayé en alpha puis **remplacé par la version stable exacte 1.64.1**. Lockfile actualisé.
- Tests ajoutés sur injection HTML, courses audio, échanges, vol d’arme, configurations invalides, limites entre modes et sécurité du laser.
- Le seuil de couverture 100 % est maintenu et inclut maintenant `src/audio` en plus de `src/game`.
- Bibliothèques TypeScript des tests/ESLint : ES2024, pour `Promise.withResolvers` exécuté sous Node 24 ; cible applicative conservée.
- Le formatage couvre maintenant source, tests, E2E, scripts JS, configs, docs et workflows. Caches, exports, rapports utilisateur et artefacts navigateur exclus.
- Workflow qualité réutilisable ajouté : lint, architecture, tests, couverture, navigateur racine et sous-chemin Pages, audit npm. Les déploiements en dépendent.
- Actions GitHub verrouillées sur des SHA complets ; token en lecture seule sauf job de publication Pages ; checkout sans conservation des identifiants.

## État exact des vérifications — ne pas confondre les versions

Les copies des logs sont dans `artifacts/handoff-2026-10-22/` (ignoré par Git), en plus de `/tmp/`.

| Contrôle                                                 | Dernier résultat connu                                                                                                                             |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Base avant refonte                                       | 236 tests, 54 fichiers passants ; les 3 anciens tests dits E2E passaient ; compilation passante                                                    |
| Couverture avant refonte                                 | Échec du seuil annoncé : 98,95 % lignes / 92,91 % branches                                                                                         |
| Dernière couverture complète avant l’ajout des tests SWF | **270 tests, 61 fichiers ; 100 % lignes, statements, fonctions et branches** (44 fichiers couverts)                                                |
| Dernier Vitest après les nouveaux tests SWF              | **271 passent, 1 échoue, sur 272 tests / 62 fichiers** : erreur de fixture détaillée ci-dessous                                                    |
| Dernier ESLint                                           | Log vide, aucune erreur affichée ; à rejouer après correction du test                                                                              |
| Dernier build après les changements SWF                  | Passe ; avertissement Vite sur le chunk 3D volumineux                                                                                              |
| Dernier Playwright                                       | **12/12 passent** sur les trois formats avec Ruffle réellement rendu, mais ce run précède le dernier passage au chargement SWF par octets vérifiés |
| Variante Pages / sous-chemin                             | Préparée dans la config et la CI, **pas encore exécutée localement**                                                                               |
| Audit npm                                                | Zéro vulnérabilité aux audits et installations effectués ; relancer après stabilisation finale                                                     |
| CI distante, Safari/iPhone physique                      | Non exécutés ; aucune publication effectuée                                                                                                        |

La chaîne exacte demandée **n’a pas encore été rejouée en entier après les dernières modifications**. Ne pas annoncer une validation finale à partir des anciens logs verts.

## Prochaines actions, dans cet ordre

### 1. Corriger le seul test actuellement rouge

Fichier : `src/fidelity/__tests__/swfLoading.test.ts`, premier test, vers la ligne 13.

```text
TypeError: The URL must be of scheme file
readFileSync(new URL('../../../reference/tontie.swf', import.meta.url))
```

Vite transforme cette expression statique `new URL(..., import.meta.url)` comme une URL d’asset dans l’environnement de test. C’est la lecture de fixture qui échoue, pas une divergence du SHA de la ROM.

Utiliser par exemple `readFileSync('reference/tontie.swf')` avec les tests lancés à la racine du projet, ou reprendre le calcul de chemin fichier déjà utilisé dans `src/fidelity/__tests__/swfManifest.test.ts` (`fileURLToPath` + `path.resolve`). Éviter de modifier le hash, la ROM ou les assertions pour contourner l’erreur. Remplacer aussi la taille brute répétée dans le nouveau test par `CANONICAL_SWF.bytes` si pertinent.

### 2. Vérifier le dernier chargement Ruffle

Rejouer les 12 Playwright après cette dernière modification. Confirmer que le chargement par données fonctionne avec la version Ruffle installée, que son canvas devient visible et qu’aucune erreur JS/CSP n’apparaît. Les API `data`, `swfFileName`, `allowScriptAccess` existent dans la documentation Ruffle, mais leur intégration finale doit être validée localement.

Vérifier aussi visuellement les captures `playing.png`, notamment paysage. Les tests précédents passent mais ne prouvent pas qu’on peut terminer toute la campagne, ni que tous les clics sur meshes sont correctement alignés.

### 3. Mettre à jour le manifeste et ses générateurs

`reference/reconstruction-manifest.json` contient encore `owner: src/game/audio.ts`, supprimé par déplacement. Corriger **le générateur** `scripts/build-reconstruction-manifest.mjs`, puis exécuter `npm run build:manifest`.

Autres incohérences préexistantes repérées juste avant le rapport :

- surface `enemies.DefineSprite_458` : export `enemyFromCatalogFrame` appartient à `src/game/combat.ts`, pas `catalog.ts` ;
- surface `loop.spawn_timer` : `trySpawn` appartient à `src/game/engine/holes.ts`, pas l’API exportée par `engine.ts` ;
- surface audio : utiliser `src/audio/index.ts` ou `banks.ts`, selon l’export visé.

Renforcer si utile le test de manifeste pour vérifier que les chemins propriétaires existent. Ne pas régénérer toute la décompilation Flash ni modifier les données originales de fidélité.

### 4. Terminer la documentation

Les documents existants ont surtout été formatés, **ils ne décrivent pas encore tous les nouveaux chemins** :

- `README.md`, `CONTRIBUTING.md`, `docs/ARCHITECTURE.md`, `docs/OWNERSHIP.md` ;
- distinguer clairement aventure par défaut et mode classique fidèle ;
- expliquer moteur pur, audio navigateur séparé, session et présentateurs ;
- expliquer `test:e2e` Playwright vs `test:replay` moteur ;
- documenter Node 24, installation navigateur, configuration JSON et serveur E2E isolé ;
- documenter les gros retraits de caches de l’index sans suppression disque ;
- ajouter `SECURITY.md` et le rapport final de revue, sans prétendre à une sécurité absolue ;
- mettre à jour `sonar-project.properties` : ancien chemin d’exclusion `src/game/audioInternal.ts` supprimé, tests `e2e` à prendre en compte si Sonar reste utilisé ;
- actualiser les chemins de propriété/revue dans `.github/CODEOWNERS` et le template PR si nécessaire.

Ne pas inventer une licence : l’utilisateur demande un code « comme pour de l’open source », pas une décision sur les droits du code ou des assets originaux.

### 5. Revue finale et chaîne obligatoire

```sh
npm run check:architecture
npm run format && npx eslint . --max-warnings 0 && npx vitest run && npm run test:e2e
npm run test:coverage
GITHUB_PAGES=true E2E_BASE_PATH=/tontie-re/ npm run test:e2e
npm audit --audit-level=low
```

`test:e2e` reconstruit lui-même la version de production via son serveur Playwright. Son option `--base` permet de servir le build Pages relatif sous `/tontie-re/`. Si ce dernier cas révèle des chemins de workers/wasm/assets erronés, les corriger avec `publicUrl`, sans retirer le test.

Faire une nouvelle lecture des diffs ciblés, sans se noyer dans les 219 115 retraits de caches. Vérifier le graphe après toute nouvelle factorisation. Ne pas affirmer qu’il ne reste aucun bug possible ; rapporter les contrôles réellement exécutés, les résultats et les limites.

## Points d’attention supplémentaires

- Ne pas réduire le seuil 100 % : il a effectivement été atteint avant le dernier ajout de test.
- Ne pas réintroduire d’import navigateur dans `src/game/`.
- Ne pas masquer les erreurs console/CSP dans Playwright ; elles ont permis de détecter la panne Ruffle et une autorisation blob nécessaire aux textures GLB.
- Les messages `NO_COLOR`/`FORCE_COLOR`, l’avertissement de taille Vite et un message jsdom `HTMLCanvasElement.getContext` existaient ou ont été observés ; distinguer avis d’outil et vraie erreur applicative. Ne pas désactiver globalement console pour les faire disparaître.
- Les tests unitaires audio utilisent quelques hooks `__test*` internes préexistants. Ils ne sont pas exportés par l’API publique `src/audio/index.ts`.
- Pas de sous-agents lancés pour cette refonte. Les anciennes mentions d’agents dans le contexte concernent d’autres travaux.
- Ne pas modifier `goonk-country` : ce projet précédent est seulement une référence de démarche, il est déjà traité.

## Sources techniques consultées

- [Playwright — serveur de test](https://playwright.dev/docs/test-webserver)
- [MDN — Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy)
- [MDN — worker-src](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/worker-src)
- [GitHub — sécurité des workflows](https://docs.github.com/en/actions/reference/security/secure-use)
- [Ruffle — données vérifiées et options de chargement](https://ruffle.rs/js-docs/master/interfaces/Config.DataLoadOptions.html)
- [SonarScanner — token et URL via environnement](https://docs.sonarsource.com/sonarqube-server/analyzing-source-code/scanners/sonarscanner)

SHA de `peaceiris/actions-gh-pages@v4` vérifié via l’API officielle : tag annoté `329bcc8f12caed2cefe5a5b80781499a6f3b361b`, commit pointé `84c30a85c19949d7eee79c4ff27748b70285e453`. Les autres SHA sont ceux déjà vérifiés lors de la refonte précédente le même jour.
