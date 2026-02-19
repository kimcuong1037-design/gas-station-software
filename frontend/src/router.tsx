import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';

// Lazy load feature pages
import { lazy, Suspense } from 'react';
import { Spin } from 'antd';

const StationList = lazy(() => import('./features/operations/station/pages/StationList'));
const StationDetail = lazy(() => import('./features/operations/station/pages/StationDetail'));
const StationForm = lazy(() => import('./features/operations/station/pages/StationForm'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Shift Handover pages
const ShiftSummary = lazy(() => import('./features/operations/shift-handover/pages/ShiftSummary'));
// ShiftSchedule moved to station module as ShiftSchedulePanel
const HandoverHistory = lazy(() => import('./features/operations/shift-handover/pages/HandoverHistory'));
const HandoverDetail = lazy(() => import('./features/operations/shift-handover/pages/HandoverDetail'));
const ShiftHandoverWizard = lazy(() => import('./features/operations/shift-handover/pages/ShiftHandoverWizard'));
const SettlementReview = lazy(() => import('./features/operations/shift-handover/pages/SettlementReview'));

// Device Ledger pages
const FacilityMonitoringDashboard = lazy(() => import('./features/operations/device-ledger/pages/FacilityMonitoringDashboard'));
const TankMonitoring = lazy(() => import('./features/operations/device-ledger/pages/TankMonitoring'));
const DispenserStatusBoard = lazy(() => import('./features/operations/device-ledger/pages/DispenserStatusBoard'));
const EquipmentList = lazy(() => import('./features/operations/device-ledger/pages/EquipmentList'));
const EquipmentDetail = lazy(() => import('./features/operations/device-ledger/pages/EquipmentDetail'));
const EquipmentForm = lazy(() => import('./features/operations/device-ledger/pages/EquipmentForm'));
const MaintenanceOrderList = lazy(() => import('./features/operations/device-ledger/pages/MaintenanceOrderList'));
const MaintenanceOrderForm = lazy(() => import('./features/operations/device-ledger/pages/MaintenanceOrderForm'));
const MaintenanceOrderDetail = lazy(() => import('./features/operations/device-ledger/pages/MaintenanceOrderDetail'));
const DeviceConnectivity = lazy(() => import('./features/operations/device-ledger/pages/DeviceConnectivity'));

// Inspection pages
const InspectionHome = lazy(() => import('./features/operations/inspection/pages/InspectionHome'));
const InspectionTaskList = lazy(() => import('./features/operations/inspection/pages/InspectionTaskList'));
const InspectionTaskExecution = lazy(() => import('./features/operations/inspection/pages/InspectionTaskExecution'));
const InspectionTaskForm = lazy(() => import('./features/operations/inspection/pages/InspectionTaskForm'));
const InspectionPlanList = lazy(() => import('./features/operations/inspection/pages/InspectionPlanList'));
const InspectionPlanForm = lazy(() => import('./features/operations/inspection/pages/InspectionPlanForm'));
const InspectionPlanDetail = lazy(() => import('./features/operations/inspection/pages/InspectionPlanDetail'));
const CheckItemList = lazy(() => import('./features/operations/inspection/pages/CheckItemList'));
const IssueRecordList = lazy(() => import('./features/operations/inspection/pages/IssueRecordList'));
const IssueRecordDetail = lazy(() => import('./features/operations/inspection/pages/IssueRecordDetail'));
const InspectionLogList = lazy(() => import('./features/operations/inspection/pages/InspectionLogList'));
const InspectionLogDetail = lazy(() => import('./features/operations/inspection/pages/InspectionLogDetail'));
const InspectionAnalytics = lazy(() => import('./features/operations/inspection/pages/InspectionAnalytics'));
const InspectionReportDetail = lazy(() => import('./features/operations/inspection/pages/InspectionReportDetail'));

// Loading component
const PageLoading = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
    <Spin size="large" />
  </div>
);

// Wrap lazy component with Suspense
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const withSuspense = (Component: React.LazyExoticComponent<React.ComponentType<any>>) => (
  <Suspense fallback={<PageLoading />}>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/operations/station" replace />,
      },
      {
        path: 'operations',
        children: [
          {
            index: true,
            element: <Navigate to="/operations/station" replace />,
          },
          {
            path: 'station',
            children: [
              {
                index: true,
                element: withSuspense(StationList),
              },
              {
                path: 'new',
                element: withSuspense(StationForm),
              },
              {
                path: ':id',
                element: withSuspense(StationDetail),
              },
              {
                path: ':id/edit',
                element: withSuspense(StationForm),
              },
            ],
          },
          // Shift Handover routes
          {
            path: 'shift-handover',
            children: [
              {
                index: true,
                element: withSuspense(ShiftSummary),
              },
              {
                // Redirect old schedule route to station module
                path: 'schedule',
                element: <Navigate to="/operations/station" replace />,
              },
              {
                path: 'handover',
                element: withSuspense(ShiftHandoverWizard),
              },
              {
                path: 'history',
                element: withSuspense(HandoverHistory),
              },
              {
                path: 'detail/:id',
                element: withSuspense(HandoverDetail),
              },
              {
                path: 'settlement-review',
                element: withSuspense(SettlementReview),
              },
            ],
          },
          // Device Ledger routes
          {
            path: 'device-ledger',
            children: [
              {
                index: true,
                element: withSuspense(FacilityMonitoringDashboard),
              },
              {
                path: 'monitoring',
                element: withSuspense(FacilityMonitoringDashboard),
              },
              {
                path: 'monitoring/tanks',
                element: withSuspense(TankMonitoring),
              },
              {
                path: 'monitoring/dispensers',
                element: withSuspense(DispenserStatusBoard),
              },
              {
                path: 'equipment',
                children: [
                  {
                    index: true,
                    element: withSuspense(EquipmentList),
                  },
                  {
                    path: 'create',
                    element: withSuspense(EquipmentForm),
                  },
                  {
                    path: ':id',
                    element: withSuspense(EquipmentDetail),
                  },
                  {
                    path: ':id/edit',
                    element: withSuspense(EquipmentForm),
                  },
                ],
              },
              {
                path: 'maintenance',
                children: [
                  {
                    index: true,
                    element: withSuspense(MaintenanceOrderList),
                  },
                  {
                    path: 'create',
                    element: withSuspense(MaintenanceOrderForm),
                  },
                  {
                    path: ':id',
                    element: withSuspense(MaintenanceOrderDetail),
                  },
                ],
              },
              {
                path: 'connectivity',
                element: withSuspense(DeviceConnectivity),
              },
            ],
          },
          {
            path: 'equipment',
            element: <Navigate to="/operations/device-ledger/equipment" replace />,
          },
          {
            path: 'inspection',
            children: [
              {
                index: true,
                element: withSuspense(InspectionHome),
              },
              {
                path: 'tasks',
                children: [
                  {
                    index: true,
                    element: withSuspense(InspectionTaskList),
                  },
                  {
                    path: 'create',
                    element: withSuspense(InspectionTaskForm),
                  },
                  {
                    path: ':id',
                    element: withSuspense(InspectionTaskExecution),
                  },
                ],
              },
              {
                path: 'plans',
                children: [
                  {
                    index: true,
                    element: withSuspense(InspectionPlanList),
                  },
                  {
                    path: 'create',
                    element: withSuspense(InspectionPlanForm),
                  },
                  {
                    path: ':id',
                    element: withSuspense(InspectionPlanDetail),
                  },
                  {
                    path: ':id/edit',
                    element: withSuspense(InspectionPlanForm),
                  },
                ],
              },
              {
                path: 'check-items',
                element: withSuspense(CheckItemList),
              },
              {
                path: 'issues',
                children: [
                  {
                    index: true,
                    element: withSuspense(IssueRecordList),
                  },
                  {
                    path: ':id',
                    element: withSuspense(IssueRecordDetail),
                  },
                ],
              },
              {
                path: 'logs',
                children: [
                  {
                    index: true,
                    element: withSuspense(InspectionLogList),
                  },
                  {
                    path: ':id',
                    element: withSuspense(InspectionLogDetail),
                  },
                ],
              },
              {
                path: 'analytics',
                children: [
                  {
                    index: true,
                    element: withSuspense(InspectionAnalytics),
                  },
                  {
                    path: 'reports/:id',
                    element: withSuspense(InspectionReportDetail),
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        path: '*',
        element: withSuspense(NotFound),
      },
    ],
  },
]);
