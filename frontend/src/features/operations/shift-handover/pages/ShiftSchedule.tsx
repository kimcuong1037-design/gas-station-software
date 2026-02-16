import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import {
  Card,
  Table,
  Button,
  Space,
  Typography,
  Tag,
  Modal,
  Form,
  Select,
  DatePicker,
  message,
} from 'antd';
import {
  LeftOutlined,
  RightOutlined,
  PlusOutlined,
  EditOutlined,
  UserOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { ShiftScheduleEntry } from '../../../../mock/shiftSchedules';
import { shiftSchedules } from '../../../../mock/shiftSchedules';
import { shifts } from '../../../../mock/shifts';
import { employees } from '../../../../mock/employees';

const { Title, Text } = Typography;

interface LayoutContext {
  selectedStationId: string;
}

const ShiftSchedule: React.FC = () => {
  const { t } = useTranslation();
  const { selectedStationId } = useOutletContext<LayoutContext>();

  // Week navigation
  const [weekOffset, setWeekOffset] = useState(0);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ShiftScheduleEntry | null>(null);
  const [localSchedules, setLocalSchedules] = useState<ShiftScheduleEntry[]>(shiftSchedules);
  const [form] = Form.useForm();

  // Calculate the week's dates
  const baseDate = dayjs('2026-02-16'); // Monday
  const weekStart = baseDate.add(weekOffset * 7, 'day');
  const weekDates = Array.from({ length: 7 }, (_, i) => weekStart.add(i, 'day'));

  // Get station-specific shifts
  const stationShifts = shifts.filter(s => s.stationId === selectedStationId);
  const stationEmployees = employees.filter(e => e.stationId === selectedStationId && e.status === 'active');

  // Filter schedules for current station and week
  const weekSchedules = useMemo(() => {
    const start = weekDates[0].format('YYYY-MM-DD');
    const end = weekDates[6].format('YYYY-MM-DD');
    return localSchedules.filter(
      s => s.stationId === selectedStationId && s.date >= start && s.date <= end
    );
  }, [localSchedules, selectedStationId, weekDates]);

  // Build table data: rows = shifts, columns = days
  const tableData = stationShifts.map(shift => {
    const row: Record<string, unknown> = {
      key: shift.id,
      shiftName: shift.name,
      shiftTime: `${shift.startTime}-${shift.endTime}`,
    };
    weekDates.forEach(date => {
      const dateStr = date.format('YYYY-MM-DD');
      const entry = weekSchedules.find(s => s.shiftId === shift.id && s.date === dateStr);
      row[dateStr] = entry;
    });
    return row;
  });

  const handleEditClick = (entry: ShiftScheduleEntry | null, date: string, shiftId: string) => {
    if (entry) {
      setEditingEntry(entry);
      form.setFieldsValue({
        date: dayjs(entry.date),
        shiftId: entry.shiftId,
        employeeId: entry.employeeId,
      });
    } else {
      const shift = stationShifts.find(s => s.id === shiftId);
      setEditingEntry(null);
      form.setFieldsValue({
        date: dayjs(date),
        shiftId: shiftId,
        employeeId: undefined,
      });
      // Provide shift context for new entries
      form.setFieldsValue({
        _shiftName: shift?.name,
        _shiftStartTime: shift?.startTime,
        _shiftEndTime: shift?.endTime,
      });
    }
    setEditModalOpen(true);
  };

  const handleSave = () => {
    form.validateFields().then(values => {
      const shift = stationShifts.find(s => s.id === values.shiftId);
      const emp = stationEmployees.find(e => e.id === values.employeeId);
      if (!shift || !emp) return;

      const dateStr = dayjs(values.date).format('YYYY-MM-DD');
      
      if (editingEntry) {
        // Update existing
        setLocalSchedules(prev => prev.map(s =>
          s.id === editingEntry.id
            ? { ...s, employeeId: emp.id, employeeName: emp.name, date: dateStr, shiftId: shift.id, shiftName: shift.name, shiftStartTime: shift.startTime, shiftEndTime: shift.endTime }
            : s
        ));
      } else {
        // Add new
        const newEntry: ShiftScheduleEntry = {
          id: `sch-new-${Date.now()}`,
          stationId: selectedStationId,
          date: dateStr,
          shiftId: shift.id,
          shiftName: shift.name,
          shiftStartTime: shift.startTime,
          shiftEndTime: shift.endTime,
          employeeId: emp.id,
          employeeName: emp.name,
        };
        setLocalSchedules(prev => [...prev, newEntry]);
      }

      message.success(t('shiftHandover.scheduleSaveSuccess'));
      setEditModalOpen(false);
      form.resetFields();
    });
  };

  // Table columns
  const columns = [
    {
      title: t('shiftHandover.scheduleShift'),
      dataIndex: 'shiftName',
      key: 'shiftName',
      width: 120,
      fixed: 'left' as const,
      render: (name: string, record: Record<string, unknown>) => (
        <div>
          <Text strong>{name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>{record.shiftTime as string}</Text>
        </div>
      ),
    },
    ...weekDates.map(date => {
      const dateStr = date.format('YYYY-MM-DD');
      const isToday = dateStr === '2026-02-16'; // Demo: "today"
      const dayLabel = date.format('ddd');
      const dateLabel = date.format('M/D');
      return {
        title: (
          <div style={{ textAlign: 'center' as const }}>
            <div style={{ fontWeight: isToday ? 'bold' : 'normal', color: isToday ? '#1677ff' : undefined }}>
              {dayLabel}
            </div>
            <div style={{ fontSize: 12, color: isToday ? '#1677ff' : '#999' }}>
              {dateLabel}
            </div>
          </div>
        ),
        dataIndex: dateStr,
        key: dateStr,
        width: 140,
        render: (entry: ShiftScheduleEntry | undefined, record: Record<string, unknown>) => {
          const shiftId = stationShifts.find(s => s.name === record.shiftName)?.id || '';
          if (entry) {
            return (
              <div style={{ textAlign: 'center' }}>
                <Tag icon={<UserOutlined />} color="blue">{entry.employeeName}</Tag>
                <br />
                <Button
                  type="link"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => handleEditClick(entry, dateStr, shiftId)}
                >
                  {t('common.edit')}
                </Button>
              </div>
            );
          }
          return (
            <div style={{ textAlign: 'center' }}>
              <Button
                type="dashed"
                size="small"
                icon={<PlusOutlined />}
                onClick={() => handleEditClick(null, dateStr, shiftId)}
              >
                {t('shiftHandover.scheduleAddShift')}
              </Button>
            </div>
          );
        },
      };
    }),
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>{t('shiftHandover.scheduleTitle')}</Title>
        <Space>
          <Button icon={<LeftOutlined />} onClick={() => setWeekOffset(w => w - 1)}>
            {t('shiftHandover.schedulePrevWeek')}
          </Button>
          <Button type={weekOffset === 0 ? 'primary' : 'default'} onClick={() => setWeekOffset(0)}>
            {t('shiftHandover.scheduleThisWeek')}
          </Button>
          <Button onClick={() => setWeekOffset(w => w + 1)}>
            {t('shiftHandover.scheduleNextWeek')} <RightOutlined />
          </Button>
        </Space>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={tableData}
          pagination={false}
          scroll={{ x: 1100 }}
          bordered
          size="middle"
        />
      </Card>

      {/* Edit/Add Schedule Modal */}
      <Modal
        title={editingEntry ? t('shiftHandover.scheduleEditShift') : t('shiftHandover.scheduleAddShift')}
        open={editModalOpen}
        onOk={handleSave}
        onCancel={() => { setEditModalOpen(false); form.resetFields(); }}
        okText={t('shiftHandover.scheduleSave')}
        cancelText={t('common.cancel')}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="date"
            label={t('shiftHandover.scheduleDate')}
            rules={[{ required: true }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="shiftId"
            label={t('shiftHandover.scheduleShift')}
            rules={[{ required: true }]}
          >
            <Select
              options={stationShifts.map(s => ({
                value: s.id,
                label: `${s.name} (${s.startTime}-${s.endTime})`,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="employeeId"
            label={t('shiftHandover.scheduleEmployee')}
            rules={[{ required: true }]}
          >
            <Select
              options={stationEmployees.map(e => ({
                value: e.id,
                label: `${e.name} (${e.position})`,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ShiftSchedule;
