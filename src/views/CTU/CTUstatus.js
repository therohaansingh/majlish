import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CFormSelect,
  CBadge,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCheckCircle, cilSync } from '@coreui/icons'

// ──────────────────────────────────────────────
// URLs – make sure these match your deployed web apps
// ──────────────────────────────────────────────
const CASES_URL    = 'https://script.google.com/macros/s/AKfycbzJAY19Rrbu0l6A3CxyF9Gve-FFoMFZy7Qb15DGoAaMkvBa4ZFvb3pmvOKCPo5lW1QWCA/exec'
const CONTACTS_URL = 'https://script.google.com/macros/s/AKfycbylw07t0hTee_ysuWsSL_D01gq0WRW70ZO4AHQ1sqoKJaUREXJUDUxDTswzOrRHIUfqQw/exec'

const statusVariants = {
  Pending:     'warning',
  'In Progress': 'info',
  Resolved:    'success',
  Closed:      'secondary',
  Rejected:    'danger',
  // Add more statuses here if needed
}

const CTUstatus = () => {
  const [cases, setCases] = useState([])
  const [users, setUsers] = useState([])           // array of { value, label }
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)  // global updating state
  const [error, setError] = useState(null)

  const fetchCases = async () => {
    try {
      const res = await fetch(`${CASES_URL}?action=getAll`)
      const json = await res.json()

      if (json.success) {
        setCases(json.data || [])
        setError(null)
      } else {
        setError(json.error || 'Failed to load cases')
      }
    } catch (err) {
      setError(`Network error (cases): ${err.message}`)
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await fetch(CONTACTS_URL)
      const json = await res.json()

      if (json.status === 'success') {
        const userOptions = (json.data || [])
          .filter(u => u.Username?.trim())
          .map(u => ({
            value: u.Username.trim(),
            label: u.Name?.trim()
              ? `${u.Name.trim()} (${u.Username.trim()})`
              : u.Username.trim(),
          }))

        setUsers(userOptions)
      } else {
        console.warn('Failed to load users:', json.message || json.error)
      }
    } catch (err) {
      console.error('Error fetching users:', err)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchCases(), fetchUsers()])
      setLoading(false)
    }
    loadData()
  }, [])

  const updateCase = async (caseId, updates) => {
    if (!caseId) return

    setUpdating(true)
    try {
      // console.log('Sending update:', { caseId, ...updates }) // ← uncomment for debug

      await fetch(CASES_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', caseId, ...updates }),
      })

      // Because of no-cors we can't check response → assume success & refresh
      await fetchCases()
    } catch (err) {
      alert(`Update failed: ${err.message}`)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <CRow>
      <CCol>
        <CCard>
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <strong>CTU Case Status Dashboard</strong>
            <CButton
              color="info"
              variant="outline"
              size="sm"
              onClick={fetchCases}
              disabled={loading || updating}
            >
              <CIcon icon={cilSync} className="me-1" />
              Refresh
            </CButton>
          </CCardHeader>

          <CCardBody>
            {error && (
              <div className="alert alert-danger mb-3">{error}</div>
            )}

            {loading ? (
              <div className="text-center py-5">
                <CSpinner color="primary" variant="grow" />
                <p className="mt-3 text-muted">Loading cases and team members...</p>
              </div>
            ) : cases.length === 0 ? (
              <p className="text-center text-muted py-5">
                No cases found in the sheet yet.
              </p>
            ) : (
              <CTable hover responsive striped bordered className="table-sm">
                <CTableHead color="light">
                  <CTableRow>
                    <CTableHeaderCell scope="col">Case ID</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Assigned To</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Status</CTableHeaderCell>
                    <CTableHeaderCell scope="col" className="text-center">
                      Actions
                      {updating && (
                        <CSpinner size="sm" color="primary" className="ms-2" />
                      )}
                    </CTableHeaderCell>
                  </CTableRow>
                </CTableHead>

                <CTableBody>
                  {cases.map((item) => (
                    <CTableRow key={item.CaseID}>
                      <CTableDataCell className="fw-medium">
                        {item.CaseID || '—'}
                      </CTableDataCell>

                      <CTableDataCell>
                        <CFormSelect
                          size="sm"
                          style={{ minWidth: '240px' }}
                          disabled={updating}
                          onChange={(e) => updateCase(item.CaseID, { assignedTo: e.target.value })}
                          value={item['Assigned to'] || ''}
                        >
                          <option value="">Unassigned</option>
                          {users.length === 0 ? (
                            <option disabled>No users available</option>
                          ) : (
                            users.map((user) => (
                              <option key={user.value} value={user.value}>
                                {user.label}
                              </option>
                            ))
                          )}
                        </CFormSelect>
                      </CTableDataCell>

                      <CTableDataCell>
                        <CBadge
                          color={statusVariants[item.Status] || 'dark'}
                          shape="rounded-pill"
                        >
                          {item.Status || '—'}
                        </CBadge>
                      </CTableDataCell>

                      <CTableDataCell className="text-center">
                        <div className="d-flex justify-content-center gap-2 flex-wrap">
                          <CFormSelect
                            size="sm"
                            style={{ width: '150px' }}
                            disabled={updating}
                            onChange={(e) => updateCase(item.CaseID, { status: e.target.value })}
                            value={item.Status || ''}
                          >
                            <option value="">Change Status</option>
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Closed">Closed</option>
                            <option value="Rejected">Rejected</option>
                          </CFormSelect>

                          <CButton
                            color="success"
                            size="sm"
                            variant="outline"
                            disabled={updating}
                            onClick={() => updateCase(item.CaseID, { status: 'Resolved' })}
                          >
                            <CIcon icon={cilCheckCircle} className="me-1" />
                            Resolve
                          </CButton>
                        </div>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default CTUstatus