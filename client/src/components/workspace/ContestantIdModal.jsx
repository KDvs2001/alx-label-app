import React, { useState, useEffect } from 'react';
import { X, User, AlertCircle, ArrowLeft, Upload, Database, Settings, Activity } from 'lucide-react';

/**
 * ContestantIdModal Component (Multi-step Setup Wizard)
 * Handles contestant registration, dataset import (preset or file upload), 
 * label configuration, and active learning seeding options.
 */
const ContestantIdModal = ({ isOpen, onSubmit, onClose }) => {
    const [step, setStep] = useState(1);
    const [contestantId, setContestantId] = useState('');
    const [showResumePrompt, setShowResumePrompt] = useState(false);
    const [isChecking, setIsChecking] = useState(false);
    const [mlReady, setMlReady] = useState(false);
    const [warmupAttempts, setWarmupAttempts] = useState(0);

    // Step 2: Dataset Configuration
    const [datasetSource, setDatasetSource] = useState('imdb'); // 'imdb', 'rotten_tomatoes', 'ag_news', 'custom'
    const [classLabels, setClassLabels] = useState('Negative, Positive');
    const [customFile, setCustomFile] = useState(null);
    const [customTexts, setCustomTexts] = useState([]);
    const [fileError, setFileError] = useState('');

    // Step 3: Seeding Configuration
    const [seedType, setSeedType] = useState('unlabeled'); // 'unlabeled', 'labeled_seed'
    const [seedCount, setSeedCount] = useState(10);

    // Warmup polling
    useEffect(() => {
        if (!isOpen || mlReady) return;
        const API_URL = import.meta.env.VITE_ML_API_URL || "/ml";
        let cancelled = false;

        const pollWarmup = async () => {
            while (!cancelled) {
                try {
                    const res = await fetch(`${API_URL}/health`, { signal: AbortSignal.timeout(15000) });
                    if (res.ok && !cancelled) {
                        setMlReady(true);
                        return;
                    }
                } catch {
                    // Space warming
                }
                if (!cancelled) {
                    setWarmupAttempts(prev => prev + 1);
                    await new Promise(r => setTimeout(r, 5000));
                }
            }
        };
        pollWarmup();
        return () => { cancelled = true; };
    }, [isOpen, mlReady]);

    if (!isOpen) return null;

    // Check if contestant ID already exists (DB lookup)
    const handleCheckContestant = async (e) => {
        e.preventDefault();
        if (!contestantId.trim() || isChecking) return;

        setIsChecking(true);
        try {
            const SERVER_URL = (import.meta.env.VITE_SERVER_URL || "").replace(/\/$/, "");
            const response = await fetch(`${SERVER_URL}/api/session/load/${contestantId}`);
            const data = await response.json();

            setIsChecking(false);
            if (data.exists) {
                setShowResumePrompt(true);
            } else {
                setStep(2); // Go to dataset config
            }
        } catch (error) {
            console.error('Error checking session:', error);
            setIsChecking(false);
            setStep(2); // Proceed to dataset config
        }
    };

    const handleResume = () => {
        onSubmit(contestantId, 'resume', null);
    };

    const handleFresh = () => {
        sessionStorage.clear();
        localStorage.removeItem('cal_log_tour_seen');
        setStep(2);
        setShowResumePrompt(false);
    };

    // Client-side file reader (reads CSV or JSON)
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setCustomFile(file);
        setFileError('');

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const content = event.target.result;
                let parsedTexts = [];
                if (file.name.endsWith('.json')) {
                    const data = JSON.parse(content);
                    parsedTexts = Array.isArray(data) 
                        ? data.map(item => item.text || item.content || item.data?.text || String(item))
                        : [];
                } else if (file.name.endsWith('.csv')) {
                    // Quick-and-dirty CSV parser
                    const lines = content.split('\n');
                    parsedTexts = lines
                        .map(line => line.trim().replace(/^"|"$/g, ''))
                        .filter(line => line.length > 5);
                } else {
                    throw new Error('Unsupported format. Please upload .json or .csv');
                }

                if (parsedTexts.length === 0) {
                    throw new Error('No valid text items found in the file.');
                }
                setCustomTexts(parsedTexts);
            } catch (err) {
                setFileError(err.message || 'Error parsing file.');
                setCustomTexts([]);
            }
        };
        reader.readAsText(file);
    };

    const handleLaunch = () => {
        // Collect configuration
        const config = {
            datasetName: datasetSource,
            labels: classLabels.split(',').map(l => l.trim()).filter(l => l.length > 0),
            seedType,
            seedCount: seedType === 'labeled_seed' ? seedCount : 0,
            uploadedTexts: datasetSource === 'custom' ? customTexts : null
        };
        onSubmit(contestantId, 'fresh', config);
    };

    // 1. Resume Prompt Overlay
    if (showResumePrompt) {
        return (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-md">
                <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
                    <div className="flex items-center gap-3 mb-6">
                        <AlertCircle className="text-blue-400" size={28} />
                        <h2 className="text-2xl font-bold text-white">Existing Session</h2>
                    </div>
                    <p className="text-slate-300 mb-6">
                        We found saved data for contestant <span className="font-bold text-blue-400">{contestantId}</span>.
                        Would you like to resume your previous run or overwrite it and start a new setup?
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={handleResume}
                            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all"
                        >
                            Resume Session
                        </button>
                        <button
                            onClick={handleFresh}
                            className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl border border-slate-700 transition-all"
                        >
                            Start New Setup
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-md overflow-y-auto py-8">
            <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl relative my-auto">
                
                {/* Close Button */}
                <button 
                    onClick={() => { setStep(1); onClose && onClose(); }}
                    className="absolute top-6 right-6 text-slate-400 hover:text-white transition"
                >
                    <X size={20} />
                </button>

                {/* Progress Indicators */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    <div className={`h-2 w-12 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-blue-500' : 'bg-slate-700'}`} />
                    <div className={`h-2 w-12 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-blue-500' : 'bg-slate-700'}`} />
                    <div className={`h-2 w-12 rounded-full transition-all duration-300 ${step >= 3 ? 'bg-blue-500' : 'bg-slate-700'}`} />
                </div>

                {/* STEP 1: Identification */}
                {step === 1 && (
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <User className="text-blue-400" size={28} />
                            <h2 className="text-2xl font-bold text-white text-left">Get Started</h2>
                        </div>
                        <p className="text-sm text-slate-400 mb-6 text-left">
                            Please enter your Contestant ID or researcher identifier to begin tracking your cognitive modeling metrics.
                        </p>
                        <form onSubmit={handleCheckContestant}>
                            <div className="mb-6 text-left">
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                    Contestant ID
                                </label>
                                <input
                                    type="text"
                                    value={contestantId}
                                    onChange={(e) => setContestantId(e.target.value)}
                                    placeholder="e.g., CONTESTANT001"
                                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                                    autoFocus
                                    required
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => window.location.href = '/'}
                                    className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2"
                                >
                                    <ArrowLeft size={16} /> Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={isChecking}
                                    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-700/50 text-white font-bold rounded-xl transition-all"
                                >
                                    {isChecking ? 'Checking...' : 'Continue'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* STEP 2: Dataset Configuration */}
                {step === 2 && (
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <Database className="text-blue-400" size={28} />
                            <h2 className="text-2xl font-bold text-white text-left">Configure Dataset</h2>
                        </div>

                        <div className="mb-5 text-left">
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                Dataset Source
                            </label>
                            <select
                                value={datasetSource}
                                onChange={(e) => setDatasetSource(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500 transition"
                            >
                                <option value="imdb">IMDB Movie Reviews (Sentiment Analysis)</option>
                                <option value="rotten_tomatoes">Rotten Tomatoes (Critics Choice)</option>
                                <option value="ag_news">AG News (Categorical News Classification)</option>
                                <option value="custom">Upload custom CSV / JSON dataset file</option>
                            </select>
                        </div>

                        {datasetSource === 'custom' && (
                            <div className="mb-5 text-left">
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                    Upload Dataset File
                                </label>
                                <div className="border-2 border-dashed border-slate-700 hover:border-slate-500 rounded-xl p-6 text-center transition-all bg-slate-800/40 relative cursor-pointer">
                                    <input
                                        type="file"
                                        accept=".json,.csv"
                                        onChange={handleFileUpload}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                    <Upload className="text-slate-400 mx-auto mb-2" size={24} />
                                    <p className="text-sm font-medium text-slate-300">
                                        {customFile ? customFile.name : 'Click or Drag & Drop .csv or .json file'}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        JSON should be a flat list of strings. CSV should contain text strings.
                                    </p>
                                </div>
                                {fileError && <p className="text-xs text-rose-400 mt-1">{fileError}</p>}
                                {customTexts.length > 0 && (
                                    <p className="text-xs text-green-400 mt-1">✓ Parsed {customTexts.length} texts successfully.</p>
                                )}
                            </div>
                        )}

                        <div className="mb-6 text-left">
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                Class Labels (Comma Separated)
                            </label>
                            <input
                                type="text"
                                value={classLabels}
                                onChange={(e) => setClassLabels(e.target.value)}
                                placeholder="Negative, Positive"
                                className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500 transition"
                            />
                            <p className="text-[10px] text-slate-500 mt-1">
                                Configure the options your annotator will choose.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setStep(1)}
                                className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2"
                            >
                                <ArrowLeft size={16} /> Back
                            </button>
                            <button
                                onClick={() => setStep(3)}
                                disabled={datasetSource === 'custom' && customTexts.length === 0}
                                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-700/50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all"
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 3: Seeding & Active Learning Launch */}
                {step === 3 && (
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <Settings className="text-blue-400" size={28} />
                            <h2 className="text-2xl font-bold text-white text-left">Active Learning Seeding</h2>
                        </div>

                        <div className="mb-6 text-left">
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                                Initial Labeled Points Option
                            </label>
                            
                            <div className="flex flex-col gap-3">
                                <label className={`flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                                    seedType === 'unlabeled' ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 bg-slate-800/40 hover:bg-slate-800'
                                }`}>
                                    <input 
                                        type="radio" 
                                        name="seedType" 
                                        value="unlabeled"
                                        checked={seedType === 'unlabeled'}
                                        onChange={() => setSeedType('unlabeled')}
                                        className="mt-1"
                                    />
                                    <div>
                                        <p className="text-sm font-semibold text-white">Start from Scratch (Fully Unlabeled)</p>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            The model is empty. It queries completely randomly to start bootstrapping the active learning cycle.
                                        </p>
                                    </div>
                                </label>

                                <label className={`flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                                    seedType === 'labeled_seed' ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 bg-slate-800/40 hover:bg-slate-800'
                                }`}>
                                    <input 
                                        type="radio" 
                                        name="seedType" 
                                        value="labeled_seed"
                                        checked={seedType === 'labeled_seed'}
                                        onChange={() => setSeedType('labeled_seed')}
                                        className="mt-1"
                                    />
                                    <div>
                                        <p className="text-sm font-semibold text-white">Import Small Labeled Seed Set</p>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            Pre-train models on a random subset of labeled data points to give the active learning engine a warm start.
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {seedType === 'labeled_seed' && (
                            <div className="mb-6 text-left animate-fadeIn">
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                    Number of Labeled Seed Points
                                </label>
                                <input
                                    type="number"
                                    min="5"
                                    max="50"
                                    value={seedCount}
                                    onChange={(e) => setSeedCount(Number(e.target.value))}
                                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500 transition"
                                />
                                <p className="text-[10px] text-slate-500 mt-1">
                                    Values between 5 and 50 are recommended to seed the classification boundary.
                                </p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => setStep(2)}
                                className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2"
                            >
                                <ArrowLeft size={16} /> Back
                            </button>
                            <button
                                onClick={handleLaunch}
                                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                            >
                                <Activity size={16} /> Launch Session
                            </button>
                        </div>
                    </div>
                )}

                {/* Footer and Connection Status */}
                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
                    <span>Progress will auto-save</span>
                    <div className={`flex items-center gap-1.5 font-medium ${mlReady ? 'text-green-500' : 'text-amber-500 animate-pulse'}`}>
                        <div className={`w-2 h-2 rounded-full ${mlReady ? 'bg-green-500' : 'bg-amber-500'}`} />
                        <span>{mlReady ? 'ML Core Connected' : `Connecting... (${warmupAttempts})`}</span>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ContestantIdModal;
