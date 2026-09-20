/*!
 * 10K Websites - hero scrub engine  v0.1.0
 *
 * THE ENGINEERING FLOOR ONLY. This file is the part that must be identical on
 * every build: the Blob loader, the lerp, the seek gate, the band math, the
 * five static-hero gates, reduced motion in both directions. It carries no
 * design decisions at all.
 *
 * The design stays yours: palette, type, copy, entrances, motifs, sections.
 * Entrances are CSS in hero-scrub.css (and the ones you invent); this file
 * only publishes the --k assembly variable each entrance runs on.
 *
 * Never hand-retype this logic. Copy the file, wire it with init(), and spend
 * the effort on the page instead.
 *
 * Markup contract (see index.template.html):
 *   #hero          the tall pinned hero
 *   #hero-stage    the sticky full-viewport stage inside it
 *   #hero-video    <video preload="none" muted playsinline aria-hidden="true" tabindex="-1">
 *   .poster        the poster layer (background-image set from JS, never HTML)
 *   .ring          the SVG progress ring (circle r=20, stroke-dasharray 126)
 *   .band[data-from][data-to]   one per caption beat, optional data-ramp / data-spread
 */
(function (global) {
  'use strict';

  var RING_CIRCUMFERENCE = 126;   // 2 * PI * r, r = 20
  var K_DELTA = 0.008;            // --k write threshold: converged bands cost nothing
  var OP_DELTA = 0.004;           // opacity write threshold
  var SEEK_SETTLE = 0.0005;       // lerp convergence
  var SMOOTHING = 0.16;           // per-60fps-frame smoothing; tune by feel while scrubbing
  var STALL_MS = 20000;           // no chunk for this long aborts into the still fallback
  var POSTER_SAFETY_MS = 4000;    // a hung poster never blocks the video forever

  // The five static-hero gates. These strings must stay character-for-character
  // identical to the ones in hero-scrub.css or one side loads what the other hides.
  var GATES = [
    '(max-width: 720px)',
    '(orientation: portrait) and (max-width: 1024px)',
    '(orientation: portrait) and (pointer: coarse)',
    '(orientation: landscape) and (pointer: coarse) and (max-height: 560px)',
    '(prefers-reduced-motion: reduce)'
  ];

  var clamp = function (v, lo, hi) { return Math.min(hi, Math.max(lo, v)); };

  var smoothstep = function (p, e0, e1) {
    var t = clamp((p - e0) / (e1 - e0), 0, 1);
    return t * t * (3 - 2 * t);
  };

  // Seeded PRNG so every "random" offset is identical on every load.
  function rng(seed) {
    var s = seed >>> 0;
    return function () { return (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; };
  }

  function HeroScrub(opts) {
    this.o = opts;
    this.hero = document.querySelector(opts.hero || '#hero');
    this.stage = document.querySelector(opts.stage || '#hero-stage');
    this.video = document.querySelector(opts.video || '#hero-video');
    this.posterLayer = document.querySelector(opts.posterLayer || '.poster');
    this.ring = document.querySelector(opts.ring || '.ring');
    this.bandEls = Array.prototype.slice.call(
      document.querySelectorAll(opts.bands || '.band')
    );

    this.src = opts.src || 'assets/hero-scrub.mp4';
    this.poster = opts.poster || 'assets/hero-poster.jpg';
    this.bytes = opts.bytes || 0;   // real byte size: the fallback when Content-Length is missing
    this.loadRampMs = opts.loadRampMs || 900;

    this.target = 0;
    this.shown = 0;
    this.rafId = null;
    this.lastTick = 0;
    this.seekBusy = false;
    this.pendingTime = null;
    this.heroOnScreen = true;
    this.scrubOn = false;
    this.started = false;
    this.loadStart = 0;
    this.pinned = false;

    this.onScroll = this.onScroll.bind(this);
    this.tick = this.tick.bind(this);
    this.applyHeroMode = this.applyHeroMode.bind(this);

    this.readBands();
    this.splitText();
    this.watchHero();
    this.wireVideo();
    this.wireGates();
    this.wireReducedMotion();
    this.wireVisibility();
  }

  /* ---------------------------------------------------------------- bands */

  HeroScrub.prototype.readBands = function () {
    var self = this;
    this.bands = this.bandEls.map(function (el, i) {
      var a = parseFloat(el.dataset.from);
      var b = parseFloat(el.dataset.to);
      return {
        el: el,
        a: isNaN(a) ? 0 : a,
        b: isNaN(b) ? 1 : b,
        ramp: el.dataset.ramp ? parseFloat(el.dataset.ramp) : null,
        first: i === 0,
        last: i === self.bandEls.length - 1,
        op: -1,   // cached last written opacity
        k: -1     // cached last written --k
      };
    });
  };

  // Progress 0..1 through the pinned hero.
  HeroScrub.prototype.heroProgress = function () {
    if (!this.hero) return 0;
    var rect = this.hero.getBoundingClientRect();
    var range = this.hero.offsetHeight - window.innerHeight;
    if (range <= 0) return 0;
    return clamp(-rect.top / range, 0, 1);
  };

  HeroScrub.prototype.updateCaptions = function (p) {
    var now = performance.now();
    // Band one gets a one-time, time-based assembly ramp on load that hands
    // over to scroll, so the hero never opens on footage with no words.
    var loadK = this.loadStart
      ? clamp((now - this.loadStart) / this.loadRampMs, 0, 1)
      : 0;

    for (var i = 0; i < this.bands.length; i++) {
      var d = this.bands[i];
      var f = Math.min(0.02, (d.b - d.a) / 3);
      var fadeIn = d.first ? 1 : smoothstep(p, d.a, d.a + f);
      var fadeOut = d.last ? 1 : (1 - smoothstep(p, d.b - f, d.b));
      var op = fadeIn * fadeOut;

      var ramp = d.ramp || Math.min(0.025, (d.b - d.a) * 0.35);
      var k = clamp((p - d.a) / ramp, 0, 1);
      if (d.first) k = Math.max(k, loadK);

      // Write to the DOM only on change. Per-frame writes are half of choppy.
      if (Math.abs(op - d.op) > OP_DELTA || (op === 0) !== (d.op === 0)) {
        d.op = op;
        d.el.style.opacity = op;
        d.el.style.visibility = op < 0.001 ? 'hidden' : '';
      }
      if (Math.abs(k - d.k) > K_DELTA || k === 1 || k === 0) {
        if (k !== d.k) { d.k = k; d.el.style.setProperty('--k', k.toFixed(4)); }
      }
    }
    // Band one keeps animating until its load ramp finishes.
    if (this.scrubOn && loadK < 1 && this.rafId === null) {
      this.rafId = requestAnimationFrame(this.tick);
    }
  };

  /* ----------------------------------------------------------- split text */

  // Wrap a visually-hidden span with the real sentence for screen readers,
  // plus an aria-hidden visual copy of .w word spans holding .c character spans.
  HeroScrub.prototype.splitText = function () {
    var targets = document.querySelectorAll('[data-split]');
    Array.prototype.forEach.call(targets, function (el, n) {
      if (el.dataset.splitDone) return;
      var text = el.textContent.trim();
      var mode = el.dataset.split || 'char';
      var spread = parseFloat(el.dataset.spread || '0.55');
      var rand = rng(0x9e37 + n * 7919);
      var words = text.split(/\s+/);

      var sr = document.createElement('span');
      sr.className = 'sr-only';
      sr.textContent = text;

      var vis = document.createElement('span');
      vis.className = 'split';
      vis.setAttribute('aria-hidden', 'true');

      var total = text.replace(/\s+/g, '').length;
      var idx = 0;

      words.forEach(function (word, wi) {
        var w = document.createElement('span');
        w.className = 'w';
        w.style.setProperty('--th', (wi / Math.max(1, words.length - 1) * spread).toFixed(3));

        if (mode === 'word') {
          w.textContent = word;
        } else {
          for (var i = 0; i < word.length; i++) {
            var c = document.createElement('span');
            c.className = 'c';
            c.textContent = word[i];
            var th = mode === 'grid'
              ? (idx / Math.max(1, total - 1)) * spread + rand() * 0.06
              : rand() * spread;
            c.style.setProperty('--th', th.toFixed(3));
            c.style.setProperty('--jx', ((rand() - 0.5) * 90).toFixed(1) + 'px');
            c.style.setProperty('--jy', ((rand() - 0.5) * 70).toFixed(1) + 'px');
            c.style.setProperty('--jr', ((rand() - 0.5) * 34).toFixed(1) + 'deg');
            w.appendChild(c);
            idx++;
          }
        }
        vis.appendChild(w);
        if (wi < words.length - 1) vis.appendChild(document.createTextNode(' '));
      });

      el.textContent = '';
      el.appendChild(sr);
      el.appendChild(vis);
      el.dataset.splitDone = '1';
    });
  };

  /* ----------------------------------------------------------- drive loop */

  HeroScrub.prototype.tick = function (now) {
    var dt = Math.min(100, now - (this.lastTick || now));
    this.lastTick = now;
    // The pow() normalizes smoothing to a 60fps reference, so a 120Hz screen
    // converges at the same speed as a 60Hz one and the feel is identical.
    this.shown += (this.target - this.shown) *
      (1 - Math.pow(1 - SMOOTHING, dt / 16.667));

    if (Math.abs(this.target - this.shown) < SEEK_SETTLE) {
      this.shown = this.target;
      this.rafId = null;
      this.lastTick = 0;          // converged: rest
    } else {
      this.rafId = requestAnimationFrame(this.tick);
    }
    if (this.video && this.video.duration) {
      this.requestSeek(this.shown * this.video.duration);
    }
    this.updateCaptions(this.shown);
  };

  HeroScrub.prototype.onScroll = function () {
    this.target = this.heroProgress();
    if (this.rafId === null && this.heroOnScreen) {
      this.rafId = requestAnimationFrame(this.tick);
    }
  };

  HeroScrub.prototype.watchHero = function () {
    var self = this;
    if (!this.hero || !('IntersectionObserver' in window)) return;
    new IntersectionObserver(function (entries) {
      self.heroOnScreen = entries[0].isIntersecting;
      if (self.heroOnScreen && self.scrubOn) self.onScroll();
    }, { rootMargin: '10% 0px' }).observe(this.hero);
  };

  /* ------------------------------------------------------------ seek gate */

  HeroScrub.prototype.requestSeek = function (t) {
    var v = this.video;
    if (!v || !v.duration) return;
    if (this.seekBusy) { this.pendingTime = t; return; }  // coalesce to newest
    this.seekBusy = true;
    try { v.currentTime = t; } catch (e) { this.seekBusy = false; }
  };

  HeroScrub.prototype.wireVideo = function () {
    var self = this;
    var v = this.video;
    if (!v) return;

    v.addEventListener('seeked', function () {
      self.seekBusy = false;
      if (self.pendingTime !== null) {
        var t = self.pendingTime;
        self.pendingTime = null;
        self.requestSeek(t);        // exactly one follow-up
      }
    });

    // The deadlock escape: a seek that errors never fires 'seeked', and without
    // this the gate stays busy forever and scrubbing freezes mid-scroll.
    v.addEventListener('error', function () {
      self.seekBusy = false;
      self.pendingTime = null;
      self.failVideo();
    });
  };

  /* --------------------------------------------------------- blob loading */

  HeroScrub.prototype.initHeroOnce = function () {
    if (this.started) return;
    this.started = true;
    this.loadStart = performance.now();

    var self = this;
    // The poster wins the bandwidth race by design: paint it first, and start
    // the blob fetch only once the poster is in (or has failed).
    if (this.posterLayer) {
      this.posterLayer.style.backgroundImage = "url('" + this.poster + "')";
    }
    var kick = function () { self.startBlobFetch(); };
    var img = new Image();
    img.onload = kick;
    img.onerror = kick;
    img.src = this.poster;
    setTimeout(kick, POSTER_SAFETY_MS);
  };

  HeroScrub.prototype.startBlobFetch = function () {
    if (this.fetchStarted) return;
    this.fetchStarted = true;
    var self = this;
    this.loadHeroBlob().catch(function () { self.failVideo(); });
  };

  HeroScrub.prototype.setRing = function (frac) {
    if (!this.ring) return;
    this.ring.style.setProperty('--ld',
      Math.round(RING_CIRCUMFERENCE * (1 - frac)));
  };

  HeroScrub.prototype.loadHeroBlob = function () {
    var self = this;
    var ctrl = new AbortController();
    var watchdog = setTimeout(function () { ctrl.abort(); }, STALL_MS);

    // priority:'low' makes the blob yield to critical resources.
    return fetch(this.src, { priority: 'low', signal: ctrl.signal })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        var total = Number(res.headers.get('Content-Length')) || self.bytes;
        if (!res.body) {                    // no streams: plain blob, ring hidden
          return res.blob().then(function (b) { self.attachBlob(b); });
        }
        var reader = res.body.getReader();
        var chunks = [], got = 0, lastRing = 0;

        function pump() {
          return reader.read().then(function (r) {
            if (r.done) {
              clearTimeout(watchdog);
              self.setRing(1);
              self.attachBlob(new Blob(chunks));
              return;
            }
            clearTimeout(watchdog);         // re-arm on every chunk
            watchdog = setTimeout(function () { ctrl.abort(); }, STALL_MS);
            chunks.push(r.value);
            got += r.value.length;
            var frac = total ? Math.min(1, got / total) : 0;
            var now = performance.now();
            if (now - lastRing > 100 || frac === 1) {   // throttled, terminal
              lastRing = now;                           // write always lands
              self.setRing(frac);
            }
            return pump();
          });
        }
        return pump();
      });
  };

  HeroScrub.prototype.attachBlob = function (blob) {
    var self = this;
    var v = this.video;
    this.blobUrl = URL.createObjectURL(blob);
    v.src = this.blobUrl;
    v.load();
    v.addEventListener('canplay', function () {
      self.requestSeek(self.heroProgress() * v.duration);  // land on current scroll
      self.stage && self.stage.classList.add('video-ready');
    }, { once: true });
  };

  HeroScrub.prototype.failVideo = function () {
    if (this.failed) return;
    this.failed = true;
    // An honest scroll cue, never a stuck ring.
    if (this.ring) this.ring.classList.add('is-failed');
    this.stage && this.stage.classList.add('video-failed');
  };

  /* --------------------------------------------------- static-hero gates */

  HeroScrub.prototype.enableScrub = function () {
    if (this.scrubOn) return;
    this.scrubOn = true;
    this.initHeroOnce();
    window.addEventListener('scroll', this.onScroll, { passive: true });
    // Reset caches so stale pinned styles get rewritten.
    this.bands.forEach(function (d) { d.op = -1; d.k = -1; });
    this.unpinFinalStates();
    this.updateCaptions(this.heroProgress());
    this.onScroll();   // re-seek to current position; without this the frame sits stale
  };

  HeroScrub.prototype.disableScrub = function () {
    if (!this.scrubOn) return;
    this.scrubOn = false;
    window.removeEventListener('scroll', this.onScroll);
    if (this.rafId !== null) { cancelAnimationFrame(this.rafId); this.rafId = null; }
  };

  HeroScrub.prototype.applyHeroMode = function () {
    var hit = GATES.some(function (q) { return matchMedia(q).matches; });
    if (hit) this.disableScrub(); else this.enableScrub();
  };

  HeroScrub.prototype.wireGates = function () {
    var self = this;
    // Keep the query lists referenced; unreferenced ones have historically
    // lost their listeners in old browsers.
    this.mqls = GATES.map(function (q) { return matchMedia(q); });
    this.mqls.forEach(function (m) {
      var fn = function () { self.applyHeroMode(); };
      if (m.addEventListener) m.addEventListener('change', fn);
      else m.addListener(fn);
    });
    this.applyHeroMode();
  };

  /* ------------------------------------------------------- reduced motion */

  // Honored LIVE, in BOTH directions. Re-arming the hero while leaving the
  // rest of the page pinned is the half-fix that looks done and is not.
  HeroScrub.prototype.pinToFinalStates = function () {
    if (this.pinned) return;
    this.pinned = true;
    document.documentElement.classList.add('is-pinned');
    this.bands.forEach(function (d) {
      d.el.style.opacity = 1;
      d.el.style.visibility = '';
      d.el.style.setProperty('--k', 1);
      d.op = 1; d.k = 1;
    });
    if (typeof this.o.onPin === 'function') this.o.onPin();  // lines drawn, counters at target, holds done
  };

  HeroScrub.prototype.unpinFinalStates = function () {
    if (!this.pinned) return;
    this.pinned = false;
    document.documentElement.classList.remove('is-pinned');
    if (typeof this.o.onUnpin === 'function') this.o.onUnpin();
  };

  HeroScrub.prototype.wireReducedMotion = function () {
    var self = this;
    var mq = matchMedia('(prefers-reduced-motion: reduce)');
    var fn = function (e) {
      if (e.matches) self.pinToFinalStates();
      else self.applyHeroMode();
    };
    if (mq.addEventListener) mq.addEventListener('change', fn);
    else mq.addListener(fn);
    if (mq.matches) this.pinToFinalStates();
  };

  /* ----------------------------------------------------------- visibility */

  // Two jobs. Pause every animation on a hidden tab (animation-play-state is
  // not inherited, so the body-class pattern in the CSS is what reaches nested
  // elements and pseudo-elements). And re-arm the drive on the way back: a rAF
  // queued just before the tab was hidden can never fire, and a stale rafId
  // then blocks every future frame, leaving the hero frozen.
  HeroScrub.prototype.wireVisibility = function () {
    var self = this;
    document.addEventListener('visibilitychange', function () {
      if (document.body) document.body.classList.toggle('paused', document.hidden);
      if (document.hidden || !self.scrubOn) return;
      if (self.rafId !== null) { cancelAnimationFrame(self.rafId); self.rafId = null; }
      self.lastTick = 0;
      self.onScroll();
    });
  };

  /* ------------------------------------------------------------ self-test */

  // The flick test: real visitors flick, they do not drag slowly.
  // Run flick(120,12), then flick(240,8), then flick(360,6), from the top each run.
  // A band that never reaches full opacity in the 360 run is a skippable beat.
  // A band holding full opacity for fewer than 5 consecutive 120px steps is too short.
  HeroScrub.prototype.flick = function (step, count) {
    var self = this;
    var log = [];
    var i = 0;
    return new Promise(function (done) {
      (function next() {
        if (i++ >= count) { console.table(log); return done(log); }
        window.scrollBy(0, step);
        setTimeout(function () {
          log.push({
            y: Math.round(window.scrollY),
            p: +self.heroProgress().toFixed(3),
            bands: self.bands.map(function (d) {
              return (+getComputedStyle(d.el).opacity).toFixed(2);
            }).join(' ')
          });
          next();
        }, 400);   // a beat between flicks, like a real reader
      })();
    });
  };

  global.HeroScrub = {
    init: function (opts) { return (global.hero = new HeroScrub(opts || {})); },
    GATES: GATES,
    rng: rng,
    smoothstep: smoothstep,
    clamp: clamp
  };
})(window);
