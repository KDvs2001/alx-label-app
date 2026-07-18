import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
    Activity, Brain, Clock, DollarSign, Database, Download, 
    RefreshCw, Layers, ShieldCheck, TrendingUp, Info, HelpCircle, User, ArrowLeft,
    FolderOpen, Users, BarChart2, CheckCircle2, ArrowRight, Pause, Play, X
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
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'roi' | 'pacing' | 'calibration' | 'pruning'

    // Reset Configuration Form State
    const [datasetName, setDatasetName] = useState('imdb'); // imdb, rotten_tomatoes, ag_news, custom
    const [customLabels, setCustomLabels] = useState('Negative, Positive');
    const [seedType, setSeedType] = useState('unlabeled'); // unlabeled, labeled_seed
    const [seedCount, setSeedCount] = useState(10);
    const [roundSize, setRoundSize] = useState(10);
    const [autoLabelThreshold, setAutoLabelThreshold] = useState('dynamic');
    const [customTexts, setCustomTexts] = useState('');

    // Project overview state
    const SERVER_URL = (import.meta.env.VITE_SERVER_URL || '').replace(/\/$/, '');
    const [projectStats, setProjectStats] = useState([]);
    const [loadingProjects, setLoadingProjects] = useState(false);

    const fetchProjectStats = useCallback(async () => {
        setLoadingProjects(true);
        try {
            const res = await fetch(`${SERVER_URL}/api/projects/stats/all`);
            if (res.ok) {
                const data = await res.json();
                setProjectStats(Array.isArray(data) ? data : []);
            }
        } catch (e) {
            console.error('Failed to fetch project stats:', e);
        } finally {
            setLoadingProjects(false);
        }
    }, [SERVER_URL]);

    useEffect(() => { fetchProjectStats(); }, [fetchProjectStats]);

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
            {/* ─── SIDEBAR & VIEWPORT LAYOUT ────────────────────────────── */}
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 mt-4 w-full h-[calc(100vh-230px)] min-h-[580px] items-stretch">
                
                {/* FLOATING SIDEBAR NAVIGATION (NOT TOUCHING EDGE OF BROWSER SCREEN) */}
                <div className="w-full lg:w-72 shrink-0 flex flex-col justify-between bg-slate-900/40 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm h-full select-none">
                    <div className="space-y-1.5 w-full">
                        <span className="text-[10px] uppercase tracking-widest font-black text-slate-500 px-2 block mb-4">
                            Control Console
                        </span>
                        
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold text-left transition-all duration-200 outline-none ${
                                activeTab === 'overview'
                                    ? 'bg-blue-600/90 text-white shadow-lg shadow-blue-500/10 border border-blue-500/20'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800/45 border border-transparent'
                            }`}
                        >
                            <FolderOpen size={14} /> Overview & Campaigns
                        </button>
                        
                        <button
                            onClick={() => setActiveTab('roi')}
                            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold text-left transition-all duration-200 outline-none ${
                                activeTab === 'roi'
                                    ? 'bg-emerald-600/90 text-white shadow-lg shadow-emerald-500/10 border border-emerald-500/20'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800/45 border border-transparent'
                            }`}
                        >
                            <DollarSign size={14} /> Labor & Financial ROI
                        </button>
                        
                        <button
                            onClick={() => setActiveTab('pacing')}
                            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold text-left transition-all duration-200 outline-none ${
                                activeTab === 'pacing'
                                    ? 'bg-amber-600/90 text-white shadow-lg shadow-amber-500/10 border border-amber-500/20'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800/45 border border-transparent'
                            }`}
                        >
                            <Activity size={14} /> Cognitive Load & Pacing
                        </button>
                        
                        <button
                            onClick={() => setActiveTab('calibration')}
                            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold text-left transition-all duration-200 outline-none ${
                                activeTab === 'calibration'
                                    ? 'bg-blue-600/90 text-white shadow-lg shadow-blue-500/10 border border-blue-500/20'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800/45 border border-transparent'
                            }`}
                        >
                            <ShieldCheck size={14} /> Model Calibration
                        </button>
                        
                        <button
                            onClick={() => setActiveTab('pruning')}
                            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold text-left transition-all duration-200 outline-none ${
                                activeTab === 'pruning'
                                    ? 'bg-purple-600/90 text-white shadow-lg shadow-purple-500/10 border border-purple-500/20'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800/45 border border-transparent'
                            }`}
                        >
                            <Brain size={14} /> Supervision & Pruning
                        </button>
                    </div>

                    <div className="hidden lg:block border-t border-slate-800/60 pt-4 text-[10px] text-slate-500 leading-relaxed text-left">
                        <span className="font-bold text-slate-400 block mb-1.5">Documentation shortcuts</span>
                        VPC stands for Variable Pacing Control. WCAG refers to Web Content Accessibility Guidelines. OLS stands for Ordinary Least Squares regression, used here to isolate annotator fatigue.
                    </div>
                </div>

                {/* MAIN CONTENT VIEWPORT */}
                <div className="flex-1 min-w-0 w-full h-full overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-6">
                    
                    {/* VIEWPORT: OVERVIEW & PROJECTS LIST */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6 w-full animate-fadeIn">
                            
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                                {/* 1. Labor & Budget Savings Card */}
                                <button 
                                    onClick={() => setActiveTab('roi')}
                                    className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 hover:border-emerald-500/50 hover:bg-slate-800/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/5 active:scale-98 transition-all duration-300 text-left outline-none"
                                >
                                    <div className="flex justify-between items-start mb-2 w-full">
                                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Labor & Financial ROI</span>
                                        <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg"><DollarSign size={14} /></div>
                                    </div>
                                    <div className="mt-1">
                                        <h2 className="text-xl md:text-2xl font-black text-white">{dollarsSaved} USD</h2>
                                        <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                                            Saved: <span className="text-emerald-400 font-bold">{timeSavedHours}h</span> of manual latency.
                                        </p>
                                    </div>
                                </button>
                                
                                {/* 2. Annotator Speed & Pacing Card */}
                                <button 
                                    onClick={() => setActiveTab('pacing')}
                                    className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 hover:border-amber-500/50 hover:bg-slate-800/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-500/5 active:scale-98 transition-all duration-300 text-left outline-none"
                                >
                                     <div className="flex justify-between items-start mb-2 w-full">
                                         <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Cognitive Load & Pacing</span>
                                         <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg"><Activity size={14} /></div>
                                     </div>
                                     <div className="mt-1">
                                         <div className="flex items-center gap-1.5">
                                             <span className="relative flex h-1.5 w-1.5">
                                                 <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${metrics?.cognitive_pacing_active ? "bg-amber-400" : "bg-emerald-400"}`}></span>
                                                 <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${metrics?.cognitive_pacing_active ? "bg-amber-400" : "bg-emerald-400"}`}></span>
                                             </span>
                                             <span className="text-xs font-bold text-slate-200">
                                                 {metrics?.cognitive_pacing_active ? "Pacing Active" : "Optimal (Active)"}
                                             </span>
                                         </div>
                                         <p className="text-[10px] text-slate-500 mt-1">
                                             Speed: <span className="font-mono text-white font-bold">{(metrics?.beta || 3.0).toFixed(2)}s/wd</span>
                                         </p>
                                     </div>
                                </button>

                                {/* 3. Expected Calibration Error Card */}
                                <button 
                                    onClick={() => setActiveTab('calibration')}
                                    className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 hover:border-blue-500/50 hover:bg-slate-800/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/5 active:scale-98 transition-all duration-300 text-left outline-none"
                                >
                                     <div className="flex justify-between items-start mb-2 w-full">
                                         <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Calibration Error (ECE)</span>
                                         <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg"><ShieldCheck size={14} /></div>
                                     </div>
                                     <div className="mt-1">
                                         <h2 className="text-xl md:text-2xl font-black text-white">{(metrics?.ece || 0.000).toFixed(3)}</h2>
                                         <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                                             Limit: <span className="text-blue-400 font-bold">{metrics?.auto_label_threshold ? (metrics.auto_label_threshold * 100).toFixed(0) + '%' : '95%'}</span>
                                         </p>
                                     </div>
                                </button>

                                {/* 4. Active Pruning Efficiency Card */}
                                <button 
                                    onClick={() => setActiveTab('pruning')}
                                    className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 hover:border-purple-500/50 hover:bg-slate-800/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/5 active:scale-98 transition-all duration-300 text-left outline-none"
                                >
                                     <div className="flex justify-between items-start mb-2 w-full">
                                         <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Workload Reduction</span>
                                         <div className="p-1.5 bg-purple-500/10 text-purple-400 rounded-lg"><Layers size={14} /></div>
                                     </div>
                                     <div className="mt-1">
                                         <h2 className="text-xl md:text-2xl font-black text-white">
                                             {Math.round(autoPrunedCount / poolTotal * 100)}% Saved
                                         </h2>
                                         <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                                             Pruned <span className="text-purple-400 font-bold">{autoPrunedCount}</span> redundant texts.
                                         </p>
                                     </div>
                                </button>
                            </div>

                            {/* Active Campaigns list */}
                            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm">
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-purple-500/10 rounded-lg">
                                            <FolderOpen size={15} className="text-purple-400" />
                                        </div>
                                        <h3 className="font-bold text-white text-sm">Campaigns List & Annotator Performance</h3>
                                        <span className="text-xs text-slate-500 font-semibold">({projectStats.length} active)</span>
                                    </div>
                                    <button
                                        onClick={fetchProjectStats}
                                        className="p-1.5 hover:bg-slate-700 rounded-lg transition text-slate-400 hover:text-white"
                                    >
                                        <RefreshCw size={13} className={loadingProjects ? 'animate-spin' : ''} />
                                    </button>
                                </div>

                                {loadingProjects ? (
                                    <div className="space-y-2">
                                        {[1,2].map(i => <div key={i} className="h-14 bg-slate-800/60 rounded-xl animate-pulse" />)}
                                    </div>
                                ) : projectStats.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-8 text-slate-600 gap-1">
                                        <FolderOpen size={24} strokeWidth={1.3} />
                                        <p className="text-xs font-semibold">No campaigns configured yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {projectStats.map(p => {
                                            const pct = p.total > 0 ? Math.round((p.labeled / p.total) * 100) : 0;
                                            const statusColor = {
                                                active: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                                                paused: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
                                                completed: 'text-blue-400 bg-blue-500/10 border-blue-500/20'
                                            }[p.status] || 'text-slate-400 bg-slate-700 border-slate-600';

                                            return (
                                                <div key={p.projectId} className="flex flex-col gap-3 p-4 bg-slate-950/40 border border-slate-800/60 rounded-xl hover:border-slate-750 transition">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                                <span className="font-bold text-white text-sm">{p.name}</span>
                                                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${statusColor}`}>{p.status}</span>
                                                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                                                    <Users size={11} /> {p.annotatorCount} Annotator{p.annotatorCount !== 1 && 's'}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex-1 bg-slate-850 rounded-full h-1.5 overflow-hidden">
                                                                    <div
                                                                        className="h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500"
                                                                        style={{ width: `${pct}%` }}
                                                                    />
                                                                </div>
                                                                <span className="text-xs font-bold text-slate-400 whitespace-nowrap">{p.labeled}/{p.total} ({pct}%)</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {p.annotators && p.annotators.length > 0 && (
                                                        <div className="mt-1 pt-3 border-t border-slate-800/40">
                                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Engaged Annotators</span>
                                                            <div className="grid grid-cols-1 gap-2">
                                                                {p.annotators.map(annotator => (
                                                                    <div key={annotator.username} className="flex items-center justify-between p-3 bg-slate-900 rounded-lg border border-slate-800">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-black uppercase">
                                                                                {annotator.username.charAt(0)}
                                                                            </div>
                                                                            <div className="flex flex-col">
                                                                                <span className="text-xs font-bold text-slate-300 capitalize flex items-center gap-1.5">
                                                                                    {annotator.username}
                                                                                    <span className="text-[8px] px-1.5 py-0.2 bg-slate-800 text-slate-400 border border-slate-700 rounded">{annotator.readingStyle}</span>
                                                                                </span>
                                                                                <span className="text-[9px] text-slate-500 font-mono">
                                                                                    Speed: {annotator.baselineSpeed > 0 ? annotator.baselineSpeed.toFixed(2) : '--'}s/word
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center gap-5 text-right">
                                                                            <div>
                                                                                <span className="text-[8px] uppercase font-bold text-slate-500 block">Labels</span>
                                                                                <span className="text-xs font-black text-blue-400">{annotator.labeled}</span>
                                                                            </div>
                                                                            <div>
                                                                                <span className="text-[8px] uppercase font-bold text-slate-500 block">Accuracy</span>
                                                                                <span className="text-xs font-black text-emerald-400">{annotator.accuracy}%</span>
                                                                            </div>
                                                                            <div>
                                                                                <span className="text-[8px] uppercase font-bold text-slate-500 block">Saved Time</span>
                                                                                <span className="text-xs font-black text-purple-400">~{Math.round(annotator.timeSaved)}s</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* VIEWPORT: LABOR & FINANCIAL ROI PANEL */}
                    {activeTab === 'roi' && (
                        <div className="space-y-6 w-full animate-fadeIn text-left">
                            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-4">
                                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                                    <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg"><DollarSign size={16} /></div>
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Labor & Budget ROI Diagnostics</h3>
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    CAL-Log cuts database labeling expenses by selecting the most informative elements for human validation. Outlier confidence predictions are verified in the background, minimizing cost scaling from linear complexity.
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                                        <span className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Financial Return</span>
                                        <span className="text-2xl font-black text-emerald-400">{dollarsSaved} USD</span>
                                    </div>
                                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                                        <span className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Estimated Hours Reclaimed</span>
                                        <span className="text-2xl font-black text-white">{timeSavedHours} Hours</span>
                                    </div>
                                </div>
                                <div className="p-3.5 bg-slate-950/40 border border-slate-800 rounded-xl">
                                    <h4 className="font-bold text-xs text-white uppercase mb-1">Ergonomic Budget Formula</h4>
                                    <p className="text-[10px] text-slate-500 leading-relaxed">
                                        Calculated based on an average wage rate of <span className="text-slate-300 font-bold">$20.00/hour</span>. CAL-Log reduces this latency by routing clear predictions directly into the database observations.
                                    </p>
                                </div>
                            </div>

                            {/* Cost Curve Graph from SpyAnalysis */}
                            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                    <Activity size={14} className="text-emerald-400" /> Live ROI & Comparative Performance Curves
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
                    )}

                    {/* VIEWPORT: COGNITIVE LOAD & PACING */}
                    {activeTab === 'pacing' && (
                        <div className="space-y-6 w-full animate-fadeIn text-left">
                            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-4">
                                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                                    <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg"><Activity size={16} /></div>
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Cognitive Load & Pacing Diagnostics</h3>
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Online Ordinary Least Squares (OLS) regression calculates keyboard and scroll latency residuals to model annotator fatigue. Pacing dynamically routes simpler tasks when fatigue is detected, preventing decision errors.
                                </p>
                                <div className="grid grid-cols-3 gap-3 text-center">
                                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                                        <span className="text-[9px] font-bold text-slate-500 uppercase block">Current Speed</span>
                                        <span className="text-lg font-black text-white">{(metrics?.beta || 3.0).toFixed(2)}s/wd</span>
                                    </div>
                                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                                        <span className="text-[9px] font-bold text-slate-500 uppercase block">Baseline Speed</span>
                                        <span className="text-lg font-black text-slate-400">{(metrics?.baseline_beta || 3.0).toFixed(2)}s/wd</span>
                                    </div>
                                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                                        <span className="text-[9px] font-bold text-slate-500 uppercase block">Pacing Status</span>
                                        <span className={`text-xs font-black block mt-1.5 ${metrics?.cognitive_pacing_active ? 'text-amber-400 animate-pulse' : 'text-emerald-400'}`}>
                                            {metrics?.cognitive_pacing_active ? 'Fatigue Mode' : 'Optimal'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Ergonomic Diagnostics FAQ</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                    <div className="p-3.5 bg-slate-950/40 border border-slate-800 rounded-xl">
                                        <h4 className="font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Timing Cognitive Noise
                                        </h4>
                                        <p className="text-[10px] text-slate-500 leading-relaxed text-left">
                                            Reading time varies because of task difficulty. The OLS residual measures this cognitive load. If actual speed drops below 1.5x baseline, the system detects fatigue and switches to easy recovery pacing.
                                        </p>
                                    </div>
                                    <div className="p-3.5 bg-slate-950/40 border border-slate-800 rounded-xl">
                                        <h4 className="font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Decision Noise Filtering
                                        </h4>
                                        <p className="text-[10px] text-slate-500 leading-relaxed text-left">
                                            Fatigued users make lazy errors. We filter physical outliers (dropping top 20% longest times) to protect the baseline, and use the double-validation queue to clean model auto-labels.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* VIEWPORT: MODEL CALIBRATION */}
                    {activeTab === 'calibration' && (
                        <div className="space-y-6 w-full animate-fadeIn text-left">
                            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-4">
                                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                                    <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg"><ShieldCheck size={16} /></div>
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Model Calibration & Safeguards</h3>
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Calibration verification computes Expected Calibration Error (ECE) on validation sets to ensure the model's confidence scores correspond to its actual correctness, preventing target-concept drift.
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                                        <span className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Validation Error (ECE)</span>
                                        <span className="text-2xl font-black text-blue-400">{(metrics?.ece || 0.000).toFixed(3)}</span>
                                    </div>
                                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                                        <span className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Auto-Label Threshold</span>
                                        <span className="text-2xl font-black text-white">{metrics?.auto_label_threshold ? (metrics.auto_label_threshold * 100).toFixed(0) + '%' : '95%'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Model Reliability FAQ</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                    <div className="p-3.5 bg-slate-950/40 border border-slate-800 rounded-xl">
                                        <h4 className="font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Safeguard against model collapse
                                        </h4>
                                        <p className="text-[10px] text-slate-500 leading-relaxed text-left">
                                            If labels get noisy and the model begins to collapse, ECE spikes. The system automatically detects this drift and raises the auto-label confidence threshold to block auto-labeling.
                                        </p>
                                    </div>
                                    <div className="p-3.5 bg-slate-950/40 border border-slate-800 rounded-xl">
                                        <h4 className="font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" /> Online Parameter Scaling
                                        </h4>
                                        <p className="text-[10px] text-slate-500 leading-relaxed text-left">
                                            The backend uses online OLS regression to fit your exact reading speed (beta) and setup time (alpha) in real time. It automatically calibrates within the first 5 manual labels.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* VIEWPORT: SUPERVISION & PRUNING */}
                    {activeTab === 'pruning' && (
                        <div className="space-y-6 w-full animate-fadeIn text-left">
                            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-4">
                                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                                    <div className="p-1.5 bg-purple-500/10 text-purple-400 rounded-lg"><Brain size={16} /></div>
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Supervision & Active Pruning Console</h3>
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Consensus-based active pruning uses the local SLM committee (Llama-3, Mistral, Phi-3) to filter high-confidence agreements. Only disagreed edge cases require human tie-breaker annotations.
                                </p>
                                
                                {/* Segmented progress bar */}
                                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[9px] font-bold uppercase text-slate-500">Segmented Pool Allocation</span>
                                        <span className="text-xs font-mono font-black text-slate-300">
                                            {Math.round(((manualCount + autoPrunedCount) / poolTotal) * 100)}% Total Progress
                                        </span>
                                    </div>
                                    <div className="h-4 bg-slate-900 rounded-full overflow-hidden flex border border-slate-855 mb-3 relative">
                                        <div 
                                            style={{ width: `${(manualCount / poolTotal) * 100}%` }}
                                            className="bg-gradient-to-r from-blue-600 to-blue-500 transition-all duration-700"
                                        />
                                        <div 
                                            style={{ width: `${(autoPrunedCount / poolTotal) * 100}%` }}
                                            className="bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700"
                                        />
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                        <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                                            <p className="text-[8px] text-slate-500 uppercase">Manual</p>
                                            <p className="text-base font-black text-blue-400">{manualCount}</p>
                                        </div>
                                        <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                                            <p className="text-[8px] text-slate-500 uppercase">Auto-Pruned</p>
                                            <p className="text-base font-black text-emerald-400">{autoPrunedCount}</p>
                                        </div>
                                        <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                                            <p className="text-[8px] text-slate-500 uppercase">Remaining</p>
                                            <p className="text-base font-black text-slate-400">{poolRemaining}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleAutoLabel}
                                        disabled={isAutoLabeling}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition disabled:opacity-50 text-xs"
                                    >
                                        <Brain size={13} className={isAutoLabeling ? "animate-spin" : ""} /> Bulk Auto-Label Pool
                                    </button>
                                    <button
                                        onClick={handleExport}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-purple-400 rounded-xl font-bold border border-slate-750 transition text-xs"
                                    >
                                        <Download size={13} /> Export Observations
                                    </button>
                                </div>
                            </div>

                            {/* Configuration Console form */}
                            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-4">
                                <h4 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-3">
                                    <Database size={14} className="text-blue-400" /> Reset & Active Parameters Configuration
                                </h4>
                                <form onSubmit={handleReset} className="space-y-4 text-xs">
                                    <div className="space-y-1">
                                        <label className="text-slate-400 font-bold block">Dataset Preset</label>
                                        <select 
                                            value={datasetName}
                                            onChange={(e) => setDatasetName(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded text-slate-300 focus:outline-none"
                                        >
                                            <option value="imdb">IMDb Movie Reviews (Binary Sentiment)</option>
                                            <option value="rotten_tomatoes">Rotten Tomatoes Movie Snippets</option>
                                            <option value="ag_news">AG News Headings (4 Classes Category)</option>
                                            <option value="custom">Custom Text Upload</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-slate-400 font-bold block">Custom Class Labels (Comma Separated)</label>
                                        <input 
                                            type="text"
                                            value={customLabels}
                                            onChange={(e) => setClassLabels(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-855 p-2.5 rounded text-slate-300 font-mono text-[10px]"
                                        />
                                    </div>

                                    {datasetName === 'custom' && (
                                        <div className="space-y-1">
                                            <label className="text-slate-400 font-bold block">Upload Custom Texts (One Document Per Line)</label>
                                            <textarea 
                                                rows={3}
                                                value={customTexts}
                                                onChange={(e) => setCustomTexts(e.target.value)}
                                                className="w-full bg-slate-950 border border-slate-855 p-2.5 rounded text-slate-300 font-mono text-[9px]"
                                            />
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-slate-400 font-bold block">Warm Seed Count</label>
                                            <input 
                                                type="number"
                                                value={seedCount}
                                                onChange={(e) => setSeedCount(e.target.value)}
                                                className="w-full bg-slate-950 border border-slate-855 p-2 rounded text-slate-300"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-slate-400 font-bold block">Round Size (Tasks)</label>
                                            <input 
                                                type="number"
                                                value={roundSize}
                                                onChange={(e) => setRoundSize(e.target.value)}
                                                className="w-full bg-slate-950 border border-slate-855 p-2 rounded text-slate-300"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-slate-400 font-bold block">Auto-Label Threshold Mode</label>
                                        <select 
                                            value={autoLabelThreshold}
                                            onChange={(e) => setAutoLabelThreshold(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-855 p-2.5 rounded text-slate-300 focus:outline-none"
                                        >
                                            <option value="dynamic">Dynamic Calibration Tuning (Recommended)</option>
                                            <option value="0.98">Strict 98% Confidence</option>
                                            <option value="0.95">Standard 95% Confidence</option>
                                            <option value="0.90">Relaxed 90% Confidence</option>
                                        </select>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isResetting}
                                        className="w-full py-3 mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-lg flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                                    >
                                        <RefreshCw size={13} className={isResetting ? "animate-spin" : ""} />
                                        {isResetting ? 'Resetting Project...' : 'Re-initialize Project'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManagerDashboardPage;
