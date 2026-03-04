# Skill: 数据库迁移

## 元信息

- **Skill ID:** `database-migration`
- **所属 Agent:** 后端工程 Agent (Agent 6)
- **版本：** 1.0（从 AGENT-PLAN v1.9 提取）
- **输入：** `architecture.md`（§MySQL 8.0 Schema 草案）、`cross-module-erd.md`
- **输出：** SQLAlchemy Models、Flask-Migrate 迁移文件
- **依赖：** 无（流程第一步）

---

## BE Step 2：SQLAlchemy Models

```
→ 以 architecture.md §MySQL 8.0 Schema 为唯一真相来源创建 Models
→ 遵循 STANDARDS §8.3 Model 规范（审计字段、软删除、关系显式声明）
→ 执行 flask db migrate -m "<描述>" 生成迁移文件
→ 执行 flask db upgrade 验证迁移无误
→ 输出：backend/app/models/{module}.py + migrations/versions/{ts}_{desc}.py
```

---

## STANDARDS §8.3 Model 规范要点

- **审计字段**：`created_at`、`updated_at`（`onupdate=func.now()`）、`created_by`
- **软删除**：`is_deleted` Boolean + `deleted_at` DateTime（不物理删除）
- **关系声明**：所有外键关系使用 `relationship()` 显式声明，`lazy='select'`
- **ENUM 类型**：使用 `db.Enum(PythonEnum)` 与 Python 枚举保持同步

---

## 特别注意事项

1. **device-ledger 类型核验**：该模块 architecture.md 为事后补创，实现时必须对比前端 `types.ts` 逐字段核验一致性
2. **时序数据策略**：`EquipmentMonitoringLog` 是时序数据，需在后端初始化时确定存储策略（MySQL 分区表 / 分区归档）

---

## 检查清单

- [ ] Model 字段与 architecture.md §DB Schema 一一对应（含类型、约束）
- [ ] 审计字段齐全（created_at / updated_at / created_by）
- [ ] 软删除字段已添加（is_deleted / deleted_at）
- [ ] 所有关系已显式声明（relationship()）
- [ ] `flask db migrate` 执行无报错
- [ ] `flask db upgrade` 执行无报错
- [ ] 迁移文件已 commit（与代码变更在同一 PR）
