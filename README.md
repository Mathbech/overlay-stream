# Overlays de stream (OBS)

Overlays HTML/CSS minimalistes pour OBS : écrans de début, de pause et de fin de live.
Aucune installation, aucun serveur : de simples fichiers à ajouter comme **source Navigateur**.
Tout se personnalise depuis un seul fichier de configuration (pseudo, couleurs, textes, réseaux).

Conçu en 1920×1080 ; s'adapte automatiquement à la taille de la source.

## Écrans disponibles

| Fichier | Contenu |
|---|---|
| `scenes/debut.html` | « Le stream commence bientôt » + programme + compte à rebours |
| `scenes/pause.html` | « Petite pause » + chrono depuis le début de la pause |
| `scenes/fin.html` | « Merci d'avoir regardé » + prochain live |
| `scenes/panne.html` | Problème technique + chrono depuis la coupure |
| `scenes/discussion.html` | Discussion : titre, sujet, chrono du live et followers à gauche, grand chat à droite |
| `scenes/jeu.html` | Overlay en jeu : plaque discrète (pseudo, programme, chrono du live, réseaux en rotation), fond transparent |

## Installation

1. Télécharge ou clone le dépôt.
2. Copie `config.exemple.js` en **`config.js`** (même dossier) et modifie-le : pseudo, réseaux, programme…
3. Ouvre **`apercu.html`** : tous les écrans dans tous les thèmes, avec ta config.

Sans `config.js`, les écrans s'affichent avec les valeurs par défaut.

### Garder sa config en local

`config.js` contient tes infos perso (pseudo, liens…) : il est listé dans `.gitignore`,
il **n'est donc jamais commité ni poussé**. Seul `config.exemple.js` (le modèle) est versionné.

- Vérifier qu'il est bien ignoré : `git check-ignore -v config.js` (doit afficher la ligne du `.gitignore`)
  ou `git status` (il ne doit pas apparaître).
- S'il a déjà été commité par erreur, le retirer du dépôt **sans supprimer ton fichier local** :
  ```
  git rm --cached config.js
  git commit -m "chore: stop tracking config.js"
  ```
  Attention : il reste visible dans l'historique des commits déjà poussés.
