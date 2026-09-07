/* global IntersectionObserver, addEventListener, document, innerHeight, performance, requestAnimationFrame, scrollY, setTimeout, window */

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const header = document.querySelector('[data-header]');
const progress = document.querySelector('[data-scroll-progress]');
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#site-nav');

function updateScroll() {
  const max = document.documentElement.scrollHeight - innerHeight;
  if (progress) progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  header?.classList.toggle('is-scrolled', scrollY > 12);
}
addEventListener('scroll', updateScroll, { passive: true });
updateScroll();

toggle?.addEventListener('click', () => {
  const open = header.classList.toggle('nav-open');
  toggle.setAttribute('aria-expanded', String(open));
});
nav?.querySelectorAll('a').forEach((link) =>
  link.addEventListener('click', () => {
    header.classList.remove('nav-open');
    toggle?.setAttribute('aria-expanded', 'false');
  }),
);

const reveals = document.querySelectorAll('.reveal');
if (reducedMotion || !('IntersectionObserver' in window))
  reveals.forEach((item) => item.classList.add('is-visible'));
else {
  const observer = new IntersectionObserver(
    (entries, self) =>
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        self.unobserve(entry.target);
      }),
    { threshold: 0.1, rootMargin: '0px 0px -40px' },
  );
  reveals.forEach((item) => observer.observe(item));
}

// Deep links should never land on a still-hidden section while the observer is settling.
if (window.location.hash) {
  document
    .querySelector(window.location.hash)
    ?.querySelectorAll('.reveal')
    .forEach((item) => item.classList.add('is-visible'));
}

const heroArt = document.querySelector('[data-parallax-art]');
if (heroArt && !reducedMotion) {
  heroArt.addEventListener('pointermove', (event) => {
    const box = heroArt.getBoundingClientRect();
    heroArt.style.setProperty('--px', String((event.clientX - box.left) / box.width - 0.5));
    heroArt.style.setProperty('--py', String((event.clientY - box.top) / box.height - 0.5));
  });
  heroArt.addEventListener('pointerleave', () => {
    heroArt.style.setProperty('--px', 0);
    heroArt.style.setProperty('--py', 0);
  });
}

const gallery = document.querySelector('[data-gallery]');
if (gallery) {
  const shots = [
    [
      './assets/showcase/runtime/onboarding.jpg',
      './assets/showcase/runtime/home.jpg',
      '和生序引导页实机截图',
    ],
    [
      './assets/showcase/runtime/home.jpg',
      './assets/showcase/runtime/health-records.jpg',
      '和生序首页实机截图',
    ],
    [
      './assets/showcase/runtime/health-records.jpg',
      './assets/showcase/runtime/onboarding.jpg',
      '健康记录矩阵实机截图',
    ],
  ];
  const main = gallery.querySelector('[data-main-shot]');
  const back = gallery.querySelector('[data-back-shot]');
  gallery.querySelectorAll('[data-slide]').forEach((button) =>
    button.addEventListener('click', () => {
      const [mainSrc, backSrc, alt] = shots[Number(button.dataset.slide)];
      gallery.classList.add('is-changing');
      setTimeout(
        () => {
          main.src = mainSrc;
          main.alt = alt;
          back.src = backSrc;
          gallery.classList.remove('is-changing');
        },
        reducedMotion ? 0 : 180,
      );
      gallery
        .querySelectorAll('[data-slide]')
        .forEach((item) => item.classList.toggle('is-active', item === button));
    }),
  );
}

const countObserver = new IntersectionObserver(
  (entries, self) =>
    entries.forEach((entry) => {
      if (!entry.isIntersecting || entry.target.dataset.counted) return;
      const el = entry.target;
      el.dataset.counted = 'true';
      const end = Number(el.dataset.count);
      if (reducedMotion || end < 10) {
        el.textContent = end.toLocaleString('en-US');
        return;
      }
      const start = performance.now();
      const draw = (now) => {
        const ratio = Math.min(1, (now - start) / 1200);
        const eased = 1 - Math.pow(1 - ratio, 3);
        el.textContent = Math.round(end * eased).toLocaleString('en-US');
        if (ratio < 1) requestAnimationFrame(draw);
      };
      requestAnimationFrame(draw);
      self.unobserve(el);
    }),
  { threshold: 0.5 },
);
document.querySelectorAll('[data-count]').forEach((el) => countObserver.observe(el));

const dialog = document.querySelector('[data-lightbox-dialog]');
const dialogImage = dialog?.querySelector('img');
const dialogCaption = dialog?.querySelector('figcaption');
document.querySelectorAll('[data-lightbox]').forEach((button) =>
  button.addEventListener('click', () => {
    dialogImage.src = button.dataset.lightbox;
    dialogImage.alt = button.dataset.caption || '产品实机截图';
    dialogCaption.textContent = button.dataset.caption || '';
    dialog.showModal();
  }),
);
dialog?.querySelector('button').addEventListener('click', () => dialog.close());
dialog?.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close();
});
