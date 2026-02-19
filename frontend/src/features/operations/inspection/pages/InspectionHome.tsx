// P00: 安检任务/计划合并页（双 Tab 容器）
import React, { useState } from 'react';
import { Tabs, Typography, Row, Space } from 'antd';
import InspectionTaskList from './InspectionTaskList';
import InspectionPlanList from './InspectionPlanList';
import { RequirementTag } from '../../../../components/RequirementTag';

const { Title } = Typography;

const InspectionHome: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('tasks');

  return (
    <div data-testid="inspection-home" style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Space align="center">
          <Title level={4} style={{ margin: 0 }}>巡检/安检管理</Title>
          <RequirementTag componentIds={['inspection-home']} module="all" showDetail />
        </Space>
      </Row>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        size="large"
        items={[
          {
            key: 'tasks',
            label: '安检任务',
            children: <InspectionTaskList />,
          },
          {
            key: 'plans',
            label: '安检计划',
            children: <InspectionPlanList />,
          },
        ]}
      />
    </div>
  );
};

export default InspectionHome;
