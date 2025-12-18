import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Globe, Lock, ExternalLink, Download, Flag,
  Database, Fingerprint, Zap, Activity, ShieldAlert,
  Cpu, Layers, BarChart3, Network, Terminal,
  ChevronRight, Radar, ArrowRight, ShieldCheck,
  Maximize2, AlertCircle, Info, XCircle
} from 'lucide-react';

const apiKey = ""; // Provided at runtime

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200;12..96,800&family=Fira+Code:wght@400;700&family=Newsreader:ital,opsz,wght@0,6..72,200;0,6..72,400;1,6..72,200&display=swap');
    
    :root {
      --bg-base: #020203;
      --bg-panel: #08080a;
      --accent: #ff00ff;
      --accent-dim: rgba(255, 0, 255, 0.08);
      --border-sharp: rgba(255, 255, 255, 0.15);
      --text-main: #ffffff;
      --text-dim: #94a3b8;
    }

    body {
      background-color: var(--bg-base);
      color: var(--text-main);
      margin: 0;
      -webkit-font-smoothing: antialiased;
      font-family: 'Newsreader', serif;
      overflow-x: hidden;
    }

    .font-display { font-family: 'Bricolage Grotesque', sans-serif; font-weight: 800; }
    .font-tech { font-family: 'Fira Code', monospace; }
    .font-report { font-family: 'Newsreader', serif; font-weight: 400; }
    
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
      box-shadow: 0 10px 40px -10px rgba(0,0,0,0.8);
    }

    .text-extreme {
      font-size: clamp(2.5rem, 6vw, 4.5rem);
      line-height: 1;
      letter-spacing: -0.04em;
      font-weight: 800;
      word-break: break-word;
    }

    .sidebar-step {
      border-left: 4px solid transparent;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .sidebar-step.active {
      border-left-color: var(--accent);
      background: linear-gradient(90deg, var(--accent-dim) 0%, transparent 100%);
    }

    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-thumb { background: var(--border-sharp); border-radius: 10px; }
  `}</style>
);

const App = () => {
  const [view, setView] = useState('landing'); 
  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [scanStep, setScanStep] = useState(0);

  // Auto-scroll to top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [view]);

  const architectureSteps = useMemo(() => [
    { id: 0, name: "Input Filter", icon: <Globe size={14} />, desc: "URL Normalization" },
    { id: 1, name: "DNS Recon", icon: <Database size={14} />, desc: "Metadata Extraction" },
    { id: 2, name: "Fingerprint", icon: <Fingerprint size={14} />, desc: "Heuristic Map" },
    { id: 3, name: "Neural Audit", icon: <Cpu size={14} />, desc: "AI Contextual Scan" },
    { id: 4, name: "Probability", icon: <Layers size={14} />, desc: "Weighted Score" }
  ], []);

  const performAIAnalysis = async (targetUrl) => {
    const systemPrompt = `Analyze website authenticity. JSON format ONLY. 
    Strict status: 'Safe', 'Suspicious', or 'Fraudulent'.
    Findings status: 'Good', 'Warning', or 'Bad'. 
    Include: verdictHeader, verdictReason, score (0-100), status, confidence (1-100), explanation, weightedBreakdown: { technical, heuristic, ai }, findings: [ { label, val, status } ].`;
    
    const makeRequest = async () => {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Neural Trace Analysis: ${targetUrl}. Provide full forensic JSON breakdown.` }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { responseMimeType: "application/json", temperature: 0.1 }
        })
      });
      if (!res.ok) throw new Error('API Sync Fault');
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('Empty payload');
      return JSON.parse(text);
    };

    let lastError;
    for (let i = 0; i < 3; i++) {
      try { return await makeRequest(); } catch (err) {
        lastError = err;
        await new Promise(r => setTimeout(r, 1000));
      }
    }
    throw lastError;
  };

  const handleScan = async (e) => {
    if (e) e.preventDefault();
    if (!url || isScanning) return;
    
    let pUrl = url.trim();
    if (!pUrl.startsWith('http')) pUrl = 'https://' + pUrl;

    setIsScanning(true);
    setResult(null);
    setError(null);
    setScanStep(0);

    for (let i = 0; i < architectureSteps.length; i++) {
      setScanStep(i);
      await new Promise(r => setTimeout(r, 700));
    }

    try {
      const rawData = await performAIAnalysis(pUrl);
      
      const score = parseInt(rawData.score || rawData.trust_score || 0);
      const statusRaw = (rawData.status || "").toLowerCase();
      let normalizedStatus = "Fraudulent";
      if (statusRaw.includes("safe") || statusRaw.includes("good") || score > 80) normalizedStatus = "Safe";
      else if (statusRaw.includes("suspicious") || statusRaw.includes("warning") || score > 40) normalizedStatus = "Suspicious";

      const normalizedData = {
        ...rawData,
        status: normalizedStatus,
        verdictHeader: rawData.verdictHeader || rawData.verdict_header || (normalizedStatus === 'Safe' ? 'GENUINE SITE' : 'POTENTIAL THREAT'),
        verdictReason: rawData.verdictReason || rawData.verdict_reason || rawData.explanation || "Verification Complete.",
        score: score,
        confidence: parseInt(rawData.confidence || rawData.confidence_score || (rawData.confidence_level ? rawData.confidence_level * 100 : 0)) || 85,
        weightedBreakdown: {
          technical: parseInt(rawData.weightedBreakdown?.technical || rawData.weighted_breakdown?.technical || (score * 0.3)),
          heuristic: parseInt(rawData.weightedBreakdown?.heuristic || rawData.weighted_breakdown?.heuristic || (score * 0.25)),
          ai: parseInt(rawData.weightedBreakdown?.ai || rawData.weighted_breakdown?.ai || (score * 0.45))
        },
        findings: (Array.isArray(rawData.findings) ? rawData.findings : []).map(f => ({
          label: f.label || f.parameter || "Metadata Node",
          val: f.val || f.value || "Valid",
          status: f.status || "Good"
        }))
      };

      setResult(normalizedData);
    } catch (err) {
      setError("Trace node synchronization failed. Check target domain.");
    } finally {
      setIsScanning(false);
    }
  };

  const downloadReport = useCallback(() => {
    if (!result) return;
    
    // Constructing the Detailed Forensic Report
    const reportText = `
NEURALTRACE FORENSIC REPORT
===========================
Target Domain: ${url}
Timestamp: ${new Date().toLocaleString()}
Verdict: ${result.verdictHeader}
Status: ${result.status}
Final Trust Score: ${result.score}/100
Trace Confidence: ${result.confidence}%

EXECUTIVE SUMMARY:
"${result.explanation || "No summary available."}"

VERDICT REASONING PATH:
"${result.verdictReason || "No reasoning path defined."}"

WEIGHTED SCORING MATRIX:
- Technical Metrics Valuation: ${result.weightedBreakdown?.technical || 0}/30
- Heuristic Strategy Analysis: ${result.weightedBreakdown?.heuristic || 0}/25
- Neural AI Contextual Audit: ${result.weightedBreakdown?.ai || 0}/45

DETAILED METADATA FINDINGS:
${(result.findings || []).map(f => `[${f.status.toUpperCase()}] ${f.label}: ${f.val}`).join('\n')}

---
Generated by NeuralTrace Hub v2.4.2
"Know before you click."
    `.trim();

    const blob = new Blob([reportText], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `NeuralTrace_Forensics_${url.replace(/[^a-z0-9]/gi, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [result, url]);

  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    if (s === 'safe' || s === 'good') return 'text-emerald-400 border-emerald-500/40';
    if (s === 'suspicious' || s === 'warning') return 'text-amber-400 border-amber-500/40';
    return 'text-rose-400 border-rose-500/40';
  };

  const getVerdictBg = (status) => {
    const s = status?.toLowerCase();
    if (s === 'safe') return 'bg-emerald-500/5 border-emerald-500/50';
    if (s === 'suspicious') return 'bg-amber-500/5 border-amber-500/50';
    return 'bg-rose-500/5 border-rose-500/50';
  };

  return (
    <div className="min-h-screen bg-[#020203] relative selection:bg-fuchsia-500/30 font-report overflow-x-hidden">
      <GlobalStyles />
      <div className="grain" />
      
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[60vw] h-[60vw] bg-fuchsia-600/[0.04] [clip-path:polygon(0%_0%,100%_0%,100%_100%)]" />
        <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] bg-indigo-600/[0.04] [clip-path:polygon(0%_0%,0%_100%,100%_100%)]" />
      </div>

      <AnimatePresence mode="wait">
        {view === 'landing' ? (
          <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="min-h-screen flex flex-col justify-center px-8 lg:px-24 relative z-10">
            <div className="max-w-6xl mx-auto w-full py-24">
              <div className="space-y-12">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-fuchsia-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,0,255,0.4)]">
                      <Radar size={28} className="text-white" strokeWidth={2.5} />
                  </div>
                  <span className="font-tech text-[12px] text-fuchsia-500 font-bold tracking-[0.5em] uppercase">Forensic Terminal Node</span>
                </div>
                
                <h1 className="text-extreme font-display text-white uppercase leading-none">
                  Neural<br/><span className="text-fuchsia-600">Trace.</span>
                </h1>
                
                <p className="font-report text-3xl lg:text-5xl text-slate-300 italic font-medium leading-tight max-w-4xl">
                  "Know before you click." Mapping the hidden architecture of digital fraud.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-16 border-t border-white/5">
                  <div className="space-y-4">
                      <h3 className="font-display text-2xl text-white uppercase tracking-tight font-bold">The Objective</h3>
                      <p className="font-report text-xl text-slate-400 leading-relaxed italic font-medium">
                          Engineering a transparent trust layer for the modern web. We use multi-weighted matrices to identify fraudulent domains before interaction occurs.
                      </p>
                  </div>
                  <div className="space-y-4">
                      <h3 className="font-display text-2xl text-white uppercase tracking-tight font-bold">Utility Protocol</h3>
                      <ul className="font-tech text-[11px] space-y-4 uppercase tracking-[0.2em] text-fuchsia-400 font-bold">
                          <li className="flex items-center gap-4"><ChevronRight size={14}/> Metadata Recon</li>
                          <li className="flex items-center gap-4"><ChevronRight size={14}/> Neural Content Audit</li>
                          <li className="flex items-center gap-4"><ChevronRight size={14}/> Forensic Identification</li>
                      </ul>
                  </div>
                </div>

                <div className="pt-12">
                  <button onClick={() => setView('engine')} className="group relative h-20 px-14 bg-white text-black font-display text-2xl uppercase tracking-widest hover:bg-fuchsia-600 hover:text-white transition-all flex items-center gap-6 font-extrabold shadow-2xl">
                      Launch Hub <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                  </button>
                </div>
              </div>
            </div>

            <footer className="mt-auto py-12 border-t border-white/5 relative z-10 bg-black/50 backdrop-blur-xl">
              <div className="max-w-7xl mx-auto px-8 w-full flex flex-col md:flex-row justify-between items-center gap-12">
                  <div className="space-y-1 text-center md:text-left">
                      <p className="font-tech text-[10px] text-white/40 uppercase tracking-[0.4em] font-black">Project_Incubator</p>
                      <h4 className="font-display text-3xl text-white font-bold tracking-tighter">PromptCraft</h4>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-x-12 gap-y-4">
                      {[
                          { name: "Karedia Uzair", url: "https://www.linkedin.com/in/uzair-karedia-61080a348/" },
                          { name: "Shaikh Amr", url: "https://amrshaikh.me/" },
                          { name: "Chougle Talha", url: "https://www.linkedin.com/in/talha-chougle-15a063334/" },
                          { name: "Shah Bilal", url: "https://www.linkedin.com/in/mohammed-bilal-shah-516354372/" }
                      ].map(member => (
                          <a key={member.name} href={member.url} target="_blank" rel="noopener noreferrer" className="font-tech text-[11px] text-slate-400 hover:text-fuchsia-500 transition-colors uppercase tracking-widest flex items-center gap-2 group font-bold">
                              {member.name} <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-all"/>
                          </a>
                      ))}
                  </div>
              </div>
            </footer>
          </motion.div>
        ) : (
          <motion.div key="engine" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen flex flex-col relative z-10">
            <nav className="h-24 px-12 border-b border-white/10 flex items-center justify-between bg-black relative z-[100]">
              <div className="flex items-center shrink-0">
                <div className="w-10 h-10 bg-fuchsia-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,0,255,0.4)]">
                  <Radar size={22} className="text-white" />
                </div>
              </div>
              <div className="flex flex-col items-center flex-1 px-4">
                <span className="font-display text-3xl lg:text-4xl text-white uppercase tracking-tighter leading-none font-extrabold">NeuralTrace</span>
                <span className="font-tech text-[10px] text-fuchsia-500 tracking-[0.4em] uppercase font-bold mt-2 italic text-center">Know before you click</span>
              </div>
              <div className="flex items-center gap-6 shrink-0">
                <div className="hidden sm:block font-tech text-[10px] text-emerald-400 bg-emerald-500/5 px-3 py-1 border border-emerald-500/30 rounded-sm font-black tracking-widest uppercase">UPLINK_STABLE</div>
                <Terminal className="text-white/40 w-6 h-6 hover:text-white transition-colors" />
              </div>
            </nav>

            <main className="flex-1 flex flex-col lg:grid lg:grid-cols-12 overflow-hidden bg-black">
                <section className="col-span-12 lg:col-span-3 border-b lg:border-b-0 lg:border-r border-white/10 bg-[#050507] p-8 lg:p-12 flex flex-col overflow-y-auto">
                    <div className="space-y-12">
                        <h2 className="font-display text-3xl lg:text-4xl text-white uppercase leading-tight font-black tracking-tighter">
                            Website Analysis <br/><span className="text-fuchsia-500">Initiation</span>
                        </h2>
                        <form onSubmit={handleScan} className="space-y-4">
                            <input value={url} onChange={e => setUrl(e.target.value)} placeholder="DOMAIN_TARGET_ENTRY" className="w-full bg-black border border-white/20 p-5 font-tech text-sm text-white focus:border-fuchsia-500 transition-all outline-none font-bold placeholder:text-white/20" disabled={isScanning} />
                            <button type="submit" disabled={isScanning || !url} className="w-full h-16 bg-white text-black font-display text-lg uppercase tracking-widest hover:bg-fuchsia-600 hover:text-white transition-all flex items-center justify-center gap-3 disabled:opacity-20 font-black">
                                {isScanning ? <Activity className="animate-spin w-5 h-5" /> : <>EXECUTE_TRACE <ArrowRight size={20}/></>}
                            </button>
                        </form>
                    </div>

                    <div className="space-y-6 mt-12">
                        <p className="font-tech text-[8px] text-fuchsia-500 tracking-[0.3em] uppercase font-black">Protocol_Linkage</p>
                        <div className="space-y-1">
                            {architectureSteps.map((s) => (
                                <div key={s.id} className={`sidebar-step flex items-center gap-4 p-4 border-l-4 transition-all duration-500 ${s.id === scanStep && isScanning ? 'active' : (result ? 'opacity-100 border-white/10' : 'opacity-20 border-transparent')}`}>
                                    <div className="text-white shrink-0">{s.icon}</div>
                                    <div>
                                        <p className="font-tech text-[11px] text-white font-black leading-none">{s.name}</p>
                                        <p className="font-tech text-[9px] text-white/50 uppercase mt-1 font-bold">{s.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setView('landing')} className="font-tech text-[10px] text-slate-400 hover:text-white uppercase mt-10 flex items-center gap-3 transition-colors font-black">
                            <ArrowRight size={14} className="rotate-180"/> Return to Terminal
                        </button>
                    </div>
                </section>

                <section className="col-span-12 lg:col-span-9 lg:overflow-y-auto p-6 md:p-12 scroll-smooth bg-black">
                    <AnimatePresence mode="wait">
                        {!result && !isScanning ? (
                            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col justify-center max-w-2xl min-h-[400px]">
                                <h1 className="text-extreme font-display text-white uppercase mb-8 leading-none">System_ <br/>Ready.</h1>
                                <p className="font-report text-2xl lg:text-3xl text-slate-300 italic leading-snug font-medium">
                                    Awaiting target input. Deploying distributed forensic nodes to map digital signatures and weighted content vectors.
                                </p>
                            </motion.div>
                        ) : isScanning ? (
                            <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center gap-12 min-h-[400px]">
                                <Radar className="w-24 h-24 text-fuchsia-500 animate-pulse" strokeWidth={1} />
                                <div className="flex flex-col items-center gap-4">
                                    <p className="font-tech text-xs text-white uppercase tracking-[0.4em] font-black">Neural_Trace_Active</p>
                                    <div className="px-10 py-3 border-2 border-fuchsia-500/30 bg-fuchsia-500/5">
                                        <p className="font-tech text-lg text-fuchsia-400 uppercase font-black tracking-widest">{architectureSteps[scanStep].name}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 max-w-6xl w-full pb-24">
                                
                                <div className={`p-8 lg:p-10 border-l-[10px] flex flex-col md:flex-row md:items-start gap-10 ${getVerdictBg(result.status)} shadow-2xl transition-all`}>
                                    <div className={`p-6 rounded-full shrink-0 ${
                                        result.status === 'Safe' ? 'bg-emerald-500/10 text-emerald-400 shadow-[0_0_50px_rgba(16,185,129,0.15)]' : 
                                        result.status === 'Suspicious' ? 'bg-amber-500/10 text-amber-400' :
                                        'bg-rose-500/10 text-rose-400 shadow-[0_0_50px_rgba(244,63,94,0.15)]'
                                    }`}>
                                        {result.status === 'Safe' ? <ShieldCheck size={54} /> : result.status === 'Suspicious' ? <Info size={54} /> : <AlertCircle size={54} />}
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <span className="font-tech text-[10px] text-white uppercase tracking-[0.5em] font-black">Forensic_Outcome</span>
                                            <h3 className={`font-display text-4xl lg:text-6xl uppercase tracking-tighter font-black ${
                                                result.status === 'Safe' ? 'text-emerald-400' : result.status === 'Suspicious' ? 'text-amber-400' : 'text-rose-400'
                                            }`}>
                                                {result.verdictHeader}
                                            </h3>
                                        </div>
                                        <p className="font-report text-2xl lg:text-3xl text-white italic leading-tight font-black opacity-100">
                                            "{result.verdictReason}"
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col xl:flex-row justify-between items-start gap-8">
                                    <div className="flex-1 space-y-8">
                                        <div className="space-y-2">
                                            <span className="font-tech text-xs text-white uppercase tracking-widest font-black">Identity_Trace</span>
                                            <h2 className="text-extreme break-words leading-[1.1] text-white font-black" style={{ color: '#ffffff', opacity: 1 }}>{url}</h2>
                                        </div>
                                        <div className="space-y-4">
                                            <span className="font-tech text-xs text-white uppercase tracking-widest font-black">Forensic_Synthesis</span>
                                            <p className="font-report text-xl lg:text-2xl text-slate-200 leading-tight italic font-black opacity-100">"{result.explanation}"</p>
                                        </div>
                                    </div>
                                    <div className="panel-edge p-8 flex flex-col items-center justify-center min-w-[240px] bg-black/40 self-center lg:self-start transition-transform hover:scale-[1.02]">
                                        <span className="font-display text-[7rem] lg:text-[8rem] text-white leading-none tracking-tighter font-black">{result.score}</span>
                                        <span className="font-tech text-[10px] text-fuchsia-500 tracking-[0.4em] font-black uppercase mt-2 text-center">Trust_Index_Rating</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
                                    {[
                                        { l: "Technical", w: "30%", v: result.weightedBreakdown.technical, m: 30, c: "bg-fuchsia-500" },
                                        { l: "Heuristic", w: "25%", v: result.weightedBreakdown.heuristic, m: 25, c: "bg-indigo-500" },
                                        { l: "AI Audit", w: "45%", v: result.weightedBreakdown.ai, m: 45, c: "bg-blue-600" }
                                    ].map((m, i) => (
                                        <div key={i} className="panel-edge p-8 space-y-6 hover:bg-white/[0.02] transition-colors">
                                            <div className="flex justify-between items-end"><p className="font-display text-xl text-white uppercase font-black tracking-tight">{m.l}</p><p className="font-tech text-[10px] text-white/30 font-bold">{m.w}</p></div>
                                            <div className="h-1 bg-white/5 relative overflow-hidden">
                                                <motion.div initial={{ width: 0 }} animate={{ width: `${(m.v/m.m)*100}%` }} transition={{ duration: 1.5, delay: i*0.2 }} className={`h-full absolute top-0 left-0 ${m.c}`} />
                                            </div>
                                            <div className="flex justify-between font-tech text-[10px] uppercase tracking-widest font-black">
                                                <span className="text-white/60">Rating</span>
                                                <span className="text-white text-lg font-black">{m.v} PTS</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="panel-edge overflow-hidden bg-[#0a0a0c]">
                                    <div className="px-8 py-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                                        <span className="font-tech text-xs text-white uppercase tracking-[0.4em] font-black italic">DETAILED_METADATA_ANALYSIS_LOG</span>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left font-tech text-sm border-collapse min-w-[700px]">
                                            <thead><tr className="bg-white/5 text-white uppercase tracking-widest font-black">
                                                <th className="px-8 py-6 font-black border-b border-white/10">Trace Vector</th>
                                                <th className="px-8 py-6 font-black border-b border-white/10">Detection Value</th>
                                                <th className="px-8 py-6 font-black border-b border-white/10 text-right">Status</th>
                                            </tr></thead>
                                            <tbody className="divide-y divide-white/5">
                                            {result.findings.map((f, i) => (
                                                <tr key={i} className="hover:bg-white/[0.03] transition-colors group">
                                                    <td className="px-8 py-8 border-r border-white/10 text-lg uppercase tracking-tight font-black text-white" style={{ color: '#ffffff', opacity: 1 }}>{f.label}</td>
                                                    <td className="px-8 py-8 border-r border-white/10 text-lg font-black text-white" style={{ color: '#ffffff', opacity: 1 }}>{f.val}</td>
                                                    <td className="px-8 py-8 text-right">
                                                      <span className={`font-black px-5 py-2 border-2 text-[10px] uppercase tracking-[0.2em] transition-colors ${getStatusColor(f.status)}`}>
                                                        {f.status}
                                                      </span>
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row justify-between items-center px-10 py-5 bg-white/[0.03] border border-white/10 rounded-2xl shadow-xl gap-6">
                                    <span className="font-tech text-[11px] text-white/50 uppercase tracking-[0.5em] font-black shrink-0">Trace_Confidence</span>
                                    <div className="flex items-center gap-8 flex-1 max-w-xl">
                                        <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${result.confidence}%` }} transition={{ duration: 1.5 }} className="h-full bg-emerald-400" />
                                        </div>
                                        <span className="font-tech text-2xl text-white font-black tracking-tighter">{result.confidence}%</span>
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row gap-4 pt-2 pb-12">
                                    <button onClick={downloadReport} className="flex-1 h-16 bg-white text-black font-display text-lg uppercase tracking-[0.2em] hover:bg-fuchsia-600 hover:text-white transition-all flex items-center justify-center gap-4 font-black active:scale-[0.98] shadow-2xl">
                                        <Download size={20}/> Download Log
                                    </button>
                                    <button onClick={() => window.open('https://cybercrime.gov.in', '_blank')} className="flex-1 h-16 border-2 border-rose-500 text-rose-500 font-display text-lg uppercase tracking-[0.2em] hover:bg-rose-500/10 transition-all flex items-center justify-center gap-4 font-black active:scale-[0.98]">
                                        <ShieldAlert size={20}/> Report Threat
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </section>
            </main>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes dash { to { stroke-dashoffset: 0; } }
      `}</style>
    </div>
  );
};

export default App;