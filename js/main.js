(() => {
  const root = document.documentElement;
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('nav');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Header background after scrolling past the hero top */
  const onScroll = () => header.classList.toggle('is-solid', scrollY > 24);
  onScroll();
  addEventListener('scroll', onScroll, { passive: true });

  /* Mobile menu */
  const setMenu = open => {
    document.body.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  };
  toggle.addEventListener('click', () => setMenu(!document.body.classList.contains('nav-open')));
  nav.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  /* Active section in nav */
  const links = [...nav.querySelectorAll('a[href^="#"]')];
  const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const spy = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => spy.observe(s));

  /* Staggered reveal on scroll */
  const reveals = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(el => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver(entries => {
      entries.filter(e => e.isIntersecting).forEach((en, i) => {
        en.target.style.setProperty('--d', (i * 0.07).toFixed(2) + 's');
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(el => io.observe(el));
  }

  /* Publication filter */
  const tabs = document.querySelectorAll('.pub-filter button');
  const pubs = document.querySelectorAll('.pub');
  tabs.forEach(tab => tab.addEventListener('click', () => {
    const f = tab.dataset.filter;
    tabs.forEach(t => t.setAttribute('aria-selected', String(t === tab)));
    pubs.forEach(p => {
      p.hidden = !(f === 'all' || p.dataset.type === f);
      if (!p.hidden) p.classList.add('is-in');
    });
  }));

  document.getElementById('year').textContent = new Date().getFullYear();
})();
