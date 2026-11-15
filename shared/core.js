// Tronc commun à tous les overlays : fusionne la config perso avec les valeurs par défaut,
// applique les couleurs du thème et expose window.CONFIG.
(function () {
  function estObjet(v) {
    return v !== null && typeof v === "object" && !Array.isArray(v);
  }

  // Fusion récursive : les objets sont fusionnés, les tableaux et valeurs simples remplacés.
  function fusion(base, surcharge) {
    const res = { ...base };
    Object.keys(surcharge || {}).forEach(function (cle) {
      const v = surcharge[cle];
      res[cle] = estObjet(v) && estObjet(base[cle]) ? fusion(base[cle], v) : v;
    });
    return res;
  }

  if (!window.OVERLAY) {
    console.warn("[overlay] config.js introuvable : copie config.exemple.js en config.js. Valeurs par défaut utilisées.");
  }

  const cfg = fusion(window.OVERLAY_DEFAUT || {}, window.OVERLAY || {});
  window.CONFIG = cfg;

  // Thème : ?theme=xxx dans l'URL (prioritaire, pratique pour l'aperçu) sinon cfg.theme.
  // "minimal" = styles de base ; les autres chargent shared/themes/<theme>.css par-dessus.
  let theme = new URLSearchParams(window.location.search).get("theme") || cfg.theme || "minimal";
  if (!/^[a-z0-9-]{1,32}$/.test(theme)) theme = "minimal";
  cfg.theme = theme;
  document.documentElement.dataset.theme = theme;
  if (theme !== "minimal" && document.currentScript) {
    const lien = document.createElement("link");
    lien.rel = "stylesheet";
    lien.href = new URL("themes/" + theme + ".css", document.currentScript.src).href;
    document.head.appendChild(lien);
  }

  const c = cfg.couleurs || {};
  const vars = { "--accent": c.accent, "--bg": c.fond, "--text": c.texte, "--muted": c.attenue };
  Object.keys(vars).forEach(function (nom) {
    if (vars[nom]) document.documentElement.style.setProperty(nom, vars[nom]);
  });

  // Mise à l'échelle : chaque élément .scene (conçu en 1920x1080) s'adapte à la fenêtre,
  // centré. Dans OBS avec une source en 1920x1080, l'échelle vaut 1 (aucun changement).
  function ajuster() {
    const echelle = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    const dx = (window.innerWidth - 1920 * echelle) / 2;
    const dy = (window.innerHeight - 1080 * echelle) / 2;
    document.querySelectorAll(".scene").forEach(function (s) {
      s.style.transform = "translate(" + dx + "px," + dy + "px) scale(" + echelle + ")";
    });
  }
  document.addEventListener("DOMContentLoaded", ajuster);
  window.addEventListener("resize", ajuster);

  // Alertes StreamElements : l'overlay StreamElements est intégré en transparence par-dessus la page.
  // Ignoré dans une page intégrée elle-même dans une autre (ex. apercu.html) pour ne pas le charger en double.
  function urlAlertes() {
    const brut = String((cfg.alertes || {}).url || "").trim();
    if (!brut) return null;
    try {
      const u = new URL(brut);
      const hoteOk = u.hostname === "streamelements.com" || u.hostname.endsWith(".streamelements.com");
      if (u.protocol === "https:" && hoteOk && u.pathname.startsWith("/overlay/")) return u.href;
    } catch (e) { /* URL invalide */ }
    console.warn("[overlay] alertes.url doit être une URL d'overlay StreamElements (https://streamelements.com/overlay/...).");
    return null;
  }

  document.addEventListener("DOMContentLoaded", function () {
    const url = urlAlertes();
    if (!url || window.self !== window.top) return;
    const page = window.location.pathname.split("/").pop().replace(/\.html$/, "");
    const pages = (cfg.alertes || {}).pages;
    if (Array.isArray(pages) && !pages.includes(page)) return;
    const scene = document.querySelector(".scene");
    if (!scene) return;
    const cadre = document.createElement("iframe");
    cadre.className = "alertes-se";
    cadre.src = url;
    cadre.title = "Alertes";
    cadre.allow = "autoplay";
    scene.append(cadre);
  });
})();
