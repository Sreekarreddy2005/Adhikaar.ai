# 🗄️ Adhikaar.ai DynamoDB Schema

This document outlines the NoSQL database structure used to maintain application state, logging, and student profiles across our event-driven serverless architecture.

## Table 1: `Adhikaar_StudentProfiles`
**Purpose:** Stores the student's normalized semantic profile data extracted via the Amazon Textract & Bedrock pipeline.
* **Partition Key:** `userId` (String)
* **Sort Key:** None
* **Expected Attributes:**
  * `full_name` (String)
  * `dob` (String)
  * `state_of_domicile` (String)
  * `caste_category` (String)
  * `annual_income` (Number)
  * `bank_ifsc` (String)

---

## Table 2: `Adhikaar_Applications`
**Purpose:** Acts as the state machine for the autonomous execution swarm. Tracks the real-time status of form submissions and intercepts 504 timeouts.
* **Partition Key:** `applicationId` (String)
* **Sort Key:** None
* **Expected Attributes:**
  * `userId` (String) - *Foreign key mapping to student profile*
  * `scholarship_name` (String)
  * `portal_url` (String)
  * `status` (String) - *e.g., "QUEUED", "IN_PROGRESS", "SUBMITTED", "TIMEOUT"*
  * `retry_count` (Number)
  * `reference_id` (String) - *Generated post-submission*