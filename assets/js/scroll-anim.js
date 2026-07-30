(function () {
  // Inject animation CSS
  var css = document.createElement('style');
  css.textContent =
    '.ph{opacity:0;transform:translateY(18px);transition:opacity .5s ease,transform .5s ease}' +
    '.ph.on{opacity:1;transform:none}';
  document.head.appendChild(css);

  // Intersection observer — fires when element enters viewport
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -40px 0px', threshold: 0.06 });

  function tag(el, delay) {
    if (!el || el.classList.contains('ph')) return;
    el.classList.add('ph');
    if (delay) el.style.transitionDelay = delay + 'ms';
    io.observe(el);
  }

  function stagger(els, step) {
    [].slice.call(els).forEach(function (el, i) { tag(el, i * step); });
  }

  // Each section
  document.querySelectorAll('section').forEach(function (sec) {
    // Stacked scroll cards run their own sticky effect — no entrance fade.
    if (sec.querySelector('.stack-card')) return;
    // Home hero animates once on load via CSS keyframes (style.css) — the
    // scroll-triggered fade would double-animate it.
    if (sec.classList.contains('hero-section')) return;
    var kids = [].slice.call(sec.children).filter(function (c) {
      // Skip nav, the hero collage (own scroll transform), and the restoration
      // banner (image stays static; only its text animates, tagged below).
      return c.tagName !== 'NAV' && !c.classList.contains('collage') && !c.classList.contains('restoration');
    });

    if (kids.length > 1) {
      // Multiple direct children (e.g. hero with image collage) → stagger them
      stagger(kids, 90);
    } else if (kids.length === 1) {
      var inner = kids[0];
      var innerKids = [].slice.call(inner.children);
      if (innerKids.length > 1) {
        // Single wrapper holding multiple items (grid, flex) → stagger those
        stagger(innerKids, 90);
      } else {
        // Single block → animate as one
        tag(inner, 0);
      }
    }
  });

  // Restoration / full-bleed banner divs (not <section>)
  document.querySelectorAll('.restoration h2').forEach(function (el) { tag(el, 0); });

  // Footer → fade as one unit
  tag(document.querySelector('footer'), 0);

  // Exclusive accordions: opening one closes its siblings, so only one item
  // in a group is open at a time (an open item can still be clicked closed).
  // Groups inside a [data-accordion-multi] container (the FAQ page) opt out
  // and allow several items open at once.
  document.querySelectorAll('details').forEach(function (card) {
    if (card.closest('[data-accordion-multi]')) return;
    card.addEventListener('toggle', function () {
      if (!card.open) return; // only react when this card opens
      [].forEach.call(card.parentElement.children, function (other) {
        if (other !== card && other.tagName === 'DETAILS') other.removeAttribute('open');
      });
    });
  });

  // Stacked scroll cards — give every card in the deck the height of the
  // tallest one, so the sticky stack pins uniformly. Content differs per
  // card, so this can't be done in CSS (sticky breaks inside a grid).
  // Mobile keeps auto heights: images flow inline there and equalizing
  // would leave large empty gaps on shorter cards.
  var stackCards = document.querySelectorAll('.stack-card');
  if (stackCards.length) {
    var stackDesktop = window.matchMedia('(min-width:821px)');
    var stackDeck = stackCards[0].parentElement;
    var equalizeStack = function () {
      stackDeck.classList.remove('stack-compact');
      [].forEach.call(stackCards, function (c) { c.style.height = ''; c.style.top = ''; });
      if (!stackDesktop.matches) return;
      var tallest = function () {
        var m = 0;
        [].forEach.call(stackCards, function (c) { m = Math.max(m, c.offsetHeight); });
        return m;
      };
      // Pin position must leave the whole card on screen at its peak: a card
      // pinned at top:100px with its bottom past the viewport never reveals
      // that content (the next card just covers it). Shift the staggered tops
      // up as far as needed (floor 20px), and if the tallest card still can't
      // fit, switch the deck to compact spacing and re-measure.
      var stagger = 20, margin = 20;
      var avail = window.innerHeight - 20 - (stackCards.length - 1) * stagger - margin;
      var max = tallest();
      if (max > avail) {
        stackDeck.classList.add('stack-compact');
        max = tallest();
      }
      var base = Math.max(20, Math.min(80, window.innerHeight - max - (stackCards.length - 1) * stagger - margin));
      // Cards run to the viewport bottom while pinned (extra bottom whitespace
      // inside the card) so no page background ever shows between the pinned
      // card and the one scrolling in over it.
      var height = Math.max(max, window.innerHeight - base);
      [].forEach.call(stackCards, function (c, i) {
        c.style.height = height + 'px';
        c.style.top = (base + i * stagger) + 'px';
      });
    };
    equalizeStack();
    // Re-measure once webfonts finish loading (wrap points change) and on resize.
    window.addEventListener('load', equalizeStack);
    window.addEventListener('resize', equalizeStack);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(equalizeStack);
  }

  // Headroom.js — fixed header hides on scroll-down, shows on scroll-up.
  // Homepage (nav-home): the header instead starts hidden and slides in once
  // past ~300px, staying visible while scrolled (CSS keys off --top/--not-top).
  var header = document.querySelector('nav');
  if (header && window.Headroom) {
    var homeNav = header.classList.contains('nav-home');
    // offset: on standard pages, stay in the "top" state (no dark-red swap)
    // over the tall hero; on the homepage it's the ~300px reveal point.
    new Headroom(header, { offset: homeNav ? 300 : 700 }).init();
    if (homeNav) {
      // The dark-red text swap can't key off pin state here (the header is
      // shown while scrolling down too), so toggle it from where the dark
      // hero section actually ends.
      var heroSec = document.querySelector('.hero-section');
      var inkNav = function () {
        var darkEnd = heroSec ? heroSec.offsetTop + heroSec.offsetHeight : 0;
        header.classList.toggle('nav-ink', window.scrollY > darkEnd - 90);
      };
      inkNav();
      window.addEventListener('scroll', inkNav, { passive: true });
      window.addEventListener('resize', inkNav);
    }
  }

  // Hamburger nav toggle
  var burger = document.querySelector('.nav-burger');
  if (burger) {
    burger.addEventListener('click', function () {
      document.body.classList.toggle('nav-open');
    });
    document.querySelectorAll('.nav-links a, a.nav-med').forEach(function (a) {
      a.addEventListener('click', function () {
        document.body.classList.remove('nav-open');
      });
    });
  }

  // Hero collage — scroll-driven zoom, damped for smoothness.
  var collage = document.querySelector('.collage');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (collage && !reduce) {
    var RANGE = 700;   // px of scroll over which the zoom ramps
    var MAX = 0.3;     // max extra scale (1 -> 1.3)
    var LIFT = 160;    // px the collage rises as it grows (upward drift)
    var EASE = 0.12;   // lerp factor — lower = smoother/laggier
    var target = 0, current = 0, rafId = null;
    var easeOut = function (t) { return 1 - Math.pow(1 - t, 3); }; // ease-out cubic
    var readScroll = function () {
      var y = window.pageYOffset || document.documentElement.scrollTop || 0;
      target = easeOut(Math.min(y, RANGE) / RANGE);
    };
    var tick = function () {
      current += (target - current) * EASE;
      if (Math.abs(target - current) < 0.0005) current = target;
      collage.style.transform = 'translateY(' + (-current * LIFT) + 'px) scale(' + (1 + current * MAX) + ')';
      rafId = (current !== target) ? requestAnimationFrame(tick) : null;
    };
    window.addEventListener('scroll', function () {
      readScroll();
      if (rafId === null) rafId = requestAnimationFrame(tick);
    }, { passive: true });
    readScroll(); current = target; tick();
  }
})();
