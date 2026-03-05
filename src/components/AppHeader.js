// src/layout/AppHeader.js

import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  CButton,
  CContainer,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CHeader,
  CHeaderNav,
  CHeaderToggler,
  CNavItem,
  CNavLink,
  CBadge,
  CSpinner,
  useColorModes,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilBell,
  cilContrast,
  cilEnvelopeOpen,
  cilMenu,
  cilMoon,
  cilSun,
  cilCalendar,
  cilPlus,
} from '@coreui/icons'

import { AppBreadcrumb } from './index'
import { AppHeaderDropdown } from './header/index'
import AppHeaderNotifications from '../components/header/AppHeaderNotifications' // adjust path if needed

// Replace with your actual Apps Script URL
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyVLSy72KitRsa49IWyVeayzkK9hilno9cOd0dkJg7wXk1ILsqkZzLfvMiBIymmkxHA/exec'

const AppHeader = () => {
  const headerRef = useRef()
  const { colorMode, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const sidebarShow = useSelector((state) => state.sidebarShow)

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const username = user.username || 'User'

  // ────────────────────────────────────────────────
  // Reminders popup state
  // ────────────────────────────────────────────────
  const [upcomingReminders, setUpcomingReminders] = useState([])
  const [upcomingCount, setUpcomingCount] = useState(0)
  const [loadingReminders, setLoadingReminders] = useState(true)

  const fetchUpcomingReminders = async () => {
    try {
      setLoadingReminders(true)
      const response = await fetch(SCRIPT_URL)
      if (!response.ok) throw new Error('Network response was not ok')

      const json = await response.json()
      if (!json.success) throw new Error(json.error || 'Failed to load data')

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const upcoming = json.data
        .filter(reminder => {
          if (!reminder.dueDate) return false
          const due = new Date(reminder.dueDate)
          return due >= today
        })
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))

      setUpcomingReminders(upcoming)
      setUpcomingCount(upcoming.length)
    } catch (err) {
      console.error('Failed to fetch reminders:', err)
      setUpcomingReminders([])
      setUpcomingCount(0)
    } finally {
      setLoadingReminders(false)
    }
  }

  useEffect(() => {
    fetchUpcomingReminders()

    // Refresh every 5 minutes (300000 ms)
    const interval = setInterval(fetchUpcomingReminders, 300000)
    return () => clearInterval(interval)
  }, [])

  // Due date status helper (for popup display)
  const getDueStatus = (dueDateStr) => {
    if (!dueDateStr) return { text: 'No date', color: 'secondary' }
    const due = new Date(dueDateStr)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    due.setHours(0, 0, 0, 0)

    const diffDays = Math.round((due - today) / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return { text: `Overdue ${Math.abs(diffDays)}d`, color: 'danger' }
    if (diffDays === 0) return { text: 'Today', color: 'warning' }
    if (diffDays === 1) return { text: 'Tomorrow', color: 'info' }
    return { text: `In ${diffDays}d`, color: 'success' }
  }

  // Priority badge helper (smaller for popup)
  const getPriorityBadge = (priority) => {
    const p = (priority || '').toLowerCase()
    if (p === 'high')   return <CBadge color="danger" size="sm">High</CBadge>
    if (p === 'medium') return <CBadge color="warning" size="sm">Medium</CBadge>
    if (p === 'low')    return <CBadge color="success" size="sm">Low</CBadge>
    return <CBadge color="secondary" size="sm">—</CBadge>
  }

  useEffect(() => {
    const handleScroll = () => {
      headerRef.current?.classList.toggle('shadow-sm', document.documentElement.scrollTop > 0)
    }
    document.addEventListener('scroll', handleScroll)
    return () => document.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <CHeader position="sticky" className="mb-4 p-0" ref={headerRef}>
      <CContainer className="border-bottom px-4" fluid>
        <CHeaderToggler
          onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })}
          style={{ marginInlineStart: '-14px' }}
        >
          <CIcon icon={cilMenu} size="lg" />
        </CHeaderToggler>

        <span className="nav-link text-body fw-semibold me-3">
          {username}
        </span>

        <CHeaderNav className="ms-auto">
          <AppHeaderNotifications />
           
          {/* ← NEW: Add Update Button – placed here for visibility */}



          {/* Calendar Icon → Popup with reminders */}
          <CNavItem>
            <CDropdown variant="nav-item" placement="bottom-end">
              <CDropdownToggle caret={false} className="position-relative">
                <CIcon icon={cilCalendar} size="lg" />
                {upcomingCount > 0 && (
                  <CBadge
                    color="danger"
                    shape="rounded-pill"
                    size="sm"
                    position="top-end"
                    className="translate-middle border border-light"
                    style={{
                      fontSize: '0.65rem',
                      minWidth: '1.25rem',
                      height: '1.25rem',
                      padding: '0.2em',
                      lineHeight: '1.25rem',
                    }}
                  >
                    {upcomingCount > 99 ? '99+' : upcomingCount}
                  </CBadge>
                )}
              </CDropdownToggle>

              <CDropdownMenu
                className="pt-0 shadow"
                style={{ maxHeight: '360px', overflowY: 'auto', minWidth: '340px' }}
              >
              {/* Calendar popup – no extra wrapper <CNavItem> */}
              <CDropdown variant="nav-item" placement="bottom-end">
                <CDropdownToggle caret={false} className="position-relative">
                  <CIcon icon={cilCalendar} size="lg" />
                  {upcomingCount > 0 && (
                    <CBadge
                      color="danger"
                      shape="rounded-pill"
                      size="sm"
                      position="top-end"
                      className="translate-middle border border-light"
                      style={{
                        fontSize: '0.65rem',
                        minWidth: '1.25rem',
                        height: '1.25rem',
                        padding: '0.2em',
                        lineHeight: '1.25rem',
                      }}
                    >
                      {upcomingCount > 99 ? '99+' : upcomingCount}
                    </CBadge>
                  )}
                </CDropdownToggle>

                <CDropdownMenu
                  className="pt-0 shadow"
                  style={{ maxHeight: '360px', overflowY: 'auto', minWidth: '340px' }}
                >
                  <CDropdownItem header className="bg-light fw-semibold py-2 text-center">
                    Upcoming Reminders ({upcomingCount})
                  </CDropdownItem>

                  {loadingReminders ? (
                    <CDropdownItem disabled className="text-center py-3">
                      <CSpinner size="sm" className="me-2" />
                      Loading...
                    </CDropdownItem>
                  ) : upcomingReminders.length === 0 ? (
                    <CDropdownItem disabled className="text-center py-3 text-muted">
                      No upcoming reminders
                    </CDropdownItem>
                  ) : (
                    upcomingReminders.map((reminder, idx) => {
                      const status = getDueStatus(reminder.dueDate)
                      return (
                        <CDropdownItem
                          key={idx}
                          onClick={() => navigate('/reminders')}
                          className="py-2"
                          style={{ cursor: 'pointer', borderBottom: '1px solid #eee' }}
                        >
                          <div className="d-flex justify-content-between align-items-start small">
                            <div style={{ maxWidth: '220px' }}>
                              <div className="fw-semibold">
                                {reminder.reminder?.substring(0, 45)}
                                {reminder.reminder?.length > 45 ? '...' : ''}
                              </div>
                              <small className={`text-${status.color} d-block mt-1`}>
                                {reminder.dueDate} • {status.text}
                              </small>
                            </div>
                            <div>{getPriorityBadge(reminder.priority)}</div>
                          </div>
                        </CDropdownItem>
                      )
                    })
                  )}

                  <CDropdownItem divider />

                  <CDropdownItem
                    className="text-center fw-semibold py-2"
                    onClick={() => navigate('/reminders')}
                  >
                    View All Reminders →
                  </CDropdownItem>
                </CDropdownMenu>
              </CDropdown>

                {loadingReminders ? (
                  <CDropdownItem disabled className="text-center py-3">
                    <CSpinner size="sm" className="me-2" />
                    Loading...
                  </CDropdownItem>
                ) : upcomingReminders.length === 0 ? (
                  <CDropdownItem disabled className="text-center py-3 text-muted">
                    No upcoming reminders
                  </CDropdownItem>
                ) : (
                  upcomingReminders.map((reminder, idx) => {
                    const status = getDueStatus(reminder.dueDate)
                    return (
                      <CDropdownItem
                        key={idx}
                        onClick={() => navigate('/reminders')}
                        className="py-2"
                        style={{ cursor: 'pointer', borderBottom: '1px solid #eee' }}
                      >
                        <div className="d-flex justify-content-between align-items-start small">
                          <div style={{ maxWidth: '220px' }}>
                            <div className="fw-semibold">
                              {reminder.reminder?.substring(0, 45)}
                              {reminder.reminder?.length > 45 ? '...' : ''}
                            </div>
                            <small className={`text-${status.color} d-block mt-1`}>
                              {reminder.dueDate} • {status.text}
                            </small>
                          </div>
                          <div>{getPriorityBadge(reminder.priority)}</div>
                        </div>
                      </CDropdownItem>
                    )
                  })
                )}

                <CDropdownItem divider />

                <CDropdownItem
                  className="text-center fw-semibold py-2"
                  onClick={() => navigate('/reminders')}
                >
                  View All Reminders →
                </CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
          </CNavItem>

          <CNavItem>
            <CNavLink href="#">
              <CIcon icon={cilEnvelopeOpen} size="lg" />
            </CNavLink>
          </CNavItem>
        </CHeaderNav>
                  <CNavItem className="d-flex align-items-center">
                    <CButton
                      color="primary"
                      size="sm"
                      className="d-flex align-items-center gap-1"
                      onClick={() => navigate('/CTU/CTUupdates')}
                    >
                      <CIcon icon={cilPlus} size="sm" />
                      Add Update
                    </CButton>
                  </CNavItem>

        <CHeaderNav className="d-flex align-items-center">
          <li className="nav-item py-1">
            <div className="vr h-100 mx-2 text-body text-opacity-75"></div>
          </li>

          <CDropdown variant="nav-item" placement="bottom-end">
            <CDropdownToggle caret={false}>
              {colorMode === 'dark' ? (
                <CIcon icon={cilMoon} size="lg" />
              ) : colorMode === 'auto' ? (
                <CIcon icon={cilContrast} size="lg" />
              ) : (
                <CIcon icon={cilSun} size="lg" />
              )}
            </CDropdownToggle>
            <CDropdownMenu>
              <CDropdownItem
                active={colorMode === 'light'}
                className="d-flex align-items-center"
                as="button"
                onClick={() => setColorMode('light')}
              >
                <CIcon className="me-2" icon={cilSun} size="lg" /> Light
              </CDropdownItem>
              <CDropdownItem
                active={colorMode === 'dark'}
                className="d-flex align-items-center"
                as="button"
                onClick={() => setColorMode('dark')}
              >
                <CIcon className="me-2" icon={cilMoon} size="lg" /> Dark
              </CDropdownItem>
              <CDropdownItem
                active={colorMode === 'auto'}
                className="d-flex align-items-center"
                as="button"
                onClick={() => setColorMode('auto')}
              >
                <CIcon className="me-2" icon={cilContrast} size="lg" /> Auto
              </CDropdownItem>
            </CDropdownMenu>
          </CDropdown>

          <li className="nav-item py-1">
            <div className="vr h-100 mx-2 text-body text-opacity-75"></div>
          </li>

          <AppHeaderDropdown />
        </CHeaderNav>
      </CContainer>

      <CContainer className="px-4" fluid>
        <AppBreadcrumb />
      </CContainer>
    </CHeader>
  )
}

export default AppHeader