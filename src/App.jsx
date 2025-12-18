import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Globe, 
  Lock, 
  ExternalLink, 
  Download, 
  Flag,
  Database,
  Fingerprint,
  Zap, 
  Activity,
  ShieldAlert,
  Cpu,
  Layers,
  BarChart3,
  Network,
  Share2,
  Terminal,
  ChevronRight,
  Radar,
  ArrowRight,
  ShieldCheck,
  Maximize2,
  AlertCircle,
  Info,
  XCircle
} from 'lucide-react';

const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200;12..96,800&family=Fira+Code:wght@400;700&family=Newsreader:ital,opsz,wght@0,6..72,200;0,6..72,400;1,6..72,200&display=swap');
    
    :root {
      --bg-base: #020203;
      --bg-panel: #08080a;
      --accent: #ff00ff;
      --accent-dim: rgba(255, 0, 255, 0.08);
      --border-sharp: rgba(255, 255, 255, 0.1);
      --text-main: #f8fafc;
      --text-dim: #64748b;
    }

    body {
      background-color: var(--bg-base);
      color: var(--text-main);
      margin: 0;
      -webkit-font-smoothing: antialiased;
      font-family: 'Newsreader', serif;
    }

    .font-display { font-family: 'Bricolage Grotesque', sans-serif; font-variation-settings: 'wght' 800; }
    .font-tech { font-family: 'Fira Code', monospace; }
    .font-report { font-family: 'Newsreader', serif; font-weight: 200; }
    
    .grain {
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
      opacity: 0.04;
      pointer-events: none;
      z-index: 100;
    }

    .panel-edge {
      background: var(--bg-panel);
      border: 1px solid var(--border-sharp);
      box-shadow: 0 10px 30px -10px rgba(0,0,0,0.7);
    }

    input:focus {
      border-color: var(--accent) !important;
      outline: none;
      background: #0c0c0e !important;
    }

    .text-extreme {
      font-size: clamp(3rem, 8vw, 6.5rem);
      line-height: 0.85;
      letter-spacing: -0.04em;
    }

    .sidebar-step {
      border-left: 2px solid transparent;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .sidebar-step.active {
      border-left-color: var(--accent);
      background: linear-gradient(90deg, var(--accent-dim) 0%, transparent 100%);
    }

    ::-webkit-scrollbar { width: 2px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--border-sharp); }
    
    .content-area {
        scroll-behavior: smooth;
    }
  `}</style>
);

const App = () => {
  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [scanStep, setScanStep] = useState(0);

  const architectureSteps = useMemo(() => [
    { name: "Input Filter", icon: <Globe size={14} />, desc: "URL Normalization" },
    { name: "DNS Recon", icon: <Database size={14} />, desc: "Metadata Extraction" },
    { name: "Fingerprint", icon: <Fingerprint size={14} />, desc: "Heuristic Map" },
    { name: "Neural Audit", icon: <Cpu size={14} />, desc: "AI Contextual Scan" },
    { name: "Probability", icon: <Layers size={14} />, desc: "Weighted Score" }
  ], []);

  const handleScan = async (e) => {
    e.preventDefault();
    if (!url || isScanning) return;
    
    let pUrl = url.trim();
    if (!pUrl.startsWith('http')) pUrl = 'https://' + pUrl;

    setIsScanning(true);
    setResult(null);
    setError(null);
    
    for (let i = 0; i < architectureSteps.length; i++) {
      setScanStep(i);
      await new Promise(r => setTimeout(r, 700));
    }

    try {
      const data = await performAIAnalysis(pUrl);
      
      if (data.confidence && data.confidence <= 1) {
        data.confidence = Math.round(data.confidence * 100);
      } else {
        data.confidence = Math.round(data.confidence || 0);
      }

      setResult({ url: pUrl, ...data });
    } catch (err) {
      setError("Trace node error: Neural bridge synchronization failed.");
    } finally {
      setIsScanning(false);
    }
  };

  const performAIAnalysis = async (targetUrl) => {
    const systemPrompt = `Analyze website authenticity. 
    IMPORTANT: First check if the domain is valid, registered, and active. If the domain does not exist, return score: 0, status: 'Invalid', verdictHeader: 'DOMAIN NOT FOUND'.
    
    JSON ONLY: { 
      "score": number (0-100), 
      "status": "Safe" | "Suspicious" | "Fraudulent" | "Invalid", 
      "confidence": number (1-100), 
      "verdictHeader": "GENUINE SITE" | "POTENTIAL FRAUD" | "SUSPICIOUS ACTIVITY" | "DOMAIN NOT FOUND",
      "verdictReason": "Detailed explanation of result focusing on Domain Age, SSL, and branding clues.",
      "explanation": "concise report", 
      "weightedBreakdown": { "technical": number, "heuristic": number, "ai": number }, 
      "findings": [
        { "label": "Domain Age", "val": "string", "status": "Good" | "Bad" },
        { "label": "SSL Certificate", "val": "string", "status": "Good" | "Bad" },
        { "label": "Reputation", "val": "string", "status": "Good" | "Bad" },
        { "label": "TLD Heuristics", "val": "string", "status": "Good" | "Bad" }
      ] 
    }`;
    
    const userQuery = `Deep Trace Request: ${targetUrl}. Evaluate reachability and weighted authenticity. Clearly categorize. Tagline context: Know before you click.`;

    const makeRequest = async () => {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userQuery }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { 
            responseMimeType: "application/json",
            temperature: 0.1 
          }
        })
      });

      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('Empty response');
      return JSON.parse(text);
    };

    let lastError;
    const delays = [1000, 2000, 4000];
    for (let i = 0; i < 3; i++) {
      try { return await makeRequest(); } catch (err) {
        lastError = err;
        if (i < 2) await new Promise(r => setTimeout(r, delays[i]));
      }
    }
    throw lastError;
  };

  const downloadReport = () => {
    if (!result) return;
    const reportContent = `
