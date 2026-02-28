# Skills 目录说明

本目录管理项目中各 Agent 使用的 Skill 定义文件。
每个 Skill 文件包含 Prompt 模板和流程定义，指导 Agent 执行特定任务。

详细的 Agent 架构和 Skill 规范见 [AGENT-PLAN.md](../AGENT-PLAN.md)。

---

## 目录结构

```
skills/
├── analysis/                          # 需求分析类
│   ├── requirement-decomposition.md   # 需求拆解
│   ├── user-story-writing.md          # User Story 编写
│   └── glossary-management.md         # 术语表维护
│
├── architecture/                      # 架构设计类
│   ├── data-model-design.md           # 综合架构设计（数据模型 + API + 权限 + 约束）
│   └── workflow-design.md             # 业务流程设计（复杂流程模块按需）
│
├── ui/                                # UI 设计类
│   ├── ux-design.md                   # 用户体验设计
│   ├── ui-schema-design.md            # UI Schema 编写
│   ├── page-layout-design.md          # 页面布局设计
│   └── component-specification.md     # 组件规格定义
│
├── frontend/                          # 前端工程类
│   ├── react-component-development.md # React 组件开发
│   ├── i18n-integration.md            # 国际化集成
│   ├── mock-data-creation.md          # 模拟数据创建
│   └── chart-visualization.md         # 图表可视化实现
│
├── backend/                           # 后端工程类
│   ├── api-implementation.md          # API 实现
│   ├── database-migration.md          # 数据库迁移
│   └── business-logic.md              # 业务逻辑实现
│
└── quality/                           # 质量保障类
    ├── code-review.md                 # 代码审查
    ├── test-writing.md                # 测试编写
    └── accessibility-check.md         # 可访问性检查
```

## Skill 文件格式

每个 Skill 文件遵循统一格式，包含：

1. **元信息** — Skill ID、所属 Agent、输入/输出、依赖
2. **流程定义** — 分步骤的操作说明
3. **Prompt 模板** — Agent 执行时使用的 Prompt（含变量占位符）
4. **输出格式** — 产出物的格式规范和示例
5. **检查清单** — 完成后的自检项

## 创建优先级

| 优先级 | Skill 文件 | 状态 |
|--------|-----------|------|
| P0 | analysis/requirement-decomposition.md | ✅ 已创建 |
| P0 | analysis/user-story-writing.md | ✅ 已创建 |
| P0 | architecture/data-model-design.md | ✅ 已创建（v1.1，含实体三问 + 聚合接口分析） |
| P0 | ui/ux-design.md | ✅ 已创建 |
| P0 | ui/ui-schema-design.md | ✅ 已创建 |
| P0 | ui/ui-eval.md | ✅ 已创建 |
| P1 | frontend/react-component-development.md | ✅ 已创建（含 Import 规范、状态管理、Ant Design 模式、交互规则） |
| P1 | frontend/mock-data-creation.md | ✅ 已创建（含生命周期覆盖、数据质量验证、常见错误防范） |
| P1 | frontend/i18n-integration.md | ✅ 已创建（含键命名规范、状态标签处理、完整性验证） |
| P2 | architecture/workflow-design.md | ☐ 待创建 |
| P2 | frontend/chart-visualization.md | ☐ 待创建 |
| P3 | 其余 Skills | ☐ 按需创建 |

---

*创建时间：2026-02-07*
*最后更新：2026-02-28*
