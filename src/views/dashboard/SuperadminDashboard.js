import React from 'react';
import { CCard, CCardBody, CCardHeader, CAlert } from '@coreui/react';

const SuperadminDashboard = () => {
  return (
    <div>
      <h1 className="mb-4">Super Admin Control Panel</h1>

      <CAlert color="danger" dismissible>
        Full system access – use with caution
      </CAlert>

      <CCard className="mb-4 border-top-danger border-top-3">
        <CCardHeader>System Administration</CCardHeader>
        <CCardBody>
          <ul className="list-unstyled">
            <li>• User & Role Management (create admins/managers)</li>
            <li>• Full Permissions Editor</li>
            <li>• Backup / Restore Database</li>
            <li>• System Settings (email, notifications, branding)</li>
            <li>• Audit Logs</li>
            <li>• API Keys & Integrations</li>
          </ul>
        </CCardBody>
      </CCard>

      <CCard className="mb-4 border-top-warning border-top-3">
        <CCardHeader>Danger Zone</CCardHeader>
        <CCardBody>
          <p>Reset system • Delete all data • Change core configuration</p>
        </CCardBody>
      </CCard>
    </div>
  );
};

export default SuperadminDashboard;