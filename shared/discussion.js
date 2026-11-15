// Écran Discussion : titre et infos à gauche (sujet, chrono du live, followers), grand cadre de chat à droite.
(function () {
  const cfg = window.CONFIG || {};
  const icones = window.ICONES || {};
  const Chat = window.ChatTwitch;
  const tous = cfg.textes || {};
  const textes = tous.discussion || {};
  const textesJeu = tous.jeu || {};
  const titre = textes.titre || ["", ""];
  const params = new URLSearchParams(window.location.search);
  const demo = params.get("demo") === "1";
  const chaine = Chat ? Chat.chaineConfig(cfg) : "";

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

  const racine = document.getElementById("ecran");
  racine.classList.add("ecran-discussion");
  racine.append(el("div", "grille"), el("div", "halo"), el("div", "grain"));

  // En-tête : pseudo + horloge
  const haut = entree(el("header", "haut"), 0);
  const marque = el("div", "marque");
  marque.append(el("span", "carre"), document.createTextNode(cfg.pseudo || ""));
  const horloge = el("div", "horloge");
  haut.append(marque, horloge);

  // Colonne d'infos
  const infos = el("div", "disc-infos");
  const h1 = entree(el("h1", "titre"), 0.15);
  h1.append(document.createTextNode(titre[0] || ""), el("br"), el("span", "accent", titre[1] || ""));
  infos.append(h1);

  if (cfg.programme) {
    const info = entree(el("p", "info", textes.sujet || ""), 0.3);
    info.append(el("strong", "", cfg.programme));
    infos.append(info);
  }

  const stats = entree(el("div", "disc-stats"), 0.45);
  const statChrono = el("div", "stat");
  const chronoValeur = el("span", "stat-valeur");
  statChrono.append(chronoValeur, el("span", "stat-label", textes.chrono || ""));
  stats.append(statChrono);

  const optFollowers = cfg.followers || {};
  if (Chat && optFollowers.actif !== false && (chaine || demo)) {
    const statFollowers = el("div", "stat");
    statFollowers.hidden = true;
    const followersValeur = el("span", "stat-valeur");
    const label = el("span", "stat-label");
    label.insertAdjacentHTML("afterbegin", icones.coeur || "");
    label.append(document.createTextNode(textesJeu.followers || ""));
    statFollowers.append(followersValeur, label);
    stats.append(statFollowers);
    Chat.suivreFollowers(chaine, demo, optFollowers, function (n) {
      followersValeur.textContent = n.toLocaleString("fr-FR");
      statFollowers.hidden = false;
    });
  }
  infos.append(stats);

  // Grand cadre de chat
  const corps = el("main", "disc-corps");
  corps.append(infos);
  if (Chat && (chaine || demo)) {
    const panneau = Chat.creerPanneau({
      chaine: chaine,
      demo: demo,
      opt: Object.assign({}, cfg.chat, { maxMessages: 30 }),
      titre: textesJeu.chat,
      vide: textesJeu.chatVide,
      classe: "chat-grand",
    });
    corps.append(entree(panneau, 0.3));
  }

  // Pied : réseaux
  const bas = entree(el("footer", "bas"), 0.6);
  (Array.isArray(cfg.reseaux) ? cfg.reseaux : []).forEach(function (r) {
    const item = el("div", "reseau");
    item.insertAdjacentHTML("afterbegin", icones[r.type] || icones.lien || "");
    item.append(el("span", "", r.texte || ""));
    bas.append(item);
  });

  racine.append(haut, corps, bas);

  const depart = Date.now();
  function tic() {
    const d = new Date();
    horloge.textContent = deux(d.getHours()) + ":" + deux(d.getMinutes());
    const s = Math.floor((Date.now() - depart) / 1000);
    chronoValeur.textContent = Math.floor(s / 3600) + ":" + deux(Math.floor((s % 3600) / 60)) + ":" + deux(s % 60);
  }
  tic();
  setInterval(tic, 250);
})();
