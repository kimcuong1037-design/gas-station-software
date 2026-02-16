// 排班表模拟数据

export interface ShiftScheduleEntry {
  id: string;
  stationId: string;
  date: string; // YYYY-MM-DD
  shiftId: string;
  shiftName: string;
  shiftStartTime: string;
  shiftEndTime: string;
  employeeId: string;
  employeeName: string;
}

// Generate schedule data for the current week (2026-02-16 is Monday)
export const shiftSchedules: ShiftScheduleEntry[] = [
  // 北京朝阳加气站 station-001, week of 2026-02-16
  // Monday 2/16
  { id: 'sch-001', stationId: 'station-001', date: '2026-02-16', shiftId: 'shift-001', shiftName: '早班', shiftStartTime: '06:00', shiftEndTime: '14:00', employeeId: 'emp-001', employeeName: '张建国' },
  { id: 'sch-002', stationId: 'station-001', date: '2026-02-16', shiftId: 'shift-002', shiftName: '中班', shiftStartTime: '14:00', shiftEndTime: '22:00', employeeId: 'emp-002', employeeName: '李强' },
  { id: 'sch-003', stationId: 'station-001', date: '2026-02-16', shiftId: 'shift-003', shiftName: '夜班', shiftStartTime: '22:00', shiftEndTime: '06:00', employeeId: 'emp-003', employeeName: '王伟' },
  // Tuesday 2/17
  { id: 'sch-004', stationId: 'station-001', date: '2026-02-17', shiftId: 'shift-001', shiftName: '早班', shiftStartTime: '06:00', shiftEndTime: '14:00', employeeId: 'emp-001', employeeName: '张建国' },
  { id: 'sch-005', stationId: 'station-001', date: '2026-02-17', shiftId: 'shift-002', shiftName: '中班', shiftStartTime: '14:00', shiftEndTime: '22:00', employeeId: 'emp-003', employeeName: '王伟' },
  { id: 'sch-006', stationId: 'station-001', date: '2026-02-17', shiftId: 'shift-003', shiftName: '夜班', shiftStartTime: '22:00', shiftEndTime: '06:00', employeeId: 'emp-002', employeeName: '李强' },
  // Wednesday 2/18
  { id: 'sch-007', stationId: 'station-001', date: '2026-02-18', shiftId: 'shift-001', shiftName: '早班', shiftStartTime: '06:00', shiftEndTime: '14:00', employeeId: 'emp-002', employeeName: '李强' },
  { id: 'sch-008', stationId: 'station-001', date: '2026-02-18', shiftId: 'shift-002', shiftName: '中班', shiftStartTime: '14:00', shiftEndTime: '22:00', employeeId: 'emp-001', employeeName: '张建国' },
  { id: 'sch-009', stationId: 'station-001', date: '2026-02-18', shiftId: 'shift-003', shiftName: '夜班', shiftStartTime: '22:00', shiftEndTime: '06:00', employeeId: 'emp-003', employeeName: '王伟' },
  // Thursday 2/19
  { id: 'sch-010', stationId: 'station-001', date: '2026-02-19', shiftId: 'shift-001', shiftName: '早班', shiftStartTime: '06:00', shiftEndTime: '14:00', employeeId: 'emp-003', employeeName: '王伟' },
  { id: 'sch-011', stationId: 'station-001', date: '2026-02-19', shiftId: 'shift-002', shiftName: '中班', shiftStartTime: '14:00', shiftEndTime: '22:00', employeeId: 'emp-002', employeeName: '李强' },
  { id: 'sch-012', stationId: 'station-001', date: '2026-02-19', shiftId: 'shift-003', shiftName: '夜班', shiftStartTime: '22:00', shiftEndTime: '06:00', employeeId: 'emp-001', employeeName: '张建国' },
  // Friday 2/20
  { id: 'sch-013', stationId: 'station-001', date: '2026-02-20', shiftId: 'shift-001', shiftName: '早班', shiftStartTime: '06:00', shiftEndTime: '14:00', employeeId: 'emp-001', employeeName: '张建国' },
  { id: 'sch-014', stationId: 'station-001', date: '2026-02-20', shiftId: 'shift-002', shiftName: '中班', shiftStartTime: '14:00', shiftEndTime: '22:00', employeeId: 'emp-003', employeeName: '王伟' },
  { id: 'sch-015', stationId: 'station-001', date: '2026-02-20', shiftId: 'shift-003', shiftName: '夜班', shiftStartTime: '22:00', shiftEndTime: '06:00', employeeId: 'emp-002', employeeName: '李强' },
  // Saturday 2/21
  { id: 'sch-016', stationId: 'station-001', date: '2026-02-21', shiftId: 'shift-001', shiftName: '早班', shiftStartTime: '06:00', shiftEndTime: '14:00', employeeId: 'emp-002', employeeName: '李强' },
  { id: 'sch-017', stationId: 'station-001', date: '2026-02-21', shiftId: 'shift-002', shiftName: '中班', shiftStartTime: '14:00', shiftEndTime: '22:00', employeeId: 'emp-001', employeeName: '张建国' },
  { id: 'sch-018', stationId: 'station-001', date: '2026-02-21', shiftId: 'shift-003', shiftName: '夜班', shiftStartTime: '22:00', shiftEndTime: '06:00', employeeId: 'emp-003', employeeName: '王伟' },
  // Sunday 2/22
  { id: 'sch-019', stationId: 'station-001', date: '2026-02-22', shiftId: 'shift-001', shiftName: '早班', shiftStartTime: '06:00', shiftEndTime: '14:00', employeeId: 'emp-003', employeeName: '王伟' },
  { id: 'sch-020', stationId: 'station-001', date: '2026-02-22', shiftId: 'shift-002', shiftName: '中班', shiftStartTime: '14:00', shiftEndTime: '22:00', employeeId: 'emp-002', employeeName: '李强' },
  { id: 'sch-021', stationId: 'station-001', date: '2026-02-22', shiftId: 'shift-003', shiftName: '夜班', shiftStartTime: '22:00', shiftEndTime: '06:00', employeeId: 'emp-001', employeeName: '张建国' },

  // 上海浦东 station-002 (some sample data)
  { id: 'sch-100', stationId: 'station-002', date: '2026-02-16', shiftId: 'shift-004', shiftName: '早班', shiftStartTime: '06:00', shiftEndTime: '12:00', employeeId: 'emp-007', employeeName: '李明华' },
  { id: 'sch-101', stationId: 'station-002', date: '2026-02-16', shiftId: 'shift-005', shiftName: '中班', shiftStartTime: '12:00', shiftEndTime: '18:00', employeeId: 'emp-008', employeeName: '陈磊' },
  { id: 'sch-102', stationId: 'station-002', date: '2026-02-16', shiftId: 'shift-006', shiftName: '晚班', shiftStartTime: '18:00', shiftEndTime: '00:00', employeeId: 'emp-009', employeeName: '周杰' },
  { id: 'sch-103', stationId: 'station-002', date: '2026-02-16', shiftId: 'shift-007', shiftName: '夜班', shiftStartTime: '00:00', shiftEndTime: '06:00', employeeId: 'emp-010', employeeName: '吴勇' },
];

// Helper: get schedules for a station and date range
export function getSchedulesForStation(stationId: string, startDate: string, endDate: string): ShiftScheduleEntry[] {
  return shiftSchedules.filter(
    s => s.stationId === stationId && s.date >= startDate && s.date <= endDate
  );
}

// Helper: get current shift for a station (based on current time mock)
export function getCurrentShiftSchedule(stationId: string): ShiftScheduleEntry | undefined {
  // For demo: always return today's early shift for station-001
  const today = '2026-02-16';
  const schedules = shiftSchedules.filter(s => s.stationId === stationId && s.date === today);
  // Simulate: current time is during early shift
  return schedules.find(s => s.shiftName === '早班');
}

// Helper: get next shift for a station
export function getNextShiftSchedule(stationId: string): ShiftScheduleEntry | undefined {
  const today = '2026-02-16';
  const schedules = shiftSchedules.filter(s => s.stationId === stationId && s.date === today);
  return schedules.find(s => s.shiftName === '中班');
}
