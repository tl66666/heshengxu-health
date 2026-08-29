# 代码规范与最佳实践

> 本文档定义禾伴项目的代码编写规范，确保代码一致性和可维护性

---

## 📋 目录

1. [通用规范](#通用规范)
2. [Vue组件规范](#vue组件规范)
3. [TypeScript规范](#typescript规范)
4. [样式规范](#样式规范)
5. [命名规范](#命名规范)
6. [注释规范](#注释规范)

---

## 通用规范

### 文件编码
- 统一使用 **UTF-8** 编码
- 行尾使用 **LF** (Unix风格)
- 文件末尾保留一个空行

### 缩进
- 使用 **2个空格** 缩进
- 不使用 Tab

### 代码长度
- 单行代码不超过 **100个字符**
- 函数不超过 **50行**（复杂逻辑除外）
- 文件不超过 **500行**（页面组件可适当放宽）

---

## Vue组件规范

### 组件结构顺序

```vue
<template>
  <!-- 模板内容 -->
</template>

<script setup lang="ts">
// 1. 导入
import { ref, computed, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import ComponentA from './ComponentA.vue';

// 2. 类型定义
interface Props {
  title: string;
  count?: number;
}

interface Data {
  id: string;
  name: string;
}

// 3. Props
const props = withDefaults(defineProps<Props>(), {
  count: 0
});

// 4. Emits
const emit = defineEmits<{
  change: [value: number];
  submit: [data: Data];
}>();

// 5. 响应式数据
const loading = ref(false);
const items = ref<Data[]>([]);

// 6. 计算属性
const displayTitle = computed(() => `${props.title} (${props.count})`);

// 7. 方法
const handleClick = () => {
  emit('change', props.count + 1);
};

const fetchData = async () => {
  loading.value = true;
  try {
    // 获取数据
  } finally {
    loading.value = false;
  }
};

// 8. 生命周期
onMounted(() => {
  fetchData();
});

onShow(() => {
  // 页面显示时
});
</script>

<style scoped>
/* 样式 */
</style>
```

### 组件命名

**文件名**：PascalCase
```
HomePage.vue       ✅
homePage.vue       ❌
home-page.vue      ❌
```

**组件注册**：自动注册（无需手动注册）
```vue
<script setup lang="ts">
import MiniTabBar from '../../components/MiniTabBar.vue';
</script>

<template>
  <MiniTabBar active="home" />
</template>
```

### Props规范

```typescript
// ✅ 推荐：使用TypeScript接口
interface Props {
  title: string;           // 必填
  subtitle?: string;       // 可选
  count?: number;          // 可选带默认值
  items?: string[];        // 可选数组
}

const props = withDefaults(defineProps<Props>(), {
  subtitle: '',
  count: 0,
  items: () => []         // 数组/对象默认值使用工厂函数
});

// ❌ 避免：使用any
interface Props {
  data: any;              // 不推荐
}
```

### Emits规范

```typescript
// ✅ 推荐：类型化的emits
const emit = defineEmits<{
  change: [value: number];
  update: [id: string, data: Data];
  submit: [];
}>();

// 使用
emit('change', 123);
emit('update', 'id-001', data);
emit('submit');

// ❌ 避免：无类型
const emit = defineEmits(['change', 'update']);
```

### 模板规范

```vue
<!-- ✅ 推荐 -->
<template>
  <!-- 1. 单一根元素 -->
  <view class="page">
    <!-- 2. v-if / v-else-if / v-else 合理使用 -->
    <view v-if="loading" class="loading">加载中...</view>
    <view v-else-if="error" class="error">{{ error }}</view>
    <view v-else>
      <!-- 3. v-for 必须有key -->
      <view
        v-for="item in items"
        :key="item.id"
        class="item"
      >
        {{ item.name }}
      </view>
    </view>
    
    <!-- 4. 属性顺序：v-if, v-for, v-model, 其他指令, 属性, 事件 -->
    <button
      v-if="showButton"
      class="btn"
      :disabled="loading"
      @tap="handleClick"
    >
      点击
    </button>
  </view>
</template>

<!-- ❌ 避免 -->
<template>
  <!-- 没有key -->
  <view v-for="item in items">{{ item }}</view>
  
  <!-- 属性顺序混乱 -->
  <button @tap="handleClick" v-if="show" :disabled="loading" class="btn">
    点击
  </button>
</template>
```

### 计算属性 vs 方法

```typescript
// ✅ 推荐：有缓存需求用computed
const fullName = computed(() => `${firstName.value} ${lastName.value}`);

// ✅ 推荐：需要参数或每次都要执行用方法
const formatDate = (timestamp: string) => {
  return new Date(timestamp).toLocaleDateString();
};

// ❌ 避免：在模板中写复杂逻辑
<template>
  <text>{{ user.firstName + ' ' + user.lastName }}</text>  <!-- 不好 -->
  <text>{{ fullName }}</text>  <!-- 好 -->
</template>
```

---

## TypeScript规范

### 类型定义

```typescript
// ✅ 推荐：使用interface定义对象类型
interface User {
  id: string;
  name: string;
  age?: number;
  tags: string[];
}

// ✅ 推荐：使用type定义联合类型
type Status = 'pending' | 'success' | 'error';
type ID = string | number;

// ✅ 推荐：使用enum定义常量
enum CardType {
  WEIGHT = 'weight',
  CALORIE = 'calorie',
  WATER = 'water',
}

// ❌ 避免：过度使用any
let data: any;              // 不好
let data: unknown;          // 好一些（需要类型断言）
let data: User[];           // 最好
```

### 类型断言

```typescript
// ✅ 推荐：使用 as
const element = document.getElementById('app') as HTMLElement;

// ❌ 避免：使用尖括号（在Vue模板中会冲突）
const element = <HTMLElement>document.getElementById('app');
```

### 函数类型

```typescript
// ✅ 推荐：明确参数和返回值类型
const formatWeight = (weight: number): string => {
  return `${weight.toFixed(1)}kg`;
};

// ✅ 推荐：异步函数
const fetchData = async (): Promise<User[]> => {
  const response = await fetch('/api/users');
  return response.json();
};

// ❌ 避免：缺少类型
const formatWeight = (weight) => {    // 缺少参数类型
  return `${weight}kg`;               // 缺少返回值类型
};
```

### 可选链与空值合并

```typescript
// ✅ 推荐：使用可选链
const userName = user?.profile?.name;

// ✅ 推荐：使用空值合并
const count = props.count ?? 0;

// ❌ 避免：繁琐的检查
const userName = user && user.profile && user.profile.name;
const count = props.count !== null && props.count !== undefined ? props.count : 0;
```

---

## 样式规范

### 样式组织

```vue
<style scoped>
/* 1. 页面/组件根元素 */
.page {
  min-height: 100vh;
  padding: 32rpx;
  background: #f5f8f6;
}

/* 2. 布局相关 */
.header {
  display: flex;
  align-items: center;
}

.content {
  flex: 1;
}

/* 3. 组件样式 */
.card {
  padding: 20rpx 24rpx;
  border-radius: 24rpx;
  background: #ffffff;
}

.card-title {
  font-size: 26rpx;
  font-weight: 800;
}

/* 4. 状态样式 */
.card.active {
  background: #e8f7ed;
}

.card:active {
  transform: scale(0.98);
}

/* 5. 响应式（如果需要） */
@media (min-width: 750px) {
  .page {
    max-width: 750px;
    margin: 0 auto;
  }
}
</style>
```

### CSS命名

**使用kebab-case**
```css
/* ✅ 推荐 */
.weight-card { }
.card-title { }
.btn-primary { }

/* ❌ 避免 */
.weightCard { }
.CardTitle { }
.btn_primary { }
```

**BEM命名（可选，用于复杂组件）**
```css
/* Block */
.card { }

/* Element */
.card__title { }
.card__content { }

/* Modifier */
.card--active { }
.card--disabled { }
```

### 颜色使用

```css
/* ✅ 推荐：使用项目色值 */
.text {
  color: #2d6943;              /* 主色 */
}

.bg {
  background: #7fcc8f;         /* 品牌绿 */
}

/* ✅ 推荐：使用rgba */
.overlay {
  background: rgba(127, 204, 143, 0.12);
}

/* ❌ 避免：随意使用颜色 */
.text {
  color: #333;                 /* 与设计不符 */
}
```

### 尺寸单位

```css
/* ✅ 推荐：使用rpx（响应式） */
.card {
  width: 100%;
  padding: 20rpx;
  font-size: 26rpx;
  border-radius: 24rpx;
}

/* ✅ 可用：px（固定尺寸） */
.icon {
  width: 1px;                  /* 1px边框 */
  border: 1px solid #e0e0e0;
}

/* ❌ 避免：rem, em（微信小程序不推荐） */
.text {
  font-size: 1.2rem;           /* 不推荐 */
}
```

### 动画

```css
/* ✅ 推荐：使用transition */
.button {
  transition: all 0.3s ease;
}

.button:active {
  transform: scale(0.95);
}

/* ✅ 推荐：使用@keyframes */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card {
  animation: fade-in 0.6s ease both;
}

/* ❌ 避免：过度动画 */
.element {
  animation: spin 0.5s infinite;  /* 晃眼睛 */
}
```

---

## 命名规范

### 变量命名

```typescript
// ✅ 推荐：camelCase
const userName = 'Alice';
const isLoading = true;
const itemCount = 0;

// ✅ 推荐：布尔值用is/has/can开头
const isVisible = true;
const hasPermission = false;
const canEdit = true;

// ❌ 避免：无意义命名
const data = [];
const temp = 0;
const x = true;
```

### 常量命名

```typescript
// ✅ 推荐：UPPER_SNAKE_CASE
const MAX_COUNT = 100;
const API_BASE_URL = 'https://api.example.com';
const DEFAULT_PAGE_SIZE = 20;

// ✅ 推荐：枚举值
enum Status {
  PENDING = 'pending',
  SUCCESS = 'success',
  ERROR = 'error',
}
```

### 函数命名

```typescript
// ✅ 推荐：动词开头
const fetchUsers = async () => { };
const handleClick = () => { };
const validateForm = () => { };
const formatDate = (date: Date) => { };

// ✅ 推荐：事件处理函数
const onClick = () => { };
const onSubmit = () => { };
const handleUserSelect = () => { };

// ❌ 避免：名词或形容词
const users = () => { };        // 不好，像变量名
const blue = () => { };         // 不好，无意义
```

### 文件命名

```
// ✅ 推荐
HomePage.vue              # 页面组件（PascalCase）
MiniTabBar.vue           # 通用组件（PascalCase）
daily-experience.ts      # 工具函数（kebab-case）
health-loop.store.ts     # 状态管理（kebab-case）
user.types.ts            # 类型定义（kebab-case）

// ❌ 避免
homePage.vue             # 不推荐
mini_tab_bar.vue         # 不推荐
DailyExperience.ts       # 不推荐（非组件）
```

---

## 注释规范

### 文件头注释

```typescript
/**
 * 首页组件
 * 
 * 显示用户的健康数据概览，包括：
 * - 体重管理进度
 * - 饮食热量统计
 * - 各项健康记录
 * 
 * @author AI Assistant
 * @since 2024-08-28
 */
```

### 函数注释

```typescript
/**
 * 计算体重管理进度百分比
 * 
 * @param start - 初始体重（kg）
 * @param current - 当前体重（kg）
 * @param target - 目标体重（kg）
 * @returns 进度百分比（0-100）
 * 
 * @example
 * calculateProgress(70, 68, 65)  // 返回 40
 */
const calculateProgress = (
  start: number,
  current: number,
  target: number
): number => {
  if (start === target) return 0;
  const progress = ((start - current) / (start - target)) * 100;
  return Math.max(0, Math.min(100, progress));
};
```

### 行内注释

```typescript
// ✅ 推荐：解释"为什么"
const delay = 300;  // 防抖延迟，避免频繁触发

// ✅ 推荐：解释复杂逻辑
// 根据时间段返回不同的问候语
const hour = new Date().getHours();
const greeting = hour < 12 ? '早上好' : hour < 18 ? '下午好' : '晚上好';

// ❌ 避免：重复代码内容
const count = 0;  // 声明count变量并赋值为0  （废话）

// ❌ 避免：过时的注释
// TODO: 这个功能已经完成了，但注释没删除
const fetchData = () => { };
```

### TODO注释

```typescript
// TODO: 添加错误处理
// TODO(张三): 优化性能
// FIXME: 修复已知bug
// HACK: 临时方案，需要重构
// NOTE: 重要说明
```

---

## 最佳实践

### 1. 保持简单

```typescript
// ✅ 推荐：简单直接
const isAdult = age >= 18;

// ❌ 避免：过度复杂
const isAdult = age < 18 ? false : true;
```

### 2. 提早返回

```typescript
// ✅ 推荐：提早返回
const validateUser = (user: User) => {
  if (!user) return false;
  if (!user.name) return false;
  if (!user.email) return false;
  return true;
};

// ❌ 避免：嵌套地狱
const validateUser = (user: User) => {
  if (user) {
    if (user.name) {
      if (user.email) {
        return true;
      }
    }
  }
  return false;
};
```

### 3. 避免魔法数字

```typescript
// ✅ 推荐：使用常量
const MAX_RETRY_COUNT = 3;
const DEFAULT_TIMEOUT = 5000;

for (let i = 0; i < MAX_RETRY_COUNT; i++) {
  // ...
}

// ❌ 避免：直接使用数字
for (let i = 0; i < 3; i++) {  // 3是什么意思？
  // ...
}
```

### 4. 解构赋值

```typescript
// ✅ 推荐：使用解构
const { name, age, email } = user;
const [first, second] = items;

// ❌ 避免：重复访问
const name = user.name;
const age = user.age;
const email = user.email;
```

### 5. 模板字符串

```typescript
// ✅ 推荐：使用模板字符串
const message = `Hello, ${name}! You are ${age} years old.`;

// ❌ 避免：字符串拼接
const message = 'Hello, ' + name + '! You are ' + age + ' years old.';
```

---

## 代码审查清单

提交代码前，请检查：

- [ ] 代码符合本文档规范
- [ ] 没有console.log等调试代码
- [ ] 没有注释掉的代码
- [ ] 变量和函数命名清晰
- [ ] 有必要的注释
- [ ] 通过了所有测试
- [ ] 没有TypeScript错误
- [ ] 没有ESLint警告
- [ ] 代码格式化（Prettier）
- [ ] Git commit message符合规范

---

## 工具配置

### ESLint配置（推荐）

```json
{
  "extends": [
    "plugin:vue/vue3-recommended",
    "@vue/typescript/recommended"
  ],
  "rules": {
    "vue/multi-word-component-names": "off",
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
```

### Prettier配置（推荐）

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

---

## 参考资料

- [Vue 3 风格指南](https://cn.vuejs.org/style-guide/)
- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
- [Airbnb JavaScript风格指南](https://github.com/airbnb/javascript)
