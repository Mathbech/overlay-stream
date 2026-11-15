// Valeurs par défaut. NE PAS MODIFIER : surcharge ce que tu veux dans config.js à la racine
// (copie de config.exemple.js). Seules les clés présentes dans config.js remplacent celles-ci.
window.OVERLAY_DEFAUT = {
  pseudo: "ton_pseudo",

  // Thème visuel : "minimal", "telemetrie" ou "verre" (fichiers dans shared/themes/).
  theme: "minimal",

  couleurs: {
    accent: "#F5A524",
    fond: "#0D0F12",
    texte: "#F2F4F7",
    attenue: "#8A93A0",
  },

  // Ce que tu fais pendant le live (écrans début / pause). "" pour masquer.
  programme: "",

  // Durée du compte à rebours de l'écran de début, en minutes.
  debutMinutes: 5,

  // Affiché sur l'écran de fin. "" pour afficher textes.fin.sansProchain à la place.
  prochainLive: "",

  // Overlay en jeu (scenes/jeu.html).
  jeu: {
    // "haut-gauche", "haut-centre", "haut-droite", "bas-gauche", "bas-centre", "bas-droite".
    // Peut aussi se régler par scène OBS avec ?position=... dans l'URL (voir README).
    position: "haut-centre",
    marge: 32, // distance au bord de l'écran, en pixels
    rotationSecondes: 10, // durée d'affichage de chaque réseau
  },

  // Chaîne Twitch utilisée pour le chat et les followers. "" = prise dans reseaux (type "twitch").
  twitch: "",

  // Chat affiché sur l'overlay en jeu (lecture seule, connexion anonyme, aucun jeton).
  chat: {
    actif: true,
    // "haut-gauche", "milieu-gauche", "bas-gauche", "haut-droite", "milieu-droite", "bas-droite".
    // Réglable par scène OBS avec ?chat=... dans l'URL (?chat=off pour le masquer).
    position: "milieu-gauche",
    dureeSecondes: 0, // un message disparaît après ce délai (0 = jamais, les plus anciens sortent par le haut)
    maxMessages: 12,
    masquerCommandes: true, // masque les messages qui commencent par "!"
    ignorer: ["streamelements", "nightbot", "moobot", "streamlabs", "fossabot"], // bots masqués
  },

  // Nombre de followers sur l'overlay en jeu, via le service public DecAPI (decapi.me).
  followers: {
    actif: true,
    intervalleSecondes: 60,
  },

  // Alertes StreamElements intégrées dans les pages (voir README > Alertes).
  alertes: {
    // URL de ton overlay StreamElements (https://streamelements.com/overlay/...).
    // ⚠️ Elle contient une clé secrète : uniquement dans config.js (ignoré par git), jamais ici.
    url: "",
    // Pages qui affichent les alertes (nom du fichier dans scenes/, sans .html).
    pages: ["debut", "pause", "fin", "panne", "jeu", "discussion"],
  },

  // Réseaux en bas des écrans. type : "twitch", "youtube", "discord" ou autre (icône générique).
  reseaux: [],

  textes: {
    programme: "Au programme · ",
    prochain: "Prochain live · ",
    debut: {
      etiquette: "Le live démarre",
      titre: ["Le stream commence", "bientôt"],
      minuteur: "Début dans",
      finiLabel: "C’est l’heure",
      fini: "On y va !",
      jaugeUnite: "min", // thème télémétrie : unité sous le compteur
    },
    pause: {
      etiquette: "Pause",
      titre: ["Petite pause,", "je reviens vite"],
      minuteur: "En pause depuis",
      jaugeUnite: "min",
    },
    fin: {
      etiquette: "Fin du live",
      titre: ["Merci d’avoir", "regardé !"],
      sansProchain: "À très vite sur la chaîne !",
      jaugeValeur: "GG",
    },
    panne: {
      etiquette: "Problème technique",
      titre: ["Petit souci", "technique."],
      info: "Je reviens au plus vite !",
      minuteur: "Coupure depuis",
      jaugeUnite: "min",
    },
    discussion: {
      titre: ["On discute", "un peu ?"],
      sujet: "Au programme · ", // suivi de l'option programme
      chrono: "en ligne",
    },
    jeu: {
      chrono: "", // texte avant le chrono du live, ex. "En route depuis" ("" = chrono seul)
      followers: "followers",
      chat: "Chat", // titre du cadre de chat
      chatVide: "En attente de messages…",
    },
  },
};
