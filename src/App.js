import React, { Suspense, useEffect } from 'react'
import { BrowserRouter as Router, HashRouter, Route, Routes, Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { CSpinner, useColorModes } from '@coreui/react'
import './scss/style.scss'
import './scss/examples.scss'
import Reports from './views/reports/reports'
// import UsersList from './views/users/UsersList';

const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))
const Login = React.lazy(() => import('./views/pages/login/Login'))
const Register = React.lazy(() => import('./views/pages/register/Register'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))



// Role-based protection wrapper
const ProtectedRoute = ({ allowedRoles = [] }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
  const userRole = user.role || null

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // No role restriction → allow any authenticated user
  if (allowedRoles.length === 0) {
    return <Outlet />
  }

  // Role check
  if (allowedRoles.includes(userRole)) {
    return <Outlet />
  }

  // Forbidden for this role
  return <Navigate to="/dashboard" replace />
}

const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const storedTheme = useSelector((state) => state.theme)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.href.split('?')[1])
    const theme = urlParams.get('theme') && urlParams.get('theme').match(/^[A-Za-z0-9\s]+/)[0]
    if (theme) {
      setColorMode(theme)
    }

    if (isColorModeSet()) {
      return
    }

    setColorMode(storedTheme)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <HashRouter>
      <Suspense
        fallback={
          <div className="pt-3 text-center">
            <CSpinner color="primary" variant="grow" />
          </div>
        }
      >

        


        <Routes>
          {/* ────────────────────────────────────────────────
              Public routes (no auth required)
          ──────────────────────────────────────────────── */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/404" element={<Page404 />} />
          <Route path="/500" element={<Page500 />} />

          {/* ────────────────────────────────────────────────
              Main protected area – all logged-in users
              Use path="*" so it catches /dashboard, /profile, etc.
          ──────────────────────────────────────────────── */}
          <Route element={<ProtectedRoute />}>
            <Route path="*" element={<DefaultLayout />} />
          </Route>

          {/* ────────────────────────────────────────────────
              Manager + higher roles only
          ──────────────────────────────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={['manager', 'admin', 'superadmin']} />}>
            <Route path="/team" element={<div>Team Management (Manager+)</div>} />
            {/* <Route path="/users" element={<UsersList />} /> */}
          </Route>

          {/* ────────────────────────────────────────────────
              Admin + Superadmin only
          ──────────────────────────────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'superadmin']} />}>
            <Route path="/users" element={<div>User Management (Admin+)</div>} />
            <Route path="/settings/global" element={<div>Global Settings (Admin+)</div>} />
          </Route>

          {/* ────────────────────────────────────────────────
              Superadmin only (developer access)
          ──────────────────────────────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={['superadmin']} />}>
            <Route path="/superadmin/tools" element={<div>Superadmin Tools – Backup, Logs, etc.</div>} />
            <Route path="/superadmin/roles" element={<div>Manage Roles & Permissions</div>} />
          </Route>

          {/* Fallback for unmatched routes after all checks */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </HashRouter>
  )
}

export default App