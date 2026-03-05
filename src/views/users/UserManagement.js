import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext'; // assuming you have this
import {
  CCard, CCardBody, CTable, CTableHead, CTableRow, CTableHeaderCell,
  CTableBody, CTableDataCell, CButton
} from '@coreui/react';
import EditUserModal from './EditUserModal';

const UserManagement = () => {
  const { user: currentUser } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [editUser, setEditUser] = useState(null);

  // Fetch users from your existing PHP API
  useEffect(() => {
    if (['admin', 'superadmin', 'manager'].includes(currentUser?.role)) {
      fetch('http://localhost/api/users.php') // your existing endpoint
        .then(res => res.json())
        .then(data => setUsers(data));
    }
  }, [currentUser]);

  return (
    <>
      <CCard>
        <CCardBody>
          <h4>User Management</h4>
          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Username</CTableHeaderCell>
                <CTableHeaderCell>Role</CTableHeaderCell>
                <CTableHeaderCell>Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {users.map(u => (
                <CTableRow key={u.id}>
                  <CTableDataCell>{u.username}</CTableDataCell>
                  <CTableDataCell>{u.role}</CTableDataCell>
                  <CTableDataCell>
                    <CButton
                      color="primary"
                      size="sm"
                      onClick={() => setEditUser(u)}
                    >
                      Edit Permissions
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>

      {editUser && (
        <EditUserModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onSave={() => {
            // optional: refresh users list
            setEditUser(null);
          }}
        />
      )}
    </>
  );
};

export default UserManagement;