// src/views/CTU/CTUupdates.js
import React, { useState, useEffect } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CForm,
  CFormInput,
  CFormSelect,
  CFormTextarea,
  CButton,
  CAlert,
  CSpinner,
  CRow,
  CCol,
  CFormLabel,
  CFormCheck,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilSave } from '@coreui/icons';

// ────────────────────────────────────────────────
// CONFIG - CHANGE THESE VALUES
// ────────────────────────────────────────────────
const CASE_IDS_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQVzEoD0pBG8KXFQ1asSJDJB7--S72TqxBiLhP-lO69ubi1A6UgagZlFGly1MlH_yR7mlFZTrqAfPz6/pub?output=csv';

const GENERAL_UPDATES_API = 'https://script.google.com/macros/s/AKfycbx4UAX-FoPoO-pFuZjl3sgV5fMEpvVR0U_aVmS3TcYHYgN6VQFwC1U7ZVK5cL5tTfJ4/exec';

// Replace with YOUR SECOND deployment URL for the TASK sheet
const TASK_API_URL = 'https://script.google.com/macros/s/AKfycbzLrb85VsiwH66_qJQdLmJ5Rd4scIKR6c9kCLIRzXsoQFOkBFWktb-864qp5FP_HQ4GKg/exec';
// ↑↑↑ Paste the /exec link from the second deployment here ↑↑↑

