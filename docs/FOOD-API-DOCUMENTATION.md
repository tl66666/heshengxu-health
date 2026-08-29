# 食物库 API 文档

> 和生序健康管理系统 - 食物库模块 API

**版本**：v1.0  
**更新时间**：2026-08-29

---

## 📋 概述

食物库 API 提供了完整的食物搜索、分类浏览、营养信息查询等功能。

### 基础信息

- **Base URL**: `https://api.yourapp.com/v1`
- **认证方式**: Bearer Token（通过 `Authorization` 请求头传递）
- **响应格式**: JSON

### 通用响应结构

```json
{
  "data": {},
  "meta": {
    "requestId": "req_xxxxx"
  }
}
```

---

## 🔍 搜索接口

### 1. 搜索食物

搜索食物，支持多种筛选条件。

**请求**

```http
GET /foods/search
```

**查询参数**

| 参数 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| `q` | string | 否 | 搜索关键词（名称或拼音） | `米饭` 或 `mifan` |
| `categoryId` | string | 否 | 分类ID | `cat_xxxxx` |
| `healthLight` | number | 否 | 健康等级（0=红灯, 1=绿灯, 2=黄灯） | `1` |
| `page` | number | 否 | 页码（默认1） | `1` |
| `pageSize` | number | 否 | 每页数量（默认20） | `20` |

**响应示例**

```json
{
  "data": {
    "items": [
      {
        "id": "food_xxxxx",
        "name": "米饭",
        "pinyinCode": "mifan_zheng",
        "thumbImageUrl": null,
        "isLiquid": false,
        "healthLight": 1,
        "category": {
          "id": "cat_xxxxx",
          "name": "主食类",
          "slug": "staple"
        },
        "nutrition": {
          "id": "nutr_xxxxx",
          "basisGrams": 100,
          "energyKcal": 116,
          "proteinG": 2.6,
          "fatG": 0.3,
          "carbohydrateG": 25.9,
          "dietaryFiberG": 0.3,
          "sodiumMg": 2.5
          // ... 更多营养素
        },
        "servings": [
          {
            "id": "serv_xxxxx",
            "label": "1小碗",
            "grams": 100
          }
        ]
      }
    ],
    "total": 1523,
    "page": 1,
    "pageSize": 20,
    "totalPages": 77
  },
  "meta": {
    "requestId": "req_xxxxx"
  }
}
```

**示例请求**

