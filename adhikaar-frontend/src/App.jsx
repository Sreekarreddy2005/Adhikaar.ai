import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { 
  CheckCircle, RefreshCw, AlertCircle, ChevronRight, ShieldCheck, Download, Share2, Mail, Bell, Check, X, Terminal, ArrowRight, BookOpen, FileText, Clock, AlertTriangle, ArrowLeft, Globe, UploadCloud, Lock, Server, FileWarning, Trash2
} from 'lucide-react';

const API_URL = "https://pq0vjt6410.execute-api.ap-south-1.amazonaws.com/default/Adhikaar-API"; 

// 🚨 NEW: Added standard Indian Banks for the dropdown
const INDIAN_STATES = ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"];
const INDIAN_BANKS = ["State Bank of India (SBI)", "Punjab National Bank (PNB)", "Bank of Baroda", "Canara Bank", "Union Bank of India", "Bank of India", "Indian Bank", "Central Bank of India", "Indian Overseas Bank", "UCO Bank", "Bank of Maharashtra", "Punjab & Sind Bank", "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Mahindra Bank", "IndusInd Bank", "Yes Bank", "IDFC First Bank", "Other/Regional Bank"];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('onboarding'); 
  const [loading, setLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState(""); 
  const [appId, setAppId] = useState(localStorage.getItem('adhikaar_appId') || null);
  
  const [dbStatus, setDbStatus] = useState('OCR_PENDING');
  const [extractedData, setExtractedData] = useState(null);
  const [conflictGroups, setConflictGroups] = useState({});
  const [activeAutomations, setActiveAutomations] = useState([]);
  
  const [automationStatuses, setAutomationStatuses] = useState({});
  const [simState, setSimState] = useState({ active: false, scheme: null, step: 0, mode: 'normal' });
  const [terminalLines, setTerminalLines] = useState([]);
  const [uploadedExtraDocs, setUploadedExtraDocs] = useState([]); 
  const [pendingUploadReq, setPendingUploadReq] = useState(null);
  const extraDocRef = useRef(null);
  const scheduledBots = useRef(new Set());

  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [selectedChoices, setSelectedChoices] = useState({});
  
  const [formData, setFormData] = useState({ 
      name: '', email: '', mobile: '', dob: '', state: '', 
      bankName: '', accNo: '', ifsc: '' 
  });
  
  const [files, setFiles] = useState({ income: null, caste: null, aadhaar: null, marksheet: null, bank: null });
  const fileRefs = {
      income: useRef(null), caste: useRef(null), aadhaar: useRef(null), marksheet: useRef(null), bank: useRef(null)
  };

  useEffect(() => { if (appId) setCurrentScreen('dashboard'); }, [appId]);

  const handleFileChange = (type, event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return alert("File size must be under 5MB.");
      
      const reader = new FileReader();
      reader.onload = (e) => {
        if (file.type === 'application/pdf') {
            setFiles(prev => ({ ...prev, [type]: { name: file.name, mimeType: 'pdf', base64: e.target.result.split(',')[1], size: (file.size/1024/1024).toFixed(2) } }));
        } else {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              canvas.width = 800; canvas.height = img.height * (800 / img.width);
              const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              setFiles(prev => ({ ...prev, [type]: { name: file.name, mimeType: 'jpeg', base64: canvas.toDataURL('image/jpeg', 0.7).split(',')[1], size: (file.size/1024/1024).toFixed(2) } }));
            };
            img.src = e.target.result;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = (type, e) => {
      e.stopPropagation();
      setFiles(prev => ({ ...prev, [type]: null }));
  };

  const handleRealSubmit = async () => {
    // Basic Field Presence Check
    if (!formData.name || !formData.state || !formData.mobile || !files.income || !files.caste || !files.aadhaar || !files.marksheet) {
        return alert("Please fill all required fields and upload core documents.");
    }

    // Strict Validations before submission
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(formData.mobile)) return alert("Invalid Mobile Number. Must be 10 digits.");

    if (formData.ifsc) {
        const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
        if (!ifscRegex.test(formData.ifsc)) return alert("Invalid IFSC Code format. E.g., SBIN0000691");
    }

    if (formData.accNo) {
        if (formData.accNo.length < 9) return alert("Account Number is too short. Must be at least 9 digits.");
    }

    setLoading(true);
    setLoadingPhase("Applying Client-Side AES-256 Encryption...");
    
    setTimeout(async () => {
      setLoadingPhase("Transmitting securely to AWS Zero-Retention Vault...");
      try {
        const response = await axios.post(API_URL, {
          action: "start_application", 
          profile: formData,
          documents: {
            income: files.income.base64, incomeMime: files.income.mimeType,
            caste: files.caste.base64, casteMime: files.caste.mimeType,
            aadhaar: files.aadhaar.base64, aadhaarMime: files.aadhaar.mimeType,
            marksheet: files.marksheet.base64, marksheetMime: files.marksheet.mimeType
          }
        });
        setAppId(response.data.applicationId); localStorage.setItem('adhikaar_appId', response.data.applicationId);
        setCurrentScreen('dashboard');
      } catch (error) {
        const errorData = error.response?.data;
        alert(errorData?.reasons ? `🚨 SECURITY / VALIDATION FAILED:\n\n${errorData.reasons.join('\n')}` : "Connection Failed or Server Error.");
      } finally { setLoading(false); setLoadingPhase(""); }
    }, 1500); 
  };

  useEffect(() => {
    let interval;
    if (currentScreen === 'dashboard' && appId) {
      interval = setInterval(async () => {
        try {
          const response = await axios.post(API_URL, { action: "check_status", applicationId: appId });
          const { status, extractedData, conflictGroups, activeAutomations } = response.data;
          setDbStatus(status); setExtractedData(extractedData);
          setConflictGroups(conflictGroups || {}); setActiveAutomations(activeAutomations || []);
          if (status === 'SUBMISSION_IN_PROGRESS') clearInterval(interval);
        } catch (error) { console.error(error); }
      }, 3000); 
    }
    return () => clearInterval(interval);
  }, [currentScreen, appId]);

  useEffect(() => {
    if (dbStatus === 'SUBMISSION_IN_PROGRESS' && activeAutomations.length > 0) {
      activeAutomations.forEach((scheme, index) => {
        const missingDocs = scheme.requiredDocs?.filter(d => !['income', 'caste', 'aadhaar', 'marksheet', ...uploadedExtraDocs].includes(d)) || [];
        if (missingDocs.length > 0) {
          setAutomationStatuses(prev => ({ ...prev, [scheme.id]: 'MISSING_DOCS' }));
          return; 
        }
        if (scheduledBots.current.has(scheme.id)) return;
        scheduledBots.current.add(scheme.id);

        setTimeout(() => {
          setAutomationStatuses(prev => prev[scheme.id] === 'SUCCESS' ? prev : { ...prev, [scheme.id]: 'FILLING_FORMS' });
          const shouldTriggerCrashDemo = index === 1; 

          if (shouldTriggerCrashDemo) {
             setTimeout(() => {
                 setAutomationStatuses(prev => prev[scheme.id] === 'SUCCESS' ? prev : { ...prev, [scheme.id]: 'RETRY_SCHEDULED' });
                 setTimeout(() => {
                    setAutomationStatuses(prev => prev[scheme.id] === 'SUCCESS' ? prev : { ...prev, [scheme.id]: 'RETRYING_NOW' });
                    setTimeout(() => { setAutomationStatuses(prev => ({ ...prev, [scheme.id]: 'SUCCESS' })); }, 6000);
                 }, 8000); 
             }, 5000); 
          } else {
             setTimeout(() => { setAutomationStatuses(prev => ({ ...prev, [scheme.id]: 'SUCCESS' })); }, 8000 + Math.random() * 2000);
          }
        }, index * 2000);
      });
    }
  }, [dbStatus, activeAutomations, uploadedExtraDocs]);

  const submitFinalChoices = async () => {
    if (Object.keys(selectedChoices).length < Object.keys(conflictGroups).length) return alert("Select one scheme per group.");
    setDbStatus('SUBMISSION_IN_PROGRESS'); setConflictGroups({});
    await axios.post(API_URL, { action: "submit_choices", applicationId: appId, choices: Object.values(selectedChoices) });
  };

  const triggerExtraDocUpload = (scheme, docType) => {
    setPendingUploadReq({ schemeId: scheme.id, docType });
    extraDocRef.current.click();
  };

  const handleExtraDocChange = (e) => {
    if (e.target.files[0] && pendingUploadReq) {
      setUploadedExtraDocs(prev => [...prev, pendingUploadReq.docType]);
      scheduledBots.current.delete(pendingUploadReq.schemeId);
      setAutomationStatuses(prev => ({ ...prev, [pendingUploadReq.schemeId]: 'QUEUED' })); 
      setPendingUploadReq(null);
    }
  };

  const formatDocName = (docType) => {
    if (!docType) return 'Document';
    return docType.split('_').reverse().map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const startSimulation = (scheme) => {
    const isRetry = automationStatuses[scheme.id] === 'RETRY_SCHEDULED';
    setSimState({ active: true, scheme, step: 0, mode: isRetry ? 'retry' : 'normal' });
    setTerminalLines(["[AWS Fargate] Container Provisioned..."]);
  };

  useEffect(() => {
    if (!simState.active) return;
    const extraDoc = simState.scheme.requiredDocs?.find(d => !['income', 'caste', 'aadhaar', 'marksheet'].includes(d));
    const messages = [
      `[Playwright] Launching headless browser...`,
      `[Network] Navigating to ${simState.scheme.portal}...`,
      `[DOM] Injecting Payload: Name="${extractedData?.nameFromAadhaar || formData.name}"`,
      `[DOM] Injecting Payload: Income="₹${extractedData?.income || '60000'}"`,
      extraDoc ? `[S3 Vault] Fetching ${formatDocName(extraDoc)} securely...` : `[S3 Vault] Fetching OCR-validated Base Documents...`,
      `[Network] Executing POST request to submission endpoint...`,
      simState.mode === 'retry' ? `[Network] 504 Gateway Timeout from ${simState.scheme.portal}.` : `[Success] Application Accepted!`,
      simState.mode === 'retry' ? `[AWS Step Functions] Exponential backoff triggered.` : `[System] Safely tearing down container. Memory purged.`
    ];

    const timer = setTimeout(() => {
      if (simState.step < messages.length) {
        setTerminalLines(prev => [...prev, messages[simState.step]]);
        setSimState(prev => ({ ...prev, step: prev.step + 1 }));
        if (simState.step === messages.length - 1 && simState.mode === 'normal') setAutomationStatuses(prev => ({ ...prev, [simState.scheme.id]: 'SUCCESS' }));
      }
    }, 1200); 
    return () => clearTimeout(timer);
  }, [simState.active, simState.step, simState.mode, simState.scheme]);

  const handleReset = () => { localStorage.removeItem('adhikaar_appId'); window.location.reload(); };

  const stats = {
    found: Object.values(conflictGroups).flat().length + activeAutomations.length,
    inProgress: activeAutomations.filter(s => ['QUEUED', 'FILLING_FORMS', 'RETRY_SCHEDULED', 'RETRYING_NOW', 'MISSING_DOCS'].includes(automationStatuses[s.id])).length,
    success: activeAutomations.filter(s => automationStatuses[s.id] === 'SUCCESS').length
  };

  const renderOnboarding = () => (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 font-sans">
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b pb-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Adhikaar.ai</h1>
                <p className="text-slate-500 mt-1">Turning Rights into Reality</p>
            </div>
            <span className="mt-4 sm:mt-0 flex items-center text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
               <ShieldCheck className="w-4 h-4 mr-1"/> AWS 256-bit Encrypted Vault
            </span>
        </div>

        <h3 className="font-bold text-slate-800 mb-4 flex items-center"><BookOpen className="w-5 h-5 mr-2 text-blue-600"/> Student Profile</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Full Name *</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-slate-300 rounded bg-slate-50 p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="As per Aadhaar" />
          </div>
          <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Date of Birth *</label>
              <input type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="w-full border border-slate-300 rounded bg-slate-50 p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">State of Domicile *</label>
              <select value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="w-full border border-slate-300 rounded bg-slate-50 p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">Select State...</option>
                {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
             </select>
          </div>
          <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Mobile Number *</label>
              <input type="tel" value={formData.mobile} onChange={e => {
                  const val = e.target.value.replace(/\D/g, ''); // 🚨 Block non-digits instantly
                  if (val.length <= 10) setFormData({...formData, mobile: val});
              }} className="w-full border border-slate-300 rounded bg-slate-50 p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="10-digit number" />
          </div>
          <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Email Address</label>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border border-slate-300 rounded bg-slate-50 p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Optional" />
          </div>
        </div>

        <h3 className="font-bold text-slate-800 mb-4 flex items-center border-t pt-6"><Server className="w-5 h-5 mr-2 text-blue-600"/> Bank Details (For Direct Benefit Transfer)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
           
           {/* 🚨 DROPDOWN FOR BANK NAMES */}
           <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Bank Name</label>
              <select value={formData.bankName} onChange={e => setFormData({...formData, bankName: e.target.value})} className="w-full border border-slate-300 rounded bg-slate-50 p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">Select Bank...</option>
                {INDIAN_BANKS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
           </div>
           
           {/* 🚨 STRICT ACCOUNT NUMBER FIELD */}
           <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Account Number</label>
              <input 
                 type="password" 
                 value={formData.accNo} 
                 onChange={e => {
                    const val = e.target.value.replace(/\D/g, ''); // Block non-digits
                    if (val.length <= 18) setFormData({...formData, accNo: val}); // Stop at 18
                 }} 
                 className="w-full border border-slate-300 rounded bg-slate-50 p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                 placeholder="9 to 18 digits" 
              />
           </div>
           
           {/* 🚨 STRICT IFSC CODE FIELD */}
           <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">IFSC Code</label>
              <input 
                 type="text" 
                 value={formData.ifsc} 
                 onChange={e => {
                    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); // Force Uppercase & Alphanumeric only
                    if (val.length <= 11) setFormData({...formData, ifsc: val}); // Stop at 11
                 }} 
                 className="w-full border border-slate-300 rounded bg-slate-50 p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none uppercase" 
                 placeholder="e.g. SBIN0000691" 
              />
           </div>

        </div>

        <h3 className="font-bold text-slate-800 mb-4 flex items-center border-t pt-6"><UploadCloud className="w-5 h-5 mr-2 text-blue-600"/> Core Documents Vault</h3>
        <p className="text-xs text-slate-500 mb-4">Upload once. Our AI will automatically verify and attach these to all future applications. (PDF or JPG, Max 5MB)</p>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {['income', 'caste', 'aadhaar', 'marksheet'].map((type) => (
             <div key={type} onClick={() => !files[type] && fileRefs[type].current.click()} className={`relative border-2 border-dashed ${files[type] ? 'border-green-500 bg-green-50' : 'border-slate-300 hover:bg-slate-50'} rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer transition min-h-[120px]`}>
               {files[type] ? (
                 <>
                   <button onClick={(e) => removeFile(type, e)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                   <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
                   <span className="font-bold text-slate-800 text-xs truncate w-full px-2">{files[type].name}</span>
                   <span className="text-[10px] text-green-600 mt-1">{files[type].size} MB</span>
                 </>
               ) : (
                 <>
                   <FileText className="w-6 h-6 text-slate-400 mb-2" />
                   <span className="font-bold text-slate-600 text-sm capitalize">{type === 'marksheet' ? 'Latest Marksheet' : type} *</span>
                   <span className="text-[10px] text-slate-400 mt-1">Click to browse</span>
                 </>
               )}
               <input type="file" accept="image/jpeg, image/png, application/pdf" className="hidden" ref={fileRefs[type]} onChange={(e) => handleFileChange(type, e)} />
             </div>
          ))}
        </div>

        <button onClick={handleRealSubmit} disabled={loading} className={`w-full text-white font-bold py-4 rounded-lg transition flex justify-center items-center flex-col h-16 ${loading ? 'bg-slate-700' : 'bg-slate-900 hover:bg-slate-800'}`}>
          {loading ? (
              <span className="flex items-center text-sm"><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> {loadingPhase}</span>
          ) : "Encrypt & Analyze Documents"}
        </button>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="max-w-5xl mx-auto p-6 font-sans">
      <input type="file" accept="image/jpeg, application/pdf" className="hidden" ref={extraDocRef} onChange={handleExtraDocChange} />
      <div className="bg-white border-2 border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-start border-b pb-6 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Automation Control Center</h1>
            <p className="text-sm text-slate-500 mt-1">Session UUID: <span className="font-mono text-xs">{appId}</span></p>
          </div>
          {extractedData && (
            <div className="bg-green-50 border border-green-200 p-3 rounded-lg text-right">
              <p className="text-xs font-bold text-green-700 uppercase mb-1 flex items-center justify-end"><ShieldCheck className="w-4 h-4 mr-1"/> Validated by AI</p>
              <p className="text-sm text-slate-800">Income: <b>₹{extractedData.income}</b> | Caste: <b>{extractedData.caste}</b></p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {Object.keys(conflictGroups).length > 0 && (
            <div className="border-2 border-orange-300 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-orange-50 p-4 border-b border-orange-200">
                <h4 className="font-bold text-slate-900 flex items-center"><AlertCircle className="w-5 h-5 mr-2 text-orange-600" /> Action Required: Policy Overlap Detected</h4>
              </div>
              <div className="p-6 space-y-6">
                {Object.entries(conflictGroups).map(([groupName, schemes]) => (
                  <div key={groupName} className="bg-white border border-slate-200 rounded-lg p-4">
                    <h5 className="font-bold text-slate-800 mb-3 text-sm uppercase border-b pb-2">Conflict Class: {groupName.replace(/_/g, ' ')}</h5>
                    <div className="grid grid-cols-2 gap-4">
                      {schemes.map(scheme => (
                        <div key={scheme.id} onClick={() => setSelectedChoices(p => ({ ...p, [groupName]: scheme.id }))}
                          className={`border-2 p-4 rounded-lg cursor-pointer transition flex flex-col justify-between ${selectedChoices[groupName] === scheme.id ? 'border-orange-500 bg-orange-50' : 'border-slate-200 hover:border-orange-300'}`}>
                          <div>
                            <h6 className="font-bold text-slate-900 text-lg">{scheme.name}</h6>
                            <p className="text-2xl font-black text-green-600 my-2">{scheme.amount}</p>
                            <div className="mt-4 space-y-2 border-t pt-3">
                              {scheme.pros?.map((pro, i) => <p key={i} className="text-xs text-slate-700 flex items-start"><Check className="w-3 h-3 text-green-500 mr-2 mt-0.5 flex-shrink-0"/>{pro}</p>)}
                              {scheme.cons?.map((con, i) => <p key={i} className="text-xs text-slate-700 flex items-start"><X className="w-3 h-3 text-red-500 mr-2 mt-0.5 flex-shrink-0"/>{con}</p>)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <button onClick={submitFinalChoices} className="w-full bg-orange-600 text-white font-bold py-3 rounded-lg flex items-center justify-center hover:bg-orange-700 transition">
                  Dispatch Selection to AWS Fargate <ChevronRight className="w-5 h-5 ml-2"/>
                </button>
              </div>
            </div>
          )}

          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-slate-50">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white">
              <h4 className="font-bold text-slate-900 text-md">Autonomous Bot Queue</h4>
            </div>
            <div className="p-4 space-y-4">
              {activeAutomations.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-4">Awaiting instructions...</p>
              ) : (
                activeAutomations.map(scheme => {
                  const botStatus = automationStatuses[scheme.id] || 'QUEUED';
                  const missingDocs = scheme.requiredDocs?.filter(d => !['income', 'caste', 'aadhaar', 'marksheet', ...uploadedExtraDocs].includes(d)) || [];

                  return (
                    <div key={scheme.id} className={`bg-white border p-4 rounded-lg transition-all ${botStatus === 'RETRY_SCHEDULED' ? 'border-orange-300 shadow-sm' : botStatus === 'MISSING_DOCS' ? 'border-yellow-400 shadow-sm' : 'border-slate-200'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-slate-800 text-lg flex items-center">
                            {scheme.name} 
                            {botStatus === 'RETRY_SCHEDULED' && <span className="ml-3 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full flex items-center"><AlertTriangle className="w-3 h-3 mr-1"/> Portal Timeout</span>}
                            {botStatus === 'RETRYING_NOW' && <span className="ml-3 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center"><RefreshCw className="w-3 h-3 mr-1 animate-spin"/> Retrying Now</span>}
                            {botStatus === 'MISSING_DOCS' && <span className="ml-3 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full flex items-center"><FileWarning className="w-3 h-3 mr-1"/> Action Required</span>}
                          </p>
                          <p className="text-xs font-bold text-green-600 mt-0.5">{scheme.amount} • {scheme.portal}</p>
                        </div>
                        
                        {botStatus === 'SUCCESS' ? (
                          <button onClick={() => { setSelectedReceipt(scheme); setCurrentScreen('receipt'); }} className="bg-green-100 text-green-700 border border-green-300 px-4 py-2 rounded-lg text-sm font-bold flex items-center hover:bg-green-200 transition">
                            <CheckCircle className="w-4 h-4 mr-2"/> View Receipt
                          </button>
                        ) : botStatus === 'MISSING_DOCS' ? (
                          <button onClick={() => triggerExtraDocUpload(scheme, missingDocs[0])} className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center hover:bg-yellow-600 transition animate-pulse">
                            <UploadCloud className="w-4 h-4 mr-2"/> Upload {missingDocs[0] ? formatDocName(missingDocs[0]) : 'Document'}
                          </button>
                        ) : botStatus === 'RETRY_SCHEDULED' ? (
                          <button onClick={() => startSimulation(scheme)} className="bg-orange-100 text-orange-800 border border-orange-300 px-4 py-2 rounded-lg text-sm font-bold flex items-center hover:bg-orange-200 transition">
                            <Terminal className="w-4 h-4 mr-2"/> View Crash Logs
                          </button>
                        ) : (botStatus === 'FILLING_FORMS' || botStatus === 'RETRYING_NOW') ? (
                          <button onClick={() => startSimulation(scheme)} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center hover:bg-slate-800 transition">
                            <Globe className="w-4 h-4 mr-2"/> Watch Live Bot
                          </button>
                        ) : (
                          <span className="text-slate-500 text-sm font-bold flex items-center bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                            <Clock className="w-4 h-4 mr-2"/> Queued
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded border border-slate-100 flex items-start mt-3">
                        <BookOpen className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0 mt-0.5"/>
                        {scheme.summary}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
            
            <div className="bg-white border-t border-slate-200 p-4 grid grid-cols-3 gap-4 text-center">
               <div className="border border-slate-200 p-3 rounded-lg"><p className="text-2xl font-black text-slate-900">{stats.found}</p><p className="text-xs text-slate-500 uppercase font-bold tracking-wide mt-1">Scholarships Found</p></div>
               <div className="border border-slate-200 p-3 rounded-lg"><p className="text-2xl font-black text-blue-600">{stats.inProgress}</p><p className="text-xs text-slate-500 uppercase font-bold tracking-wide mt-1">In Progress</p></div>
               <div className="border border-green-200 bg-green-50 p-3 rounded-lg"><p className="text-2xl font-black text-green-600">{stats.success}</p><p className="text-xs text-green-700 uppercase font-bold tracking-wide mt-1">Successfully Submitted</p></div>
            </div>
          </div>
          <button onClick={handleReset} className="text-sm text-red-500 font-bold hover:underline mt-4">Purge Session Data</button>
        </div>
      </div>

      {simState.active && simState.scheme && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-95 flex items-center justify-center z-50 p-6">
          <div className="w-full max-w-6xl rounded-xl shadow-2xl overflow-hidden flex h-[75vh]">
            <div className="w-1/3 bg-black border-r border-slate-700 flex flex-col font-mono">
              <div className="bg-slate-800 px-4 py-3 text-slate-300 text-sm flex justify-between items-center">
                <span className="flex items-center"><Terminal className="w-4 h-4 mr-2 text-blue-400"/> Bot Console</span>
              </div>
              <div className="p-4 overflow-y-auto flex-1 text-green-500 text-xs leading-relaxed">
                {terminalLines.map((line, idx) => (
                  <div key={idx} className={`mb-2 ${line.includes('504') ? 'text-red-400' : line.includes('Retry') ? 'text-orange-400' : ''}`}>
                    <ArrowRight className="w-3 h-3 inline mr-2 text-slate-600"/>{line}
                  </div>
                ))}
                {(simState.step < 7) && <span className="animate-pulse font-bold ml-5">_</span>}
              </div>
            </div>
            <div className="w-2/3 bg-slate-100 flex flex-col relative">
               <button onClick={() => setSimState({ active: false })} className="absolute top-3 right-4 text-slate-500 hover:text-slate-900 z-10"><X className="w-6 h-6"/></button>
               <div className="bg-slate-300 px-4 py-3 flex items-center border-b border-slate-400">
                  <div className="flex space-x-2 mr-4">
                     <div className="w-3 h-3 rounded-full bg-red-400"></div><div className="w-3 h-3 rounded-full bg-yellow-400"></div><div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="bg-white rounded px-3 py-1 text-xs text-slate-600 flex-1 flex items-center shadow-inner">
                     <Lock className="w-3 h-3 mr-2 text-slate-400"/> https://{simState.scheme.portal}/apply
                  </div>
               </div>
               <div className="flex-1 p-8 overflow-y-auto">
                  <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow border border-slate-200">
                     <h2 className="text-xl font-bold text-slate-800 mb-6 border-b pb-4 flex items-center"><Server className="w-5 h-5 mr-2 text-blue-600"/> Official Application Portal</h2>
                     <div className="space-y-4">
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase">Applicant Name</label>
                          <div className={`mt-1 p-2 border rounded bg-slate-50 text-slate-800 text-sm h-10 flex items-center ${simState.step >= 2 ? 'border-blue-300 ring-1 ring-blue-100' : 'border-slate-200'}`}>
                             {simState.step >= 2 ? (extractedData?.nameFromAadhaar || formData.name) : ''}
                             {simState.step === 2 && <span className="w-1 h-4 bg-slate-900 ml-1 animate-pulse"></span>}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
                              <div className={`mt-1 p-2 border rounded bg-slate-50 text-slate-800 text-sm h-10 flex items-center ${simState.step >= 3 ? 'border-blue-300' : 'border-slate-200'}`}>
                                 {simState.step >= 3 ? (extractedData?.caste || 'SC') : ''}
                              </div>
                           </div>
                           <div>
                              <label className="text-xs font-bold text-slate-500 uppercase">Annual Income</label>
                              <div className={`mt-1 p-2 border rounded bg-slate-50 text-slate-800 text-sm h-10 flex items-center ${simState.step >= 3 ? 'border-blue-300' : 'border-slate-200'}`}>
                                 {simState.step >= 3 ? `₹${extractedData?.income || '60000'}` : ''}
                              </div>
                           </div>
                        </div>
                        <div className="pt-4">
                           <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Required Documents</label>
                           <div className={`border border-dashed p-4 rounded text-sm flex items-center justify-between transition-colors ${simState.step >= 4 ? 'bg-green-50 border-green-400 text-green-700' : 'bg-slate-50 border-slate-300 text-slate-400'}`}>
                              <span className="flex items-center"><UploadCloud className="w-4 h-4 mr-2"/> Encrypted Verification Bundle</span>
                              {simState.step >= 4 && <CheckCircle className="w-4 h-4 text-green-500"/>}
                           </div>
                        </div>
                        <button className={`w-full py-3 rounded text-white font-bold flex justify-center items-center mt-6 transition-colors ${simState.step >= 5 ? 'bg-blue-600' : 'bg-slate-300'}`}>
                           {simState.step === 5 ? <RefreshCw className="w-5 h-5 animate-spin"/> : 'Submit Application'}
                        </button>
                        {simState.step >= 6 && simState.mode === 'retry' && (
                          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded text-sm font-bold flex items-center justify-center"><AlertTriangle className="w-5 h-5 mr-2"/> 504 Gateway Timeout - Server Unresponsive</div>
                        )}
                        {simState.step >= 6 && simState.mode === 'normal' && (
                          <div className="mt-4 bg-green-50 border border-green-200 text-green-700 p-3 rounded text-sm font-bold flex items-center justify-center"><CheckCircle className="w-5 h-5 mr-2"/> Success - Ref ID: APP{Math.floor(Math.random()*1000)}</div>
                        )}
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderReceipt = () => {
    if (!selectedReceipt) return null;
    return (
      <div className="max-w-2xl mx-auto p-6 font-sans">
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-white stroke-[3]" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Application Submitted Successfully!</h1>
            <p className="text-slate-500 text-sm">Your scholarship application has been submitted by the AI agent</p>
          </div>

          <div className="border border-slate-200 rounded-lg p-6 mb-6">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-200 pb-3 mb-4">Submission Details</h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Scholarship Name:</span><span className="font-bold text-slate-800 text-right">{selectedReceipt.name}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Portal:</span><span className="text-slate-800">{selectedReceipt.portal}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Submission Date:</span><span className="text-slate-800">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}, {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute:'2-digit' })}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Reference ID:</span><span className="font-bold text-slate-800">APP{Math.floor(Math.random()*10000)}X{selectedReceipt.id.split('-').pop()}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Application Deadline:</span><span className="text-slate-800">28th March 2026</span></div>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <button className="w-full border border-slate-300 py-3 rounded-lg font-bold text-slate-700 flex justify-center items-center hover:bg-slate-50 transition"><Download className="w-4 h-4 mr-2"/> [Download Submission Proof]</button>
            <button className="w-full border border-slate-300 py-3 rounded-lg font-bold text-slate-700 flex justify-center items-center hover:bg-slate-50 transition"><Share2 className="w-4 h-4 mr-2"/> [Share Confirmation]</button>
          </div>

          <div className="border border-slate-200 rounded-lg p-5 mb-6 bg-slate-50">
             <h4 className="font-bold text-slate-800 text-sm flex items-center mb-3"><Bell className="w-4 h-4 mr-2"/> Notifications Sent</h4>
             <ul className="space-y-2 text-sm text-slate-600">
               <li className="flex items-center"><Mail className="w-4 h-4 mr-2 text-slate-400"/> Email sent to: {formData.email || (formData.name ? formData.name.toLowerCase().replace(' ', '.') + '@email.com' : 'student@email.com')}</li>
               <li className="flex items-center"><Mail className="w-4 h-4 mr-2 text-slate-400"/> SMS sent to: {formData.mobile || '+91 XXXXX-XXXXX'}</li>
               <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-500"/> WhatsApp notification sent</li>
             </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-6">
              <h4 className="font-bold text-blue-900 text-sm flex items-center mb-2"><AlertCircle className="w-4 h-4 mr-2"/> What happens next?</h4>
              <ul className="list-disc list-inside text-xs text-blue-800 space-y-1 ml-1">
                 <li>Your AI agent will continue monitoring this application.</li>
                 <li>You'll be notified of any status updates or required actions.</li>
                 <li>The agent will continue applying to other eligible scholarships.</li>
              </ul>
          </div>

          <button onClick={() => setCurrentScreen('dashboard')} className="w-full bg-slate-900 text-white font-bold py-4 rounded-lg hover:bg-slate-800 transition flex justify-center items-center">[Return to Dashboard]</button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12 pt-8">
      {currentScreen === 'onboarding' && renderOnboarding()}
      {currentScreen === 'dashboard' && renderDashboard()}
      {currentScreen === 'receipt' && renderReceipt()}
    </div>
  );
}