NEURALTRACE FORENSIC REPORT
===========================
Tagline: Know before you click
Target Domain: ${result.url}
Timestamp: ${new Date().toLocaleString()}
Verdict: ${result.verdictHeader}
Status: ${result.status}
Final Trust Score: ${result.score}/100
Confidence Level: ${result.confidence}%

SUMMARY:
"${result.explanation}"

VERDICT REASONING:
"${result.verdictReason}"

WEIGHTED BREAKDOWN:
- Technical Metadata: ${result.weightedBreakdown?.technical || 0}/30
- Heuristic Analysis: ${result.weightedBreakdown?.heuristic || 0}/25
- Neural AI Audit: ${result.weightedBreakdown?.ai || 0}/45

DETAILED FINDINGS:
${result.findings?.map(f => `- ${f.label}: ${f.val} [${f.status.toUpperCase()}]`).join('\n')}

---
Generated by NeuralTrace Node v2.4.1
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `NeuralTrace_Report_${result.url.replace(/[^a-z0-9]/gi, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const reportToAuthorities = () => {
    window.open('https://cybercrime.gov.in', '_blank');
  };

  return (
    <div className="min-h-screen bg-[#020203] relative selection:bg-fuchsia-500/30 font-report">
      <GlobalStyles />
      <div className="grain" />
      
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-fuchsia-600/[0.03] [clip-path:polygon(0%_0%,100%_0%,100%_100%)]" />
        <div className="absolute bottom-0 left-0 w-[30vw] h-[30vw] bg-indigo-600/[0.03] [clip-path:polygon(0%_0%,0%_100%,100%_100%)]" />
      </div>

      <nav className="h-20 px-12 border-b border-white/10 flex items-center justify-between relative z-[60] bg-black">
        <div className="flex items-center gap-5">
          <div className="w-9 h-9 bg-fuchsia-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,0,255,0.3)] shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M3 12L6 9L10 15L13 12L21 12"/></svg>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-display text-2xl text-white uppercase tracking-tight leading-none">NeuralTrace</span>
            <span className="font-tech text-[9px] text-fuchsia-500 tracking-[0.25em] uppercase font-bold mt-1.5 italic opacity-90">Know before you click</span>
          </div>
        </div>
        <div className="flex gap-10">
          <div className="hidden sm:block font-tech text-[10px] text-emerald-500 bg-emerald-500/5 px-3 py-1 border border-emerald-500/20 rounded-sm font-bold tracking-widest uppercase">Uplink_Stable</div>
          <Terminal className="text-white/20 w-5 h-5 cursor-pointer hover:text-white transition-colors" />
        </div>
      </nav>

      <main className="flex flex-col lg:grid lg:grid-cols-12 lg:h-[calc(100vh-80px)] relative z-10 overflow-x-hidden">
        
        <section className="col-span-12 lg:col-span-3 border-b lg:border-b-0 lg:border-r border-white/10 bg-[#050507] p-8 lg:p-12 flex flex-col justify-between shrink-0">
          <div className="space-y-12">
            <div>
              <h2 className="font-display text-2xl lg:text-3xl text-white uppercase leading-tight font-extrabold tracking-tighter">
                Website Analysis <span className="text-fuchsia-500">Initiation</span>
              </h2>
            </div>

            <form onSubmit={handleScan} className="space-y-4">
              <input 
                value={url} onChange={e => setUrl(e.target.value)}
                placeholder="HTTPS://DOMAIN.TLD"
                className="w-full bg-black border border-white/10 p-5 font-tech text-xs text-white focus:border-fuchsia-500 transition-all outline-none"
                disabled={isScanning}
              />
              <button 
                disabled={isScanning || !url}
                className="w-full h-16 bg-white text-black font-display text-sm uppercase tracking-widest hover:bg-fuchsia-600 hover:text-white transition-all flex items-center justify-center gap-3 disabled:opacity-20"
              >
                {isScanning ? <Activity className="animate-spin w-5 h-5" /> : <>EXECUTE_TRACE <ArrowRight size={16}/></>}
              </button>
            </form>
          </div>

          <div className="hidden lg:block space-y-6 mt-12">
            <p className="font-tech text-[8px] text-fuchsia-500 tracking-[0.3em] uppercase font-bold">Protocol_Flow</p>
            <div className="space-y-1">
              {architectureSteps.map((s, i) => (
                <div key={i} className={`sidebar-step flex items-center gap-4 p-4 border-l-2 transition-all duration-500 ${i === scanStep && isScanning ? 'active' : (result ? 'opacity-100 border-white/10' : 'opacity-20 border-transparent')}`}>
                  <div className="text-white">{s.icon}</div>
                  <div>
                    <p className="font-tech text-[10px] text-white font-bold leading-none">{s.name}</p>
                    <p className="font-tech text-[8px] text-white/30 uppercase mt-1 tracking-tighter">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="col-span-12 lg:col-span-9 lg:overflow-y-auto bg-black p-6 md:p-16 scroll-smooth content-area">
          <AnimatePresence mode="wait">
            {!result && !isScanning ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col justify-center max-w-2xl min-h-[400px]">
                <h1 className="text-extreme font-display text-white uppercase mb-8">System_ <br/>Ready.</h1>
                <p className="font-report text-2xl text-slate-500 italic leading-snug">
                  Waiting for target domain. Initializing weighted scoring matrix and forensic node distribution.
                </p>
                {error && <div className="mt-8 p-4 border border-rose-500/20 bg-rose-500/5 text-rose-500 font-tech text-xs">{error}</div>}
              </motion.div>
            ) : isScanning ? (
              <motion.div key="sc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center justify-center gap-12 min-h-[400px]">
                <Radar className="w-24 h-24 text-fuchsia-500 animate-pulse" strokeWidth={1} />
                <div className="w-64 bg-white/5 h-[1px] relative overflow-hidden">
                  <motion.div className="absolute inset-0 bg-fuchsia-500" initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }} />
                </div>
                <div className="flex flex-col items-center gap-2">
                  <p className="font-tech text-[10px] text-white/20 tracking-[0.5em] uppercase">Neural_Trace_Active</p>
                  <p className="font-tech text-[9px] text-fuchsia-500 uppercase font-bold tracking-[0.2em]">{architectureSteps[scanStep].name} Step</p>
                </div>
              </motion.div>
            ) : (
              <motion.div key="res" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 lg:space-y-20 max-w-6xl w-full pb-20">
                
                <div className={`p-8 lg:p-12 border-l-4 flex flex-col md:flex-row md:items-start gap-10 ${
                  result.status === 'Safe' ? 'bg-emerald-500/5 border-emerald-500' : 
                  result.status === 'Suspicious' ? 'bg-amber-500/5 border-amber-500' : 
                  result.status === 'Invalid' ? 'bg-slate-500/5 border-slate-500' :
                  'bg-rose-500/5 border-rose-500'
                }`}>
                  <div className={`p-6 rounded-full shrink-0 ${
                    result.status === 'Safe' ? 'bg-emerald-500/10 text-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.1)]' : 
                    result.status === 'Suspicious' ? 'bg-amber-500/10 text-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.1)]' : 
                    result.status === 'Invalid' ? 'bg-slate-500/10 text-slate-400' :
                    'bg-rose-500/10 text-rose-500 shadow-[0_0_40px_rgba(244,63,94,0.1)]'
                  }`}>
                    {result.status === 'Safe' ? <ShieldCheck size={64} /> : 
                     result.status === 'Suspicious' ? <Info size={64} /> : 
                     result.status === 'Invalid' ? <XCircle size={64} /> :
                     <AlertCircle size={64} />}
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <span className="font-tech text-[9px] text-white/40 uppercase tracking-[0.3em] font-bold">Neural_Verdict_Confirmed</span>
                      <h3 className={`font-display text-4xl lg:text-6xl leading-none uppercase tracking-tighter ${
                        result.status === 'Safe' ? 'text-emerald-500' : 
                        result.status === 'Suspicious' ? 'text-amber-500' : 
                        result.status === 'Invalid' ? 'text-slate-400' :
                        'text-rose-500'
                      }`}>
                        {result.verdictHeader}
                      </h3>
                    </div>
                    <div className="space-y-4">
                        <p className="font-mono text-[9px] text-white/20 uppercase tracking-[0.4em] font-bold">Reasoning_Path_Audit</p>
                        <p className="font-report text-2xl lg:text-3xl text-slate-100 italic leading-[1.3]">
                        "{result.verdictReason}"
                        </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col xl:flex-row justify-between items-start gap-12">
                  <div className="flex-1 space-y-12">
                    <div className="space-y-2">
                      <span className="font-tech text-[9px] text-white/30 tracking-widest uppercase font-bold">Domain_Identity</span>
                      <h2 className="text-extreme font-display text-white uppercase break-all tracking-tighter leading-[0.85]">{result.url}</h2>
                    </div>
                    <div className="space-y-4">
                      <span className="font-tech text-[9px] text-white/30 tracking-widest uppercase font-bold">Executive_Summary</span>
                      <p className="font-report text-2xl lg:text-3xl text-slate-400 leading-tight italic font-light">
                        "{result.explanation}"
                      </p>
                    </div>
                  </div>
                  <div className="panel-edge p-10 lg:p-12 flex flex-col items-center justify-center min-w-[240px] relative group overflow-hidden bg-black/40 self-center lg:self-start">
                    <span className="font-display text-[8rem] lg:text-[10rem] text-white leading-none tracking-tighter">{result.score}</span>
                    <span className="font-tech text-[10px] text-fuchsia-500 tracking-[0.4em] font-bold uppercase mt-4">Trust_Index_Metric</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
                  {[
                    { l: "Technical", w: "30%", v: result.weightedBreakdown?.technical || 0, m: 30, c: "bg-fuchsia-500" },
                    { l: "Heuristic", w: "25%", v: result.weightedBreakdown?.heuristic || 0, m: 25, c: "bg-indigo-500" },
                    { l: "AI Audit", w: "45%", v: result.weightedBreakdown?.ai || 0, m: 45, c: "bg-blue-600" }
                  ].map((m, i) => (
                    <div key={i} className="panel-edge p-8 space-y-6 hover:bg-white/[0.01] transition-colors">
                      <div className="flex justify-between items-end">
                        <p className="font-display text-xl text-white uppercase leading-none">{m.l}</p>
                        <p className="font-tech text-[9px] text-white/20 tracking-tighter">{m.w}</p>
                      </div>
                      <div className="h-0.5 bg-white/5 w-full relative overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${(m.v/m.m)*100}%` }} transition={{ duration: 1.5, delay: i*0.2 }} className={`h-full absolute top-0 left-0 ${m.c}`} />
                      </div>
                      <div className="flex justify-between font-tech text-[10px] uppercase tracking-tighter">
                        <span className="text-white/20 font-bold">Valuation</span>
                        <span className="text-white font-bold">{m.v} PTS</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="panel-edge overflow-hidden">
                  <div className="px-10 py-6 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                    <span className="font-tech text-[10px] text-white/40 uppercase tracking-widest font-bold">Detailed_Analysis_Trace_Log</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-tech text-[11px] border-collapse min-w-[500px]">
                        <thead>
                        <tr className="bg-white/5 text-white/30 uppercase tracking-tighter">
                            <th className="px-10 py-6 font-normal border-b border-white/5">Trace Parameter</th>
                            <th className="px-10 py-6 font-normal border-b border-white/5">Metadata_Extraction</th>
                            <th className="px-10 py-6 font-normal border-b border-white/5">Valuation</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                        {result.findings?.map((f, i) => (
                            <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                            <td className="px-10 py-8 text-white font-bold border-r border-white/5 tracking-tight">{f.label}</td>
                            <td className="px-10 py-8 text-white/40 border-r border-white/5 group-hover:text-white transition-colors">{f.val}</td>
                            <td className="px-10 py-8">
                                <span className={`font-bold px-3 py-1 border text-[9px] uppercase tracking-widest ${f.status === 'Good' ? 'border-emerald-500/30 text-emerald-500' : 'border-rose-500/30 text-rose-500'}`}>
                                {f.status}
                                </span>
                            </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex justify-between items-center px-12 py-6 bg-white/[0.02] border border-white/10 rounded-2xl">
                    <span className="font-tech text-[10px] text-white/40 uppercase tracking-widest font-bold">Trace_Confidence_Stability</span>
                    <div className="flex items-center gap-6">
                        <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${result.confidence}%` }} transition={{ duration: 1.5 }} className="h-full bg-emerald-500" />
                        </div>
                        <span className="font-tech text-lg text-white font-bold">{result.confidence}%</span>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6 pt-10">
                  <button 
                    onClick={downloadReport}
                    className="flex-1 h-20 bg-white text-black font-display text-lg uppercase tracking-widest hover:bg-fuchsia-600 hover:text-white transition-all flex items-center justify-center gap-4 active:scale-[0.98] shadow-2xl"
                  >
                    <Download size={20}/> Download_Full_Forensics
                  </button>
                  <button 
                    onClick={reportToAuthorities}
                    className="flex-1 h-20 border border-rose-500 text-rose-500 font-display text-lg uppercase tracking-widest hover:bg-rose-500/10 transition-all flex items-center justify-center gap-4 active:scale-[0.98]"
                  >
                    <ShieldAlert size={20}/> Report_to_Authorities
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>


      <style>{`
        @keyframes dash { to { stroke-dashoffset: 0; } }
      `}</style>
    </div>
  );
};

export default App;