/* ==========================================================================
   StyleYumy - the page layer
   The hero engine lives in hero-scrub.js. This file owns the language switch,
   the signature gold thread, the level scale, and the section entrances.
   Everything is transform and opacity, delta-gated, and reduced-motion aware.
   ========================================================================== */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  /* ------------------------------------------------------------ language */

  var LANG_KEY = 'styleyumy-lang';
  var lang = 'es';
  try { lang = localStorage.getItem(LANG_KEY) || 'es'; } catch (e) { lang = 'es'; }
  if (lang !== 'en') lang = 'es';

  function applyLang(next) {
    lang = next;
    document.documentElement.lang = next;
    $$('[data-es]').forEach(function (el) {
      var v = el.getAttribute('data-' + next);
      if (v == null) return;
      // Split headlines hold generated spans; rebuild them through the engine.
      if (el.dataset.splitDone) {
        el.textContent = v;
        delete el.dataset.splitDone;
        el.removeAttribute('data-split-done');
      } else {
        el.textContent = v;
      }
    });
    var btn = $('#lang');
    if (btn) {
      btn.textContent = btn.getAttribute('data-' + next + '-label');
      btn.setAttribute('aria-label', next === 'es'
        ? 'Change language to English' : 'Cambiar idioma a español');
    }
    if (window.hero && typeof window.hero.splitText === 'function') {
      window.hero.splitText();
      window.hero.bands.forEach(function (d) { d.k = -1; d.op = -1; });
      window.hero.updateCaptions(window.hero.heroProgress());
    }
    renderLevel(currentLevel);
    try { localStorage.setItem(LANG_KEY, next); } catch (e) {}
  }

  /* -------------------------------------------------- the level scale ---- */
  /* Real colorimetry. The undertone is what actually shows up when a level is
     lifted, and it is the honest answer to "will I go brassy". */

  var LEVELS = [
    { n:1,  hex:'#0E0B08',
      es:'Negro',                 en:'Black',
      uES:'Rojo',                 uEN:'Red',
      rES:'Desde negro no se llega a rubio en una sola cita. Se planea por etapas y la fibra se cuida en cada una.',
      rEN:'You do not go from black to blonde in one visit. We plan it in stages and protect the fiber at every one.' },
    { n:2,  hex:'#1E1611',
      es:'Castaño muy oscuro',    en:'Very dark brown',
      uES:'Rojo',                 uEN:'Red',
      rES:'Debajo hay mucho rojo. En una cita llegamos a un castaño con dimensión, y el rubio se construye después.',
      rEN:'There is a lot of red under here. In one visit we reach a brown with dimension, and the blonde gets built after.' },
    { n:3,  hex:'#2E2117',
      es:'Castaño oscuro',        en:'Dark brown',
      uES:'Rojo',                 uEN:'Red',
      rES:'Un moreno iluminado sale precioso desde aquí. Para un balayage claro te digo si hacen falta dos citas.',
      rEN:'An illuminated brunette looks beautiful from here. For a light balayage I will tell you if it takes two visits.' },
    { n:4,  hex:'#4A3323',
      es:'Castaño medio',         en:'Medium brown',
      uES:'Rojo anaranjado',      uEN:'Red orange',
      rES:'Este es el nivel que más veo salir naranja en otros lados. Con el matiz correcto encima, sale caramelo luminoso.',
      rEN:'This is the level I most often see come out brassy elsewhere. With the right toner on top, it lands luminous caramel.' },
    { n:5,  hex:'#6B4A2F',
      es:'Castaño claro',         en:'Light brown',
      uES:'Naranja',              uEN:'Orange',
      rES:'Una sola cita basta para un balayage miel con dimensión. El naranja se apaga en el tono, no en el aclarado.',
      rEN:'One visit is enough for a honey balayage with dimension. The orange gets cancelled in the toner, not in the lift.' },
    { n:6,  hex:'#8C6A3F',
      es:'Rubio oscuro',          en:'Dark blonde',
      uES:'Naranja amarillento',  uEN:'Orange yellow',
      rES:'Desde aquí el champán está cerca. Una cita, y el trabajo fino está en dónde se coloca la luz.',
      rEN:'Champagne is close from here. One visit, and the fine work is in where the light gets placed.' },
    { n:7,  hex:'#A98A55',
      es:'Rubio medio',           en:'Medium blonde',
      uES:'Amarillo',             uEN:'Yellow',
      rES:'Ya estás en zona rubia. Aquí casi todo es matiz y dimensión, no aclarado, así que tu cabello sufre menos.',
      rEN:'You are already in blonde territory. Here it is mostly toning and dimension, not lifting, so your hair takes less.' },
    { n:8,  hex:'#C4A874',
      es:'Rubio claro',           en:'Light blonde',
      uES:'Amarillo',             uEN:'Yellow',
      rES:'El amarillo de fondo es lo que hace que un rubio se vea barato. Se neutraliza y cambia todo.',
      rEN:'That yellow underneath is what makes a blonde look cheap. Neutralize it and everything changes.' },
    { n:9,  hex:'#D9C79B',
      es:'Rubio muy claro',       en:'Very light blonde',
      uES:'Amarillo pálido',      uEN:'Pale yellow',
      rES:'Aquí no se aclara, se cuida. Matiz frío o cálido según lo que quieras, y tratamiento para el brillo.',
      rEN:'Here we do not lift, we care for it. Cool or warm toner depending on what you want, plus treatment for the shine.' },
    { n:10, hex:'#E8DCBC',
      es:'Rubio clarísimo',       en:'Lightest blonde',
      uES:'Amarillo pálido',      uEN:'Pale yellow',
      rES:'El nivel más claro que existe. Todo el trabajo está en mantenerlo sano y sin que se ponga amarillo.',
      rEN:'The lightest level there is. All the work is in keeping it healthy and stopping it turning yellow.' }
  ];

  var currentLevel = 4;

  function buildScale() {
    var wrap = $('.scale');
    if (!wrap) return;
    wrap.innerHTML = '';
    LEVELS.forEach(function (L) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'sw';
      b.setAttribute('role', 'radio');
      b.setAttribute('aria-checked', L.n === currentLevel ? 'true' : 'false');
      b.setAttribute('aria-label', 'Nivel ' + L.n);
      b.dataset.level = L.n;
      b.tabIndex = L.n === currentLevel ? 0 : -1;
      b.innerHTML = '<i style="background:' + L.hex + '"></i><b>' + L.n + '</b>';
      b.addEventListener('click', function () { selectLevel(L.n, true); });
      wrap.appendChild(b);
    });
    // Arrow keys walk the scale, the way a radio group should.
    wrap.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1
            : e.key === 'ArrowLeft'  || e.key === 'ArrowUp'   ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      selectLevel(clamp(currentLevel + d, 1, 10), true);
    });
    renderLevel(currentLevel);
  }

  function selectLevel(n, focus) {
    currentLevel = n;
    $$('.sw').forEach(function (b) {
      var on = +b.dataset.level === n;
      b.setAttribute('aria-checked', on ? 'true' : 'false');
      b.tabIndex = on ? 0 : -1;
      if (on && focus) b.focus();
    });
    renderLevel(n);
  }

  function renderLevel(n) {
    var L = LEVELS[n - 1];
    if (!L) return;
    var elN = $('.lvl-n'), elName = $('.lvl-name'),
        elU = $('.lvl-under-name'), elR = $('.lvl-reach');
    if (elN) elN.textContent = L.n;
    if (elName) elName.textContent = lang === 'en' ? L.en : L.es;
    if (elU) elU.textContent = lang === 'en' ? L.uEN : L.uES;
    if (elR) elR.textContent = lang === 'en' ? L.rEN : L.rES;
  }

  /* ------------------------------------------- the signature gold thread */
  /* Built in real pixels so the stroke never distorts, and drawn by scroll. */

  var SECTION_IDS = ['firma','escala','servicios','proceso','resenas','preguntas','agendar'];
  var threadSvg = $('.thread');
  var threadPath = $('#thread-path');
  var threadLen = 0;
  var lastOff = -1;

  var threadTop = 0, threadH = 0;

  function buildThread() {
    if (!threadSvg || !threadPath) return;
    var W = document.documentElement.clientWidth;
    // Collapse the thread BEFORE measuring. An inline SVG with a viewBox and no
    // height takes its height from the viewBox ratio, so left alone it inflates
    // the document and then measures its own inflation.
    threadSvg.style.height = '0px';
    var docH = Math.max(document.body.scrollHeight, window.innerHeight);

    // The thread belongs to the page BELOW the hero: behind the video it would
    // never be seen, and it would arrive already half drawn.
    var heroEl = document.getElementById('hero');
    threadTop = heroEl ? heroEl.offsetTop + heroEl.offsetHeight : 0;
    threadH = Math.max(docH - threadTop, 1);
    threadSvg.style.top = threadTop + 'px';
    threadSvg.style.height = threadH + 'px';

    var H = threadH;
    threadSvg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    threadSvg.setAttribute('preserveAspectRatio', 'none');

    // The thread runs down the free margin beside each section and crosses the
    // page only through the whitespace BETWEEN sections, so it never cuts
    // through a headline or a paragraph. It alternates sides, section by
    // section, which is what makes it read as one ribbon threading the page.
    var sy = window.scrollY;
    var rows = SECTION_IDS.map(function (id, i) {
      var s = document.getElementById(id);
      if (!s) return null;
      var cl = Infinity, cr = -Infinity, ct = Infinity, cb = -Infinity;
      Array.prototype.forEach.call(s.children, function (el) {
        var b = el.getBoundingClientRect();
        if (b.width < 8 || b.height < 8) return;
        cl = Math.min(cl, b.left);
        cr = Math.max(cr, b.right);
        ct = Math.min(ct, b.top + sy - threadTop);
        cb = Math.max(cb, b.bottom + sy - threadTop);
      });
      if (cl === Infinity) return null;
      var onLeft = i % 2 === 0;
      // Sit in the middle of the free margin, always clear of the content.
      var x = onLeft
        ? clamp(cl * 0.46, 9, Math.max(10, cl - 16))
        : W - clamp((W - cr) * 0.46, 9, Math.max(10, (W - cr) - 16));
      return { x: x, top: ct, bot: cb, id: id };
    }).filter(Boolean);

    var d = '', nodes = [];
    if (rows.length) {
      d = 'M' + rows[0].x.toFixed(1) + ' 0';
      rows.forEach(function (r, i) {
        d += 'L' + r.x.toFixed(1) + ' ' + r.bot.toFixed(1);
        nodes.push({ x: r.x, y: r.top, at: clamp(r.top / H, 0, 1) });
        var nx = rows[i + 1];
        if (nx) {
          // Ease across through the gap: one smooth S, no corner.
          var y1 = r.bot, y2 = nx.top;
          var mid = (y1 + y2) / 2;
          d += 'C' + r.x.toFixed(1) + ' ' + mid.toFixed(1) + ',' +
               nx.x.toFixed(1) + ' ' + mid.toFixed(1) + ',' +
               nx.x.toFixed(1) + ' ' + y2.toFixed(1);
        } else {
          d += 'L' + r.x.toFixed(1) + ' ' + H.toFixed(1);
        }
      });
    }
    threadPath.setAttribute('d', d);
    threadPath.setAttribute('stroke-width', '1.5');
    threadLen = threadPath.getTotalLength();
    threadPath.style.strokeDasharray = threadLen;

    buildNodes(nodes);
    lastOff = -1;
    drawThread();
  }

  // A small gold node marks where each section hangs off the thread. They light
  // up as the line reaches them.
  var nodeEls = [];
  function buildNodes(nodes) {
    var g = threadSvg.querySelector('.thread-nodes');
    if (!g) {
      g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('class', 'thread-nodes');
      threadSvg.appendChild(g);
    }
    g.innerHTML = '';
    nodeEls = nodes.map(function (n) {
      var c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('cx', n.x.toFixed(1));
      c.setAttribute('cy', n.y.toFixed(1));
      c.setAttribute('r', '3.4');
      c.setAttribute('fill', '#A87C28');
      c.style.opacity = '0';
      g.appendChild(c);
      return { el: c, at: n.at, on: false };
    });
  }

  // Progress through the thread's own stretch of page, not the whole document,
  // so the line starts drawing exactly where the hero hands over.
  function pageProgress() {
    if (!threadH) return 0;
    var start = threadTop - window.innerHeight * 0.72;
    var span = threadH - window.innerHeight * 0.24;
    if (span <= 0) return 1;
    return clamp((window.scrollY - start) / span, 0, 1);
  }

  function drawThread() {
    if (!threadPath || !threadLen) return;
    if (document.documentElement.classList.contains('is-pinned')) return;
    // The line runs a little ahead of the reader so it always leads the eye.
    var p = clamp(pageProgress() * 1.06, 0, 1);
    var off = threadLen * (1 - p);
    if (Math.abs(off - lastOff) < 2) return;      // delta-gated
    lastOff = off;
    threadPath.style.strokeDashoffset = off;
    for (var i = 0; i < nodeEls.length; i++) {
      var n = nodeEls[i];
      var on = p >= n.at;
      if (on !== n.on) { n.on = on; n.el.style.opacity = on ? '1' : '0'; }
    }
  }

  function finishThread() {
    if (!threadPath || !threadLen) return;
    threadPath.style.strokeDashoffset = 0;
    lastOff = 0;
    nodeEls.forEach(function (n) { n.on = true; n.el.style.opacity = '1'; });
  }

  /* ---------------------------------------------------- section reveals */

  var revealIO = null;
  function wireReveals() {
    if (!('IntersectionObserver' in window)) {
      $$('.reveal').forEach(function (s) { s.classList.add('in', 'done'); });
      return;
    }
    revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        // Retire the stagger once the entrance has finished, or every later
        // hover lags by the delay forever.
        setTimeout(function () { en.target.classList.add('done'); }, 1100);
        revealIO.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.06 });
    $$('.reveal').forEach(function (s) { revealIO.observe(s); });
  }

  /* --------------------------------------------------------- the nav bar */

  var nav = $('nav');
  function updateNav() {
    if (!nav) return;
    var on = window.scrollY > 40;
    if (on !== nav.classList.contains('stuck')) nav.classList.toggle('stuck', on);
  }

  /* -------------------------------------------------- one scroll handler */

  var ticking = false;
  function onPageScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      updateNav();
      drawThread();
    });
  }

  /* -------------------------------------------------------------- boot */

  function boot() {
    var y = $('#year');
    if (y) y.textContent = new Date().getFullYear();

    buildScale();
    wireReveals();
    updateNav();

    var langBtn = $('#lang');
    if (langBtn) {
      langBtn.addEventListener('click', function () {
        applyLang(lang === 'es' ? 'en' : 'es');
      });
    }

    // Smooth in-page jumps that still respect reduced motion.
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (id.length < 2) return;
        var t = document.querySelector(id);
        if (!t) return;
        e.preventDefault();
        t.scrollIntoView({ behavior: reduce.matches ? 'auto' : 'smooth', block: 'start' });
        if (t.hasAttribute('tabindex') || /^(A|BUTTON|INPUT)$/.test(t.tagName)) t.focus({ preventScroll: true });
      });
    });

    // The hero engine. onPin/onUnpin keep the WHOLE page honest when reduced
    // motion is flipped mid-session, not just the hero.
    window.HeroScrub.init({
      src: 'assets/hero-scrub.mp4',
      poster: 'assets/hero-poster.jpg',
      bytes: 7107275,
      onPin: function () {
        finishThread();
        $$('.reveal').forEach(function (s) { s.classList.add('in', 'done'); });
      },
      onUnpin: function () {
        lastOff = -1;
        drawThread();
      }
    });

    window.addEventListener('scroll', onPageScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });

    buildThread();
    if (reduce.matches) {
      finishThread();
      $$('.reveal').forEach(function (s) { s.classList.add('in', 'done'); });
    }

    // The page grows as fonts and lazy images land, so the thread is rebuilt
    // rather than left measuring a stale document.
    if ('ResizeObserver' in window) {
      var lastH = 0;
      new ResizeObserver(function () {
        var h = document.body.scrollHeight;
        if (Math.abs(h - lastH) < 40) return;
        lastH = h;
        buildThread();
      }).observe(document.body);
    }
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { buildThread(); });
    }
    // FAQ rows change the page height, so the thread follows them.
    $$('.faq details').forEach(function (d) {
      d.addEventListener('toggle', function () { setTimeout(buildThread, 340); });
    });

    if (lang === 'en') applyLang('en');
  }

  var resizeT = null;
  function onResize() {
    clearTimeout(resizeT);
    resizeT = setTimeout(buildThread, 160);
  }

  reduce.addEventListener('change', function (e) {
    if (e.matches) { finishThread(); $$('.reveal').forEach(function (s) { s.classList.add('in', 'done'); }); }
    else { lastOff = -1; drawThread(); }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
