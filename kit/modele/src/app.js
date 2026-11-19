/* Kit NY Visuals — interactions des sites clients (sans dépendance). Rien n'est enregistré, aucun traceur. */
(function () {
  'use strict';
  var d = document, root = d.documentElement;
  var CFG = {};
  try { CFG = JSON.parse(d.getElementById('cfg').textContent); } catch (e) {}
  if (window.__cfgOverride) for (var k in window.__cfgOverride) CFG[k] = window.__cfgOverride[k];
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };

  /* ---------- titres qui montent mot par mot ---------- */
  $$('[data-words]').forEach(function (el) {
    var i = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = d.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(d.createTextNode(part)); return; }
            var w = d.createElement('span'); w.className = 'w';
            var s = d.createElement('span'); s.textContent = part; s.style.setProperty('--i', i++);
            w.appendChild(s); frag.appendChild(w);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1) walk(n);
      });
    })(el);
    el.classList.add('words');
  });

  /* ---------- écran d'ouverture ---------- */
  var splash = $('.splash');
  function ready() {
    if (root.classList.contains('ready')) return;
    root.classList.add('ready');
    setTimeout(function () { var a = $('.hero-art'); if (a) a.classList.add('go'); }, reduce ? 0 : 350);
  }
  if (root.classList.contains('splash-on') && splash) {
    try { sessionStorage.setItem(CFG.splashKey || 'splash-vu', '1'); } catch (e) {}
    var done = false;
    var end = function () {
      if (done) return; done = true;
      splash.classList.add('out');
      root.classList.remove('splash-on');
      ready();
      setTimeout(function () { splash.remove(); }, 650);
    };
    splash.addEventListener('click', end);
    d.addEventListener('keydown', function onKey(e) { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') { end(); d.removeEventListener('keydown', onKey); } });
    setTimeout(end, 3100);          // fin normale
    setTimeout(end, 4000);          // sécurité : jamais plus de 4 s
  } else {
    if (splash) splash.remove();
    ready();
  }

  /* ---------- apparitions au défilement ---------- */
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    $$('[data-reveal]').forEach(function (el) { io.observe(el); });
  } else $$('[data-reveal]').forEach(function (el) { el.classList.add('in'); });

  /* ---------- barre du haut, onglets actifs, tracé de la méthode ---------- */
  var top = $('.top');
  var sections = $$('main section[id]');
  var darks = $$('.dark').filter(function (el) { return !top || !top.contains(el); });
  var links = $$('.nav a[href^="#"], .tabbar a[href^="#"]');
  var steps = $('.steps'), fg = $('.track .fg'), stepEls = $$('.step');
  var ticking = false;
  function onScroll() {
    ticking = false;
    var y = window.scrollY, vh = window.innerHeight;
    if (top) top.classList.toggle('scrolled', y > 8);
    if (top) {
      var mid = top.offsetHeight / 2, onDark = false;
      darks.forEach(function (sec) { var r = sec.getBoundingClientRect(); if (r.top <= mid && r.bottom >= mid) onDark = true; });
      top.classList.toggle('on-dark', onDark);
    }
    var current = 'top';
    sections.forEach(function (s) { if (s.getBoundingClientRect().top < vh * 0.4) current = s.id; });
    links.forEach(function (a) { a.setAttribute('aria-current', a.getAttribute('href') === '#' + current ? 'true' : 'false'); });
    if (steps && fg) {
      var r = steps.getBoundingClientRect();
      var p = Math.min(1, Math.max(0, (vh * 0.62 - r.top) / r.height));
      if (reduce) p = 1;
      fg.style.setProperty('--p', (1 - p).toFixed(4));
      stepEls.forEach(function (st) { st.classList.toggle('on', st.getBoundingClientRect().top < vh * 0.62 || reduce); });
    }
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- fenêtres : menu mobile, mentions, confidentialité ---------- */
  function openDlg(id) {
    var dl = d.getElementById(id); if (!dl) return;
    $$('dialog[open]').forEach(function (o) { if (o !== dl) o.close(); });
    if (typeof dl.showModal === 'function') dl.showModal(); else dl.setAttribute('open', '');
  }
  $$('[data-open]').forEach(function (b) { b.addEventListener('click', function () { openDlg(b.getAttribute('data-open')); }); });
  $$('dialog').forEach(function (dl) {
    dl.addEventListener('click', function (e) { if (e.target === dl) dl.close(); });   // clic sur le fond
    $$('[data-close]', dl).forEach(function (b) { b.addEventListener('click', function () { dl.close(); }); });
    $$('a[href^="#"]', dl).forEach(function (a) { a.addEventListener('click', function () { dl.close(); }); });
  });

  /* ---------- formulaire de contact : message prêt dans WhatsApp, e-mail en secours ---------- */
  var form = $('#contact-form');
  if (form) {
    var msg = $('.form-msg', form), btn = $('button[type="submit"]', form), alt = $('.alt-link', form);
    var LABELS = { ig: 'Envoyer sur Instagram', wa: 'Envoyer sur WhatsApp', mail: 'Envoyer par e-mail' };
    var ALT = { wa: 'ou par WhatsApp', mail: 'ou par e-mail' };
    var channels = [];
    if (CFG.instagram) channels.push('ig');
    if (CFG.whatsapp) channels.push('wa');
    if (CFG.email) channels.push('mail');
    var lb = $('.btn-label > span', btn);
    if (!channels.length) {
      btn.disabled = true;
      show('info', CFG.bientot || 'Le formulaire sera actif très bientôt.');
    } else {
      lb.textContent = LABELS[channels[0]]; lb.setAttribute('data-t', LABELS[channels[0]]);
      if (channels[1] && alt) { alt.textContent = ALT[channels[1]]; alt.hidden = false; }
    }
    $$('[data-formule]').forEach(function (a) {
      a.addEventListener('click', function () { form.elements.formule.value = a.getAttribute('data-formule'); });
    });
    function show(type, text) { msg.className = 'form-msg show ' + type; msg.textContent = text; }
    function val(name) { var el = form.elements[name]; return el ? String(el.value || '').trim() : ''; }
    function build() {
      var types = $$('input[name="type"]:checked', form).map(function (i) { return i.value; });
      var lines = ['Bonjour, je suis ' + val('prenom') + '.'];
      if (types.length) lines.push('Demande : ' + types.join(', '));
      if (val('formule')) lines.push('Formule qui m’intéresse : ' + val('formule'));
      if (val('budget')) lines.push('Budget approximatif : ' + val('budget'));
      if (val('message')) lines.push('', val('message'));
      lines.push('', 'Me recontacter : ' + val('joindre'), '(Message préparé sur le site ' + (CFG.nom || '') + ')');
      return lines.join('\n');
    }
    function check() {
      var ok = true;
      $$('.field', form).forEach(function (f) { f.classList.remove('bad'); });
      function bad(name, text) {
        var el = form.elements[name];
        var first = el && (el.tagName ? el : el[0]);
        if (ok) { show('err', text); if (first && first.focus) first.focus(); }
        ok = false;
        var f = first && first.closest && first.closest('.field');
        if (f) f.classList.add('bad');
      }
      if (!val('prenom')) bad('prenom', 'Indiquez votre prénom.');
      var j = val('joindre');
      if (!j) bad('joindre', 'Indiquez un téléphone ou un e-mail pour vous recontacter.');
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(j) && (j.replace(/\D/g, '').length < 8)) bad('joindre', 'Ce téléphone ou cet e-mail semble incomplet.');
      if (!$$('input[name="type"]:checked', form).length) bad('type', 'Choisissez au moins un type de demande (ou « Autre demande »).');
      if (!form.elements.consent.checked) bad('consent', 'Cochez la case pour accepter l’utilisation de vos informations.');
      return ok;
    }
    function copy(text) {
      try { if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(text).catch(fallback); return; } } catch (e) {}
      fallback();
      function fallback() {
        var t = d.createElement('textarea'); t.value = text; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0';
        d.body.appendChild(t); t.select(); try { d.execCommand('copy'); } catch (e) {} t.remove();
      }
    }
    function go(channel) {
      if (!check()) return;
      var text = build(), url;
      if (channel === 'ig') url = 'https://ig.me/m/' + encodeURIComponent(CFG.instagram);
      else if (channel === 'wa') url = 'https://wa.me/' + CFG.whatsapp.replace(/\D/g, '') + '?text=' + encodeURIComponent(text);
      else url = 'mailto:' + CFG.email + '?subject=' + encodeURIComponent('Demande depuis le site') + '&body=' + encodeURIComponent(text);
      window.__lastContactUrl = url;   // utilisé par les tests automatiques
      if (channel === 'ig') {
        copy(text);
        show('ok', 'Votre message est copié. Ma messagerie Instagram s’ouvre : appuyez longuement dans la zone de texte, choisissez « Coller », puis envoyez.');
      } else show('ok', channel === 'wa' ? 'Votre message est prêt dans WhatsApp : il ne reste qu’à appuyer sur Envoyer.' : 'Votre message est prêt dans votre messagerie : il ne reste qu’à l’envoyer.');
      if (channel === 'mail') { window.location.href = url; return; }
      var w = window.open(url, '_blank', 'noopener'); if (!w) window.location.href = url;
    }
    form.addEventListener('submit', function (e) { e.preventDefault(); if (btn.disabled) return; go(channels[0]); });
    if (alt) alt.addEventListener('click', function () { if (channels[1]) go(channels[1]); });
  }

  /* ---------- site installable (PWA) ---------- */
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
  }
})();