```bash
# 搜索"鸡胸肉"
curl -X GET "https://api.yourapp.com/v1/foods/search?q=鸡胸肉" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 搜索主食类的绿灯食物
curl -X GET "https://api.yourapp.com/v1/foods/search?categoryId=cat_staple&healthLight=1" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 拼音搜索
curl -X GET "https://api.yourapp.com/v1/foods/search?q=jixiongrou" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📝 详情接口

### 2. 获取食物详情

获取单个食物的详细信息。

**请求**

```http
GET /foods/:foodId
```

**路径参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| `foodId` | string | 食物ID |

**响应示例**

```json
{
  "data": {
    "id": "food_xxxxx",
    "name": "鸡胸肉",
    "pinyinCode": "jixiongrou",
    "thumbImageUrl": null,
    "isLiquid": false,
    "healthLight": 1,
    "category": {
      "id": "cat_xxxxx",
      "name": "肉蛋类",
      "slug": "meat-egg"
    },
    "nutrition": {
      "id": "nutr_xxxxx",
      "basisGrams": 100,
      "energyKcal": 133,
      "proteinG": 19.4,
      "fatG": 5.0,
      "carbohydrateG": 2.5,
      "dietaryFiberG": 0,
      "sodiumMg": 63.3,
      "vitaminAUg": 9,
      "thiamineMg": 0.05,
      "riboflavinMg": 0.11,
      "vitaminCMg": 1,
      "vitaminEMg": 0.67,
      "niacinMg": 10.9,
      "folateMcg": 6.8,
      "calciumMg": 9,
      "ironMg": 0.7,
      "potassiumMg": 251,
      "zincMg": 0.9,
      "seleniumUg": 11.75,
      "magnesiumMg": 19,
      "copperMg": 0.04,
      "manganeseMg": 0.01,
      "phosphorusMg": 156,
      "cholesterolMg": 66,
      "saturatedFatG": 1.4,
      "gi": null,
      "gl": null
    },
    "servings": [
      {
        "id": "serv_xxxxx",
        "label": "1小块",
        "grams": 100
      },
      {
        "id": "serv_yyyyy",
        "label": "1大块",
        "grams": 150
      }
    ],
    "aliases": []
  },
  "meta": {
    "requestId": "req_xxxxx"
  }
}
```

---

## 🗂️ 分类接口

### 3. 获取所有分类

获取所有食物分类列表。

**请求**

```http
GET /foods/categories/list
```

**响应示例**

```json
{
  "data": [
    {
      "id": "cat_xxxxx",
      "name": "主食类",
      "slug": "staple",
      "sortOrder": 1,
      "createdAt": "2026-08-29T10:00:00.000Z",
      "updatedAt": "2026-08-29T10:00:00.000Z"
    },
    {
      "id": "cat_yyyyy",
      "name": "肉蛋类",
      "slug": "meat-egg",
      "sortOrder": 2,
      "createdAt": "2026-08-29T10:00:00.000Z",
      "updatedAt": "2026-08-29T10:00:00.000Z"
    }
    // ... 更多分类
  ],
  "meta": {
    "requestId": "req_xxxxx"
  }
}
```

### 4. 获取分类统计

获取各分类下的食物数量统计。

**请求**

```http
GET /foods/categories/stats
```

**响应示例**

```json
{
  "data": [
    {
      "id": "cat_xxxxx",
      "name": "主食类",
      "slug": "staple",
      "sortOrder": 1,
      "count": 245,
      "createdAt": "2026-08-29T10:00:00.000Z",
      "updatedAt": "2026-08-29T10:00:00.000Z"
    },
    {
      "id": "cat_yyyyy",
      "name": "肉蛋类",
      "slug": "meat-egg",
      "sortOrder": 2,
      "count": 389,
      "createdAt": "2026-08-29T10:00:00.000Z",
      "updatedAt": "2026-08-29T10:00:00.000Z"
    }
    // ... 更多分类
  ],
  "meta": {
    "requestId": "req_xxxxx"
  }
}
```

---

## ⭐ 推荐接口

### 5. 获取热门食物

获取热门食物列表（基于健康等级）。

**请求**

```http
GET /foods/popular/list?limit=10
```

**查询参数**

| 参数 | 类型 | 必填 | 说明 | 默认值 |
|------|------|------|------|--------|
| `limit` | number | 否 | 返回数量 | 10 |

**响应示例**

```json
{
  "data": [
    {
      "id": "food_xxxxx",
      "name": "西兰花",
      "healthLight": 1,
      "category": { ... },
      "nutrition": { ... },
      "servings": [ ... ]
    }
    // ... 更多食物
  ],
  "meta": {
    "requestId": "req_xxxxx"
  }
}
```

### 6. 获取推荐食物

获取推荐食物列表（高蛋白、健康食物）。

**请求**

```http
GET /foods/recommended/list?limit=10
```

**查询参数**

| 参数 | 类型 | 必填 | 说明 | 默认值 |
|------|------|------|------|--------|
| `limit` | number | 否 | 返回数量 | 10 |

**响应示例**

```json
{
  "data": [
    {
      "id": "food_xxxxx",
      "name": "鸡胸肉",
      "healthLight": 1,
      "category": { ... },
      "nutrition": {
        "proteinG": 19.4,
        // ... 高蛋白食物
      },
      "servings": [ ... ]
    }
    // ... 更多食物
  ],
  "meta": {
    "requestId": "req_xxxxx"
  }
}
```

---

## 📊 数据模型

### FoodItem（食物项）

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | 食物ID |
| `name` | string | 食物名称 |
| `pinyinCode` | string | 拼音代码（用于搜索） |
| `thumbImageUrl` | string | 缩略图URL |
| `isLiquid` | boolean | 是否液体 |
| `healthLight` | number | 健康等级（0=红灯, 1=绿灯, 2=黄灯） |
| `isActive` | boolean | 是否激活 |
| `categoryId` | string | 分类ID |
| `category` | object | 分类对象 |
| `nutrition` | object | 营养信息 |
| `servings` | array | 常见份量列表 |
| `aliases` | array | 别名列表 |

### FoodNutrition（营养信息）

基于每 100g 计算。

| 字段 | 类型 | 单位 | 说明 |
|------|------|------|------|
| `basisGrams` | number | g | 基准重量 |
| `energyKcal` | number | kcal | 能量 |
| `proteinG` | number | g | 蛋白质 |
| `fatG` | number | g | 脂肪 |
| `carbohydrateG` | number | g | 碳水化合物 |
| `dietaryFiberG` | number | g | 膳食纤维 |
| `sodiumMg` | number | mg | 钠 |
| `vitaminAUg` | number | μg | 维生素A |
| `thiamineMg` | number | mg | 维生素B1 |
| `riboflavinMg` | number | mg | 维生素B2 |
| `vitaminB6Mg` | number | mg | 维生素B6 |
| `vitaminCMg` | number | mg | 维生素C |
| `vitaminEMg` | number | mg | 维生素E |
| `niacinMg` | number | mg | 烟酸 |
| `folateMcg` | number | μg | 叶酸 |
| `calciumMg` | number | mg | 钙 |
| `ironMg` | number | mg | 铁 |
| `potassiumMg` | number | mg | 钾 |
| `zincMg` | number | mg | 锌 |
| `seleniumUg` | number | μg | 硒 |
| `magnesiumMg` | number | mg | 镁 |
| `copperMg` | number | mg | 铜 |
| `manganeseMg` | number | mg | 锰 |
| `phosphorusMg` | number | mg | 磷 |
| `cholesterolMg` | number | mg | 胆固醇 |
| `saturatedFatG` | number | g | 饱和脂肪 |
| `sugarG` | number | g | 糖 |
| `gi` | number | - | 血糖生成指数 |
| `gl` | number | - | 血糖负荷 |

### FoodServing（常见份量）

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | 份量ID |
| `label` | string | 份量标签（如"1小碗"） |
| `grams` | number | 对应克数 |

### FoodCategory（分类）

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | 分类ID |
| `name` | string | 分类名称 |
| `slug` | string | URL友好标识 |
| `sortOrder` | number | 排序 |

---

## 💡 使用示例

### 完整搜索流程

```javascript
// 1. 获取分类列表
const categories = await fetch('/foods/categories/list', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
}).then(r => r.json());

