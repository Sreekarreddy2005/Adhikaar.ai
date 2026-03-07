const express = require('express');
const cors = require('cors');
const multer = require('multer');

const app = express();
app.use(cors());
app.use(express.json());

// Set up memory storage for uploaded files
const upload = multer({ storage: multer.memoryStorage() });

// Mock Database (This replaces DynamoDB temporarily)
const database = {};

// 1. Endpoint: Receive Files & Run Fake OCR (Replaces API Gateway + Lambda + Textract)
app.post('/upload-and-scan', upload.fields([{ name: 'aadhaar' }, { name: 'income' }]), (req, res) => {
    console.log("Files received. Running simulated OCR...");
    
    // Generate a unique ID for the student
    const studentId = 'STU-' + Date.now();

    // Fake the Textract data extraction
    const extractedData = {
        fullName: "Sreekar Reddy",
        income: "85000",
        category: "SC"
    };

    // Save to our "Database" with a QUEUED status
    database[studentId] = {
        studentId: studentId,
        status: "QUEUED",
        extractedData: extractedData,
        matchedScheme: "National Scholarship Portal - Post Matric SC"
    };

    res.json(database[studentId]);
});

// 2. Endpoint: Check Status (React app calls this every 2 seconds)
app.get('/status/:id', (req, res) => {
    const record = database[req.params.id];
    if (record) {
        res.json({ status: record.status });
    } else {
        res.status(404).send("Not found");
    }
});

// 3. Endpoint: Bot Update Status (Puppeteer bot calls this to update success/fail)
app.post('/update-status', (req, res) => {
    const { studentId, status } = req.body;
    if (database[studentId]) {
        database[studentId].status = status;
        console.log(`[DB UPDATE] Student ${studentId} status changed to ${status}`);
        res.send("Updated");
    } else {
        res.status(404).send("Not found");
    }
});

// 4. Endpoint: Fetch Queued Tasks (Puppeteer polls this to find work)
app.get('/get-queued-task', (req, res) => {
    const task = Object.values(database).find(t => t.status === "QUEUED");
    if (task) {
        task.status = "PROCESSING"; // Lock it
        res.json(task);
    } else {
        res.json(null);
    }
});

app.listen(4000, () => console.log('Local API Orchestrator running on port 4000'));