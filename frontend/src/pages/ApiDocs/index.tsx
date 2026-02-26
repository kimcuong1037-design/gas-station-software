/**
 * API Documentation Page
 * 全局 API 接口文档页面 — 供团队内部访问
 *
 * 路由：/api-docs
 * 功能：展示所有模块的 REST API 端点、数据模型、请求/响应示例
 */

import { useState, useMemo } from 'react';
import {
  Layout,
  Typography,
  Input,
  Tag,
  Collapse,
  Table,
  Badge,
  Space,
  Statistic,
  Row,
  Col,
  Card,
  Tooltip,
  Divider,
  Empty,
  Button,
} from 'antd';
import {
  SearchOutlined,
  ApiOutlined,
  CopyOutlined,
  BookOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { API_MODULES, getTotalEndpointCount, type ApiModule, type ApiEndpoint, type ParamDef } from './apiData';

const { Sider, Content, Header } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

// ============================================================
// HTTP Method Badge
// ============================================================
const METHOD_COLORS: Record<string, string> = {
  GET: '#52c41a',
  POST: '#1677ff',
  PUT: '#fa8c16',
  DELETE: '#ff4d4f',
  PATCH: '#722ed1',
};

function MethodBadge({ method }: { method: string }) {
  const color = METHOD_COLORS[method] || '#888';
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 4,
        backgroundColor: color,
        color: '#fff',
        fontSize: 12,
        fontWeight: 700,
        fontFamily: 'monospace',
        minWidth: 56,
        textAlign: 'center',
        letterSpacing: 0.5,
      }}
    >
      {method}
    </span>
  );
}

// ============================================================
// Param Table
// ============================================================
function ParamTable({ params, title }: { params: ParamDef[]; title: string }) {
  const columns = [
    {
      title: '参数名',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <Text code>{name}</Text>,
      width: 180,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => <Text style={{ color: '#722ed1', fontFamily: 'monospace' }}>{type}</Text>,
      width: 120,
    },
    {
      title: '必填',
      dataIndex: 'required',
      key: 'required',
      render: (required: boolean) =>
        required ? (
          <Tag color="red" style={{ fontSize: 11 }}>必填</Tag>
        ) : (
          <Tag color="default" style={{ fontSize: 11 }}>可选</Tag>
        ),
      width: 70,
    },
    {
      title: '说明',
      dataIndex: 'description',
      key: 'description',
      render: (desc: string, row: ParamDef) => (
        <Space direction="vertical" size={0}>
          <span>{desc}</span>
          {row.example && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              示例：<Text code style={{ fontSize: 11 }}>{row.example}</Text>
            </Text>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ marginBottom: 16 }}>
      <Text strong style={{ fontSize: 13, color: '#595959', display: 'block', marginBottom: 6 }}>
        {title}
      </Text>
      <Table
        dataSource={params.map((p, i) => ({ ...p, key: i }))}
        columns={columns}
        size="small"
        pagination={false}
        bordered
        style={{ fontSize: 13 }}
      />
    </div>
  );
}

// ============================================================
// Code Block
// ============================================================
function CodeBlock({ code }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div style={{ position: 'relative', marginBottom: 8 }}>
      <pre
        style={{
          backgroundColor: '#1e1e1e',
          color: '#d4d4d4',
          padding: '12px 16px',
          borderRadius: 6,
          fontSize: 13,
          lineHeight: 1.6,
          overflow: 'auto',
          margin: 0,
          fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
        }}
      >
        <code>{code}</code>
      </pre>
      <Tooltip title={copied ? '已复制！' : '复制'}>
        <Button
          type="text"
          size="small"
          icon={copied ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : <CopyOutlined />}
          onClick={handleCopy}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: '#888',
            background: 'rgba(255,255,255,0.1)',
          }}
        />
      </Tooltip>
    </div>
  );
}

