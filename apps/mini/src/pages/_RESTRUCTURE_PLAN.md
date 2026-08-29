# Pages 重组计划

## 当前结构（扁平化，混乱）
```
pages/
├── home/
├── food-recognition/
├── food-candidates/
├── food-confirm/
├── food-search/
├── profile/
├── profile-edit/
├── plan/
├── plan-setup/
├── records/
├── xuxu/
├── me/
├── onboarding/
├── bootstrap/
└── weekly-review/
```

## 目标结构（模块化）
```
pages/
├── home/                   # 首页模块
│   ├── index/
│   │   └── HomePage.vue
│   └── edit-cards/
│       └── EditCardsPage.vue
│
├── food/                   # 饮食模块 ✅ 立即重组
│   ├── recognition/
│   │   └── FoodRecognitionPage.vue
│   ├── candidates/
│   │   └── FoodCandidatesPage.vue
│   ├── confirm/
│   │   └── FoodConfirmPage.vue
│   └── search/
│       └── FoodSearchPage.vue
│
├── profile/                # 个人模块 ✅ 立即重组
│   ├── index/
│   │   └── ProfilePage.vue
│   └── edit/
│       └── ProfileEditPage.vue
│
├── plan/                   # 计划模块 ✅ 立即重组
│   ├── index/
│   │   └── PlanPage.vue
│   └── setup/
│       └── PlanSetupPage.vue
│
├── records/                # 记录模块（保持）
│   └── RecordsPage.vue
│
├── chat/                   # 聊天模块 ✅ 重命名
│   └── XuxuPage.vue
│
├── review/                 # 周报模块 ✅ 重命名
│   └── WeeklyReviewPage.vue
│
├── onboarding/             # 引导模块（保持）
│   └── OnboardingPage.vue
│
└── bootstrap/              # 启动模块（保持）
    └── BootstrapPage.vue
```

## 执行步骤

### 第1步：重组 food 模块
```bash
mkdir -p food/recognition food/candidates food/confirm food/search
mv food-recognition/* food/recognition/
mv food-candidates/* food/candidates/
mv food-confirm/* food/confirm/
mv food-search/* food/search/
rmdir food-recognition food-candidates food-confirm food-search
```

### 第2步：重组 profile 模块
```bash
mkdir -p profile/index profile/edit
mv profile/ProfilePage.vue profile/index/
mv profile-edit/* profile/edit/
rmdir profile-edit
```

### 第3步：重组 plan 模块
```bash
mkdir -p plan/index plan/setup
mv plan/PlanPage.vue plan/index/
mv plan-setup/* plan/setup/
rmdir plan-setup
```

### 第4步：重命名 me → chat（序序聊天）
```bash
# me 实际是个人中心，xuxu才是聊天
# 需要检查实际内容
```

### 第5步：更新路由配置
需要更新 `pages.json` 中的所有路径
