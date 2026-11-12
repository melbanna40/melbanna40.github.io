import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { PROJECTS } from '../js/data.js';

test('flagships are the five chosen apps in order', () => {
  assert.deepEqual(PROJECTS.filter(p => p.tier === 'flagship').map(p => p.slug),
    ['huffaz-al-mutoon', 'jawahr', 'huffaz-al-quran', 'xeer', 'copa']);
});

test('hero shows exactly huffaz-al-mutoon, jawahr, xeer', () => {
  assert.deepEqual(PROJECTS.filter(p => p.hero).map(p => p.slug), ['huffaz-al-mutoon', 'jawahr', 'xeer']);
});

test('slugs unique, required fields present', () => {
  assert.equal(new Set(PROJECTS.map(p => p.slug)).size, PROJECTS.length);
  for (const p of PROJECTS) {
    assert.ok(p.name && p.tagline && Array.isArray(p.stack) && p.stack.length, p.slug);
    assert.ok(['flagship', 'index'].includes(p.tier), p.slug);
  }
});

test('store links are https store URLs', () => {
  for (const p of PROJECTS) {
    if (p.play) assert.match(p.play, /^https:\/\/play\.google\.com\//);
    if (p.appStore) assert.match(p.appStore, /^https:\/\/apps\.apple\.com\//);
  }
});

test('every project with an image has its webp on disk', () => {
  for (const p of PROJECTS.filter(p => p.image)) assert.ok(existsSync(`assets/apps/${p.slug}.webp`), p.slug);
});
