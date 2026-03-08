# Design Document: Adhikaar.ai
**Version:** 1.0  
**Last Updated:** February 6, 2026

## 1. System Overview

Adhikaar.ai is a serverless, event-driven autonomous agent system built on AWS that automates scholarship discovery and application for rural Indian students. The system implements an "inverse search" model where scholarships find students rather than students searching for scholarships.

### 1.1 Core Innovation
**Passive Model (Traditional):** Student → Search → Apply  
**Active Model (Adhikaar.ai):** Upload Once → Auto-Match → Auto-Apply

## 2. Architecture Design

### 2.1 High-Level Architecture
```
┌─────────────┐
│   Student   │
│  (Mobile)   │
└──────┬──────┘
       │ Upload Documents
       ▼
┌─────────────────────────────────────────────────┐
│           AWS Cloud Infrastructure              │
│                                                 │
│  ┌──────────┐      ┌──────────────┐           │
│  │ S3 Bucket│─────▶│   Lambda     │           │
│  │ (Vault)  │      │  (Trigger)   │           │
│  └──────────┘      └──────┬───────┘           │
│                            │                    │
│                            ▼                    │
│                    ┌──────────────┐            │
│                    │   Textract   │            │
│                    │     (OCR)    │            │
│                    └──────┬───────┘            │
│                            │                    │
│                            ▼                    │
│                    ┌──────────────┐            │
│                    │  DynamoDB    │            │
│                    │ (Profile DB) │            │
│                    └──────┬───────┘            │
│                            │                    │
│                            ▼                    │
│                    ┌──────────────┐            │
│                    │   Lambda     │            │
│                    │  (Matching)  │            │
│                    └──────┬───────┘            │
│                            │                    │
│                            ▼                    │
│                    ┌──────────────┐            │
│                    │ ECS Fargate  │            │
│                    │  (Browser    │            │
│                    │   Agents)    │            │
│                    └──────┬───────┘            │
│                            │                    │
└────────────────────────────┼────────────────────┘
                             │
                             ▼
                    ┌──────────────┐
                    │  Government  │
                    │   Portals    │
                    └──────────────┘
```

### 2.2 Component Architecture

#### 2.2.1 Frontend Layer
- **Technology:** Progressive Web App (React/Next.js)
- **Hosting:** AWS Amplify or S3 + CloudFront
- **Features:**
  - Mobile-first responsive design
  - Camera integration for document capture
  - Offline-first architecture with service workers
  - Multi-language support (Hindi/English)

#### 2.2.2 API Gateway Layer
- **Technology:** AWS API Gateway (REST)
- **Authentication:** AWS Cognito (User Pools)
- **Rate Limiting:** 100 requests/minute per user
- **Endpoints:**
  - `POST /documents/upload`
  - `GET /scholarships/matches`
  - `GET /applications/status`
  - `POST /applications/retry`


#### 2.2.3 Document Processing Pipeline
**Component:** Document Vault + OCR Engine

**Flow:**
1. **S3 Event Trigger:** Document upload triggers Lambda
2. **Textract Invocation:** Async document analysis job
3. **Data Extraction:** Parse JSON response for key-value pairs
4. **Validation:** Confidence scoring and error detection
5. **Storage:** Write to DynamoDB user profile

**Key Design Decisions:**
- Use Textract's `AnalyzeDocument` API with FORMS and TABLES features
- Implement retry logic for Textract job failures
- Store raw Textract JSON for audit purposes
- Use Step Functions for orchestration of multi-document processing

#### 2.2.4 Eligibility Matching Engine
**Component:** Rules Engine + Scholarship Database

**Data Model:**
```json
{
  "scholarshipId": "NSP-SC-2026-001",
  "name": "Post Matric Scholarship for SC Students",
  "eligibilityRules": {
    "category": ["SC"],
    "income": {"max": 250000},
    "education": {"min": "10th Pass"},
    "state": ["All India"]
  },
  "deadline": "2026-03-31",
  "amount": 12000,
  "portalUrl": "https://scholarships.gov.in/..."
}
```

**Matching Algorithm:**
```python
def match_scholarships(student_profile, scholarship_db):
    matches = []
    for scholarship in scholarship_db:
        if evaluate_rules(student_profile, scholarship.eligibilityRules):
            score = calculate_priority_score(scholarship)
            matches.append((scholarship, score))
    return sorted(matches, key=lambda x: x[1], reverse=True)
```

