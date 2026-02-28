# Skill: 国际化集成 (i18n Integration)

## 元信息

- **Skill ID:** `i18n-integration`
- **所属 Agent:** 前端工程 Agent (Frontend Engineer)
- **输入：**
  - UI Schema（`docs/features/<domain>/<module>/ui-schema.md`）— 页面标签、按钮文案
  - 已实现的页面组件（`frontend/src/features/<domain>/<module>/pages/`）
  - 已有翻译文件（`frontend/src/locales/zh-CN/index.ts`、`en-US/index.ts`）
  - 术语规范（`docs/STANDARDS.md` §1）— 中英文对照
  - 常量文件（`constants.ts`）— 状态标签的 label/labelEn
- **输出：**
  - 更新后的 zh-CN 翻译文件
  - 更新后的 en-US 翻译文件
  - 页面组件中的 `t()` 调用
- **依赖：** 页面组件基本结构已完成

---

## 流程定义

### 步骤 1: 提取翻译键

从 UI Schema 和已实现的组件中提取所有需要翻译的文本：

| 文本类型 | 来源 | 示例 |
|---------|------|------|
| 页面标题 | UI Schema 页面名称 | `订单列表`、`退款管理` |
| 字段标签 | Table column title、Form label | `订单号`、`支付方式` |
| 按钮文案 | Action button | `新建订单`、`提交审批` |
| 占位符 | Input placeholder | `请输入订单号` |
| 状态标签 | 已在 constants.ts 中通过 label/labelEn 处理 | **不需要 i18n key** |
| 统计卡片标题 | Statistic title | `今日订单`、`待支付` |
| 空状态提示 | Empty description | `暂无数据` |
| 确认弹窗 | Popconfirm title | `确定要删除吗？` |
| 成功/错误消息 | message.success/error | `操作成功` |
| 面包屑 | Breadcrumb items | 通常复用 menu.* key |
| Tab 标签 | Tabs items | `基本信息`、`详情` |

### 步骤 2: 设计键命名

**命名规范：** 小写点分隔，模块名为顶层命名空间。

```
{module}.{subgroup}.{field}
```

**层级结构：**

```typescript
{
  // 菜单导航（共享命名空间）
  menu: {
    energyTrade: '能源交易',
    inventoryManagement: '库存管理',
    inventoryOverview: '库存总览',
  },

  // 模块专属命名空间
  inventory: {
    // 页面标题
    title: '库存管理',
    overview: { title: '库存总览' },
    comparison: { title: '罐存比对' },

    // 字段标签
    field: {
      fuelType: '燃料类型',
      currentLevel: '当前液位',
      capacity: '额定容量',
    },

    // 操作按钮
    action: {
      refresh: '刷新数据',
      export: '导出报表',
      setThreshold: '设置阈值',
    },

    // 状态（仅当 constants.ts 未处理时使用）
    status: {
      normal: '正常',
      warning: '预警',
      critical: '紧急',
    },

    // 单位
    unit: {
      cubic: 'm³',
      kilogram: 'kg',
      liter: 'L',
    },

    // 统计
    stat: {
      totalTanks: '储罐总数',
      warningCount: '预警数',
    },

    // 通用文案
    placeholder: {
      searchFuel: '搜索燃料类型',
    },
    confirm: {
      deleteThreshold: '确定要删除此预警规则吗？',
    },
  },
}
```

**键命名规则：**

| 规则 | 正确 | 错误 |
|------|------|------|
| 模块名为顶层 | `inventory.field.fuelType` | `fuelType` |
| camelCase 子键 | `inventory.field.currentLevel` | `inventory.field.current_level` |
| 共用 common.* | `common.save` | `inventory.action.save` |
| 菜单统一在 menu.* | `menu.inventoryManagement` | `inventory.menu.title` |
| 不重复已有 common 键 | 复用 `common.cancel` | 新建 `inventory.action.cancel` |

### 步骤 3: 编写翻译文件

**zh-CN/index.ts** — 添加模块翻译块：

```typescript
// 在已有翻译对象中追加
inventory: {
  title: '库存管理',
  overview: { title: '库存总览' },
  field: {
    fuelType: '燃料类型',
    currentLevel: '当前液位',
  },
  action: {
    refresh: '刷新数据',
  },
  // ...
},
```

**en-US/index.ts** — 对应英文翻译：

