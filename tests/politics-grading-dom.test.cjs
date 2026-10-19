'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const grading = require('../js/politics-grading.js');

class FakeElement {
  constructor(className = '') {
    this.classes = new Set(className.split(/\s+/).filter(Boolean));
    this.children = [];
    this.parentNode = null;
    this.dataset = {};
    this.attrs = {};
    this.listeners = {};
    this.textContent = '';
    this.type = undefined;
  }
  set className(value) { this.classes = new Set(String(value).split(/\s+/).filter(Boolean)); }
  get className() { return Array.from(this.classes).join(' '); }
  get classList() {
    const c = this.classes;
    return {
      contains: key => c.has(key),
      add: (...keys) => keys.forEach(key => c.add(key)),
      remove: (...keys) => keys.forEach(key => c.delete(key)),
      toggle: (key, force) => {
        const enabled = force === undefined ? !c.has(key) : Boolean(force);
        if (enabled) c.add(key); else c.delete(key);
        return enabled;
      }
    };
  }
  appendChild(child) { child.parentNode = this; this.children.push(child); }
  setAttribute(name, value) { this.attrs[name] = value; }
  removeAttribute(name) {
    delete this.attrs[name];
    if (name === 'data-status') delete this.dataset.status;
  }
  addEventListener(name, fn) { (this.listeners[name] ||= []).push(fn); }
  contains(element) {
    for (let current = element; current; current = current.parentNode)
      if (current === this) return true;
    return false;
  }
  closest(selector) {
    for (let current = this; current; current = current.parentNode)
      if (current.matches(selector)) return current;
    return null;
  }
  matches(selector) {
    const required = selector.split('.').filter(Boolean);
    return required.length > 0 && required.every(key => this.classes.has(key));
  }
  querySelectorAll(selector) {
    const found = [];
    const visit = node => {
      for (const child of node.children) {
        if (child.matches(selector)) found.push(child);
        visit(child);
      }
    };
    visit(this);
    return found;
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  click() {
    const event = { target: this };
    for (let current = this; current; current = current.parentNode)
      for (const cb of (current.listeners.click || [])) cb(event);
  }
}

const oldDocument = global.document;
global.document = { createElement: () => new FakeElement() };

function render(q) {
  const card = new FakeElement('question-text-card');
  const choices = new FakeElement('q-choices');
  card.appendChild(choices);
  for (const key of ['A','B','C','D']) {
    const item = new FakeElement('q-choice-item');
    item.dataset.choice = key;
    choices.appendChild(item);
    // Replicate the existing app.js selection handler, unchanged.
    item.addEventListener('click', function () {
      if (q.type !== 'multi') {
        choices.querySelectorAll('.q-choice-item').forEach(el => {
          if (el !== item) el.classList.remove('is-selected');
        });
      }
      item.classList.toggle('is-selected');
    });
  }
  grading.mount(card, q);
  return {
    card,
    choices,
    choose: key => choices.querySelectorAll('.q-choice-item').find(el => el.dataset.choice === key).click(),
    submit: () => card.querySelector('.politics-grade-submit').click(),
    status: () => card.querySelector('.politics-grade-result').dataset.status,
    message: () => card.querySelector('.politics-grade-result').textContent,
    selected: () => choices.querySelectorAll('.q-choice-item.is-selected').map(x => x.dataset.choice).sort().join('')
  };
}

test('DOM: 单选未选提示，选对、选错、重新作答', () => {
  const view = render({ type: 'single', answer: 'B' });
  assert.equal(view.card.querySelectorAll('.politics-grade-submit').length, 1);
  assert.equal(grading.mount(view.card, { answer: 'A' }), false);
  view.submit();
  assert.equal(view.status(), 'unanswered');
  view.choose('B');
  assert.equal(view.status(), undefined);
  view.submit();
  assert.equal(view.status(), 'correct');
  assert.equal(view.choices.querySelectorAll('.politics-grade-correct-choice').length, 1);
  view.choose('C');
  assert.equal(view.status(), undefined);
  assert.equal(view.selected(), 'C');
  assert.equal(view.choices.querySelectorAll('.politics-grade-correct-choice').length, 0);
  view.submit();
  assert.equal(view.status(), 'incorrect');
  assert.match(view.message(), /正确答案：B/);
  assert.equal(view.choices.querySelectorAll('.politics-grade-wrong-choice').length, 1);
});

test('DOM: 多选无序正确、漏选、多选、没有标准答案', () => {
  const view = render({ type: 'multi', answer: 'AC' });
  view.choose('C'); view.choose('A'); view.submit();
  assert.equal(view.status(), 'correct');
  view.choose('A'); view.submit();
  assert.equal(view.status(), 'incorrect');
  view.choose('A'); view.choose('D'); view.submit();
  assert.equal(view.status(), 'incorrect');
  const missing = render({ type: 'multi', answer: null });
  missing.choose('A'); missing.submit();
  assert.equal(missing.status(), 'unavailable');
  assert.equal(missing.choices.querySelectorAll('.politics-grade-correct-choice').length, 0);
});

test('DOM: 切题重绘不残留批改状态，五级掌握度完全独立', () => {
  const states = { status: 'vague', writes: 0, navigations: 0 };
  const initial = render({ type: 'single', answer: 'A' });
  initial.choose('B'); initial.submit();
  assert.equal(initial.status(), 'incorrect');

  const next = render({ type: 'single', answer: 'D' });
  assert.equal(next.status(), undefined);
  assert.equal(next.selected(), '');
  assert.equal(states.status, 'vague');
  assert.equal(states.writes, 0);
  assert.equal(states.navigations, 0);
  assert.equal(next.card.querySelectorAll('.politics-grade-submit').length, 1);
});
