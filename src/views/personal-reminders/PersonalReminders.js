// src/views/personal-reminders/PersonalReminders.js

import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CForm,
  CFormInput,
  CButton,
  CFormCheck,
  CBadge,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CToast,
  CToastBody,
  CToastClose,
  CCallout,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilPlus,
  cilTrash,
  cilCheckCircle,
  cilXCircle,
  cilPencil,
  cilCalendar,
} from '@coreui/icons'

const PersonalReminders = () => {
  const [reminders, setReminders] = useState([])
  const [newReminder, setNewReminder] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [toast, setToast] = useState({ visible: false, message: '', color: 'success' })

  // Load from localStorage (demo persistence)
  useEffect(() => {
    const saved = localStorage.getItem('personalReminders')
    if (saved) {
      try {
        setReminders(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse saved reminders', e)
      }
    }
  }, [])

  // Save to localStorage whenever reminders change
  useEffect(() => {
    localStorage.setItem('personalReminders', JSON.stringify(reminders))
  }, [reminders])

  const showToast = (message, color = 'success') => {
    setToast({ visible: true, message, color })
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 4000)
  }

  const handleAddReminder = (e) => {
    e.preventDefault()
    if (!newReminder.trim()) {
      showToast('Please enter reminder text', 'danger')
      return
    }

    const reminder = {
      id: Date.now(),
      text: newReminder.trim(),
      done: false,
      dueDate: dueDate || null,
      createdAt: new Date().toISOString(),
    }

    setReminders((prev) => [...prev, reminder])
    setNewReminder('')
    setDueDate('')
    showToast('Reminder added')
  }

  const toggleDone = (id) => {
    setReminders((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item
      )
    )
  }

  const deleteReminder = (id) => {
    setReminders((prev) => prev.filter((item) => item.id !== id))
    showToast('Reminder deleted', 'warning')
  }

  const getDueStatus = (due) => {
    if (!due) return null
    const dueDateObj = new Date(due)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (dueDateObj < today) return { text: 'Overdue', color: 'danger' }
    if (dueDateObj.toDateString() === today.toDateString()) return { text: 'Today', color: 'warning' }
    return { text: 'Upcoming', color: 'info' }
  }

  const sortedReminders = [...reminders].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1
    if (a.dueDate && !b.dueDate) return -1
    if (!a.dueDate && b.dueDate) return 1
    if (a.dueDate && b.dueDate) return new Date(a.dueDate) - new Date(b.dueDate)
    return new Date(b.createdAt) - new Date(a.createdAt) // newest first
  })

  return (
    <>
      <CRow>
        <CCol xs={12}>
          <CCallout color="info" className="mb-4">
            Personal reminders are visible <strong>only to you</strong>. They are not shared with other users or managers.
          </CCallout>
        </CCol>
      </CRow>

      <CRow>
        <CCol lg={4}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Add New Reminder</strong>
            </CCardHeader>
            <CCardBody>
              <CForm onSubmit={handleAddReminder}>
                <div className="mb-3">
                  <CFormInput
                    type="text"
                    id="reminderText"
                    placeholder="e.g. Follow up with client XYZ"
                    value={newReminder}
                    onChange={(e) => setNewReminder(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <CFormInput
                    type="date"
                    id="dueDate"
                    label="Due Date (optional)"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>

                <CButton type="submit" color="primary" className="w-100">
                  <CIcon icon={cilPlus} className="me-2" />
                  Add Reminder
                </CButton>
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol lg={8}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>My Personal Reminders</strong>
              <div className="card-header-actions">
                <CBadge color="info" shape="rounded-pill">
                  {reminders.length} total
                </CBadge>
              </div>
            </CCardHeader>

            <CCardBody>
              {sortedReminders.length === 0 ? (
                <div className="text-center text-body-secondary py-5">
                  No personal reminders yet.<br />
                  Add your first one on the left →
                </div>
              ) : (
                <div className="list-group">
                  {sortedReminders.map((reminder) => {
                    const dueStatus = reminder.dueDate ? getDueStatus(reminder.dueDate) : null

                    return (
                      <div
                        key={reminder.id}
                        className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${
                          reminder.done ? 'bg-light opacity-75' : ''
                        }`}
                      >
                        <div className="d-flex align-items-center flex-grow-1">
                          <CFormCheck
                            checked={reminder.done}
                            onChange={() => toggleDone(reminder.id)}
                            className="me-3"
                          />
                          <div className="flex-grow-1">
                            <div style={{ textDecoration: reminder.done ? 'line-through' : 'none' }}>
                              {reminder.text}
                            </div>
                            {reminder.dueDate && (
                              <small
                                className={`d-block mt-1 text-${dueStatus?.color || 'muted'}`}
                              >
                                <CIcon icon={cilCalendar} size="sm" className="me-1" />
                                Due: {new Date(reminder.dueDate).toLocaleDateString()}
                                {dueStatus && ` • ${dueStatus.text}`}
                              </small>
                            )}
                          </div>
                        </div>

                        <CDropdown variant="btn-group" alignment="end">
                          <CDropdownToggle color="ghost" caret={false} size="sm">
                            <CIcon icon={cilPencil} />
                          </CDropdownToggle>
                          <CDropdownMenu>
                            <CDropdownItem onClick={() => toggleDone(reminder.id)}>
                              <CIcon icon={reminder.done ? cilXCircle : cilCheckCircle} className="me-2" />
                              {reminder.done ? 'Mark undone' : 'Mark done'}
                            </CDropdownItem>
                            <CDropdownItem
                              color="danger"
                              onClick={() => deleteReminder(reminder.id)}
                            >
                              <CIcon icon={cilTrash} className="me-2" />
                              Delete
                            </CDropdownItem>
                          </CDropdownMenu>
                        </CDropdown>
                      </div>
                    )
                  })}
                </div>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Simple toast notification */}
      <CToast
        autohide={true}
        visible={toast.visible}
        color={toast.color}
        className="position-fixed bottom-0 end-0 m-3"
        style={{ zIndex: 1050 }}
      >
        <CToastBody className="d-flex justify-content-between align-items-center">
          {toast.message}
          <CToastClose onClick={() => setToast((prev) => ({ ...prev, visible: false }))} />
        </CToastBody>
      </CToast>
    </>
  )
}

export default PersonalReminders