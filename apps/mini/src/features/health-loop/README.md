# Health Loop 模块

> 健康循环核心模块 - 管理每日健康数据闭环

**模块路径**：`apps/mini/src/features/health-loop/`  
**优先级**：🔴 最高（核心模块）  
**状态**：✅ 已完成  
**维护者**：Health Team

---

## 📋 模块概述

Health Loop（健康循环）是整个应用的**核心模块**，负责管理用户的每日健康数据闭环。

### 核心概念

**今日状态（Today State）**：
- 用户的健康计划（Health Plan）
- 今日各项记录（Today Records）
- 每日体验数据（Daily Experience）

**数据流**：
```
用户 → 记录数据 → Health Loop → 计算体验 → 展示给用户
```

---

## 📁 文件结构

```
health-loop/
├── health-loop.service.ts          # API 服务层
├── health-loop.store.ts            # 状态管理（核心）⭐
├── daily-experience.ts             # 每日体验计算
├── daily-experience.spec.ts        # 单元测试
├── plan-presentation.ts            # 计划展示逻辑
├── plan-presentation.spec.ts       # 单元测试
├── record-presentation.ts          # 记录展示逻辑
├── record-presentation.spec.ts     # 单元测试
├── local-demo.ts                   # 本地演示数据
└── README.md                       # 本文档
```

---

## 🎯 核心功能

### 1. 状态管理（health-loop.store.ts）

**核心数据结构**：
```typescript
interface TodayState {
  activePlan: HealthPlan | null;      // 活跃的健康计划
  todayRecords: TodayRecords;         // 今日所有记录
  displayName: string;                // 用户昵称
}

interface TodayRecords {
  weight?: WeightRecord;              // 体重记录
  food?: FoodRecord[];                // 饮食记录
  water?: WaterRecord;                // 喝水记录
  sleep?: SleepRecord;                // 睡眠记录
  activity?: ActivityRecord;          // 活动记录
  mood?: MoodRecord;                  // 心情记录
}
```

**状态实例**：
```typescript
export const healthLoopState = {
  // 响应式数据
  today: reactive<TodayState | null>(null),
  loading: ref(false),
  error: ref<string | null>(null),
  
  // 方法
  load: async () => { ... },
  refresh: async () => { ... }
};
```

### 2. 每日体验计算（daily-experience.ts）

**功能**：根据今日数据计算用户体验

**输入**：`TodayState`  
**输出**：`DailyExperience`

```typescript
interface DailyExperience {
  greeting: string;              // 问候语（早上好/下午好）
  motivationMessage: string;     // 激励消息
  progressPercentage: number;    // 进度百分比
  highlights: string[];          // 今日亮点
  suggestions: string[];         // 改进建议
}

// 使用示例
const experience = deriveDailyExperience(today);
// { greeting: '早上好', motivationMessage: '...' }
```

### 3. 计划展示（plan-presentation.ts）

**功能**：处理健康计划的展示逻辑

**主要函数**：
```typescript
// 格式化计划描述
export function formatPlanDescription(plan: HealthPlan): string;

// 计算计划进度
export function calculatePlanProgress(plan: HealthPlan, today: TodayState): number;

// 获取下一步行动
export function getNextAction(plan: HealthPlan): string;
```

### 4. 记录展示（record-presentation.ts）

**功能**：处理健康记录的展示逻辑

**主要函数**：
```typescript
// 格式化体重显示
export function formatWeight(record: WeightRecord): string;
// 返回：'68.5kg'

// 格式化时间显示
export function formatRecordTime(timestamp: string): string;
// 返回：'今天 14:30' 或 '昨天 08:00'

// 计算热量总计
export function calculateTotalCalories(foods: FoodRecord[]): number;
```

---

## 💻 使用示例

### 在页面中使用

```vue
<template>
  <view class="page">
    <!-- 加载状态 -->
    <view v-if="loading" class="loading">加载中...</view>
    
    <!-- 错误状态 -->
    <view v-else-if="error" class="error">{{ error }}</view>
    
    <!-- 正常显示 -->
    <view v-else-if="today">
      <text>{{ greeting }}</text>
      <text>{{ displayName }}</text>
      
      <!-- 显示体重 -->
      <text v-if="today.todayRecords?.weight">
        {{ today.todayRecords.weight.valueKg }}kg
      </text>
      
      <!-- 显示饮食 -->
      <view v-for="food in today.todayRecords?.food" :key="food.id">
        {{ food.name }} - {{ food.calories }}千卡
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { healthLoopState } from '@/features/health-loop/health-loop.store';
import { deriveDailyExperience } from '@/features/health-loop/daily-experience';

// 获取状态
const { today, loading, error } = healthLoopState;

// 计算属性
const experience = computed(() => 
  today.value ? deriveDailyExperience(today.value) : null
);

const greeting = computed(() => experience.value?.greeting || '你好');
const displayName = computed(() => today.value?.displayName || '朋友');

// 生命周期
onShow(() => {
  if (!loading.value && !today.value) {
    healthLoopState.load();
  }
});
</script>
```

