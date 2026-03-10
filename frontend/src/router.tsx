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

// Price Management pages
const PriceOverview = lazy(() => import('./features/energy-trade/price-management/pages/PriceOverview'));
const AdjustmentHistory = lazy(() => import('./features/energy-trade/price-management/pages/AdjustmentHistory'));
const PriceDisplayBoard = lazy(() => import('./features/energy-trade/price-management/pages/PriceDisplayBoard'));
const ApprovalList = lazy(() => import('./features/energy-trade/price-management/pages/ApprovalList'));
const MemberPriceList = lazy(() => import('./features/energy-trade/price-management/pages/MemberPriceList'));
const AgreementList = lazy(() => import('./features/energy-trade/price-management/pages/AgreementList'));
const PriceSettings = lazy(() => import('./features/energy-trade/price-management/pages/PriceSettings'));

// Order Transaction pages
const OrderList = lazy(() => import('./features/energy-trade/order-transaction/pages/OrderList'));
const ExceptionOrderList = lazy(() => import('./features/energy-trade/order-transaction/pages/ExceptionOrderList'));
const RefundManagement = lazy(() => import('./features/energy-trade/order-transaction/pages/RefundManagement'));
const OrderSettings = lazy(() => import('./features/energy-trade/order-transaction/pages/OrderSettings'));

// Data Analytics pages
const BusinessDashboard = lazy(() => import('./features/analytics/data-analytics/pages/BusinessDashboard'));
const SalesAnalysis = lazy(() => import('./features/analytics/data-analytics/pages/SalesAnalysis'));
const CustomerAnalysis = lazy(() => import('./features/analytics/data-analytics/pages/CustomerAnalysis'));

// Report Center pages
const ReportOverview = lazy(() => import('./features/analytics/report-center/pages/ReportOverview'));
const StandardReport = lazy(() => import('./features/analytics/report-center/pages/StandardReport'));
const CustomReport = lazy(() => import('./features/analytics/report-center/pages/CustomReport'));

// Inventory Management pages
const InventoryOverview = lazy(() => import('./features/energy-trade/inventory-management/pages/InventoryOverview'));
const InboundManagement = lazy(() => import('./features/energy-trade/inventory-management/pages/InboundManagement'));
const OutboundRecords = lazy(() => import('./features/energy-trade/inventory-management/pages/OutboundRecords'));
const TransactionLedger = lazy(() => import('./features/energy-trade/inventory-management/pages/TransactionLedger'));
const TankComparison = lazy(() => import('./features/energy-trade/inventory-management/pages/TankComparison'));
const AlertManagement = lazy(() => import('./features/energy-trade/inventory-management/pages/AlertManagement'));

// API Docs page (standalone, no AppLayout)
const ApiDocs = lazy(() => import('./pages/ApiDocs'));

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
    // API Docs 独立页面，不包含 AppLayout 导航结构
    path: '/api-docs',
    element: (
      <Suspense fallback={<PageLoading />}>
        <ApiDocs />
      </Suspense>
    ),
  },
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
      // Energy Trade routes
      {
        path: 'energy-trade',
        children: [
          {
            index: true,
            element: <Navigate to="/energy-trade/price-management" replace />,
          },
          {
            path: 'price-management',
            children: [
              {
                index: true,
                element: withSuspense(PriceOverview),
              },
              {
                path: 'history',
                element: withSuspense(AdjustmentHistory),
              },
              {
                path: 'board',
                element: withSuspense(PriceDisplayBoard),
              },
              {
                path: 'approvals',
                element: withSuspense(ApprovalList),
              },
              {
                path: 'member-prices',
                element: withSuspense(MemberPriceList),
              },
              {
                path: 'agreements',
                element: withSuspense(AgreementList),
              },
              {
                path: 'settings',
                element: withSuspense(PriceSettings),
              },
            ],
          },
          // Order Transaction routes
          {
            path: 'order',
            children: [
              {
                index: true,
                element: withSuspense(OrderList),
              },
              {
                path: 'exceptions',
                element: withSuspense(ExceptionOrderList),
              },
              {
                path: 'refunds',
                element: withSuspense(RefundManagement),
              },
              {
                path: 'settings',
                element: withSuspense(OrderSettings),
              },
            ],
          },
          // Inventory Management routes
          {
            path: 'inventory',
            children: [
              {
                index: true,
                element: <Navigate to="/energy-trade/inventory/overview" replace />,
              },
              {
                path: 'overview',
                element: withSuspense(InventoryOverview),
              },
              {
                path: 'inbound',
                element: withSuspense(InboundManagement),
              },
              {
                path: 'outbound',
                element: withSuspense(OutboundRecords),
              },
              {
                path: 'ledger',
                element: withSuspense(TransactionLedger),
              },
              {
                path: 'tank-comparison',
                element: withSuspense(TankComparison),
              },
              {
                path: 'alerts',
                element: withSuspense(AlertManagement),
              },
            ],
          },
        ],
      },
      // Data Analytics routes
      {
        path: 'analytics',
        children: [
          {
            index: true,
            element: <Navigate to="/analytics/data-analytics/dashboard" replace />,
          },
          {
            path: 'data-analytics',
            children: [
              {
                index: true,
                element: <Navigate to="/analytics/data-analytics/dashboard" replace />,
              },
              {
                path: 'dashboard',
                element: withSuspense(BusinessDashboard),
              },
              {
                path: 'sales',
                element: withSuspense(SalesAnalysis),
              },
              {
                path: 'customers',
                element: withSuspense(CustomerAnalysis),
              },
            ],
          },
          {
            path: 'report-center',
            children: [
              {
                index: true,
                element: <Navigate to="/analytics/report-center/overview" replace />,
              },
              {
                path: 'overview',
                element: withSuspense(ReportOverview),
              },
              {
                path: 'standard',
                element: withSuspense(StandardReport),
              },
              {
                path: 'custom',
                element: withSuspense(CustomReport),
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
