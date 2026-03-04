# Skill: API 实现

## 元信息

- **Skill ID:** `api-implementation`
- **所属 Agent:** 后端工程 Agent (Agent 6)
- **版本：** 1.0（从 AGENT-PLAN v1.9 提取）
- **输入：** `architecture.md`（§API 端点）、`cross-module-erd.md`、`STANDARDS.md §6`
- **输出：** Flask Blueprint 路由层、API 集成测试、Swagger UI 验证
- **依赖：** `database-migration`（Models 已创建）、`business-logic`（Service 层已创建）

---

## BE Step 1：API 契约验证

```
→ 读取 architecture.md §API 端点
→ 核验每个端点的 method / path / request / response 是否完整
→ 确认路径前缀统一为 /api/v1/（纠正不一致的历史模块，见 STANDARDS §6.1）
→ 对缺少请求体/响应体示例的写操作端点补充说明（CORRECTIONS P10）
→ 输出：API 契约验证清单（哪些端点可直接实现，哪些需补充设计）
```

## BE Step 5：Flask Blueprint（路由层）

```
→ 对照 architecture.md §API 端点逐一实现
→ 遵循 STANDARDS §8.4 Blueprint 规范（flask-smorest 装饰器）
→ 在 app/api/__init__.py 注册新 Blueprint
→ 编写 API 集成测试（pytest-flask，测试每个端点的正常/异常场景）
→ 输出：backend/app/api/{module}s.py + tests/test_{module}s.py
```

## BE Step 6：API 集成验证

```
→ 启动 Flask dev server（flask run）
→ 在 Swagger UI (/api/docs/) 验证所有端点文档正确
→ 用 curl 或 Swagger UI 验证关键端点返回符合 STANDARDS §6.4 响应结构
→ 确认 JWT 认证保护端点（403/401 场景测试）
→ 输出：后端模块交付 Checklist（见 AGENT-PLAN §3 Step 12i-BE）
```

---

## 特别注意事项

1. **API 合同优先**：后端开发第一步是验证 architecture.md 的 API 设计是否完整，而非直接写代码
2. **交接班模块 API 前缀**：该模块 architecture.md 历史上使用 `/api/` 前缀，后端实现时统一改为 `/api/v1/`

---

## 检查清单

- [ ] 所有端点路径前缀统一为 `/api/v1/`
- [ ] 每个端点有完整的 method / path / request body / response body 定义
- [ ] 写操作端点有请求体字段说明
- [ ] Blueprint 已注册到 `app/api/__init__.py`
- [ ] API 集成测试覆盖正常 + 异常场景
- [ ] Swagger UI 可见所有端点且 schema 正确
- [ ] JWT 认证保护验证通过（401/403 场景）
- [ ] API 响应结构符合 STANDARDS §6.4（data / pagination / error）
