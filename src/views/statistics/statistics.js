// src/views/statistics/Statistics.js
import React, { useState, useEffect, useMemo } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CRow,
  CCol,
  CWidgetStatsA,
  CWidgetStatsF,
  CButton,
  CSpinner,
  CAlert,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/react'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import axios from 'axios'
import Papa from 'papaparse'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const SOURCES = [
  {
    name: 'Client Information',
    url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRSwmpqyyssqeSv-6Q2YW4LDRJLSO0BKS-xsTRXSJcgnHwDbaQZzbKR6pnFNJWFOfvmJhZHTRbKxtd2/pub?output=csv',
  },
  {
    name: 'Case Updates',
    url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQVzEoD0pBG8KXFQ1asSJDJB7--S72TqxBiLhP-lO69ubi1A6UgagZlFGly1MlH_yR7mlFZTrqAfPz6/pub?output=csv',
  },
]

const Statistics = () => {
  const [mergedData, setMergedData] = useState([])
  const [allColumns, setAllColumns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAndMerge = async () => {
      try {
        setLoading(true)
        const allRawData = []

        for (const source of SOURCES) {
          const res = await axios.get(source.url, { responseType: 'text' })
          const csvText = res.data.trim()
          if (!csvText) continue

          const parsed = Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            transformHeader: h => h.trim(),
          })

          const fileData = parsed.data.map(row => ({ ...row, __source: source.name }))
          allRawData.push(...fileData)
        }

        if (allRawData.length === 0) {
          setError('No data found in sources.')
          return
        }

        // Merge by Case ID
        const mergedMap = new Map()
        allRawData.forEach(row => {
          const caseId = (row['Case ID'] || row['CaseID'] || '').trim().toUpperCase()
          if (!caseId) return
          if (!mergedMap.has(caseId)) {
            mergedMap.set(caseId, { CaseID: caseId, ...row })
          } else {
            mergedMap.set(caseId, { ...mergedMap.get(caseId), ...row })
          }
        })

        const data = Array.from(mergedMap.values())
        setMergedData(data)

        // Dynamically get all columns (excluding internal)
        const columns = new Set()
        data.forEach(row => {
          Object.keys(row).forEach(k => {
            if (k !== '__source' && k !== 'CaseID') columns.add(k)
          })
        })
        setAllColumns(Array.from(columns).sort())

      } catch (err) {
        console.error(err)
        setError('Failed to load or merge data.')
      } finally {
        setLoading(false)
      }
    }

    fetchAndMerge()
  }, [])

  const stats = useMemo(() => {
    if (!mergedData.length || !allColumns.length) return null

    const total = mergedData.length

    // Completeness (missing fields)
    const completeness = {}
    allColumns.forEach(col => {
      let filled = 0
      mergedData.forEach(row => {
        const val = row[col]
        if (val !== undefined && val !== null && String(val).trim() !== '') filled++
      })
      completeness[col] = {
        filled,
        missing: total - filled,
        percent: ((filled / total) * 100).toFixed(1),
      }
    })

    // Categorical frequency (top values for selected columns)
    const categorical = {}
    const importantCategorical = [
      'C Gender', 'C Religion', 'C Education', 'C Occupation',
      'C Area', 'Complaint against', 'Marriage Act', 'Case pending',
      'Preferred Language for Consultation'
    ]

    importantCategorical.forEach(col => {
      if (!allColumns.includes(col)) return
      const count = {}
      mergedData.forEach(row => {
        const val = (row[col] || 'Unknown').trim()
        count[val] = (count[val] || 0) + 1
      })
      categorical[col] = Object.entries(count)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8) // top 8 values
    })

    // Age bins
    const ageBins = { '<18': 0, '18-30': 0, '31-45': 0, '46+': 0, 'Unknown': 0 }
    mergedData.forEach(row => {
      const age = parseInt(row['C Age'] || 0, 10)
      if (isNaN(age) || age <= 0) ageBins.Unknown++
      else if (age < 18) ageBins['<18']++
      else if (age <= 30) ageBins['18-30']++
      else if (age <= 45) ageBins['31-45']++
      else ageBins['46+']++
    })

    return {
      totalCases: total,
      completeness,
      categorical,
      ageBins,
    }
  }, [mergedData, allColumns])

  const exportStatsCSV = () => {
    if (!stats) return

    const rows = [
      ['Statistic', 'Value'],
      ['Total Cases', stats.totalCases],
    ]

    // Add completeness
    rows.push(['Column Completeness (%)'])
    Object.entries(stats.completeness).forEach(([col, info]) => {
      rows.push([col, `${info.percent}% filled (${info.filled}/${stats.totalCases})`])
    })

    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Case_Statistics_Full_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const ageChartData = stats ? {
    labels: Object.keys(stats.ageBins),
    datasets: [{
      label: 'Cases',
      data: Object.values(stats.ageBins),
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
    }],
  } : null

  const chartOptions = {
    responsive: true,
    plugins: { legend: { position: 'top' }, title: { display: true, text: 'Client Age Distribution' } },
  }

  if (loading) return (
    <div className="text-center mt-5">
      <CSpinner color="primary" />
      <p className="mt-2">Preparing detailed statistics...</p>
    </div>
  )

  if (error) return <CAlert color="danger" className="m-4">{error}</CAlert>

  if (!stats) return <div className="text-center mt-5">No data available for analysis.</div>

  return (
    <CCard className="mb-4 shadow-sm">
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <div>
          <CCardTitle className="mb-0">Ultimate Case Statistics</CCardTitle>
          <small className="text-muted">All columns • Completeness • Distributions • {stats.totalCases} cases</small>
        </div>
        <CButton color="primary" variant="outline" onClick={exportStatsCSV}>
          Export Full Stats (CSV)
        </CButton>
      </CCardHeader>

      <CCardBody>
        <CRow className="mb-4">
          <CCol sm={6} lg={3}>
            <CWidgetStatsA
              color="primary"
              value={stats.totalCases}
              title="Total Cases"
            />
          </CCol>
          <CCol sm={6} lg={3}>
            <CWidgetStatsA
              color="info"
              value={`${(Object.values(stats.completeness).reduce((sum, c) => sum + parseFloat(c.percent), 0) / allColumns.length).toFixed(1)}%`}
              title="Average Completeness"
            />
          </CCol>
          <CCol sm={6} lg={3}>
            <CWidgetStatsF
              color="warning"
              title="Most Complete Field"
              value={Object.entries(stats.completeness).sort((a,b) => parseFloat(b[1].percent) - parseFloat(a[1].percent))[0]?.[0] || '-'}
            />
          </CCol>
          <CCol sm={6} lg={3}>
            <CWidgetStatsF
              color="danger"
              title="Least Complete Field"
              value={Object.entries(stats.completeness).sort((a,b) => parseFloat(a[1].percent) - parseFloat(b[1].percent))[0]?.[0] || '-'}
            />
          </CCol>
        </CRow>

        {/* Age Distribution Chart */}
        <CCard className="mb-4">
          <CCardHeader>Age Distribution of Clients</CCardHeader>
          <CCardBody>
            <Bar data={ageChartData} options={chartOptions} height={80} />
          </CCardBody>
        </CCard>

        {/* Data Completeness Table */}
        <CCard className="mb-4">
          <CCardHeader>Data Completeness (Missing Fields Analysis)</CCardHeader>
          <CCardBody className="p-0">
            <div style={{ maxHeight: '400px', overflow: 'auto' }}>
              <CTable hover small striped>
                <CTableHead color="dark">
                  <CTableRow>
                    <CTableHeaderCell>Column</CTableHeaderCell>
                    <CTableHeaderCell>Filled</CTableHeaderCell>
                    <CTableHeaderCell>Missing</CTableHeaderCell>
                    <CTableHeaderCell>Completeness %</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {Object.entries(stats.completeness).map(([col, info]) => (
                    <CTableRow key={col}>
                      <CTableDataCell>{col}</CTableDataCell>
                      <CTableDataCell>{info.filled}</CTableDataCell>
                      <CTableDataCell>{info.missing}</CTableDataCell>
                      <CTableDataCell>
                        <strong>{info.percent}%</strong>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </div>
          </CCardBody>
        </CCard>

        {/* Categorical Breakdowns */}
        <CRow>
          {Object.entries(stats.categorical).map(([col, values]) => (
            <CCol md={6} lg={4} key={col} className="mb-4">
              <CCard>
                <CCardHeader>Top values: {col}</CCardHeader>
                <CCardBody>
                  <ul className="list-group list-group-flush">
                    {values.map(([val, count], i) => (
                      <li key={i} className="list-group-item d-flex justify-content-between">
                        {val || '—'}
                        <span className="badge bg-primary rounded-pill">{count}</span>
                      </li>
                    ))}
                  </ul>
                </CCardBody>
              </CCard>
            </CCol>
          ))}
        </CRow>
      </CCardBody>
    </CCard>
  )
}

export default Statistics