<div align="center">
  <h1>🇮🇳 Adhikaar.ai</h1>
  <p><b>Autonomous Multi-Agent Scholarship Execution Pipeline</b></p>
  <p><i>AWS AI for Bharat Hackathon 2026 - Final Prototype Submission</i></p>

  <img src="https://img.shields.io/badge/Amazon_AWS-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white" alt="AWS" />
  <img src="https://img.shields.io/badge/AWS_Lambda-FF9900?style=for-the-badge&logo=aws-lambda&logoColor=white" alt="AWS Lambda" />
  <img src="https://img.shields.io/badge/Amazon_DynamoDB-4053D6?style=for-the-badge&logo=amazon-dynamodb&logoColor=white" alt="DynamoDB" />
  <img src="https://img.shields.io/badge/Generative_AI-Bedrock_Nova-005276?style=for-the-badge" alt="Amazon Bedrock" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
</div>

<br />

## 📖 Table of Contents
- [Executive Summary](#-executive-summary)
- [System Architecture](#-system-architecture)
- [Microservices & Agent Swarm](#-microservices--agent-swarm)
- [Enterprise Security Posture](#-enterprise-security-posture)
- [Repository Structure](#-repository-structure)
- [Local Deployment & Setup](#-local-deployment--setup)
- [Cloud Infrastructure Economics](#-cloud-infrastructure-economics)

---

## 🚀 Executive Summary

**Adhikaar.ai** engineers a paradigm shift in Indian government welfare distribution: transitioning from *passive web portals* to *proactive autonomous agents*. 

Millions in minority and rural educational funding are lost annually due to digital illiteracy, complex bureaucratic logic, and chronic `504 Gateway Timeouts` on legacy portals. We engineered a 100% serverless, event-driven AWS architecture that dynamically extracts, cryptographically secures, semanticizes, and autonomously submits complex scholarship applications with zero human intervention.

---

## 🏛️ System Architecture

Our event-driven pipeline leverages a hybrid cloud architecture, isolating the Cognitive, Orchestration, and Execution layers for maximum fault tolerance.

```mermaid
graph TD
    A[React PWA Client] -->|AES-256 Encrypted Payload| B(API Gateway / Orchestrator Lambda)
    B -->|Transient Storage| C[(Amazon S3 Vault)]
    B -->|IDP Extraction| D[Amazon Textract]
    D -->|Raw String / Tabular Data| B
    B -->|System Prompt + OCR Data| E{Amazon Bedrock: Nova Lite}
    E -->|Semantic JSON & Fraud Flags| B
    B -->|State Mutation| F[(Amazon DynamoDB)]
    F -->|Event Stream / CRON| G[AWS Fargate Swarm]
    G -->|Headless DOM Injection| H[Legacy Gov Portals]
    G -->|Async Session Recovery| F
Gemini said
Here is the complete, enterprise-grade Markdown code ready for you to copy and paste directly into your README.md file.

Just click the "Copy code" button at the top right of this block, paste it into your README.md in VS Code, and save!

Markdown
<div align="center">
  <h1>🇮🇳 Adhikaar.ai</h1>
  <p><b>Autonomous Multi-Agent Scholarship Execution Pipeline</b></p>
  <p><i>AWS AI for Bharat Hackathon 2026 - Final Prototype Submission</i></p>

  <img src="https://img.shields.io/badge/Amazon_AWS-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white" alt="AWS" />
  <img src="https://img.shields.io/badge/AWS_Lambda-FF9900?style=for-the-badge&logo=aws-lambda&logoColor=white" alt="AWS Lambda" />
  <img src="https://img.shields.io/badge/Amazon_DynamoDB-4053D6?style=for-the-badge&logo=amazon-dynamodb&logoColor=white" alt="DynamoDB" />
  <img src="https://img.shields.io/badge/Generative_AI-Bedrock_Nova-005276?style=for-the-badge" alt="Amazon Bedrock" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
</div>

<br />

## 📖 Table of Contents
- [Executive Summary](#-executive-summary)
- [System Architecture](#-system-architecture)
- [Microservices & Agent Swarm](#-microservices--agent-swarm)
- [Enterprise Security Posture](#-enterprise-security-posture)
- [Repository Structure](#-repository-structure)
- [Local Deployment & Setup](#-local-deployment--setup)
- [Cloud Infrastructure Economics](#-cloud-infrastructure-economics)

---

## 🚀 Executive Summary

**Adhikaar.ai** engineers a paradigm shift in Indian government welfare distribution: transitioning from *passive web portals* to *proactive autonomous agents*. 

Millions in minority and rural educational funding are lost annually due to digital illiteracy, complex bureaucratic logic, and chronic `504 Gateway Timeouts` on legacy portals. We engineered a 100% serverless, event-driven AWS architecture that dynamically extracts, cryptographically secures, semanticizes, and autonomously submits complex scholarship applications with zero human intervention.

---

## 🏛️ System Architecture

Our event-driven pipeline leverages a hybrid cloud architecture, isolating the Cognitive, Orchestration, and Execution layers for maximum fault tolerance.

```mermaid
graph TD
    A[React PWA Client] -->|AES-256 Encrypted Payload| B(API Gateway / Orchestrator Lambda)
    B -->|Transient Storage| C[(Amazon S3 Vault)]
    B -->|IDP Extraction| D[Amazon Textract]
    D -->|Raw String / Tabular Data| B
    B -->|System Prompt + OCR Data| E{Amazon Bedrock: Nova Lite}
    E -->|Semantic JSON & Fraud Flags| B
    B -->|State Mutation| F[(Amazon DynamoDB)]
    F -->|Event Stream / CRON| G[AWS Fargate Swarm]
    G -->|Headless DOM Injection| H[Legacy Gov Portals]
    G -->|Async Session Recovery| F
🧠 Microservices & Agent Swarm
1. The Perception Agent (Intelligent Document Processing)
Powered by Amazon Textract, this agent handles degraded, low-DPI rural scans. It parses complex tabular structures (e.g., marksheets) and raw strings (e.g., income certificates) into unstructured text arrays, completely bypassing manual data entry.

2. The Cognitive Agent (Generative Decision Engine)
Utilizing Amazon Bedrock (Nova Lite), this agent acts as the brain of the pipeline:

Semantic Normalization: Converts chaotic Textract strings into strict JSON schemas.

Fraud Detection: Deterministically cross-references Aadhaar hashing against Income/Caste certificates to flag identity spoofing.

Algorithmic Policy Routing: Evaluates overlapping government matrixes (e.g., State vs. Central Post-Matric schemes) to calculate and dispatch the path of Maximum Financial Yield.

3. The Execution Agent (Headless Swarm)
Containerized bots packaged via Docker and orchestrated via AWS Fargate. Using Playwright/Selenium, these agents deploy ephemeral headless browser instances that physically emulate human typing, bypass legacy portal restrictions, and stream payloads directly into government DOMs.

4. Stateful Resilience Engine
Powered by Amazon DynamoDB, acting as the single source of truth. It intercepts mid-submission 504 Timeouts, preserves the application session state, and initiates exponential backoff algorithms during off-peak server hours.

🛡️ Enterprise Security Posture
We treat student PII (Personally Identifiable Information) with military-grade compliance:

Zero-Retention Ephemeral Vaulting: Documents are uploaded to Amazon S3 for transient processing and instantly purged via strict IAM lifecycle policies post-execution.

Cryptographic Hashing: Bank details and Aadhaar numbers undergo aes-256-cbc client-side encryption before ever touching DynamoDB.

Stateless Cloud Processing: The AWS Lambda orchestrator holds sensitive data strictly in transient memory during the Textract -> Bedrock pipeline.

📂 Repository Structure (Monorepo)
This repository serves as a unified monorepo containing both local testing environments and AWS production logic.

Directory / File	Description
/adhikaar-frontend	React/Tailwind Progressive Web App (PWA) optimized for low-bandwidth rural networks.
/aws-backend-lambdas	Core AWS Logic: Contains the Node.js source deployed to our AWS Lambda orchestrators, including the Bedrock and Textract integration.
/headless-agent	Dockerized Playwright/Selenium bot scripts intended for AWS Fargate deployment.
/dummy-portal	A simulated local government portal used for rigorous bot execution testing.
/local-api	Local API mock server for testing the frontend UI states without burning AWS compute.
database-schema.md	Complete schema documentation for our state-tracking Amazon DynamoDB tables.
💻 Local Deployment & Setup
Prerequisites
Node.js (v18+)

Docker (for Fargate execution testing)

AWS CLI configured with appropriate IAM roles (Bedrock Runtime, Textract, S3, DynamoDB access)

1. Environment Variables
Create a .env file in the root of /aws-backend-lambdas based on the following template:

Code snippet
AWS_REGION=ap-south-1
S3_VAULT_BUCKET_NAME=adhikaar-secure-vault-2026
DYNAMODB_TABLE_NAME=Adhikaar_Applications
ENCRYPTION_SECRET_KEY=your_aes_256_secure_key
2. Run the Client PWA
Bash
cd adhikaar-frontend
npm install
npm run dev
3. Review the Cloud Orchestrator
Judges evaluating the AWS integration should navigate to /aws-backend-lambdas/orchestrator.js. This file contains the complete Serverless Node.js logic integrating Amazon Bedrock (ConverseCommand) and Amazon Textract (AnalyzeDocumentCommand).

📊 Cloud Infrastructure Economics
By leveraging a 100% event-driven serverless architecture, the platform maintains a Zero-Cost Idle State.

Execution Cost: ~$0.22 (approx. ₹18) per student application.

Financial Yield: Autonomously unlocks ₹15,000+ in average educational funding.

Time-to-Apply: Reduced from 120+ minutes (manual data entry) to < 3 minutes (single-upload autonomous queue).

🚀 How to update this in GitHub:
After you paste and save this in VS Code, open your terminal and run these commands to push the beautiful new README to your repository:

git add README.md

git commit -m "docs: added enterprise-grade README with Mermaid diagram and tech stack"

git push origin main
