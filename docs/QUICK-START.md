# 新 AI 开发者快速入门指南

> 5分钟快速了解项目，10分钟开始开发

---

## 🚀 快速开始（5分钟）

### 1. 了解项目

**项目名称**：禾伴 AI 健康管理小程序  
**核心理念**：治愈系、陪伴式健康管理  
**AI 助手**：序序（Xuxu）  
**设计风格**：日系清新水彩风

### 2. 项目结构

```
heban-ai-health-demo/
├── apps/mini/                 # 👈 你主要工作的地方
│   └── src/
│       ├── pages/             # 页面
│       │   ├── home/         # 首页（当前重点）
│       │   ├── chat/         # 聊天
│       │   ├── records/      # 记录
│       │   └── ...
│       ├── components/        # 组件
│       ├── static/           # 静态资源
│       └── features/         # 功能模块
├── docs/                     # 📚 文档（你现在看的）
└── assets/                   # 待配置资源
```

### 3. 关键文件

| 文件 | 作用 | 优先级 |
|------|------|--------|
| `apps/mini/src/pages/home/HomePage.vue` | 首页主文件 | 🔴 高 |
| `docs/AI-HANDOFF-HomePage.md` | 首页开发文档 | 🔴 高 |
| `docs/CODE-STANDARDS.md` | 代码规范 | 🟡 中 |
| `README.md` | 项目说明 | 🟡 中 |

---

## 💻 本地开发（10分钟）

### Step 1: 安装依赖

```bash
cd D:\禾伴\heban-ai-health-demo
pnpm install
```

### Step 2: 启动开发服务器

```bash
cd apps/mini
npx uni -p mp-weixin
```

等待编译完成（约60-90秒）

### Step 3: 打开微信开发者工具

1. 打开微信开发者工具
2. 导入项目
3. 选择目录：`D:\禾伴\heban-ai-health-demo\apps\mini\dist\dev\mp-weixin`
4. AppID：测试号即可

### Step 4: 查看效果

在微信开发者工具中应该能看到首页，包括：
- 体重管理卡片（半圆进度条）
- 饮食热量卡片
- 功能卡片（喝水、睡眠、活动、心情）
- 等等

---

## 📖 必读文档（按顺序）

### 1. 先读这个（5分钟）
👉 **本文档** - 快速入门

### 2. 再读这个（15分钟）
👉 `docs/AI-HANDOFF-HomePage.md` - 首页开发现状与规范
- 已完成功能
- 待开发功能
- 设计规范
- 开发流程

### 3. 然后看这个（10分钟）
👉 `docs/CODE-STANDARDS.md` - 代码规范
- Vue 组件规范
- TypeScript 规范
- 样式规范
- 命名规范

### 4. 最后浏览一下（5分钟）
👉 项目根目录 `README.md` - 项目整体说明

---

## 🎯 当前任务

### 优先级 🔴 高：编辑首页卡片功能

**文件路径**：`apps/mini/src/pages/home/edit-cards.vue`（待创建）

**参考**：
- 薄荷健康图3、图4（在项目讨论中）
- `docs/AI-HANDOFF-HomePage.md` 中的详细设计

**功能**：
- 显示/隐藏卡片
- 拖拽排序
- 保存设置
- 持久化存储

**完成标准**：
1. 页面可以打开
2. 可以添加/删除卡片
3. 可以调整卡片顺序
4. 点击保存后，首页按新顺序显示
5. 重新打开小程序，配置保留

---

## 🎨 设计规范速查

### 颜色（最常用）

```css
/* 主色 */
--primary-green: #7fcc8f;
--primary-green-dark: #2d6943;

/* 背景 */
--bg-card: #ffffff;

/* 文字 */
--text-primary: #2d6943;
--text-hint: #9ba8a0;
```

### 尺寸（最常用）

```css
/* 卡片 */
padding: 20rpx 24rpx;
border-radius: 24rpx;
margin-bottom: 16rpx;

/* 字号 */
--font-title: 26rpx;
--font-body: 22rpx;
--font-number: 64rpx;
```

### 图标（最常用）

```css
/* 装饰图标（卡片右下角） */
width: 80rpx;
height: 80rpx;
opacity: 0.6;
```

---

## 🔧 常用命令

```bash
# 开发
cd apps/mini
npx uni -p mp-weixin

# 测试
npx vitest run

# 测试首页
npx vitest run src/pages/home/*.spec.ts

# 构建
npx uni build -p mp-weixin
```

---

## 📝 工作流程

### 1. 接手任务

```bash
# 拉取最新代码
git pull

# 查看当前分支
git branch

# 创建功能分支（如果需要）
git checkout -b feat/edit-cards
```

### 2. 开发

