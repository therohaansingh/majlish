// src/views/announcements/Announcements.js
import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CListGroup,
  CListGroupItem,
  CBadge,
  CRow,
  CCol,
  CForm,
  CFormInput,
  CFormSelect,
  CFormTextarea,
  CButton,
  CSpinner,
  CAlert,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilBell, cilCalendar, cilPlus } from '@coreui/icons'
import { getUserRole } from '../../utils/auth'  // ← adjust path if needed

// REPLACE WITH YOUR DEPLOYED WEB APP URL
const API_URL = 'https://script.google.com/macros/s/AKfycbycYs4x0Qq084JMkCvLNwu3aekf4deMvy8UYelyKXqRk9wYToAgdtxsZSVegckw_IQQ/exec'

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    announcement: '',
    priority: 'medium',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' })

  const currentRole = getUserRole() || 'guest'
  const canCreate = ['admin', 'manager', 'superadmin'].includes(currentRole)

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(API_URL)
      if (!res.ok) throw new Error('Network response was not ok')
      const json = await res.json()
      if (json.success) {
        setAnnouncements(json.data)  // already reversed in script (newest first)
      } else {
        setError('Failed to load announcements')
      }
    } catch (err) {
      setError('Could not fetch announcements: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.announcement.trim()) return

    setSubmitting(true)
    setSubmitMessage({ type: '', text: '' })
    setError(null)

    try {
      const payload = {
        announcement: formData.announcement.trim(),
        priority: formData.priority,
        updated_by: currentRole  // or pull real name/email from your auth context if available
      }

      await fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors',                      // Required for Apps Script POST reliability
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',  // avoids preflight OPTIONS issues
        },
        body: JSON.stringify(payload),
      })

      // Since no-cors → can't read response → assume success & refresh
      setSubmitMessage({ type: 'success', text: 'Announcement posted!' })
      setFormData({ announcement: '', priority: 'medium' })
      fetchAnnouncements()
    } catch (err) {
      setSubmitMessage({ type: 'danger', text: 'Failed to post announcement' })
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const getPriorityBadge = (priority) => {
    const colors = { high: 'danger', medium: 'warning', low: 'success' }
    return <CBadge color={colors[priority?.toLowerCase()] || 'secondary'}>
      {(priority || 'medium').toUpperCase()}
    </CBadge>
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <CSpinner color="primary" />
        <p className="mt-2">Loading announcements...</p>
      </div>
    )
  }

  return (
    <>
      <CRow className="mb-4">
        <CCol>
          <h2>Announcements</h2>
        </CCol>
      </CRow>

      {canCreate && (
        <CCard className="mb-4">
          <CCardHeader>
            <CIcon icon={cilPlus} className="me-2" />
            Create New Announcement
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              <CFormTextarea
                name="announcement"
                label="Announcement"
                rows={4}
                placeholder="Type your announcement here..."
                value={formData.announcement}
                onChange={handleChange}
                required
              />
              <CFormSelect
                name="priority"
                label="Priority"
                className="mt-3"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </CFormSelect>

              <CButton
                type="submit"
                color="primary"
                className="mt-4"
                disabled={submitting || !formData.announcement.trim()}
              >
                {submitting ? <>Submitting <CSpinner size="sm" /></> : 'Post Announcement'}
              </CButton>
            </CForm>

            {submitMessage.text && (
              <CAlert color={submitMessage.type} className="mt-3">
                {submitMessage.text}
              </CAlert>
            )}
          </CCardBody>
        </CCard>
      )}

      {error && <CAlert color="danger" className="mb-4">{error}</CAlert>}

      <CCard>
        <CCardHeader>
          <CIcon icon={cilBell} className="me-2" />
          All Announcements
        </CCardHeader>
        <CCardBody className="p-0">
          {announcements.length === 0 ? (
            <div className="p-4 text-center text-medium-emphasis">
              No announcements yet.
            </div>
          ) : (
            <CListGroup flush>
              {announcements.map((item, index) => (
                <CListGroupItem key={index} className="p-3">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <p className="mb-0 fw-semibold">{item.announcement}</p>
                    {getPriorityBadge(item.priority)}
                  </div>
                  <small className="text-body-secondary">
                    <CIcon icon={cilCalendar} className="me-1" size="sm" />
                    {new Date(item.timestamp).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })} • {item.updated_by}
                  </small>
                </CListGroupItem>
              ))}
            </CListGroup>
          )}
        </CCardBody>
      </CCard>
    </>
  )
}

export default Announcements