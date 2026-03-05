import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CAlert,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'

const mockUsers = [
  { username: 'admin',    password: 'admin123',   role: 'admin'    },
  { username: 'manager',  password: 'manager123', role: 'manager'  },
  { username: 'user',     password: 'user123',    role: 'user'     },
]

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    setErrorMsg('')
    setLoading(true)

    setTimeout(() => {
      try {
        const trimmedUser = username.trim().toLowerCase()
        const foundUser = mockUsers.find(
          u => u.username === trimmedUser && u.password === password
        )

        if (foundUser) {
          localStorage.setItem('isAuthenticated', 'true')
          localStorage.setItem('user', JSON.stringify({
            username: foundUser.username,
            role: foundUser.role,
          }))

          let redirectPath = '/dashboard'

          if (foundUser.role === 'admin') {
            redirectPath = '/admin-dashboard'   
          } else if (foundUser.role === 'manager') {
            redirectPath = '/manager-dashboard' 
          } else {
            redirectPath = '/user-dashboard'   
          }

          setTimeout(() => {
            navigate(redirectPath)
            window.location.reload() 
          }, 300)
        } else {
          setErrorMsg('Invalid username or password')
        }
      } catch (err) {
        setErrorMsg('Something went wrong. Try again.')
      } finally {
        setLoading(false)
      }
    }, 400) 
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm onSubmit={handleSubmit}>
                    <h1>Login</h1>
                    <p className="text-body-secondary">
                      Sign in as <strong>user</strong> / <strong>manager</strong> / <strong>admin</strong>
                    </p>

                    {errorMsg && (
                      <CAlert
                        color="danger"
                        dismissible
                        onClose={() => setErrorMsg('')}
                      >
                        {errorMsg}
                      </CAlert>
                    )}

                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        placeholder="Username"
                        autoComplete="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={loading}
                        required
                      />
                    </CInputGroup>

                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        required
                      />
                    </CInputGroup>

                    <CRow>
                      <CCol xs={6}>
                        <CButton
                          type="submit"
                          color="primary"
                          className="px-4"
                          disabled={loading}
                        >
                          {loading ? 'Logging in...' : 'Login'}
                        </CButton>
                      </CCol>
                      <CCol xs={6} className="text-right">
                        <CButton color="link" className="px-0">
                          Forgot password?
                        </CButton>
                      </CCol>
                    </CRow>

                    {/* Optional: show test credentials */}
                    {/* <div className="mt-4 text-small text-muted">
                      <small>Test accounts:</small><br />
                      <small>• admin / admin123</small><br />
                      <small>• manager / manager123</small><br />
                      <small>• user / user123</small>
                    </div> */}
                  </CForm>
                </CCardBody>
              </CCard>

              <CCard className="text-white bg-primary py-5" style={{ width: '44%' }}>
                <CCardBody className="text-center">
                  <div>
                    <h2>Sign up</h2>
                    <p>
                      Please Login (registration not implemented yet)
                    </p>
                    <Link to="/register">
                      <CButton color="primary" className="mt-3" active tabIndex={-1}>
                        Register Now!
                      </CButton>
                    </Link>
                  </div>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login