**Priority Scoring Factors:**
- Days until deadline (urgent first)
- Scholarship amount (higher first)
- Success rate of portal (reliable first)

#### 2.2.5 Autonomous Browser Agent
**Component:** Headless Browser Automation (Fargate)

**Container Specification:**
- **Base Image:** selenium/standalone-chrome or puppeteer
- **Memory:** 2GB
- **CPU:** 1 vCPU
- **Timeout:** 10 minutes per application

**Agent Workflow:**
```python
class ScholarshipAgent:
    def apply(self, scholarship, student_data):
        try:
            # 1. Navigate to portal
            self.browser.get(scholarship.portalUrl)
            
            # 2. Handle login/registration
            self.handle_authentication(student_data)
            
            # 3. Fill application form
            self.fill_form_fields(student_data)
            
            # 4. Upload documents
            self.upload_documents(student_data.documents)
            
            # 5. Handle CAPTCHA (if present)
            self.solve_captcha()
            
            # 6. Submit form
            self.submit_application()
            
            # 7. Capture proof
            screenshot = self.browser.screenshot()
            app_id = self.extract_application_id()
            
            return Success(app_id, screenshot)
            
        except PortalException as e:
            return Failure(e, retry=True)
```

**Resilience Strategies:**
- Implement page load timeouts (30s)
- Detect common error patterns (server errors, session timeouts)
- Save browser state for resume capability
- Use proxy rotation if IP blocking detected

#### 2.2.6 Retry Orchestration System
**Component:** Step Functions State Machine

**State Machine Design:**
```json
{
  "StartAt": "LaunchAgent",
  "States": {
    "LaunchAgent": {
      "Type": "Task",
      "Resource": "arn:aws:ecs:fargate:task",
      "Catch": [{
        "ErrorEquals": ["PortalFailure"],
        "Next": "WaitForRetry"
      }],
      "Next": "CheckSuccess"
    },
    "CheckSuccess": {
      "Type": "Choice",
      "Choices": [{
        "Variable": "$.status",
        "StringEquals": "SUCCESS",
        "Next": "NotifyUser"
      }],
      "Default": "WaitForRetry"
    },
    "WaitForRetry": {
      "Type": "Wait",
      "Seconds": 3600,
      "Next": "IncrementRetryCount"
    },
    "IncrementRetryCount": {
      "Type": "Pass",
      "Next": "CheckRetryLimit"
    },
    "CheckRetryLimit": {
      "Type": "Choice",
      "Choices": [{
        "Variable": "$.retryCount",
        "NumericLessThan": 5,
        "Next": "LaunchAgent"
      }],
      "Default": "NotifyFailure"
    }
  }
}
```


## 3. Data Models

### 3.1 Student Profile (DynamoDB)
```json
{
  "userId": "uuid-v4",
  "personalInfo": {
    "name": "string",
    "dob": "date",
    "aadhaar": "encrypted-string",
    "mobile": "string",
    "email": "string"
  },
  "academicInfo": {
    "currentEducation": "12th Pass",
    "percentage": 85.5,
    "institution": "string",
    "state": "Uttar Pradesh"
  },
  "financialInfo": {
    "annualIncome": 80000,
    "category": "SC",
    "bpl": false
  },
  "bankDetails": {
    "accountNumber": "encrypted-string",
    "ifsc": "string",
    "bankName": "string"
  },
  "documents": {
    "incomeCert": "s3://bucket/path",
    "casteCert": "s3://bucket/path",
    "marksheet": "s3://bucket/path",
    "aadhaarCard": "s3://bucket/path",
    "bankPassbook": "s3://bucket/path"
  },
  "extractionMetadata": {
    "processedAt": "timestamp",
    "confidenceScore": 0.92,
    "manualReviewRequired": false
  }
}
```

### 3.2 Application Status (DynamoDB)
```json
{
  "applicationId": "uuid-v4",
  "userId": "uuid-v4",
  "scholarshipId": "NSP-SC-2026-001",
  "status": "IN_PROGRESS | SUCCESS | FAILED | RETRY_SCHEDULED",
  "attempts": [
    {
      "attemptNumber": 1,
      "timestamp": "2026-02-06T10:30:00Z",
      "status": "FAILED",
      "errorType": "PORTAL_TIMEOUT",
      "screenshot": "s3://bucket/screenshots/attempt1.png"
    }
  ],
  "finalSubmission": {
    "submittedAt": "timestamp",
    "applicationNumber": "NSP202600123456",
    "screenshot": "s3://bucket/proof.png"
  },
  "retrySchedule": {
    "nextRetryAt": "2026-02-07T03:00:00Z",
    "retryCount": 1,
    "maxRetries": 5
  }
}
```

