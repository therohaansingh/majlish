// src/components/header/AppHeaderNotifications.js
import React, { useState, useEffect } from 'react'
import {
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CBadge,
  CDropdownHeader,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilBell } from '@coreui/icons'
import { Link } from 'react-router-dom'

const API_URL = 'https://script.google.com/macros/s/AKfycbycYs4x0Qq084JMkCvLNwu3aekf4deMvy8UYelyKXqRk9wYToAgdtxsZSVegckw_IQQ/exec'

const AppHeaderNotifications = () => {
  const [announcements, setAnnouncements] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnnouncements()
    const interval = setInterval(fetchAnnouncements, 90000)
    return () => clearInterval(interval)
  }, [])

  const fetchAnnouncements = async () => {
    setLoading(true)
    try {
      const res = await fetch(API_URL)
      const json = await res.json()
      if (json.success) {
        const latest = json.data.slice(0, 5)
        setAnnouncements(latest)

        const lastViewed = localStorage.getItem('lastAnnView') || '2000-01-01'
        const unread = latest.filter(item => new Date(item.timestamp) > new Date(lastViewed)).length
        setUnreadCount(unread)
      }
    } catch (err) {
      console.error('Notifications fetch failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = () => {
    setUnreadCount(0)
    localStorage.setItem('lastAnnView', new Date().toISOString())
  }

  return (
    <CDropdown 
      variant="nav-item" 
      alignment="end"
      onVisibleChange={(isVisible) => isVisible && markAsRead()}
    >
      <CDropdownToggle caret={false} className="position-relative">
        <CIcon icon={cilBell} size="lg" />
        {unreadCount > 0 && (
          <CBadge shape="rounded-pill" color="danger" position="top-end" size="sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </CBadge>
        )}
      </CDropdownToggle>

      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownHeader className="bg-body-secondary fw-semibold py-2">
          {unreadCount > 0 
            ? `You have ${unreadCount} new announcement${unreadCount !== 1 ? 's' : ''}`
            : 'No new announcements'}
        </CDropdownHeader>

        {loading ? (
          <CDropdownItem className="text-center py-3 d-flex align-items-center justify-content-center">
            <CSpinner size="sm" className="me-2" /> Loading...
          </CDropdownItem>
        ) : announcements.length === 0 ? (
          <CDropdownItem className="text-center py-3 text-muted">
            All caught up!
          </CDropdownItem>
        ) : (
          announcements.map((item, idx) => (
            <CDropdownItem 
              key={idx}
              as={Link}
              to="/announcements"
              onClick={markAsRead}
              className="py-2"
            >
              <div className="d-flex flex-column">
                <small className="text-body-secondary">
                  {new Date(item.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </small>
                <div className="fw-semibold text-truncate" style={{ maxWidth: '280px' }}>
                  {item.announcement}
                </div>
                <small className="text-body-secondary">
                  {item.priority.toUpperCase()} • {item.updated_by}
                </small>
              </div>
            </CDropdownItem>
          ))
        )}

        <CDropdownItem 
          as={Link}
          to="/announcements"
          className="text-center border-top py-2"
          onClick={markAsRead}
        >
          <small>View all announcements</small>
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderNotifications