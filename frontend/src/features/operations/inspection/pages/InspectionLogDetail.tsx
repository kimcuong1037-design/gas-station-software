// P14: 巡检日志详情页
import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Typography, Button, Descriptions, Space, Empty, Image } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { inspectionLogs } from '../../../../mock/inspections';

import ResultTag from '../components/ResultTag';
import CategoryTag from '../components/CategoryTag';
import { RequirementTag } from '../../../../components/RequirementTag';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const InspectionLogDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const log = inspectionLogs.find((l) => l.id === id);

  if (!log) {
    return (
      <div data-testid="inspection-log-detail">
        <Card>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/operations/inspection/logs')}
            style={{ marginBottom: 16 }}
          >
            返回列表
          </Button>
          <Empty description="日志不存在" />
        </Card>
      </div>
    );
  }

  return (
    <div data-testid="inspection-log-detail">
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/operations/inspection/logs')}
              >
                返回列表
              </Button>
              <Title level={4} style={{ margin: 0 }}>巡检日志详情</Title>
              <RequirementTag componentIds={['log-detail', 'log-photo']} module="inspection" showDetail />
            </Space>
          </div>

          {/* Descriptions */}
          <Descriptions bordered column={2}>
            <Descriptions.Item label="关联任务">
              <Link to={`/operations/inspection/tasks/${log.taskId}`}>
                {log.task.taskNo}
              </Link>
            </Descriptions.Item>
            <Descriptions.Item label="检查项目">
              {log.checkItem.name}
            </Descriptions.Item>
            <Descriptions.Item label="检查项分类">
              <CategoryTag category={log.checkItem.category} />
            </Descriptions.Item>
            <Descriptions.Item label="执行人">
              {log.executor.name}
            </Descriptions.Item>
            <Descriptions.Item label="执行时间">
              {log.executedAt ? dayjs(log.executedAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="检查结果">
              <ResultTag result={log.result} />
            </Descriptions.Item>
            {log.result === 'abnormal' && log.remark && (
              <Descriptions.Item label="异常说明" span={2}>
                <Text type="danger">{log.remark}</Text>
              </Descriptions.Item>
            )}
          </Descriptions>

          {/* Photos Section [MVP+] */}
          <Card
            title="现场照片"
            size="small"
            type="inner"
          >
            {log.photos && log.photos.length > 0 ? (
              <Image.PreviewGroup>
                <Space wrap>
                  {log.photos.map((photo) => (
                    <Image
                      key={photo.id}
                      width={120}
                      height={120}
                      src={photo.url}
                      alt={photo.fileName}
                      style={{ objectFit: 'cover', borderRadius: 4 }}
                    />
                  ))}
                </Space>
              </Image.PreviewGroup>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="暂无现场照片"
                style={{ padding: '20px 0' }}
              />
            )}
          </Card>
        </Space>
      </Card>
    </div>
  );
};

export default InspectionLogDetail;