// ============================================================
// Endpoint Card (expandable)
// ============================================================
function EndpointCard({ endpoint }: { endpoint: ApiEndpoint }) {
  const hasContent =
    (endpoint.pathParams?.length ?? 0) > 0 ||
    (endpoint.queryParams?.length ?? 0) > 0 ||
    endpoint.requestBody ||
    (endpoint.responseFields?.length ?? 0) > 0 ||
    endpoint.notes;

  return (
    <Collapse
      ghost
      style={{ marginBottom: 4 }}
      items={[
        {
          key: '1',
          label: (
            <Space size={12} align="center" style={{ width: '100%' }}>
              <MethodBadge method={endpoint.method} />
              <Text
                code
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: '#1f1f1f',
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                }}
              >
                {endpoint.path}
              </Text>
              <Text type="secondary" style={{ fontSize: 13, flex: 1 }}>
                {endpoint.summary}
              </Text>
              {endpoint.tags.map((tag) => (
                <Tag key={tag} color="blue" style={{ fontSize: 11 }}>
                  {tag}
                </Tag>
              ))}
            </Space>
          ),
          children: hasContent ? (
            <div style={{ paddingLeft: 16, paddingTop: 4 }}>
              {endpoint.notes && (
                <div
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#fff7e6',
                    border: '1px solid #ffd591',
                    borderRadius: 4,
                    marginBottom: 12,
                    fontSize: 13,
                  }}
                >
                  ⚠️ <Text style={{ color: '#ad6800' }}>{endpoint.notes}</Text>
                </div>
              )}

              {endpoint.pathParams && endpoint.pathParams.length > 0 && (
                <ParamTable params={endpoint.pathParams} title="📍 路径参数（Path Params）" />
              )}

              {endpoint.queryParams && endpoint.queryParams.length > 0 && (
                <ParamTable params={endpoint.queryParams} title="🔍 查询参数（Query Params）" />
              )}

              {endpoint.requestBody && (
                <div style={{ marginBottom: 16 }}>
                  <Text strong style={{ fontSize: 13, color: '#595959', display: 'block', marginBottom: 6 }}>
                    📦 请求体（Request Body）
                    <Tag style={{ marginLeft: 8, fontSize: 11 }}>{endpoint.requestBody.contentType}</Tag>
                  </Text>
                  <ParamTable params={endpoint.requestBody.fields} title="" />
                  {endpoint.requestBody.example && (
                    <>
                      <Text style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 4 }}>
                        示例 Payload：
                      </Text>
                      <CodeBlock code={endpoint.requestBody.example} />
                    </>
                  )}
                </div>
              )}

              {endpoint.responseFields && endpoint.responseFields.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <Text strong style={{ fontSize: 13, color: '#595959', display: 'block', marginBottom: 6 }}>
                    📤 响应字段（Response Fields）
                  </Text>
                  <Space wrap>
                    {endpoint.responseFields.map((field) => (
                      <Tag key={field} style={{ fontFamily: 'monospace', fontSize: 12 }}>
                        {field}
                      </Tag>
                    ))}
                  </Space>
                </div>
              )}
            </div>
          ) : (
            <Text type="secondary" style={{ paddingLeft: 16, fontSize: 13 }}>
              无额外参数说明
            </Text>
          ),
        },
      ]}
    />
  );
}

