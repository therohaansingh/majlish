// src/views/reminders/Reminders.js

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
  CBadge,
  CSpinner,
  CForm,
  CFormInput,
  CFormSelect,
  CButton,
  CAlert,
  CCol,
  CRow,
  CTooltip,
  CFormCheck,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilCalendar,
  cilUser,
  cilClock,
  cilPlus,
  cilWarning,
  cilSync,
  cilFilter,
} from '@coreui/icons'

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyVLSy72KitRsa49IWyVeayzkK9hilno9cOd0dkJg7wXk1ILsqkZzLfvMiBIymmkxHA/exec'

const Reminders = () => {
  const [reminders, setReminders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showPersonalOnly, setShowPersonalOnly] = useState(true) // default to personal

  const [formData, setFormData] = useState({
    reminder: '',
    priority: 'Medium',
    dueDate: '',
    assignedTo: '',
  })

  const [submitStatus, setSubmitStatus] = useState({ show: false, type: '', message: '' })

  const currentUserEmail = JSON.parse(localStorage.getItem('user') || '{}')?.email || ''

  const fetchReminders = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(SCRIPT_URL)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      const json = await response.json()

      if (!json.success) {
        throw new Error(json.error || 'Failed to load reminders')
      }

      let data = json.data || []

      // Filter for personal reminders if toggled on
      if (showPersonalOnly && currentUserEmail) {
        data = data.filter(r => r.assignedTo?.toLowerCase() === currentUserEmail.toLowerCase())
      }

      // Sort: overdue → today → future
      const sorted = data.sort((a, b) => {
        const da = a.dueDate ? new Date(a.dueDate) : new Date('9999-12-31')
        const db = b.dueDate ? new Date(b.dueDate) : new Date('9999-12-31')
        return da - db
      })

      setReminders(sorted)
    } catch (err) {
      setError(err.message || 'Something went wrong while loading reminders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReminders()
  }, [showPersonalOnly]) // refetch when toggle changes

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitStatus({ show: false, type: '', message: '' })

    if (!formData.reminder.trim() || !formData.dueDate || !formData.assignedTo.trim()) {
      setSubmitStatus({
        show: true,
        type: 'danger',
        message: 'Please fill in all required fields',
      })
      return
    }

    try {
      const payload = {
        reminder: formData.reminder.trim(),
        priority: formData.priority,
        dueDate: formData.dueDate,
        assignedTo: formData.assignedTo.trim(),
        updatedBy: currentUserEmail || 'System',
      }

      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      setSubmitStatus({
        show: true,
        type: 'success',
        message: 'Reminder added successfully!',
      })

      setFormData({
        reminder: '',
        priority: 'Medium',
        dueDate: '',
        assignedTo: currentUserEmail || '', // prefill next time
      })

      setTimeout(fetchReminders, 2000) // give Apps Script time to write
    } catch (err) {
      setSubmitStatus({
        show: true,
        type: 'danger',
        message: 'Failed to add reminder: ' + err.message,
      })
    }
  }

  const clearForm = () => {
    setFormData({
      reminder: '',
      priority: 'Medium',
      dueDate: '',
      assignedTo: currentUserEmail || '',
    })
    setSubmitStatus({ show: false, type: '', message: '' })
  }

  const getPriorityBadge = (priority) => {
    const p = (priority || '').toLowerCase()
    if (p === 'high')   return <CBadge color="danger">High</CBadge>
    if (p === 'medium') return <CBadge color="warning">Medium</CBadge>
    if (p === 'low')    return <CBadge color="success">Low</CBadge>
    return <CBadge color="secondary">—</CBadge>
  }

  const getDueStatus = (dueDateStr) => {
    if (!dueDateStr) return { text: 'No date', color: 'secondary', bg: '', icon: cilCalendar }

    const due = new Date(dueDateStr)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    due.setHours(0, 0, 0, 0)

    const diffDays = Math.round((due - today) / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return {
        text: `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`,
        color: 'danger',
        bg: 'rgba(220, 53, 69, 0.18)',
        icon: cilWarning
      }
    }
    if (diffDays === 0) {
      return {
        text: 'Due today',
        color: 'warning',
        bg: 'rgba(253, 126, 20, 0.18)',
        icon: cilCalendar
      }
    }
    if (diffDays === 1) {
      return { text: 'Due tomorrow', color: 'info', bg: '', icon: cilCalendar }
    }
    return {
      text: `In ${diffDays} days`,
      color: 'success',
      bg: '',
      icon: cilCalendar
    }
  }

  const shortenEmail = (email) => {
    if (!email || email.length < 20) return email
    const [name, domain] = email.split('@')
    return `${name.substring(0, 10)}...@${domain}`
  }

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <strong>Reminders</strong>
          <div className="d-flex align-items-center gap-3">
            {currentUserEmail && (
              <CFormCheck
                id="personalOnly"
                label="Show my reminders only"
                checked={showPersonalOnly}
                onChange={(e) => setShowPersonalOnly(e.target.checked)}
              />
            )}
            <CButton
              color="light"
              size="sm"
              onClick={fetchReminders}
              disabled={loading}
            >
              <CIcon icon={cilSync} className="me-1" />
              Refresh
            </CButton>
          </div>
        </CCardHeader>

        <CCardBody>
          {loading ? (
            <div className="text-center py-5">
              <CSpinner color="primary" variant="grow" />
              <p className="mt-2">Loading reminders...</p>
            </div>
          ) : error ? (
            <CAlert color="danger" dismissible>{error}</CAlert>
          ) : reminders.length === 0 ? (
            <p className="text-center text-muted py-5">
              {showPersonalOnly
                ? "You don't have any reminders assigned to you yet."
                : "No reminders found. Add one below!"}
            </p>
          ) : (
            <CTable hover responsive bordered className="mb-4">
              <CTableHead color="dark">
                <CTableRow>
                  <CTableHeaderCell>Reminder</CTableHeaderCell>
                  <CTableHeaderCell>Priority</CTableHeaderCell>
                  <CTableHeaderCell>Due Date</CTableHeaderCell>
                  <CTableHeaderCell>Assigned To</CTableHeaderCell>
                  <CTableHeaderCell>Updated By</CTableHeaderCell>
                  <CTableHeaderCell>Timestamp</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {reminders.map((item, index) => {
                  const dueStatus = getDueStatus(item.dueDate)
                  return (
                    <CTableRow
                      key={index}
                      style={{ backgroundColor: dueStatus.bg || 'inherit' }}
                    >
                      <CTableDataCell>
                        <CTooltip content={item.reminder || '—'}>
                          <div className="text-truncate" style={{ maxWidth: '220px' }}>
                            {item.reminder || '—'}
                          </div>
                        </CTooltip>
                      </CTableDataCell>
                      <CTableDataCell>{getPriorityBadge(item.priority)}</CTableDataCell>
                      <CTableDataCell>
                        <div className="d-flex align-items-center">
                          <CIcon
                            icon={dueStatus.icon}
                            className={`me-2 text-${dueStatus.color}`}
                          />
                          <strong style={{ color: `var(--cui-${dueStatus.color})` }}>
                            {item.dueDate || '—'}
                          </strong>
                        </div>
                        <small className={`text-${dueStatus.color} d-block mt-1`}>
                          {dueStatus.text}
                        </small>
                      </CTableDataCell>
                      <CTableDataCell title={item.assignedTo || '—'}>
                        <CIcon icon={cilUser} className="me-2 text-info" />
                        {shortenEmail(item.assignedTo) || '—'}
                      </CTableDataCell>
                      <CTableDataCell>{item.updatedBy || '—'}</CTableDataCell>
                      <CTableDataCell>
                        <CIcon icon={cilClock} className="me-2 text-muted" />
                        {item.timestamp || '—'}
                      </CTableDataCell>
                    </CTableRow>
                  )
                })}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>

      {/* Add New Reminder Form */}
      <CCard>
        <CCardHeader>
          <CIcon icon={cilPlus} className="me-2" />
          Add New Reminder
        </CCardHeader>
        <CCardBody>
          {submitStatus.show && (
            <CAlert
              color={submitStatus.type}
              dismissible
              onClose={() => setSubmitStatus({ ...submitStatus, show: false })}
              className="mb-4"
            >
              {submitStatus.message}
            </CAlert>
          )}

          <CForm onSubmit={handleSubmit}>
            <CRow className="g-3">
              <CCol md={12}>
                <CFormInput
                  type="text"
                  id="reminder"
                  name="reminder"
                  label="Reminder *"
                  placeholder="What needs to be done?"
                  value={formData.reminder}
                  onChange={handleInputChange}
                  required
                />
              </CCol>

              <CCol md={4}>
                <CFormSelect
                  id="priority"
                  name="priority"
                  label="Priority *"
                  value={formData.priority}
                  onChange={handleInputChange}
                  required
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </CFormSelect>
              </CCol>

              <CCol md={4}>
                <CFormInput
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  label="Due Date *"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </CCol>

              <CCol md={4}>
                <CFormInput
                  type="email"
                  id="assignedTo"
                  name="assignedTo"
                  label="Assigned To (email) *"
                  placeholder="colleague@example.com"
                  value={formData.assignedTo}
                  onChange={handleInputChange}
                  required
                />
              </CCol>

              <CCol xs={12} className="d-flex justify-content-end gap-2">
                <CButton color="secondary" variant="outline" onClick={clearForm}>
                  Clear
                </CButton>
                <CButton type="submit" color="primary">
                  <CIcon icon={cilPlus} className="me-2" />
                  Add Reminder
                </CButton>
              </CCol>
            </CRow>
          </CForm>
        </CCardBody>
      </CCard>
    </>
  )
}

export default Reminders