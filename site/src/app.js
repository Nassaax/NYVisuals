/* Nayas Visuals — interactions du site (sans dépendance). Rien n'est enregistré, aucun traceur. */
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
    try { sessionStorage.setItem('nyv-splash', '1'); } catch (e) {}
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

  /* ---------- essayez vous-même ---------- */
  var mini = $('.mini');
  var METIERS = {
    artisan: { nom: 'Atelier Boréal', tag: 'Menuiserie', titre: 'Du sur-mesure, posé avec soin.', sub: 'Cuisines, escaliers et dressings, de la mesure à la pose.', cta: 'Demander un devis',
      items: [['Cuisines', 'Plans et pose'], ['Escaliers', 'Bois massif'], ['Dressings', 'Sur mesure']],
      ico: ['M14.5 3.5l6 6-3 3-6-6z', 'M11.5 6.5 4 14a2.1 2.1 0 0 0 3 3l7.5-7.5'] },
    startup: { nom: 'Kairo', tag: 'Logiciel', titre: 'Votre équipe, enfin synchronisée.', sub: 'Planning, tâches et rapports au même endroit.', cta: 'Réserver une démo',
      items: [['Planning', 'Partagé en direct'], ['Tâches', 'Assignées en un clic'], ['Rapports', 'Prêts chaque semaine']],
      ico: ['M12 15 9 12c1.6-4.2 4.6-7.2 9-8.4-1.2 4.4-4.2 7.4-6 11.4z', 'M9 12H5.5L8 8.5h3.5M12 15v3.5l3.5-2.5V12.5'] },
    commerce: { nom: 'Maison Céleste', tag: 'Fleuriste', titre: 'Des fleurs qui racontent quelque chose.', sub: 'Bouquets du jour, mariages et livraison en ville.', cta: 'Commander un bouquet',
      items: [['Bouquets du jour', 'Composés le matin'], ['Mariages', 'Sur rendez-vous'], ['Livraison', 'En ville']],
      ico: ['M5 8.5h14l-1.2 11.5H6.2z', 'M9 8.5a3 3 0 0 1 6 0'] },
    bienetre: { nom: 'Studio Lina', tag: 'Coiffure', titre: 'Votre style, notre signature.', sub: 'Coupe, couleur et soins, sur rendez-vous.', cta: 'Prendre rendez-vous',
      items: [['Coupe', 'Femme, homme, enfant'], ['Couleur', 'Balayage et gloss'], ['Soins', 'Cheveux et cuir chevelu']],
      ico: ['M8.5 6.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0zM8.5 17.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z', 'M8 8.2 20 18M8 15.8 20 6'] }
  };
  function swap(el) { if (!el || reduce) return; el.classList.remove('swap'); void el.offsetWidth; el.classList.add('swap'); }
  function setMetier(key, anim) {
    var m = METIERS[key]; if (!m || !mini) return;
    $('[data-m="nom"]', mini).textContent = m.nom;
    $('[data-m="tag"]', mini).textContent = m.tag + ' · exemple';
    $('[data-m="titre"]', mini).textContent = m.titre;
    $('[data-m="sub"]', mini).textContent = m.sub;
    $('[data-m="cta"]', mini).textContent = m.cta;
    $$('[data-m="item"]', mini).forEach(function (it, i) { it.querySelector('b').textContent = m.items[i][0]; it.querySelector('small').textContent = m.items[i][1]; });
    $$('[data-m="ico"]', mini).forEach(function (svg) {
      svg.innerHTML = m.ico.map(function (p) { return '<path pathLength="1" d="' + p + '"/>'; }).join('');
      if (anim && !reduce) { svg.classList.remove('redraw'); void svg.offsetWidth; svg.classList.add('redraw'); }
    });
    if (anim) { swap($('.m-hero', mini)); swap($('.m-list', mini)); }
  }
  if (mini) {
    $$('input[name="metier"]').forEach(function (r) { r.addEventListener('change', function () { setMetier(r.value, true); }); });
    $$('input[name="couleur"]').forEach(function (r) {
      r.addEventListener('change', function () {
        mini.style.setProperty('--m-acc', r.value);
        $$('.m-btn, .m-mark', mini).forEach(function (el) { el.style.color = r.dataset.ink; });
        $$('.m-mark path', mini).forEach(function (p) { p.style.stroke = r.dataset.ink; });
      });
    });
    $$('input[name="style"]').forEach(function (r) {
      r.addEventListener('change', function () {
        mini.classList.remove('st-modern', 'st-elegant', 'st-bold'); mini.classList.add('st-' + r.value); swap($('.m-title', mini));
      });
    });
    $$('input[name="fond"]').forEach(function (r) { r.addEventListener('change', function () { mini.classList.toggle('dark-m', r.value === 'sombre'); }); });
    setMetier('artisan', false);
  }

  /* ---------- formulaire de contact en 3 étapes : message prêt (Instagram, WhatsApp, e-mail) ---------- */
  var form = $('#contact-form');
  if (form) {
    var msg = $('.form-msg', form), btn = $('.f-send', form), alt = $('.alt-link', form);
    var nextB = $('.f-next', form), backB = $('.f-back', form);
    var stepEls = $$('.fstep', form), recap = $('.recap', form);
    var progTxt = $('.fprog-txt b', form), bars = $$('.fprog-bars i', form);
    var step = 1, LAST = stepEls.length || 1;
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
    }
    $$('[data-formule]').forEach(function (a) {
      a.addEventListener('click', function () { form.elements.formule.value = a.getAttribute('data-formule'); });
    });
    function show(type, text) { msg.className = 'form-msg show ' + type; msg.textContent = text; }
    function hide() { if (!/info/.test(msg.className)) { msg.className = 'form-msg'; msg.textContent = ''; } }
    function val(name) { var el = form.elements[name]; return el ? String(el.value || '').trim() : ''; }
    function radio(name) { var r = $('input[name="' + name + '"]:checked', form); return r ? r.value : ''; }
    function build() {
      var types = $$('input[name="type"]:checked', form).map(function (i) { return i.value; });
      var lines = ['Bonjour, je suis ' + val('prenom') + '.'];
      if (types.length) lines.push('Projet : ' + types.join(', '));
      if (val('formule')) lines.push('Formule qui m’intéresse : ' + val('formule'));
      if (radio('delai')) lines.push('Délai : ' + radio('delai'));
      if (val('budget')) lines.push('Budget approximatif : ' + val('budget'));
      if (val('message')) lines.push('', val('message'));
      lines.push('', 'Me recontacter : ' + val('joindre'), '(Message préparé sur le site ' + (CFG.nom || '') + ')');
      return lines.join('\n');
    }
    // Vérifie une étape (ou toutes si s = 0) ; renvoie le numéro de la première étape en défaut, ou 0.
    function check(s) {
      var badStep = 0;
      $$('.field', form).forEach(function (f) { f.classList.remove('bad'); });
      function bad(st, name, text) {
        if (badStep) return;
        badStep = st;
        var el = form.elements[name];
        var first = el && (el.tagName ? el : el[0]);
        if (st === step) { show('err', text); if (first && first.focus) first.focus(); }
        else { goTo(st); show('err', text); if (first && first.focus) first.focus(); }
        var f = first && first.closest && first.closest('.field');
        if (f) f.classList.add('bad');
      }
      if ((!s || s === 1) && !$$('input[name="type"]:checked', form).length) bad(1, 'type', 'Choisissez au moins un type de projet (ou « Je ne sais pas encore »).');
      if (!s || s === 2) {
        if (!val('prenom')) bad(2, 'prenom', 'Indiquez votre prénom.');
        var j = val('joindre');
        if (!j) bad(2, 'joindre', 'Indiquez un téléphone ou un e-mail pour vous recontacter.');
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(j) && (j.replace(/\D/g, '').length < 8)) bad(2, 'joindre', 'Ce téléphone ou cet e-mail semble incomplet.');
      }
      if ((!s || s === 3) && !form.elements.consent.checked) bad(3, 'consent', 'Cochez la case pour accepter l’utilisation de vos informations.');
      return badStep;
    }
    function goTo(n, focus) {
      step = Math.max(1, Math.min(LAST, n));
      stepEls.forEach(function (el, i) { el.hidden = i + 1 !== step; });
      if (progTxt) progTxt.textContent = step;
      bars.forEach(function (b, i) { b.classList.toggle('on', i < step); });
      backB.hidden = step === 1;
      nextB.hidden = step === LAST;
      btn.hidden = step !== LAST;
      if (alt) alt.hidden = !(step === LAST && channels[1]);
      if (alt && channels[1]) alt.textContent = ALT[channels[1]];
      if (step === LAST && recap) recap.textContent = build();
      if (focus) {
        var h = $('.grp', stepEls[step - 1]);
        if (h) h.focus({ preventScroll: true });
        var r = form.getBoundingClientRect();
        if (r.top < 60 || r.top > window.innerHeight * 0.5) form.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      }
    }
    form.classList.add('stepped');
    goTo(1);
    nextB.addEventListener('click', function () { if (check(step)) return; hide(); goTo(step + 1, true); });
    backB.addEventListener('click', function () { hide(); goTo(step - 1, true); });
    function copy(text) {
      try { if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(text).catch(fallback); return; } } catch (e) {}
      fallback();
      function fallback() {
        var t = d.createElement('textarea'); t.value = text; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0';
        d.body.appendChild(t); t.select(); try { d.execCommand('copy'); } catch (e) {} t.remove();
      }
    }
    function go(channel) {
      if (check(0)) return;
      var text = build(), url;
      if (channel === 'ig') url = 'https://ig.me/m/' + encodeURIComponent(CFG.instagram);
      else if (channel === 'wa') url = 'https://wa.me/' + CFG.whatsapp.replace(/\D/g, '') + '?text=' + encodeURIComponent(text);
      else url = 'mailto:' + CFG.email + '?subject=' + encodeURIComponent('Projet : demande depuis le site') + '&body=' + encodeURIComponent(text);
      window.__lastContactUrl = url;   // utilisé par les tests automatiques
      if (channel === 'ig') {
        copy(text);
        show('ok', 'Votre message est copié. Ma messagerie Instagram s’ouvre : appuyez longuement dans la zone de texte, choisissez « Coller », puis envoyez.');
      } else show('ok', channel === 'wa' ? 'Votre message est prêt dans WhatsApp : il ne reste qu’à appuyer sur Envoyer.' : 'Votre message est prêt dans votre messagerie : il ne reste qu’à l’envoyer.');
      if (channel === 'mail') { window.location.href = url; return; }
      var w = window.open(url, '_blank', 'noopener'); if (!w) window.location.href = url;
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (step < LAST) { nextB.click(); return; }   // touche Entrée avant la dernière étape : on avance
      if (btn.disabled) return;
      go(channels[0]);
    });
    if (alt) alt.addEventListener('click', function () { if (channels[1]) go(channels[1]); });
  }

  /* ---------- site installable (PWA) ---------- */
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('/sw.js').catch(function () {}); });
  }
})();
