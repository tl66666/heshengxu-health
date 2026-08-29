# Pages 页面模块说明

> 所有页面的组织说明和路由配置

**路径**：`apps/mini/src/pages/`  
**更新时间**：2024-08-28 19:10

---

## 📋 页面组织

### 当前结构（扁平化）

```
pages/
├── home/                    # 首页
├── food-recognition/        # 饮食识别
├── food-candidates/         # 食物候选
├── food-confirm/           # 食物确认
├── food-search/            # 食物搜索
├── profile/                # 个人中心
├── profile-edit/           # 编辑个人信息
├── records/                # 健康记录
├── plan/                   # 健康计划
├── plan-setup/             # 设置计划
├── xuxu/                   # 序序聊天
├── weekly-review/          # 周报
├── onboarding/             # 引导建档
└── bootstrap/              # 启动页
```

### 建议的未来结构（模块化）

```
pages/
├── home/                   # 首页模块
│   ├── HomePage.vue
│   └── edit-cards/        # 编辑卡片（子页面）
│
├── food/                   # 饮食模块
│   ├── recognition/       # 识别
│   ├── candidates/        # 候选
│   ├── confirm/           # 确认
│   └── search/            # 搜索
│
├── profile/                # 个人模块
│   ├── ProfilePage.vue
│   └── edit/              # 编辑
│
├── records/                # 记录模块
│   └── RecordsPage.vue
│
├── plan/                   # 计划模块
│   ├── PlanPage.vue
│   └── setup/             # 设置
│
├── xuxu/                   # 聊天模块
│   └── XuxuPage.vue
│
├── weekly-review/          # 周报模块
│   └── WeeklyReviewPage.vue
│
├── onboarding/             # 引导模块
│   └── OnboardingPage.vue
│
└── bootstrap/              # 启动模块
    └── BootstrapPage.vue
```

---

## 🗺️ 路由配置

### 主要路由

| 页面 | 路径 | 功能 | Tab栏 |
|------|------|------|-------|
| 首页 | `/pages/home/HomePage` | 健康概览 | ✅ home |
| 记录 | `/pages/records/RecordsPage` | 记录数据 | ✅ records |
| 序序 | `/pages/xuxu/XuxuPage` | AI聊天 | ✅ xuxu |
| 计划 | `/pages/plan/PlanPage` | 健康计划 | ✅ plan |
| 个人 | `/pages/profile/ProfilePage` | 个人中心 | ✅ me |

### 功能路由

| 页面 | 路径 | 从哪里跳转 |
|------|------|-----------|
| 饮食识别 | `/pages/food-recognition/FoodRecognitionPage` | 首页"早餐"等按钮 |
| 饮食候选 | `/pages/food-candidates/FoodCandidatesPage` | 识别后自动跳转 |
| 饮食确认 | `/pages/food-confirm/FoodConfirmPage` | 选择候选后跳转 |
| 食物搜索 | `/pages/food-search/FoodSearchPage` | 手动输入入口 |
| 编辑个人信息 | `/pages/profile-edit/ProfileEditPage` | 个人中心 |
| 设置计划 | `/pages/plan-setup/PlanSetupPage` | 计划页面 |
| 周报 | `/pages/weekly-review/WeeklyReviewPage` | 首页/计划页 |

### 引导路由

| 页面 | 路径 | 触发时机 |
|------|------|---------|
| 启动页 | `/pages/bootstrap/BootstrapPage` | 应用启动 |
| 引导建档 | `/pages/onboarding/OnboardingPage` | 首次使用 |

---

## 📄 页面详细说明

### 首页（HomePage）⭐

**路径**：`pages/home/HomePage.vue`  
**版本**：V9.2  
**Tab栏**：home

**功能**：
- 体重管理进度（SVG半圆）
- 饮食热量统计
- 快捷记录按钮
- 功能卡片（喝水、睡眠、活动、心情）
- 轻断食、血糖卡片
- 编辑首页卡片按钮

**数据来源**：
```typescript
import { healthLoopState } from '@/features/health-loop/health-loop.store';
```

**详细文档**：[AI-HANDOFF-HomePage.md](../../../docs/AI-HANDOFF-HomePage.md)

---

### 记录页（RecordsPage）

**路径**：`pages/records/RecordsPage.vue`  
**Tab栏**：records

**功能**：记录各类健康数据

**URL参数**：
```typescript
// 跳转示例
uni.navigateTo({ 
  url: '/pages/records/RecordsPage?type=weight' 
});

// 支持的类型
type RecordType = 'weight' | 'food' | 'water' | 'sleep' | 'activity' | 'mood';
```

**数据处理**：
```typescript
import { healthRecordsStore } from '@/features/health-records/health-records.store';

// 添加记录
await healthRecordsStore.addRecord(type, data);

// 刷新首页数据
await healthLoopState.refresh();
```

