# Skill: User Story 编写 (User Story Writing)

## 元信息

- **Skill ID:** `user-story-writing`
- **所属 Agent:** 需求分析 Agent (Requirement Analyst)
- **输入：**
  - 需求拆解文档（`docs/features/<domain>/<module>/requirements.md`，由 `requirement-decomposition` Skill 产出）
  - 术语规范（`docs/STANDARDS.md` §1 术语表）
  - 用户角色定义（见本文件 §附录A）
- **输出：**
  - User Story 文档（存放于 `docs/features/<domain>/<module>/user-stories.md`）
- **依赖：** `requirement-decomposition` Skill 的产出

---

## 流程定义

### 步骤 1: 确认输入完整性

检查前置条件：
- 需求拆解文档已存在且状态为"已确认"
- 功能点清单中 `[MVP]` 和 `[MVP+]` 的功能点已明确
- 疑问清单中的问题已全部解决（或标注为"暂不处理"）

如果前置条件不满足，停止并报告缺失项。

### 步骤 2: 识别用户角色

从附录 A 的角色列表中，识别与当前模块相关的用户角色：
- 确定每个功能点的主要使用角色
- 确定每个功能点的次要相关角色（如审批人、查看人）

### 步骤 3: 编写 User Story

对每个 `[MVP]` 和 `[MVP+]` 功能点，编写 User Story：

**格式：**
```
作为 [角色]，
我希望 [做什么/看到什么]，
以便 [达到什么目的/获得什么价值]。
```

**编写原则：**
- 一个功能点可以拆分为多个 User Story
- 每个 Story 应该是独立可交付的
- Story 粒度：一个 Story 对应一个可演示的交互场景
- 使用 STANDARDS.md 中的术语，不自造词汇
- 描述用户视角的行为，不描述技术实现

### 步骤 4: 定义验收标准

为每个 User Story 编写验收标准（Acceptance Criteria）：

**格式（Given-When-Then）：**
```
假设 [前置条件]，
当 [用户操作]，
那么 [预期结果]。
```

**验收标准要求：**
- 每个 Story 至少 2 条验收标准
- 覆盖正常流程和关键异常流程
- 可验证、可测试
- 对于 UI 相关的 Story，描述页面元素和交互行为

### 步骤 5: 标注 Story 间关系

标注 Story 之间的关系：
- **前置依赖：** Story A 必须在 Story B 之前完成
- **关联：** Story A 和 Story B 共享数据或页面
- **父子：** Epic → Story 的层级关系

### 步骤 6: 输出 User Story 文档

按输出格式生成文档，存放到指定路径。

---

## Prompt 模板

```
你是需求分析 Agent，负责将需求拆解结果转化为 User Story。

## 任务
为模块【{{MODULE_NAME}}】编写 User Story。

## 输入文件
- 需求拆解文档：docs/features/{{DOMAIN}}/{{MODULE}}/requirements.md
- 术语规范：docs/STANDARDS.md §1 术语表
- 用户角色：docs/skills/analysis/user-story-writing.md §附录A

## 执行步骤
请严格按照 docs/skills/analysis/user-story-writing.md 中定义的步骤 1-6 执行。

## 关键要求
1. 仅为 [MVP] 和 [MVP+] 功能点编写 Story
2. 每个 Story 必须有验收标准（Given-When-Then 格式）
3. Story 粒度：一个 Story = 一个可演示的交互场景
4. 使用 STANDARDS.md 术语表中的统一术语
5. 描述用户视角，不涉及技术实现细节

## 输出
将结果写入：docs/features/{{DOMAIN}}/{{MODULE}}/user-stories.md
格式遵循本 Skill 文件中的"输出格式"规范。
```

---

## 输出格式

```markdown
# {{MODULE_NAME}} — User Stories

**模块：** {{MODULE_NAME}}
**基于：** requirements.md v{{VERSION}}
**编写日期：** {{DATE}}
**状态：** 待确认 / 已确认

---

## 角色说明

本模块涉及的用户角色：

| 角色 | 代码 | 说明 |
|------|------|------|
| {{角色名}} | {{role_code}} | {{简要说明}} |

---

## Epic 1: {{二级功能名称}}

来源功能点：F001, F002, ...

### US-001: {{Story 标题}}

**优先级：** [MVP] / [MVP+]
**角色：** {{角色名}}

> 作为 {{角色}}，
> 我希望 {{做什么}}，
> 以便 {{目的}}。

**验收标准：**

1. 假设 {{前置条件}}，当 {{操作}}，那么 {{结果}}。
2. 假设 {{前置条件}}，当 {{操作}}，那么 {{结果}}。

**关联：** US-003（共享站点数据）
**前置依赖：** 无 / US-xxx

---

### US-002: {{Story 标题}}

（同上格式）

---

## Story 关系图

（文本描述 Story 间的依赖和关联关系）

## 汇总

| 优先级 | Story 数量 | 编号范围 |
|--------|-----------|---------|
| [MVP] | {{n}} | US-001 ~ US-xxx |
| [MVP+] | {{n}} | US-xxx ~ US-xxx |
| 合计 | {{n}} | |
```

---

## 检查清单

- [ ] 所有 [MVP] 功能点都有对应的 User Story
- [ ] 所有 [MVP+] 功能点都有对应的 User Story
- [ ] 每个 Story 都有至少 2 条验收标准
- [ ] 验收标准使用 Given-When-Then 格式
- [ ] Story 间的依赖关系已标注
- [ ] 术语与 STANDARDS.md 一致
- [ ] Story 编号连续且唯一
- [ ] 每个 Story 的粒度适合单独演示

---

## 附录 A: 用户角色定义

本项目涉及的用户角色（基于需求文档 §1.2 系统端架构）：

| 角色 | 代码 | 系统端 | 说明 |
|------|------|--------|------|
| 系统管理员 | `admin` | 管理后台 | 系统配置、用户管理、权限分配 |
| 运营经理 | `ops_manager` | 管理后台 | 多站点运营管理、数据分析、报表查看 |
| 站长 | `station_master` | 管理后台 + POS | 单站点全面管理、审批、巡检监督 |
| 班组长 | `shift_leader` | POS | 班次管理、交接班、现场监督 |
| 收银员 | `cashier` | POS | 收银、充装操作、会员识别 |
| 加油员/加气员 | `attendant` | POS（移动） | 现场加注操作、巡检执行 |
| 财务人员 | `finance` | 管理后台 | 财务报表、对账、发票管理 |
| 巡检员 | `inspector` | 管理后台 + 移动 | 巡检执行、问题记录、照片上传 |
| 设备管理员 | `equipment_admin` | 管理后台 | 设备台账、维保管理 |
| 营销人员 | `marketing` | 管理后台 | 活动配置、券管理、会员营销 |
| 企业客户 | `enterprise` | 管理后台（受限） | 查看账单、对账、车队管理 |
| 普通会员 | `member` | 移动端 | 找站、支付、积分、充值、订单查询 |

> 注意：MVP 阶段主要关注管理后台角色（admin, ops_manager, station_master, finance, inspector, equipment_admin）。POS 端和移动端角色在后续阶段覆盖。