- Si tu ajoutes une option, ajoute-la aussi (avec une valeur d'exemple) dans `config.exemple.js`.

## Ajouter un écran dans OBS

1. Dans ta scène : Sources > **+** > **Navigateur**.
2. Coche **Fichier local** et choisis le fichier dans `scenes/`.
3. Règle **Largeur 1920** et **Hauteur 1080** (par défaut OBS met 800×600 : le rendu serait flou).
4. Coche **Actualiser le navigateur quand la scène devient active** (relance le compte à rebours / le chrono).
5. Si tu as redimensionné la source à la souris : clic droit > Transformer > **Réinitialiser la transformation** (`Ctrl+R`).

Après une modification de `config.js` : clic droit sur la source > **Actualiser**.

### Overlay en jeu

- Même réglage (Navigateur, 1920×1080), mais **ne coche pas** « Actualiser le navigateur quand la
  scène devient active » : le chrono du live démarre au chargement de la source et serait remis à zéro.
  Pour le remettre à zéro en début de live : clic droit > **Actualiser**.
- Position par défaut : option `jeu.position` de la config. Pour une position différente selon la scène
  (un jeu = une scène OBS), décoche **Fichier local** et mets dans **URL** :
  ```
  file:///C:/chemin/vers/overlay-stream/scenes/jeu.html?position=bas-gauche
  ```
  (remplace les espaces du chemin par `%20` et les accents par leur code, ex. `é` → `%C3%A9`).
  Positions : `haut-gauche`, `haut-centre`, `haut-droite`, `bas-gauche`, `bas-centre`, `bas-droite`.

### Chat et followers (overlay en jeu)

- **Chat** : connexion anonyme en lecture seule au chat Twitch — aucun compte, aucun jeton.
  Les messages supprimés par un modérateur et ceux d'un viewer banni/timeout disparaissent aussi de l'overlay.
  Les commandes (`!…`) et les bots courants sont masqués (options `chat.masquerCommandes`, `chat.ignorer`).
  Position : `chat.position` ou `?chat=milieu-droite` dans l'URL (`?chat=off` pour le masquer) —
  `haut-gauche`, `milieu-gauche`, `bas-gauche`, `haut-droite`, `milieu-droite`, `bas-droite`.
  Les deux paramètres se combinent : `jeu.html?position=bas-gauche&chat=milieu-droite`.
- **Followers** : récupérés toutes les minutes via le service public gratuit [DecAPI](https://decapi.me)
  (l'API officielle de Twitch exige un jeton, impossible à mettre dans un overlay public).
  Le nom de ta chaîne est donc envoyé à decapi.me. Désactivable avec `followers.actif: false`.
- La chaîne utilisée est l'option `twitch`, ou à défaut l'entrée `twitch` de `reseaux`.
- **Aperçu sans être en live** : ajoute `?demo=1` à l'URL (faux messages, faux nombre de followers).

### Alertes (StreamElements)

Les alertes (follow, abonnement, abonnements offerts, raid, bits, don) sont un **widget personnalisé
StreamElements** : StreamElements transmet les événements au widget, aucun jeton n'est stocké dans ce dépôt.
Fichiers dans `streamelements/alertes/` ; aperçu local sans compte : `streamelements/alertes/apercu.html`
(`?type=follow`, `sub`, `resub`, `gift`, `gift1`, `raid`, `cheer` ou `tip` pour n'en jouer qu'un).

1. Sur streamelements.com : **Streaming tools > Overlays > New overlay**, en 1920×1080.
2. Ajoute un widget **Custom widget** (bouton **+** > Static / Custom), puis place-le en **0, 0** et
   redimensionne-le en **1920×1080** (onglet Position, size & style).
3. **Open editor** : colle le contenu de `widget.html`, `widget.css`, `widget.js` et `fields.json`
   dans les onglets HTML, CSS, JS et FIELDS, puis **Done** et **Save**.
4. Règle textes, couleur, son et durée dans les paramètres du widget (panneau de gauche).
   Teste avec le bouton **Emulate** de l'éditeur.
5. Copie l'URL de l'overlay (icône lien) et colle-la dans **`config.js`** :
   ```js
   alertes: { url: "https://streamelements.com/overlay/..." },
   ```
   Les alertes s'affichent alors directement dans les pages (par défaut toutes ; liste modifiable avec
   `alertes.pages`, ex. `["jeu", "discussion"]`). Rien à ajouter dans OBS.
   (Alternative : ajouter l'URL dans OBS comme source Navigateur 1920×1080 au-dessus des autres.)

⚠️ L'URL de l'overlay StreamElements contient une clé secrète : ne la partage pas et ne la commite pas.
Elle n'a sa place que dans `config.js`, qui est ignoré par git.
Désactive les autres alertes (AlertBox StreamElements, Streamlabs…) pour éviter les doublons.

## Personnalisation

`config.js` ne contient que ce que tu veux changer ; tout le reste vient de `shared/config.defaut.js`
(à ne pas modifier, il sert de référence pour toutes les options).

| Option | Rôle |
|---|---|
| `pseudo` | Nom affiché en haut à gauche |
| `theme` | `cabine` (grand compteur à aiguille + panneau en verre), `minimal`, `telemetrie` (tableau de bord) ou `verre` (verre dépoli, dégradé animé) |
| `couleurs.accent` / `fond` / `texte` / `attenue` | Couleurs du thème |
| `programme` | Jeu ou activité du live (écrans début / pause) |
| `debutMinutes` | Durée du compte à rebours |
| `prochainLive` | Texte affiché sur l'écran de fin |
| `jeu.position` / `jeu.marge` / `jeu.rotationSecondes` | Overlay en jeu : emplacement, distance au bord, durée d'affichage de chaque réseau |
| `twitch` | Chaîne pour le chat et les followers (par défaut : l'entrée `twitch` de `reseaux`) |
| `chat.*` | `actif`, `position`, `dureeSecondes` (0 = messages permanents), `maxMessages`, `masquerCommandes`, `ignorer` |
| `followers.*` | `actif`, `intervalleSecondes` |
| `alertes.url` / `alertes.pages` | URL de l'overlay StreamElements (secrète) et pages où l'intégrer |
| `reseaux` | Liste `{ type, texte }` — types avec icône : `twitch`, `youtube`, `discord` (sinon icône de lien) |
| `textes` | Tous les textes des écrans (pour les reformuler ou les traduire) |

## Structure

```
config.exemple.js     modèle de configuration (config.js, perso, n'est pas versionné)
scenes/               un fichier HTML par écran
shared/
  config.defaut.js    valeurs par défaut de toutes les options
  core.js             fusion de la config, couleurs, mise à l'échelle 1920×1080
  theme.css           thème commun (couleurs, typos)
  ecran.css / .js     écrans plein cadre
  icones.js           icônes des réseaux
  chat.js             chat Twitch en lecture seule (réutilisable)
  jeu.css / .js       overlay en jeu
  discussion.css/.js  écran Discussion
  themes/             un CSS par thème, chargé par-dessus les styles de base
apercu.html           galerie de tous les écrans × thèmes
streamelements/
  alertes/            widget d'alertes à coller dans StreamElements (+ apercu.html local)
```

Pour créer un thème : ajoute `shared/themes/mon-theme.css` (surcharge des classes de `ecran.css`),
puis `theme: "mon-theme"` dans `config.js` et ajoute-le à la liste `THEMES` de `apercu.html`.

## Licence

[MIT](LICENSE) — libre de réutiliser, modifier et partager, en gardant la mention de l'auteur.
