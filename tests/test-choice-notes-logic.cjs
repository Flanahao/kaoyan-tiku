'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const notes = require('../js/politics-choice-notes.js');

test('module exposes methods', () => {
  assert.equal(typeof notes.mount, 'function');
  assert.equal(typeof notes.cleanNotes, 'function');
  assert.equal(notes.MAX_LENGTH, 600);
});
test('accepts independent A/B/C/D notes', () => {
  assert.deepEqual(notes.cleanNotes({ A:'甲', B:'乙', C:'丙', D:'丁' }),
                   { A:'甲', B:'乙', C:'丙', D:'丁' });
});
test('trims leading and trailing whitespace but keeps inner newlines', () => {
  assert.deepEqual(notes.cleanNotes({ B:' \n首行\n第二行\n ' }), { B:'首行\n第二行' });
});
test('rejects unrecognized option keys', () => {
  assert.deepEqual(notes.cleanNotes({ A:'正常', E:'非法', __proto2__:'其他' }), { A:'正常' });
});
test('ignores invalid or empty notes', () => {
  assert.deepEqual(notes.cleanNotes({A:' ',B:100,C:null,D:{html:'x'}}), {});
});
test('rejects non-object input', () => {
  for (const raw of [null, 0, false, true, '', 'ABC', []])
    assert.deepEqual(notes.cleanNotes(raw), {});
});
test('rejects notes longer than 600 characters', () => {
  assert.deepEqual(notes.cleanNotes({ B:'a'.repeat(601),C:'b'.repeat(600) }),
                   { C:'b'.repeat(600) });
});
test('read, write, delete do not affect any unrelated storage keys', () => {
  const data = new Map([['user_guest_politics_status','vague']]);
  globalThis.localStorage = {
    getItem: k => data.get(k) ?? null,
    setItem: (k,v) => { data.set(k, v); },
    removeItem: k => { data.delete(k); }
  };
  assert.equal(notes.writeNotes('notes_ch1_1', {A:'甲',D:'丁'}), true);
  assert.deepEqual(notes.readNotes('notes_ch1_1'), {A:'甲',D:'丁'});
  assert.equal(data.get('user_guest_politics_status'), 'vague');
  assert.equal(notes.writeNotes('notes_ch1_1', {}), true);
  assert.equal(data.has('notes_ch1_1'), false);
});
test('corrupted JSON safely yields no notes', () => {
  globalThis.localStorage = {
    getItem: () => '{bad}',
    setItem: () => {},
    removeItem: () => {}
  };
  const oldWarn = console.warn;
  console.warn = () => {};
  try { assert.deepEqual(notes.readNotes('invalid'), {}); }
  finally { console.warn = oldWarn; }
});
test('storage errors are handled without success', () => {
  globalThis.localStorage = {
    getItem: () => { throw Error('denied'); },
    setItem: () => { throw Error('denied'); },
    removeItem: () => { throw Error('denied'); }
  };
  const oldWarn = console.warn;
  console.warn = () => {};
  try {
    assert.deepEqual(notes.readNotes('denied'), {});
    assert.equal(notes.writeNotes('denied', {A:'测试'}), false);
    assert.equal(notes.writeNotes('denied', {}), false);
  } finally { console.warn = oldWarn; }
});