// 2. 搜索主食类食物
const results = await fetch('/foods/search?categoryId=cat_staple&page=1', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
}).then(r => r.json());

// 3. 获取食物详情
const foodDetail = await fetch(`/foods/${results.data.items[0].id}`, {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
}).then(r => r.json());

// 4. 计算营养（150g）
const serving = foodDetail.data.servings.find(s => s.grams === 150);
const nutrition = foodDetail.data.nutrition;
const calories = (nutrition.energyKcal / 100) * 150; // 174 kcal
```

---

## 🔐 认证

所有接口需要在请求头中携带认证令牌：

```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

## ⚠️ 错误码

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权（Token无效或过期） |
| 404 | 资源不存在 |
| 500 | 服务器错误 |

**错误响应示例**

```json
{
  "error": {
    "code": "FOOD_NOT_FOUND",
    "message": "食物不存在或暂未完善"
  },
  "meta": {
    "requestId": "req_xxxxx"
  }
}
```

---

## 📈 性能说明

- 搜索接口默认返回 20 条，最大支持 100 条/页
- 建议客户端实现搜索防抖（300ms）
- 数据库已建立索引，搜索响应时间 < 100ms
- 支持多种筛选条件组合

---

## 🚀 更新日志

### v1.0 (2026-08-29)

- ✅ 初始版本
- ✅ 搜索功能（名称+拼音）
- ✅ 分类筛选
- ✅ 健康等级筛选
- ✅ 分页支持
- ✅ 分类统计
- ✅ 推荐食物

---

**文档维护者**：开发团队  
**最后更新**：2026-08-29