### 3.3 Scholarship Database (DynamoDB)
```json
{
  "scholarshipId": "NSP-SC-2026-001",
  "name": "Post Matric Scholarship for SC Students",
  "provider": "Ministry of Social Justice",
  "type": "CENTRAL",
  "eligibility": {
    "category": ["SC"],
    "incomeMax": 250000,
    "educationMin": "10th Pass",
    "ageMax": 25,
    "states": ["ALL"]
  },
  "benefits": {
    "amount": 12000,
    "duration": "Annual",
    "renewable": true
  },
  "applicationDetails": {
    "portalUrl": "https://scholarships.gov.in/...",
    "deadline": "2026-03-31",
    "documentsRequired": ["income", "caste", "marksheet", "aadhaar", "bank"],
    "automationSupported": true,
    "successRate": 0.78
  },
  "metadata": {
    "lastUpdated": "timestamp",
    "source": "official-gazette"
  }
}
```

## 4. Technology Stack Details

### 4.1 Core AWS Services

| Service | Purpose | Configuration |
|---------|---------|---------------|
| **S3** | Document storage | Encryption: AES-256, Versioning: Enabled, Lifecycle: 7 years |
| **Lambda** | Serverless compute | Runtime: Python 3.11, Memory: 512MB-3GB, Timeout: 15 min |
| **Fargate** | Container orchestration | Task: 2GB/1vCPU, Auto-scaling: 1-50 tasks |
| **Textract** | OCR processing | API: AnalyzeDocument, Features: FORMS+TABLES |
| **DynamoDB** | NoSQL database | Capacity: On-Demand, Encryption: KMS, Backup: PITR |
| **Step Functions** | Workflow orchestration | Type: Standard, Max duration: 1 year |
| **CloudWatch** | Monitoring & logging | Retention: 30 days, Alarms: 10+ metrics |
| **SNS** | Notifications | Topics: 3 (success, failure, alerts) |
| **Cognito** | User authentication | MFA: SMS-based, Password policy: Strong |
| **API Gateway** | REST API | Throttling: 100 req/min, CORS: Enabled |

### 4.2 Automation Framework
**Primary:** Selenium with Python
**Alternative:** Puppeteer with Node.js

**Selection Criteria:**
- Selenium chosen for better handling of legacy government portals
- Python ecosystem for ML/AI integration potential
- Robust community support for Indian government websites

### 4.3 Development Tools
- **IaC:** AWS CDK (Python) or Terraform
- **CI/CD:** GitHub Actions + AWS CodePipeline
- **Testing:** pytest, Selenium Grid for parallel testing
- **Monitoring:** CloudWatch + X-Ray for distributed tracing


## 5. Security Design

### 5.1 Data Protection
**Encryption at Rest:**
- S3: Server-side encryption with AWS KMS
- DynamoDB: Encryption using AWS-managed keys
- Sensitive fields (Aadhaar, Bank): Application-level encryption with customer-managed keys

**Encryption in Transit:**
- TLS 1.3 for all API communications
- VPC endpoints for AWS service communication
- No public internet exposure for Fargate tasks

### 5.2 Access Control
**IAM Roles:**
- Lambda execution role: Read S3, Write DynamoDB, Invoke Textract
- Fargate task role: Read S3 (documents only), Write CloudWatch
- API Gateway: Cognito authorizer for user authentication

**Principle of Least Privilege:**
- Each component has minimal required permissions
- No cross-account access
- Resource-level policies for S3 buckets

### 5.3 Compliance
**Data Residency:** All data stored in AWS Mumbai (ap-south-1) region  
**Audit Logging:** CloudTrail enabled for all API calls  
**Data Retention:** 7-year retention for scholarship records (legal requirement)  
**Right to Deletion:** User-initiated data deletion within 30 days

### 5.4 Threat Mitigation

| Threat | Mitigation |
|--------|------------|
| Document tampering | Digital signatures + blockchain hash storage |
| Credential theft | Encrypted storage + short-lived access tokens |
| Portal scraping detection | Proxy rotation + human-like delays |
| DDoS attacks | API Gateway throttling + WAF rules |
| Data breach | Encryption + VPC isolation + Security Groups |

