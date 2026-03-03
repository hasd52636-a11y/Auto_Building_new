# AUTO-BUILDING 技能推送指南

## 推送命令

在 `Auto_Building_new` 目录下执行：

```bash
# 1. 初始化 Git（如果还没有）
git init

# 2. 添加所有文件
git add .

# 3. 提交
git commit -m "feat: 添加 AUTO-BUILDING 技能文件"

# 4. 重命名分支
git branch -M main

# 5. 添加远程仓库
git remote add origin https://github.com/hasd52636-a11y/Auto_Building_new.git

# 6. 推送
git push -u origin main
```

## 或者一步执行

```bash
cd Auto_Building_new
git init && git add . && git commit -m "feat: 添加 AUTO-BUILDING 技能文件" && git branch -M main && git remote add origin https://github.com/hasd52636-a11y/Auto_Building_new.git && git push -u origin main
```

## 推送后的使用方式

### 在 OpenCLAW 中使用

1. 技能会自动被识别
2. 用户可以说：`@Auto_Building 帮我做个新闻早报系统`

### 手动加载

```bash
npx skills add hasd52636-a11y/Auto_Building_new
```

## 文件结构

```
Auto_Building_new/
├── skill.yaml          # 技能定义（含 emoji 和 metadata）
├── prompt.md           # 详细 AI 指令
├── examples/           # 配置示例
│   ├── news-morning.json
│   ├── product-monitor.json
│   └── ecommerce.json
├── src/                # 源码
├── config/             # 配置文件
└── ...
```
