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

  // Nav (always animate immediately — it's in the viewport on load)
  tag(document.querySelector('nav'), 0);

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
})();
