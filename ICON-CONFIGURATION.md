# 禾伴项目图标配置和生成指南

**更新时间**：2024-08-29 16:00  
**状态**：7个已有，1个待生成

---

## ✅ 已有图标（7个）

### 位置
- **源文件**：`assets/icon/`
- **使用位置**：`apps/mini/src/static/icons/watercolor/`

### 清单

| 图标 | 文件名 | 用途 | 状态 | 配置位置 |
|------|--------|------|------|----------|
| 💧 喝水 | water-drop.jpg | 喝水卡片 | ✅ 已配置 | HomePage - grid-item |
| 😊 心情 | mood-smile.jpg | 心情卡片 | ✅ 已配置 | HomePage - grid-item |
| 😴 睡眠 | sleep.jpg | 睡眠卡片 | ✅ 已配置 | HomePage - grid-item |
| 🏃 活动 | activity.jpg | 活动卡片 | ✅ 已配置 | HomePage - grid-item |
| ⏰ 轻断食 | fasting-clock.jpg | 轻断食卡片 | ✅ 已配置 | HomePage - fasting-card |
| 🩸 经期 | menstruation.jpg | 经期卡片 | ✅ 已配置 | HomePage - period-card |
| 💊 用药 | medication.jpg | 用药卡片 | ✅ 已配置 | HomePage - medication-card |

---

## ⬜ 待生成图标（1个）

### 血糖图标 (blood-sugar.jpg)

**用途**：血糖卡片装饰图标  
**优先级**：🔴 高  
**尺寸**：200x200px  
**风格**：治愈系水彩风格

#### 完整英文提示词（推荐）

```
A minimalist blood glucose meter icon in watercolor painting style, soft edges and gentle brushstrokes, simple rectangular device with small display screen showing numbers, light red and pink gradient colors (#dc6464, #ffb6b9), gentle water droplet element suggesting blood test, rounded corners and friendly design, healing Japanese aesthetic with medical warmth, soft pastel colors creating comforting atmosphere, subtle shadows and highlights, dreamy and calming feeling, white or transparent background, square format 200x200 pixels, suitable for mobile health app icon decoration, no text or letters
```

#### 完整中文提示词

```
血糖仪图标，水彩画风格，柔和的边缘和温柔的笔触，简洁的矩形设备带小显示屏显示数字，浅红色和粉色渐变（#dc6464到#ffb6b9），温柔的水滴元素暗示血液测试，圆角设计友好亲切，治愈系日式美学医疗但温暖，柔和的粉彩色调安慰性的氛围，微妙的阴影和高光，梦幻平静的感觉，白色或透明背景，正方形200x200像素，适合移动健康应用图标装饰，无文字或字母
```

#### 设计要点
- ✅ 矩形血糖仪外形
- ✅ 显示屏元素（可以是简单的矩形框）
- ✅ 红粉色系（#dc6464, #ffb6b9）
- ✅ 可选：小水滴元素
- ✅ 圆角、友好、温暖
- ✅ 水彩模糊边缘
- ❌ 不要包含文字

#### 配置位置
生成后放到：`apps/mini/src/static/icons/watercolor/blood-sugar.jpg`

然后在HomePage.vue中配置：
```vue
<!-- 6. 血糖卡片 -->
<view class="sugar-card card">
  <!-- ... -->
  <image class="sugar-icon-img" src="/static/icons/watercolor/blood-sugar.jpg" mode="aspectFit" />
</view>
```

---

## 🎨 图标风格规范

### 统一要求
- **尺寸**：200x200px（正方形）
- **风格**：水彩画、治愈系、日系
- **边缘**：柔和模糊
- **背景**：白色或透明
- **色调**：柔和粉彩色
- **质感**：梦幻、平静、温暖

### 使用规范
- **显示尺寸**：80rpx × 80rpx
- **透明度**：60% (opacity: 0.6)
- **圆角**：12rpx
- **位置**：卡片右下角

### 颜色方案

