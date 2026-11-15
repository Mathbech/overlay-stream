// Chat Twitch en lecture seule : connexion anonyme (aucun compte, aucun jeton) au chat IRC de Twitch.
// window.ChatTwitch.connecter(chaine, { message, supprimer, purger }) ;
// window.ChatTwitch.creerMessage(m) construit l'élément HTML d'un message (sans innerHTML).
(function () {
  const URL_IRC = "wss://irc-ws.chat.twitch.tv:443";

  function desechapper(v) {
    return v.replace(/\\(.)/g, function (_, c) {
      return { s: " ", ":": ";", "\\": "\\", r: "\r", n: "\n" }[c] || c;
    });
  }

  // Découpe une ligne IRC : @tags :prefixe COMMANDE params :texte
  function analyser(ligne) {
    const tags = {};
    let reste = ligne;
    if (reste.startsWith("@")) {
      const i = reste.indexOf(" ");
      reste.slice(1, i).split(";").forEach(function (kv) {
        const j = kv.indexOf("=");
        if (j > 0) tags[kv.slice(0, j)] = desechapper(kv.slice(j + 1));
      });
      reste = reste.slice(i + 1);
    }
    let prefixe = "";
    if (reste.startsWith(":")) {
      const i = reste.indexOf(" ");
      prefixe = reste.slice(1, i);
      reste = reste.slice(i + 1);
    }
    let texte = null;
    const iTexte = reste.indexOf(" :");
    if (iTexte >= 0) {
      texte = reste.slice(iTexte + 2);
      reste = reste.slice(0, iTexte);
    }
    const params = reste.split(" ");
    return { tags: tags, prefixe: prefixe, commande: params.shift(), params: params, texte: texte };
  }

  // Emotes : tag "25:0-4,12-16/1902:6-10" ; positions en points de code Unicode.
  function decouper(texte, tagEmotes) {
    const plages = [];
    (tagEmotes || "").split("/").forEach(function (bloc) {
      const [id, positions] = bloc.split(":");
      if (!id || !positions || !/^[A-Za-z0-9_]+$/.test(id)) return;
      positions.split(",").forEach(function (p) {
        const [debut, fin] = p.split("-").map(Number);
        if (Number.isInteger(debut) && Number.isInteger(fin) && fin >= debut) plages.push({ id: id, debut: debut, fin: fin });
      });
    });
    plages.sort(function (a, b) { return a.debut - b.debut; });

    const car = Array.from(texte);
    const morceaux = [];
    let curseur = 0;
    plages.forEach(function (p) {
      if (p.debut < curseur || p.fin >= car.length) return;
      if (p.debut > curseur) morceaux.push({ texte: car.slice(curseur, p.debut).join("") });
      morceaux.push({ emote: p.id, nom: car.slice(p.debut, p.fin + 1).join("") });
      curseur = p.fin + 1;
    });
    if (curseur < car.length) morceaux.push({ texte: car.slice(curseur).join("") });
    return morceaux;
  }

  // Couleur de pseudo : on garde celle de Twitch sauf si elle est trop sombre pour un fond sombre.
  function couleurLisible(c) {
    if (!/^#[0-9A-Fa-f]{6}$/.test(c || "")) return "";
    const r = parseInt(c.slice(1, 3), 16);
    const g = parseInt(c.slice(3, 5), 16);
    const b = parseInt(c.slice(5, 7), 16);
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 < 0.35 ? "" : c;
  }

  function versMessage(irc) {
    let texte = irc.texte || "";
    let action = false;
    const m = /^\u0001ACTION (.*)\u0001$/.exec(texte);
    if (m) {
      texte = m[1];
      action = true;
    }
    const login = (irc.prefixe.split("!")[0] || "").toLowerCase();
    return {
      id: irc.tags.id || "",
      login: login,
      auteur: irc.tags["display-name"] || login,
      couleur: couleurLisible(irc.tags.color),
      texte: texte,
      action: action,
      morceaux: decouper(texte, irc.tags.emotes),
    };
  }

  function connecter(chaine, rappels) {
    const nom = String(chaine || "").toLowerCase();
    if (!/^[a-z0-9_]{3,25}$/.test(nom)) {
      console.warn("[chat] nom de chaîne Twitch invalide :", chaine);
      return;
    }
    let delai = 1000;

    function ouvrir() {
      const ws = new WebSocket(URL_IRC);
      ws.onopen = function () {
        delai = 1000;
        ws.send("CAP REQ :twitch.tv/tags twitch.tv/commands");
        ws.send("PASS SCHMOOPIIE");
        ws.send("NICK justinfan" + Math.floor(10000 + Math.random() * 80000));
        ws.send("JOIN #" + nom);
      };
      ws.onmessage = function (e) {
        String(e.data).split("\r\n").forEach(function (ligne) {
          if (!ligne) return;
          if (ligne.startsWith("PING")) {
            ws.send("PONG :tmi.twitch.tv");
            return;
          }
          const irc = analyser(ligne);
          if (irc.commande === "PRIVMSG" && rappels.message) {
            rappels.message(versMessage(irc));
          } else if (irc.commande === "CLEARMSG" && rappels.supprimer) {
            rappels.supprimer(irc.tags["target-msg-id"]);
          } else if (irc.commande === "CLEARCHAT" && rappels.purger) {
            rappels.purger(irc.texte ? irc.texte.toLowerCase() : null); // null = tout le chat
          }
        });
      };
      ws.onclose = function () {
        setTimeout(ouvrir, delai);
        delai = Math.min(delai * 2, 30000);
      };
    }
    ouvrir();
  }

  function creerMessage(m) {
    const n = document.createElement("div");
    n.className = "msg" + (m.action ? " action" : "");
    n.dataset.id = m.id || "";
    n.dataset.login = m.login || "";
    const auteur = document.createElement("span");
    auteur.className = "msg-auteur";
    auteur.textContent = m.auteur;
    if (m.couleur) auteur.style.color = m.couleur;
    const texte = document.createElement("span");
    texte.className = "msg-texte";
    (m.morceaux || [{ texte: m.texte }]).forEach(function (p) {
      if (p.emote) {
        const img = document.createElement("img");
        img.className = "msg-emote";
        img.alt = p.nom;
        img.src = "https://static-cdn.jtvnw.net/emoticons/v2/" + p.emote + "/default/dark/2.0";
        texte.append(img);
      } else {
        texte.append(document.createTextNode(p.texte));
      }
    });
    n.append(auteur, texte);
    return n;
  }

  // Chaîne Twitch de la config : cfg.twitch, sinon l'entrée "twitch" de cfg.reseaux. "" si invalide.
  function chaineConfig(cfg) {
    const reseaux = Array.isArray(cfg.reseaux) ? cfg.reseaux : [];
    const entree = reseaux.find(function (r) { return r.type === "twitch"; });
    const c = String(cfg.twitch || (entree && entree.texte) || "").toLowerCase();
    return /^[a-z0-9_]{3,25}$/.test(c) ? c : "";
  }

  // Nombre de followers via le service public DecAPI (sans jeton), rappel(n) à chaque relevé.
  function suivreFollowers(chaine, demo, opt, rappel) {
    if (demo) {
      rappel(1234);
      return;
    }
    if (!chaine) return;
    const charger = function () {
      fetch("https://decapi.me/twitch/followcount/" + encodeURIComponent(chaine))
        .then(function (rep) { return rep.ok ? rep.text() : ""; })
        .then(function (txt) {
          const t = String(txt).trim();
          if (/^\d+$/.test(t)) rappel(Number.parseInt(t, 10));
        })
        .catch(function () { /* hors ligne : on garde la dernière valeur */ });
    };
    charger();
    setInterval(charger, Math.max(30, Number((opt || {}).intervalleSecondes) || 60) * 1000);
  }

  const EXEMPLES = [
    ["Routier_du_71", "#4ADE80", "salut ! t'as pris quelle remorque aujourd'hui ?"],
    ["Mamie_Tracteur", "#F472B6", "le DLC coaches il vaut le coup ?"],
    ["dev_du_dimanche", "#60A5FA", "bonne route 🚚"],
    ["Kevin", "", "attention au radar après le péage 😅"],
    ["LaFermeDeJean", "#FBBF24", "première fois que je passe, sympa l'overlay"],
  ];

  // Cadre de chat complet (en-tête, liste, état vide) relié au chat Twitch (ou à de faux messages en démo).
  // o : { chaine, demo, opt (cfg.chat), titre, vide, classe }
  function creerPanneau(o) {
    const opt = o.opt || {};
    function el(tag, classe, texte) {
      const n = document.createElement(tag);
      if (classe) n.className = classe;
      if (texte !== undefined) n.textContent = texte;
      return n;
    }

    const zone = el("div", "chat " + (o.classe || ""));
    const entete = el("div", "chat-entete");
    entete.append(el("span", "chat-point"), el("span", "chat-titre", o.titre || ""));
    const liste = el("div", "chat-liste");
    const vide = el("div", "chat-vide", o.vide || "");
    liste.append(vide);
    zone.append(entete, liste);

    const max = Math.min(50, Math.max(1, Number(opt.maxMessages) || 12));
    const duree = Math.max(0, Number(opt.dureeSecondes) || 0) * 1000;
    const ignorer = (Array.isArray(opt.ignorer) ? opt.ignorer : []).map(function (l) { return String(l).toLowerCase(); });

    const majVide = function () {
      vide.hidden = liste.querySelector(".msg:not(.sortie)") !== null;
    };
    const retirer = function (n) {
      if (!n.isConnected || n.classList.contains("sortie")) return;
      n.classList.add("sortie");
      setTimeout(function () { n.remove(); majVide(); }, 600);
    };
    const ajouter = function (m) {
      if (ignorer.includes(m.login)) return;
      if (opt.masquerCommandes !== false && m.texte.trim().startsWith("!")) return;
      const n = creerMessage(m);
      liste.append(n);
      majVide();
      const vivants = liste.querySelectorAll(".msg:not(.sortie)");
      for (let i = 0; i < vivants.length - max; i++) retirer(vivants[i]);
      if (duree) setTimeout(function () { retirer(n); }, duree);
    };

    if (o.demo) {
      let i = 0;
      const suivant = function () {
        const e = EXEMPLES[i++ % EXEMPLES.length];
        ajouter({ id: "demo" + i, login: e[0].toLowerCase(), auteur: e[0], couleur: e[1], texte: e[2] });
      };
      suivant();
      suivant();
      suivant();
      setInterval(suivant, 3000);
    } else if (o.chaine) {
      connecter(o.chaine, {
        message: ajouter,
        supprimer: function (id) {
          liste.querySelectorAll(".msg").forEach(function (n) { if (id && n.dataset.id === id) retirer(n); });
        },
        purger: function (login) {
          liste.querySelectorAll(".msg").forEach(function (n) { if (!login || n.dataset.login === login) retirer(n); });
        },
      });
    }
    return zone;
  }

  window.ChatTwitch = {
    connecter: connecter,
    creerMessage: creerMessage,
    analyser: analyser,
    chaineConfig: chaineConfig,
    suivreFollowers: suivreFollowers,
    creerPanneau: creerPanneau,
  };
})();
