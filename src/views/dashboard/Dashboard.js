import React from 'react';
import { getUserRole } from '../../utils/auth';

import UserDashboard from './UserDashboard';
import ManagerDashboard from './ManagerDashboard';
import AdminDashboard from './AdminDashboard';
import SuperadminDashboard from './SuperadminDashboard';

const Dashboard = () => {
  const role = getUserRole();

  switch (role) {
    case 'superadmin':
      return <SuperadminDashboard />;
    case 'admin':
      return <AdminDashboard />;
    case 'manager':
      return <ManagerDashboard />;
    default:
      return <UserDashboard />;
  }
};

export default Dashboard;