| 功能 | 主色调 | 渐变色 | 情感 |
|------|--------|--------|------|
| 喝水 | 蓝色 | #6495ed, #7fcc8f | 清凉、清新 |
| 心情 | 黄色 | #f4a460, #ffb884 | 温暖、快乐 |
| 睡眠 | 紫色 | #9370db, #b19cd9 | 安静、舒适 |
| 活动 | 橙色 | #ff8c42, #ffb884 | 活力、运动 |
| 轻断食 | 蓝绿 | #6495ed, #7fcc8f | 清淡、健康 |
| 血糖 | 红粉 | #dc6464, #ffb6b9 | 关注、医疗 |
| 经期 | 粉色 | #ffb6c1, #ffc0cb | 温柔、关怀 |
| 用药 | 蓝色 | #87ceeb, #b0c4de | 信任、医疗 |

---

## 📋 配置检查清单

### HomePage.vue中的图标配置

#### ✅ 已正确配置（6个）

1. **喝水卡片**
   ```vue
   <image class="grid-icon-img" src="/static/icons/watercolor/water-drop.jpg" mode="aspectFit" />
   ```

2. **心情卡片**
   ```vue
   <image class="grid-icon-img" src="/static/icons/watercolor/mood-smile.jpg" mode="aspectFit" />
   ```

3. **睡眠卡片**
   ```vue
   <image class="grid-icon-img" src="/static/icons/watercolor/sleep.jpg" mode="aspectFit" />
   ```

4. **活动卡片**
   ```vue
   <image class="grid-icon-img" src="/static/icons/watercolor/activity.jpg" mode="aspectFit" />
   ```

5. **轻断食卡片**
   ```vue
   <image class="fasting-icon-img" src="/static/icons/watercolor/fasting-clock.jpg" mode="aspectFit" />
   ```

6. **经期卡片**
   ```vue
   <image class="period-icon-img" src="/static/icons/watercolor/menstruation.jpg" mode="aspectFit" />
   ```

7. **用药卡片**
   ```vue
   <image class="medication-icon-img" src="/static/icons/watercolor/medication.jpg" mode="aspectFit" />
   ```

#### ⬜ 待配置（1个）

8. **血糖卡片**（图标生成后配置）
   ```vue
   <!-- 当前：注释掉emoji -->
   <!-- 生成后：添加image标签 -->
   <image class="sugar-icon-img" src="/static/icons/watercolor/blood-sugar.jpg" mode="aspectFit" />
   ```

---

## 🚀 生成和配置步骤

### 第1步：生成图标
1. 复制上面的**英文提示词**（推荐）
2. 在 GPT-image2 或其他AI图像生成工具中生成
3. 下载图片，命名为 `blood-sugar.jpg`

### 第2步：保存到项目
```bash
# 保存到源文件目录
cp blood-sugar.jpg /d/禾伴/heban-ai-health-demo/assets/icon/

# 复制到mini项目
cp blood-sugar.jpg /d/禾伴/heban-ai-health-demo/apps/mini/src/static/icons/watercolor/
```

### 第3步：配置到HomePage
在HomePage.vue中找到血糖卡片，添加：
```vue
<image class="sugar-icon-img" src="/static/icons/watercolor/blood-sugar.jpg" mode="aspectFit" />
```

同时添加对应样式（如果还没有）：
```css
.sugar-icon-img {
  position: absolute;
  bottom: 8rpx;
  right: 8rpx;
  width: 80rpx;
  height: 80rpx;
  opacity: 0.6;
  border-radius: 12rpx;
}
```

### 第4步：验证
1. 重新构建：`npx uni -p mp-weixin`
2. 打开微信开发者工具
3. 查看血糖卡片右下角是否显示图标

---

## 📝 备注

### Emoji保留位置
以下位置的emoji保留，因为它们用于按钮，且很直观：
- 早餐 🥚
- 午餐 🍔
- 晚餐 🍜
- 加餐 🍎
- 运动 👟

### 其他可选图标（未来扩展）
如果需要更多功能，可以生成：
- 体重秤 (scale-watercolor.jpg)
- 饮食 (meal-watercolor.jpg)
- 更多...

---

**文档创建**：2024-08-29 16:00  
**待生成**：1个（血糖图标）  
**完成度**：87.5% (7/8)

**生成血糖图标后，所有图标配置将100%完成！** 🎨
