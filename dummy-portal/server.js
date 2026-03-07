const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let isPortalCrashing = false; 

// The Fake Scholarship Form
app.get('/apply', (req, res) => {
    if (isPortalCrashing) {
        return res.status(502).send('502 Bad Gateway - State Servers Down');
    }
    res.send(`
        <html>
        <head><title>State Scholarship Portal</title></head>
        <body style="font-family: Arial; padding: 50px;">
            <h2>State Post-Matric Scholarship Portal</h2>
            <form action="/submit" method="POST" style="display: flex; flex-direction: column; width: 300px; gap: 15px;">
                <input type="text" id="fullName" name="fullName" placeholder="Applicant Full Name" required />
                <input type="number" id="income" name="income" placeholder="Annual Family Income" required />
                <select id="category" name="category">
                    <option value="General">General</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="OBC">OBC</option>
                </select>
                <button type="submit" id="submitBtn" style="background: blue; color: white; padding: 10px;">Submit Secure Application</button>
            </form>
        </body>
        </html>
    `);
});

// The Success Endpoint
app.post('/submit', (req, res) => {
    if (isPortalCrashing) {
        return res.status(502).send('502 Bad Gateway - Database Timeout');
    }
    console.log("SUCCESS: Received application for ->", req.body.fullName);
    res.send(`<h1>Application Submitted Successfully! Your ID is NSP2026SC4521</h1>`);
});

// The Hacker's Toggle (Hit this in your browser to crash the site for the demo)
app.get('/toggle-crash', (req, res) => {
    isPortalCrashing = !isPortalCrashing;
    console.log(`CRASH STATE CHANGED: ${isPortalCrashing ? 'CRASHING' : 'STABLE'}`);
    res.send(`<h1>Portal Crash State: ${isPortalCrashing}</h1>`);
});

const PORT = 3000;
app.listen(PORT, () => console.log(`[Gov Portal] Running flawlessly on http://localhost:${PORT}`));