const CTUupdates = () => {
  const [caseIds, setCaseIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [updateText, setUpdateText] = useState('');
  const [location, setLocation] = useState('');
  const [peopleShort, setPeopleShort] = useState('');
  const [people, setPeople] = useState('');
  const [stage, setStage] = useState('');
  const [nextDate, setNextDate] = useState('');
  const [remark, setRemark] = useState('');
  const [isTask, setIsTask] = useState(false);
  const [taskDescription, setTaskDescription] = useState('');
  const [submitStatus, setSubmitStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch Case IDs from public CSV
  useEffect(() => {
    const fetchCaseIds = async () => {
      try {
        setLoading(true);
        const response = await fetch(CASE_IDS_CSV_URL);
        if (!response.ok) throw new Error(`CSV fetch failed: ${response.status}`);
        const text = await response.text();

        const rows = text.split('\n').slice(1);
        const ids = rows
          .map((row) => row.split(',')[0]?.trim())
          .filter((id) => id && id.length > 0);

        const uniqueIds = [...new Set(ids)].sort();
        setCaseIds(uniqueIds);

        if (uniqueIds.length === 0) setError('No Case IDs found in sheet');
      } catch (err) {
        console.error('CSV fetch error:', err);
        setError('Failed to load Case IDs. Check CSV link or publish settings.');
      } finally {
        setLoading(false);
      }
    };

    fetchCaseIds();
  }, []);

  const handleAddUpdate = async (e) => {
    e.preventDefault();

    if (!selectedCaseId || !updateText.trim()) {
      setSubmitStatus({ type: 'danger', message: 'Case ID and Update Details are required' });
      return;
    }

    if (isTask && !taskDescription.trim()) {
      setSubmitStatus({ type: 'danger', message: 'Please provide task description when marked as task' });
      return;
    }

    setSubmitting(true);
    setSubmitStatus({ type: 'info', message: 'Submitting...' });

    try {
      const timestamp = new Date().toISOString();

      // ── 1. General update payload ───────────────────────────────────────
      const generalPayload = {
        action: 'addUpdate',
        caseId: selectedCaseId,
        timestamp,
        updateText: updateText.trim(),
        location: location.trim(),
        peopleShort: peopleShort.trim(),
        people: people.trim(),
        stage,
        nextDate,
        remark: remark.trim(),
        isTask: isTask ? 'Yes' : 'No',
        taskDescription: taskDescription.trim(),
      };

      console.log('Sending general update:', generalPayload);

      // Send general update (fire-and-forget)
      fetch(GENERAL_UPDATES_API, {
        method: 'POST',
        mode: 'no-cors',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(generalPayload),
      }).catch(err => console.warn('General update may have failed:', err));

      // ── 2. If task is marked → send to task endpoint ─────────────────────
      let taskSuccess = false;
      if (isTask && taskDescription.trim()) {
        const taskPayload = {
          action: 'addTask',
          caseId: selectedCaseId,
          taskDescription: taskDescription.trim(),
        };

        console.log('Sending task payload:', taskPayload);

        await fetch(TASK_API_URL, {
          method: 'POST',
          mode: 'no-cors',
          redirect: 'follow',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(taskPayload),
        });

        taskSuccess = true; // we assume success (no-cors limitation)
      }

      // ── Success message ─────────────────────────────────────────────────
      setSubmitStatus({
        type: 'success',
        message: 'Update submitted successfully!' + 
                 (taskSuccess ? ' Task also added to task tracker.' : ''),
      });

      // Clear form
      setUpdateText('');
      setLocation('');
      setPeopleShort('');
      setPeople('');
      setStage('');
      setNextDate('');
      setRemark('');
      setSelectedCaseId('');
      setIsTask(false);
      setTaskDescription('');

      // Reload to refresh Case IDs / UI state
      setTimeout(() => window.location.reload(), 2800);

    } catch (err) {
      console.error('Critical submission error:', err);
      setSubmitStatus({
        type: 'danger',
        message: `Error during submission: ${err.message || 'Network issue'}`,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CRow>
      <CCol xs={12} md={10} lg={8} xl={8}>
        <CCard className="mb-4 shadow-sm">
          <CCardHeader className="bg-primary text-white">
            <strong>CTU Case Update Form</strong>
          </CCardHeader>

          <CCardBody>
            {loading && (
              <div className="text-center py-5">
                <CSpinner color="primary" />
                <p className="mt-3 text-muted">Loading available Case IDs...</p>
              </div>
            )}

            {error && (
              <CAlert color="danger" dismissible onClose={() => setError(null)}>
                {error}
              </CAlert>
            )}

            {!loading && !error && (
              <CForm onSubmit={handleAddUpdate}>
                {/* ── Case ID ──────────────────────────────────────────────── */}
                <div className="mb-3">
                  <CFormLabel htmlFor="caseSelect">
                    Case ID <span className="text-danger">*</span>
                  </CFormLabel>
                  <CFormSelect
                    id="caseSelect"
                    value={selectedCaseId}
                    onChange={(e) => setSelectedCaseId(e.target.value)}
                    disabled={submitting}
                    required
                  >
                    <option value="">-- Select Case --</option>
                    {caseIds.map((id) => (
                      <option key={id} value={id}>
                        {id}
                      </option>
                    ))}
                  </CFormSelect>
                </div>

                {/* ── Update Details ───────────────────────────────────────── */}
                <div className="mb-3">
                  <CFormLabel htmlFor="updateText">
                    Update Details <span className="text-danger">*</span>
                  </CFormLabel>
                  <CFormTextarea
                    id="updateText"
                    rows={4}
                    value={updateText}
                    onChange={(e) => setUpdateText(e.target.value)}
                    placeholder="Main update content..."
                    required
                    disabled={submitting}
                  />
                </div>

                {/* ── Location & People (short) ────────────────────────────── */}
                <CRow className="g-3">
                  <CCol md={6}>
                    <div className="mb-3">
                      <CFormLabel htmlFor="location">Location</CFormLabel>
                      <CFormInput
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Mumbai Office / Site A"
                        disabled={submitting}
                      />
                    </div>
                  </CCol>
                  <CCol md={6}>
                    <div className="mb-3">
                      <CFormLabel htmlFor="peopleShort">People (short)</CFormLabel>
                      <CFormInput
                        id="peopleShort"
                        value={peopleShort}
                        onChange={(e) => setPeopleShort(e.target.value)}
                        placeholder="e.g. Rohaan, Amit"
                        disabled={submitting}
                      />
                    </div>
                  </CCol>
                </CRow>

                {/* ── People full ───────────────────────────────────────────── */}
                <div className="mb-3">
                  <CFormLabel htmlFor="people">People / Involved Persons</CFormLabel>
                  <CFormTextarea
                    id="people"
                    rows={2}
                    value={people}
                    onChange={(e) => setPeople(e.target.value)}
                    placeholder="Full names, roles, contact info..."
                    disabled={submitting}
                  />
                </div>

                {/* ── Stage & Next Date ────────────────────────────────────── */}
                <CRow className="g-3">
                  <CCol md={6}>
                    <div className="mb-3">
                      <CFormLabel htmlFor="stage">Stage</CFormLabel>
                      <CFormSelect
                        id="stage"
                        value={stage}
                        onChange={(e) => setStage(e.target.value)}
                        disabled={submitting}
                      >
                        <option value="">-- Select Stage --</option>
                        <option value="Initial">Initial</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Review">Review</option>
                        <option value="Closed">Closed</option>
                        <option value="Escalated">Escalated</option>
                      </CFormSelect>
                    </div>
                  </CCol>
                  <CCol md={6}>
                    <div className="mb-3">
                      <CFormLabel htmlFor="nextDate">N.Date (Next Date)</CFormLabel>
                      <CFormInput
                        type="date"
                        id="nextDate"
                        value={nextDate}
                        onChange={(e) => setNextDate(e.target.value)}
                        disabled={submitting}
                      />
                    </div>
                  </CCol>
                </CRow>

                {/* ── Remark ───────────────────────────────────────────────── */}
                <div className="mb-3">
                  <CFormLabel htmlFor="remark">Remark</CFormLabel>
                  <CFormTextarea
                    id="remark"
                    rows={3}
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    placeholder="Additional notes, issues, approvals..."
                    disabled={submitting}
                  />
                </div>

                {/* ── Task section ─────────────────────────────────────────── */}
                <div className="mb-4">
                  <CFormCheck
                    id="isTask"
                    label="Mark this update as containing a task / action item"
                    checked={isTask}
                    onChange={(e) => {
                      setIsTask(e.target.checked);
                      if (!e.target.checked) setTaskDescription('');
                    }}
                    disabled={submitting}
                  />

                  {isTask && (
                    <div className="mt-3 ps-4 border-start border-primary border-3">
                      <CFormLabel htmlFor="taskDescription">
                        Task Description <span className="text-danger">*</span>
                        <small className="text-muted ms-2">(required when checked)</small>
                      </CFormLabel>
                      <CFormTextarea
                        id="taskDescription"
                        rows={3}
                        value={taskDescription}
                        onChange={(e) => setTaskDescription(e.target.value)}
                        placeholder="Describe the task, who is responsible, deadline, expected outcome..."
                        disabled={submitting}
                        required
                      />
                    </div>
                  )}
                </div>

                <small className="text-muted d-block mb-4">
                  Timestamp (IST): {new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                </small>

                {submitStatus && (
                  <CAlert
                    color={submitStatus.type}
                    dismissible
                    onClose={() => setSubmitStatus(null)}
                    className="mb-4"
                  >
                    {submitStatus.message}
                  </CAlert>
                )}

                <CButton
                  type="submit"
                  color="success"
                  disabled={submitting}
                  className="px-5 py-2"
                >
                  {submitting ? (
                    <>
                      <CSpinner size="sm" className="me-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CIcon icon={cilSave} className="me-2" />
                      Save Update
                    </>
                  )}
                </CButton>
              </CForm>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default CTUupdates;