```typescript
inventory: {
  title: 'Inventory Management',
  overview: { title: 'Inventory Overview' },
  field: {
    fuelType: 'Fuel Type',
    currentLevel: 'Current Level',
  },
  action: {
    refresh: 'Refresh',
  },
  // ...
},
```

**注意：** zh-CN 和 en-US 的键结构必须完全一致（镜像结构）。

### 步骤 4: 组件集成

在每个页面组件中：

```typescript
import { useTranslation } from 'react-i18next';

const MyPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      {/* 标题 — 带 fallback */}
      <Typography.Title level={4}>
        {t('inventory.overview.title', '库存总览')}
      </Typography.Title>

      {/* Table column — 带 fallback */}
      {
        title: t('inventory.field.fuelType', '燃料类型'),
        dataIndex: 'fuelType',
      }

      {/* 按钮 — 带 fallback */}
      <Button>{t('inventory.action.refresh', '刷新数据')}</Button>

      {/* 插值 — 带变量 */}
      {t('common.totalRecords', '共 {{total}} 条记录', { total: list.length })}

      {/* 复用 common 键 */}
      <Button>{t('common.save', '保存')}</Button>
    </>
  );
};
```

**Fallback 规则：** 每个 `t()` 调用的第二个参数提供中文 fallback，确保即使翻译键缺失也能显示中文。

### 步骤 5: 状态标签处理

状态标签（Tag 文本）**不通过 i18n**，而是通过 `constants.ts` 的 `getLabel()` 处理：

```typescript
// constants.ts 中已定义
{ label: '加注中', labelEn: 'Filling', color: 'processing' }

// 组件中使用
<Tag color={cfg.color}>{getLabel(cfg)}</Tag>  // 自动根据语言切换
```

**不要为 constants.ts 中已有 label/labelEn 的状态额外创建 i18n key。**

### 步骤 6: 完整性验证

```bash
# 检查组件中是否有未包裹 t() 的中文硬编码（排除 constants.ts 和 mockData）
grep -rn "[\u4e00-\u9fa5]" frontend/src/features/{domain}/{module}/pages/ \
  --include="*.tsx" | grep -v "// " | grep -v "t('" | grep -v "getLabel"
```

对输出结果逐行检查：
- 如果是注释 → 忽略
- 如果是 `console.log` → 忽略
- 如果是用户可见文本 → 必须用 `t()` 包裹

---

## Prompt 模板

```
你是前端工程 Agent，负责为模块集成国际化（i18n）支持。

## 任务
为模块【{{MODULE_NAME}}】完成 i18n 集成。

## 输入文件
- UI Schema：docs/features/{{DOMAIN}}/{{MODULE}}/ui-schema.md
- 页面组件：frontend/src/features/{{DOMAIN}}/{{MODULE}}/pages/
- 已有翻译：frontend/src/locales/zh-CN/index.ts、en-US/index.ts
- 术语规范：docs/STANDARDS.md §1（中英文对照）
- 常量文件：frontend/src/features/{{DOMAIN}}/{{MODULE}}/constants.ts

## 执行步骤
请严格按照 docs/skills/frontend/i18n-integration.md 中的步骤 1-6 执行。

## 关键要求
1. 键结构 zh-CN 与 en-US 完全镜像
2. 模块名为顶层命名空间（如 inventory.*）
3. 菜单翻译统一在 menu.* 下
4. 复用 common.* 中的通用键，不重复创建
5. 状态标签通过 getLabel() 处理，不创建 i18n key
6. 每个 t() 调用带中文 fallback
7. 术语以 STANDARDS.md §1 为准

## 输出
- 更新后的 zh-CN/index.ts
- 更新后的 en-US/index.ts
- 组件中的 t() 集成
```

---

## 检查清单

- [ ] zh-CN 和 en-US 键结构完全镜像
- [ ] 模块命名空间正确（如 `inventory.*`）
- [ ] 菜单项在 `menu.*` 下注册
- [ ] 复用已有 `common.*` 键（save、cancel、delete、loading 等）
- [ ] 状态标签未重复创建 i18n key（通过 getLabel 处理）
- [ ] 每个 `t()` 有中文 fallback 参数
- [ ] 插值语法正确（`{{variable}}`）
- [ ] 无遗漏的硬编码中文（页面标题、按钮、列头、占位符）
- [ ] 术语与 STANDARDS.md §1 一致
- [ ] TypeScript 编译无错误
