// src/views/report/Report.js
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CCardText,
  CButton,
  CSpinner,
  CAlert,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CFormInput,
  CFormSelect,
  CFormLabel,
  CRow,
  CCol,
  CPagination,
  CPaginationItem,
  CInputGroup,
  CInputGroupText,
} from '@coreui/react'
import { cilX } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import axios from 'axios'
import Papa from 'papaparse'

// Simple debounce utility
const debounce = (func, wait) => {
  let timeout
  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

const SOURCES = [
  {
    name: 'Client Information',
    url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRSwmpqyyssqeSv-6Q2YW4LDRJLSO0BKS-xsTRXSJcgnHwDbaQZzbKR6pnFNJWFOfvmJhZHTRbKxtd2/pub?output=csv',
    idKey: 'Case ID',
  },
  {
    name: 'Case Updates',
    url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQVzEoD0pBG8KXFQ1asSJDJB7--S72TqxBiLhP-lO69ubi1A6UgagZlFGly1MlH_yR7mlFZTrqAfPz6/pub?output=csv',
    idKey: 'CaseID',
  },
]

const Report = () => {
  const [mergedData, setMergedData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [globalSearch, setGlobalSearch] = useState('')
  const [columnFilters, setColumnFilters] = useState({})
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Debounced column filter handler
  const debouncedSetColumnFilter = useMemo(
    () => debounce((key, value) => {
      setColumnFilters(prev => ({ ...prev, [key]: value }))
    }, 300),
    []
  )

  useEffect(() => {
    const fetchAndMerge = async () => {
      try {
        setLoading(true)
        setError(null)

        const allRawData = []

        for (const source of SOURCES) {
          const response = await axios.get(source.url, { responseType: 'text' })
          const csvText = response.data.trim()

          if (!csvText) continue

          const parsed = Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            transformHeader: h => h.trim(),
          })

          if (parsed.errors.length > 0) {
            console.warn(`Parse issues in ${source.name}:`, parsed.errors)
          }

          const fileData = parsed.data.map(row => ({
            ...row,
            __source: source.name,
          }))

          allRawData.push(...fileData)
        }

        if (allRawData.length === 0) {
          setError('No data available from the published sources.')
          return
        }

        // Merge by Case ID
        const mergedMap = new Map()
        allRawData.forEach(row => {
          let caseId = (row['Case ID'] || row['CaseID'] || '').trim().toUpperCase()
          if (!caseId) return

          if (!mergedMap.has(caseId)) {
            mergedMap.set(caseId, { CaseID: caseId, ...row })
          } else {
            mergedMap.set(caseId, { ...mergedMap.get(caseId), ...row })
          }
        })

        const data = Array.from(mergedMap.values())
        setMergedData(data)
        setFilteredData(data)
        setColumnFilters({})
        setGlobalSearch('')

      } catch (err) {
        console.error('Data load error:', err)
        setError('Unable to load or merge data. Check the published CSV links.')
      } finally {
        setLoading(false)
      }
    }

    fetchAndMerge()
  }, [])

  // Filtering + sorting logic
  useEffect(() => {
    let result = [...mergedData]

    // Apply column filters
    Object.entries(columnFilters).forEach(([col, val]) => {
      if (val?.trim()) {
        const lowerVal = val.toLowerCase().trim()
        result = result.filter(row => {
          const cell = String(row[col] || '').toLowerCase()
          return cell.includes(lowerVal)
        })
      }
    })

    // Global search
    if (globalSearch.trim()) {
      const lowerSearch = globalSearch.toLowerCase()
      result = result.filter(row =>
        Object.values(row).some(val =>
          String(val).toLowerCase().includes(lowerSearch)
        )
      )
    }

    // Sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key] || ''
        const bVal = b[sortConfig.key] || ''
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    setFilteredData(result)
    setCurrentPage(1)
  }, [globalSearch, columnFilters, sortConfig, mergedData])

  const requestSort = useCallback((key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }))
  }, [])

  const handleColumnFilterChange = (key, value) => {
    debouncedSetColumnFilter(key, value)
  }

  const clearAllFilters = () => {
    setColumnFilters({})
    setGlobalSearch('')
  }

  // Pagination
  const indexOfLast = currentPage * itemsPerPage
  const indexOfFirst = indexOfLast - itemsPerPage
  const currentItems = filteredData.slice(indexOfFirst, indexOfLast)
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)

  const paginate = (page) => setCurrentPage(page)

  const exportToExcel = () => {
    if (filteredData.length === 0) return

    const ws = XLSX.utils.json_to_sheet(filteredData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Filtered_Cases')

    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    })

    saveAs(blob, `Filtered_Cases_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const headers = useMemo(() => {
    if (mergedData.length === 0) return []
    const keys = new Set()
    mergedData.forEach(row => Object.keys(row).forEach(k => k !== '__source' && keys.add(k)))
    return Array.from(keys).sort()
  }, [mergedData])

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <CSpinner color="primary" variant="grow" />
        <span className="ms-3">Loading & merging case data...</span>
      </div>
    )
  }

  if (error) {
    return <CAlert color="danger" dismissible className="m-4">{error}</CAlert>
  }

  return (
    <CCard className="mb-4 shadow-sm border-0">
      <CCardHeader className="d-flex justify-content-between align-items-center bg-light">
        <div>
          <CCardTitle className="mb-0 fs-4">Merged Cases Dashboard</CCardTitle>
          <CCardText className="text-muted small mb-0">
            Client information + case updates — filter any column, search globally, sort & export
          </CCardText>
        </div>
        <CButton
          color="success"
          variant="outline"
          onClick={exportToExcel}
          disabled={filteredData.length === 0}
        >
          Export Filtered Data
        </CButton>
      </CCardHeader>

      <CCardBody>
        <CRow className="mb-3 align-items-end g-3">
          <CCol md={5} lg={6}>
            <CFormLabel htmlFor="globalSearch">Global Search</CFormLabel>
            <CInputGroup>
              <CFormInput
                id="globalSearch"
                placeholder="Search across all columns..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
              />
              {globalSearch && (
                <CInputGroupText
                  style={{ cursor: 'pointer' }}
                  onClick={() => setGlobalSearch('')}
                >
                  <CIcon icon={cilX} />
                </CInputGroupText>
              )}
            </CInputGroup>
          </CCol>

          <CCol md={3} lg={2}>
            <CFormLabel htmlFor="perPage">Items per page</CFormLabel>
            <CFormSelect
              id="perPage"
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </CFormSelect>
          </CCol>

          <CCol md={4} lg={4} className="text-md-end">
            <CButton
              color="secondary"
              variant="outline"
              size="sm"
              className="mt-3 mt-md-0"
              onClick={clearAllFilters}
              disabled={Object.keys(columnFilters).length === 0 && !globalSearch}
            >
              Clear All Filters
            </CButton>
            <small className="d-block text-muted mt-1">
              {filteredData.length} matching cases
            </small>
          </CCol>
        </CRow>

        {filteredData.length > 0 ? (
          <>
            <div className="table-responsive" style={{ maxHeight: '65vh', overflow: 'auto' }}>
              <CTable hover striped bordered small className="mb-0">
                <CTableHead color="dark">
                  <CTableRow>
                    {headers.map((header) => (
                      <CTableHeaderCell key={header} scope="col">
                        <div
                          onClick={() => requestSort(header)}
                          style={{ cursor: 'pointer', userSelect: 'none', fontWeight: 600 }}
                        >
                          {header.replace(/([A-Z])/g, ' $1').trim()}
                          {sortConfig.key === header ? (
                            sortConfig.direction === 'asc' ? ' ↑' : ' ↓'
                          ) : null}
                        </div>
                        <CFormInput
                          size="sm"
                          className="mt-2"
                          placeholder={`Filter ${header.replace(/([A-Z])/g, ' $1').trim()}`}
                          value={columnFilters[header] || ''}
                          onChange={(e) => handleColumnFilterChange(header, e.target.value)}
                        />
                      </CTableHeaderCell>
                    ))}
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {currentItems.map((row, idx) => (
                    <CTableRow key={idx}>
                      {headers.map((header) => (
                        <CTableDataCell key={header}>
                          {row[header] || '-'}
                        </CTableDataCell>
                      ))}
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </div>

            {totalPages > 1 && (
              <div className="d-flex justify-content-center mt-4">
                <CPagination aria-label="Table pagination" size="sm">
                  <CPaginationItem
                    disabled={currentPage === 1}
                    onClick={() => paginate(currentPage - 1)}
                  >
                    Previous
                  </CPaginationItem>
                  {[...Array(totalPages)].map((_, i) => (
                    <CPaginationItem
                      key={i + 1}
                      active={i + 1 === currentPage}
                      onClick={() => paginate(i + 1)}
                    >
                      {i + 1}
                    </CPaginationItem>
                  ))}
                  <CPaginationItem
                    disabled={currentPage === totalPages}
                    onClick={() => paginate(currentPage + 1)}
                  >
                    Next
                  </CPaginationItem>
                </CPagination>
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-muted py-5">
            No cases match your current filters. Try adjusting or clearing them.
          </div>
        )}
      </CCardBody>
    </CCard>
  )
}

export default Report