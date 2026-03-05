import React from 'react';
import { CCard, CCardBody, CCardHeader, CRow, CCol, CWidgetStatsA } from '@coreui/react';

const ManagerDashboard = () => {
  return (
    <div>
      <h1 className="mb-4">Manager Dashboard</h1>

      <CRow>
        <CCol sm={6} lg={3}>
          <CWidgetStatsA
            color="primary"
            value="42"
            title="Open Tickets"
            action="Manage"
          />
        </CCol>
        <CCol sm={6} lg={3}>
          <CWidgetStatsA
            color="info"
            value="18"
            title="Assigned to Team"
            action="View Team"
          />
        </CCol>
        <CCol sm={6} lg={3}>
          <CWidgetStatsA
            color="warning"
            value="7"
            title="Overdue"
            action="Prioritize"
          />
        </CCol>
        <CCol sm={6} lg={3}>
          <CWidgetStatsA
            color="danger"
            value="89%"
            title="Resolution Rate"
            action="Reports"
          />
        </CCol>
      </CRow>

      <CCard className="mb-4">
        <CCardHeader>Team Activity • Quick Assign</CCardHeader>
        <CCardBody>
          {/* Ticket list with assign dropdown, team stats, etc. */}
          <p>Recent assignments • Unassigned tickets • Team performance</p>
        </CCardBody>
      </CCard>
    </div>
  );
};

export default ManagerDashboard;