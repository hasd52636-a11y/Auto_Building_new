# AUTO-BUILDING 技能

## 用途

基于 AUTO-BUILDING 源码，根据用户需求生成定制化的信息采集管理系统。

## 源码位置

```
https://github.com/hasd52636-a11y/Auto_Building_new
```

## 内核功能（不可修改）

- 采集脚本：`scripts/scrape-all.ts`, `scripts/classify.ts`
- 审核流程：`pending-review.json` → `approved-resources.json`
- 展示页面：根据配置动态渲染栏目和分类

## 可配置内容（跟随用户需求）

### 1. 采集栏目 - `config/sources.json`

```json
{
  "primaryCategories": ["智能母体", "跨境电商", "新闻早报", ...]
}
```

用户需求示例：
- "新闻早报" → 添加栏目 "新闻早报"
- "产品监控" → 添加栏目 "产品监控"
- "行业资讯" → 添加栏目 "行业资讯"

### 2. 分类规则 - `config/sources.json`

```json
{
  "secondaryCategories": {
    "motherbody": ["agent", "skill", "mcp"],
    "新闻早报": ["科技", "财经", "体育"],
    "产品监控": ["竞品", "价格", "评论"]
  }
}
```

### 3. 数据源 - `config/sources.json`

```json
{
  "sources": [
    { "name": "36kr", "type": "rss", "url": "https://36kr.com/feed/", "enabled": true },
    { "name": "GitHub技能", "type": "github", "repo": "composiohq/awesome-claude-skills", "enabled": true }
  ]
}
```

### 4. 采集规则 - 用户自行添加

用户可以通过管理后台 `/admin` 的「采集规则」Tab 手动添加规则，或使用 AI 自然语言生成。

### 5. 前端展示 - `src/data/resources.ts`

修改硬编码的栏目和分类，供前端展示：

```typescript
export const PRIMARY_CATEGORIES = [
  '智能母体',
  '跨境电商',
  '新闻早报',    // 用户添加的栏目
  '产品监控',    // 用户添加的栏目
];

export const SECONDARY_CATEGORIES = [
  { labelKey: 'type.agent', value: 'agent' },
  { labelKey: 'type.skill', value: 'skill' },
  // 用户添加的分类
];
```

## 生成步骤

1. 拉取源码：`git clone https://github.com/hasd52636-a11y/Auto_Building_new`
2. 进入目录：`cd Auto_Building_new`
3. 修改 `config/sources.json`：
   - 修改 `primaryCategories` 添加用户想要的栏目
   - 修改 `secondaryCategories` 添加分类映射
   - 修改 `sources` 添加数据源
4. 修改 `src/data/resources.ts`：
   - 修改 `PRIMARY_CATEGORIES` 数组
   - 修改 `SECONDARY_CATEGORIES` 数组
5. 安装依赖：`npm install`
6. 启动服务：`npm run dev`
7. 访问管理后台：`http://localhost:3000/admin`
8. 在「采集规则」Tab 添加具体采集规则
9. 执行采集并在「审核」Tab 审核内容

## 示例

### 用户需求 1：新闻早报系统

> "帮我做个科技新闻早报，每天采集36kr和虎嗅的科技要闻"

**修改内容：**

`config/sources.json`:
```json
{
  "primaryCategories": ["智能母体", "跨境电商", "新闻早报"],
  "secondaryCategories": {
    "motherbody": ["agent", "skill", "mcp", "prompt", "opensource_soft"],
    "新闻早报": ["科技", "财经", "创投"]
  },
  "sources": [
    { "id": "36kr", "name": "36kr", "type": "rss", "url": "https://36kr.com/feed/", "enabled": true },
    { "id": "huxiu", "name": "虎嗅", "type": "rss", "url": "https://www.huxiu.com/rss", "enabled": true }
  ]
}
```

`src/data/resources.ts`:
```typescript
export const PRIMARY_CATEGORIES = [
  '智能母体',
  '跨境电商',
  '新闻早报'
];

export const SECONDARY_CATEGORIES = [
  { labelKey: 'type.agent', value: 'agent' },
  { labelKey: 'type.skill', value: 'skill' },
  { labelKey: 'type.mcp', value: 'mcp' },
  { labelKey: 'type.prompt', value: 'prompt' },
  { labelKey: 'type.opensource_soft', value: 'opensource_soft' },
  { labelKey: 'type.tech', value: 'tech' },
  { labelKey: 'type.finance', value: 'finance' },
  { labelKey: 'type.venture', value: 'venture' },
];
```

### 用户需求 2：产品监控

> "做个电商产品价格监控系统，监控亚马逊和淘宝"

**修改内容：**

`config/sources.json`:
```json
{
  "primaryCategories": ["智能母体", "产品监控"],
  "secondaryCategories": {
    "motherbody": ["agent", "skill", "mcp"],
    "产品监控": ["亚马逊", "淘宝", "京东"]
  },
  "sources": [
    { "id": "amazon", "name": "亚马逊", "type": "custom", "url": "https://amazon.com", "enabled": true },
    { "id": "taobao", "name": "淘宝", "type": "custom", "url": "https://taobao.com", "enabled": true }
  ]
}
```

## 注意事项

1. **只修改配置文件**，不要修改采集脚本和页面逻辑
2. **数据源类型**支持：`directory`(目录网站)、`github`(GitHub仓库)、`custom`(自定义URL)、`rss`(RSS订阅)
3. **采集规则**通过管理后台添加，不在源码中硬编码
4. **运行后**需要执行采集任务：`npm run daily`
5. **审核内容**在 `/admin` 的「审核」Tab 完成
