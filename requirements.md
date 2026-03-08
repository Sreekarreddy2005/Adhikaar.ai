# Requirements Document: Adhikaar.ai
**Tagline:** Turning Rights into Reality  
**Domain:** AI for Communities, Access & Public Impact

## 1. Executive Summary

Adhikaar.ai is an autonomous execution agent designed to bridge the awareness-execution gap in India's public scholarship system. The platform shifts the burden from students to an AI system that automatically discovers eligible scholarships and completes applications on their behalf.

## 2. Problem Statement

### 2.1 The Awareness-Execution Trap
Millions of eligible rural students in India miss out on government scholarships due to systemic barriers:

**A. The Awareness Gap**
- Students are unaware of specific schemes they qualify for among thousands of fragmented options
- Lack of knowledge to search effectively across multiple government portals
- Information asymmetry between urban and rural students

**B. The Execution Gap**
- Unstable government portals prone to crashes and timeouts
- Complex application forms requiring English proficiency
- Repetitive document uploads across different schemes
- Poor user experience on legacy systems

**Result:** Eligibility does not translate into benefit delivery.

## 3. User Stories

### 3.1 Primary User: Rural Student
**As a** rural student from a low-income family,  
**I want to** upload my documents once and have scholarships automatically applied for,  
**So that** I can access financial aid without navigating complex government portals.

### 3.2 Secondary User: NGO/School Administrator
**As an** NGO worker or school administrator,  
**I want to** help multiple students apply for scholarships in bulk,  
**So that** I can maximize scholarship uptake in my community.

## 4. Functional Requirements

### 4.1 Document Management (FR-1)
**FR-1.1:** System shall provide a secure document vault for one-time upload of student credentials  
**FR-1.2:** System shall accept the following document types:
- Income Certificate
- Caste Certificate
- Academic Marksheets
- Aadhaar Card
- Bank Account Details

**FR-1.3:** System shall encrypt all documents at rest using AWS S3 encryption  
**FR-1.4:** System shall support image formats (JPG, PNG) and PDF documents  
**FR-1.5:** System shall validate document completeness before processing

### 4.2 Intelligent Data Extraction (FR-2)
**FR-2.1:** System shall use Amazon Textract to extract structured data from uploaded documents  
**FR-2.2:** System shall extract key fields including:
- Family annual income
- Caste/category (SC/ST/OBC/General)
- Academic performance (percentage/CGPA)
- State of residence
- Age and date of birth
- Bank account information

**FR-2.3:** System shall handle handwritten and printed text  
**FR-2.4:** System shall validate extracted data against expected formats  
**FR-2.5:** System shall flag documents requiring manual review if confidence score < 85%

### 4.3 Eligibility Matching Engine (FR-3)
**FR-3.1:** System shall maintain a database of Central and State scholarship schemes  
**FR-3.2:** System shall implement a rules engine to match student profiles against eligibility criteria  
**FR-3.3:** System shall support complex eligibility rules including:
- Income thresholds
- Category-based reservations
- Academic performance requirements
- Geographic restrictions
- Age limits

**FR-3.4:** System shall rank matched scholarships by application deadline  
**FR-3.5:** System shall notify students of newly matched scholarships as schemes open

### 4.4 Autonomous Application Execution (FR-4)
**FR-4.1:** System shall launch headless browser agents to navigate government portals  
**FR-4.2:** System shall automatically fill application forms using extracted data  
**FR-4.3:** System shall upload required documents to portal file inputs  
**FR-4.4:** System shall handle multi-page application workflows  
**FR-4.5:** System shall capture submission confirmation (screenshot + application ID)  
**FR-4.6:** System shall support CAPTCHA solving (manual fallback if needed)

### 4.5 Resilience & Retry Mechanism (FR-5)
**FR-5.1:** System shall detect portal failures (timeouts, crashes, errors)  
**FR-5.2:** System shall implement exponential backoff retry strategy  
**FR-5.3:** System shall schedule retries during off-peak hours (e.g., 3:00 AM)  
**FR-5.4:** System shall limit retry attempts to 5 per application  
**FR-5.5:** System shall notify students of persistent failures requiring manual intervention