## 6. Scalability Design

### 6.1 Horizontal Scaling
**Lambda Functions:**
- Concurrent executions: 1000 (default), can request increase
- Auto-scales based on incoming events
- Reserved concurrency for critical functions

**Fargate Tasks:**
- Auto-scaling policy: Target tracking on queue depth
- Scale out: +10 tasks when queue > 50 applications
- Scale in: -5 tasks when queue < 10 applications
- Max tasks: 50 (cost control)

**DynamoDB:**
- On-demand capacity mode (auto-scaling)
- Global secondary indexes for query optimization
- DynamoDB Streams for event-driven processing

### 6.2 Performance Optimization
**Caching Strategy:**
- CloudFront for static assets (TTL: 24 hours)
- API Gateway caching for scholarship listings (TTL: 1 hour)
- DynamoDB DAX for hot data (user profiles)

**Async Processing:**
- SQS queues for decoupling components
- Dead-letter queues for failed messages
- Batch processing for non-urgent operations

### 6.3 Cost Optimization
**Estimated Monthly Cost (1000 students):**
- S3 storage: $5 (50GB documents)
- Lambda invocations: $20 (100K invocations)
- Fargate: $150 (500 task-hours)
- Textract: $75 (5000 pages)
- DynamoDB: $25 (on-demand)
- Data transfer: $10
- **Total: ~$285/month**

**Cost per student:** $0.29/month or $3.48/year

## 7. Monitoring & Observability

### 7.1 Key Metrics
**Application Metrics:**
- Document upload success rate (target: >95%)
- OCR accuracy (target: >85%)
- Scholarship match rate (target: >90%)
- Application submission success rate (target: >80%)
- Average time-to-submission (target: <24 hours)

**Infrastructure Metrics:**
- Lambda error rate (target: <1%)
- Fargate task failure rate (target: <5%)
- API Gateway latency (target: <500ms p99)
- DynamoDB throttling events (target: 0)

### 7.2 Alerting Strategy
**Critical Alerts (PagerDuty):**
- Fargate task failures >10% in 5 minutes
- S3 bucket access denied errors
- DynamoDB throttling events

**Warning Alerts (Email):**
- OCR confidence score <70% for >20% of documents
- Application retry count >3 for any scholarship
- API Gateway 5xx errors >5% in 15 minutes

### 7.3 Logging Architecture
**Structured Logging:**
```json
{
  "timestamp": "2026-02-06T10:30:00Z",
  "level": "INFO",
  "service": "browser-agent",
  "userId": "uuid",
  "scholarshipId": "NSP-SC-2026-001",
  "action": "form_submission",
  "status": "success",
  "duration_ms": 4500,
  "metadata": {
    "portalUrl": "...",
    "attemptNumber": 2
  }
}
```

**Log Aggregation:**
- CloudWatch Logs for all services
- Log Insights for querying and analysis
- Retention: 30 days (cost optimization)


## 8. Deployment Strategy

### 8.1 Environment Setup
**Environments:**
1. **Development:** Single-region, minimal resources, mock government portals
2. **Staging:** Production-like, real government portals (test accounts)
3. **Production:** Multi-AZ, auto-scaling enabled, full monitoring

### 8.2 CI/CD Pipeline
```
GitHub Push → GitHub Actions → Build & Test → Deploy to Dev
                                    ↓
                            Integration Tests
                                    ↓
                            Manual Approval
                                    ↓
                            Deploy to Staging
                                    ↓
                            Smoke Tests
                                    ↓
                            Manual Approval
                                    ↓
                            Deploy to Production
                                    ↓
                            Health Checks
```

### 8.3 Rollback Strategy
- Blue-Green deployment for Lambda functions
- Canary deployment for Fargate tasks (10% → 50% → 100%)
- Automated rollback on CloudWatch alarm triggers
- Database migrations: Forward-compatible only

### 8.4 Disaster Recovery
**RTO (Recovery Time Objective):** 4 hours  
**RPO (Recovery Point Objective):** 1 hour

**Backup Strategy:**
- S3: Cross-region replication to ap-south-2 (Hyderabad)
- DynamoDB: Point-in-time recovery enabled
- Daily snapshots of critical data
- Quarterly disaster recovery drills

## 9. User Experience Design

