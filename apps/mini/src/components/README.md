# Components 组件说明

> 所有可复用组件的说明和使用指南

**路径**：`apps/mini/src/components/`  
**更新时间**：2024-08-28 19:15

---

## 📋 组件分类

### 通用组件（高复用性）

| 组件 | 文件 | 功能 | 复用性 |
|------|------|------|--------|
| **MiniTabBar** | `MiniTabBar.vue` | 底部导航栏 | ⭐⭐⭐ 高 |
| **AppNavBar** | `AppNavBar.vue` | 顶部导航栏 | ⭐⭐⭐ 高 |

### 业务组件（特定场景）

| 组件 | 文件 | 功能 | 使用场景 |
|------|------|------|---------|
| **XuxuChatComposer** | `XuxuChatComposer.vue` | 聊天输入框 | 序序聊天页 |
| **XuxuHint** | `XuxuHint.vue` | 序序提示气泡 | 各页面提示 |
| **IllustratedHero** | `IllustratedHero.vue` | 插画英雄区 | 引导页、空状态 |

### 逻辑层（纯逻辑）

| 文件 | 功能 |
|------|------|
| `xuxu-chat.ts` | 聊天逻辑 |
| `companion-presentation.ts` | 陪伴展示逻辑 |
| `navigation.ts` | 导航逻辑 |

---

## 🧩 组件详细说明

### MiniTabBar（底部导航）⭐

**文件**：`components/MiniTabBar.vue`

**功能**：应用底部导航栏

**使用**：
```vue
<template>
  <view class="page">
    <!-- 页面内容 -->
    
    <!-- 底部导航 -->
    <MiniTabBar active="home" />
  </view>
</template>

<script setup lang="ts">
import MiniTabBar from '@/components/MiniTabBar.vue';
</script>
```

**Props**：
```typescript
interface Props {
  active: 'home' | 'records' | 'xuxu' | 'plan' | 'me';
}
```

**导航项**：
| 标识 | 图标 | 标题 | 路由 |
|------|------|------|------|
| home | 🏠 | 首页 | /pages/home/HomePage |
| records | 📝 | 记录 | /pages/records/RecordsPage |
| xuxu | 🤖 | 序序 | /pages/xuxu/XuxuPage |
| plan | 📅 | 计划 | /pages/plan/PlanPage |
| me | 👤 | 我的 | /pages/profile/ProfilePage |

**样式**：
- 固定在底部
- 高度：100rpx + safe-area-inset-bottom
- 背景：白色半透明
- 毛玻璃效果

---

### AppNavBar（顶部导航）

**文件**：`components/AppNavBar.vue`

**功能**：自定义顶部导航栏

**使用**：
```vue
<template>
  <view class="page">
    <AppNavBar title="页面标题" :showBack="true" />
    
    <!-- 页面内容 -->
  </view>
</template>

<script setup lang="ts">
import AppNavBar from '@/components/AppNavBar.vue';
</script>
```

**Props**：
```typescript
interface Props {
  title?: string;           // 标题
  showBack?: boolean;       // 是否显示返回按钮
  backgroundColor?: string; // 背景色
}
```

**默认值**：
```typescript
{
  title: '',
  showBack: true,
  backgroundColor: '#ffffff'
}
```

---

### XuxuChatComposer（聊天输入）

**文件**：`components/XuxuChatComposer.vue`

**功能**：序序聊天的输入框组件

**使用**：
```vue
<template>
  <XuxuChatComposer 
    v-model="userInput"
    :loading="sending"
    @submit="handleSubmit"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import XuxuChatComposer from '@/components/XuxuChatComposer.vue';

const userInput = ref('');
const sending = ref(false);

const handleSubmit = async (text: string) => {
  sending.value = true;
  // 发送消息
  await sendMessage(text);
  sending.value = false;
  userInput.value = '';
};
</script>
```

**Props**：
```typescript
interface Props {
  modelValue: string;       // v-model 绑定
  loading?: boolean;        // 发送中状态
  placeholder?: string;     // 占位符
  maxLength?: number;       // 最大长度
}
```

**Events**：
```typescript
interface Emits {
  'update:modelValue': [value: string];
  'submit': [text: string];
}
```

---

### XuxuHint（序序提示）

**文件**：`components/XuxuHint.vue`

**功能**：序序AI助手的提示气泡

**使用**：
```vue
<template>
  <XuxuHint 
    message="点击这里记录你的体重哦~" 
    position="top"
  />
</template>

<script setup lang="ts">
import XuxuHint from '@/components/XuxuHint.vue';
</script>
```

**Props**：
```typescript
interface Props {
  message: string;                    // 提示内容
  position?: 'top' | 'bottom';       // 位置
  showAvatar?: boolean;              // 是否显示序序头像
}
```

---

### IllustratedHero（插画英雄区）

**文件**：`components/IllustratedHero.vue`

**功能**：带插画的标题区域

