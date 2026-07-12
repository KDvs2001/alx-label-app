import React from 'react';
import { X, Brain, ShieldAlert, Zap, Clock, HelpCircle, Activity } from 'lucide-react';

/**
 * SimpleExplanationModal Component
 * Explains complex active learning and pacing concepts using simple, real-world analogies
 * to help non-technical users, evaluators, and judges understand the innovation.
 */
const SimpleExplanationModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] flex flex-col gap-6 shadow-2xl relative overflow-hidden text-left">
                
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
                    title="Close guide"
                >
                    <X size={20} />
                </button>

                {/* Header */}
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                    <HelpCircle className="text-blue-400" size={24} />
                    <div>
                        <h2 className="text-xl font-bold text-white">How CAL-Log Works</h2>
                        <p className="text-xs text-slate-400">A plain-English guide to our core innovations</p>
                    </div>
                </div>

                {/* Scrollable Explanations Grid */}
                <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-5 custom-scrollbar text-sm text-slate-300">
                    
                    {/* 1. Core Problem Card */}
                    <div className="bg-blue-950/20 border border-blue-500/20 rounded-xl p-4">
                        <h3 className="font-bold text-blue-300 mb-1.5 flex items-center gap-2">
                            <Clock size={16} /> The Multi-Billion Dollar AI Problem
                        </h3>
                        <p className="text-xs text-slate-300 leading-relaxed">
                            AI models require millions of human annotations (e.g. labeling text as spam or positive/negative) to learn. 
                            This is extremely expensive and causes severe human fatigue. Standard active learning software feeds humans the 
                            longest, most exhausting tasks without caring about human limits.
                        </p>
                    </div>

                    {/* 2. CAL-Log Innovation Card */}
                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 space-y-2">
                        <h3 className="font-bold text-purple-300 flex items-center gap-2">
                            <Brain size={16} /> 1. CAL-Log (Fatigue-Aware Selection)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                            <div className="md:col-span-2 text-xs bg-slate-900/60 p-2.5 rounded border border-slate-800 font-mono text-purple-400 flex flex-col justify-center">
                                <p className="text-center font-bold">The Analogy</p>
                                <p className="mt-1 text-[10px] leading-relaxed text-slate-400 font-sans">
                                    Like a smart teacher who doesn't feed a student 10 massive textbook chapters in a row. It alternates with short pages to keep the student fresh.
                                </p>
                            </div>
                            <div className="md:col-span-3 text-xs leading-relaxed text-slate-400">
                                <span className="font-bold text-white">How it works:</span> Our algorithm measures how long it takes you to read texts. 
                                It learns your personal reading speed (&beta;) and setup overhead (&alpha;), then divides task value by cost. 
                                It optimizes for <span className="text-white font-bold">accuracy-per-second</span> rather than just feeding you long texts.
                            </div>
                        </div>
                    </div>

                    {/* 3. Cognitive Pacing Card */}
                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 space-y-2">
                        <h3 className="font-bold text-amber-300 flex items-center gap-2">
                            <Activity size={16} /> 2. Cognitive Pacing Scheduler
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                            <div className="md:col-span-2 text-xs bg-slate-900/60 p-2.5 rounded border border-slate-800 font-mono text-amber-400 flex flex-col justify-center">
                                <p className="text-center font-bold">The Analogy</p>
                                <p className="mt-1 text-[10px] leading-relaxed text-slate-400 font-sans">
                                    Like a smartwatch that tells you to take a breathing break when your heart rate spikes, keeping you safe from fatigue.
                                </p>
                            </div>
                            <div className="md:col-span-3 text-xs leading-relaxed text-slate-400">
                                <span className="font-bold text-white">How it works:</span> If the system detects you are slowing down (reading speed drops by 50%), 
                                it automatically activates **Recovery Mode**. It temporary delivers short, simple sentences so your brain can rest, 
                                preventing you from making costly labeling mistakes.
                            </div>
                        </div>
                    </div>

                    {/* 4. Calibration & ECE Card */}
                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 space-y-2">
                        <h3 className="font-bold text-emerald-300 flex items-center gap-2">
                            <ShieldAlert size={16} /> 3. Dynamic Auto-Labeling (ECE)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                            <div className="md:col-span-2 text-xs bg-slate-900/60 p-2.5 rounded border border-slate-800 font-mono text-emerald-400 flex flex-col justify-center">
                                <p className="text-center font-bold">The Analogy</p>
                                <p className="mt-1 text-[10px] leading-relaxed text-slate-400 font-sans">
                                    Humbles the model. Like warning a student who is always overconfident but constantly gets questions wrong.
                                </p>
                            </div>
                            <div className="md:col-span-3 text-xs leading-relaxed text-slate-400">
                                <span className="font-bold text-white">How it works:</span> Deep learning models are often "confidently wrong." 
                                We compute the model's **Expected Calibration Error (ECE)** dynamically. If the model is overconfident, we automatically 
                                tighten the pruning threshold to ensure we only auto-label tasks when it is truly calibrated and safe.
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="border-t border-slate-800 pt-3 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all"
                    >
                        Got it!
                    </button>
                </div>

            </div>
        </div>
    );
};

export default SimpleExplanationModal;
