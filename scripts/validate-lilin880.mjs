#!/usr/bin/env node
import fs from 'node:fs';

const dataPath = process.argv[2] || 'data/lilin880/lilin_880_shu1_full.json';
const catalogPath = process.argv[3] || 'data/lilin880/lilin_880_shu1_catalog.json';

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    throw new Error(`无法读取 JSON：${file}\n${error.message}`);
  }
}

function countBy(items, key) {
  return items.reduce((map, item) => {
    const value = item[key];
    map.set(value, (map.get(value) || 0) + 1);
    return map;
  }, new Map());
}

function plainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

const questions = readJson(dataPath);
const catalog = readJson(catalogPath);
const errors = [];

if (!Array.isArray(questions)) errors.push('full.json 顶层必须是数组');
if (!plainObject(catalog)) errors.push('catalog.json 顶层必须是对象');

const seenIds = new Set();
const seenKeys = new Set();
const allowedLevels = new Set(['基础题', '综合题', '拓展题']);
const allowedTypes = new Set(['选择题', '填空题', '解答题']);

if (Array.isArray(questions)) {
  questions.forEach((item, index) => {
    const path = `题目[${index}]`;
    if (!plainObject(item)) {
      errors.push(`${path} 必须是对象`);
      return;
    }
    if (!Number.isInteger(item.id)) errors.push(`${path}.id 必须是整数`);
    if (seenIds.has(item.id)) errors.push(`${path}.id 重复：${item.id}`);
    seenIds.add(item.id);

    const key = [item.chapter_number, item.level, item.type, item.question_number].join('|');
    if (seenKeys.has(key)) errors.push(`${path} 章节/层级/题型/题号重复：${key}`);
    seenKeys.add(key);

    if (!Number.isInteger(item.chapter_number) || item.chapter_number < 1 || item.chapter_number > 23) {
      errors.push(`${path}.chapter_number 不在 1..23：${item.chapter_number}`);
    }
    if (!allowedLevels.has(item.level)) errors.push(`${path}.level 非法：${item.level}`);
    if (!allowedTypes.has(item.type)) errors.push(`${path}.type 非法：${item.type}`);
    if (!Number.isInteger(item.question_number) || item.question_number < 1) {
      errors.push(`${path}.question_number 必须是正整数`);
    }
    if (typeof item.stem !== 'string' || item.stem.trim() === '') errors.push(`${path}.stem 为空`);
    if (item.options !== null && !plainObject(item.options)) errors.push(`${path}.options 必须为对象或 null`);
    if (!plainObject(item.solution)) {
      errors.push(`${path}.solution 必须是对象`);
    } else if (typeof item.solution.analysis_md !== 'string' || item.solution.analysis_md.trim() === '') {
      errors.push(`${path}.solution.analysis_md 为空`);
    }
  });
}

const chapterCounts = Array.isArray(questions)
  ? [...countBy(questions, 'chapter_number').entries()].sort((a, b) => a[0] - b[0])
  : [];
const levelCounts = Array.isArray(questions) ? countBy(questions, 'level') : new Map();
const typeCounts = Array.isArray(questions) ? countBy(questions, 'type') : new Map();

if (plainObject(catalog) && Array.isArray(catalog.chapters) && Array.isArray(questions)) {
  const catalogCounts = new Map(catalog.chapters.map((chapter) => [chapter.chapter_number, chapter.total]));
  for (const [chapter, count] of chapterCounts) {
    if (catalogCounts.get(chapter) !== count) {
      errors.push(`目录题数不一致：第 ${chapter} 章 full=${count}, catalog=${catalogCounts.get(chapter)}`);
    }
  }
  if (catalog.total_questions !== questions.length) {
    errors.push(`总题数不一致：full=${questions.length}, catalog=${catalog.total_questions}`);
  }
}

const summary = {
  total: Array.isArray(questions) ? questions.length : 0,
  chapters: Object.fromEntries(chapterCounts),
  levels: Object.fromEntries(levelCounts),
  types: Object.fromEntries(typeCounts),
  uniqueIds: seenIds.size,
};

if (errors.length) {
  console.error(JSON.stringify({ errors, summary }, null, 2));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({ ok: true, summary }, null, 2));
}
