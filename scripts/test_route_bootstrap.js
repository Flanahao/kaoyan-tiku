const fs = require('fs');
const path = require('path');
const vm = require('vm');
const saved = {};
const classes = [];
const context = {
  URLSearchParams,
  console,
  window: {
    location: { search: '?subject=english&from=home' },
    localStorage: { setItem(k,v){ saved[k]=v; } }
  },
  document: { documentElement: { classList: { add(v){ classes.push(v); } } } }
};
context.window.URLSearchParams = URLSearchParams;
context.window.document = context.document;
vm.createContext(context);
const bootstrapJs = fs.readFileSync(path.resolve(__dirname, '../js/study-route-bootstrap.js'), 'utf8');
vm.runInContext(bootstrapJs, context);
const checks = [
  ['subject saved before app boot', saved['user_guest_kaoyan_subject'] === 'english'],
  ['focus class added', classes.includes('subject-focus-shell')],
  ['entry exposed', context.window.__KYSON_STUDY_ENTRY__ && context.window.__KYSON_STUDY_ENTRY__.subject === 'english']
];
for (const [name, ok] of checks) {
  console.log((ok ? 'PASS' : 'FAIL') + ' | ' + name);
  if (!ok) process.exitCode = 1;
}
