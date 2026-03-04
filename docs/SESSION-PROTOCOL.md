# Session 交接协议 (Session Handoff Protocol)

**版本：** 1.0
**创建日期：** 2026-02-28

定义 Claude Code 会话的标准启动/结束流程，确保跨会话、跨成员的进度连续性。

---

## 1. Session 启动检查（必须执行）

每次启动新的 Claude Code 会话时，按以下顺序执行：

### Step 1: 定位当前位置

```
读取 docs/PROGRESS.md 顶部的 "Current Module Status" 区块
→ 确认：当前模块、当前步骤、阻塞项、上次 Session 日期
```

### Step 2: 确认全局进度

```
读取 docs/ROADMAP.md §6 进度跟踪
→ 确认：哪些模块已完成、当前阶段的整体进展
```

### Step 3: 加载纠偏意识

```
读取 docs/CORRECTIONS.md §1 模式速查表
→ 重点关注与当前模块相关的模式（如前端开发关注 P1、P2、P4）
```

### Step 4: 加载模块上下文（如继续未完成模块）

```
读取 docs/features/{domain}/{module}/ 下已有文档
→ 确认：哪些文档已完成，从 AGENT-PLAN 哪一步继续
```

### Step 5: 与用户对齐

```
向用户简要汇报：
- "当前项目处于 [阶段 X]，模块 [Y] 在 [Step Z]"
- "上次 Session 完成了 [...]，本次建议继续 [...]"
- 等待用户确认或调整方向
```

---

## 2. Session 结束更新（必须执行）

每次结束 Claude Code 会话前，完成以下更新：

### Step 1: 更新进度记录

```
编辑 docs/PROGRESS.md：
1. 更新顶部 "Current Module Status"（当前步骤、阻塞项、日期）
2. 在"进展记录"中新增本次 Session 条目，包含：
   - 日期 + Session 主题
   - 完成的工作内容
   - 影响的文件清单
```

### Step 2: 更新路线图（如有模块完成）

```
编辑 docs/ROADMAP.md：
- 将完成的模块状态从 ☐ 改为 ✅
- 更新 §6 进度跟踪表
```

### Step 3: 记录纠偏（如发现新模式）

```
如本次 Session 发现了新的问题模式：
1. 在 docs/CORRECTIONS.md §2 摘要表追加条目
2. 在 docs/CORRECTIONS-ARCHIVE.md 补充完整上下文
3. 评估是否需要更新相关 Skill 定义或 AGENT-PLAN 流程
```

### Step 4: 写 Tomorrow Anchor

```
在 PROGRESS.md 本次条目末尾写明：

### Next Steps
- **当前模块：** [模块名]
- **继续步骤：** AGENT-PLAN Step [N]
- **待确认事项：** [如有]
- **建议首先阅读的文件：** [列出 2-3 个关键文件路径]
```

---

## 3. 模块交接点（中途换人）

当一个模块的开发需要交给另一位同事继续时，除了执行 Session 结束更新外，还需额外记录：

### 交接清单

```markdown
## 模块交接记录 — [模块名]

### 当前状态
- AGENT-PLAN 步骤：Step [N]
- 文档完成度：requirements ✅ | user-stories ✅ | architecture ✅ | ux-design ☐ | ui-schema ☐

### 已完成的检查项
- [x] 需求已拆解，用户已确认
- [x] 架构设计已完成，包含 PostgreSQL Schema
- [ ] UX 设计未开始

### 未解决的问题
1. [问题描述 + 上下文]
2. [待用户确认的决策]

### 关键文件
- docs/features/{domain}/{module}/ — 模块文档
- frontend/src/features/{domain}/{module}/ — 前端代码（如已开始）

### 特殊注意事项
- [跨模块依赖、已知技术债务、用户偏好等]
```

交接记录作为 PROGRESS.md 中该 Session 条目的一部分。

---

## 4. 多人并行开发规则

> **完整团队协作规范见：** `TEAM-RULES.md`（行为准则）、`MODULE-ASSIGNMENTS.md`（认领表 + 共享文件协议 + PR 流程）

### 4.1 模块互斥

- 同一时间只有一人开发同一模块
- 开始前必须在 `MODULE-ASSIGNMENTS.md §2` 认领
- 认领后 3 个工作日内提交首个 PR，否则认领自动释放

### 4.2 共享文件修改协议

以下文件被多个模块共享，修改前必须 `git pull`：

| 文件 | 冲突风险 | 协议 |
|------|---------|------|
| `router.tsx` | 🔴 高 | 只新增自己模块区块，不重排已有路由 |
| `AppLayout.tsx` | 🔴 高 | 只新增自己模块菜单，不改其他模块 |
| `RequirementTag.tsx` | 🟡 中 | 只新增自己模块的 import + mapping |
| `zh-CN/index.ts` / `en-US/index.ts` | 🟡 中 | 只新增自己模块 namespace |
| `cross-module-erd.md` / `STANDARDS.md` | 🟢 低 | 只新增自己模块章节/术语 |

详细协议和冲突处理方法见 `MODULE-ASSIGNMENTS.md §3`。

### 4.3 Git 分支与 PR 流程

- **分支策略**：`main`（稳定）← PR ← `feature/<module-id>-<desc>`（开发）
- **禁止直接 push main**，所有变更通过 PR 合入
- **分层审批**：关键文档 PR → Roger approve；纯代码 PR → 任意团队成员互审
- 详细流程见 `MODULE-ASSIGNMENTS.md §4`

### 4.4 Progress 标注规则

- Session 日志标题**必须包含作者标注**：`### YYYY-MM-DD [姓名]（描述）`
- "Current Module Status" 表格每人维护自己的行
- "下次继续的起点" 每人维护自己的区块
- 修改 PROGRESS.md 前先 `git pull`，只改自己的区块

---

*创建时间：2026-02-28*
*最后更新：2026-03-04*
*版本：1.1*
