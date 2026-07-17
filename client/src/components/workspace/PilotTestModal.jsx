import React, { useState, useEffect } from 'react';
import { Play, Clock, ArrowRight, CheckCircle2, ShieldAlert, Check } from 'lucide-react';

const SERVER_URL = (import.meta.env.VITE_SERVER_URL || '').replace(/\/$/, '');

// A small built-in test corpus to gauge baseline speed and style
const FULL_PILOT_TEXTS = [
    "The product quality exceeded my expectations. I will definitely buy again.",
    "The customer service was abysmal. I waited on hold for three hours only to be disconnected. This is unacceptable and I demand a full refund immediately.",
    "While the initial setup was somewhat confusing and the manual lacked clear instructions, the final result was satisfactory enough to keep the product, though I wouldn't highly recommend it to beginners.",
    "I absolutely love the new design. It feels very intuitive and modern.",
    "The battery life is incredibly short. It barely lasts half a day on a full charge.",
    "It works okay, nothing special but it gets the job done for the price.",
    "The delivery was delayed by a week, and the package arrived damaged.",
    "Best purchase I've made all year. Highly recommended to everyone!",
    "The software crashes every time I try to export my work. Extremely frustrating.",
    "The color is slightly darker than the pictures, but otherwise it's fine."
];

const PilotTestModal = ({ username, onComplete }) => {
    const [step, setStep] = useState('intro'); // intro, test, result
    const [currentTextIndex, setCurrentTextIndex] = useState(0);
    const [startTime, setStartTime] = useState(0);
    const [totalTime, setTotalTime] = useState(0);
    const [saving, setSaving] = useState(false);
    const [result, setResult] = useState(null);
    const [pilotSize, setPilotSize] = useState(3);

    const pilotTexts = FULL_PILOT_TEXTS.slice(0, pilotSize);

    const startTest = () => {
        setStep('test');
        setStartTime(Date.now());
    };

    const handleNext = (label) => {
        // Label could be recorded here for accuracy check, but for now we focus on speed
        const timeTaken = (Date.now() - startTime) / 1000;
        const newTotal = totalTime + timeTaken;
        
        if (currentTextIndex < pilotTexts.length - 1) {
            setTotalTime(newTotal);
            setCurrentTextIndex(prev => prev + 1);
            setStartTime(Date.now());
        } else {
            finishTest(newTotal);
        }
    };

    const finishTest = async (finalTotalTime) => {
        setSaving(true);
        setStep('result');
        
        // Calculate metrics
        const totalWords = pilotTexts.join(' ').split(/\s+/).length;
        const avgSpeed = finalTotalTime / totalWords; // seconds per word
        
        let style = 'Moderate Reader';
        if (avgSpeed < 0.25) style = 'Fast Skimmer';
        else if (avgSpeed > 0.5) style = 'Careful Analyst';

        const profileData = {
            username,
            baselineSpeed: avgSpeed,
            readingStyle: style
        };

        try {
            await fetch(`${SERVER_URL}/api/session/pilot`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileData)
            });
            setResult(profileData);
        } catch (e) {
            console.error('Failed to save pilot test:', e);
            // Fallback for UI if network fails
            setResult(profileData);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative overflow-hidden">
                
                {/* Background Glow */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
                
                {step === 'intro' && (
                    <div className="text-center space-y-5">
                        <div className="mx-auto w-16 h-16 bg-blue-500/10 rounded-2xl border border-blue-500/20 flex items-center justify-center mb-6">
                            <ShieldAlert size={32} className="text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-black text-white">Pilot Assessment Baseline</h2>
                        <p className="text-slate-400 text-sm leading-relaxed text-left">
                            <strong>Why do a pilot assessment?</strong> We need to calibrate your initial reading speed (baseline). 
                            This relative bootstrap seed helps our AI know your pacing before we start. 
                            <br/><br/>
                            Once you enter a specific project, our adaptive engine continuously recalibrates your speed parameters in real-time to match that target domain's complexity. None of this data is shared outside this system.
                        </p>

                        <div className="flex flex-col gap-2 mt-4 text-left">
                            <label className="text-xs font-bold text-slate-500 uppercase">Assessment Length</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 5, 10].map(size => (
                                    <button
                                        key={size}
                                        onClick={() => setPilotSize(size)}
                                        className={`flex-1 py-2 rounded-lg text-sm font-bold border transition ${
                                            pilotSize === size 
                                                ? 'bg-blue-600 border-blue-500 text-white' 
                                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                                        }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                onClick={startTest}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition"
                            >
                                <Play size={18} /> Begin Pilot Test
                            </button>
                        </div>
                    </div>
                )}

                {step === 'test' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center text-sm font-bold text-slate-400">
                            <span className="flex items-center gap-1.5"><Clock size={16} /> Reading Calibration</span>
                            <span>{currentTextIndex + 1} of {pilotTexts.length}</span>
                        </div>
                        
                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 min-h-[140px] flex items-center text-slate-300 text-lg leading-relaxed shadow-inner">
                            {pilotTexts[currentTextIndex]}
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                onClick={() => handleNext('Positive')}
                                className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold py-3 px-4 rounded-xl flex flex-col items-center justify-center gap-1 transition"
                            >
                                Positive
                            </button>
                            <button
                                onClick={() => handleNext('Neutral')}
                                className="bg-slate-700/30 hover:bg-slate-700/50 text-slate-300 border border-slate-600/50 font-bold py-3 px-4 rounded-xl flex flex-col items-center justify-center gap-1 transition"
                            >
                                Neutral
                            </button>
                            <button
                                onClick={() => handleNext('Negative')}
                                className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold py-3 px-4 rounded-xl flex flex-col items-center justify-center gap-1 transition"
                            >
                                Negative
                            </button>
                        </div>
                    </div>
                )}

                {step === 'result' && (
                    <div className="text-center space-y-6">
                        <div className="mx-auto w-16 h-16 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex items-center justify-center mb-4">
                            <CheckCircle2 size={32} className="text-emerald-400" />
                        </div>
                        <h2 className="text-2xl font-black text-white">Profile Calibrated</h2>
                        
                        {saving ? (
                            <p className="text-slate-400">Saving your adaptive profile...</p>
                        ) : (
                            <div className="space-y-4">
                                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 inline-block mx-auto text-left min-w-[240px]">
                                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Your Reading Style</div>
                                    <div className="text-xl font-black text-indigo-400">{result?.readingStyle}</div>
                                    <div className="text-xs text-slate-400 mt-2">
                                        Speed: {(result?.baselineSpeed || 0).toFixed(2)}s per word
                                    </div>
                                </div>
                                
                                <p className="text-slate-400 text-sm">
                                    Your board has been optimized. Projects matching your style will automatically appear in your queue.
                                </p>

                                <button
                                    onClick={onComplete}
                                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition mt-4"
                                >
                                    Go to My Board <ArrowRight size={18} />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PilotTestModal;
