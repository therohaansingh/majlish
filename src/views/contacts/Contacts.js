// src/views/contacts/Contacts.js
import React, { useState, useEffect } from 'react'
import axios from 'axios'
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
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormInput,
  CBadge,
  CRow,
  CCol,
  CFormLabel,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilCloudDownload, cilSearch, cilPlus } from '@coreui/icons'

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbylw07t0hTee_ysuWsSL_D01gq0WRW70ZO4AHQ1sqoKJaUREXJUDUxDTswzOrRHIUfqQw/exec'

const Contacts = () => {
  const [contacts, setContacts] = useState([])
  const [filteredContacts, setFilteredContacts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [isAddMode, setIsAddMode] = useState(false)
  const [formData, setFormData] = useState({
    Name: '',
    Email: '',
    Username: '',
    Mobile: '',
    Role: '',
    MFA: 'None',
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load contacts from Google Sheet
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await axios.get(SCRIPT_URL)

        if (response.data.status === 'success') {
          const dataWithIds = response.data.data.map((item, index) => ({
            ...item,
            id: index + 1,
          }))
          setContacts(dataWithIds)
        } else {
          setError(response.data.message || 'Failed to load data')
        }
      } catch (err) {
        console.error('Fetch error:', err)
        setError('Could not connect to Server. Please check your internet or script deployment.')
      } finally {
        setLoading(false)
      }
    }

    fetchContacts()
  }, [])

  // Search filter (now includes Mobile)
  useEffect(() => {
    const filtered = contacts.filter((contact) =>
      Object.values(contact).some((val) =>
        String(val || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
    setFilteredContacts(filtered)
  }, [contacts, searchTerm])

  const openAddModal = () => {
    setFormData({ Name: '', Email: '', Username: '', Mobile: '', Role: '', MFA: 'None' })
    setIsAddMode(true)
    setShowModal(true)
  }

  const openEditModal = (contact) => {
    setFormData({ ...contact })
    setIsAddMode(false)
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!formData.Name || !formData.Email) {
      alert('Name and Email are required fields.')
      return
    }

    try {
      const urlWithAction = `${SCRIPT_URL}?action=${isAddMode ? 'append' : 'update'}`

      await fetch(urlWithAction, {
        method: 'POST',
        mode: 'no-cors',
        cache: 'no-cache',
        redirect: 'follow',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(formData),
      })

      alert(
        isAddMode
          ? 'Member added! Refreshing list...'
          : 'Member updated! Refreshing list...'
      )

      // Reload data
      const reloadResponse = await axios.get(SCRIPT_URL)
      if (reloadResponse.data.status === 'success') {
        const refreshed = reloadResponse.data.data.map((item, index) => ({
          ...item,
          id: index + 1,
        }))
        setContacts(refreshed)
        setSearchTerm('')
      } else {
        alert('Changes likely saved, but reload failed. Refresh the page manually.')
      }
    } catch (err) {
      console.error('Save attempt failed:', err)
      alert('Save may have failed. Check console (F12) and Google Sheet manually.')
    }

    setShowModal(false)
  }

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Username', 'Mobile', 'Role', 'MFA']
    const csvRows = []
    csvRows.push(headers.join(','))

    contacts.forEach((contact) => {
      const row = headers.map((h) => `"${(contact[h] || '').toString().replace(/"/g, '""')}"`)
      csvRows.push(row.join(','))
    })

    const csvContent = csvRows.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'Majlis_Contacts.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <CSpinner color="primary" />
        <h4 className="mt-3">Loading contacts from Server...</h4>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-5 text-danger">
        <h4>Error</h4>
        <p>{error}</p>
        <CButton color="primary" onClick={() => window.location.reload()}>
          Retry
        </CButton>
      </div>
    )
  }

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader>
          <CRow className="align-items-center">
            <CCol>
              <h4 className="mb-0">Contacts ({contacts.length})</h4>
            </CCol>
            <CCol xs="auto">
              <CButton color="success" onClick={exportCSV} className="me-2">
                <CIcon icon={cilCloudDownload} className="me-1" />
                Export as CSV
              </CButton>
              <CButton color="primary" onClick={openAddModal}>
                <CIcon icon={cilPlus} className="me-1" />
                Add New Member
              </CButton>
            </CCol>
          </CRow>
        </CCardHeader>

        <CCardBody>
          <div className="mb-3" style={{ maxWidth: '400px' }}>
            <div className="input-group">
              <span className="input-group-text">
                <CIcon icon={cilSearch} />
              </span>
              <CFormInput
                placeholder="Search name, email, username, mobile..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <CTable striped hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Name</CTableHeaderCell>
                <CTableHeaderCell>Email</CTableHeaderCell>
                <CTableHeaderCell>Username</CTableHeaderCell>
                <CTableHeaderCell>Mobile</CTableHeaderCell>
                <CTableHeaderCell>Role</CTableHeaderCell>
                <CTableHeaderCell>MFA</CTableHeaderCell>
                <CTableHeaderCell>Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {filteredContacts.map((contact) => (
                <CTableRow key={contact.id}>
                  <CTableDataCell>{contact.Name}</CTableDataCell>
                  <CTableDataCell>
                    <a href={`mailto:${contact.Email}`}>{contact.Email}</a>
                  </CTableDataCell>
                  <CTableDataCell>{contact.Username}</CTableDataCell>
                  <CTableDataCell>{contact.Mobile || '-'}</CTableDataCell>
                  <CTableDataCell>
                    <CBadge color={contact.Role === 'Administrator' ? 'danger' : 'info'}>
                      {contact.Role}
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell>
                    <CBadge color="secondary">{contact.MFA}</CBadge>
                  </CTableDataCell>
                  <CTableDataCell>
                    <CButton
                      color="primary"
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditModal(contact)}
                    >
                      <CIcon icon={cilPencil} /> Edit
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
              {filteredContacts.length === 0 && (
                <CTableRow>
                  <CTableDataCell colSpan={7} className="text-center py-4 text-muted">
                    No contacts found
                  </CTableDataCell>
                </CTableRow>
              )}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>

      {/* Add / Edit Modal */}
      <CModal visible={showModal} onClose={() => setShowModal(false)} size="lg">
        <CModalHeader closeButton>
          <CModalTitle>{isAddMode ? 'Add New Member' : 'Edit Contact'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="mb-3">
            <CFormLabel>Name *</CFormLabel>
            <CFormInput
              value={formData.Name || ''}
              onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
              placeholder="Full name"
            />
          </div>
          <div className="mb-3">
            <CFormLabel>Email *</CFormLabel>
            <CFormInput
              type="email"
              value={formData.Email || ''}
              onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
              placeholder="email@domain.com"
            />
          </div>
          <div className="mb-3">
            <CFormLabel>Username</CFormLabel>
            <CFormInput
              value={formData.Username || ''}
              onChange={(e) => setFormData({ ...formData, Username: e.target.value })}
              placeholder="username"
            />
          </div>
          <div className="mb-3">
            <CFormLabel>Mobile</CFormLabel>
            <CFormInput
              value={formData.Mobile || ''}
              onChange={(e) => setFormData({ ...formData, Mobile: e.target.value })}
              placeholder="+91 98765 43210"
            />
          </div>
          <div className="mb-3">
            <CFormLabel>Role</CFormLabel>
            <CFormInput
              value={formData.Role || ''}
              onChange={(e) => setFormData({ ...formData, Role: e.target.value })}
              placeholder="Staff / Administrator / Intern ..."
            />
          </div>
          <div className="mb-3">
            <CFormLabel>MFA Status</CFormLabel>
            <CFormInput
              value={formData.MFA || 'None'}
              onChange={(e) => setFormData({ ...formData, MFA: e.target.value })}
              placeholder="None / Enabled / ..."
            />
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={handleSave}>
            {isAddMode ? 'Add Member' : 'Save Changes'}
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default Contacts