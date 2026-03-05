// src/views/ctu/CTU.js
import React, { useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CForm,
  CFormInput,
  CFormSelect,
  CFormTextarea,
  CButton,
  CRow,
  CCol,
  CAlert,
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody,
} from '@coreui/react'

const CTUnew = () => {
  const [formData, setFormData] = useState({})
  const [status, setStatus] = useState('') // '' | 'submitting' | 'success' | 'error'
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwtKNCV693Oi2fC-McIBmKcU7jNiywEyUYKuWguFYkhS5yCpqCcj0G4rwYP_1fXsi3GYQ/exec' // ← PASTE YOUR URL HERE

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('submitting')

    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',           // Apps Script requirement
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      setStatus('success')
      setFormData({})
      alert('✅ Case submitted successfully!')
    } catch (err) {
      console.error(err)
      setStatus('error')
      alert('❌ Submission failed. Please try again.')
    }
  }

  return (
    <CCard>
      <CCardHeader>
        <strong>New Case / Task / User Intake (CTU)</strong>
      </CCardHeader>
      <CCardBody>
        {status === 'success' && <CAlert color="success">Case saved to Google Sheets!</CAlert>}
        {status === 'error' && <CAlert color="danger">Error submitting case</CAlert>}

        <CForm onSubmit={handleSubmit}>
          <CAccordion activeItemKey={1} flush>

            {/* SECTION 1 */}
            <CAccordionItem itemKey={1}>
              <CAccordionHeader>1. Client Personal Details</CAccordionHeader>
              <CAccordionBody>
                <CRow className="g-3">
                  <CCol md={6}><CFormInput name="clientName" label="Client Name" onChange={handleChange} required /></CCol>
                  <CCol md={3}><CFormInput name="cMobile" label="C Mobile" type="tel" onChange={handleChange} /></CCol>
                  <CCol md={3}><CFormInput name="cPhone" label="C Phone" type="tel" onChange={handleChange} /></CCol>
                  <CCol md={6}><CFormInput name="cEmail" label="C Email" type="email" onChange={handleChange} /></CCol>
                  <CCol md={6}><CFormInput name="cAddress" label="C Address" onChange={handleChange} /></CCol>
                  <CCol md={4}><CFormInput name="cArea" label="C Area" onChange={handleChange} /></CCol>
                  <CCol md={2}><CFormInput name="cAge" label="C Age" type="number" onChange={handleChange} /></CCol>
                  <CCol md={3}>
                    <CFormSelect name="cGender" label="C Gender" onChange={handleChange}>
                      <option value="">Select</option>
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </CFormSelect>
                  </CCol>
                  <CCol md={3}><CFormInput name="cReligion" label="C Religion" onChange={handleChange} /></CCol>
                  <CCol md={3}><CFormInput name="cEducation" label="C Education" onChange={handleChange} /></CCol>
                  <CCol md={3}><CFormInput name="cOccupation" label="C Occupation" onChange={handleChange} /></CCol>
                  <CCol md={3}><CFormInput name="cIncome" label="C Income p/m" onChange={handleChange} /></CCol>
                </CRow>
              </CAccordionBody>
            </CAccordionItem>

            {/* SECTION 2 */}
            <CAccordionItem itemKey={2}>
              <CAccordionHeader>2. Children Information</CAccordionHeader>
              <CAccordionBody>
                <CRow className="g-3">
                  <CCol md={4}><CFormInput name="childrenNumber" label="Children Number" type="number" onChange={handleChange} /></CCol>
                  <CCol md={8}><CFormInput name="childrenGenderAge" label="Children Gender/Age" onChange={handleChange} /></CCol>
                  <CCol md={12}><CFormInput name="childrenResidingWith" label="Children residing with" onChange={handleChange} /></CCol>
                </CRow>
              </CAccordionBody>
            </CAccordionItem>

            {/* SECTION 3 */}
            <CAccordionItem itemKey={3}>
              <CAccordionHeader>3. Complaint & Other Side (OS)</CAccordionHeader>
              <CAccordionBody>
                <CRow className="g-3">
                  <CCol md={12}><CFormInput name="complaintAgainst" label="Complaint against" onChange={handleChange} /></CCol>
                  <CCol md={12}><CFormInput name="documents" label="Documents (list)" onChange={handleChange} /></CCol>

                  <CCol md={6}><CFormInput name="osName" label="Other side (OS) Name" onChange={handleChange} /></CCol>
                  <CCol md={6}><CFormInput name="osContact" label="OS Contact" onChange={handleChange} /></CCol>
                  <CCol md={4}><CFormInput name="osArea" label="OS Area" onChange={handleChange} /></CCol>
                  <CCol md={2}><CFormInput name="osAge" label="OS Age" type="number" onChange={handleChange} /></CCol>
                  <CCol md={3}>
                    <CFormSelect name="osGender" label="OS Gender" onChange={handleChange}>
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </CFormSelect>
                  </CCol>
                  <CCol md={3}><CFormInput name="osReligion" label="OS Religion" onChange={handleChange} /></CCol>
                  <CCol md={3}><CFormInput name="osEducation" label="OS Education" onChange={handleChange} /></CCol>
                  <CCol md={3}><CFormInput name="osOccupation" label="OS Occupation" onChange={handleChange} /></CCol>
                  <CCol md={3}><CFormInput name="osIncome" label="OS Income p/m" onChange={handleChange} /></CCol>
                  <CCol md={3}><CFormInput name="osClass" label="OS Class" onChange={handleChange} /></CCol>
                </CRow>
              </CAccordionBody>
            </CAccordionItem>

            {/* SECTION 4 */}
            <CAccordionItem itemKey={4}>
              <CAccordionHeader>4. Marriage Details</CAccordionHeader>
              <CAccordionBody>
                <CRow className="g-3">
                  <CCol md={12}><CFormTextarea name="marriageDetails" label="Marriage Details" rows={3} onChange={handleChange} /></CCol>
                  <CCol md={3}><CFormInput name="marriageDate" label="Marriage Date" type="date" onChange={handleChange} /></CCol>
                  <CCol md={3}><CFormInput name="separationDate" label="Separation Date or Period" onChange={handleChange} /></CCol>
                  <CCol md={3}><CFormInput name="marriageAct" label="Marriage Act" onChange={handleChange} /></CCol>
                  <CCol md={3}><CFormInput name="marriageRegistered" label="Marriage Registered" onChange={handleChange} /></CCol>
                  <CCol md={6}><CFormInput name="marriageCity" label="Marriage City" onChange={handleChange} /></CCol>
                  <CCol md={6}>
                    <CFormSelect name="husbandAffair" label="Husband Affair" onChange={handleChange}>
                      <option value="">Select</option><option value="Yes">Yes</option><option value="No">No</option>
                    </CFormSelect>
                  </CCol>
                  <CCol md={6}>
                    <CFormSelect name="husbandPolygamy" label="Husband Polygamy" onChange={handleChange}>
                      <option value="">Select</option><option value="Yes">Yes</option><option value="No">No</option>
                    </CFormSelect>
                  </CCol>
                  <CCol md={6}><CFormInput name="sheIsFirstOrSecondWife" label="She is 1st/2nd wife" onChange={handleChange} /></CCol>
                </CRow>
              </CAccordionBody>
            </CAccordionItem>

            {/* SECTION 5 */}
            <CAccordionItem itemKey={5}>
              <CAccordionHeader>5. Violence & Problem</CAccordionHeader>
              <CAccordionBody>
                <CFormTextarea name="violenceDetails" label="Violence details" rows={4} onChange={handleChange} />
                <CFormTextarea name="problemStatement" label="Briefly state your problem" rows={6} className="mt-3" onChange={handleChange} required />
              </CAccordionBody>
            </CAccordionItem>

            {/* SECTION 6 */}
            <CAccordionItem itemKey={6}>
              <CAccordionHeader>6. Help Sought & Case Status</CAccordionHeader>
              <CAccordionBody>
                <CRow className="g-3">
                  <CCol md={12}><CFormInput name="approachedHelp" label="Who have you approached for help" onChange={handleChange} /></CCol>
                  <CCol md={12}><CFormInput name="howHelped" label="How did they help" onChange={handleChange} /></CCol>
                  <CCol md={6}>
                    <CFormSelect name="casePending" label="Case pending" onChange={handleChange}>
                      <option value="">Select</option><option value="Yes">Yes</option><option value="No">No</option>
                    </CFormSelect>
                  </CCol>
                  <CCol md={6}><CFormInput name="pendingDetails" label="Case pending Details" onChange={handleChange} /></CCol>
                </CRow>
              </CAccordionBody>
            </CAccordionItem>

            {/* SECTION 7 */}
            <CAccordionItem itemKey={7}>
              <CAccordionHeader>7. Referral & Additional Info</CAccordionHeader>
              <CAccordionBody>
                <CRow className="g-3">
                  <CCol md={12}><CFormInput name="hearAboutMajlis" label="How did you hear about Majlis" onChange={handleChange} /></CCol>
                  <CCol md={12}><CFormInput name="referenceContact" label="Reference Name & Contact No" onChange={handleChange} /></CCol>
                  <CCol md={6}><CFormInput name="preferredLanguage" label="Preferred Language for Consultation" onChange={handleChange} /></CCol>
                  <CCol md={6}><CFormInput name="formFilledBy" label="Form filled by" onChange={handleChange} required /></CCol>
                </CRow>
              </CAccordionBody>
            </CAccordionItem>

          </CAccordion>

          <CButton
            type="submit"
            color="primary"
            size="lg"
            className="mt-4 w-100"
            disabled={status === 'submitting'}
          >
            {status === 'submitting' ? 'Submitting to Google Sheets...' : 'Submit Case'}
          </CButton>
        </CForm>
      </CCardBody>
    </CCard>
  )
}

export default CTUnew