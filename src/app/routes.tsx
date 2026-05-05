import { createBrowserRouter } from 'react-router';
import { DashboardLayout } from './components/DashboardLayout';
import { DashboardView } from './views/Dashboard';
import { WaiterView } from './views/WaiterView';
import { CashierView } from './views/CashierView';
import { KitchenView } from './views/KitchenView';
import { InventoryView } from './views/InventoryView';
import { BackOfficeView } from './views/BackOffice';
import { CategoriesView } from './views/CategoriesView';
import { ExtrasManagementView } from './views/ExtrasManagementView';
import { UsersManagement } from './views/UsersManagement';
import { TablesManagement } from './views/TablesManagement';
import { ReportsView } from './views/ReportsView';
import { SettingsView } from './views/SettingsView';
import { InvoicingView } from './views/InvoicingView';
import { SalesHistory } from './views/SalesHistory';
import { AuditLogView } from './views/AuditLog';

// Root component
function Root() {
  return <DashboardLayout />;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      { index: true, element: <DashboardView /> },
      { path: 'waiter', element: <WaiterView /> },
      { path: 'cashier', element: <CashierView /> },
      { path: 'kitchen', element: <KitchenView /> },
      { path: 'inventory', element: <InventoryView /> },
      { path: 'backoffice', element: <BackOfficeView /> },
      { path: 'categories', element: <CategoriesView /> },
      { path: 'extras', element: <ExtrasManagementView /> },
      { path: 'users', element: <UsersManagement /> },
      { path: 'tables', element: <TablesManagement /> },
      { path: 'reports', element: <ReportsView /> },
      { path: 'settings', element: <SettingsView /> },
      { path: 'invoicing', element: <InvoicingView /> },
      { path: 'saleshistory', element: <SalesHistory /> },
      { path: 'auditlog', element: <AuditLogView /> },
    ],
  },
]);