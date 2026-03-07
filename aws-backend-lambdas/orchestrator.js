import { DynamoDBClient, PutItemCommand, GetItemCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { TextractClient, AnalyzeDocumentCommand } from "@aws-sdk/client-textract";
import crypto from 'crypto';

const region = "ap-south-1";
const dynamodb = new DynamoDBClient({ region });
const s3 = new S3Client({ region });
const textract = new TextractClient({ region });
const bedrockClient = new BedrockRuntimeClient({ region });

const TABLE_NAME = "Adhikaar_Applications";
const S3_BUCKET_NAME = "adhikaar-secure-vault-2026"; 

// 🚨 SECURE ENCRYPTION HELPER FOR BANK DETAILS
const ENCRYPTION_KEY = crypto.scryptSync(process.env.MY_AWS_SECRET_KEY || 'fallback_key_for_hackathon_demo', 'salt', 32);
const encryptData = (text) => {
    if (!text) return null;
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
};

// 🚨 THE MASSIVE 20-SCHOLARSHIP DATABASE
const SCHOLARSHIP_DB = [
    // --- SC SCHEMES ---
    { id: "GOV-SC-1", name: "Central Post Matric for SC", amount: "₹35,000/yr", conflictGroup: "POST_MATRIC_CORE", maxIncome: 250000, castes: ["SC"], states: ["ALL"], genderOnly: null, minPercentage: 0, type: "GOV", portal: "scholarships.gov.in", summary: "A central government scheme covering full tuition.", pros: ["Covers 100% of college tuition"], cons: ["Slower disbursement"], requiredDocs: ["income", "caste", "aadhaar"] },
    { id: "GOV-SC-2", name: "State Post Matric (Telangana)", amount: "₹40,000/yr", conflictGroup: "POST_MATRIC_CORE", maxIncome: 200000, castes: ["SC"], states: ["Telangana"], genderOnly: null, minPercentage: 0, type: "GOV", portal: "telanganaepass.cgg.gov.in", summary: "State-level fast-tracked tuition reimbursement.", pros: ["Faster processing"], cons: ["Limited to specific states"], requiredDocs: ["income", "caste", "aadhaar"] },
    { id: "GOV-IND-1", name: "Dr. Ambedkar Book Grant", amount: "₹5,000/yr", conflictGroup: null, maxIncome: 250000, castes: ["SC"], states: ["ALL"], genderOnly: null, minPercentage: 0, type: "GOV", portal: "socialjustice.gov.in", summary: "Independent grant for textbooks.", pros: ["No conflicts"], cons: ["Lower payout"], requiredDocs: ["income", "caste", "aadhaar"] },

    // --- ST SCHEMES ---
    { id: "GOV-ST-1", name: "National Fellowship & Scholarship for ST", amount: "₹28,000/yr", conflictGroup: "POST_MATRIC_CORE", maxIncome: 600000, castes: ["ST"], states: ["ALL"], genderOnly: null, minPercentage: 60, type: "GOV", portal: "tribal.nic.in", summary: "Premium central scheme for ST students in higher education.", pros: ["Very high income cap"], cons: ["Strict academic requirements"], requiredDocs: ["income", "caste", "aadhaar", "marksheet"] },
    { id: "GOV-ST-2", name: "Post Matric Scholarship for ST Students", amount: "₹30,000/yr", conflictGroup: "POST_MATRIC_CORE", maxIncome: 250000, castes: ["ST"], states: ["ALL"], genderOnly: null, minPercentage: 0, type: "GOV", portal: "scholarships.gov.in", summary: "Standard tuition coverage for tribal students.", pros: ["Covers all approved courses"], cons: ["Cannot be held with National Fellowship"], requiredDocs: ["income", "caste", "aadhaar"] },

    // --- OBC SCHEMES ---
    { id: "GOV-OBC-1", name: "PM YASASVI Post Matric for OBC", amount: "₹20,000/yr", conflictGroup: "OBC_POST_MATRIC", maxIncome: 250000, castes: ["OBC", "OBC-B", "OBC-A"], states: ["ALL"], genderOnly: null, minPercentage: 60, type: "GOV", portal: "scholarships.gov.in", summary: "Central scheme for OBC students.", pros: ["Higher central allocation"], cons: ["Strict merit criteria"], requiredDocs: ["income", "caste", "aadhaar"] },
    { id: "GOV-OBC-2", name: "State OBC Post Matric Reimbursement", amount: "₹25,000/yr", conflictGroup: "OBC_POST_MATRIC", maxIncome: 200000, castes: ["OBC", "OBC-B", "OBC-A"], states: ["Telangana", "Andhra Pradesh", "Maharashtra"], genderOnly: null, minPercentage: 0, type: "GOV", portal: "state.scholarships.in", summary: "State scheme for fast tuition reimbursement.", pros: ["Faster state processing"], cons: ["Cannot hold with central scheme"], requiredDocs: ["income", "caste", "aadhaar"] },
    { id: "GOV-OBC-3", name: "National Fellowship for OBC", amount: "₹12,000/yr", conflictGroup: null, maxIncome: 300000, castes: ["OBC", "OBC-B", "OBC-A"], states: ["ALL"], genderOnly: null, minPercentage: 60, type: "GOV", portal: "socialjustice.gov.in", summary: "Additional support for higher education.", pros: ["No conflicts with tuition schemes"], cons: ["Highly competitive"], requiredDocs: ["income", "caste", "aadhaar"] },

    // --- MINORITY & EWS SCHEMES ---
    { id: "GOV-MIN-1", name: "Post Matric Scheme for Minorities", amount: "₹15,000/yr", conflictGroup: "MINORITY_CORE", maxIncome: 200000, castes: ["MINORITY", "MUSLIM", "CHRISTIAN", "SIKH", "BUDDHIST", "PARSI", "JAIN"], states: ["ALL"], genderOnly: null, minPercentage: 50, type: "GOV", portal: "scholarships.gov.in", summary: "MoMA scheme for minority communities.", pros: ["Dedicated budget allocation"], cons: ["Fixed quotas per state"], requiredDocs: ["income", "caste", "aadhaar"] },
    { id: "GOV-MIN-2", name: "Begum Hazrat Mahal National Scholarship", amount: "₹10,000/yr", conflictGroup: "MINORITY_CORE", maxIncome: 200000, castes: ["MINORITY", "MUSLIM", "CHRISTIAN", "SIKH", "BUDDHIST", "PARSI", "JAIN"], states: ["ALL"], genderOnly: "FEMALE", minPercentage: 50, type: "GOV", portal: "maef.nic.in", summary: "Exclusive scholarship for minority female students.", pros: ["Empowers female education"], cons: ["For Classes 9 to 12 only"], requiredDocs: ["income", "caste", "aadhaar", "marksheet"] },
    { id: "GOV-EWS-1", name: "Dr. Ambedkar Post Matric for EWS", amount: "₹18,000/yr", conflictGroup: "GEN_CORE", maxIncome: 100000, castes: ["GENERAL", "EWS", "ALL"], states: ["ALL"], genderOnly: null, minPercentage: 0, type: "GOV", portal: "scholarships.gov.in", summary: "Financial assistance for Economically Weaker Sections.", pros: ["Opens government funding to general category"], cons: ["Extremely low income threshold"], requiredDocs: ["income", "aadhaar"] },

    // --- GENERAL / MERIT-BASED SCHEMES ---
    { id: "GOV-GEN-1", name: "Central Sector Scheme for University Students", amount: "₹12,000/yr", conflictGroup: "GOV_MERIT_CORE", maxIncome: 450000, castes: ["ALL"], states: ["ALL"], genderOnly: null, minPercentage: 80, type: "GOV", portal: "scholarships.gov.in", summary: "Merit-based central scheme for high-scoring students.", pros: ["Prestigious central recognition"], cons: ["Cannot hold other central merit schemes"], requiredDocs: ["income", "caste", "aadhaar", "marksheet"] },
    { id: "GOV-GEN-2", name: "AICTE Pragati Scholarship for Girls", amount: "₹50,000/yr", conflictGroup: "GOV_MERIT_CORE", maxIncome: 800000, castes: ["ALL"], states: ["ALL"], genderOnly: "FEMALE", minPercentage: 60, type: "GOV", portal: "aicte-india.org", summary: "Empowering young women in technical education.", pros: ["Massive payout for female students"], cons: ["Competes with Central Sector scheme"], requiredDocs: ["income", "caste", "aadhaar", "marksheet"] },

    // --- PRIVATE / CORPORATE CSR SCHEMES ---
    { id: "PVT-1", name: "HDFC Badhte Kadam", amount: "₹1,00,000/yr", conflictGroup: null, maxIncome: 600000, castes: ["ALL"], states: ["ALL"], genderOnly: null, minPercentage: 0, type: "PVT", portal: "hdfcbank.com/csr", summary: "Corporate CSR initiative.", pros: ["Massive payout"], cons: ["Requires essay"], requiredDocs: ["income", "caste", "aadhaar"] },
    { id: "PVT-2", name: "Reliance Foundation Undergraduate Scholarships", amount: "₹2,00,000 (Total)", conflictGroup: null, maxIncome: 1500000, castes: ["ALL"], states: ["ALL"], genderOnly: null, minPercentage: 60, type: "PVT", portal: "scholarships.reliancefoundation.org", summary: "One of India's largest private merit-cum-means scholarships.", pros: ["Highest private payout", "High income allowance"], cons: ["Aptitude test required"], requiredDocs: ["income", "aadhaar", "marksheet"] },
    { id: "PVT-3", name: "ONGC Foundation Merit Scholarship", amount: "₹48,000/yr", conflictGroup: null, maxIncome: 450000, castes: ["ALL"], states: ["ALL"], genderOnly: null, minPercentage: 60, type: "PVT", portal: "ongcscholar.org", summary: "High-value merit scholarship.", pros: ["High payout"], cons: ["Strict merit criteria"], requiredDocs: ["income", "caste", "aadhaar", "marksheet"] },
    { id: "PVT-4", name: "Santoor Women's Scholarship", amount: "₹24,000/yr", conflictGroup: null, maxIncome: 300000, castes: ["ALL"], states: ["Telangana", "Andhra Pradesh", "Karnataka"], genderOnly: "FEMALE", minPercentage: 0, type: "PVT", portal: "santoorscholarships.com", summary: "Support for young women pursuing higher education.", pros: ["Specific to Southern states"], cons: ["High competition"], requiredDocs: ["income", "caste", "aadhaar"] },
    { id: "PVT-5", name: "L'Oréal India For Young Women in Science", amount: "₹2,50,000 (total)", conflictGroup: null, maxIncome: 600000, castes: ["ALL"], states: ["ALL"], genderOnly: "FEMALE", minPercentage: 85, type: "PVT", portal: "foryoungwomeninscience.com", summary: "Encouraging women to pursue scientific fields.", pros: ["Largest private grant available"], cons: ["Science streams only"], requiredDocs: ["income", "caste", "aadhaar", "marksheet"] },
    { id: "PVT-6", name: "LIC Golden Jubilee Scholarship", amount: "₹20,000/yr", conflictGroup: null, maxIncome: 250000, castes: ["ALL"], states: ["ALL"], genderOnly: null, minPercentage: 60, type: "PVT", portal: "licindia.in", summary: "Merit-based grant from LIC.", pros: ["Very reliable disbursement"], cons: ["Requires 60%+ in previous exams"], requiredDocs: ["income", "caste", "aadhaar", "marksheet"] },
    { id: "PVT-7", name: "Kotak Kanya Scholarship", amount: "₹1,50,000/yr", conflictGroup: null, maxIncome: 600000, castes: ["ALL"], states: ["ALL"], genderOnly: "FEMALE", minPercentage: 85, type: "PVT", portal: "kotakeducation.org", summary: "CSR initiative for female students pursuing professional graduation.", pros: ["Premium corporate backing"], cons: ["Limited seats"], requiredDocs: ["income", "aadhaar", "marksheet"] }
];

export const handler = async (event) => {
    const headers = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Allow-Methods": "OPTIONS,POST,GET" };
    if (event.requestContext?.http?.method === 'OPTIONS' || event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

    try {
        const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;

        if (body.action === "start_application") {
            const appId = crypto.randomUUID(); 
            const userId = crypto.randomUUID();

            const allowedMimes = ['jpeg', 'png', 'pdf'];
            const docs = ['income', 'caste', 'aadhaar', 'marksheet'];
            for (let doc of docs) {
                if (body.documents?.[doc] && !allowedMimes.includes(body.documents[`${doc}Mime`])) {
                    return { statusCode: 400, headers, body: JSON.stringify({ error: `Security Block: Invalid file type for ${doc}.` }) };
                }
            }

            const uploadToS3 = async (base64, mime, docType) => {
                if (!base64) return null;
                const buffer = Buffer.from(base64.replace(/^data:(image\/\w+|application\/pdf);base64,/, ''), 'base64');
                const ext = mime === 'pdf' ? 'pdf' : 'jpg';
                const key = `users/${userId}/${docType}.${ext}`;
                try {
                    await s3.send(new PutObjectCommand({ Bucket: S3_BUCKET_NAME, Key: key, Body: buffer, ServerSideEncryption: "AES256" }));
                    return { key, buffer, path: `s3://${S3_BUCKET_NAME}/${key}` };
                } catch(e) { return { key, buffer, path: `mock-s3-path/${key}` }; }
            };

            const savedDocs = {
                income: await uploadToS3(body.documents?.income, body.documents?.incomeMime, 'income'),
                caste: await uploadToS3(body.documents?.caste, body.documents?.casteMime, 'caste'),
                aadhaar: await uploadToS3(body.documents?.aadhaar, body.documents?.aadhaarMime, 'aadhaar'),
                marksheet: await uploadToS3(body.documents?.marksheet, body.documents?.marksheetMime, 'marksheet')
            };

            const runTextractOCR = async (docObj) => {
                if (!docObj?.buffer) return "";
                try {
                    const res = await textract.send(new AnalyzeDocumentCommand({ Document: { Bytes: docObj.buffer }, FeatureTypes: ["FORMS", "TABLES"] }));
                    return res.Blocks.filter(b => b.BlockType === 'LINE').map(b => b.Text).join('\n');
                } catch (e) { return ""; } 
            };

            const textractResults = {
                incomeText: await runTextractOCR(savedDocs.income),
                casteText: await runTextractOCR(savedDocs.caste),
                aadhaarText: await runTextractOCR(savedDocs.aadhaar),
                marksheetText: await runTextractOCR(savedDocs.marksheet)
            };

            const promptText = `You are a strict forensic document validator. Extract data from the provided Textract OCR text and images.
            Textract Income: ${textractResults.incomeText || "OCR failed due to watermark. Rely entirely on the provided image."}
            Textract Caste: ${textractResults.casteText || "OCR failed due to watermark. Rely entirely on the provided image."}
            Textract Aadhaar: ${textractResults.aadhaarText || "OCR failed due to watermark. Rely entirely on the provided image."}
            Textract Marksheet: ${textractResults.marksheetText || "OCR failed due to watermark. Rely entirely on the provided image."}
            
            Return ONLY a raw JSON object matching this schema:
            {
              "isValid": true,
              "confidenceScore": 0.95,
              "fraudFlags": [],
              "extractedData": {
                "nameFromAadhaar": "Name", "nameFromIncome": "Name", "nameFromCaste": "Name",
                "income": 60000, "caste": "OBC-B", "gender": "MALE", "aadhaarNumber": "123456789012", "academicPercentage": 85.5
              }
            }`;

            const contentArray = [{ text: promptText }];
            const addSafeMedia = (docObj, mimeType, docName) => {
                if (!docObj?.buffer) return;
                contentArray.push(mimeType === 'pdf' ? { document: { name: docName, format: "pdf", source: { bytes: docObj.buffer } } } : { image: { format: "jpeg", source: { bytes: docObj.buffer } } });
            };
            addSafeMedia(savedDocs.income, body.documents?.incomeMime, "income_doc");
            addSafeMedia(savedDocs.caste, body.documents?.casteMime, "caste_doc");
            addSafeMedia(savedDocs.aadhaar, body.documents?.aadhaarMime, "aadhaar_doc");
            addSafeMedia(savedDocs.marksheet, body.documents?.marksheetMime, "marksheet_doc");

            let bedrockResponse = await bedrockClient.send(new ConverseCommand({ modelId: "apac.amazon.nova-lite-v1:0", messages: [{ role: "user", content: contentArray }] }));
            
            let aiVerdict;
            try {
                aiVerdict = JSON.parse(bedrockResponse.output.message.content[0].text.replace(/```json/gi, '').replace(/```/g, '').trim());
                if (typeof aiVerdict.extractedData.income !== 'number') aiVerdict.extractedData.income = parseInt(aiVerdict.extractedData.income.toString().replace(/\D/g, '')) || 0;
                if (typeof aiVerdict.extractedData.academicPercentage !== 'number') aiVerdict.extractedData.academicPercentage = parseFloat(aiVerdict.extractedData.academicPercentage) || 0;
            } catch (e) {
                return { statusCode: 500, headers, body: JSON.stringify({ error: "AI Schema Validation Failed. Model Hallucination detected." }) };
            }

            const ex = aiVerdict.extractedData;
            
            if (ex.income > 5000000) aiVerdict.fraudFlags.push("Sanity Check Failed: Income exceeds 50 Lakhs.");
            if (ex.aadhaarNumber && !/^\d{12}$/.test(ex.aadhaarNumber.replace(/\s/g, ''))) aiVerdict.fraudFlags.push("Format Check Failed: Invalid Aadhaar length or characters.");

            const normalizeStr = (str) => (str || "").toLowerCase().replace(/[^a-z]/g, '').replace(/^mr|mrs|ms|shri/, '');
            const nameA = normalizeStr(ex.nameFromAadhaar);
            const nameI = normalizeStr(ex.nameFromIncome);
            const nameC = normalizeStr(ex.nameFromCaste);
            
            if (nameA && nameI && !nameA.includes(nameI) && !nameI.includes(nameA)) {
                aiVerdict.fraudFlags.push(`Identity Mismatch: Aadhaar (${ex.nameFromAadhaar}) does not match Income Cert (${ex.nameFromIncome}).`);
            }
            if (nameA && nameC && nameC !== "general" && nameC !== "unreserved" && !nameA.includes(nameC) && !nameC.includes(nameA)) {
                aiVerdict.fraudFlags.push(`Identity Mismatch: Aadhaar (${ex.nameFromAadhaar}) does not match Caste Cert (${ex.nameFromCaste}).`);
            }

            if (!aiVerdict.isValid || aiVerdict.confidenceScore < 0.85 || aiVerdict.fraudFlags.length > 0) {
                return { statusCode: 403, headers, body: JSON.stringify({ reasons: aiVerdict.fraudFlags }) };
            }

            const income = ex.income;
            // 🚨 BUG FIX: Added string conversions and case-insensitive matching logic!
            const caste = String(ex.caste).toUpperCase();
            const state = String(body.profile?.state).toUpperCase();
            const gender = String(ex.gender).toUpperCase();
            const marks = ex.academicPercentage;

            const eligibleSchemes = SCHOLARSHIP_DB.filter(s => {
                const incomeMatch = income <= s.maxIncome;
                
                // Maps the DB arrays to uppercase so they perfectly match the AI's uppercase extraction
                const uppercaseCastes = s.castes.map(c => String(c).toUpperCase());
                const uppercaseStates = s.states.map(st => String(st).toUpperCase());

                const casteMatch = uppercaseCastes.includes("ALL") || uppercaseCastes.includes(caste) || uppercaseCastes.includes("GENERAL");
                const stateMatch = uppercaseStates.includes("ALL") || uppercaseStates.includes(state);
                
                const dbGender = s.genderOnly ? String(s.genderOnly).toUpperCase() : null;
                const genderMatch = !dbGender || dbGender === gender;
                const meritMatch = !s.minPercentage || marks >= s.minPercentage;
                
                return incomeMatch && casteMatch && stateMatch && genderMatch && meritMatch;
            });

            const conflictMap = {};
            const independentSchemes = [];
            eligibleSchemes.forEach(scheme => {
                if (scheme.conflictGroup) {
                    if (!conflictMap[scheme.conflictGroup]) conflictMap[scheme.conflictGroup] = [];
                    conflictMap[scheme.conflictGroup].push(scheme);
                } else independentSchemes.push(scheme); 
            });

            const finalConflictGroups = {};
            Object.keys(conflictMap).forEach(groupName => {
                if (conflictMap[groupName].length > 1) finalConflictGroups[groupName] = conflictMap[groupName];
                else independentSchemes.push(conflictMap[groupName][0]);
            });

            const aadhaarHash = crypto.createHash('sha256').update(ex.aadhaarNumber || "UNKNOWN").digest('hex');
            const encryptedBank = encryptData(JSON.stringify({ bank: body.profile.bankName, acc: body.profile.accNo, ifsc: body.profile.ifsc }));

            await dynamodb.send(new PutItemCommand({
                TableName: TABLE_NAME,
                Item: {
                    "applicationId": { S: appId }, "userId": { S: userId },
                    "status": { S: Object.keys(finalConflictGroups).length > 0 ? "ACTION_REQUIRED" : "SUBMISSION_IN_PROGRESS" },
                    "studentName": { S: body.profile.name },
                    "aadhaarHash": { S: aadhaarHash }, 
                    "bankDetailsEncrypted": { S: encryptedBank }, 
                    "s3VaultPaths": { S: JSON.stringify({ income: savedDocs.income?.path, caste: savedDocs.caste?.path, aadhaar: savedDocs.aadhaar?.path, marksheet: savedDocs.marksheet?.path }) },
                    "extractedData": { S: JSON.stringify(ex) },
                    "conflictGroups": { S: JSON.stringify(finalConflictGroups) }, 
                    "activeAutomations": { S: JSON.stringify(independentSchemes) }
                }
            }));

            return { statusCode: 200, headers, body: JSON.stringify({ message: "Success", applicationId: appId }) };
        }

        if (body.action === "check_status") {
            const response = await dynamodb.send(new GetItemCommand({ TableName: TABLE_NAME, Key: { applicationId: { S: body.applicationId } } }));
            if (!response.Item) return { statusCode: 404, headers, body: JSON.stringify({ error: "Not found" }) };
            return { statusCode: 200, headers, body: JSON.stringify({ 
                status: response.Item.status.S,
                extractedData: response.Item.extractedData ? JSON.parse(response.Item.extractedData.S) : null,
                conflictGroups: response.Item.conflictGroups ? JSON.parse(response.Item.conflictGroups.S) : {},
                activeAutomations: response.Item.activeAutomations ? JSON.parse(response.Item.activeAutomations.S) : []
            })};
        }

        if (body.action === "submit_choices") {
            const response = await dynamodb.send(new GetItemCommand({ TableName: TABLE_NAME, Key: { applicationId: { S: body.applicationId } } }));
            const currentAutomations = response.Item.activeAutomations ? JSON.parse(response.Item.activeAutomations.S) : [];
            const conflicts = response.Item.conflictGroups ? JSON.parse(response.Item.conflictGroups.S) : {};
            
            const validChosenSchemes = [];
            Object.values(conflicts).flat().forEach(scheme => { if (body.choices.includes(scheme.id)) validChosenSchemes.push(scheme); });

            await dynamodb.send(new UpdateItemCommand({
                TableName: TABLE_NAME, Key: { applicationId: { S: body.applicationId } },
                UpdateExpression: "SET #st = :status, activeAutomations = :autos, conflictGroups = :empty",
                ExpressionAttributeNames: { "#st": "status" },
                ExpressionAttributeValues: { ":status": { S: "SUBMISSION_IN_PROGRESS" }, ":autos": { S: JSON.stringify([...currentAutomations, ...validChosenSchemes]) }, ":empty": { S: JSON.stringify({}) } }
            }));
            return { statusCode: 200, headers, body: JSON.stringify({ message: "Choices validated." }) };
        }
    } catch (error) { 
        console.error("Backend Error:", error);
        return { statusCode: 500, headers, body: JSON.stringify({ error: "Internal Server Error", details: error.message }) }; 
    }
};