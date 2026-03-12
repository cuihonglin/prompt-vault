/**
 * PromptVault 每周自动更新脚本
 * 功能：根据当前日期计算周数，从 weekly-prompts.json 提取对应提示词，追加到 data.js
 */

const fs = require('fs');
const path = require('path');

// --- 配置 ---
const BASE_DIR = __dirname;
const WEEKLY_FILE = path.join(BASE_DIR, 'weekly-prompts.json');
const DATA_FILE = path.join(BASE_DIR, 'data.js');

// 项目启动日期（第1周的周一）—— 2026-03-09 是当前周的周一
const START_DATE = new Date('2026-03-09T00:00:00Z');

/**
 * 计算当前是第几周（从 START_DATE 算起）
 */
function getCurrentWeek() {
  const now = new Date();
  const diffMs = now.getTime() - START_DATE.getTime();
  const diffWeeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
  // 周数从1开始，且循环使用（超过52周后回到第1周）
  return (diffWeeks % 52) + 1;
}

/**
 * 读取 data.js 中已有的 BUILTIN_PROMPTS ID 列表
 */
function getExistingIds(dataContent) {
  const idPattern = /id:\s*'([^']+)'/g;
  const ids = new Set();
  let match;
  while ((match = idPattern.exec(dataContent)) !== null) {
    ids.add(match[1]);
  }
  return ids;
}

/**
 * 将提示词对象转为 data.js 中的 JS 对象字符串
 */
function promptToJsObject(prompt) {
  const today = new Date().toISOString().split('T')[0];
  
  // 转义 content 中的特殊字符
  const escapedContent = prompt.content
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n');
  
  const escapedNote = (prompt.note || '')
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'");

  const tagsStr = prompt.tags.map(t => `'${t}'`).join(', ');

  return `  {
    id: '${prompt.id}',
    title: '${prompt.title}',
    category: '${prompt.category}',
    content: '${escapedContent}',
    tags: [${tagsStr}],
    note: '${escapedNote}',
    favorite: false,
    copyCount: 0,
    createdAt: '${today}'
  }`;
}

// --- 主流程 ---
function main() {
  console.log('🧠 PromptVault Weekly Update');
  console.log('===========================');

  // 1. 计算当前周数
  const week = getCurrentWeek();
  console.log(`📅 当前周数: 第 ${week} 周`);

  // 2. 读取提示词库
  if (!fs.existsSync(WEEKLY_FILE)) {
    console.error('❌ 找不到 weekly-prompts.json');
    process.exit(1);
  }
  const weeklyPrompts = JSON.parse(fs.readFileSync(WEEKLY_FILE, 'utf-8'));
  
  // 3. 找到本周对应的提示词
  const thisWeekPrompt = weeklyPrompts.find(p => p.week === week);
  if (!thisWeekPrompt) {
    console.log(`⚠️ 没有找到第 ${week} 周的提示词，跳过更新`);
    return;
  }
  console.log(`📝 本周提示词: ${thisWeekPrompt.title} (${thisWeekPrompt.category})`);

  // 4. 读取现有 data.js
  if (!fs.existsSync(DATA_FILE)) {
    console.error('❌ 找不到 data.js');
    process.exit(1);
  }
  let dataContent = fs.readFileSync(DATA_FILE, 'utf-8');

  // 5. 检查是否已添加过
  const existingIds = getExistingIds(dataContent);
  if (existingIds.has(thisWeekPrompt.id)) {
    console.log(`✅ 提示词 "${thisWeekPrompt.title}" 已存在，无需重复添加`);
    return;
  }

  // 6. 追加新提示词到 BUILTIN_PROMPTS 数组
  const newEntry = promptToJsObject(thisWeekPrompt);
  
  // 找到数组末尾的 ]; 并在前面插入新条目
  const closingBracket = dataContent.lastIndexOf('];');
  if (closingBracket === -1) {
    console.error('❌ data.js 格式异常，找不到 ];');
    process.exit(1);
  }

  const before = dataContent.substring(0, closingBracket);
  const after = dataContent.substring(closingBracket);
  
  // 在最后一个条目后追加逗号和新条目
  dataContent = before.trimEnd() + ',\n' + newEntry + '\n' + after;

  // 7. 写回 data.js
  fs.writeFileSync(DATA_FILE, dataContent, 'utf-8');
  
  console.log('');
  console.log('🎉 更新成功！');
  console.log(`   标题: ${thisWeekPrompt.title}`);
  console.log(`   分类: ${thisWeekPrompt.category}`);
  console.log(`   标签: ${thisWeekPrompt.tags.join(', ')}`);
  console.log('');
}

main();
