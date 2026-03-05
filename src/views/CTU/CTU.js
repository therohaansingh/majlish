// src/views/ctu/CTU.js
import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CSpinner,
  CAlert,
  CButton,
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'

const CTU = () => {
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const navigate = useNavigate()
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwtewlM_jfhj0ecHU54sMk0jSgkVXxKj6belJt4hLi7GN7wW3B5EN6iSNZNo1EAcCiIIw/exec'

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const response = await fetch(SCRIPT_URL, { method: 'GET', mode: 'cors' })
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const result = await response.json()

        if (result.status === 'success') {
          setCases(result.data || [])
        } else {
          throw new Error(result.message || 'API returned non-success status')
        }
      } catch (err) {
        console.error('Fetch cases failed:', err)
        setError(err.message || 'Failed to load cases')
      } finally {
        setLoading(false)
      }
    }

    fetchCases()
  }, [])

  if (loading) {
    return (
      <div className="text-center mt-5 py-5">
        <CSpinner color="primary" variant="grow" size="lg" />
        <p className="mt-3 text-muted">Loading cases…</p>
      </div>
    )
  }

  if (error) {
    return (
      <CAlert color="danger" className="m-4">
        {error}
        <div className="mt-3">
          <CButton color="primary" onClick={() => window.location.reload()}>
            Try Again
          </CButton>
        </div>
      </CAlert>
    )
  }

  return (
    <CCard>
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <div>
          <strong>Existing Cases / Tasks / Users</strong>
          <small className="ms-2 text-muted">({cases.length} records)</small>
        </div>
        <div>
          <CButton
            color="success"
            className="me-2"
            onClick={() => navigate('/CTU/new')}
          >
            + New Case
          </CButton>
          <CButton color="info" onClick={() => window.location.reload()}>
            Refresh List
          </CButton>
        </div>
      </CCardHeader>

      <CCardBody>
        {cases.length === 0 ? (
          <div className="text-center text-muted my-5 py-5">
            <p className="fs-5">No cases found yet.</p>
            <p>Click "New Case" to add your first record.</p>
          </div>
        ) : (
          <CTable hover responsive striped className="mb-0">
            <CTableHead color="light">
              <CTableRow>
                <CTableHeaderCell scope="col">Timestamp</CTableHeaderCell>
                <CTableHeaderCell scope="col">Case ID</CTableHeaderCell>
                <CTableHeaderCell scope="col">C Mobile</CTableHeaderCell>
                <CTableHeaderCell scope="col">Problem (short)</CTableHeaderCell>
                <CTableHeaderCell scope="col">Filled by</CTableHeaderCell>
                <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {cases.map((item, index) => {
                // Safe string conversion for problem field
                const problemText = String(item['Briefly state your problem'] || '')

                return (
                  <CTableRow key={index}>
                    <CTableDataCell>{item['Timestamp'] || '—'}</CTableDataCell>
                    <CTableDataCell>{item['Case ID'] || '—'}</CTableDataCell>
                    <CTableDataCell>{item['C Mobile'] || '—'}</CTableDataCell>
                    <CTableDataCell>
                      {problemText.substring(0, 70)}
                      {problemText.length > 70 ? '…' : ''}
                    </CTableDataCell>
                    <CTableDataCell>{item['Form filled by'] || '—'}</CTableDataCell>
                    <CTableDataCell>
                      <CButton
                        color="info"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const caseId = item['Case ID']
                          if (caseId && String(caseId).trim() !== '') {
                            navigate(`/CTU/CTUView/${encodeURIComponent(caseId)}`)
                          } else {
                            alert('This case has no valid Case ID – cannot open details')
                          }
                        }}
                      >
                        View
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                )
              })}
            </CTableBody>
          </CTable>
        )}
      </CCardBody>
    </CCard>
  )
}

export default CTU