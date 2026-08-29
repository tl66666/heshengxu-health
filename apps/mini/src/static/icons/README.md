# 图标资源使用说明

> 静态图标的组织和使用规范

**路径**：`apps/mini/src/static/icons/`  
**更新时间**：2024-08-28 19:30

---

## 📁 目录结构

```
icons/
├── svg/                    # SVG 矢量图标
│   ├── activity.svg       # 活动
│   ├── back.svg          # 返回
│   ├── camera.svg        # 相机
│   ├── check.svg         # 勾选
│   ├── close.svg         # 关闭
│   ├── forward.svg       # 前进
│   ├── home.svg          # 首页
│   ├── journal.svg       # 日记
│   ├── meal.svg          # 饮食
│   ├── mic.svg           # 麦克风
│   ├── plan.svg          # 计划
│   ├── profile.svg       # 个人
│   ├── review.svg        # 回顾
│   ├── scale.svg         # 体重秤
│   ├── search.svg        # 搜索
│   ├── send.svg          # 发送
│   └── sleep.svg         # 睡眠
│
└── watercolor/            # 水彩风格图标（JPG/PNG）
    ├── activity.jpg      # 活动（80rpx）
    ├── mood-smile.jpg    # 心情（80rpx）
    ├── sleep.jpg         # 睡眠（80rpx）
    └── water-drop.jpg    # 喝水（80rpx）
```

---

## 🎨 图标分类

### 1. SVG 图标

**特点**：
- 矢量图形，无损缩放
- 文件小，加载快
- 适合单色、简单图标

**用途**：
- 导航图标
- 操作按钮
- 系统图标

**使用方式**：
```vue
<image src="/static/icons/svg/home.svg" mode="aspectFit" />
```

---

### 2. 水彩风格图标

**特点**：
- 治愈系水彩风格
- JPG 格式，有渐变色
- 适合装饰性图标

**用途**：
- 首页功能卡片装饰
- 记录类型图标
- 情绪表达图标

**使用方式**：
```vue
<image 
  class="watercolor-icon" 
  src="/static/icons/watercolor/water-drop.jpg" 
  mode="aspectFit" 
/>

<style>
.watercolor-icon {
  width: 80rpx;
  height: 80rpx;
  opacity: 0.6;
  border-radius: 12rpx;
}
</style>
```

---

## 📝 命名规范

### SVG 图标
- 使用 kebab-case
- 描述性命名
- 例如：`back.svg`, `home.svg`, `search.svg`

### 水彩图标
- 使用 kebab-case
- 与功能对应
- 例如：`water-drop.jpg`, `mood-smile.jpg`

---

## ✅ 已有图标清单

### SVG 图标（17个）

| 图标 | 文件名 | 用途 | 使用页面 |
|------|--------|------|---------|
| 返回 | back.svg | 导航返回 | AppNavBar |
| 关闭 | close.svg | 关闭弹窗 | AppNavBar |
| 前进 | forward.svg | 提示引导 | XuxuHint |
| 首页 | home.svg | Tab栏 | MiniTabBar |
| 日记 | journal.svg | Tab栏 | MiniTabBar |
| 计划 | plan.svg | Tab栏 | MiniTabBar |
| 个人 | profile.svg | Tab栏 | MiniTabBar |
| 活动 | activity.svg | 功能图标 | - |
| 相机 | camera.svg | 拍照 | - |
| 勾选 | check.svg | 选择 | - |
| 饮食 | meal.svg | 饮食记录 | - |
| 麦克风 | mic.svg | 语音输入 | XuxuChatComposer |
| 回顾 | review.svg | 周报 | - |
| 体重秤 | scale.svg | 体重记录 | HomePage |
| 搜索 | search.svg | 搜索 | - |
| 发送 | send.svg | 发送消息 | XuxuChatComposer |
| 睡眠 | sleep.svg | 睡眠记录 | - |

### 水彩图标（4个）

| 图标 | 文件名 | 尺寸 | 用途 | 使用页面 |
|------|--------|------|------|---------|
| 喝水 | water-drop.jpg | 200x200px | 喝水卡片 | HomePage |
| 睡眠 | sleep.jpg | 200x200px | 睡眠卡片 | HomePage |
| 活动 | activity.jpg | 200x200px | 活动卡片 | HomePage |
| 心情 | mood-smile.jpg | 200x200px | 心情卡片 | HomePage |

---

## 🎯 待生成图标

根据 [IMAGE-RESOURCES-PLAN.md](../../../../IMAGE-RESOURCES-PLAN.md)：

### 优先级 🔴 高

1. **轻断食时钟**（fasting-clock.jpg）
   - 尺寸：200x200px
   - 风格：水彩风格，蓝色调
   - 用途：首页轻断食卡片

2. **血糖仪**（blood-sugar.jpg）
   - 尺寸：200x200px
   - 风格：水彩风格，红/粉色调
   - 用途：首页血糖卡片

### 优先级 🟡 中

3. **生理期**（menstruation.jpg）
   - 尺寸：200x200px
   - 风格：水彩风格，粉色调
   - 用途：可选卡片

4. **用药**（medication.jpg）
   - 尺寸：200x200px
   - 风格：水彩风格，绿色调
   - 用途：可选卡片

---

## 🔧 添加新图标

### 步骤

1. **准备图标文件**
   - SVG：确保是干净的矢量文件
   - 水彩：200x200px，JPG格式

2. **放入对应目录**
   ```bash
   # SVG 图标
   cp new-icon.svg apps/mini/src/static/icons/svg/
   
   # 水彩图标
   cp new-icon.jpg apps/mini/src/static/icons/watercolor/
   ```

3. **在页面中使用**
   ```vue
   <image src="/static/icons/svg/new-icon.svg" mode="aspectFit" />
   ```

4. **更新本文档**
   - 添加到图标清单
   - 说明用途

---

## 📚 相关文档

- [IMAGE-RESOURCES-PLAN.md](../../../../IMAGE-RESOURCES-PLAN.md) - 图标生成计划
- [Components 说明](../../components/README.md) - 组件中的图标使用

---

**维护者**：Design Team  
**最后更新**：2024-08-28 19:30
