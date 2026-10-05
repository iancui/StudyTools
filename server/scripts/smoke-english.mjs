// 临时 smoke test - 仅用于本工单验证, 不打包进生产构建.
// 测试场景:
//   1) 未登录不能导入 (401)
//   2) 注册+登录 A 和 B 用户
//   3) A 导入辞书, 重复 word 去重
//   4) A 查询辞书和单词
//   5) B 看不到 A 的辞书
// 完成后会被 git 忽略.

import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const API_BASE = "http://localhost:3001/api";

const uid = Date.now();
const userA = { username: `smoke_a_${uid}`, password: "Smoke1234!", nickname: "Smoke A" };
const userB = { username: `smoke_b_${uid}`, password: "Smoke1234!", nickname: "Smoke B" };

let pass = 0;
let fail = 0;
function check(name, cond, extra = "") {
  if (cond) {
    pass++;
    console.log(`  ✓ ${name}`);
  } else {
    fail++;
    console.log(`  ✗ ${name} ${extra}`);
  }
}

async function http(method, path, { token, body } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  let json = null;
  try { json = await res.json(); } catch (_) {}
  return { status: res.status, json };
}

async function registerAndLogin(u) {
  await http("POST", "/auth/register", { body: u });
  const r = await http("POST", "/auth/login", { body: { username: u.username, password: u.password } });
  return r.json?.data?.accessToken;
}

console.log("\n=== English Dictionary Smoke Test ===\n");

// 1) 未登录不能导入 (401)
{
  console.log("[1] 未登录导入应 401");
  const r = await http("POST", "/english/dictionaries/import", {
    body: { name: "x", csvText: "word,meaning\na,甲\n" },
  });
  check("未登录返回 401", r.status === 401, `actual=${r.status}`);
}

// 2) 注册+登录
const tokenA = await registerAndLogin(userA);
const tokenB = await registerAndLogin(userB);
check("A 用户登录获取 token", !!tokenA);
check("B 用户登录获取 token", !!tokenB);

// 3) A 导入辞书 (含重复 word 测试去重)
{
  console.log("\n[3] A 导入辞书 + 重复去重");
  const csv = [
    "word,meaning,phonetic,pos,phonics",
    "apple,苹果,ˈæpl,n,a-p-p-l-e",
    "apple,苹果重复,ˈæpl,n,a-p-p-l-e",   // 重复 word, 应去重跳过
    "book,书,,,b-o-o-k",
    ",空行被跳过,",
    "cat,猫",
    "",
    "dog,狗,,n,",
  ].join("\n");
  const r = await http("POST", "/english/dictionaries/import", {
    token: tokenA,
    body: { name: "Smoke 辞书 A", description: "smoke test", csvText: csv },
  });
  check("导入返回 200/201", r.status === 200, `actual=${r.status} ${JSON.stringify(r.json)}`);
  check("导入成功标志", r.json?.success === true);
  check("有 dictionaryId", typeof r.json?.data?.dictionaryId === "number");
  check("导入数量=4 (apple,book,cat,dog)", r.json?.data?.importedCount === 4, `actual=${r.json?.data?.importedCount}`);
  check("跳过数量>=3 (header, dup, empty)", r.json?.data?.skippedCount >= 3, `actual=${r.json?.data?.skippedCount}`);
  globalThis.__dictIdA = r.json?.data?.dictionaryId;
}

// 4) A 查询辞书和单词
{
  console.log("\n[4] A 查询辞书和单词");
  const listR = await http("GET", "/english/dictionaries", { token: tokenA });
  check("辞书列表 200", listR.status === 200);
  check("辞书列表数量>=1", Array.isArray(listR.json?.data) && listR.json.data.length >= 1);
  check("辞书 word_count 字段", typeof listR.json?.data?.[0]?.wordCount === "number");
  const dictId = globalThis.__dictIdA;
  const detailR = await http("GET", `/english/dictionaries/${dictId}`, { token: tokenA });
  check("辞书详情 200", detailR.status === 200);
  check("辞书详情 name=Smoke 辞书 A", detailR.json?.data?.name === "Smoke 辞书 A");
  const wordsR = await http("GET", `/english/dictionaries/${dictId}/words`, { token: tokenA });
  check("单词列表 200", wordsR.status === 200);
  check("单词数量=4", Array.isArray(wordsR.json?.data) && wordsR.json.data.length === 4, `actual=${wordsR.json?.data?.length}`);
}

// 5) B 看不到 A 的辞书
{
  console.log("\n[5] B 用户隔离");
  const listB = await http("GET", "/english/dictionaries", { token: tokenB });
  check("B 辞书列表 200", listB.status === 200);
  check("B 看不到 A 的辞书", Array.isArray(listB.json?.data) && listB.json.data.length === 0);
  // B 直接访问 A 的辞书 id 应该 404 (detail) 或 200 空数组 (words, 友好空状态)
  const dictB = await http("GET", `/english/dictionaries/${globalThis.__dictIdA}`, { token: tokenB });
  check("B 访问 A 的辞书详情返回 404", dictB.status === 404, `actual=${dictB.status}`);
  const wordsB = await http("GET", `/english/dictionaries/${globalThis.__dictIdA}/words`, { token: tokenB });
  check("B 访问 A 的辞书单词返回空数组", Array.isArray(wordsB.json?.data) && wordsB.json.data.length === 0, `actual=${JSON.stringify(wordsB.json)}`);
}

console.log(`\n=== Smoke test 结束: ${pass} pass, ${fail} fail ===\n`);
process.exit(fail > 0 ? 1 : 0);
