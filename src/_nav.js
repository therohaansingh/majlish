// src/_nav.js
import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilHome,              // Home
  cilBalanceScale,      // Cases/Tasks
  cilChartPie,          // Reports
  cilBarChart,          // Statistics
  cilChartLine,         // Analytics
  cilPeople,            // Contacts / Users
  cilBell,              // Reminders / Announcements
  cilSettings,          // System Configuration
  cilNotes,             // Audit Logs
  cilPuzzle,
  cilShieldAlt,         // Personal items (can change icon later)
} from '@coreui/icons'

import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'
import { getUserRole, isManagerOrHigher, isAdminOrHigher } from './utils/auth'

const role = getUserRole()

const _nav = [
  // ────────────────────────────────────────────────
  // Common to all roles: Home
  // ────────────────────────────────────────────────
  {
    component: CNavItem,
    name: 'Home',
    to: '/dashboard',
    icon: <CIcon icon={cilHome} customClassName="nav-icon" />,
  },

  // ────────────────────────────────────────────────
  // USER & MANAGER – same menu structure
  // ────────────────────────────────────────────────
  ...(role === 'user'
    ? [
        {
          component: CNavTitle,
          name: 'Work',
        },
        {
          component: CNavItem,
          name: 'Cases / Tasks / User',
          to: '/CTU',
          icon: <CIcon icon={cilBalanceScale} customClassName="nav-icon" />,
        },
        {
          component: CNavTitle,
          name: 'Notifications',
        },
        {
          component: CNavItem,
          name: 'Reminders',
          to: '/reminders',
          icon: <CIcon icon={cilBell} customClassName="nav-icon" />,
        },
        {
          component: CNavItem,
          name: 'Announcements',
          to: '/announcements',
          icon: <CIcon icon={cilBell} customClassName="nav-icon" />,
        },
        {
          component: CNavTitle,
          name: 'Analysis',
        },
        {
          component: CNavItem,
          name: 'Statistics',
          to: '/statistics',
          icon: <CIcon icon={cilBarChart} customClassName="nav-icon" />,
        },
        {
          component: CNavTitle,
          name: 'Contacts',
        },
        {
          component: CNavItem,
          name: 'Contacts',
          to: '/contacts',
          icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
        },
      ]
    : []),

    // ────────────────────────────────────────────────
  // USER & MANAGER – same menu structure
  // ────────────────────────────────────────────────
  ...(role === 'manager'
    ? [
        {
          component: CNavTitle,
          name: 'Work',
        },
        {
          component: CNavItem,
          name: 'Cases / Tasks / User',
          to: '/CTU',
          icon: <CIcon icon={cilBalanceScale} customClassName="nav-icon" />,
        },
        {
          component: CNavTitle,
          name: 'Notifications',
        },
        {
          component: CNavItem,
          name: 'Reminders',
          to: '/reminders',
          icon: <CIcon icon={cilBell} customClassName="nav-icon" />,
        },
        {
          component: CNavItem,
          name: 'Personal Reminders',
          to: '/PersonalReminders',
          icon: <CIcon icon={cilShieldAlt} customClassName="nav-icon" />,
        },
        {
          component: CNavItem,
          name: 'Announcements',
          to: '/announcements',
          icon: <CIcon icon={cilBell} customClassName="nav-icon" />,
        },
        {
          component: CNavItem,
          name: 'Personal Announcements',
          to: '/personal-announcements',
          icon: <CIcon icon={cilShieldAlt} customClassName="nav-icon" />,
        },
        {
          component: CNavTitle,
          name: 'Analysis',
        },
        {
          component: CNavItem,
          name: 'Reports',
          to: '/reports',
          icon: <CIcon icon={cilChartPie} customClassName="nav-icon" />,
        },
        {
          component: CNavItem,
          name: 'Statistics',
          to: '/statistics',
          icon: <CIcon icon={cilBarChart} customClassName="nav-icon" />,
        },
        {
          component: CNavItem,
          name: 'Analytics',
          to: '/analytics',
          icon: <CIcon icon={cilChartLine} customClassName="nav-icon" />,
        },
        {
          component: CNavTitle,
          name: 'Contacts',
        },
        {
          component: CNavItem,
          name: 'Contacts',
          to: '/contacts',
          icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
        },
      ]
    : []),

  // ────────────────────────────────────────────────
  // ADMIN – extended menu
  // ────────────────────────────────────────────────
  ...(role === 'admin'
    ? [
        {
          component: CNavTitle,
          name: 'Work & Users',
        },
        {
          component: CNavItem,
          name: 'Cases / Tasks / Users',
          to: '/CTU',
          icon: <CIcon icon={cilBalanceScale} customClassName="nav-icon" />,
        },
        {
          component: CNavTitle,
          name: 'Notifications',
        },
        {
          component: CNavItem,
          name: 'Reminders',
          to: '/reminders',
          icon: <CIcon icon={cilBell} customClassName="nav-icon" />,
        },
        {
          component: CNavItem,
          name: 'Personal Reminders',
          to: '/PersonalReminders',
          icon: <CIcon icon={cilShieldAlt} customClassName="nav-icon" />,
        },
        {
          component: CNavItem,
          name: 'Announcements',
          to: '/announcements',
          icon: <CIcon icon={cilBell} customClassName="nav-icon" />,
        },
        {
          component: CNavItem,
          name: 'Personal Announcements',
          to: '/personal-announcements',
          icon: <CIcon icon={cilShieldAlt} customClassName="nav-icon" />,
        },
        {
          component: CNavTitle,
          name: 'System',
        },
        {
          component: CNavItem,
          name: 'System Configuration',
          to: '/SystemConfiguration',
          icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
        },
        {
          component: CNavTitle,
          name: 'Analysis & Logs',
        },
        {
          component: CNavItem,
          name: 'Reports',
          to: '/reports',
          icon: <CIcon icon={cilChartPie} customClassName="nav-icon" />,
        },
        {
          component: CNavItem,
          name: 'Analytics',
          to: '/analytics',
          icon: <CIcon icon={cilChartLine} customClassName="nav-icon" />,
        },
        {
          component: CNavItem,
          name: 'Audit Logs',
          to: '/audit-logs',
          icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
        },
        {
          component: CNavItem,
          name: 'Statistics',
          to: '/statistics',
          icon: <CIcon icon={cilBarChart} customClassName="nav-icon" />,
        },
        {
          component: CNavTitle,
          name: 'Contacts',
        },
        {
          component: CNavItem,
          name: 'Contacts',
          to: '/contacts',
          icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
        },
      ]
    : []),

  // ────────────────────────────────────────────────
  // Superadmin – can inherit admin + add more later
  // ────────────────────────────────────────────────
  ...(role === 'superadmin'
    ? [
        // You can copy admin items or extend them
        // For now: same as admin + superadmin extras
        {
          component: CNavTitle,
          name: 'Superadmin Extras',
        },
        {
          component: CNavItem,
          name: 'System Tools',
          to: '/superadmin/tools',
          icon: <CIcon icon={cilShieldAlt} customClassName="nav-icon" />,
        },
        {
          component: CNavItem,
          name: 'Role Management',
          to: '/superadmin/roles',
          icon: <CIcon icon={cilPuzzle} customClassName="nav-icon" />,
        },
      ]
    : []),
]

export default _nav