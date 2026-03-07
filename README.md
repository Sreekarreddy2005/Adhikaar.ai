🇮🇳 Adhikaar.ai
Autonomous Multi-Agent Scholarship Execution Pipeline

AWS AI for Bharat Hackathon 2026 – Final Prototype Submission

Adhikaar.ai is an AI-powered autonomous system designed to help students automatically apply for government scholarships. The platform eliminates manual form filling by using AI-driven document understanding, intelligent policy routing, and automated portal submission.

The system uses AWS serverless architecture, generative AI, and headless automation agents to simplify the complex scholarship application process faced by millions of students in India.

📜 Project Overview

Every year, thousands of students lose access to educational funding due to:

Complex government portals

Digital illiteracy

Slow or unstable infrastructure

Difficult documentation processes

Adhikaar.ai solves this problem by building a fully automated scholarship execution pipeline that:

Extracts data from uploaded documents

Uses AI to interpret and validate the information

Identifies the best scholarship scheme

Automatically fills and submits the government application

This transforms the traditional manual application process into an autonomous AI workflow.

✨ Key Features
🤖 Intelligent Document Processing

Uses Amazon Textract to extract structured information from documents such as:

Income certificates

Caste certificates

Aadhaar cards

Marksheets

This eliminates manual data entry.

🧠 AI Decision Engine

Using Amazon Bedrock (Nova Lite), the system:

Converts messy OCR text into structured JSON

Verifies applicant identity information

Detects possible fraud patterns

Determines the most suitable scholarship program

⚙️ Autonomous Application Execution

Headless browser agents automatically submit applications on government portals using:

Playwright

Selenium

Docker containers

AWS Fargate orchestration

These bots simulate human interaction with legacy websites.

🔄 Fault Tolerant Processing

A state tracking engine powered by DynamoDB ensures that applications are not lost even if government portals crash.

Features include:

Session recovery

Retry mechanisms

Timeout recovery

Background queue execution

🔐 Privacy & Security

Student personal information is protected through:

AES-256 encryption

Secure document vault storage

Temporary data retention

Stateless serverless processing

🏗️ System Architecture

The platform is built using a serverless event-driven architecture.

Core architecture layers include:

1️⃣ Client Layer

A React Progressive Web App (PWA) allows students to upload their documents.

Optimized for:

Mobile devices

Low bandwidth rural networks

Simple user experience

2️⃣ Orchestration Layer

AWS Lambda functions coordinate the entire pipeline:

File upload handling

Document processing requests

AI model inference

Database updates

3️⃣ Cognitive Layer

AI services process and analyze application data.

Technologies used:

Amazon Textract

Amazon Bedrock

Custom prompt engineering

Fraud detection logic

4️⃣ Execution Layer

Containerized automation agents execute the application process.

Tools used:

Playwright

Selenium

Docker

AWS Fargate

These agents submit forms directly on government portals.

5️⃣ State Management Layer

Application progress is tracked using Amazon DynamoDB, ensuring reliability even during portal failures.

💻 Tech Stack
Frontend

React.js

Tailwind CSS

Progressive Web App (PWA)

Backend

Node.js

AWS Lambda

API Gateway

AI / Machine Learning

Amazon Bedrock

Nova Lite Model

Prompt Engineering

Document AI

Cloud Infrastructure

AWS Lambda

Amazon DynamoDB

Amazon S3

AWS Fargate

Amazon Textract

Automation

Playwright

Selenium

Docker

DevOps

Git

GitHub

AWS CLI

📂 Repository Structure
adhikaar-ai
│
├── adhikaar-frontend
│   React PWA for student interface
│
├── aws-backend-lambdas
│   Core AWS serverless functions
│
├── headless-agent
│   Dockerized automation agents
│
├── dummy-portal
│   Local simulation of government portal
│
├── local-api
│   Mock API server for frontend testing
│
└── database-schema.md
    DynamoDB schema documentation
🚀 Setup and Installation

Follow these steps to run the project locally.

1️⃣ Clone the Repository
git clone https://github.com/YOUR_USERNAME/adhikaar-ai.git
cd adhikaar-ai
2️⃣ Install Frontend Dependencies
cd adhikaar-frontend
npm install
npm run dev
3️⃣ Configure Environment Variables

Create a .env file in the backend directory.

AWS_REGION=ap-south-1
S3_VAULT_BUCKET_NAME=adhikaar-secure-vault-2026
DYNAMODB_TABLE_NAME=Adhikaar_Applications
ENCRYPTION_SECRET_KEY=your_aes_256_secure_key
4️⃣ Configure AWS CLI

Make sure AWS CLI is installed and configured.

Required permissions:

Amazon Textract

Amazon Bedrock

S3 access

DynamoDB access

Lambda execution roles

5️⃣ Run Backend Services

Navigate to the backend directory and run the local API.

cd aws-backend-lambdas
npm install
node orchestrator.js
📊 Infrastructure Economics

The platform uses serverless architecture, meaning there is zero cost when idle.

Metric	Value
Average Execution Cost	~$0.22 (~₹18) per application
Scholarship Value Unlocked	₹15,000+ average
Manual Application Time	120+ minutes
Adhikaar.ai Application Time	< 3 minutes
🌍 Impact

Adhikaar.ai aims to improve accessibility to government welfare programs by:

Reducing application complexity

Increasing scholarship adoption

Supporting rural students

Automating bureaucratic workflows

This system demonstrates how AI agents can modernize public service delivery.

⚠️ Disclaimer

This project is a prototype developed for the AWS AI for Bharat Hackathon 2026.

The system simulates automated scholarship submissions and is intended for research and demonstration purposes only. It should not be used for real government portal automation without official authorization.

👨‍💻 Author

Sreekar Reddy Pindi
Computer Science Student
AI / Backend Development Enthusiast