### 手动刷新数据

```typescript
import { healthLoopState } from '@/features/health-loop/health-loop.store';

// 加载数据
await healthLoopState.load();

// 刷新数据（强制重新加载）
await healthLoopState.refresh();
```

---

## 🔄 数据流

### 加载流程

```
1. 页面调用 healthLoopState.load()
   ↓
2. 设置 loading = true
   ↓
3. 调用 health-loop.service.ts 的 API
   ↓
4. 从后端获取数据
   ↓
5. 更新 today 状态
   ↓
6. 设置 loading = false
   ↓
7. 页面自动响应更新
```

### 更新流程

```
1. 用户记录新数据（如体重）
   ↓
2. 调用 health-records.service 保存
   ↓
3. 保存成功后调用 healthLoopState.refresh()
   ↓
4. 重新加载 today 数据
   ↓
5. 页面自动更新显示
```

---

## 📊 数据格式

### HealthPlan（健康计划）

```typescript
interface HealthPlan {
  id: string;
  type: 'weight-loss' | 'weight-gain' | 'maintain';
  healthTarget: {
    startWeightKg: number;      // 初始体重
    targetWeightKg: number;     // 目标体重
    targetDate: string;         // 目标日期
  };
  startDate: string;
  status: 'active' | 'completed' | 'paused';
}
```

### WeightRecord（体重记录）

```typescript
interface WeightRecord {
  id: string;
  valueKg: number;              // 体重值（千克）
  recordedAt: string;           // 记录时间（ISO 8601）
  note?: string;                // 备注
}
```

### FoodRecord（饮食记录）

```typescript
interface FoodRecord {
  id: string;
  name: string;                 // 食物名称
  calories: number;             // 热量（千卡）
  weight: number;               // 重量（克）
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  recordedAt: string;
}
```

---

## 🧪 测试

### 运行测试

```bash
# 测试整个模块
npx vitest run src/features/health-loop

# 测试特定文件
npx vitest run src/features/health-loop/daily-experience.spec.ts

# 监听模式
npx vitest watch src/features/health-loop
```

### 测试覆盖

- ✅ daily-experience.ts - 100% 覆盖
- ✅ plan-presentation.ts - 100% 覆盖
- ✅ record-presentation.ts - 100% 覆盖
- ⬜ health-loop.store.ts - 需要集成测试

---

## 🔗 依赖关系

### 依赖的模块

```typescript
// 类型定义
import { HealthPlan, TodayRecords } from '@heban/contracts';

// 健康记录
import { healthRecordsStore } from '@/features/health-records/health-records.store';

// 配置
import { runtime } from '@/config/runtime';
```

### 被依赖的模块

本模块被以下页面/模块依赖：

- ✅ **HomePage** - 首页显示
- ✅ **RecordsPage** - 记录更新后刷新
- ✅ **ProfilePage** - 个人信息显示
- ✅ **PlanPage** - 计划进度显示
- ✅ **WeeklyReviewPage** - 周报数据来源

---

## ⚠️ 注意事项

### 1. 性能考虑

- ✅ 使用 `reactive` 而不是 `ref`（对象更新更高效）
- ✅ 避免频繁调用 `load()`（有缓存机制）
- ✅ 使用 `computed` 计算衍生数据

### 2. 数据一致性

- ⚠️ 更新记录后必须调用 `refresh()` 刷新
- ⚠️ 不要直接修改 `today` 对象，通过 API 更新

### 3. 错误处理

```typescript
try {
  await healthLoopState.load();
} catch (err) {
  // error 会自动设置
  console.error('加载失败', healthLoopState.error.value);
}
```

---

## 🚀 未来计划

### 计划中的功能

- [ ] 离线数据支持
- [ ] 数据缓存优化
- [ ] 实时数据同步
- [ ] 多设备同步

### 性能优化

- [ ] 增量更新（而不是全量刷新）
- [ ] 懒加载历史数据
- [ ] 预加载明天的数据

---

## 📚 相关文档

- [模块索引](../../../docs/MODULE-INDEX.md) - 所有模块概览
- [项目架构](../../../docs/PROJECT-ARCHITECTURE.md) - 整体架构
- [首页开发](../../../docs/AI-HANDOFF-HomePage.md) - 使用本模块的示例

---

## 🤝 贡献指南

### 修改本模块时

1. 确保所有测试通过
2. 更新类型定义（如果需要）
3. 更新本 README 文档
4. 通知依赖本模块的页面开发者

### 添加新功能时

1. 在对应文件中添加函数
2. 添加单元测试
3. 更新本 README 的功能列表
4. 提供使用示例

---

**模块负责人**：Health Loop Team  
**最后更新**：2024-08-28 19:00  
**版本**：1.0
