import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  return (
    <CFooter className="px-4">
      <div>
        <a href="www.linkedin.com/in/therohaan" target="_blank" rel="noopener noreferrer">
          Rohan Singh
        </a>
        <span className="ms-1">&copy; 2026.</span>
      </div>
      <div className="ms-auto">
        <span className="me-1">Powered by</span>
        <a href="Majlis" target="_blank" rel="noopener noreferrer">
          Majlis
        </a>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
