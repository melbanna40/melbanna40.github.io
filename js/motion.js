const COUNT_MS = 1200;
const STAGGER_MS = 60;

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

function openRow(button) {
  button.setAttribute('aria-expanded', 'true');
  const shot = button.parentElement.querySelector('.row__shot');
  if (shot) {
    shot.hidden = false;
    return;
  }
  button.after(Object.assign(document.createElement('img'), {
    className: 'row__shot',
    src: button.dataset.preview,
    alt: `${button.querySelector('.row__name').firstChild.textContent} app screens`,
    width: 720,
    height: 1280,
  }));
}

function closeRow(button) {
  button.setAttribute('aria-expanded', 'false');
  button.parentElement.querySelector('.row__shot').hidden = true;
}

function wireHoverPreview(list, preview) {
  const desktop = matchMedia('(hover: hover) and (min-width: 1024px)');
  const frame = preview.closest('.preview');
  const hide = () => frame.classList.remove('is-on');
  const show = event => {
    if (!desktop.matches) return;
    const button = event.target.closest('button.row');
    if (!button) {
      if (event.target.closest('.row')) hide();
      return;
    }
    preview.src = button.dataset.preview;
    frame.classList.add('is-on');
  };
  list.addEventListener('pointerover', show);
  list.addEventListener('focusin', show);
  list.addEventListener('pointerleave', hide);
  list.addEventListener('focusout', event => {
    if (!list.contains(event.relatedTarget)) hide();
  });
}

function wireTapToggle(list) {
  let open = null;
  list.addEventListener('click', event => {
    const button = event.target.closest('button.row');
    if (!button) return;
    if (open) closeRow(open);
    open = nextPreviewState(open, button);
    if (open) openRow(open);
  });
}

/** @param {Document} root */
export function initMotion(root) {
  const list = root.getElementById('index-list');
  wireHoverPreview(list, root.getElementById('preview'));
  wireTapToggle(list);
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  // The class gates the CSS that hides reveal targets, so if any script fails the content stays visible.
  root.documentElement.classList.add('motion');
  observeReveals(root);
}
