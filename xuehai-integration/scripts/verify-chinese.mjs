import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const read = (path) => readFile(resolve(root, path), 'utf8');

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(fullPath));
    else if (/\\.(?:ts|tsx|js|jsx|mjs)$/.test(entry.name)) files.push(fullPath);
  }
  return files;
}

const hash = (value) => {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
};

const publicBank = JSON.parse(await read('web/features/chinese/data/examBank.public.json'));
const serverSource = await read('server/data/chineseExamBank.ts');
const serverBody = serverSource
  .replace(/^\/\*\*[\s\S]*?\*\/\s*/, '')
  .replace(/^export const CHINESE_EXAM_BANK\s*=\s*/, '')
  .replace(/\s+as const;\s*$/, '');
const serverBank = JSON.parse(serverBody);
const grades = Object.keys(serverBank);
assert.equal(grades.length, 12, '服务端题库必须覆盖 12 个年级');

let questionCount = 0;
for (const grade of grades) {
  const serverQuestions = serverBank[grade];
  const publicQuestions = publicBank[grade];
  assert.ok(Array.isArray(publicQuestions), grade + ' 缺少前端公开题库');
  const serverById = new Map(serverQuestions.map((question) => [question.id, question]));
  assert.equal(publicQuestions.length, serverQuestions.length, grade + ' 前后端题量不一致');

  for (const question of publicQuestions) {
    questionCount += 1;
    assert.ok(!Object.hasOwn(question, 'correctAnswer'), question.id + ' 泄露标准答案');
    assert.ok(!Object.hasOwn(question, 'explanation'), question.id + ' 提前暴露解析');
    const trusted = serverById.get(question.id);
    assert.ok(trusted, question.id + ' 服务端缺少对应题目');
    assert.ok(Object.hasOwn(trusted, 'correctAnswer'), question.id + ' 服务端缺少可信标准答案');
    assert.ok(Object.hasOwn(trusted, 'explanation'), question.id + ' 服务端缺少题目解析');
    assert.doesNotMatch(String(trusted.explanation || ''), /(?:选项[A-D]|[A-D](?:项|为|是))/, question.id + ' 解析不应使用 A/B/C/D 选项指代');
    assert.deepEqual(question.options || [], (trusted.options || []).map((value) => String(value).replace(/^[A-D]\.\s*/, '')), question.id + ' 选项不一致');
    if (question.options) {
      assert.equal(new Set(question.options).size, question.options.length, question.id + ' 存在重复选项');
    }
  }

  const first = [...publicQuestions].sort((a, b) => hash(a.id) - hash(b.id)).slice(0, 10)
    .map((question) => ({ id: question.id, options: [...(question.options || [])].map((value, index) => ({ value, rank: hash(question.id + ':' + index) })).sort((a, b) => a.rank - b.rank).map((item) => item.value) }));
  const second = [...publicQuestions].sort((a, b) => hash(a.id) - hash(b.id)).slice(0, 10)
    .map((question) => ({ id: question.id, options: [...(question.options || [])].map((value, index) => ({ value, rank: hash(question.id + ':' + index) })).sort((a, b) => a.rank - b.rank).map((item) => item.value) }));
  assert.deepEqual(first, second, grade + ' 题目或选项洗牌不稳定');
}
assert.equal(questionCount, 175, '题库总题量应为 175');

const curriculumSource = await read('web/features/chinese/data/curriculum.data.ts');
assert.doesNotMatch(curriculumSource, /EXAMS_DATA|correctAnswer|DEFAULT_CURRICULUM/, '浏览器课程模块不应携带可信答案数据');
const curriculum = JSON.parse(await read('web/features/chinese/data/curriculum.json'));
assert.equal(curriculum.grades.length, 12, '课程 JSON 必须覆盖 12 个年级');
for (const grade of curriculum.grades) {
  for (const semester of grade.semesters || []) {
    for (const lesson of semester.lessons || []) {
      for (const question of lesson.quiz || []) {
        assert.ok(!Object.hasOwn(question, 'correctAnswer'), question.id + ' 课程 JSON 泄露标准答案');
        assert.ok(!Object.hasOwn(question, 'explanation'), question.id + ' 课程 JSON 提前暴露解析');
      }
    }
  }
}
assert.ok((await read('web/features/chinese/data/curriculum.json')).length < 2 * 1024 * 1024, '课程 JSON 超过 2MB');

const migration = await read('database/migrations/021_chinese.sql');
assert.match(migration, /CREATE TABLE IF NOT EXISTS chinese_user_progress/i);
assert.doesNotMatch(migration, /DROP\s+TABLE|FOREIGN\s+KEY/i, '语文迁移不允许 DROP TABLE 或外键');
assert.match(migration, /user_id\s+VARCHAR\(36\)/i, '用户 ID 必须使用学海 VARCHAR(36)');
const tableNames = [...migration.matchAll(/CREATE TABLE IF NOT EXISTS\s+(\w+)/gi)].map((match) => match[1]);
assert.ok(tableNames.length >= 9, '新业务表数量不足');
assert.ok(tableNames.every((name) => name.startsWith('chinese_')), '新表必须使用 chinese_ 前缀');

const routes = await read('server/routes/chinese.ts');
const routeCount = [...routes.matchAll(/router\.(?:get|post|put|patch|delete)\(/g)].length;
const apiDocs = await read('docs/api-contract.md');
const documentedCount = [...apiDocs.matchAll(/^\|\s*(?:GET|POST|PUT|PATCH|DELETE)\s*\|/gm)].length;
assert.equal(routeCount, documentedCount, 'API 文档端点数与路由注册数不一致');

const api = await read('web/features/chinese/api.ts');
assert.match(api, /localStorage\.getItem\('linguastep_token'\)/);
assert.doesNotMatch(api, /localStorage\.setItem\(/, '语文学习进度不能写入 localStorage');
const webFiles = await walk(resolve(root, 'web'));
for (const file of webFiles) {
  const source = await readFile(file, 'utf8');
  for (const match of source.matchAll(/\bfrom\s+['"]((?:\.\.?\/)[^'"]+)['"]/g)) {
    assert.match(match[1], /\.(?:ts|tsx|js|jsx|json)$/, file + ' 存在未带扩展名的相对 import: ' + match[1]);
  }
  for (const match of source.matchAll(/localStorage\.(?:getItem|setItem|removeItem)\(['"]([^'"]+)['"]/g)) {
    assert.ok(['linguastep_token', 'xuehai:chinese:tour:v1'].includes(match[1]), file + ' 使用了不允许的本地存储键: ' + match[1]);
  }
}

const storage = await read('server/db/chineseStorage.ts');
assert.match(storage, /pool\.execute/);
assert.match(storage, /INSERT IGNORE INTO chinese_practice_events/);
assert.match(storage, /INSERT IGNORE INTO chinese_study_sessions/);

console.log(JSON.stringify({
  ok: true,
  grades: grades.length,
  questions: questionCount,
  routes: routeCount,
  tables: tableNames.length,
  curriculumBytes: (await read('web/features/chinese/data/curriculum.json')).length,
}, null, 2));
