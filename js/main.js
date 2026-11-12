import { PROJECTS } from './data.js';
import { spotlightHTML, indexRowHTML, tickerHTML } from './render.js';
import { initMotion } from './motion.js';

const flagships = PROJECTS.filter(p => p.tier === 'flagship');
const others = PROJECTS.filter(p => p.tier === 'index');

// Every string in these templates goes through escapeHTML in render.js.
document.getElementById('ticker').innerHTML = tickerHTML(PROJECTS.filter(p => p.image));
document.getElementById('spotlights').innerHTML = flagships.map(spotlightHTML).join('');
document.getElementById('index-list').innerHTML = others.map((p, i) => indexRowHTML(p, flagships.length + 1 + i)).join('');

initMotion(document);
