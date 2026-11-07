import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const read = (path) => readFile(resolve(root, path), 'utf8');
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

const curriculum = JSON.parse(await read('web/features/chinese/data/curriculum.json'));
assert.equal(curriculum.grades.length, 12, '课程 JSON 必须覆盖 12 个年级');
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
