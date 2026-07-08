import { Outlet } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';

export default function AdminLayout() {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}