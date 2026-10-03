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
assert.match(index, /data-wheel="math-zhenti-wrong"/);
assert.match(study, /js\/study-wheel-embed-bridge\.js/);
assert.match(study, /js\/math-zhenti-wrong-wheel\.js/);
assert.match(study, /css\/math-zhenti-wrong-wheel\.css/);
assert.match(study, /id="dailyGoalButton"/);
assert.match(shell, /slot\.appendChild\(goal\)/);
assert.match(route, /chapter: params\.get\('chapter'\)/);
assert.match(css, /html\.wheel-embedded \.app-layout/);

function run(origin) {
  const isFile = origin.startsWith('file:');
  const parentURL = origin + (isFile ? '/index.html' : '/index.html');
  const parentHandlers = {};
  const childHandlers = {};
  const modalMath = { hidden: true, style: { display: 'none' } };
  const modalWrong = { hidden: true, style: { display: 'none' } };
  const modalZhenti = { hidden: true, style: { display: 'none' }, className: 'mzw-overlay' };
  const sentOrigins = [];
  let observer = null;
  let assigned = '';
  let mathSubject = '';
  let wrongSubject = '';
  let zhentiOpened = 0;
  let zhentiClosed = 0;
  let openerFocused = 0;

  const childProxy = new Proxy({
    postMessage(data, target) {
      sentOrigins.push(target);
      childHandlers.message({ data, origin: isFile ? 'null' : origin, source: parentProxy });
    }
  }, {
    get(target, key) {
      if (key === 'postMessage') return target.postMessage;
      throw new Error('SecurityError: parent accessed cross-origin iframe property ' + String(key));
    }
  });
  const parentProxy = {
    postMessage(data, target) {
      sentOrigins.push(target);
      parentHandlers.message({ data, origin: isFile ? 'null' : origin, source: childProxy });
    }
  };
  const childLocation = { protocol: isFile ? 'file:' : 'http:', origin: isFile ? 'null' : origin, search: '' };
  const childWindow = {
    location: childLocation,
    parent: parentProxy,
    DailyStudyWheelBridge: { getStoragePrefix: () => 'user_guest_' },
    DailyStudyWheel: {
      openModal(subject) { mathSubject = subject; modalMath.hidden = false; modalMath.style.display = 'flex'; },
      closeModal() { modalMath.hidden = true; modalMath.style.display = 'none'; if (observer) observer.callback(); }
    },
    DailyWrongWheel: {
      open(subject) { wrongSubject = subject; modalWrong.hidden = false; modalWrong.style.display = 'flex'; },
      close() { modalWrong.hidden = true; modalWrong.style.display = 'none'; if (observer) observer.callback(); }
    },
    MathZhentiWrongWheel: {
      create(opts) {
        return {
          open() { zhentiOpened++; modalZhenti.hidden = false; modalZhenti.style.display = 'grid'; },
          close() { zhentiClosed++; modalZhenti.hidden = true; modalZhenti.style.display = 'none'; if (observer) observer.callback(); },
          review() { opts.openWrongChapter('shu1', 's1_zt_2020', 'mistakes'); }
        };
      }
    },
    getComputedStyle(modal) { return { display: modal.style.display }; },
    addEventListener(type, callback) { childHandlers[type] = callback; }
  };
  const childDocument = {
    getElementById(id) {
      if (id === 'dailyMathWheelModal') return modalMath;
      if (id === 'dailyWrongWheelModal') return modalWrong;
      if (id === 'mathZhentiWrongWheelModal') return modalZhenti;
      return null;
    },
    querySelector(sel) {
      if (sel === '.mzw-overlay') return modalZhenti;
      return null;
    }
  };
  const parentLocation = {
    href: parentURL,
    protocol: childLocation.protocol,
    origin: childLocation.origin,
    assign(url) { assigned = url; }
  };
  const parentWindow = {
    location: parentLocation,
    addEventListener(type, callback) { parentHandlers[type] = callback; },
    setTimeout() { return 1; },
    clearTimeout() {}
  };
  const frame = {
    contentWindow: childProxy,
    style: {},
    focus() {},
    set src(src) {
      this._src = src;
      childLocation.search = '?' + src.split('?')[1];
      vm.runInNewContext(read('js/study-wheel-embed-bridge.js'), {
        window: childWindow, document: childDocument, location: childLocation,
        URLSearchParams, MutationObserver: class {
          constructor(callback) { this.callback = callback; observer = this; }
          observe() {}
          disconnect() { observer = null; }
        }
      });
      childHandlers['kaoyan:ready']();
    },
    get src() { return this._src; }
  };
  const host = { hidden: true };
  const loading = { hidden: true, textContent: '' };
  const closeButton = { addEventListener(type, callback) { parentHandlers.close = callback; } };
  const elements = { homeWheelHost: host, homeWheelFrame: frame, homeWheelLoading: loading, homeWheelClose: closeButton };
  const document = {
    getElementById(id) { return elements[id]; },
    addEventListener(type, callback) { parentHandlers[type] = callback; }
  };
  vm.runInNewContext(read('js/home-wheel-embed.js'), {
    window: parentWindow, document, location: parentLocation, URL, console,
    setTimeout() {}, clearTimeout() {}
  });

  function click(kind) {
    const trigger = { getAttribute: () => kind, focus() { openerFocused++; } };
    parentHandlers.click({ target: { closest: () => trigger }, preventDefault() {} });
  }

  click('math');
  assert.equal(parentLocation.href, parentURL, 'clicking should not navigate');
  assert.equal(mathSubject, 'shu1');
  assert.equal(host.hidden, false);
  assert.equal(loading.hidden, true);
  assert.equal(frame.style.visibility, 'visible');
  assert.ok(sentOrigins.every(x => x === (isFile ? '*' : origin)));

  childWindow.DailyStudyWheel.closeModal();
  assert.equal(host.hidden, true);
  assert.ok(openerFocused > 0);
  click('major');
  assert.equal(mathSubject, 'zhuanye');
  click('wrong');
  assert.equal(wrongSubject, 'shu1');

  childWindow.DailyStudyWheelBridge.openChapter('zhuanye', 'chapter-1');
  let target = new URL(assigned);
  assert.equal(target.pathname.endsWith('/study.html'), true);
  assert.equal(target.searchParams.get('subject'), 'zhuanye');
  assert.equal(target.searchParams.get('chapter'), 'chapter-1');
  click('math-zhenti-wrong');
  assert.equal(zhentiOpened, 1);
  assert.equal(host.hidden, false);
  assert.equal(loading.hidden, true);
  assert.equal(frame.style.visibility, 'visible');

  childWindow.MathZhentiWrongWheelInstance.review();
  target = new URL(assigned);
  assert.equal(target.searchParams.get('subject'), 'shu1');
  assert.equal(target.searchParams.get('chapter'), 's1_zt_2020');
  assert.equal(target.searchParams.get('wheelMode'), 'mistakes');
  assert.equal(target.searchParams.get('from'), 'home');

  childWindow.MathZhentiWrongWheelInstance.close();
  assert.equal(host.hidden, true);

  parentHandlers.close();
  assert.equal(host.hidden, true);
}

run('http://localhost:8000');
run('file:///C:/study/kaoyan-tiku');

const goal = { id: 'dailyGoalButton' };
const left = { firstChild: null, insertBefore() {}, appendChild() {} };
const right = { firstChild: null, insertBefore() {}, appendChild(child) { child.parent = this; } };
const studyElements = { dailyGoalButton: goal };
vm.runInNewContext(shell, {
  document: {
    readyState: 'complete', body: { classList: { add() {} } },
    querySelector(selector) { return selector === '.header-nav-left' ? left : selector === '.header-nav-right' ? right : null; },
    getElementById(id) { return studyElements[id] || null; },
    createElement() { return { appendChild(child) { child.parent = this; }, addEventListener() {} }; },
    addEventListener() {}
  },
  window: { getCurrentSubjectId: () => 'shu1', addEventListener() {}, setTimeout() {} }
});
assert.equal(goal.parent.className, 'focus-goal-slot');
assert.equal(goal.parent.parent, right);
console.log('home wheel message bridge (HTTP + file cross-origin) and goal placement: OK');
