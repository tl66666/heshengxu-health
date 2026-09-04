# 食物库与营养管理功能设计文档

> 和生序健康管理系统 - 饮食与体重管理模块完整设计

**创建时间**：2026-08-29  
**版本**：1.0  
**状态**：设计中

---

## 📋 目录

1. [功能概述](#功能概述)
2. [设计原则](#设计原则)
3. [功能模块](#功能模块)
4. [数据模型](#数据模型)
5. [用户体验流程](#用户体验流程)
6. [技术实现方案](#技术实现方案)
7. [UI设计规范](#ui设计规范)
8. [实施计划](#实施计划)

---

## 🎯 功能概述

### 核心目标

打造一个**温暖、简单、科学**的饮食与体重管理系统，让用户轻松记录、理解和改善自己的饮食习惯。

### 功能范围

| 模块 | 功能 | 优先级 | 参考对象 |
|------|------|--------|----------|
| **食物库** | 食物搜索、分类浏览、营养查询 | 🔴 最高 | 和生序 |
| **拍照识别** | AI识别食物、快速记录 | 🔴 最高 | 和生序 |
| **饮食记录** | 早中晚餐+加餐记录、热量统计 | 🔴 最高 | 和生序 |
| **体重管理** | 体重记录、趋势分析、目标设定 | 🔴 最高 | 和生序 |
| **营养分析** | 三大营养素占比、微量元素 | 🟡 中 | 和生序 |
| **饮食建议** | AI个性化建议 | 🟢 低 | 序序助手 |

### 设计参考

**和生序设计重点**：
- ✅ 食物库完整（40万+ 食物）
- ✅ 识别准确快速
- ✅ 记录流程简单（3步完成）
- ✅ 营养展示清晰
- ✅ 体重曲线直观

**我们的差异化**：
- 🌸 **治愈系日系水彩风格**（vs 薄荷的简洁绿色）
- 💬 **AI陪伴式交互**（序序助手全程陪伴）
- 🎯 **健康循环闭环**（与体重、睡眠、运动联动）
- 🌱 **温和渐进式目标**（不追求极端，强调节律）

---

## 🎨 设计原则

### 1. 温暖而非冰冷

❌ 避免：
- 严厉的红色警告
- 冷冰冰的数字堆砌
- 让人焦虑的卡路里强调

✅ 追求：
- 温柔的色彩提示
- 图文并茂的展示
- 鼓励性的文案

### 2. 简单而非复杂

❌ 避免：
- 多步骤的复杂流程
- 过多的必填字段
- 专业术语堆砌

✅ 追求：
- 一键快速记录
- 智能默认值
- 通俗易懂的说明

### 3. 科学而非极端

❌ 避免：
- 极端的节食建议
- 不切实际的目标
- 单一的热量观

✅ 追求：
- 平衡的营养建议
- 可持续的目标
- 全面的健康视角

---

## 🧩 功能模块

## 模块 1：食物库管理

### 1.1 数据库集成

**现有资源**：
- ✅ `food.sql`：49,690 条食物数据
- ✅ `food_category.sql`：12 个分类
- ✅ 包含完整营养信息（30+ 字段）

**数据结构**：
```typescript
interface FoodDatabase {
  id: number;
  categoryId: number;
  code: string;              // 拼音编码
  name: string;              // 食物名称
  thumbImageUrl: string;     // 缩略图
  isLiquid: boolean;         // 是否流食
  healthLight: 0 | 1 | 2 | 3; // 健康灯：绿/黄/红
  
  // 基础营养（每100g）
  weight: string;            // 标准重量
  calory: string;            // 热量 kcal
  protein: string;           // 蛋白质 g
  fat: string;               // 脂肪 g
  carbohydrate: string;      // 碳水化合物 g
  fiberDietary: string;      // 膳食纤维 g
  
  // 维生素
  vitaminA: string;
  vitaminC: string;
  vitaminE: string;
  thiamine: string;          // B1
  lactoflavin: string;       // B2
  vitaminB6: string;
  niacin: string;            // 烟酸
  folacin: string;           // 叶酸
  
  // 矿物质
  natrium: string;           // 钠 mg
  calcium: string;           // 钙 mg
  iron: string;              // 铁 mg
  kalium: string;            // 钾 mg
  zinc: string;              // 锌 mg
  selenium: string;          // 硒 μg
  magnesium: string;         // 镁 mg
  copper: string;            // 铜 mg
  manganese: string;         // 锰 mg
  phosphor: string;          // 磷 mg
  
  // 其他
  cholesterol: string;       // 胆固醇 mg
  saturatedFat: string;      // 饱和脂肪 g
  sugar: string;             // 糖 g
  gi: string;                // 升糖指数
  gl: string;                // 升糖负荷
}

interface FoodCategory {
  id: number;
  name: string;              // 主食类、肉蛋类等
  imageUri: string;
  description: string;
}
```

**实现任务**：
- [ ] 1.1.1 设计 Prisma Schema（映射现有 SQL）
- [ ] 1.1.2 创建 API 接口（搜索、分类、详情）
- [ ] 1.1.3 前端 Service 封装
- [ ] 1.1.4 数据导入脚本

### 1.2 食物搜索

**功能**：
- 🔍 关键词搜索（支持拼音、汉字）
- 📂 分类浏览（12 个一级分类）
- 🔥 热门食物快捷入口
- ⏱️ 历史记录（最近 20 条）
- ⭐ 收藏夹

**UI 设计**：
```
┌─────────────────────────────────────┐
│  🔍 搜索食物                          │
├─────────────────────────────────────┤
│  🔥 热门食物                          │
│  [🍚 米饭] [🍞 全麦面包] [🥚 鸡蛋]   │
│  [🐟 三文鱼] [🥗 西兰花] ...          │
├─────────────────────────────────────┤
│  📂 分类浏览                          │
│  ┌──────┬──────┬──────┬──────┐      │
│  │ 主食 │ 肉蛋 │ 蔬菜 │ 水果 │      │
│  └──────┴──────┴──────┴──────┘      │
│  ┌──────┬──────┬──────┬──────┐      │
│  │ 坚果 │ 奶类 │ 油脂 │ 饮料 │      │
│  └──────┴──────┴──────┴──────┘      │
├─────────────────────────────────────┤
│  ⏱️ 最近使用                          │
│  • 米饭 (100g · 116 kcal)           │
│  • 鸡胸肉 (150g · 165 kcal)         │
│  • 西兰花 (200g · 68 kcal)          │
└─────────────────────────────────────┘
```

**实现任务**：
- [ ] 1.2.1 创建 `FoodSearchPage.vue`
- [ ] 1.2.2 实现搜索逻辑（防抖、高亮）
- [ ] 1.2.3 分类图标水彩风格设计
- [ ] 1.2.4 历史记录本地存储

### 1.3 食物详情

**展示内容**：
- 📸 食物图片（水彩风格 placeholder）
- 🔤 名称、分类、健康灯
- 📊 营养成分表（可展开）
- 🍽️ 常见份量参考
- ➕ 快速添加按钮

**健康灯说明**：
- 🟢 **绿灯**：推荐多吃（蔬菜、水果、粗粮）
- 🟡 **黄灯**：适量食用（肉类、主食）
- 🔴 **红灯**：少吃（油炸、高糖）

**实现任务**：
- [ ] 1.3.1 创建 `FoodDetailPage.vue`
- [ ] 1.3.2 营养成分可视化组件
- [ ] 1.3.3 健康灯图标设计

---

## 模块 2：拍照识别

### 2.1 识别流程

**步骤设计**：
```
拍照/选图 → AI识别 → 选择结果 → 确认份量 → 保存记录
   (1)        (2)       (3)        (4)        (5)
```

### 2.2 拍照界面

**功能**：
- 📷 相机拍摄
- 🖼️ 相册选择
- 💡 拍摄小贴士（光线、角度）

**UI 设计**：
```
┌─────────────────────────────────────┐
│              相机预览                 │
│                                     │
│         [拍摄建议卡片]               │
│  💡 保证光线充足                     │
│  💡 让食物占满画面                   │
│  💡 多角度更准确                     │
│                                     │
│                                     │
│         [  📷  拍照  ]              │
│         [ 🖼️ 相册 ]                 │
└─────────────────────────────────────┘
```

**实现任务**：
- [ ] 2.2.1 增强现有 `FoodRecognitionPage.vue`
- [ ] 2.2.2 相机权限处理
- [ ] 2.2.3 图片压缩上传

### 2.3 AI 识别

**技术方案**：
- **阶段 1**（MVP）：使用 Azure Computer Vision API
- **阶段 2**（优化）：训练专用食物识别模型

**识别结果**：
```typescript
interface RecognitionResult {
  candidates: Array<{
    foodId: number;
    foodName: string;
    confidence: number;     // 置信度 0-1
    estimatedGrams: number; // 估算重量
  }>;
  rawImage: string;         // 原图
}
```

**实现任务**：
- [ ] 2.3.1 对接 Azure API
- [ ] 2.3.2 结果匹配到本地食物库
- [ ] 2.3.3 置信度阈值处理

### 2.4 候选列表

**功能**：
- 📝 显示 Top 3-5 个候选
- 🎯 置信度可视化
- ✏️ 搜索其他食物（兜底）

**UI 设计**：
```
┌─────────────────────────────────────┐
│  识别到的可能是：                     │
├─────────────────────────────────────┤
│  ✅ 🍚 米饭                          │
│     116 kcal / 100g                 │
│     置信度：████████░░ 85%          │
├─────────────────────────────────────┤
│  ⭕ 🍜 白粥                          │
│     46 kcal / 100g                  │
│     置信度：█████░░░░░ 52%          │
├─────────────────────────────────────┤
│  ⭕ 🍙 寿司饭                        │
│     147 kcal / 100g                 │
│     置信度：████░░░░░░ 41%          │
├─────────────────────────────────────┤
│  🔍 都不对？搜索其他食物              │
└─────────────────────────────────────┘
```

**实现任务**：
- [ ] 2.4.1 完善现有 `FoodCandidatesPage.vue`
- [ ] 2.4.2 置信度条组件
- [ ] 2.4.3 搜索兜底逻辑

### 2.5 份量确认

**功能**：
- 🔢 输入克数（智能默认）
- 📐 常见份量快选（1碗、1个、1份）
- 📊 实时计算营养

**UI 设计**：
```
┌─────────────────────────────────────┐
│  [食物图片]                          │
│  🍚 米饭                             │
├─────────────────────────────────────┤
│  份量                                │
│  ┌─────────────────────────────┐    │
│  │      150      g             │    │
│  └─────────────────────────────┘    │
│  快速选择：                          │
│  [ 1小碗 100g ] [ 1碗 150g ] 💚     │
│  [ 1大碗 200g ] [ 自定义 ]          │
├─────────────────────────────────────┤
│  营养成分                            │
│  🔥 热量   174 kcal                 │
│  🥩 蛋白质  3.9 g                   │
│  🧈 脂肪    0.5 g                   │
│  🌾 碳水    38.9 g                  │
├─────────────────────────────────────┤
│  餐次                                │
│  ( ) 早餐  (•) 午餐  ( ) 晚餐       │
│  ( ) 加餐                            │
├─────────────────────────────────────┤
│         [ 确认添加 ]                 │
└─────────────────────────────────────┘
```

**实现任务**：
- [ ] 2.5.1 增强现有 `FoodConfirmPage.vue`
- [ ] 2.5.2 份量预设逻辑
- [ ] 2.5.3 实时营养计算

---

## 模块 3：饮食记录

### 3.1 记录管理

**数据模型**：
```typescript
interface MealRecord {
  id: string;
  userId: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foodId: number;
  foodName: string;
  grams: number;
  
  // 快照营养数据（记录时计算）
  calories: number;
  protein: number;
  fat: number;
  carbohydrate: number;
  
  recordedAt: string;       // ISO 8601
  note?: string;            // 备注
  imageUrl?: string;        // 照片
}
```

**实现任务**：
- [ ] 3.1.1 Prisma Schema 设计
- [ ] 3.1.2 CRUD API 接口
- [ ] 3.1.3 前端 Service 封装

### 3.2 首页饮食卡片

**功能**：
- 📊 今日热量进度条
- 🍽️ 各餐次记录摘要
- ➕ 快速添加入口

**UI 设计**（已有基础，需增强）：
```
┌─────────────────────────────────────┐
│  🍽️ 今日饮食                        │
├─────────────────────────────────────┤
│  热量摄入                            │
│  ████████░░░░░░░░░░ 1,234 / 1,800  │
│  剩余 566 kcal                      │
├─────────────────────────────────────┤
│  🌅 早餐                386 kcal    │
│  • 米饭 100g                        │
│  • 鸡蛋 1个                         │
│                            [ ➕ ]   │
├─────────────────────────────────────┤
│  🌞 午餐                628 kcal    │
│  • 鸡胸肉 150g                      │
│  • 西兰花 200g                      │
│                            [ ➕ ]   │
├─────────────────────────────────────┤
│  🌙 晚餐                 [ 添加 ]   │
│  🍪 加餐                 [ 添加 ]   │
└─────────────────────────────────────┘
```

**实现任务**：
- [ ] 3.2.1 增强 `HomePage.vue` 饮食卡片
- [ ] 3.2.2 热量进度可视化
- [ ] 3.2.3 餐次图标水彩化

### 3.3 饮食日历

**功能**：
- 📅 按日期查看历史
- 📊 每日热量趋势图
- 🔍 筛选特定食物

**UI 设计**：
```
┌─────────────────────────────────────┐
│  ← 2026年8月 →                      │
│  日 一 二 三 四 五 六                │
│              1  2  3                │
│  4  5  6  7  8  9 10                │
│  11 12 13 14 15 16 17               │
│  18 19 20 21 22 23 24               │
│  25 26 27 28[29]30 31               │
│                                     │
│  • 绿色：热量达标                   │
│  • 黄色：热量超标 <20%              │
│  • 红色：热量超标 >20%              │
├─────────────────────────────────────┤
│  📊 本周趋势                        │
│  热量  [折线图]                     │
│  蛋白质 [折线图]                    │
└─────────────────────────────────────┘
```

**实现任务**：
- [ ] 3.3.1 创建 `FoodCalendarPage.vue`
- [ ] 3.3.2 日历组件（uni-calendar）
- [ ] 3.3.3 趋势图表（uCharts）

---

## 模块 4：体重管理

### 4.1 体重记录

**功能**：
- ⚖️ 快速记录体重
- 📅 时间选择（默认当前）
- 📝 备注（可选）
- 📸 对比照（可选）

**UI 设计**：
```
┌─────────────────────────────────────┐
│  ⚖️ 记录体重                        │
├─────────────────────────────────────┤
│  体重（kg）                          │
│  ┌─────────────────────────────┐    │
│  │         68.5                │    │
│  └─────────────────────────────┘    │
│  [  -  ]         [  +  ]            │
├─────────────────────────────────────┤
│  记录时间                            │
│  2026-08-29  08:30                  │
├─────────────────────────────────────┤
│  备注（可选）                        │
│  早起空腹                            │
├─────────────────────────────────────┤
│  📸 对比照（可选）                   │
│  [ 添加照片 ]                        │
├─────────────────────────────────────┤
│         [ 保存 ]                     │
└─────────────────────────────────────┘
```

**实现任务**：
- [ ] 4.1.1 增强 `RecordsPage.vue` 体重功能
- [ ] 4.1.2 数字键盘组件
- [ ] 4.1.3 照片上传（可选）

### 4.2 体重趋势

**功能**：
- 📈 体重曲线图
- 🎯 目标线对比
- 📊 周/月/年视图切换
- 💡 趋势分析文案

**UI 设计**：
```
┌─────────────────────────────────────┐
│  📈 体重趋势                        │
├─────────────────────────────────────┤
│  当前  68.5 kg                      │
│  目标  65.0 kg                      │
│  已减  2.5 kg  🎉                   │
├─────────────────────────────────────┤
│  [周] [月] [年]                     │
│                                     │
│  kg                                 │
│  72 ┤                               │
│  70 ┤    ●                          │
│  68 ┤       ●─●─●  ← 当前          │
│  66 ┤                               │
│  64 ┤- - - - - - - - ← 目标        │
│  62 ┤                               │
│     └─────────────────              │
│     8/1  8/8  8/15 8/22 8/29       │
├─────────────────────────────────────┤
│  💡 本周小结                        │
│  太棒了！你坚持记录体重7天，         │
│  平均每周减重0.5kg，保持这个         │
│  节奏继续加油～                     │
└─────────────────────────────────────┘
```

**实现任务**：
- [ ] 4.2.1 创建 `WeightTrendPage.vue`
- [ ] 4.2.2 体重曲线图（uCharts）
- [ ] 4.2.3 趋势分析算法
- [ ] 4.2.4 鼓励文案库

### 4.3 体重目标

**功能**：
- 🎯 设定目标体重
- 📅 目标日期
- 📊 每日/每周目标分解
- 💡 合理性检查（不超过健康标准）

**健康标准**：
- ⚠️ 每周减重 > 1kg：提示过快
- ⚠️ 目标 BMI < 18.5 或 > 24：提示不健康
- ✅ 推荐速度：0.5-1kg/周

**实现任务**：
- [ ] 4.3.1 创建 `WeightGoalPage.vue`
- [ ] 4.3.2 BMI 计算
- [ ] 4.3.3 目标合理性校验

---

## 模块 5：营养分析

### 5.1 每日营养报告

**功能**：
- 🍽️ 三大营养素占比
- 📊 与推荐值对比
- 🔍 缺失营养提示

**UI 设计**：
```
┌─────────────────────────────────────┐
│  📊 今日营养                        │
├─────────────────────────────────────┤
│  三大营养素                          │
│  ┌─────────────────────────────┐    │
│  │ 🥩 30% | 🧈 25% | 🌾 45%   │    │
│  │ 蛋白质  脂肪     碳水        │    │
│  └─────────────────────────────┘    │
│                                     │
│  推荐占比：20-30% | 20-30% | 50-60% │
│  ✅ 营养均衡！                      │
├─────────────────────────────────────┤
│  详细营养                            │
│  🥩 蛋白质  92g  / 75g  ✅          │
│  🧈 脂肪    69g  / 60g  ⚠️          │
│  🌾 碳水   276g  / 250g  ✅         │
│  🌾 纤维    18g  / 25g  💡          │
│  🧂 钠    2100mg / 2300mg ✅        │
├─────────────────────────────────────┤
│  💡 营养建议                        │
│  • 今天的纤维摄入略少，晚餐可以      │
│    增加蔬菜和粗粮哦～                │
│  • 脂肪摄入稍多，注意控制油脂～      │
└─────────────────────────────────────┘
```

**实现任务**：
- [ ] 5.1.1 创建 `NutritionReportPage.vue`
- [ ] 5.1.2 营养占比饼图
- [ ] 5.1.3 营养建议规则引擎

### 5.2 周/月营养报告

**功能**：
- 📈 营养趋势分析
- 🏆 达标天数统计
- 💡 改进建议

**实现任务**：
- [ ] 5.2.1 集成到 `WeeklyReviewPage`
- [ ] 5.2.2 营养趋势图

---

## 📐 数据模型

### 数据库 Schema

```prisma
// schema.prisma

// 食物分类
model FoodCategory {
  id          Int      @id @default(autoincrement())
  name        String   // 主食类、肉蛋类等
  imageUri    String?
  description String?
  foods       Food[]
  
  @@map("food_category")
}

// 食物库
model Food {
  id             Int           @id @default(autoincrement())
  categoryId     Int           @map("category_id")
  code           String?       // 拼音编码
  name           String
  thumbImageUrl  String?       @map("thumb_image_url")
  isLiquid       Int?          @map("is_liquid")
  healthLight    Int?          @map("health_light")
  
  // 基础营养（每100g）
  weight         String?
  calory         String?       // 热量 kcal
  protein        String?       // 蛋白质 g
  fat            String?       // 脂肪 g
  carbohydrate   String?       // 碳水化合物 g
  fiberDietary   String?       @map("fiber_dietary")
  
  // 维生素
  vitaminA       String?       @map("vitamin_a")
  thiamine       String?       // B1
  lactoflavin    String?       // B2
  vitaminC       String?       @map("vitamin_c")
  vitaminE       String?       @map("vitamin_e")
  vitaminB6      String?       @map("vitamin_b6")
  niacin         String?
  folacin        String?       // 叶酸
  
  // 矿物质
  natrium        String?       // 钠
  calcium        String?       // 钙
  iron           String?       // 铁
  kalium         String?       // 钾
  zinc           String?       // 锌
  selenium       String?       // 硒
  magnesium      String?       // 镁
  copper         String?       // 铜
  manganese      String?       // 锰
  phosphor       String?       // 磷
  
  // 其他
  cholesterol    String?       // 胆固醇
  saturatedFat   String?       @map("saturated_fat")
  sugar          String?
  gi             String?       // 升糖指数
  gl             String?       // 升糖负荷
  
  category       FoodCategory  @relation(fields: [categoryId], references: [id])
  mealRecords    MealRecord[]
  
  @@index([categoryId])
  @@index([name])
  @@map("food")
}

// 饮食记录
model MealRecord {
  id            String   @id @default(uuid())
  userId        String   @map("user_id")
  foodId        Int      @map("food_id")
  mealType      String   @map("meal_type") // breakfast/lunch/dinner/snack
  grams         Float    // 份量（克）
  
  // 营养快照
  calories      Float    // 热量
  protein       Float    // 蛋白质
  fat           Float    // 脂肪
  carbohydrate  Float    // 碳水
  
  recordedAt    DateTime @map("recorded_at")
  note          String?
  imageUrl      String?  @map("image_url")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")
  
  user          User     @relation(fields: [userId], references: [id])
  food          Food     @relation(fields: [foodId], references: [id])
  
  @@index([userId, recordedAt])
  @@map("meal_record")
}

// 体重记录（扩展现有）
model WeightRecord {
  id            String   @id @default(uuid())
  userId        String   @map("user_id")
  valueKg       Float    @map("value_kg")
  recordedAt    DateTime @map("recorded_at")
  note          String?
  imageUrl      String?  @map("image_url") // 对比照
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")
  
  user          User     @relation(fields: [userId], references: [id])
  
  @@index([userId, recordedAt])
  @@map("weight_record")
}

// 体重目标
model WeightGoal {
  id              String   @id @default(uuid())
  userId          String   @unique @map("user_id")
  currentKg       Float    @map("current_kg")
  targetKg        Float    @map("target_kg")
  targetDate      DateTime @map("target_date")
  weeklyGoalKg    Float    @map("weekly_goal_kg") // 每周目标
  motivation      String?  // 目标动机
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")
  
  user            User     @relation(fields: [userId], references: [id])
  
  @@map("weight_goal")
}
```

---

## 🎨 UI 设计规范

### 色彩系统

**主色调**（延续现有）：
- 🟢 **绿色**：`#7fcc8f`（健康、蔬菜）
- 🔵 **蓝色**：`#6495ed`（清新、水分）
- 🟡 **黄色**：`#f4a460`（温暖、能量）
- 🔴 **红色**：`#dc6464`（温柔的提示）

**语义色**：
```css
/* 健康灯 */
--health-green: #7fcc8f;   /* 绿灯：推荐 */
--health-yellow: #ffd93d;  /* 黄灯：适量 */
--health-red: #ff8080;     /* 红灯：少吃 */

/* 营养素 */
--protein: #ff9999;        /* 蛋白质：粉红 */
--fat: #ffd666;            /* 脂肪：金黄 */
--carb: #a8d8ff;           /* 碳水：浅蓝 */
--fiber: #b8e6b8;          /* 纤维：草绿 */

/* 餐次 */
--breakfast: #ffe4b5;      /* 早餐：米色 */
--lunch: #ffd700;          /* 午餐：金色 */
--dinner: #ff8c69;         /* 晚餐：橙色 */
--snack: #dda0dd;          /* 加餐：淡紫 */
```

### 图标风格

**水彩风格要求**：
- ✅ 边缘柔和、略微模糊
- ✅ 色彩渐变、不均匀
- ✅ 有纸张纹理感
- ✅ 200x200px，透明背景

**需要新增的图标**：
- [ ] 🍽️ 餐盘（通用饮食）
- [ ] 🥗 沙拉碗（健康饮食）
- [ ] ⚖️ 体重秤
- [ ] 📊 营养分析
- [ ] 🎯 目标达成
- [ ] 📸 拍照识别
- [ ] 🔍 食物搜索

### 字体排版

```css
/* 数字（突出显示） */
.number-large {
  font-family: -apple-system, "PingFang SC";
  font-size: 48rpx;
  font-weight: 600;
  line-height: 1.2;
}

/* 标题 */
.title {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
}

/* 正文 */
.body {
  font-size: 28rpx;
  font-weight: 400;
  color: #666;
  line-height: 1.6;
}

/* 辅助文字 */
.caption {
  font-size: 24rpx;
  color: #999;
}
```

### 组件样式

**卡片**：
```css
.card {
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}
```

**按钮**：
```css
.button-primary {
  background: linear-gradient(135deg, #7fcc8f 0%, #6ab87e 100%);
  border-radius: 48rpx;
  color: #fff;
  font-size: 32rpx;
  font-weight: 500;
  padding: 28rpx 64rpx;
  box-shadow: 0 8rpx 24rpx rgba(127, 204, 143, 0.3);
}
```

**进度条**：
```css
.progress {
  height: 16rpx;
  background: #f0f0f0;
  border-radius: 8rpx;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #7fcc8f 0%, #a8e6cf 100%);
  border-radius: 8rpx;
  transition: width 0.3s ease;
}
```

---

## 🚀 实施计划

### 阶段 1：基础建设（1-2天）

**目标**：完成食物库接入和基础查询

**任务清单**：
- [ ] 1.1 设计 Prisma Schema
- [ ] 1.2 编写数据导入脚本
- [ ] 1.3 创建食物 API 接口
  - `GET /api/foods/search?q=xxx` - 搜索
  - `GET /api/foods/:id` - 详情
  - `GET /api/foods/categories` - 分类列表
  - `GET /api/foods/category/:id` - 分类下的食物
- [ ] 1.4 前端 Service 封装
- [ ] 1.5 单元测试

**验收标准**：
- ✅ 食物库导入完成（49,690 条）
- ✅ 搜索返回正确结果
- ✅ API 响应时间 < 500ms

### 阶段 2：搜索与详情（1天）

**目标**：完成食物搜索和详情页面

**任务清单**：
- [ ] 2.1 食物搜索页面
  - 搜索框（防抖）
  - 分类浏览
  - 历史记录
- [ ] 2.2 食物详情页面
  - 营养成分表
  - 健康灯展示
  - 快速添加按钮
- [ ] 2.3 水彩图标设计（分类、餐次）

**验收标准**：
- ✅ 搜索流畅无卡顿
- ✅ 详情页展示完整
- ✅ UI 符合水彩风格

### 阶段 3：拍照识别（1-2天）

**目标**：完成 AI 食物识别流程

**任务清单**：
- [ ] 3.1 拍照界面增强
- [ ] 3.2 对接 Azure Computer Vision
- [ ] 3.3 识别结果匹配本地库
- [ ] 3.4 候选列表页面
- [ ] 3.5 份量确认页面

**验收标准**：
- ✅ 识别准确率 > 70%
- ✅ 完整流程 < 10 秒
- ✅ 兜底搜索可用

### 阶段 4：饮食记录（1天）

**目标**：完成饮食记录和展示

**任务清单**：
- [ ] 4.1 饮食记录 API
  - `POST /api/meal-records` - 创建
  - `GET /api/meal-records?date=xxx` - 查询
  - `PATCH /api/meal-records/:id` - 更新
  - `DELETE /api/meal-records/:id` - 删除
- [ ] 4.2 首页饮食卡片增强
- [ ] 4.3 饮食日历页面

**验收标准**：
- ✅ 记录保存成功
- ✅ 首页正确统计
- ✅ 日历可查看历史

### 阶段 5：体重管理（1天）

**目标**：完成体重记录和趋势分析

**任务清单**：
- [ ] 5.1 体重记录功能增强
- [ ] 5.2 体重趋势页面
  - 曲线图
  - 目标对比
  - 趋势分析
- [ ] 5.3 体重目标设定

**验收标准**：
- ✅ 体重记录流畅
- ✅ 曲线图正确显示
- ✅ 目标合理性校验

### 阶段 6：营养分析（1天）

**目标**：完成营养报告和建议

**任务清单**：
- [ ] 6.1 每日营养报告
- [ ] 6.2 营养建议规则
- [ ] 6.3 周/月报告集成

**验收标准**：
- ✅ 营养计算准确
- ✅ 建议合理实用
- ✅ 可视化清晰

### 阶段 7：测试与优化（1天）

**目标**：全面测试和性能优化

**任务清单**：
- [ ] 7.1 端到端测试
- [ ] 7.2 性能优化
  - 图片懒加载
  - 列表虚拟滚动
  - API 缓存
- [ ] 7.3 边界情况处理
- [ ] 7.4 文案润色

**验收标准**：
- ✅ 无严重 Bug
- ✅ 页面流畅（FPS > 50）
- ✅ 文案友好温暖

---

## 📊 成功指标

### 功能完整性

- ✅ 食物库完整可用
- ✅ 识别流程顺畅
- ✅ 记录功能完善
- ✅ 数据统计准确

### 用户体验

- ✅ 添加食物 < 30 秒
- ✅ 识别成功率 > 70%
- ✅ UI 风格统一
- ✅ 文案温暖友好

### 技术指标

- ✅ API 响应 < 500ms
- ✅ 页面 FPS > 50
- ✅ 单元测试覆盖率 > 80%
- ✅ 无严重 Bug

---

## 📚 参考资源

### 竞品分析

**和生序数据规范**：
- 食物数据以服务端授权来源和和生序领域契约为准
- 页面不直接依赖外部产品或未授权数据库
- 学习点：食物库、识别、记录流程

**Keep**：
- 学习点：体重管理、目标设定

**MyFitnessPal**：
- 学习点：营养分析、数据可视化

### 技术文档

- Azure Computer Vision：https://docs.microsoft.com/zh-cn/azure/cognitive-services/computer-vision/
- uCharts：https://www.ucharts.cn/
- Prisma：https://www.prisma.io/docs/

### 设计资源

- 日系配色：https://nipponcolors.com/
- 水彩素材：现有 `assets/illustrations/`

---

## 🔄 后续迭代

### V2.0 功能（未来）

- [ ] 自定义食物
- [ ] 食谱推荐
- [ ] 营养师咨询
- [ ] 社区分享
- [ ] 饮食打卡挑战
- [ ] 与序序深度整合

### V3.0 功能（愿景）

- [ ] 离线识别
- [ ] AR 食物展示
- [ ] 智能食谱生成
- [ ] 家庭健康管理
- [ ] 可穿戴设备集成

---

**文档维护者**：AI Development Team  
**创建时间**：2026-08-29  
**最后更新**：2026-08-29
