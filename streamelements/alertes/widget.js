// Alertes StreamElements (widget personnalisé). Les réglages viennent des champs (fields.json) ;
// sans StreamElements (aperçu local), les valeurs par défaut ci-dessous sont utilisées.
// Modèles de texte : {nom} = la personne, {montant} = nombre / montant, {cible} = destinataire d'un abonnement offert.
(function () {
  const DEFAUTS = {
    accent: "#F5A524",
    position: "haut-centre",
    decalage: 120,
    duree: 7,
    son: "",
    volume: 50,
    devise: "€",
    afficherMessage: true,

    followActif: true,
    followTitre: "Nouveau passager",
    followTexte: "{nom} monte à bord",

    subActif: true,
    subTitre: "Abonnement",
    subTexte: "{nom} s’abonne, merci !",
    resubTexte: "{nom} · {montant} mois de route",

    giftActif: true,
    giftTitre: "Abonnement offert",
    giftUnTexte: "{nom} offre un abonnement à {cible}",
    giftTexte: "{nom} offre {montant} abonnements",

    raidActif: true,
    raidTitre: "Convoi en approche",
    raidTexte: "{nom} arrive avec {montant} routiers",

    cheerActif: true,
    cheerTitre: "Bits",
    cheerTexte: "{nom} remplit le réservoir : {montant} bits",

    tipActif: true,
    tipTitre: "Don",
    tipTexte: "{nom} offre le plein : {montant}",
  };

  let c = Object.assign({}, DEFAUTS);
  const file = [];
  let enCours = false;
  const racine = document.getElementById("alertes");

  function appliquer() {
    const accent = /^#[0-9A-Fa-f]{3,8}$/.test(String(c.accent)) || /^rgba?\(/.test(String(c.accent)) ? c.accent : DEFAUTS.accent;
    document.documentElement.style.setProperty("--accent", accent);
    const decalage = Math.min(1000, Math.max(0, Number(c.decalage) || 0));
    document.documentElement.style.setProperty("--decalage", decalage + "px");
    const positions = ["haut-centre", "centre", "bas-centre"];
    racine.className = "pos-" + (positions.includes(c.position) ? c.position : DEFAUTS.position);
  }
  appliquer();

  // ---- Événements StreamElements ----
  window.addEventListener("onWidgetLoad", function (obj) {
    const champs = (obj && obj.detail && obj.detail.fieldData) || {};
    c = Object.assign({}, DEFAUTS, champs);
    appliquer();
  });

  window.addEventListener("onEventReceived", function (obj) {
    const d = (obj && obj.detail) || {};
    const e = d.event || {};
    const nom = String(e.name || e.displayName || "");
    const montant = Number(e.amount) || 0;

    switch (d.listener) {
      case "follower-latest":
        if (c.followActif) ajouter(c.followTitre, c.followTexte, { nom: nom });
        break;
      case "subscriber-latest":
        if (e.isCommunityGift) return; // abonnements individuels d'un don groupé : déjà annoncés
        if (e.bulkGifted) {
          if (c.giftActif) ajouter(c.giftTitre, c.giftTexte, { nom: String(e.sender || nom), montant: montant });
        } else if (e.gifted) {
          if (c.giftActif) ajouter(c.giftTitre, c.giftUnTexte, { nom: String(e.sender || ""), cible: nom });
        } else if (c.subActif) {
          ajouter(c.subTitre, montant > 1 ? c.resubTexte : c.subTexte, { nom: nom, montant: montant }, e.message);
        }
        break;
      case "raid-latest":
        if (c.raidActif) ajouter(c.raidTitre, c.raidTexte, { nom: nom, montant: montant });
        break;
      case "cheer-latest":
        if (c.cheerActif) ajouter(c.cheerTitre, c.cheerTexte, { nom: nom, montant: montant }, e.message);
        break;
      case "tip-latest":
        if (c.tipActif) {
          const somme = montant.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + " " + (c.devise || "");
          ajouter(c.tipTitre, c.tipTexte, { nom: nom, montant: somme.trim() }, e.message);
        }
        break;
      default:
        break;
    }
  });

  // ---- File d'attente : une alerte à la fois ----
  function ajouter(titre, modele, valeurs, message) {
    file.push({ titre: titre, modele: modele, valeurs: valeurs, message: message });
    if (!enCours) suivante();
  }

  function suivante() {
    const a = file.shift();
    if (!a) {
      enCours = false;
      return;
    }
    enCours = true;
    afficher(a);
  }

  // Remplace {nom}, {montant}, {cible} par des éléments (texte uniquement, jamais d'HTML).
  function rendre(modele, valeurs) {
    const frag = document.createDocumentFragment();
    String(modele || "").split(/(\{nom\}|\{montant\}|\{cible\})/).forEach(function (morceau) {
      if (morceau === "{nom}" || morceau === "{cible}") {
        const s = document.createElement("span");
        s.className = "alerte-nom";
        s.textContent = valeurs[morceau.slice(1, -1)] || "";
        frag.append(s);
      } else if (morceau === "{montant}") {
        const s = document.createElement("strong");
        s.textContent = String(valeurs.montant === undefined ? "" : valeurs.montant);
        frag.append(s);
      } else if (morceau) {
        frag.append(document.createTextNode(morceau));
      }
    });
    return frag;
  }

  const NS = "http://www.w3.org/2000/svg";
  function svg(tag, attrs) {
    const n = document.createElementNS(NS, tag);
    Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    return n;
  }

  function afficher(a) {
    const dureeMs = Math.min(60, Math.max(3, Number(c.duree) || DEFAUTS.duree)) * 1000;

    // Compteur : arc de 270°, aiguille
    const R = 38;
    const CIRC = 2 * Math.PI * R;
    const ARC = CIRC * 0.75;
    const jauge = svg("svg", { class: "alerte-jauge", viewBox: "0 0 100 100", "aria-hidden": "true" });
    jauge.append(svg("circle", { cx: 50, cy: 50, r: R, class: "alerte-piste", "stroke-dasharray": ARC + " " + CIRC, transform: "rotate(135 50 50)" }));
    const arc = svg("circle", { cx: 50, cy: 50, r: R, class: "alerte-arc", "stroke-dasharray": "0 " + CIRC, transform: "rotate(135 50 50)" });
    jauge.append(arc);
    const aiguille = svg("g", { class: "alerte-aiguille" });
    aiguille.append(svg("line", { x1: 50, y1: 50, x2: 80, y2: 50 }), svg("circle", { cx: 50, cy: 50, r: 6 }));
    aiguille.style.transform = "rotate(135deg)";
    jauge.append(aiguille);

    function regime(p, secondes, courbe) {
      const t = secondes + "s " + courbe;
      arc.style.transition = "stroke-dasharray " + t;
      aiguille.style.transition = "transform " + t;
      arc.setAttribute("stroke-dasharray", (ARC * p).toFixed(1) + " " + CIRC);
      aiguille.style.transform = "rotate(" + (135 + 270 * p).toFixed(1) + "deg)";
    }

    // Textes
    const texte = document.createElement("div");
    const titre = document.createElement("div");
    titre.className = "alerte-titre";
    titre.textContent = a.titre || "";
    const ligne = document.createElement("div");
    ligne.className = "alerte-ligne";
    ligne.append(rendre(a.modele, a.valeurs));
    texte.append(titre, ligne);
    if (c.afficherMessage && a.message) {
      const msg = document.createElement("div");
      msg.className = "alerte-message";
      msg.textContent = String(a.message).slice(0, 200);
      texte.append(msg);
    }

    const carte = document.createElement("div");
    carte.className = "alerte";
    carte.append(jauge, texte);
    const pos = document.createElement("div");
    pos.className = "alerte-pos";
    pos.append(carte);
    racine.append(pos);

    // Son
    if (c.son) {
      try {
        const audio = new Audio(c.son);
        audio.volume = Math.min(1, Math.max(0, (Number(c.volume) || 0) / 100));
        audio.play().catch(function () { /* lecture bloquée : on ignore */ });
      } catch (err) { /* son invalide : on ignore */ }
    }

    // Montée en régime, puis l'aiguille redescend pendant l'affichage
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { regime(1, 0.9, "cubic-bezier(0.3, 1.4, 0.5, 1)"); });
    });
    setTimeout(function () { regime(0, Math.max(0.5, (dureeMs - 1500) / 1000), "linear"); }, 1000);

    setTimeout(function () {
      carte.classList.add("depart");
      setTimeout(function () {
        pos.remove();
        setTimeout(suivante, 400);
      }, 450);
    }, dureeMs);
  }
})();