// ============================================================
// Module Section
// ============================================================
function ModuleSection({ module, searchText }: { module: ApiModule; searchText: string }) {
  const filteredEndpoints = useMemo(() => {
    if (!searchText) return module.endpoints;
    const lower = searchText.toLowerCase();
    return module.endpoints.filter(
      (ep) =>
        ep.path.toLowerCase().includes(lower) ||
        ep.summary.toLowerCase().includes(lower) ||
        ep.tags.some((t) => t.toLowerCase().includes(lower)) ||
        ep.method.toLowerCase().includes(lower)
    );
  }, [module.endpoints, searchText]);

  if (filteredEndpoints.length === 0) return null;

  const methodCounts = filteredEndpoints.reduce(
    (acc, ep) => {
      acc[ep.method] = (acc[ep.method] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div style={{ marginBottom: 40 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 16,
          paddingBottom: 12,
          borderBottom: `3px solid ${module.color}`,
        }}
      >
        <div
          style={{
            width: 4,
            height: 24,
            backgroundColor: module.color,
            borderRadius: 2,
          }}
        />
        <Title level={4} style={{ margin: 0, color: '#1f1f1f' }}>
          {module.name}
        </Title>
        <Text type="secondary" style={{ fontSize: 13 }}>
          {module.nameEn}
        </Text>
        <div style={{ flex: 1 }} />
        <Space>
          {Object.entries(methodCounts).map(([method, count]) => (
            <span key={method} style={{ fontSize: 12 }}>
              <MethodBadge method={method} /> ×{count}
            </span>
          ))}
          <Badge count={filteredEndpoints.length} style={{ backgroundColor: module.color }} />
        </Space>
      </div>

      <Paragraph type="secondary" style={{ marginBottom: 16, fontSize: 13 }}>
        {module.description}
      </Paragraph>

      <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #f0f0f0', padding: '4px 0' }}>
        {filteredEndpoints.map((endpoint, index) => (
          <div key={endpoint.id}>
            <EndpointCard endpoint={endpoint} />
            {index < filteredEndpoints.length - 1 && (
              <Divider style={{ margin: '0 16px', borderColor: '#f5f5f5' }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Main Page Component
// ============================================================
export default function ApiDocs() {
  const [searchText, setSearchText] = useState('');
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);

  const totalEndpoints = getTotalEndpointCount();

  const displayedModules = useMemo(() => {
    if (activeModuleId) return API_MODULES.filter((m) => m.id === activeModuleId);
    return API_MODULES;
  }, [activeModuleId]);

  const filteredTotalCount = useMemo(() => {
    return displayedModules.reduce((total, module) => {
      if (!searchText) return total + module.endpoints.length;
      const lower = searchText.toLowerCase();
      const filtered = module.endpoints.filter(
        (ep) =>
          ep.path.toLowerCase().includes(lower) ||
          ep.summary.toLowerCase().includes(lower) ||
          ep.tags.some((t) => t.toLowerCase().includes(lower)) ||
          ep.method.toLowerCase().includes(lower)
      );
      return total + filtered.length;
    }, 0);
  }, [displayedModules, searchText]);

  return (
    <Layout style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      {/* Header */}
      <Header
        style={{
          background: '#1f1f2e',
          padding: '0 32px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          lineHeight: 'normal',
        }}
      >
        <ApiOutlined style={{ fontSize: 24, color: '#1677ff' }} />
        <div>
          <Title level={4} style={{ margin: 0, color: '#fff', lineHeight: 1.2 }}>
            Gas Station API Docs
          </Title>
          <Text style={{ color: '#888', fontSize: 12 }}>
            加气站运营管理系统 — 内部 API 文档 v1.1
          </Text>
        </div>
        <div style={{ flex: 1 }} />
        <Tag color="blue" style={{ fontSize: 12 }}>
          Phase 1 — 基础运营
        </Tag>
        <Tag color="magenta" style={{ fontSize: 12 }}>
          Phase 2 — 能源交易
        </Tag>
        <Text style={{ color: '#888', fontSize: 12 }}>
          共 {totalEndpoints} 个端点
        </Text>
      </Header>

      <Layout>
        {/* Sidebar */}
        <Sider
          width={240}
          style={{
            background: '#fff',
            borderRight: '1px solid #f0f0f0',
            position: 'sticky',
            top: 64,
            height: 'calc(100vh - 64px)',
            overflow: 'auto',
          }}
        >
          <div style={{ padding: '16px 12px' }}>
            {/* Stats */}
            <Row gutter={8} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <Statistic
                  title="模块"
                  value={API_MODULES.length}
                  valueStyle={{ fontSize: 20 }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="端点"
                  value={totalEndpoints}
                  valueStyle={{ fontSize: 20 }}
                />
              </Col>
            </Row>

            <Divider style={{ margin: '8px 0' }} />

            {/* Module Filter */}
            <Text strong style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 8 }}>
              <BookOutlined /> 模块导航
            </Text>

            <div
              style={{
                padding: '8px 10px',
                borderRadius: 6,
                cursor: 'pointer',
                background: !activeModuleId ? '#e6f4ff' : 'transparent',
                color: !activeModuleId ? '#1677ff' : '#595959',
                fontWeight: !activeModuleId ? 600 : 400,
                fontSize: 13,
                marginBottom: 4,
              }}
              onClick={() => setActiveModuleId(null)}
            >
              全部模块
              <Badge
                count={totalEndpoints}
                style={{ marginLeft: 8, backgroundColor: !activeModuleId ? '#1677ff' : '#d9d9d9' }}
              />
            </div>

            {API_MODULES.map((module) => {
              const isActive = activeModuleId === module.id;
              return (
                <div
                  key={module.id}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    background: isActive ? `${module.color}18` : 'transparent',
                    color: isActive ? module.color : '#595959',
                    fontWeight: isActive ? 600 : 400,
                    fontSize: 13,
                    marginBottom: 4,
                    borderLeft: isActive ? `3px solid ${module.color}` : '3px solid transparent',
                    transition: 'all 0.15s',
                  }}
                  onClick={() => setActiveModuleId(isActive ? null : module.id)}
                >
                  {module.name}
                  <Badge
                    count={module.endpoints.length}
                    style={{
                      marginLeft: 8,
                      backgroundColor: isActive ? module.color : '#d9d9d9',
                    }}
                  />
                  <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>
                    {module.nameEn}
                  </div>
                </div>
              );
            })}

            <Divider style={{ margin: '12px 0 8px' }} />

            {/* Legend */}
            <Text strong style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 8 }}>
              HTTP 方法说明
            </Text>
            {Object.entries(METHOD_COLORS).map(([method]) => (
              <div key={method} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <MethodBadge method={method} />
                <Text style={{ fontSize: 12, color: '#595959' }}>
                  {method === 'GET' ? '查询' : method === 'POST' ? '创建' : method === 'PUT' ? '更新' : method === 'DELETE' ? '删除' : '部分更新'}
                </Text>
              </div>
            ))}
          </div>
        </Sider>

        {/* Main Content */}
        <Content style={{ padding: '24px 32px', maxWidth: 1100 }}>
          {/* Search */}
          <Card style={{ marginBottom: 24, border: 'none', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <Search
              placeholder="搜索 API 路径、功能描述或标签..."
              prefix={<SearchOutlined style={{ color: '#bbb' }} />}
              size="large"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{ fontSize: 14 }}
            />
            {searchText && (
              <Text type="secondary" style={{ display: 'block', marginTop: 8, fontSize: 12 }}>
                找到 {filteredTotalCount} 个匹配的端点
              </Text>
            )}
          </Card>

          {/* Overview */}
          {!activeModuleId && !searchText && (
            <Row gutter={16} style={{ marginBottom: 24 }}>
              {API_MODULES.map((module) => (
                <Col span={4} key={module.id}>
                  <Card
                    size="small"
                    hoverable
                    onClick={() => setActiveModuleId(module.id)}
                    style={{ borderTop: `3px solid ${module.color}`, cursor: 'pointer' }}
                  >
                    <Statistic
                      title={module.name}
                      value={module.endpoints.length}
                      suffix="个端点"
                      valueStyle={{ color: module.color, fontSize: 22 }}
                    />
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {module.nameEn}
                    </Text>
                  </Card>
                </Col>
              ))}
            </Row>
          )}

          {/* API Endpoint Sections */}
          {displayedModules.map((module) => (
            <ModuleSection key={module.id} module={module} searchText={searchText} />
          ))}

          {filteredTotalCount === 0 && (
            <Empty
              description={
                <span>
                  没有找到匹配 <Text code>{searchText}</Text> 的端点
                </span>
              }
              style={{ marginTop: 80 }}
            />
          )}

          {/* Footer */}
          <Divider />
          <div style={{ textAlign: 'center', padding: '16px 0', color: '#aaa', fontSize: 12 }}>
            <Text type="secondary">
              Gas Station Operations Management System — Internal API Documentation
            </Text>
            <br />
            <Text type="secondary">
              Phase 1 基础运营：站点管理 / 交接班管理 / 设备设施管理 / 巡检安检管理
            </Text>
            <br />
            <Text type="secondary">
              Phase 2 能源交易：价格管理 / 订单与交易
            </Text>
            <br />
            <Text type="secondary">
              API Version: v1 | Base URL: <Text code>https://api.gasstation.com</Text>
            </Text>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
