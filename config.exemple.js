// Exemple de configuration.
// 1. Copie ce fichier en "config.js" (même dossier).
// 2. Modifie config.js, puis actualise la source dans OBS (clic droit > Actualiser).
// Tu peux supprimer toutes les lignes que tu ne veux pas changer : la valeur par défaut
// (shared/config.defaut.js) sera utilisée.
window.OVERLAY = {
  pseudo: "ton_pseudo",

  theme: "cabine", // "cabine", "minimal", "telemetrie" ou "verre" — compare-les dans apercu.html

  couleurs: {
    accent: "#F5A524", // essaie "#4ADE80" (vert), "#60A5FA" (bleu), "#F472B6" (rose)…
  },

  programme: "Euro Truck Simulator 2",
  debutMinutes: 5,
  prochainLive: "", // ex. "Samedi 21h · Farming Simulator 25"

  // Overlay en jeu : emplacement de la plaque et du chat (voir README pour toutes les positions).
  jeu: { position: "haut-centre" },
  chat: { position: "milieu-gauche" },

  // Alertes : colle ici l'URL de ton overlay StreamElements (voir README > Alertes).
  // ⚠️ Elle contient une clé secrète : config.js n'est jamais commité, garde-la uniquement ici.
  alertes: { url: "" },

  reseaux: [
    { type: "twitch", texte: "ton_pseudo" },
    { type: "youtube", texte: "@ta-chaine" },
    { type: "discord", texte: "discord.gg/ton-lien" },
  ],

  // Tous les textes sont modifiables (liste complète dans shared/config.defaut.js).
  // Donne-leur ton ton ! Exemple pour une chaîne camion / route :
  textes: {
    programme: "Au menu · ",
    prochain: "Prochain départ · ",
    debut: { titre: ["Le moteur", "chauffe."], minuteur: "Départ dans", finiLabel: "C’est parti", fini: "Contact." },
    pause: { titre: ["Pause café", "sur l’aire."], minuteur: "À l’arrêt depuis" },
    fin: { titre: ["Fin de", "service."], sansProchain: "Merci d’avoir fait la route avec moi.", jaugeValeur: "GG" },
    panne: { titre: ["Panne moteur,", "je répare."], info: "Le live reprend dans un instant.", minuteur: "En panne depuis" },
    discussion: { titre: ["Moteur coupé,", "on discute."], sujet: "Au menu · " },
  },
};