```bash
# 启动开发服务器
cd apps/mini
npx uni -p mp-weixin

# 修改代码
# 保存后自动编译
# 微信开发者工具中查看效果
```

### 3. 测试

```bash
# 运行测试
npx vitest run

# 手动测试
# 在微信开发者工具中测试所有功能
```

### 4. 提交

```bash
# 查看修改
git status
git diff

# 添加文件
git add apps/mini/src/pages/home/edit-cards.vue

# 提交
git commit -m "feat: add edit cards page"

# 推送
git push
```

### 5. 更新文档

修改 `docs/AI-HANDOFF-HomePage.md`：
- 更新"已完成功能"
- 添加"更新日志"
- 更新提交记录

---

## ❓ 常见问题速查

### Q: 页面空白？
**A**: 清除微信开发者工具缓存，重新编译

### Q: 图标不显示？
**A**: 检查路径 `/static/icons/xxx.jpg` 和文件是否存在

### Q: SVG不显示？
**A**: 只能用内联SVG，不能用`<image>`引用

### Q: 修改后不生效？
**A**: 
1. 确认保存了文件
2. 微信开发者工具点击"编译"
3. 如果还不行，清除缓存

### Q: 颜色/尺寸用什么？
**A**: 查看 `docs/AI-HANDOFF-HomePage.md` 设计规范部分

---

## 📚 代码示例

### 创建新卡片

```vue
<template>
  <view class="my-card card">
    <view class="card-top">
      <text class="card-title">标题</text>
      <button class="add-btn" @tap="handleAdd">+</button>
    </view>
    <view class="card-content">
      <text class="data-num">{{ count }}</text>
      <text class="data-unit">单位</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const count = ref(0);

const handleAdd = () => {
  count.value++;
};
</script>

<style scoped>
.my-card {
  /* 继承 .card 的基础样式 */
}

.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.card-title {
  color: #2d6943;
  font-size: 26rpx;
  font-weight: 800;
}

.data-num {
  color: #2d6943;
  font-size: 40rpx;
  font-weight: 900;
}

.data-unit {
  color: #76907d;
  font-size: 22rpx;
}
</style>
```

### 跳转页面

```typescript
// 跳转到记录页
const go = (url: string) => {
  uni.navigateTo({ url });
};

go('/pages/records/RecordsPage?type=water');
```

### 获取存储数据

```typescript
// 保存
uni.setStorageSync('key', value);

// 读取
const value = uni.getStorageSync('key');

// 删除
uni.removeStorageSync('key');
```

---

## 🎯 下一步行动

### 立即行动（今天）

1. ✅ 阅读本文档（你已经在读了）
2. ⬜ 阅读 `docs/AI-HANDOFF-HomePage.md`
3. ⬜ 本地运行项目
4. ⬜ 浏览首页代码 `apps/mini/src/pages/home/HomePage.vue`

### 短期目标（本周）

1. ⬜ 完成编辑首页卡片功能
2. ⬜ 测试所有功能
3. ⬜ 提交代码
4. ⬜ 更新文档

### 长期目标（下周）

1. ⬜ 添加更多可选卡片
2. ⬜ 优化交互体验
3. ⬜ 性能优化

---

## 📞 获取帮助

### 问题解决顺序

1. **查文档**
   - `docs/AI-HANDOFF-HomePage.md`
   - `docs/CODE-STANDARDS.md`
   - 项目 `README.md`

2. **看代码**
   - 查看现有类似功能的实现
   - 参考其他页面的写法

3. **搜索**
   - Vue 3 文档
   - UniApp 文档
   - 微信小程序文档

4. **提问**
   - 在交接讨论中提问
   - 说明问题现象、已尝试的方法

---

## ✅ 验收标准

### 代码质量

- [ ] 符合代码规范
- [ ] 有必要的注释
- [ ] 通过所有测试
- [ ] 没有TypeScript错误
- [ ] 没有console.log等调试代码

### 功能完整

- [ ] 实现所有要求的功能
- [ ] 交互流畅
- [ ] 无明显bug
- [ ] 边界情况处理正确

### 设计一致

- [ ] 符合治愈系风格
- [ ] 颜色使用正确
- [ ] 尺寸间距统一
- [ ] 动画流畅自然

### 文档完善

- [ ] 更新 `AI-HANDOFF-HomePage.md`
- [ ] 添加必要的代码注释
- [ ] commit message 规范

---

## 🎉 欢迎加入

现在你已经准备好开始开发了！

**记住**：
- 📖 遇到问题先查文档
- 💻 多看现有代码
- 🎨 遵循设计规范
- ✅ 提交前自查清单

**祝你开发愉快！** 🚀

---

**最后更新**：2024-08-28  
**维护者**：AI Team
