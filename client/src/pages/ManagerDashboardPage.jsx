import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
    Activity, Brain, Clock, DollarSign, Database, Download, 
    RefreshCw, Layers, ShieldCheck, TrendingUp, Info, HelpCircle, User, ArrowLeft 
} from 'lucide-react';
import SpyAnalysis from '../components/workspace/SpyAnalysis';
import SimpleExplanationModal from '../components/workspace/SimpleExplanationModal';

/**
 * ManagerDashboardPage Component
 * Dedicated Administrative Portal for Project Managers and Data Engineers.
 * Centralizes all active learning configurations, annotator activity monitoring,
 * calibration checks, and financial ROI calculations.
 */
const ManagerDashboardPage = () => {
    const API_URL = import.meta.env.VITE_ML_API_URL || "/ml";
    
    // Role Authorization Gate
    const [isAuthorized, setIsAuthorized] = useState(() => sessionStorage.getItem('pm_authorized') === 'true');
    const [passwordInput, setPasswordInput] = useState('');
    const [authError, setAuthError] = useState('');

    const handleAuthSubmit = (e) => {
        e.preventDefault();
        if (passwordInput === 'admin') {
            setIsAuthorized(true);
            sessionStorage.setItem('pm_authorized', 'true');
            setAuthError('');
        } else {
            setAuthError('Access denied: Invalid Project Manager credentials.');
        }
    };
    
    // Core monitoring state
    const [metrics, setMetrics] = useState(null);
    const [history, setHistory] = useState([]);
    const [shadowMetrics, setShadowMetrics] = useState(null);
    const [selectionLogic, setSelectionLogic] = useState(null);
    const [toast, setToast] = useState(null);
    const [isAutoLabeling, setIsAutoLabeling] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [showExplanation, setShowExplanation] = useState(false);

    // Reset Configuration Form State
    const [datasetName, setDatasetName] = useState('imdb'); // imdb, rotten_tomatoes, ag_news, custom
    const [customLabels, setCustomLabels] = useState('Negative, Positive');
    const [seedType, setSeedType] = useState('unlabeled'); // unlabeled, labeled_seed
    const [seedCount, setSeedCount] = useState(10);
    const [roundSize, setRoundSize] = useState(10);
    const [autoLabelThreshold, setAutoLabelThreshold] = useState('dynamic');
    const [customTexts, setCustomTexts] = useState('');

    // Toast auto-clear
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    // Live monitoring poll
    const pollMetrics = useCallback(async () => {
        try {
            // 1. History
            const histRes = await fetch(`${API_URL}/spy/history`);
            if (histRes.ok) {
                const histData = await histRes.json();
                setHistory(histData);
            }

            // 2. Health & Parameters
            const mRes = await fetch(`${API_URL}/health`);
            if (mRes.ok) {
                const mData = await mRes.json();
                
                // Fetch shadow metrics
                let cumulativeCosts = null;
                try {
                    const costRes = await fetch(`${API_URL}/spy/metrics`);
                    if (costRes.ok) {
                        const costData = await costRes.json();
                        cumulativeCosts = costData.cumulative_costs || null;
                    }
                } catch { /* ignore */ }

                setMetrics({
                    alpha: mData.alpha,
                    beta: mData.beta,
                    step: mData.step,
                    accuracy_history: mData.accuracy_history,
                    cumulative_costs: cumulativeCosts,
                    pool_remaining: mData.pool_remaining,
                    pool_total: mData.pool_total,
                    ece: mData.ece,
                    last_bg_auto_labeled_count: mData.last_bg_auto_labeled_count,
                    auto_label_threshold: mData.auto_label_threshold,
                    cognitive_pacing_active: mData.cognitive_pacing_active,
                    baseline_beta: mData.baseline_beta,
                    custom_labels: mData.custom_labels || ["Negative", "Positive"]
                });
            }

            // 3. Selection Explainer
            const selRes = await fetch(`${API_URL}/spy/selection`);
            if (selRes.ok) {
                const selData = await selRes.json();
                setSelectionLogic(selData);
            }
        } catch (e) {
            console.warn("Polling error in PM Dashboard:", e);
        }
    }, [API_URL]);

    // Setup polling interval
    useEffect(() => {
        pollMetrics();
        const interval = setInterval(pollMetrics, 2000);
        return () => clearInterval(interval);
    }, [pollMetrics]);

    // Trigger Bulk Auto-Labeling
    const handleAutoLabel = async () => {
        if (isAutoLabeling) return;
        setIsAutoLabeling(true);
        try {
            const res = await fetch(`${API_URL}/auto-label`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ labeled_task_ids: [] })
            });
            const data = await res.json();
            if (res.ok && data.status === 'success') {
                setToast({ message: `Successfully auto-labeled and queued ${data.count} tasks!`, type: 'success' });
                pollMetrics();
            } else {
                setToast({ message: `Auto-labeling failed: ${data.message || 'unknown error'}`, type: 'error' });
            }
        } catch (e) {
            setToast({ message: 'Network error during auto-labeling.', type: 'error' });
        } finally {
            setIsAutoLabeling(false);
        }
    };

    // Export Dataset Observations
    const handleExport = async () => {
        try {
            const res = await fetch(`${API_URL}/export`);
            if (!res.ok) throw new Error("Export request failed");
            const data = await res.json();
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `cal_log_observations_${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            setToast({ message: 'Observations exported successfully!', type: 'success' });
        } catch (e) {
            setToast({ message: 'Failed to export observations.', type: 'error' });
        }
    };

    // Reset session with new configuration
    const handleReset = async (e) => {
        e.preventDefault();
        if (isResetting) return;
        setIsResetting(true);
        
        try {
            const parsedLabels = customLabels.split(',').map(l => l.trim()).filter(Boolean);
            
            const payload = {
                datasetName,
                labels: parsedLabels,
                seedType,
                seedCount: parseInt(seedCount, 10),
                roundSize: parseInt(roundSize, 10),
                autoLabelThreshold
            };

            if (datasetName === 'custom' && customTexts.trim()) {
                payload.uploadedTexts = customTexts.split('\n').map(t => t.trim()).filter(Boolean);
            }

            const res = await fetch(`${API_URL}/reset`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setToast({ message: 'Session reconfigured and active learning models reset!', type: 'success' });
                pollMetrics();
            } else {
                const errData = await res.json();
                setToast({ message: `Reset failed: ${errData.message}`, type: 'error' });
            }
        } catch (e) {
            setToast({ message: 'Failed to communicate reset to ML service.', type: 'error' });
        } finally {
            setIsResetting(false);
        }
    };

    // Time saved calculation derived from OLS parameters
    const poolTotal = metrics?.pool_total || 1000;
    const poolRemaining = metrics?.pool_remaining !== undefined ? metrics.pool_remaining : poolTotal;
    const manualCount = metrics?.step || 0;
    const autoPrunedCount = Math.max(0, poolTotal - poolRemaining - manualCount);
    
    const timeSavedSeconds = (() => {
        const beta = metrics?.beta || 3.0;
        const alpha = metrics?.alpha || 5.0;
        if (autoPrunedCount > 0) {
            const avgLogLen = 4.5; // log(90 words) ≈ 4.5
            return autoPrunedCount * Math.max(0.5, alpha + beta * avgLogLen);
        }
        return 0;
    })();

    const timeSavedHours = (timeSavedSeconds / 3600).toFixed(2);
    const dollarsSaved = (timeSavedSeconds / 3600 * 20.0).toFixed(2); // $20/hr average wage

    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl relative text-left">
                    <div className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-6">
                        <div className="w-10 h-10 rounded bg-blue-600 flex items-center justify-center text-white text-md font-black">
                            CAL
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Manager Portal</h2>
                            <p className="text-xs text-slate-500">Authorized Personnel Only</p>
                        </div>
                    </div>
                    
                    <form onSubmit={handleAuthSubmit} className="space-y-4">
                        {authError && (
                            <div className="p-3 bg-rose-950/40 border border-rose-800 rounded text-xs text-rose-300 font-medium">
                                {authError}
                            </div>
                        )}
                        <div className="space-y-1">
                            <label className="text-slate-400 text-xs font-bold block">Enter Manager Password</label>
                            <input 
                                type="password"
                                value={passwordInput}
                                onChange={(e) => setPasswordInput(e.target.value)}
                                placeholder="Default password is admin"
                                className="w-full bg-slate-950 border border-slate-800 p-3 rounded text-slate-300 focus:outline-none focus:border-blue-500 font-mono"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-lg transition"
                        >
                            Authorize & Enter
                        </button>
                    </form>
                </div>
            </div>
        );
    }
    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 md:p-6 pb-12 transition-all duration-300">
            
            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg border shadow-xl flex items-center gap-2 animate-bounce max-w-sm ${
                    toast.type === 'success' 
                        ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300' 
                        : 'bg-rose-950/80 border-rose-500 text-rose-300'
                }`}>
                    <span className="text-sm font-bold">{toast.message}</span>
                </div>
            )}

            {/* Explanation Modal */}
            <SimpleExplanationModal isOpen={showExplanation} onClose={() => setShowExplanation(false)} />

            {/* Header Area */}
            <div className="max-w-7xl mx-auto mb-6 md:mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5 md:pb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                        CAL-Log Control Center
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Configure active parameters, trigger active weak supervision, and audit cognitive workload stats.
                    </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 md:gap-3">
                    <button
                        onClick={() => setShowExplanation(true)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg text-sm font-semibold border border-slate-700 transition"
                    >
                        <HelpCircle size={15} /> Explain Math
                    </button>
                    <button
                        onClick={handleAutoLabel}
                        disabled={isAutoLabeling}
                        className="flex items-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-lg border border-rose-700 transition disabled:opacity-50"
                    >
                        <Brain size={15} className={isAutoLabeling ? "animate-spin" : ""} /> Bulk Auto-Label
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-lg border border-purple-700 transition"
                    >
                        <Download size={15} /> Export
                    </button>
                </div>
            </div>

            {/* ─── TOP KPI GRID: 4 Key Performance Metrics ────────────────── */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                
                {/* 1. Labor & Budget Savings Card */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm flex flex-col justify-between hover:border-emerald-500/30 transition-all duration-300">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Labor & Financial ROI</span>
                        <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg"><DollarSign size={16} /></div>
                    </div>
                    <div className="mt-1">
                        <h2 className="text-2xl md:text-3xl font-black text-white">{dollarsSaved} USD</h2>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            Estimated saved: <span className="text-emerald-400 font-bold">{timeSavedHours}h</span> of manual reading latency.
                        </p>
                    </div>
                </div>

                {/* 2. Annotator Speed & Pacing Card */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm flex flex-col justify-between hover:border-amber-500/30 transition-all duration-300">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Cognitive Load & Pacing</span>
                        <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg"><Activity size={16} /></div>
                    </div>
                    <div className="mt-1">
                        <div className="flex items-center gap-1.5">
                            <span className="relative flex h-2 w-2">
                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${metrics?.cognitive_pacing_active ? "bg-amber-400" : "bg-emerald-400"}`}></span>
                                <span className={`relative inline-flex rounded-full h-2 w-2 ${metrics?.cognitive_pacing_active ? "bg-amber-400" : "bg-emerald-400"}`}></span>
                            </span>
                            <span className="text-sm font-black text-slate-200">
                                {metrics?.cognitive_pacing_active ? "Pacing Active" : "Optimal (Active)"}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1.5">
                            Speed: <span className="font-mono text-white font-bold">{(metrics?.beta || 3.0).toFixed(2)}s</span> (Base: {(metrics?.baseline_beta || 3.0).toFixed(2)}s)
                        </p>
                    </div>
                </div>

                {/* 3. Expected Calibration Error Card */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm flex flex-col justify-between hover:border-blue-500/30 transition-all duration-300">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Calibration Error (ECE)</span>
                        <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg"><ShieldCheck size={16} /></div>
                    </div>
                    <div className="mt-1">
                        <h2 className="text-2xl md:text-3xl font-black text-white">{(metrics?.ece || 0.000).toFixed(3)}</h2>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            Auto-labeling limit: <span className="text-amber-400 font-bold">{metrics?.auto_label_threshold ? (metrics.auto_label_threshold * 100).toFixed(0) + '%' : '95%'}</span>
                        </p>
                    </div>
                </div>

                {/* 4. Active Pruning Efficiency Card */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm flex flex-col justify-between hover:border-purple-500/30 transition-all duration-300">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Workload Reduction</span>
                        <div className="p-1.5 bg-purple-500/10 text-purple-400 rounded-lg"><Layers size={16} /></div>
                    </div>
                    <div className="mt-1">
                        <h2 className="text-2xl md:text-3xl font-black text-white">
                            {Math.round(autoPrunedCount / poolTotal * 100)}% Saved
                        </h2>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            Pruned <span className="text-purple-400 font-bold">{autoPrunedCount}</span> redundant texts out of {poolTotal} pool.
                        </p>
                    </div>
                </div>

            </div>

            {/* Main Dashboard Layout */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* LEFT & CENTER PANELS: Live Performance Monitoring */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Live Progress Bar Widget */}
                    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <Layers size={14} className="text-blue-400" /> Segmented Pool Allocation
                            </h3>
                            <span className="text-xs font-mono font-black text-slate-300">
                                {Math.round(((manualCount + autoPrunedCount) / poolTotal) * 100)}% Total Progress
                            </span>
                        </div>
                        
                        <div className="h-6 bg-slate-950 rounded-full overflow-hidden flex border border-slate-800/50 mb-3 relative">
                            <div 
                                style={{ width: `${(manualCount / poolTotal) * 100}%` }}
                                className="bg-gradient-to-r from-blue-600 to-blue-500 transition-all duration-700"
                                title={`Manual labels: ${manualCount}`}
                            />
                            <div 
                                style={{ width: `${(autoPrunedCount / poolTotal) * 100}%` }}
                                className="bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700"
                                title={`Auto-pruned tasks: ${autoPrunedCount}`}
                            />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className="text-[10px] font-black text-white drop-shadow">
                                    {(manualCount + autoPrunedCount)} / {poolTotal} Tasks Processed
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-center">
                            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-blue-500/10">
                                <p className="text-[9px] text-slate-500 uppercase font-black">Manual Labels</p>
                                <p className="text-lg font-black text-blue-400">{manualCount}</p>
                            </div>
                            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-emerald-500/10">
                                <p className="text-[9px] text-slate-500 uppercase font-black">Auto-Pruned</p>
                                <p className="text-lg font-black text-emerald-400">{autoPrunedCount}</p>
                            </div>
                            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                                <p className="text-[9px] text-slate-500 uppercase font-black">Remaining Pool</p>
                                <p className="text-lg font-black text-slate-400">{poolRemaining}</p>
                            </div>
                        </div>
                    </div>

                    {/* Reviewer FAQ: Collapse & Parameter Diagnostics */}
                    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                            <Info size={14} className="text-blue-400" /> Reviewer Diagnostics: Cognitive Noise & Collapse Safeguards
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl">
                                <h4 className="font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Q1: What happens if the algorithm collapses?
                                </h4>
                                <p className="text-[10px] text-slate-500 leading-relaxed text-left">
                                    If labels get noisy and the model begins to collapse, ECE (Expected Calibration Error) spikes. The system automatically detects this drift and raises the auto-label confidence threshold (up to 99% or suspends it entirely). This locks auto-labeling, requiring human validation.
                                </p>
                            </div>
                            <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl">
                                <h4 className="font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400" /> Q2: Are alpha/beta pre-configured?
                                </h4>
                                <p className="text-[10px] text-slate-500 leading-relaxed text-left">
                                    No. The backend uses online Ordinary Least Squares (OLS) regression to dynamically fit your exact reading speed (&beta;) and setup time (&alpha;) in real time. It automatically calibrates per-annotator within the first 5 manual labels.
                                </p>
                            </div>
                            <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl">
                                <h4 className="font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Q3: How do you handle timing cognitive noise?
                                </h4>
                                <p className="text-[10px] text-slate-500 leading-relaxed text-left">
                                    Reading time varies because of task difficulty (cognitive friction). The OLS residual (actual time minus predicted length-time) measures this cognitive load. If actual speed drops below 1.5x baseline, the system detects fatigue and switches to easy recovery pacing.
                                </p>
                            </div>
                            <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl">
                                <h4 className="font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Q4: How do you handle labeling decision noise?
                                </h4>
                                <p className="text-[10px] text-slate-500 leading-relaxed text-left">
                                    Fatigued users make lazy errors (decision noise). We filter physical outliers (dropping top 20% longest times) to protect the pacing baseline, and use the Human-in-the-Loop double validation queue to verify and clean noisy model auto-labels.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Unified Spy Window Content */}
                    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                            <Activity size={14} className="text-purple-400" /> Active Learning & Ergonomic Diagnostics
                        </h3>
                        <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-850">
                            <SpyAnalysis 
                                selectionLogic={selectionLogic}
                                metrics={metrics}
                                history={history}
                                interactionLog={[]}
                                shadowMetrics={shadowMetrics}
                                onShowAlphaBetaPanel={() => {}}
                                annotationCount={manualCount}
                            />
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL: Project Configuration (Settings Panel) */}
                <div className="space-y-6">
                    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                            <Database size={14} className="text-blue-400" /> Configuration Console
                        </h3>
                        
                        <form onSubmit={handleReset} className="space-y-4 text-xs">
                            
                            {/* Preset Dataset Selection */}
                            <div className="space-y-1">
                                <label className="text-slate-400 font-bold block text-left">Dataset Preset</label>
                                <select 
                                    value={datasetName}
                                    onChange={(e) => setDatasetName(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded text-slate-300 focus:outline-none focus:border-blue-500"
                                >
                                    <option value="imdb">IMDb Movie Reviews (Binary Sentiment)</option>
                                    <option value="rotten_tomatoes">Rotten Tomatoes Movie Snippets</option>
                                    <option value="ag_news">AG News Headings (4 Classes Category)</option>
                                    <option value="custom">Custom Text Upload</option>
                                </select>
                            </div>

                            {/* Class Labels configuration */}
                            <div className="space-y-1">
                                <label className="text-slate-400 font-bold block text-left">Custom Class Labels (Comma Separated)</label>
                                <input 
                                    type="text"
                                    value={customLabels}
                                    onChange={(e) => setClassLabels(e.target.value)}
                                    placeholder="e.g. Negative, Positive"
                                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded text-slate-300 font-mono text-[11px] focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            {/* Custom Text Upload textarea (conditional) */}
                            {datasetName === 'custom' && (
                                <div className="space-y-1 animate-fadeIn">
                                    <label className="text-slate-400 font-bold block text-left">Upload Custom Texts (One Document Per Line)</label>
                                    <textarea 
                                        rows={4}
                                        value={customTexts}
                                        onChange={(e) => setCustomTexts(e.target.value)}
                                        placeholder="Enter texts..."
                                        className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded text-slate-300 font-mono text-[10px] focus:outline-none focus:border-blue-500 custom-scrollbar"
                                    />
                                </div>
                            )}

                            {/* Seeding & Parameters */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-slate-400 font-bold block text-left">Warm seed count</label>
                                    <input 
                                        type="number"
                                        min={2}
                                        max={200}
                                        value={seedCount}
                                        onChange={(e) => setSeedCount(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-slate-300 focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-slate-400 font-bold block text-left">Round size (tasks)</label>
                                    <input 
                                        type="number"
                                        min={5}
                                        max={50}
                                        value={roundSize}
                                        onChange={(e) => setRoundSize(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-slate-300 focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Auto-Label threshold selector */}
                            <div className="space-y-1">
                                <label className="text-slate-400 font-bold block text-left">Auto-Label Threshold Mode</label>
                                <select 
                                    value={autoLabelThreshold}
                                    onChange={(e) => setAutoLabelThreshold(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded text-slate-300 focus:outline-none focus:border-blue-500"
                                >
                                    <option value="dynamic">Dynamic Calibration Tuning (Recommended)</option>
                                    <option value="0.98">Strict 98% Confidence</option>
                                    <option value="0.95">Standard 95% Confidence</option>
                                    <option value="0.90">Relaxed 90% Confidence</option>
                                </select>
                            </div>

                            {/* Reset trigger button */}
                            <button
                                type="submit"
                                disabled={isResetting}
                                className="w-full py-3 mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-lg border border-blue-700 shadow-lg shadow-blue-500/10 flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                            >
                                <RefreshCw size={14} className={isResetting ? "animate-spin" : ""} />
                                {isResetting ? 'Resetting Project...' : 'Re-initialize Project'}
                            </button>
                        </form>
                    </div>

                    {/* Operational Status Box */}
                    <div className="bg-slate-900/20 border border-slate-850 rounded-2xl p-4 text-xs space-y-2 text-slate-400">
                        <h4 className="font-bold text-slate-300 text-left">System Monitoring Status</h4>
                        <div className="flex justify-between items-center py-1 border-b border-slate-850">
                            <span>Backend ML Service</span>
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" /> Running
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-slate-850">
                            <span>Cost Estimator (OLS)</span>
                            <span className="text-blue-400 font-bold">Active</span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-slate-850">
                            <span>Workload Pacer</span>
                            <span className={metrics?.cognitive_pacing_active ? "text-amber-400 font-bold animate-pulse" : "text-emerald-400 font-bold"}>
                                {metrics?.cognitive_pacing_active ? "Recovery Active" : "Optimal"}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                            <span>Dataset Preset</span>
                            <span className="text-slate-300 font-mono font-bold capitalize">
                                {datasetName === 'imdb' ? 'IMDb Sentiment' : datasetName === 'rotten_tomatoes' ? 'Rotten Tomatoes' : datasetName === 'ag_news' ? 'AG News' : 'Custom'}
                            </span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ManagerDashboardPage;
