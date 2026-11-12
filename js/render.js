/** @typedef {import('./data.js').PROJECTS[number]} Project */

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** @param {string} s @returns {string} */
export function escapeHTML(s) {
  return String(s).replace(/[&<>"']/g, c => ESCAPES[c]);
}

const imagePath = slug => `assets/apps/${slug}.webp`;
const join = parts => parts.filter(Boolean).map(escapeHTML).join(' · ');

function storeLinks(p) {
  const link = (href, label) =>
    `<a class="store" href="${escapeHTML(href)}" target="_blank" rel="noopener">${label}<span class="sr-only"> — ${escapeHTML(p.name)}</span></a>`;
  return [p.appStore && link(p.appStore, 'App Store'), p.play && link(p.play, 'Google Play')].filter(Boolean).join('');
}

/** @param {Project} p @param {number} index @returns {string} */
export function spotlightHTML(p, index) {
  const [w, h] = p.image;
  const flip = index % 2 === 1 ? ' spot--flip' : '';
  return `<article class="spot${flip} reveal">
  <div class="spot__text">
    <p class="spot__meta">${join([p.org, p.role, p.years])}</p>
    <h3 class="spot__name">${escapeHTML(p.name)}</h3>
    ${p.metric ? `<p class="metric">${escapeHTML(p.metric)}</p>` : ''}
    <p class="spot__tagline">${escapeHTML(p.tagline)}</p>
    <p class="spot__built">${escapeHTML(p.built)}</p>
    <ul class="chips">${p.stack.map(s => `<li>${escapeHTML(s)}</li>`).join('')}</ul>
    <p class="stores">${storeLinks(p)}</p>
  </div>
  <figure class="poster"><img src="${imagePath(p.slug)}" alt="${escapeHTML(p.name)} app screens" width="${w}" height="${h}" loading="lazy" decoding="async"></figure>
</article>`;
}

/** @param {Project} p @param {number} n @returns {string} */
export function indexRowHTML(p, n) {
  const status = p.status ? ` <span class="badge">${escapeHTML(p.status)}</span>` : '';
  const cells = `<span class="row__n">${String(n).padStart(2, '0')}</span>
    <span class="row__name">${escapeHTML(p.name)}${status}</span>
    <span class="row__desc">${escapeHTML(p.tagline)}<small>${escapeHTML(p.stack.join(' · '))}</small></span>
    <span class="row__meta">${join([p.org, p.years, p.metric])}</span>`;
  const row = p.image
    ? `<button type="button" class="row" data-preview="${imagePath(p.slug)}" aria-expanded="false">${cells}</button>`
    : `<div class="row">${cells}</div>`;
  const links = storeLinks(p);
  return `<li>${row}${links ? `<p class="row__links">${links}</p>` : ''}</li>`;
}

/** @param {Project[]} projects @returns {string} */
export function tickerHTML(projects) {
  const items = projects.map(p => `<li>${escapeHTML(p.name)}</li>`).join('');
  return `<ul class="ticker__list">${items}</ul><ul class="ticker__list" aria-hidden="true">${items}</ul>`;
}
