const { DynamoDBClient, ScanCommand, UpdateItemCommand } = require("@aws-sdk/client-dynamodb");
const puppeteer = require("puppeteer-core");

// Configure AWS (Uses Fargate's built-in IAM Role)
const dynamodb = new DynamoDBClient({ region: "ap-south-1" }); // Change if your DB is in another region
const TABLE_NAME = "Adhikaar_Applications";

async function updateDatabase(applicationId, status, extraParams = {}) {
    try {
        let updateExp = "SET #st = :status";
        let expNames = { "#st": "status" };
        let expValues = { ":status": { S: status } };

        // If we found a conflict, save the options to the database!
        if (extraParams.conflicts) {
            updateExp += ", #conflicts = :conflicts";
            expNames["#conflicts"] = "conflictingSchemes";
            expValues[":conflicts"] = { S: JSON.stringify(extraParams.conflicts) };
        }

        const command = new UpdateItemCommand({
            TableName: TABLE_NAME,
            Key: { applicationId: { S: applicationId } },
            UpdateExpression: updateExp,
            ExpressionAttributeNames: expNames,
            ExpressionAttributeValues: expValues
        });
        await dynamodb.send(command);
        console.log(`[DB UPDATE] ${applicationId} -> ${status}`);
    } catch (error) {
        console.error(`❌ DB Error for ${applicationId}:`, error);
    }
}

async function executePhase1_Drafting(task) {
    const appId = task.applicationId.S;
    console.log(`\n🚀 [Phase 1] Launching headless browser to DRAFT applications for ${appId}...`);
    
    // Lock the task
    await updateDatabase(appId, "IN_PROGRESS");

    try {
        const browser = await puppeteer.launch({
            executablePath: '/usr/bin/google-chrome',
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            headless: true // Change to false when recording your hackathon demo video!
        });
        const page = await browser.newPage();
        
        console.log(`[Agent] Navigating to Govt Portals...`);
        await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate form filling
        
        console.log(`[Agent] Forms filled and saved as DRAFT. Mutual Exclusion Conflict detected!`);
        await browser.close();

        // 🚨 THE MAGIC: We tell the database we found two conflicting scholarships!
        const conflictData = [
            { id: "SCH-CENTRAL-1L", name: "Central Sector Scheme", amount: "₹1,00,000", speed: "Disburses in 6 months", risk: "Highly Competitive" },
            { id: "SCH-STATE-75K", name: "State Merit Scholarship", amount: "₹75,000", speed: "Disburses in 15 days", risk: "Guaranteed if eligible" }
        ];

        // Update DB to ACTION_REQUIRED so the React app can notify the student
        await updateDatabase(appId, "ACTION_REQUIRED", { conflicts: conflictData });
        
    } catch (error) {
        console.error("❌ Automation Error:", error);
        await updateDatabase(appId, "FAILED");
    }
}

async function executePhase2_Submitting(task) {
    const appId = task.applicationId.S;
    const chosenScheme = task.selectedScholarshipId ? task.selectedScholarshipId.S : "Unknown Scheme";
    
    console.log(`\n🚀 [Phase 2] Waking up to SUBMIT chosen scheme (${chosenScheme}) for ${appId}...`);
    await updateDatabase(appId, "SUBMITTING");

    try {
        const browser = await puppeteer.launch({
            executablePath: '/usr/bin/google-chrome',
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            headless: true 
        });
        const page = await browser.newPage();
        
        console.log(`[Agent] Logging back into portal...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log(`[Agent] Clicking final 'Submit' button for ${chosenScheme}...`);
        
        await browser.close();

        // Mark as completely finished!
        await updateDatabase(appId, "SUCCESS");
        console.log(`✅ [SUCCESS] Application permanently submitted!`);
        
    } catch (error) {
        console.error("❌ Automation Error:", error);
        await updateDatabase(appId, "FAILED");
    }
}

async function pollDynamoDB() {
    console.log("🤖 [Fargate Agent] Polling DynamoDB for QUEUED or CHOICE_MADE tasks...");
    try {
        const command = new ScanCommand({
            TableName: TABLE_NAME,
            FilterExpression: "#st = :q OR #st = :c",
            ExpressionAttributeNames: { "#st": "status" },
            ExpressionAttributeValues: { 
                ":q": { S: "QUEUED" },
                ":c": { S: "CHOICE_MADE" }
            }
        });

        const response = await dynamodb.send(command);

        if (response.Items && response.Items.length > 0) {
            const task = response.Items[0];
            const currentStatus = task.status.S;

            if (currentStatus === "QUEUED") {
                await executePhase1_Drafting(task);
            } else if (currentStatus === "CHOICE_MADE") {
                await executePhase2_Submitting(task);
            }
        } else {
            console.log("⏳ No pending tasks found. Waiting...");
        }
    } catch (error) {
        console.error("❌ Error polling DynamoDB:", error);
    }
}

// Keep the ghost computer alive, checking every 10 seconds
setInterval(pollDynamoDB, 10000);
pollDynamoDB();