// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useCallback } from 'react'

export const AuthContext = createContext()

const INACTIVITY_TIMEOUT = 10 * 60 * 1000   // 10 minutes in milliseconds

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)

  // Load user on app start
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const isAuth = localStorage.getItem('isAuthenticated') === 'true'

    if (storedUser && isAuth) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('user')
    setUser(null)
    window.location.href = '/login'   // Force redirect
  }, [])

  // ==================== 10 MIN INACTIVITY LOGOUT ====================
  useEffect(() => {
    if (!user) return

    let timer

    const resetTimer = () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        console.log('Inactivity timeout (10 min) → Logging out')
        logout()
      }, INACTIVITY_TIMEOUT)
    }

    // Reset timer on any user activity
    const events = ['mousemove', 'keydown', 'mousedown', 'scroll', 'touchstart', 'click']
    events.forEach(event => window.addEventListener(event, resetTimer))

    resetTimer() // Start timer

    return () => {
      clearTimeout(timer)
      events.forEach(event => window.removeEventListener(event, resetTimer))
    }
  }, [user, logout])

  // ==================== LOGOUT WHEN WINDOW/TAB IS CLOSED ====================
  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.removeItem('isAuthenticated')
      localStorage.removeItem('user')
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}