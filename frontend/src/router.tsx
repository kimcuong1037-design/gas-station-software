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
const HandoverHistory = lazy(() => import('./features/operations/shift-handover/pages/HandoverHistory'));
const HandoverDetail = lazy(() => import('./features/operations/shift-handover/pages/HandoverDetail'));
const ShiftHandoverWizard = lazy(() => import('./features/operations/shift-handover/pages/ShiftHandoverWizard'));
const SettlementReview = lazy(() => import('./features/operations/shift-handover/pages/SettlementReview'));

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
          {
            path: 'equipment',
            element: <div>设备管理 - 待开发</div>,
          },
          {
            path: 'inspection',
            element: <div>巡检管理 - 待开发</div>,
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