---

### 序序聊天（XuxuPage）

**路径**：`pages/xuxu/XuxuPage.vue`  
**Tab栏**：xuxu

**功能**：
- AI对话
- 健康建议
- 数据解读

**组件**：
```typescript
import XuxuChatComposer from '@/components/XuxuChatComposer.vue';
```

---

### 饮食识别流程

```
FoodRecognitionPage（拍照）
   ↓
FoodCandidatesPage（选择识别结果）
   ↓
FoodConfirmPage（确认详细信息）
   ↓
保存 → 刷新首页
```

**使用示例**：
```typescript
// 从首页跳转到识别页
const goToRecognition = () => {
  uni.navigateTo({ 
    url: '/pages/food-recognition/FoodRecognitionPage?mealType=breakfast' 
  });
};
```

---

## 🎨 页面样式规范

### 通用样式

所有页面应遵循统一的样式规范：

```vue
<style scoped>
.page {
  min-height: 100vh;
  padding: 32rpx;
  padding-bottom: 200rpx;  /* 为底部Tab栏留空间 */
  background: linear-gradient(180deg, #f8fdf9 0%, #f5f8f6 100%);
}
</style>
```

### 卡片样式

```css
.card {
  margin-bottom: 16rpx;
  padding: 20rpx 24rpx;
  border-radius: 24rpx;
  background: #ffffff;
  box-shadow: 0 2rpx 12rpx rgba(127, 204, 143, 0.08);
}
```

---

## 🔄 页面间跳转

### 导航API

```typescript
// 跳转到新页面（可返回）
uni.navigateTo({ url: '/pages/xxx/XxxPage' });

// 重定向（不可返回）
uni.redirectTo({ url: '/pages/xxx/XxxPage' });

// 返回上一页
uni.navigateBack({ delta: 1 });

// 切换Tab（只能用于Tab页面）
uni.switchTab({ url: '/pages/home/HomePage' });
```

### 传递参数

```typescript
// 传递参数
uni.navigateTo({ 
  url: '/pages/records/RecordsPage?type=weight&from=home' 
});

// 接收参数
onLoad((options) => {
  const type = options.type;  // 'weight'
  const from = options.from;  // 'home'
});
```

---

## 🧪 页面测试

### 手动测试清单

每个页面应测试：

- [ ] 页面正常加载
- [ ] 数据正确显示
- [ ] 所有按钮可点击
- [ ] 跳转正确
- [ ] 返回正常
- [ ] 错误处理
- [ ] 加载状态
- [ ] 空状态

---

## 📝 页面开发规范

### 1. 文件命名

```
XxxPage.vue          # 页面主文件（PascalCase）
xxx-actions.ts       # 页面逻辑（kebab-case）
xxx-types.ts         # 类型定义（如需要）
```

### 2. 组件结构

```vue
<template>
  <!-- 1. 顶部导航（如需要） -->
  <!-- 2. 加载状态 -->
  <!-- 3. 错误状态 -->
  <!-- 4. 主要内容 -->
  <!-- 5. 底部Tab栏（Tab页面） -->
</template>

<script setup lang="ts">
// 1. 导入
// 2. Props（如需要）
// 3. 响应式数据
// 4. 计算属性
// 5. 方法
// 6. 生命周期
</script>

<style scoped>
/* 样式 */
</style>
```

### 3. 页面配置

在 `pages.json` 中配置：

```json
{
  "path": "pages/xxx/XxxPage",
  "style": {
    "navigationBarTitleText": "页面标题",
    "navigationBarBackgroundColor": "#ffffff",
    "navigationBarTextStyle": "black"
  }
}
```

---

## 🚀 待开发页面

### 优先级 🔴 高

- [ ] **编辑首页卡片页面** (`home/edit-cards/EditCardsPage.vue`)
  - 功能：管理首页卡片显示/隐藏
  - 参考：[AI-HANDOFF-HomePage.md](../../../docs/AI-HANDOFF-HomePage.md)

### 优先级 🟡 中

- [ ] **便便记录页面** (`records/stool/StoolRecordPage.vue`)
- [ ] **生理期记录页面** (`records/menstruation/MenstruationPage.vue`)
- [ ] **用药记录页面** (`records/medication/MedicationPage.vue`)

---

## 📚 相关文档

- [模块索引](../../../docs/MODULE-INDEX.md) - 所有模块概览
- [项目架构](../../../docs/PROJECT-ARCHITECTURE.md) - 整体架构
- [首页开发](../../../docs/AI-HANDOFF-HomePage.md) - 首页详细文档
- [代码规范](../../../docs/CODE-STANDARDS.md) - 编码标准

---

**维护者**：Pages Team  
**最后更新**：2024-08-28 19:10
