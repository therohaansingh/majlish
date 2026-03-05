import React, { useEffect, useState } from 'react'
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
  CSpinner,
} from '@coreui/react'
import api from '../../api'  // your axios file (with baseURL: '/api' or 'http://localhost/api')

const UsersList = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/users.php')
        if (response.data.success) {
          setUsers(response.data.users)
        } else {
          setError('Failed to load users')
        }
      } catch (err) {
        setError('Error: ' + (err.response?.data?.error || err.message))
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  if (loading) return <CSpinner color="primary" />

  if (error) return <div className="text-danger">{error}</div>

  return (
    <CCard>
      <CCardHeader>
        <strong>Users / Staff List</strong>
      </CCardHeader>
      <CCardBody>
        <CTable hover responsive>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell scope="col">#</CTableHeaderCell>
              <CTableHeaderCell scope="col">Username</CTableHeaderCell>
              <CTableHeaderCell scope="col">Email</CTableHeaderCell>
              <CTableHeaderCell scope="col">Role</CTableHeaderCell>
              <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {users.map((user, index) => (
              <CTableRow key={user.id}>
                <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                <CTableDataCell>{user.username}</CTableDataCell>
                <CTableDataCell>{user.email}</CTableDataCell>
                <CTableDataCell>
                  <span className={`badge bg-${getRoleColor(user.role)}`}>
                    {user.role}
                  </span>
                </CTableDataCell>
                <CTableDataCell>
                  <CButton color="primary" size="sm">
                    Edit
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>

        {users.length === 0 && <p className="text-center mt-3">No users found</p>}
      </CCardBody>
    </CCard>
  )
}

// Helper to color roles nicely
const getRoleColor = (role) => {
  switch (role) {
    case 'superadmin': return 'danger'
    case 'admin': return 'warning'
    case 'manager': return 'info'
    case 'user': return 'success'
    default: return 'secondary'
  }
}

export default UsersList