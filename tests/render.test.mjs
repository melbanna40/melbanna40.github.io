import test from 'node:test';
import assert from 'node:assert/strict';
import { escapeHTML, spotlightHTML, indexRowHTML, tickerHTML } from '../js/render.js';

const base = { slug: 'x', name: 'X <App>', tagline: 't', stack: ['Flutter'], tier: 'flagship', image: [720, 1440] };

test('escapeHTML escapes markup characters', () => {
  assert.equal(escapeHTML(`<a href="x">'&'</a>`), '&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;');
});

test('spotlight escapes name and lazy-loads a sized image with alt', () => {
  const html = spotlightHTML(base, 0);
  assert.match(html, /X &lt;App&gt;/);
  assert.match(html, /<img[^>]+width="720"[^>]+height="1440"[^>]+loading="lazy"/);
  assert.match(html, /alt="X &lt;App&gt; app screens"/);
});

test('spotlight omits missing store link and missing metric', () => {
  const html = spotlightHTML({ ...base, appStore: 'https://apps.apple.com/a' }, 0);
  assert.match(html, /apps\.apple\.com/);
  assert.doesNotMatch(html, /play\.google\.com|class="metric"/);
});

test('odd spotlights are flipped', () => {
  assert.match(spotlightHTML(base, 1), /class="spot spot--flip reveal"/);
  assert.match(spotlightHTML(base, 0), /class="spot reveal"/);
});

test('index row without image has no img and is not a button', () => {
  const html = indexRowHTML({ ...base, image: undefined, tier: 'index' }, 7);
  assert.doesNotMatch(html, /<img|<button|data-preview/);
  assert.match(html, />07</);
});

test('index row with image is a button with preview path', () => {
  assert.match(indexRowHTML({ ...base, tier: 'index' }, 12),
    /<button type="button" class="row" data-preview="assets\/apps\/x\.webp" aria-expanded="false"/);
});

test('index row shows stack and in-development status', () => {
  const html = indexRowHTML({ ...base, image: undefined, tier: 'index', status: 'In development', stack: ['Go', 'Flutter'] }, 9);
  assert.match(html, /Go · Flutter/);
  assert.match(html, /In development/);
});

test('ticker duplicates names, second copy hidden from AT', () => {
  const html = tickerHTML([base]);
  assert.equal(html.match(/X &lt;App&gt;/g).length, 2);
  assert.match(html, /aria-hidden="true"/);
});

test('spotlight without image or built copy renders no figure and no undefined', () => {
  const html = spotlightHTML({ ...base, image: undefined, built: undefined }, 0);
  assert.doesNotMatch(html, /<figure|undefined/);
});
