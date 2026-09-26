(() => {
  const root = document.documentElement;
  root.classList.remove('no-js');

  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('nav');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobileNav = matchMedia('(max-width: 960px)');

  /* Header background after scrolling past the hero top */
  const onScroll = () => header.classList.toggle('is-solid', scrollY > 24);
  onScroll();
  addEventListener('scroll', onScroll, { passive: true });

  /* Mobile menu */
  const isOpen = () => document.body.classList.contains('nav-open');
  const setMenu = (open, { restoreFocus = false } = {}) => {
    document.body.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) nav.querySelector('a').focus({ preventScroll: true });
    else if (restoreFocus) toggle.focus();
  };
  toggle.addEventListener('click', () => setMenu(!isOpen()));
  nav.addEventListener('click', e => { if (e.target.closest('a') && isOpen()) setMenu(false); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && isOpen()) setMenu(false, { restoreFocus: true }); });
  // Leaving the mobile breakpoint with the menu open would otherwise leave scrolling locked
  const closeIfDesktop = () => { if (!mobileNav.matches && isOpen()) setMenu(false); };
  mobileNav.addEventListener('change', closeIfDesktop);
  addEventListener('resize', closeIfDesktop, { passive: true });

  /* Back to top: logo and footer link. #top is the body, but scroll explicitly
     so it also works when the URL already ends in #top. */
  document.querySelectorAll('a[href="#top"]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    if (isOpen()) setMenu(false);
    scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    history.replaceState(null, '', location.pathname + location.search);
  }));

  /* Active section in nav. The hero is observed too, so nothing stays highlighted at the top. */
  const links = [...nav.querySelectorAll('a[href^="#"]')];
  const watched = [document.querySelector('.hero'), ...links.map(a => document.querySelector(a.getAttribute('href')))].filter(Boolean);
  const spy = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  watched.forEach(s => spy.observe(s));

  /* Staggered reveal on scroll */
  const reveals = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(el => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver(entries => {
      entries.filter(e => e.isIntersecting).forEach((en, i) => {
        const el = en.target;
        el.style.setProperty('--d', (i * 0.07).toFixed(2) + 's');
        el.classList.add('is-in');
        // Drop the stagger once shown so later transitions are not delayed
        el.addEventListener('transitionend', () => el.style.removeProperty('--d'), { once: true });
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(el => io.observe(el));
  }

  /* Publication filter */
  const filters = document.querySelectorAll('.pub-filter button');
  const pubs = document.querySelectorAll('.pub');
  filters.forEach(btn => btn.addEventListener('click', () => {
    const f = btn.dataset.filter;
    filters.forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
    pubs.forEach(p => {
      p.hidden = !(f === 'all' || p.dataset.type === f);
      if (!p.hidden) p.classList.add('is-in');
    });
  }));

  document.getElementById('year').textContent = new Date().getFullYear();
})();
