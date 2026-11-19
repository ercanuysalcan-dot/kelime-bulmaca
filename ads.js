/* Kelime Bulmaca - AdMob koprusu.
   Yalnizca Android uygulamasinda (AndroidAds nesnesi varken) calisir; web surumunde hicbir sey yapmaz. */
(function () {
  if (window.__adsInit) return;
  if (!window.AndroidAds || typeof Ads === "undefined") return;
  window.__adsInit = true;

  var earned = false, rcb = null, icb = null, wd = null, last = 0;

  function msg() {
    try {
      var xb = document.querySelector(".adx.wait");
      if (xb) { var t0 = xb.getAttribute("data-t"); xb.textContent = T[LANG].ade; setTimeout(function () { xb.textContent = t0; xb.classList.remove("wait"); xb.disabled = false; }, 2200); return; }
      if (typeof mode !== "undefined" && mode === "w") wsSay(T[LANG].ade); else say(T[LANG].ade);
    } catch (e) {}
  }
  function clearWd() { if (wd) { clearTimeout(wd); wd = null; } }

  /* Android'den gelen olaylar: kind = rewarded | inter */
  window.__adEvent = function (kind, ev) {
    if (kind === "rewarded") {
      if (ev === "shown") { clearWd(); return; }
      if (ev === "earned") { earned = true; return; }
      if (ev === "failed") { clearWd(); Ads.busy = false; rcb = null; earned = false; msg(); return; }
      if (ev === "closed") {
        clearWd(); Ads.busy = false;
        var f = rcb, ok = earned; rcb = null; earned = false;
        if (ok && f) f();
      }
    } else if (kind === "inter") {
      if (ev === "shown") { clearWd(); return; }
      clearWd();
      var g = icb; icb = null;
      if (g) g();
    }
  };

  /* Odullu video: coin bitince ya da "+" tusuna basinca */
  Ads.rewarded = function (done) {
    if (Ads.busy) return;
    Ads.busy = true; earned = false; rcb = done;
    wd = setTimeout(function () { Ads.busy = false; rcb = null; msg(); }, 15000);
    try { AndroidAds.rewarded(); }
    catch (e) { clearWd(); Ads.busy = false; rcb = null; msg(); }
  };

  /* Gecis reklami: 4. seviyeden sonra her 3 seviyede bir, en az 100 sn arayla */
  function maybeInter(next) {
    var n = 0;
    try { n = (+localStorage.getItem("adn") || 0) + 1; localStorage.setItem("adn", n); } catch (e) {}
    var now = Date.now();
    if (n < 4 || (n - 4) % 3 !== 0 || now - last < 100000 || Ads.busy) { next(); return; }
    last = now; icb = next;
    wd = setTimeout(function () { var g = icb; icb = null; if (g) g(); }, 8000);
    try { AndroidAds.interstitial(); }
    catch (e) { clearWd(); var g2 = icb; icb = null; if (g2) g2(); }
  }

  var nx = document.getElementById("nx");
  if (nx && nx.onclick) {
    var orig = nx.onclick;
    nx.onclick = function (ev) {
      var self = this;
      if (typeof mode !== "undefined" && mode === "w") { return orig.call(self, ev); }
      maybeInter(function () { orig.call(self, ev); });
    };
  }

  /* Mini oyunlarin (60 Saniye, Hazine Avi, Buyuk Odul, Sans Carki) sonuc ekraninda
     istege bagli "reklam izle, +20 jeton" dugmesi. Oyuncuya zorla reklam gosterilmez. */
  var LBL = { tr: "🎬 Reklam izle  +20 🪙", az: "🎬 Reklama bax  +20 🪙", ru: "🎬 Смотреть рекламу  +20 🪙" };
  var mxb = document.getElementById("mxbody");
  if (mxb && window.MutationObserver) {
    new MutationObserver(function () {
      var e = mxb.querySelector(".mxend");
      if (!e || e.__adx) return;
      e.__adx = true;
      var b = document.createElement("button");
      b.className = "mxlink adx";
      var lab = LBL[LANG] || LBL.tr;
      b.textContent = lab; b.setAttribute("data-t", lab);
      b.onclick = function () {
        if (Ads.busy) return;
        b.disabled = true; b.classList.add("wait");
        Ads.rewarded(function () {
          addCoins(20); try { mxCoins(); } catch (x) {}
          b.classList.remove("wait"); b.textContent = "✅ +20 🪙";
        });
      };
      e.appendChild(b);
    }).observe(mxb, { childList: true, subtree: true });
  }
})();
