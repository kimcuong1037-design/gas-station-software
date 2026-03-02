import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  TreeSelect,
  Card,
  Row,
  Col,
  Dropdown,
  Avatar,
  Typography,
  message,
} from 'antd';
import { RequirementTag, DevRequirementPanel } from '../../../../components/RequirementTag';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  EyeOutlined,
  MoreOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  TeamOutlined,
  ExportOutlined,
  AppstoreOutlined,
  TableOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Station, StationStatus } from '../types';
import { statusColorMap } from '../constants';
import { stations } from '../../../../mock/stations';
import { regions } from '../../../../mock/regions';
import { groups } from '../../../../mock/groups';

const { Text, Title } = Typography;

/** 视图类型 */
type ViewType = 'table' | 'card';

const StationList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // 筛选状态
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<StationStatus | 'all'>('all');
  const [regionFilter, setRegionFilter] = useState<string>();
  const [groupFilter, setGroupFilter] = useState<string>();
  const [viewType, setViewType] = useState<ViewType>('table');

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  // 注意: loading 状态目前使用 mock 数据，未来接入 API 时使用
  const [loading] = useState(false);

  // 重置筛选
  const handleResetFilters = () => {
    setKeyword('');
    setStatusFilter('all');
    setRegionFilter(undefined);
    setGroupFilter(undefined);
    setCurrentPage(1);
  };

  // 是否有筛选条件
  const hasFilters = keyword || statusFilter !== 'all' || regionFilter || groupFilter;

  // 筛选后的数据
  const filteredData = useMemo(() => {
    return stations.filter((station) => {
      // 关键词筛选
      if (keyword) {
        const lowerKeyword = keyword.toLowerCase();
        if (
          !station.name.toLowerCase().includes(lowerKeyword) &&
          !station.code.toLowerCase().includes(lowerKeyword) &&
          !station.address.toLowerCase().includes(lowerKeyword)
        ) {
          return false;
        }
      }
      // 状态筛选
      if (statusFilter !== 'all' && station.status !== statusFilter) {
        return false;
      }
      // 区域筛选
      if (regionFilter && station.regionId !== regionFilter) {
        return false;
      }
      // 分组筛选
      if (groupFilter && station.groupId !== groupFilter) {
        return false;
      }
      return true;
    });
  }, [keyword, statusFilter, regionFilter, groupFilter]);

  // 状态标签渲染
  const renderStatusTag = (status: StationStatus) => {
    const statusTextMap: Record<StationStatus, string> = {
      active: t('station.statusActive'),
      inactive: t('station.statusInactive'),
      suspended: t('station.statusMaintenance'),
    };
    return <Tag color={statusColorMap[status]}>{statusTextMap[status]}</Tag>;
  };

  // 表格列定义
  const columns: ColumnsType<Station> = [
    {
      title: t('station.name'),
      dataIndex: 'name',
      key: 'name',
      width: 180,
      render: (name: string, record) => (
        <Space>
          {record.primaryImageUrl && (
            <Avatar src={record.primaryImageUrl} shape="square" size={40} />
          )}
          <a onClick={() => navigate(`/operations/station/${record.id}`)}>{name}</a>
        </Space>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: t('station.code'),
      dataIndex: 'code',
      key: 'code',
      width: 130,
      sorter: (a, b) => a.code.localeCompare(b.code),
    },
    {
      title: t('station.status'),
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status: StationStatus) => renderStatusTag(status),
      sorter: (a, b) => a.status.localeCompare(b.status),
    },
    {
      title: t('station.address'),
      dataIndex: 'address',
      key: 'address',
      width: 200,
      ellipsis: true,
    },
    {
      title: t('station.phone'),
      dataIndex: 'contactPhone',
      key: 'contactPhone',
      width: 130,
    },
    {
      title: t('station.nozzle.title'),
      dataIndex: 'nozzleCount',
      key: 'nozzleCount',
      width: 80,
      align: 'center',
      sorter: (a, b) => (a.nozzleCount || 0) - (b.nozzleCount || 0),
    },
    {
      title: t('station.regionLabel'),
      dataIndex: ['region', 'name'],
      key: 'region',
      width: 120,
    },
    {
      title: t('station.groupLabel'),
      dataIndex: ['group', 'name'],
      key: 'group',
      width: 120,
      render: (name: string) => (name ? <Tag>{name}</Tag> : '-'),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 150,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/operations/station/${record.id}`)}
          >
            {t('common.detail')}
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/operations/station/${record.id}/edit`)}
          >
            {t('common.edit')}
          </Button>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'toggle',
                  label:
                    record.status === 'active' ? t('common.disabled') : t('common.enabled'),
                  onClick: () => {
                    message.success(t('common.success'));
                  },
                },
              ],
            }}
          >
            <Button type="link" size="small" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  // 卡片视图渲染
  const renderCard = (station: Station) => (
    <Card
      key={station.id}
      hoverable
      style={{ marginBottom: 16 }}
      cover={
        station.primaryImageUrl && (
          <img
            alt={station.name}
            src={station.primaryImageUrl}
            style={{ height: 160, objectFit: 'cover' }}
          />
        )
      }
      onClick={() => navigate(`/operations/station/${station.id}`)}
    >
      <Card.Meta
        title={
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Text strong>{station.name}</Text>
            {renderStatusTag(station.status)}
          </Space>
        }
        description={
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Text type="secondary">
              <EnvironmentOutlined style={{ marginRight: 8 }} />
              {station.address}
            </Text>
            {station.contactPhone && (
              <Text type="secondary">
                <PhoneOutlined style={{ marginRight: 8 }} />
                {station.contactPhone}
              </Text>
            )}
            <Space split="|" style={{ marginTop: 8 }}>
              <Text>
                {t('station.nozzle.title')}: {station.nozzleCount || 0}
              </Text>
              <Text>
                <TeamOutlined style={{ marginRight: 4 }} />
                {station.employeeCount || 0}
              </Text>
            </Space>
          </Space>
        }
      />
    </Card>
  );

  // 生成区域 TreeSelect 数据
  const regionTreeData = useMemo(() => {
    const convert = (items: typeof regions): any[] =>
      items.map((item) => ({
        title: item.name,
        value: item.id,
        key: item.id,
        children: item.children ? convert(item.children) : undefined,
      }));
    return convert(regions);
  }, []);

  return (
    <main style={{ padding: 24 }}>
      {/* 页面标题 */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Title level={4} style={{ marginBottom: 0 }}>
          {t('station.title')}
        </Title>
        <RequirementTag componentId="station-list" showDetail />
      </div>

      {/* 开发模式需求追踪面板 */}
      <DevRequirementPanel componentId="station-list" />

      {/* 筛选区域 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col flex="240px">
            <Space size={4}>
              <Input
                placeholder={t('common.search')}
                prefix={<SearchOutlined />}
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setCurrentPage(1);
                }}
                allowClear
                style={{ width: 220 }}
              />
              <RequirementTag componentId="station-list-search" />
            </Space>
          </Col>
          <Col flex="120px">
            <Select
              style={{ width: '100%' }}
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value);
                setCurrentPage(1);
              }}
              options={[
                { label: t('common.all'), value: 'all' },
                { label: t('station.statusActive'), value: 'active' },
                { label: t('station.statusInactive'), value: 'inactive' },
                { label: t('station.statusMaintenance'), value: 'suspended' },
              ]}
            />
          </Col>
          <Col flex="180px">
            <TreeSelect
              style={{ width: '100%' }}
              placeholder={t('station.regionLabel')}
              value={regionFilter}
              onChange={(value) => {
                setRegionFilter(value);
                setCurrentPage(1);
              }}
              treeData={regionTreeData}
              allowClear
              showSearch
              treeNodeFilterProp="title"
            />
          </Col>
          <Col flex="150px">
            <Select
              style={{ width: '100%' }}
              placeholder={t('station.groupLabel')}
              value={groupFilter}
              onChange={(value) => {
                setGroupFilter(value);
                setCurrentPage(1);
              }}
              options={groups.map((g) => ({ label: g.name, value: g.id }))}
              allowClear
            />
          </Col>
          <Col>
            {hasFilters && (
              <Button onClick={handleResetFilters}>
                {t('common.resetFilters')}
              </Button>
            )}
          </Col>
          <Col flex="auto" />
          <Col>
            <Space>
              <Button.Group aria-label={t('common.viewSwitch')}>
                <Button
                  type={viewType === 'table' ? 'primary' : 'default'}
                  icon={<TableOutlined />}
                  onClick={() => setViewType('table')}
                  aria-label={t('common.tableView')}
                />
                <Button
                  type={viewType === 'card' ? 'primary' : 'default'}
                  icon={<AppstoreOutlined />}
                  onClick={() => setViewType('card')}
                  aria-label={t('common.cardView')}
                />
              </Button.Group>
              <Button icon={<ExportOutlined />}>{t('common.export')}</Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate('/operations/station/new')}
              >
                {t('station.add')}
              </Button>
              <RequirementTag componentId="station-add-button" />
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 数据展示 */}
      {viewType === 'table' ? (
        <Card>
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="id"
            loading={loading}
            pagination={{
              current: currentPage,
              pageSize,
              total: filteredData.length,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条`,
              pageSizeOptions: ['10', '20', '50', '100'],
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              },
            }}
            scroll={{ x: 1200 }}
          />
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {filteredData.map((station) => (
            <Col key={station.id} xs={24} sm={12} md={8} lg={6}>
              {renderCard(station)}
            </Col>
          ))}
        </Row>
      )}
    </main>
  );
};

export default StationList;
