// Construit un écran plein cadre (début / pause / fin) à partir de window.CONFIG (voir core.js).
// Le type d'écran est lu dans <body data-ecran="debut|pause|fin">.
(function () {
  const cfg = window.CONFIG || {};
  const icones = window.ICONES || {};
  const tous = cfg.textes || {};
  const type = ["debut", "pause", "fin", "panne"].includes(document.body.dataset.ecran) ? document.body.dataset.ecran : "debut";
  const textes = tous[type] || {};
  const titre = textes.titre || ["", ""];

  function el(tag, classe, texte) {
    const n = document.createElement(tag);
    if (classe) n.className = classe;
    if (texte !== undefined) n.textContent = texte;
    return n;
  }

  function entree(n, delai) {
    n.classList.add("entree");
    n.style.setProperty("--d", delai + "s");
    return n;
  }

  function deux(n) {
    return String(n).padStart(2, "0");
  }

  function formatDuree(secondes) {
    const s = Math.max(0, Math.floor(secondes));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return (h > 0 ? h + ":" + deux(m) : deux(m)) + ":" + deux(s % 60);
  }

  // Compteur circulaire (affiché par certains thèmes seulement, masqué par défaut en CSS)
  const NS = "http://www.w3.org/2000/svg";
  function svg(tag, attrs) {
    const n = document.createElementNS(NS, tag);
    Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    return n;
  }
  const R = 170;
  const CIRC = 2 * Math.PI * R;
  const ARC = CIRC * 0.75; // arc de 270°
  const jauge = el("div", "jauge");
  const jaugeSvg = svg("svg", { viewBox: "0 0 400 400", "aria-hidden": "true" });
  const rotation = "rotate(135 200 200)";
  jaugeSvg.append(svg("circle", { cx: 200, cy: 200, r: R, class: "jauge-piste", "stroke-dasharray": ARC + " " + CIRC, transform: rotation }));
  const jaugeArc = svg("circle", { cx: 200, cy: 200, r: R, class: "jauge-arc", "stroke-dasharray": "0 " + CIRC, transform: rotation });
  jaugeSvg.append(jaugeArc);
  for (let i = 0; i <= 30; i++) {
    const a = ((135 + (270 * i) / 30) * Math.PI) / 180;
    const majeur = i % 5 === 0;
    const r1 = majeur ? 128 : 138;
    const r2 = 150;
    jaugeSvg.append(svg("line", {
      x1: 200 + r1 * Math.cos(a), y1: 200 + r1 * Math.sin(a),
      x2: 200 + r2 * Math.cos(a), y2: 200 + r2 * Math.sin(a),
      class: majeur ? "jauge-trait majeur" : "jauge-trait",
    }));
  }
  // Aiguille (affichée selon le thème) : pointe vers la droite, tournée de 135° + 270° × progression
  const aiguille = svg("g", { class: "jauge-aiguille" });
  aiguille.append(
    svg("line", { x1: 200, y1: 200, x2: 352, y2: 200, class: "jauge-aiguille-tige" }),
    svg("circle", { cx: 200, cy: 200, r: 9, class: "jauge-aiguille-axe" })
  );
  jaugeSvg.append(aiguille);

  // Textes du compteur : chaque thème choisit lesquels afficher
  // (valeur + unité = minutes ; label + détail = minuteur complet).
  const jaugeTexte = el("div", "jauge-texte");
  const jaugeLabel = el("div", "jauge-label");
  const jaugeValeur = el("div", "jauge-valeur");
  const jaugeDetail = el("div", "jauge-detail");
  const jaugeUnite = el("div", "jauge-unite");
  jaugeTexte.append(jaugeLabel, jaugeValeur, jaugeDetail, jaugeUnite);
  jauge.append(jaugeSvg, jaugeTexte);

  function majJauge(progression, valeur, unite, detail, label) {
    const p = Math.min(1, Math.max(0, progression));
    jaugeArc.setAttribute("stroke-dasharray", (ARC * p).toFixed(1) + " " + CIRC);
    aiguille.style.transform = "rotate(" + (135 + 270 * p).toFixed(2) + "deg)";
    jaugeValeur.textContent = valeur;
    jaugeUnite.textContent = unite || "";
    jaugeDetail.textContent = detail === undefined ? valeur : detail;
    jaugeLabel.textContent = label || "";
  }

  const racine = document.getElementById("ecran");
  racine.classList.add("ecran-" + type);
  const blobs = el("div", "blobs");
  blobs.append(el("span"), el("span"), el("span"));
  const coins = el("div", "coins");
  coins.append(el("span"), el("span"), el("span"), el("span"));
  racine.append(blobs, el("div", "grille"), el("div", "halo"), el("div", "grain"), coins, entree(jauge, 0.5));

  // En-tête : pseudo + horloge
  const haut = entree(el("header", "haut"), 0);
  const marque = el("div", "marque");
  marque.append(el("span", "carre"), document.createTextNode(cfg.pseudo || ""));
  const horloge = el("div", "horloge");
  haut.append(marque, horloge);

  // Centre : étiquette, titre, info, minuteur
  const centre = el("main", "centre");
  const etiquette = entree(el("div", "etiquette"), 0.15);
  etiquette.append(el("span", "point"), document.createTextNode(textes.etiquette || ""));

  const h1 = entree(el("h1", "titre"), 0.3);
  h1.append(document.createTextNode(titre[0] || ""), el("br"), el("span", "accent", titre[1] || ""));
  centre.append(etiquette, h1);

  let infoLabel = "";
  let infoValeur = "";
  if (type === "fin") {
    if (cfg.prochainLive) {
      infoLabel = tous.prochain || "";
      infoValeur = cfg.prochainLive;
    } else {
      infoLabel = textes.sansProchain || "";
    }
  } else if (type === "panne") {
    infoLabel = textes.info || "";
  } else if (cfg.programme) {
    infoLabel = tous.programme || "";
    infoValeur = cfg.programme;
  }
  if (infoLabel || infoValeur) {
    const info = entree(el("p", "info", infoLabel), 0.45);
    if (infoValeur) info.append(el("strong", "", infoValeur));
    centre.append(info);
  }

  let majMinuteur = null;
  if (type === "debut" || type === "pause" || type === "panne") {
    const bloc = entree(el("div", "minuteur"), 0.6);
    const label = el("div", "minuteur-label", textes.minuteur || "");
    const valeur = el("div", "minuteur-valeur");
    bloc.append(label, valeur);
    centre.append(bloc);

    const depart = Date.now();
    if (type === "debut") {
      const total = Math.max(0, Number(cfg.debutMinutes) || 0) * 60;
      const barre = el("div", "barre");
      const remplissage = el("span");
      barre.append(remplissage);
      bloc.append(barre);
      majMinuteur = function () {
        const restant = total - (Date.now() - depart) / 1000;
        if (restant <= 0) {
          label.textContent = textes.finiLabel || "";
          valeur.textContent = textes.fini || "";
          valeur.classList.add("fini");
          remplissage.style.width = "100%";
          majJauge(1, "00", textes.jaugeUnite, textes.fini || "", textes.finiLabel);
        } else {
          const p = 1 - restant / total;
          const duree = formatDuree(Math.ceil(restant));
          valeur.textContent = duree;
          remplissage.style.width = (100 * p).toFixed(2) + "%";
          majJauge(p, deux(Math.ceil(restant / 60)), textes.jaugeUnite, duree, textes.minuteur);
        }
      };
    } else {
      majMinuteur = function () {
        const ecoule = (Date.now() - depart) / 1000;
        const duree = formatDuree(ecoule);
        valeur.textContent = duree;
        // Pause : l'aiguille fait un tour par minute. Panne : elle reste au point mort.
        const p = type === "panne" ? 0 : (ecoule % 60) / 60;
        majJauge(p, deux(Math.floor(ecoule / 60)), textes.jaugeUnite, duree, textes.minuteur);
      };
    }
  } else {
    majJauge(1, textes.jaugeValeur || "", "");
  }

  // Pied : réseaux
  const bas = entree(el("footer", "bas"), 0.75);
  (Array.isArray(cfg.reseaux) ? cfg.reseaux : []).forEach(function (r) {
    const item = el("div", "reseau");
    item.insertAdjacentHTML("afterbegin", icones[r.type] || icones.lien || "");
    item.append(el("span", "", r.texte || ""));
    bas.append(item);
  });

  racine.append(haut, centre, bas);

  function tic() {
    const d = new Date();
    horloge.textContent = deux(d.getHours()) + ":" + deux(d.getMinutes());
    if (majMinuteur) majMinuteur();
  }
  tic();
  setInterval(tic, 250);
})();
