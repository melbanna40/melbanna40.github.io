const COUNT_MS = 1200;
const STAGGER_MS = 60;
const desktopPreview = matchMediaSafe('(hover: hover) and (min-width: 1024px)');

function matchMediaSafe(query) {
  return typeof matchMedia === 'function' ? matchMedia(query) : { matches: false };
}

/** @param {number} value @param {{decimals?: number, suffix?: string}} [opts] @returns {string} */
export function formatStat(value, { decimals = 0, suffix = '' } = {}) {
  return value.toFixed(decimals) + suffix;
}

/** Ease-out cubic from 0 to target. @param {number} target @param {number} progress @returns {number} */
export function countValue(target, progress) {
  const t = Math.min(Math.max(progress, 0), 1);
  return target * (1 - (1 - t) ** 3);
}

/** Tapping the open row closes it; tapping another row switches to it. */
export function nextPreviewState(current, clicked) {
  return current === clicked ? null : clicked;
}

function countUp(el) {
  const target = Number(el.dataset.count);
  const opts = { decimals: Number(el.dataset.decimals ?? 0), suffix: el.dataset.suffix ?? '' };
  const start = performance.now();
  const step = now => {
    const progress = (now - start) / COUNT_MS;
    el.textContent = formatStat(countValue(target, progress), opts);
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function observeReveals(root) {
  const io = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      io.unobserve(entry.target);
      entry.target.classList.add('is-in');
      entry.target.querySelectorAll('[data-count]').forEach(countUp);
    }
  }, { threshold: 0.2 });
  root.querySelectorAll('.tile').forEach((el, i) => el.style.setProperty('--delay', `${i * STAGGER_MS}ms`));
  root.querySelectorAll('.reveal').forEach(el => io.observe(el));
}

function setRowOpen(button, isOpen) {
  button.setAttribute('aria-expanded', String(isOpen));
  const item = button.closest('li');
  let shot = item.querySelector('.row__shot');
  if (isOpen && !shot) {
    shot = Object.assign(document.createElement('img'), {
      className: 'row__shot',
      src: button.dataset.preview,
      alt: `${button.querySelector('.row__name').firstChild.textContent} app screens`,
      width: 720,
      height: 1280,
    });
    button.after(shot);
  }
  if (shot) shot.hidden = !isOpen;
}

function wireIndex(list, preview) {
  const frame = preview.closest('.preview');
  const show = event => {
    const button = event.target.closest('button.row');
    if (!button || !desktopPreview.matches) return;
    preview.src = button.dataset.preview;
    frame.classList.add('is-on');
  };
  list.addEventListener('pointerover', show);
  list.addEventListener('focusin', show);
  list.addEventListener('pointerleave', () => frame.classList.remove('is-on'));

  let open = null;
  list.addEventListener('click', event => {
    const button = event.target.closest('button.row');
    if (!button) return;
    if (open) setRowOpen(open, false);
    open = nextPreviewState(open, button);
    if (open) setRowOpen(open, true);
  });
}

/** @param {Document} root */
export function initMotion(root) {
  wireIndex(root.getElementById('index-list'), root.getElementById('preview'));
  // ponytail: reduced motion needs no JS branch beyond this — the CSS only hides reveals under no-preference
  if (matchMediaSafe('(prefers-reduced-motion: reduce)').matches) return;
  observeReveals(root);
}
