# Skill: 业务逻辑实现

## 元信息

- **Skill ID:** `business-logic`
- **所属 Agent:** 后端工程 Agent (Agent 6)
- **版本：** 1.0（从 AGENT-PLAN v1.9 提取）
- **输入：** `architecture.md`（§业务规则）、SQLAlchemy Models（`database-migration` 产出）
- **输出：** Marshmallow Schemas、Service 层业务逻辑、pytest 单元测试
- **依赖：** `database-migration`（Models 已创建）

---

## BE Step 3：Marshmallow Schemas

```
→ 为每个 Model 创建对应 Schema（序列化输出 + 输入验证）
→ 列出所有必填字段、枚举值约束、业务校验规则（对应 architecture.md §业务规则）
→ 输出：backend/app/schemas/{module}.py
```

## BE Step 4：Service 层业务逻辑

```
→ 将 architecture.md §业务规则 翻译为 Python Service 方法
→ Service 方法不依赖 Flask request/response（纯业务逻辑，便于单元测试）
→ 为每个 Service 方法编写单元测试（pytest，目标 >= 80% 覆盖率）
→ 输出：backend/app/services/{module}_service.py + tests/unit/test_{module}_service.py
```

---

## Service 层设计原则

- **无框架依赖**：Service 方法接收 Python 原生类型，不直接操作 `request`/`g`
- **事务管理**：Service 负责 `db.session.commit()` 和回滚；Blueprint 层不提交事务
- **业务异常**：自定义 `BusinessException` 类，Blueprint 层统一捕获转为 HTTP 响应
- **幂等性**：写操作尽量设计为幂等（或明确标注非幂等）

---

## 检查清单

- [ ] 每个 Model 对应一个 Schema（或分 Input/Output Schema）
- [ ] 枚举字段使用 `marshmallow_enum.EnumField`
- [ ] 必填字段已标注 `required=True`
- [ ] Service 方法签名不含 Flask 上下文对象
- [ ] pytest 单元测试覆盖率 >= 80%
- [ ] 所有业务规则（来自 architecture.md §业务规则）均有对应测试用例
- [ ] 异常场景有显式测试（如状态流转非法、数量越界等）
