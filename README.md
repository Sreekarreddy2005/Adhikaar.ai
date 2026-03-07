<div align="center">

# Adhikaar.ai

### Autonomous Multi-Agent Scholarship Execution Pipeline

**AWS AI for Bharat Hackathon 2026 — Final Prototype Submission**

![AWS](https://img.shields.io/badge/Amazon_AWS-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white)
![AWS Lambda](https://img.shields.io/badge/AWS_Lambda-FF9900?style=for-the-badge&logo=aws-lambda&logoColor=white)
![DynamoDB](https://img.shields.io/badge/Amazon_DynamoDB-4053D6?style=for-the-badge&logo=amazon-dynamodb&logoColor=white)
![Bedrock](https://img.shields.io/badge/Generative_AI-Bedrock_Nova-005276?style=for-the-badge)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)

</div>

---

# 📜 Project Overview

**Adhikaar.ai** is an AI-powered autonomous platform designed to help students automatically apply for government scholarships.

Millions of students in India lose access to educational funding every year due to:

- Complex government portals  
- Digital illiteracy  
- Slow or unstable infrastructure  
- Difficult documentation requirements  

Adhikaar.ai solves this problem by building an **AI-driven scholarship execution pipeline** that:

1. Extracts data from uploaded documents  
2. Uses AI to interpret and validate the information  
3. Identifies the best scholarship scheme  
4. Automatically fills and submits government applications  

This converts the traditional **manual scholarship application process into an autonomous AI workflow**.

---

# ✨ Key Features

## 🤖 Intelligent Document Processing

Uses **Amazon Textract** to extract structured information from documents such as:

- Income certificates  
- Caste certificates  
- Aadhaar cards  
- Marksheets  

This eliminates manual data entry.

---

## 🧠 AI Decision Engine

Using **Amazon Bedrock (Nova Lite)**, the system:

- Converts messy OCR text into structured JSON  
- Verifies applicant identity information  
- Detects possible fraud patterns  
- Determines the most suitable scholarship program  

---

## ⚙️ Autonomous Application Execution

Headless browser agents automatically submit applications on government portals using:

- Playwright  
- Selenium  
- Docker containers  
- AWS Fargate orchestration  

These agents simulate human interaction with legacy portals.

---

## 🔄 Fault-Tolerant Processing

Application state is stored using **Amazon DynamoDB**, allowing the system to:

- Recover interrupted sessions  
- Retry failed submissions  
- Handle portal timeouts  
- Maintain application status  

---

## 🔐 Security & Privacy

Sensitive student information is protected using:

- **AES-256 encryption**
- **Secure document storage in Amazon S3**
- **Temporary data retention policies**
- **Stateless serverless processing**

---

# 🏗️ System Architecture

The platform uses a **serverless event-driven AWS architecture** consisting of multiple layers.

### Client Layer

A **React Progressive Web App (PWA)** allows students to upload their documents.

Optimized for:

- Mobile devices  
- Rural low-bandwidth environments  
- Simple user experience  

---

### Orchestration Layer

**AWS Lambda** coordinates the workflow:

- File uploads  
- Document processing  
- AI inference requests  
- Database updates  

---

### Cognitive Layer

AI services analyze and interpret extracted document data.

Technologies used:

- Amazon Textract  
- Amazon Bedrock  
- Prompt engineering  

---

### Execution Layer

Automation agents interact with government portals using:

- Playwright  
- Selenium  
- Docker containers  
- AWS Fargate  

---

### State Management

Application progress is tracked using **Amazon DynamoDB**.

This ensures reliability even when government portals crash or return timeouts.

---

# 💻 Tech Stack

## Frontend

- React.js  
- Tailwind CSS  
- Progressive Web App (PWA)

## Backend

- Node.js  
- AWS Lambda  
- API Gateway  

## AI / Machine Learning

- Amazon Bedrock  
- Nova Lite Model  
- Document AI  
- Prompt Engineering  

## Cloud Infrastructure

- Amazon S3  
- Amazon DynamoDB  
- AWS Lambda  
- AWS Fargate  
- Amazon Textract  

## Automation

- Playwright  
- Selenium  
- Docker  

## DevOps

- Git  
- GitHub  
- AWS CLI  

---

# 📂 Repository Structure

```
adhikaar-ai/
│
├── adhikaar-frontend/
│   React PWA interface for students
│
├── aws-backend-lambdas/
│   Serverless backend logic and AWS integrations
│
├── headless-agent/
│   Dockerized automation bots for portal submission
│
├── dummy-portal/
│   Simulated government portal for testing automation
│
├── local-api/
│   Local API server for frontend testing
│
└── database-schema.md
    DynamoDB schema documentation
```

---

# 🚀 Setup and Installation

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/adhikaar-ai.git
cd adhikaar-ai
```

---

## 2️⃣ Install Frontend Dependencies

```bash
cd adhikaar-frontend
npm install
npm run dev
```

---

## 3️⃣ Configure Environment Variables

Create a `.env` file inside `/aws-backend-lambdas`.

```
AWS_REGION=ap-south-1
S3_VAULT_BUCKET_NAME=adhikaar-secure-vault-2026
DYNAMODB_TABLE_NAME=Adhikaar_Applications
ENCRYPTION_SECRET_KEY=your_aes_256_secure_key
```

---

## 4️⃣ Run Backend Services

```bash
cd aws-backend-lambdas
npm install
node orchestrator.js
```

---

# 📊 Infrastructure Economics

Because the platform uses **serverless architecture**, it maintains **zero cost when idle**.

| Metric | Value |
|------|------|
| Average Execution Cost | ~$0.22 (~₹18) per application |
| Average Scholarship Value | ₹15,000+ |
| Manual Application Time | 120+ minutes |
| Adhikaar.ai Processing Time | < 3 minutes |

---

# 🌍 Impact

Adhikaar.ai helps increase access to government education funding by:

- Simplifying complex scholarship portals  
- Increasing scholarship adoption  
- Supporting rural and minority students  
- Automating bureaucratic processes with AI  

---

# ⚠️ Disclaimer

This project is a **prototype built for the AWS AI for Bharat Hackathon 2026**.

The system is intended **for research and demonstration purposes only** and should not be used to automate real government portals without official authorization.

---

# 👨‍💻 Author

**Sreekar Reddy Pindi**

Computer Science Student  
AI & Backend Development Enthusiast
