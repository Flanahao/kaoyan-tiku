const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const read = path => fs.readFileSync(path, 'utf8');
const index = read('index.html');
const study = read('study.html');
const shell = read('js/study-shell.js');
const route = read('js/study-route-bootstrap.js');
const css = read('css/home-wheel-embed.css');

assert.match(index, /id="homeWheelHost"/);
assert.match(index, /js\/home-wheel-embed\.js/);
assert.match(study, /id="dailyGoalButton"/);
assert.match(shell, /slot\.appendChild\(goal\)/);
assert.match(route, /chapter: params\.get\('chapter'\)/);
assert.match(css, /html\.wheel-embedded \.app-layout/);

const listeners = {};
const modalMath = { hidden: true, style: { display: 'none' } };
const modalWrong = { hidden: true, style: { display: 'none' } };
const elements = {};
let observer;
let assigned = '';
let focusCount = 0;
let mathSubject = '';
let wrongSubject = '';

const wheel = {
  openModal(subject) { mathSubject = subject; modalMath.hidden = false; modalMath.style.display = 'flex'; },
  closeModal() { modalMath.hidden = true; modalMath.style.display = 'none'; if (observer) observer.callback(); }
};
const wrong = {
  open(subject) { wrongSubject = subject; modalWrong.hidden = false; modalWrong.style.display = 'flex'; },
  close() { modalWrong.hidden = true; modalWrong.style.display = 'none'; if (observer) observer.callback(); }
};
const frame = {
  style: {},
  contentWindow: {
    DailyStudyWheel: wheel,
    DailyWrongWheel: wrong,
    DailyStudyWheelBridge: { getStoragePrefix: () => 'user_guest_' },
    document: { getElementById: id => id === 'dailyMathWheelModal' ? modalMath : modalWrong }
  },
  addEventListener(type, callback) { listeners[type] = callback; },
  removeEventListener(type) { delete listeners[type]; },
  focus() { focusCount++; },
  set src(value) { this._src = value; listeners.load(); },
  get src() { return this._src; }
};
elements.homeWheelHost = { hidden: true };
elements.homeWheelFrame = frame;
elements.homeWheelLoading = { hidden: true, textContent: '' };
elements.homeWheelClose = { addEventListener(type, callback) { listeners.close = callback; } };
const document = {
  getElementById: id => elements[id],
  addEventListener(type, callback) { listeners[type] = callback; }
};
const window = {
  location: { href: 'http://localhost:8000/index.html', assign(url) { assigned = url; } }
};
vm.runInNewContext(read('js/home-wheel-embed.js'), {
  document, window, URL, console,
  getComputedStyle: modal => ({ display: modal.style.display }),
  MutationObserver: class {
    constructor(callback) { this.callback = callback; observer = this; }
    observe() {}
    disconnect() { observer = null; }
  }
});

function click(kind) {
  const trigger = {
    getAttribute: () => kind,
    focus() { focusCount++; }
  };
  listeners.click({
    target: { closest: () => trigger },
    preventDefault() {}
  });
}

click('math');
assert.equal(window.location.href, 'http://localhost:8000/index.html');
assert.equal(frame.src, 'study.html?embeddedWheel=1');
assert.equal(mathSubject, 'shu1');
assert.equal(elements.homeWheelHost.hidden, false);
assert.equal(frame.style.visibility, 'visible');
assert.equal(frame.contentWindow.DailyStudyWheelBridge.getStoragePrefix(), 'user_guest_');

wheel.closeModal();
assert.equal(elements.homeWheelHost.hidden, true);
assert.ok(focusCount > 0);

click('major');
assert.equal(mathSubject, 'zhuanye');
assert.equal(frame.src, 'study.html?embeddedWheel=1');
click('wrong');
assert.equal(wrongSubject, 'shu1');
assert.equal(elements.homeWheelHost.hidden, false);

assert.equal(frame.contentWindow.DailyStudyWheelBridge.openChapter('zhuanye', 'chapter-1'), true);
let target = new URL(assigned);
assert.equal(target.pathname, '/study.html');
assert.equal(target.searchParams.get('subject'), 'zhuanye');
assert.equal(target.searchParams.get('chapter'), 'chapter-1');
assert.equal(target.searchParams.get('wheelMode'), null);

assert.equal(frame.contentWindow.DailyStudyWheelBridge.openWrongChapter('shu1', 'chapter-2', 'mistakes'), true);
target = new URL(assigned);
assert.equal(target.searchParams.get('wheelMode'), 'mistakes');

listeners.close();
assert.equal(elements.homeWheelHost.hidden, true);

// Execute the real study-shell.js relocation against a minimal DOM.
const goal = { id: 'dailyGoalButton' };
const left = { firstChild: null, insertBefore() {}, appendChild() {} };
const right = { firstChild: null, insertBefore() {}, appendChild(child) { child.parent = this; } };
const studyElements = { dailyGoalButton: goal };
const studyDocument = {
  readyState: 'complete',
  body: { classList: { add() {} } },
  querySelector(selector) { return selector === '.header-nav-left' ? left : selector === '.header-nav-right' ? right : null; },
  getElementById(id) { return studyElements[id] || null; },
  createElement() { return { appendChild(child) { child.parent = this; }, addEventListener() {} }; },
  addEventListener() {}
};
vm.runInNewContext(shell, {
  document: studyDocument,
  window: { getCurrentSubjectId: () => 'shu1', addEventListener() {}, setTimeout() {} }
});
assert.equal(goal.parent.className, 'focus-goal-slot');
assert.equal(goal.parent.parent, right);
console.log('home wheel embedding and chapter handoff: OK');
