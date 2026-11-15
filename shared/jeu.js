// Overlay en jeu : bandeau discret (pseudo, programme, chrono du live, followers, réseaux en rotation)
// + cadre de chat. Positions : ?position=... et ?chat=... dans l'URL, sinon la config.
(function () {
  const cfg = window.CONFIG || {};
  const icones = window.ICONES || {};
  const Chat = window.ChatTwitch;
  const opt = cfg.jeu || {};
  const textes = (cfg.textes && cfg.textes.jeu) || {};
  const params = new URLSearchParams(window.location.search);
  const demo = params.get("demo") === "1";
  const chaine = Chat ? Chat.chaineConfig(cfg) : "";

  const POSITIONS = ["haut-gauche", "haut-centre", "haut-droite", "bas-gauche", "bas-centre", "bas-droite"];
  let position = params.get("position") || opt.position;
  if (!POSITIONS.includes(position)) position = "haut-centre";

  const racine = document.getElementById("jeu");
  racine.classList.add("pos-" + position);
  const marge = Number(opt.marge);
  if (Number.isFinite(marge)) {
    racine.style.setProperty("--marge", Math.min(300, Math.max(0, marge)) + "px");
  }

  function el(tag, classe, texte) {
    const n = document.createElement(tag);
    if (classe) n.className = classe;
    if (texte !== undefined) n.textContent = texte;
    return n;
  }

  function svg(tag, attrs) {
    const n = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    return n;
  }

  function deux(n) {
    return String(n).padStart(2, "0");
  }

  const ancre = el("div", "ancre");
  const plaque = el("div", "plaque entree");
  ancre.append(plaque);
  racine.append(ancre);

  const segments = [];

  // Pseudo
  const marque = el("span", "jeu-marque");
  marque.append(el("span", "jeu-point"), document.createTextNode(cfg.pseudo || ""));
  segments.push(marque);

  // Programme
  if (cfg.programme) segments.push(el("span", "jeu-programme", cfg.programme));

  // Chrono du live (depuis le chargement de la source) + anneau qui fait un tour par minute
  const R = 9;
  const CIRC = 2 * Math.PI * R;
  const chrono = el("span", "jeu-chrono");
  const anneau = svg("svg", { viewBox: "0 0 24 24", "aria-hidden": "true" });
  anneau.append(svg("circle", { cx: 12, cy: 12, r: R, class: "anneau-piste" }));
  const anneauArc = svg("circle", { cx: 12, cy: 12, r: R, class: "anneau-arc", "stroke-dasharray": "0 " + CIRC, transform: "rotate(-90 12 12)" });
  anneau.append(anneauArc);
  const chronoValeur = el("span", "jeu-chrono-valeur");
  chrono.append(anneau);
  if (textes.chrono) chrono.append(el("span", "jeu-chrono-label", textes.chrono));
  chrono.append(chronoValeur);
  segments.push(chrono);

  // Followers : masqué (avec son séparateur) tant que le nombre n'est pas connu
  const optFollowers = cfg.followers || {};
  if (Chat && optFollowers.actif !== false && (chaine || demo)) {
    const followers = el("span", "jeu-followers");
    followers.insertAdjacentHTML("afterbegin", icones.coeur || "");
    const followersValeur = el("span", "jeu-followers-valeur");
    followers.append(followersValeur, el("span", "jeu-followers-label", textes.followers || ""));
    followers.hidden = true;
    segments.push(followers);
    Chat.suivreFollowers(chaine, demo, optFollowers, function (n) {
      followersValeur.textContent = n.toLocaleString("fr-FR");
      followers.hidden = false;
      if (followers.previousSibling) followers.previousSibling.hidden = false; // séparateur
    });
  }

  // Réseaux en rotation
  const reseaux = Array.isArray(cfg.reseaux) ? cfg.reseaux : [];
  const reseau = el("span", "jeu-reseau");
  function afficherReseau(i) {
    const r = reseaux[i] || {};
    reseau.replaceChildren();
    reseau.insertAdjacentHTML("afterbegin", icones[r.type] || icones.lien || "");
    reseau.append(el("span", "", r.texte || ""));
  }
  if (reseaux.length) {
    afficherReseau(0);
    segments.push(reseau);
  }
  if (reseaux.length > 1) {
    let index = 0;
    const duree = Math.max(3, Number(opt.rotationSecondes) || 10) * 1000;
    setInterval(function () {
      reseau.classList.add("cache");
      setTimeout(function () {
        index = (index + 1) % reseaux.length;
        afficherReseau(index);
        reseau.classList.remove("cache");
      }, 400);
    }, duree);
  }

  segments.forEach(function (s, i) {
    if (i > 0) {
      const sep = el("span", "sep");
      sep.hidden = s.hidden; // séparateur masqué avec son segment (followers pas encore chargés)
      plaque.append(sep);
    }
    plaque.append(s);
  });

  // Cadre de chat
  const optChat = cfg.chat || {};
  const POSITIONS_CHAT = ["haut-gauche", "milieu-gauche", "bas-gauche", "haut-droite", "milieu-droite", "bas-droite"];
  let posChat = params.get("chat") || optChat.position;
  if (Chat && optChat.actif !== false && posChat !== "off" && (chaine || demo)) {
    if (!POSITIONS_CHAT.includes(posChat)) posChat = "milieu-gauche";
    racine.append(Chat.creerPanneau({
      chaine: chaine,
      demo: demo,
      opt: optChat,
      titre: textes.chat,
      vide: textes.chatVide,
      classe: "chat-" + posChat,
    }));
  }

  const depart = Date.now();
  function tic() {
    const s = Math.floor((Date.now() - depart) / 1000);
    chronoValeur.textContent = Math.floor(s / 3600) + ":" + deux(Math.floor((s % 3600) / 60)) + ":" + deux(s % 60);
    anneauArc.setAttribute("stroke-dasharray", ((CIRC * (s % 60)) / 60).toFixed(2) + " " + CIRC);
  }
  tic();
  setInterval(tic, 250);
})();