### 4.6 Audit Trail & Transparency (FR-6)
**FR-6.1:** System shall log all application attempts with timestamps  
**FR-6.2:** System shall store submission screenshots as proof  
**FR-6.3:** System shall provide students with application IDs for tracking  
**FR-6.4:** System shall maintain status dashboard showing:
- Applications in progress
- Successfully submitted applications
- Failed applications requiring attention

**FR-6.5:** System shall generate downloadable application reports

### 4.7 Notification System (FR-7)
**FR-7.1:** System shall send SMS notifications for:
- Successful document upload
- New scholarship matches
- Application submission success
- Application failures

**FR-7.2:** System shall support regional languages for notifications  
**FR-7.3:** System shall provide email notifications as backup channel

## 5. Non-Functional Requirements

### 5.1 Security (NFR-1)
**NFR-1.1:** All documents shall be encrypted at rest (AES-256)  
**NFR-1.2:** All data in transit shall use TLS 1.3  
**NFR-1.3:** System shall implement role-based access control (AWS IAM)  
**NFR-1.4:** System shall comply with India's Digital Personal Data Protection Act  
**NFR-1.5:** System shall implement audit logging for all data access

### 5.2 Performance (NFR-2)
**NFR-2.1:** OCR processing shall complete within 30 seconds per document  
**NFR-2.2:** Eligibility matching shall complete within 5 seconds  
**NFR-2.3:** System shall support concurrent processing of 100+ applications  
**NFR-2.4:** Portal automation shall timeout after 10 minutes per application

### 5.3 Scalability (NFR-3)
**NFR-3.1:** System shall scale to support 100,000 students in first year  
**NFR-3.2:** System shall handle 10,000 concurrent document uploads  
**NFR-3.3:** System shall auto-scale Fargate tasks based on application queue depth

### 5.4 Reliability (NFR-4)
**NFR-4.1:** System shall achieve 99.5% uptime  
**NFR-4.2:** System shall have zero data loss guarantee for uploaded documents  
**NFR-4.3:** System shall maintain application state across failures

### 5.5 Usability (NFR-5)
**NFR-5.1:** System shall support mobile-first interface  
**NFR-5.2:** System shall support Hindi and English interfaces  
**NFR-5.3:** System shall require < 5 minutes for initial document upload  
**NFR-5.4:** System shall work on 2G/3G networks (< 500KB page size)

### 5.6 Maintainability (NFR-6)
**NFR-6.1:** System shall use Infrastructure as Code (AWS CloudFormation/Terraform)  
**NFR-6.2:** System shall implement comprehensive logging (CloudWatch)  
**NFR-6.3:** System shall support A/B testing for portal automation scripts

## 6. Acceptance Criteria

### 6.1 Minimum Viable Product (MVP)
- [ ] Student can upload 5 core documents (Income, Caste, Marksheet, Aadhaar, Bank)
- [ ] System extracts data from documents with >85% accuracy
- [ ] System matches student to at least 3 Central scholarships
- [ ] System successfully submits 1 application to NSP (National Scholarship Portal)
- [ ] System provides submission screenshot and application ID
- [ ] System retries failed applications at least once

### 6.2 Success Metrics
- **Technical Success:** 80% application submission success rate
- **User Success:** 90% of students receive at least 1 scholarship match
- **Impact Success:** 50% reduction in time-to-apply compared to manual process

## 7. Constraints & Assumptions

### 7.1 Constraints
- Must work with existing government portals (no API access)
- Must handle legacy web technologies (no modern REST APIs)
- Must operate within AWS Free Tier limits for hackathon demo
- Must comply with Indian data protection regulations

### 7.2 Assumptions
- Students have access to smartphone with camera
- Students can provide valid government-issued documents
- Government portals maintain consistent HTML structure
- Internet connectivity available for initial upload

## 8. Out of Scope (Future Enhancements)
- Real-time scholarship status tracking from government portals
- Integration with Digilocker for automatic document fetching
- AI-powered essay writing for scholarship applications
- Scholarship disbursement tracking
- Multi-language OCR beyond English and Hindi
- Blockchain-based credential verification

## 9. Glossary
- **NSP:** National Scholarship Portal (scholarships.gov.in)
- **OCR:** Optical Character Recognition
- **Headless Browser:** Browser automation without GUI
- **Fargate:** AWS serverless container orchestration
- **Textract:** AWS document analysis service
- **SC/ST/OBC:** Scheduled Caste/Scheduled Tribe/Other Backward Classes
