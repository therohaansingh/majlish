// src/views/dashboard/Dashboard.js
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CRow,
  CCol,
  CWidgetStatsF,
  CCard,
  CCardBody,
  CCardHeader,
  CFormInput,
  CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CSpinner,
  CAlert,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch, cilMagnifyingGlass } from '@coreui/icons'

const MAIN_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwtewlM_jfhj0ecHU54sMk0jSgkVXxKj6belJt4hLi7GN7wW3B5EN6iSNZNo1EAcCiIIw/exec'

const AdminDashboard = () => {
  const navigate = useNavigate()

  const [cases, setCases] = useState([])
  const [filteredCases, setFilteredCases] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch real cases
  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await fetch(MAIN_SCRIPT_URL, { method: 'GET', mode: 'cors' })
        if (!res.ok) throw new Error('Failed to fetch data')

        const json = await res.json()
        if (json.status === 'success') {
          setCases(json.data || [])
          setFilteredCases(json.data || [])
        } else {
          throw new Error(json.message || 'API error')
        }
      } catch (err) {
        console.error(err)
        setError(err.message || 'Failed to load tickets')
      } finally {
        setLoading(false)
      }
    }

    fetchCases()
  }, [])

  // Live search
  useEffect(() => {
    const term = searchTerm.toLowerCase().trim()
    if (!term) {
      setFilteredCases(cases)
      return
    }

    const filtered = cases.filter(item =>
      (item['Client Name'] || '').toLowerCase().includes(term) ||
      (item['Case ID'] || '').toLowerCase().includes(term) ||
      (item['C Mobile'] || '').includes(term) ||
      (item['Briefly state your problem'] || '').toLowerCase().includes(term)
    )
    setFilteredCases(filtered)
  }, [searchTerm, cases])

  // Count only rows where Case ID contains "Case" (case-insensitive)
  const caseCount = filteredCases.filter(item => 
    String(item['Case ID'] || '').toUpperCase().includes('CASE')
  ).length

  // Summary
  const summary = {
    open: cases.length,
    assignedMe: Math.floor(cases.length * 0.3),
    assignedOthers: Math.floor(cases.length * 0.5),
    unassigned: Math.floor(cases.length * 0.2),
    dueSoon: Math.floor(cases.length * 0.08),
    overdue: Math.floor(cases.length * 0.05),
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <CSpinner color="primary" variant="grow" size="lg" />
        <p className="mt-3">Loading tickets...</p>
      </div>
    )
  }

  if (error) {
    return <CAlert color="danger" className="m-4">{error}</CAlert>
  }

  return (
    <>
      {/* Summary Stats */}
      <CRow className="mb-4">
        <CCol xs={12} sm={6} lg={2} className="mb-3">
          <CWidgetStatsF color="primary" title="Open tickets" value={summary.open} />
        </CCol>
        <CCol xs={6} sm={6} lg={2} className="mb-3">
          <CWidgetStatsF color="info" title="Assigned to me" value={summary.assignedMe} />
        </CCol>
        <CCol xs={6} sm={6} lg={2} className="mb-3">
          <CWidgetStatsF color="success" title="Assigned to others" value={summary.assignedOthers} />
        </CCol>
        <CCol xs={6} sm={6} lg={2} className="mb-3">
          <CWidgetStatsF color="warning" title="Unassigned" value={summary.unassigned} />
        </CCol>
        <CCol xs={6} sm={6} lg={2} className="mb-3">
          <CWidgetStatsF color="info" title="Due soon" value={summary.dueSoon} />
        </CCol>
        <CCol xs={6} sm={6} lg={2} className="mb-3">
          <CWidgetStatsF color="danger" title="Overdue" value={summary.overdue} />
        </CCol>
      </CRow>

      {/* Search Bar */}
      <CCard className="mb-4">
        <CCardHeader><strong>Find a Ticket</strong></CCardHeader>
        <CCardBody>
          <CRow className="g-3">
            <CCol md={8}>
              <CFormInput
                placeholder="Search by Client Name, Case ID, Mobile or Problem..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </CCol>
            <CCol md={4}>
              <CButton color="primary" className="w-100">
                <CIcon icon={cilSearch} className="me-1" /> Search
              </CButton>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>

      {/* Tickets Table */}
      <CCard>
        <CCardHeader>
          <strong>All Tickets ({caseCount})</strong>
        </CCardHeader>
        <CCardBody>
          <CTable hover responsive striped>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Case ID</CTableHeaderCell>
                <CTableHeaderCell>Client Name</CTableHeaderCell>
                <CTableHeaderCell>Mobile</CTableHeaderCell>
                <CTableHeaderCell>Problem Summary</CTableHeaderCell>
                <CTableHeaderCell>Filled By</CTableHeaderCell>
                <CTableHeaderCell>Timestamp</CTableHeaderCell>
                <CTableHeaderCell>Action</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {filteredCases.length === 0 ? (
                <CTableRow>
                  <CTableDataCell colSpan="7" className="text-center py-4 text-muted">
                    No tickets found
                  </CTableDataCell>
                </CTableRow>
              ) : (
                filteredCases.map((ticket, index) => (
                  <CTableRow key={index}>
                    <CTableDataCell><strong>{ticket['Case ID'] || '—'}</strong></CTableDataCell>
                    <CTableDataCell>{ticket['Client Name'] || '—'}</CTableDataCell>
                    <CTableDataCell>{ticket['C Mobile'] || '—'}</CTableDataCell>
                    <CTableDataCell>
                      {String(ticket['Briefly state your problem'] || '').substring(0, 60)}...
                    </CTableDataCell>
                    <CTableDataCell>{ticket['Form filled by'] || '—'}</CTableDataCell>
                    <CTableDataCell>{ticket['Timestamp'] || '—'}</CTableDataCell>
                    <CTableDataCell>
                      <CButton
                        color="info"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const cid = ticket['Case ID']
                          if (cid) navigate(`/CTU/CTUView/${encodeURIComponent(cid)}`)
                        }}
                      >
                        <CIcon icon={cilMagnifyingGlass} className="me-1" /> View
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))
              )}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>
    </>
  )
}

export default AdminDashboard