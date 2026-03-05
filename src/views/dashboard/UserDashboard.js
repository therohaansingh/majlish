import React from 'react'
import {
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardTitle,
  CWidgetStatsF,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/react'
import { cilTask, cilBell, cilUser } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

const UserDashboard = () => {
  return (
    <>
      <CRow>
        <CCol sm={4}>
          <CWidgetStatsF
            className="mb-4"
            icon={<CIcon icon={cilTask} size="xl" />}
            title="Assigned Cases"
            value="12"
          />
        </CCol>
        <CCol sm={4}>
          <CWidgetStatsF
            className="mb-4"
            icon={<CIcon icon={cilBell} size="xl" />}
            title="Pending Reminders"
            value="5"
          />
        </CCol>
        <CCol sm={4}>
          <CWidgetStatsF
            className="mb-4"
            icon={<CIcon icon={cilUser} size="xl" />}
            title="Active Tasks"
            value="8"
          />
        </CCol>
      </CRow>

      <CCard>
        <CCardBody>
          <CCardTitle>Recent Activity</CCardTitle>
          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Case ID</CTableHeaderCell>
                <CTableHeaderCell>Status</CTableHeaderCell>
                <CTableHeaderCell>Date</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              <CTableRow>
                <CTableDataCell>CASE-001</CTableDataCell>
                <CTableDataCell>In Progress</CTableDataCell>
                <CTableDataCell>01 Mar 2026</CTableDataCell>
              </CTableRow>
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>
    </>
  )
}

export default UserDashboard