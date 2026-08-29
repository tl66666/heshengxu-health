/**
 * 测试 SQL 解析 - 验证 food.sql 格式
 * 
 * 使用方法：
 * pnpm tsx scripts/test-food-sql-parse.ts
 */

import fs from 'fs';
import path from 'path';

function testParseSql() {
  console.log('🔍 测试 SQL 文件解析...\n');
  
  const sqlPath = path.join(__dirname, '../food.sql');
  
  if (!fs.existsSync(sqlPath)) {
    console.error('❌ 找不到 food.sql 文件');
    return;
  }
  
  const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
  console.log(`📄 文件大小: ${(sqlContent.length / 1024 / 1024).toFixed(2)} MB`);
  
  // 查找 INSERT 语句
  const insertMatch = sqlContent.match(/INSERT INTO food[^(]*\(([^)]+)\)\s+VALUES/);
  
  if (!insertMatch) {
    console.error('❌ 找不到 INSERT INTO food 语句');
    return;
  }
  
  const columns = insertMatch[1].split(',').map(c => c.trim());
  console.log(`\n📋 字段列表 (${columns.length} 个):`);
  columns.forEach((col, idx) => {
    console.log(`  ${idx + 1}. ${col}`);
  });
  
  // 提取第一条记录
  const valuesMatch = sqlContent.match(/VALUES\s*\n\s*(\([^;]+?\))/);
  
  if (valuesMatch) {
    console.log('\n📝 第一条记录示例:');
    console.log(valuesMatch[1].substring(0, 200) + '...');
  }
  
  // 统计记录数（粗略估计）
  const recordCount = (sqlContent.match(/\),\s*\n\s*\(/g) || []).length + 1;
  console.log(`\n📊 估计记录数: ${recordCount}`);
  
  console.log('\n✅ SQL 格式验证完成');
}

testParseSql();