### 9.1 Mobile Interface Flow
```
┌─────────────────┐
│  Welcome Screen │
│  (Language)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Registration   │
│  (Mobile + OTP) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Document Upload │
│  (5 documents)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Processing    │
│  (OCR + Match)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Scholarship List│
│  (Matched)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Auto-Apply      │
│  (Confirm)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Status Dashboard│
│  (Track)        │
└─────────────────┘
```

### 9.2 Accessibility Features
- High contrast mode for low-vision users
- Voice guidance in Hindi/English
- Large touch targets (minimum 44x44px)
- Offline mode for document capture
- SMS-based status updates (no app required)

### 9.3 Error Handling UX
**User-Facing Errors:**
- "Document unclear" → Provide tips for better photo
- "Portal busy" → "We'll retry automatically at 3 AM"
- "Missing information" → Highlight specific fields needed

**Transparency:**
- Real-time status updates
- Estimated completion time
- Retry countdown timer

## 10. Testing Strategy

### 10.1 Unit Testing
- Lambda functions: pytest with moto (AWS mocking)
- Browser agents: Selenium with mock portals
- Coverage target: >80%

### 10.2 Integration Testing
- End-to-end workflow testing in staging
- Mock government portals for consistent testing
- Test data: 50 synthetic student profiles

### 10.3 Load Testing
- Simulate 1000 concurrent uploads
- Simulate 500 concurrent applications
- Tools: Locust or Artillery

### 10.4 Security Testing
- OWASP Top 10 vulnerability scanning
- Penetration testing (annual)
- Dependency scanning (Snyk/Dependabot)

### 10.5 Portal Compatibility Testing
**Target Portals:**
- National Scholarship Portal (scholarships.gov.in)
- State portals: UP, Bihar, Maharashtra, Tamil Nadu
- Test frequency: Weekly (portals change frequently)

## 11. Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Government portal changes | High | High | Weekly monitoring + quick script updates |
| OCR accuracy issues | Medium | Medium | Manual review queue + user feedback loop |
| CAPTCHA blocking | High | Medium | CAPTCHA solving service + manual fallback |
| AWS cost overrun | Medium | Low | Budget alerts + auto-scaling limits |
| Data breach | Critical | Low | Encryption + security audits + compliance |
| Portal IP blocking | High | Medium | Proxy rotation + rate limiting |
| Legal challenges | High | Low | Legal review + terms of service |

## 12. Future Enhancements (Roadmap)

### Phase 2 (6 months)
- Integration with Digilocker for automatic document fetching
- Support for 10 additional state portals
- WhatsApp bot for status updates
- Scholarship recommendation engine (ML-based)

### Phase 3 (12 months)
- AI essay writer for scholarship applications
- Disbursement tracking integration
- Peer-to-peer scholarship information sharing
- NGO/School bulk upload portal

### Phase 4 (18 months)
- Blockchain-based credential verification
- Cross-border scholarship support (Nepal, Bangladesh)
- Voice-based application interface
- Scholarship fraud detection system

## 13. Success Metrics (Hackathon Demo)

### Technical Metrics
- [ ] Successfully process 10 sample documents with >85% accuracy
- [ ] Match students to at least 3 scholarships each
- [ ] Complete 1 end-to-end application submission
- [ ] Demonstrate retry mechanism with simulated failure

### Business Metrics
- [ ] Reduce application time from 2 hours to 5 minutes
- [ ] Achieve 80% submission success rate
- [ ] Support 2 languages (Hindi + English)

### Impact Metrics
- [ ] Demo with 5 real student profiles
- [ ] Show potential to reach 100K students in Year 1
- [ ] Calculate cost savings: ₹500/student vs ₹50/student

## 14. Conclusion

Adhikaar.ai represents a paradigm shift from information systems to execution systems. By automating the entire scholarship application lifecycle, we eliminate the digital literacy barrier and ensure that eligibility translates to benefit delivery. The serverless architecture ensures scalability while keeping costs low, making this solution sustainable for large-scale deployment across rural India.

**Key Differentiators:**
1. **Zero-Touch Automation:** Students upload once, system applies forever
2. **Crash-Resilient Design:** Only system built to handle unstable government infrastructure
3. **Document-Driven Discovery:** No search skills required
4. **Cost-Effective:** $3.48/student/year vs traditional methods

This design is optimized for the hackathon demonstration while maintaining a clear path to production deployment.
