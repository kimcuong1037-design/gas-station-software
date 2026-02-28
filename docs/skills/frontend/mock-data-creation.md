# Skill: 模拟数据创建 (Mock Data Creation)

## 元信息

- **Skill ID:** `mock-data-creation`
- **所属 Agent:** 前端工程 Agent (Frontend Engineer)
- **输入：**
  - Architecture（`docs/features/<domain>/<module>/architecture.md`）— 实体定义、状态机、字段列表
  - 类型定义（`frontend/src/features/<domain>/<module>/types.ts`）— TypeScript 接口
  - 已有 Mock 数据参考（`frontend/src/mock/` 目录下已有文件）
  - 术语规范（`docs/STANDARDS.md` §1）— 确保中文标签一致
- **输出：**
  - Mock 数据文件（`frontend/src/mock/<moduleName>.ts`）
  - Mock 索引更新（`frontend/src/mock/index.ts`）
- **依赖：** `types.ts` 已完成（由 `react-component-development` Skill 步骤 2 产出）

---

## 流程定义

### 步骤 1: 确定数据结构

从 `architecture.md` 和 `types.ts` 提取：

1. **核心实体清单** — 需要创建哪些实体的 Mock 数据
2. **状态机定义** — 每个实体有哪些状态，状态间如何流转
3. **关联关系** — 实体间的 FK 关系（确保引用 ID 在被引用实体中存在）
4. **嵌套对象** — 哪些字段是嵌套的 `{ id, name }` 对象

### 步骤 2: 设计数据分布

**生命周期全覆盖原则：** 每种状态至少 1 条记录，核心状态 3-5 条。

```
示例（订单模块）：
- filling（加注中）: 2 条
- pending_payment（待支付）: 3 条
- paid（已支付）: 5 条
- completed（已完成）: 8 条  ← 最终态最多
- cancelled（已取消）: 2 条
- exception（异常）: 2 条
- refunded（已退款）: 1 条
```

**时间分布原则：**
- 今天的数据 5-10 条（展示"实时"感）
- 昨天 3-5 条
- 前天及更早 5-10 条
- 确保有足够数据触发分页（总量 > DEFAULT_PAGE_SIZE）

### 步骤 3: 编写 Mock 数据文件

**文件位置：** `frontend/src/mock/<moduleName>.ts`

**标准结构：**

```typescript
import type {
  EntityType,
  EntityStatus,
} from '../features/{domain}/{module}/types';

// ──────────────────────────────────────
// 1. 时间辅助函数
// ──────────────────────────────────────
const d = (daysAgo: number, hour: number, min: number): string => {
  const dt = new Date();
  dt.setDate(dt.getDate() - daysAgo);
  dt.setHours(hour, min, 0, 0);
  return dt.toISOString();
};

// ──────────────────────────────────────
// 2. 种子数据（完整生命周期覆盖）
// ──────────────────────────────────────
export const entities: EntityType[] = [
  // -- 今天 --
  {
    id: 'entity-001',
    entityNo: 'PREFIX-20260228-0001',
    stationId: 'station-001',           // 引用已有 station mock
    status: 'active',
    // ... 所有字段必须填充，不留 undefined
    createdBy: { id: 'user-001', name: '张三' },
    createdAt: d(0, 8, 30),
    updatedAt: d(0, 8, 30),
  },
  // ... 更多记录
];

// ──────────────────────────────────────
// 3. 聚合/统计函数（按需）
// ──────────────────────────────────────
export const getEntityStatistics = (stationId: string): EntityStatistics => {
  const filtered = entities.filter(e => e.stationId === stationId);
  return {
    total: filtered.length,
    activeCount: filtered.filter(e => e.status === 'active').length,
    // ...
  };
};

// ──────────────────────────────────────
// 4. 查询函数（按需）
// ──────────────────────────────────────
export const getEntityById = (id: string): EntityType | undefined =>
  entities.find(e => e.id === id);
```

### 步骤 4: 数据质量验证

| 验证项 | 说明 |
|--------|------|
| **字段完整性** | 每条记录的每个必填字段都有值（不留 `undefined`） |
| **状态覆盖** | 每种状态至少 1 条记录 |
| **关联一致** | FK 引用的 ID 在被引用实体中存在（如 `stationId` 引用 `stations` mock） |
| **嵌套数据充实** | 嵌套的 `{ id, name }` 对象不为空 |
| **已完成记录有支撑** | `status='completed'` 的记录有 `completedAt` 等收尾字段 |
| **数值合理** | 金额、数量、百分比在业务合理范围内 |
| **编号格式统一** | 业务编号遵循 architecture.md 定义的格式（如 `ST001-YYYYMMDD-NNNN`） |
| **中文内容真实** | 人名、站名、描述使用符合行业实际的中文内容 |

### 步骤 5: 更新 Mock 索引

在 `frontend/src/mock/index.ts` 中添加新模块的 re-export（如采用集中导出模式）。

---

## 常见错误防范

| 错误类型 | 表现 | 预防措施 |
|---------|------|---------|
| **状态-详情不一致** | `checkedItems: 5` 但实际只有 3 条 `checkItems` | 先写详情数据，再回填聚合字段 |
| **孤立引用** | `stationId: 'station-099'` 但 station mock 中不存在 | 只使用已有 mock 中的 ID |
| **时间逆序** | `createdAt > updatedAt` | updatedAt >= createdAt，手动检查 |
| **空嵌套对象** | `createdBy: null` 但类型定义非 nullable | 检查 types.ts 中是否有 `| null` |
| **i18n 不一致** | Mock 中写"新增"但 STANDARDS.md 规定"新建" | 对照术语表 |

---

## Prompt 模板

```
你是前端工程 Agent，负责为模块创建符合业务场景的 Mock 数据。

## 任务
为模块【{{MODULE_NAME}}】创建 Mock 数据。

## 输入文件
- 数据模型：docs/features/{{DOMAIN}}/{{MODULE}}/architecture.md
- 类型定义：frontend/src/features/{{DOMAIN}}/{{MODULE}}/types.ts
- 已有 Mock 参考：frontend/src/mock/（观察命名风格和数据量级）
- 术语规范：docs/STANDARDS.md §1

## 执行步骤
请严格按照 docs/skills/frontend/mock-data-creation.md 中的步骤 1-5 执行。

## 关键要求
1. 每种状态至少 1 条 Mock 记录（生命周期全覆盖）
2. 总数据量 > DEFAULT_PAGE_SIZE（触发分页）
3. FK 引用必须在被引用 Mock 中存在
4. 已完成记录必须有收尾字段
5. 中文内容使用行业真实数据
6. 编号格式与 architecture.md 一致
7. 时间分布覆盖今天、昨天、更早

## 输出
- frontend/src/mock/{{MODULE_NAME}}.ts
- 更新 frontend/src/mock/index.ts（如需要）
```

---

## 检查清单

- [ ] 每种状态类型至少 1 条记录
- [ ] 总数据量 > DEFAULT_PAGE_SIZE（20 条）
- [ ] 所有必填字段已填充（无 undefined）
- [ ] FK 引用一致（stationId、userId 等在对应 mock 中存在）
- [ ] 嵌套对象完整（{ id, name } 非空）
- [ ] 已完成记录有 completedAt 等收尾字段
- [ ] 数值在业务合理范围
- [ ] 业务编号格式与 architecture.md 一致
- [ ] 时间分布合理（今天 + 昨天 + 更早）
- [ ] 聚合字段与明细数据一致（count = 实际数组长度）
- [ ] 中文内容真实可信
- [ ] TypeScript 编译无错误
