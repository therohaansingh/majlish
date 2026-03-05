// src/views/ctu/CTUView.js
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Papa from 'papaparse' // npm install papaparse

import {
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody,
  CListGroup,
  CListGroupItem,
  CBadge,
  CButton,
  CSpinner,
  CAlert,
  CFormTextarea,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/react'

const CTUView = () => {
  const { caseId } = useParams()
  const navigate = useNavigate()

  const [caseData, setCaseData] = useState(null)
  const [updates, setUpdates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Main case details (Apps Script)
  const MAIN_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwtewlM_jfhj0ecHU54sMk0jSgkVXxKj6belJt4hLi7GN7wW3B5EN6iSNZNo1EAcCiIIw/exec'

  // Public CSV for updates
  const UPDATES_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQVzEoD0pBG8KXFQ1asSJDJB7--S72TqxBiLhP-lO69ubi1A6UgagZlFGly1MlH_yR7mlFZTrqAfPz6/pub?output=csv'

  useEffect(() => {
    if (!caseId) {
      setError('No Case ID provided in URL')
      setLoading(false)
      return
    }

    const fetchData = async () => {
      let normalizedId = String(caseId).trim().toUpperCase() // declare outside try

      try {
        // 1. Fetch main case details
        const mainRes = await fetch(MAIN_SCRIPT_URL, { method: 'GET', mode: 'cors' })
        if (!mainRes.ok) throw new Error(`Main script error: ${mainRes.status}`)

        const mainJson = await mainRes.json()
        if (mainJson.status !== 'success' || !Array.isArray(mainJson.data)) {
          throw new Error(mainJson.message || 'Invalid main data format')
        }

        const foundCase = mainJson.data.find(item => {
          const itemId = String(item['Case ID'] || item['CaseID'] || '').trim().toUpperCase()
          return itemId === normalizedId
        })

        if (!foundCase) {
          const available = mainJson.data.map(item => item['Case ID'] || 'missing')
          console.log('Available Case IDs:', available)
          throw new Error(`No case found with ID: "${caseId}"`)
        }

        setCaseData(foundCase)

        // 2. Fetch updates from public CSV
        const csvRes = await fetch(UPDATES_CSV_URL)
        if (!csvRes.ok) throw new Error(`CSV fetch failed: ${csvRes.status}`)

        const csvText = await csvRes.text()

        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          transformHeader: h => h.trim(),
          complete: (result) => {
            if (result.errors.length > 0) {
              console.warn('PapaParse parsing issues:', result.errors)
            }

            const allRows = result.data || []

            // Filter for current caseId
            const filtered = allRows.filter(row => {
              const rowCaseId = String(row['CaseIDupdate1'] || row['CaseID'] || '').trim().toUpperCase()
              return rowCaseId === normalizedId
            })

            // Flatten multiple update columns into separate update objects
            const flattenedUpdates = []
            filtered.forEach(row => {
              for (let i = 1; i <= 30; i++) { // support up to update30, change if needed
                const tsKey = `update${i}`
                const timestamp = row[tsKey]?.trim()
                if (timestamp && timestamp !== '') {
                  flattenedUpdates.push({
                    timestamp,
                    location: row['Location'] || '',
                    peopleShort: row['People (short)'] || '',
                    people: row['People'] || '',
                    stage: row['Stage'] || '',
                    nextDate: row['Next Date'] || '',
                    remark: row['Remark'] || '',
                    task: row['TASK'] || ''
                  })
                }
              }
            })

            // Sort newest first
            flattenedUpdates.sort((a, b) => {
              const dateA = new Date(a.timestamp || 0)
              const dateB = new Date(b.timestamp || 0)
              return dateB - dateA
            })

            setUpdates(flattenedUpdates)
          },
          error: (err) => {
            console.error('PapaParse error:', err)
            setUpdates([])
          }
        })

      } catch (err) {
        console.error('Fetch error:', err)
        setError(err.message || 'Failed to load case or updates')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [caseId])

  const handleBack = () => navigate('/CTU')
  const handlePrint = () => window.print()

  if (loading) {
    return (
      <CCard className="mb-4">
        <CCardBody className="text-center py-5">
          <CSpinner color="primary" variant="grow" size="lg" />
          <p className="mt-3 text-muted">Loading case & updates...</p>
        </CCardBody>
      </CCard>
    )
  }

  if (error || !caseData) {
    return (
      <CCard className="mb-4">
        <CCardBody>
          <CAlert color="danger">
            {error || 'Case not found'}
          </CAlert>
          <div className="mt-4">
            <CButton color="primary" onClick={handleBack}>
              ← Back to List
            </CButton>
            <CButton color="info" className="ms-2" onClick={() => window.location.reload()}>
              Retry
            </CButton>
          </div>
        </CCardBody>
      </CCard>
    )
  }

  // Helper for main case fields
  const renderField = (label, value) => {
    const display = value != null && value !== '' ? String(value) : '— not provided —'
    const isLongText = [
      'Briefly state your problem',
      'Violence details',
      'Case pending Details',
      'Marriage Details',
      'How did they help',
      'Who have you approached for help'
    ].includes(label)

    return (
      <CListGroupItem className="d-flex justify-content-between align-items-start py-3 border-bottom">
        <div className="fw-bold text-primary" style={{ minWidth: '260px', flexShrink: 0 }}>
          {label}
        </div>
        <div className="flex-grow-1 ms-4 text-break">
          {isLongText ? (
            <CFormTextarea
              readOnly
              plainText
              rows={Math.max(3, Math.ceil(display.length / 80))}
              value={display}
              className="bg-white border-0 p-0 m-0 text-dark lh-lg"
            />
          ) : (
            <CBadge color="primary" shape="rounded-pill" className="fs-6 px-3 py-2">
              {display}
            </CBadge>
          )}
        </div>
      </CListGroupItem>
    )
  }

  return (
    <CCard className="mb-4">
      <CCardHeader className="d-flex justify-content-between align-items-center bg-info text-white">
        <CCardTitle className="mb-0 fw-bold">
          Case Details — {caseData['Client Name'] || 'Unnamed Client'}
          {caseData['Case ID'] && ` (Case ID: ${caseData['Case ID']})`}
        </CCardTitle>
        <div>
          <CButton color="light" variant="outline" className="me-2" onClick={handleBack}>
            ← Back to List
          </CButton>
          <CButton
            color="warning"
            variant="outline"
            className="me-2"
            onClick={() => alert('Edit mode coming soon...')}
          >
            Edit Case
          </CButton>
          <CButton color="success" onClick={handlePrint}>
            Print / Export
          </CButton>
        </div>
      </CCardHeader>

      <CCardBody className="p-4">
        <CAccordion flush activeItemKey={1}>
          {/* 1. Client (C) Personal Details */}
          <CAccordionItem itemKey={1}>
            <CAccordionHeader>1. Client (C) Personal Details</CAccordionHeader>
            <CAccordionBody>
              <CListGroup flush>
                {renderField('Timestamp', caseData['Timestamp'])}
                {renderField('Client Name', caseData['Client Name'])}
                {renderField('C Mobile', caseData['C Mobile'])}
                {renderField('C Phone', caseData['C Phone'])}
                {renderField('C Email', caseData['C Email'])}
                {renderField('C Address', caseData['C Address'])}
                {renderField('C Area', caseData['C Area'])}
                {renderField('C Age', caseData['C Age'])}
                {renderField('C Gender', caseData['C Gender'])}
                {renderField('C Religion', caseData['C Religion'])}
                {renderField('C Education', caseData['C Education'])}
                {renderField('C Occupation', caseData['C Occupation'])}
                {renderField('C Income p/m', caseData['C Income p/m'])}
                {renderField('C Class', caseData['C Class'])}
              </CListGroup>
            </CAccordionBody>
          </CAccordionItem>

          {/* 2. Children */}
          <CAccordionItem itemKey={2}>
            <CAccordionHeader>2. Children Information</CAccordionHeader>
            <CAccordionBody>
              <CListGroup flush>
                {renderField('Children Number', caseData['Children Number'])}
                {renderField('Children Gender/Age', caseData['Children Gender/Age'])}
                {renderField('Children residing with', caseData['Children residing with'])}
              </CListGroup>
            </CAccordionBody>
          </CAccordionItem>

          {/* 3. Complaint & Documents */}
          <CAccordionItem itemKey={3}>
            <CAccordionHeader>3. Complaint & Documents</CAccordionHeader>
            <CAccordionBody>
              <CListGroup flush>
                {renderField('Complaint against', caseData['Complaint against'])}
                {renderField('Documents', caseData['Documents'])}
              </CListGroup>
            </CAccordionBody>
          </CAccordionItem>

          {/* 4. Other Side (OS) */}
          <CAccordionItem itemKey={4}>
            <CAccordionHeader>4. Other Side (OS) Details</CAccordionHeader>
            <CAccordionBody>
              <CListGroup flush>
                {renderField('Other side (OS) Name', caseData['Other side (OS) Name'])}
                {renderField('OS Contact', caseData['OS Contact'])}
                {renderField('OS Area', caseData['OS Area'])}
                {renderField('OS Age', caseData['OS Age'])}
                {renderField('OS Gender', caseData['OS Gender'])}
                {renderField('OS Religion', caseData['OS Religion'])}
                {renderField('OS Education', caseData['OS Education'])}
                {renderField('OS Occupation', caseData['OS Occupation'])}
                {renderField('OS Income p/m', caseData['OS Income p/m'])}
                {renderField('OS Class', caseData['OS Class'])}
              </CListGroup>
            </CAccordionBody>
          </CAccordionItem>

          {/* 5. Marriage */}
          <CAccordionItem itemKey={5}>
            <CAccordionHeader>5. Marriage Information</CAccordionHeader>
            <CAccordionBody>
              <CListGroup flush>
                {renderField('Marriage Details', caseData['Marriage Details'])}
                {renderField('Marriage Date', caseData['Marriage Date'])}
                {renderField('Marriage Act', caseData['Marriage Act'])}
                {renderField('Marriage Registered', caseData['Marriage Registered'])}
                {renderField('Marriage City', caseData['Marriage City'])}
                {renderField('Husband Affair', caseData['Husband Affair'])}
                {renderField('Husband Polygamy', caseData['Husband Polygamy'])}
                {renderField('She is 1st/2nd wife:', caseData['She is 1st/2nd wife:'])}
              </CListGroup>
            </CAccordionBody>
          </CAccordionItem>

          {/* 6. Problem & Violence */}
          <CAccordionItem itemKey={6}>
            <CAccordionHeader>6. Problem, Violence & Case Status</CAccordionHeader>
            <CAccordionBody>
              <CListGroup flush>
                {renderField('Violence details', caseData['Violence details'])}
                {renderField('Briefly state your problem', caseData['Briefly state your problem'])}
                {renderField('Who have you approached for help', caseData['Who have you approached for help'])}
                {renderField('How did they help', caseData['How did they help'])}
                {renderField('Case pending', caseData['Case pending'])}
                {renderField('Case pending Details', caseData['Case pending Details'])}
              </CListGroup>
            </CAccordionBody>
          </CAccordionItem>

          {/* 7. Referral & Additional Info */}
          <CAccordionItem itemKey={7}>
            <CAccordionHeader>7. Referral & Additional Info</CAccordionHeader>
            <CAccordionBody>
              <CListGroup flush>
                {renderField('How did you hear about Majlis', caseData['How did you hear about Majlis'])}
                {renderField('Reference Name & Contact No', caseData['Reference Name & Contact No'])}
                {renderField('Preferred Language for Consultation', caseData['Preferred Language for Consultation'])}
                {renderField('Form filled by', caseData['Form filled by'])}
                {renderField('Case ID', caseData['Case ID'])}
              </CListGroup>
            </CAccordionBody>
          </CAccordionItem>

          {/* 8. Updates Section – flattened from multiple columns */}
          <CAccordionItem itemKey={8}>
            <CAccordionHeader>8. Case Updates History</CAccordionHeader>
            <CAccordionBody>
              {updates.length === 0 ? (
                <p className="text-center text-muted py-4">
                  No updates recorded for Case ID {caseId} yet.
                </p>
              ) : (
                <CTable hover responsive striped className="mb-0">
                  <CTableHead color="light">
                    <CTableRow>
                      <CTableHeaderCell>#</CTableHeaderCell>
                      <CTableHeaderCell>updates</CTableHeaderCell>
                      {/* <CTableHeaderCell>Location</CTableHeaderCell> */}
                      {/* <CTableHeaderCell>People (short)</CTableHeaderCell> */}
                      {/* <CTableHeaderCell>People</CTableHeaderCell> */}
                      {/* <CTableHeaderCell>Stage</CTableHeaderCell> */}
                      {/* <CTableHeaderCell>Next Date</CTableHeaderCell> */}
                      {/* <CTableHeaderCell>Remark</CTableHeaderCell> */}
                      {/* <CTableHeaderCell>Task</CTableHeaderCell> */}
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {updates.map((update, idx) => (
                      <CTableRow key={idx}>
                        <CTableDataCell>{idx + 1}</CTableDataCell>
                        <CTableDataCell>{update.timestamp || '—'}</CTableDataCell>
                        {/* <CTableDataCell>{update.location || '—'}</CTableDataCell> */}
                        {/* <CTableDataCell>{update.peopleShort || '—'}</CTableDataCell> */}
                        {/* <CTableDataCell>{update.people || '—'}</CTableDataCell> */}
                        {/* <CTableDataCell>{update.stage || '—'}</CTableDataCell> */}
                        {/* <CTableDataCell>{update.nextDate || '—'}</CTableDataCell> */}
                        {/* <CTableDataCell>{update.remark || '—'}</CTableDataCell> */}
                        {/* <CTableDataCell>{update.task || '—'}</CTableDataCell> */}
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              )}
            </CAccordionBody>
          </CAccordionItem>
        </CAccordion>

        <div className="mt-4 text-center text-muted small">
          Record & updates loaded on {new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
        </div>
      </CCardBody>
    </CCard>
  )
}

export default CTUView