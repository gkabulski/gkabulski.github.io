(function () {
  'use strict';
  var BASE = '';
  var D = window.PORTFOLIO;
  var $ = function (id) { return document.getElementById(id); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* nav solidifies on scroll */
  var nav = $('nav');
  function onScroll() { nav.classList.toggle('solid', window.scrollY > window.innerHeight * 0.6); }
  if (document.body.classList.contains('home')) { onScroll(); addEventListener('scroll', onScroll, { passive: true }); }

  /* fade-up reveal */
  function reveal(root) {
    var els = (root || document).querySelectorAll('.reveal:not(.in)');
    if (reduce || !('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting || e.boundingClientRect.top < innerHeight) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (e) { io.observe(e); });
  }

  /* about page */
  var ab = $('aboutImg');
  if (ab && D) {
    ab.src = BASE + D.about.md;
    ab.srcset = BASE + D.about.sm + ' 480w, ' + BASE + D.about.md + ' 960w, ' + BASE + D.about.lg + ' 1400w';
    ab.sizes = '(min-width:900px) 45vw, 100vw';
  }

  var grid = $('grid');
  if (!grid || !D) { reveal(); return; }

  /* ---------- portfolio ---------- */
  var photos = D.photos, cats = D.categories, catLabel = {};
  cats.forEach(function (c) { catLabel[c.id] = c.label; });
  var active = 'all', list = photos, tabs = $('tabs');

  function mkTab(id, label) {
    var b = document.createElement('button');
    b.className = 'tab'; b.type = 'button'; b.setAttribute('role', 'tab'); b.dataset.id = id; b.textContent = label;
    b.addEventListener('click', function () { setFilter(id, true); });
    tabs.appendChild(b);
  }
  mkTab('all', 'All');
  cats.forEach(function (c) { mkTab(c.id, c.label); });

  function render() {
    list = active === 'all' ? photos : photos.filter(function (p) { return p.category === active; });
    var frag = document.createDocumentFragment();
    list.forEach(function (p, i) {
      var b = document.createElement('button');
      b.className = 'tile'; b.type = 'button'; b.dataset.i = i;
      b.style.background = p.color; b.style.aspectRatio = p.w + ' / ' + p.h;
      b.setAttribute('aria-label', 'Open ' + p.title);
      var eager = i < 4;
      b.innerHTML = '<img src="' + BASE + p.md + '" srcset="' + BASE + p.sm + ' 480w, ' + BASE + p.md + ' 960w" ' +
        'sizes="(min-width:1300px) 25vw,(min-width:900px) 33vw,(min-width:560px) 50vw,100vw" width="' + p.w + '" height="' + p.h + '" alt="' +
        p.title.replace(/"/g, '&quot;') + '" decoding="async" ' + (eager ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"') + '>' +
        '<span class="ov"><b></b><span></span></span>';
      b.querySelector('b').textContent = p.title;
      b.querySelector('.ov span').textContent = catLabel[p.category] + ' · ' + p.year;
      frag.appendChild(b);
    });
    grid.replaceChildren(frag);
    $('count').textContent = list.length + ' photographs';
    tabs.querySelectorAll('.tab').forEach(function (t) { t.setAttribute('aria-selected', String(t.dataset.id === active)); });
  }
  function setFilter(id, push) {
    active = id; render();
    if (push) history.replaceState(null, '', id === 'all' ? location.pathname + location.search : '#' + id);
  }
  grid.addEventListener('click', function (e) {
    var t = e.target.closest('.tile'); if (t) openLb(+t.dataset.i, t);
  });
  function fromHash() {
    var h = location.hash.slice(1);
    active = cats.some(function (c) { return c.id === h; }) ? h : 'all';
    render();
  }
  addEventListener('hashchange', function () { if (location.hash === '#work') return; fromHash(); });
  fromHash();
  if (location.hash && active !== 'all') setTimeout(function () { $('work').scrollIntoView(); }, 50);
  reveal();

  /* ---------- lightbox ---------- */
  var lb = $('lb'), img = $('lbImg'), idx = 0, opener = null, loadTok = 0;
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function show(i) {
    idx = (i + list.length) % list.length;
    var p = list[idx], tok = ++loadTok;
    $('lbCount').textContent = pad(idx + 1) + ' / ' + pad(list.length);
    $('lbTitle').textContent = p.title;
    $('lbMeta').textContent = catLabel[p.category] + ' · ' + p.exif + ' · ' + p.year;
    img.style.opacity = .35;
    img.alt = p.title;
    img.src = BASE + p.md; /* instant low-res, swapped for lg once loaded */
    var hi = new Image();
    hi.onload = function () { if (tok === loadTok) { img.src = hi.src; img.style.opacity = 1; } };
    hi.onerror = function () { img.style.opacity = 1; };
    hi.src = BASE + p.lg;
    [1, -1].forEach(function (d) { new Image().src = BASE + list[(idx + d + list.length) % list.length].lg; });
  }
  function openLb(i, from) {
    opener = from || document.activeElement;
    lb.hidden = false; document.body.classList.add('locked');
    show(i); $('lbClose').focus();
  }
  function closeLb() {
    lb.hidden = true; document.body.classList.remove('locked'); loadTok++;
    if (opener && document.contains(opener)) opener.focus();
  }
  $('lbClose').addEventListener('click', closeLb);
  $('lbPrev').addEventListener('click', function () { show(idx - 1); });
  $('lbNext').addEventListener('click', function () { show(idx + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('lb-fig')) closeLb(); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLb();
    else if (e.key === 'ArrowLeft') show(idx - 1);
    else if (e.key === 'ArrowRight') show(idx + 1);
    else if (e.key === 'Tab') {
      var f = lb.querySelectorAll('button'), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      else if (!lb.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    }
  });
  var sx = 0, sy = 0;
  lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) show(idx + (dx < 0 ? 1 : -1));
  }, { passive: true });
})();