**使用**：
```vue
<template>
  <IllustratedHero 
    title="欢迎来到禾伴"
    subtitle="开始你的健康之旅"
    illustration="/static/illustrations/onboarding-hero.png"
  />
</template>

<script setup lang="ts">
import IllustratedHero from '@/components/IllustratedHero.vue';
</script>
```

**Props**：
```typescript
interface Props {
  title: string;            // 标题
  subtitle?: string;        // 副标题
  illustration?: string;    // 插画路径
}
```

---

## 📦 逻辑层说明

### xuxu-chat.ts

**功能**：序序聊天的核心逻辑

**主要函数**：
```typescript
// 发送消息
export async function sendMessage(text: string): Promise<Message>;

// 获取历史消息
export async function getChatHistory(): Promise<Message[]>;

// 格式化消息
export function formatMessage(message: Message): FormattedMessage;
```

### companion-presentation.ts

**功能**：陪伴展示的逻辑

**主要函数**：
```typescript
// 获取陪伴卡片数据
export function getCompanionCard(): CompanionCard;

// 计算陪伴时长
export function calculateCompanionDuration(startDate: string): number;
```

### navigation.ts

**功能**：导航相关的通用逻辑

**主要函数**：
```typescript
// 导航到页面
export function navigateTo(path: string, params?: Record<string, any>): void;

// 返回上一页
export function goBack(delta?: number): void;

// 切换Tab
export function switchTab(tab: TabName): void;
```

---

## 🎨 组件设计规范

### Props 设计

```typescript
// ✅ 推荐：使用 TypeScript 接口
interface Props {
  required: string;          // 必填
  optional?: number;         // 可选
  withDefault?: boolean;     // 带默认值
}

const props = withDefaults(defineProps<Props>(), {
  withDefault: true
});

// ❌ 避免：使用 any
interface Props {
  data: any;  // 不推荐
}
```

### Events 设计

```typescript
// ✅ 推荐：类型化的 emits
const emit = defineEmits<{
  submit: [text: string];
  change: [value: number];
  'update:modelValue': [value: string];  // v-model
}>();

// 使用
emit('submit', userInput.value);
```

### 样式设计

```vue
<style scoped>
/* 1. 组件根元素 */
.component-root {
  /* 基础样式 */
}

/* 2. 子元素 */
.component-item {
  /* ... */
}

/* 3. 状态 */
.component-root.active {
  /* ... */
}

/* 4. 响应式（如需要） */
@media (min-width: 750px) {
  /* ... */
}
</style>
```

---

## 🧪 组件测试

### 测试清单

每个组件应测试：

- [ ] Props 正确传递
- [ ] Events 正确触发
- [ ] 默认值正确
- [ ] 边界情况处理
- [ ] 样式正确显示

### 测试示例

```typescript
// MiniTabBar.spec.ts
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import MiniTabBar from './MiniTabBar.vue';

describe('MiniTabBar', () => {
  it('应该正确显示激活的Tab', () => {
    const wrapper = mount(MiniTabBar, {
      props: { active: 'home' }
    });
    
    expect(wrapper.find('.tab-home').classes()).toContain('active');
  });
});
```

---

## 📝 组件开发规范

### 1. 文件命名

```
ComponentName.vue        # 组件文件（PascalCase）
ComponentName.spec.ts    # 测试文件
component-logic.ts       # 逻辑文件（kebab-case）
```

### 2. 组件结构

```vue
<template>
  <view class="component-root">
    <!-- 组件内容 -->
  </view>
</template>

<script setup lang="ts">
// 1. 导入
import { ref, computed } from 'vue';

// 2. Props
interface Props {
  // ...
}
const props = withDefaults(defineProps<Props>(), {});

// 3. Emits
const emit = defineEmits<{
  // ...
}>();

// 4. 响应式数据
const state = ref();

// 5. 计算属性
const computed = computed(() => {});

// 6. 方法
const handleClick = () => {};
</script>

<style scoped>
/* 样式 */
</style>
```

### 3. 注释规范

```vue
<script setup lang="ts">
/**
 * 组件名称
 * 
 * 功能描述
 * 
 * @example
 * <ComponentName :prop="value" @event="handler" />
 */

// Props 说明
interface Props {
  value: string;  // 值说明
}
</script>
```

---

## 🚀 待开发组件

### 优先级 🟡 中

- [ ] **LoadingSpinner** - 加载动画
- [ ] **EmptyState** - 空状态展示
- [ ] **ConfirmDialog** - 确认对话框
- [ ] **ToastMessage** - 提示消息

### 优先级 🟢 低

- [ ] **ProgressBar** - 进度条
- [ ] **Avatar** - 用户头像
- [ ] **Badge** - 徽章
- [ ] **Card** - 通用卡片

---

## 📚 相关文档

- [模块索引](../../../docs/MODULE-INDEX.md) - 所有模块概览
- [项目架构](../../../docs/PROJECT-ARCHITECTURE.md) - 整体架构
- [代码规范](../../../docs/CODE-STANDARDS.md) - 编码标准
- [Vue 3 组件文档](https://cn.vuejs.org/guide/components/)

---

**维护者**：Components Team  
**最后更新**：2024-08-28 19:15
