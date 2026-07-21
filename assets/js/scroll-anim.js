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
    var kids = [].slice.call(sec.children).filter(function (c) {
      return c.tagName !== 'NAV';
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
  document.querySelectorAll('.restoration').forEach(function (el) { tag(el, 0); });

  // Footer → fade as one unit
  tag(document.querySelector('footer'), 0);

  // Exclusive accordion (.edu-card): opening one closes its siblings, but a
  // card can still be closed by clicking it (standard accordion behaviour).
  document.querySelectorAll('.edu-card').forEach(function (card) {
    card.addEventListener('toggle', function () {
      if (!card.open) return; // only react when this card opens
      var group = card.parentElement.querySelectorAll('.edu-card');
      [].forEach.call(group, function (other) {
        if (other !== card) other.removeAttribute('open');
      });
    });
  });

  // Headroom.js — fixed header hides on scroll-down, shows on scroll-up.
  var header = document.querySelector('nav');
  if (header && window.Headroom) {
    new Headroom(header).init();
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
})();
