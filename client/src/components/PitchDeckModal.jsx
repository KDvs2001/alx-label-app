import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Award, Brain, BarChart2, Lightbulb, Lock, ArrowRight, ShieldCheck, Database, Layers, Cpu, Users, Zap, Clock, AlertTriangle, Play, Sparkles } from 'lucide-react';

const PitchDeckModal = ({ isOpen, onClose }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [passwordInput, setPasswordInput] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem('pitch_deck_auth') === 'true');
    const [errorMsg, setErrorMsg] = useState('');
    const [isLight, setIsLight] = useState(() => document.body.classList.contains('theme-light'));
    const [activeFormulaTab, setActiveFormulaTab] = useState('hx');

    // Dynamic theme detection
    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsLight(document.body.classList.contains('theme-light'));
        });
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        const expected = import.meta.env.VITE_PITCH_DECK_PASSWORD || 'LOVEmyself@21';
        if (passwordInput === expected) {
            setIsAuthenticated(true);
            sessionStorage.setItem('pitch_deck_auth', 'true');
            setErrorMsg('');
        } else {
            setErrorMsg('Invalid Pitch Deck passkey.');
        }
    };

    const nextSlide = () => setCurrentSlide(prev => (prev < 5 ? prev + 1 : prev));
    const prevSlide = () => setCurrentSlide(prev => (prev > 0 ? prev - 1 : prev));

    // Keyboard navigation (Left/Right Arrows)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isOpen || !isAuthenticated) return;
            if (e.key === 'ArrowRight') nextSlide();
            if (e.key === 'ArrowLeft') prevSlide();
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isAuthenticated]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-lg p-0 md:p-6 animate-fade-in">
            <div className={`w-full h-full md:max-w-5xl md:max-h-[640px] md:rounded-3xl shadow-2xl relative flex flex-col justify-between overflow-hidden text-left transition-all ${
                isLight ? 'bg-slate-50 text-slate-900 border border-slate-200' : 'bg-slate-950 text-white border border-slate-900'
            }`}>
                {/* Visual Top Glow */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-rose-500 via-indigo-500 to-emerald-500 z-20" />
                
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className={`absolute top-4 right-4 p-2.5 rounded-xl transition z-30 border ${
                        isLight 
                            ? 'bg-slate-100 border-slate-250 text-slate-600 hover:bg-slate-200' 
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                    title="Exit Presentation"
                >
                    <X size={18} />
                </button>

                {!isAuthenticated ? (
                    /* Lock Screen */
                    <div className="flex-grow flex flex-col items-center justify-center py-10 space-y-6 text-center">
                        <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                            <Lock size={30} className="animate-pulse" />
                        </div>
                        <div>
                            <h3 className={`text-xl font-black ${isLight ? 'text-slate-850' : 'text-white'}`}>CAL-Log Presentation</h3>
                            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">Please enter the pitch presentation passkey to unlock the slides.</p>
                        </div>
                        <form onSubmit={handlePasswordSubmit} className="w-full max-w-xs space-y-3">
                            <input
                                type="password"
                                required
                                value={passwordInput}
                                onChange={(e) => setPasswordInput(e.target.value)}
                                placeholder="Enter presentation passkey..."
                                className={`w-full px-4 py-3.5 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition font-mono ${
                                    isLight ? 'bg-white border border-slate-200 text-slate-850 shadow-inner' : 'bg-slate-900 border border-slate-800 text-white'
                                }`}
                            />
                            {errorMsg && (
                                <p className="text-xs text-rose-500 font-semibold">{errorMsg}</p>
                            )}
                            <button
                                type="submit"
                                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/10 transition"
                            >
                                Access Deck <ArrowRight size={15} />
                            </button>
                        </form>
                    </div>
                ) : (
                    /* Sliding Carousel slides presentation */
                    <>
                        {/* Slide Content Wrapper */}
                        <div className="flex-grow flex flex-col min-h-0 relative">
                            {/* Inner Sliding Viewport */}
                            <div className="flex-1 overflow-hidden relative">
                                <div 
                                    className="flex h-full transition-transform duration-500 ease-out"
                                    style={{ transform: `translate3d(-${currentSlide * 100}%, 0, 0)` }}
                                >
                                    
                                    {/* ── SLIDE 1: THE PAIN ────────────────────────────────────────── */}
                                    <div className="w-full shrink-0 p-8 flex flex-col justify-center gap-6">
                                        <div className="max-w-2xl">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-rose-500 bg-rose-500/10 px-2.5 py-1 rounded">The Pain Point</span>
                                            <h2 className={`text-3xl md:text-4xl font-black mt-2 leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                                Data Labeling is <span className="text-rose-500">Slow, Hard, and Expensive</span>
                                            </h2>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                                            <div className="lg:col-span-7 space-y-4">
                                                <p className="text-sm md:text-base text-slate-400 leading-relaxed font-semibold">
                                                    Imagine forcing human annotators to read 10,000 documents by hand. It is a slow, mind-numbing task.
                                                </p>
                                                <div className="flex gap-3 items-center">
                                                    <div className="p-2 bg-rose-500/10 rounded-xl text-rose-500 border border-rose-500/20"><AlertTriangle size={20} /></div>
                                                    <p className={`text-sm font-bold ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>Tired humans make mistakes, introducing noise into the AI training set.</p>
                                                </div>
                                            </div>
                                            
                                            {/* Visual representation */}
                                            <div className="lg:col-span-5 flex justify-center">
                                                <div className={`p-5 rounded-2xl border w-full max-w-sm flex flex-col gap-3 relative ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900/60 border-slate-800'}`}>
                                                    <div className="flex justify-between items-center text-xs text-slate-500 font-bold border-b border-slate-800/40 pb-2">
                                                        <span>DOCUMENT QUEUE</span>
                                                        <span className="text-rose-500 animate-pulse">OVERLOAD</span>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {[
                                                            { text: "Highly redundant duplicate article content...", opacity: "opacity-100" },
                                                            { text: "Long, boring, repetitive dataset review text...", opacity: "opacity-70" },
                                                            { text: "Another simple sentence requiring 0 cognitive effort...", opacity: "opacity-45" }
                                                        ].map((item, idx) => (
                                                            <div key={idx} className={`p-2.5 bg-slate-950 border border-slate-900 rounded-xl text-[11px] font-mono text-slate-400 ${item.opacity}`}>
                                                                {item.text}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="text-[10px] text-center text-slate-500 font-bold italic mt-1">Annotators spend 90% of their time reading trivial texts.</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ── SLIDE 2: THE WASTE ────────────────────────────────────────── */}
                                    <div className="w-full shrink-0 p-8 flex flex-col justify-center gap-6">
                                        <div className="max-w-2xl">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-rose-500 bg-rose-500/10 px-2.5 py-1 rounded">The Cost Leak</span>
                                            <h2 className={`text-3xl md:text-4xl font-black mt-2 leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                                Bleeding AI Budgets on <span className="text-rose-500">Useless Data</span>
                                            </h2>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                                            <div className="lg:col-span-7 space-y-4">
                                                <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl text-center md:text-left">
                                                    <p className={`text-base font-bold ${isLight ? 'text-rose-900' : 'text-rose-300'}`}>
                                                        Human labeling accounts for <span className="text-rose-500 font-extrabold underline">80% of an AI project's budget</span>. Most of that is wasted paying humans to read texts the AI model is already confident about.
                                                    </p>
                                                </div>
                                                <p className="text-xs md:text-sm text-slate-400 leading-relaxed font-semibold">
                                                    Traditional tools are cost-blind. They treat a two-second tweet and a four-minute financial report as the same cost, draining your budget on low-value items.
                                                </p>
                                            </div>
                                            
                                            {/* Visual Progress Ring */}
                                            <div className="lg:col-span-5 flex justify-center">
                                                <div className={`p-6 rounded-2xl border w-full max-w-sm flex items-center justify-between gap-4 ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900/60 border-slate-800'}`}>
                                                    <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                                                        <svg className="w-full h-full transform -rotate-90">
                                                            <circle cx="56" cy="56" r="48" stroke="#1e293b" strokeWidth="10" fill="transparent" />
                                                            <circle cx="56" cy="56" r="48" stroke="#f43f5e" strokeWidth="10" fill="transparent" strokeDasharray="301.6" strokeDashoffset="60.3" className="transition-all duration-1000" />
                                                        </svg>
                                                        <div className="absolute text-center">
                                                            <span className="text-2xl font-black text-white">80%</span>
                                                            <span className="text-[8px] text-slate-400 block font-bold uppercase">AI Budget</span>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="text-xs font-bold text-white uppercase tracking-wider">Spent on Labeling</div>
                                                        <p className="text-[11px] text-slate-450 leading-relaxed">Up to 70% of random samples provide no active learning signal, meaning you are literally paying to learn nothing.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ── SLIDE 3: THE SOLUTION ─────────────────────────────────────── */}
                                    <div className="w-full shrink-0 p-8 flex flex-col justify-center gap-6">
                                        <div className="max-w-2xl">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-500/10 px-2.5 py-1 rounded">The Innovation</span>
                                            <h2 className={`text-3xl md:text-4xl font-black mt-2 leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                                Meet CAL-Log: The <span className="text-indigo-400">Smart Teacher Heuristic</span>
                                            </h2>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                                            <div className="lg:col-span-7 space-y-4">
                                                <p className="text-sm md:text-base text-slate-450 leading-relaxed font-semibold">
                                                    Instead of drilling a labeler on all 1,000 flashcards, CAL-Log acts as an intelligent plug-in, handing them **only the high-value cards** they need to see.
                                                </p>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="flex gap-2">
                                                        <div className="p-1 rounded bg-indigo-500/10 text-indigo-400 shrink-0 h-fit mt-0.5"><Zap size={14} /></div>
                                                        <p className="text-xs text-slate-400 leading-relaxed">Dynamically filters redundant text data.</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <div className="p-1 rounded bg-indigo-500/10 text-indigo-400 shrink-0 h-fit mt-0.5"><Zap size={14} /></div>
                                                        <p className="text-xs text-slate-400 leading-relaxed">Adapts tasks to individual reading speeds.</p>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Visual Comparison */}
                                            <div className="lg:col-span-5 flex justify-center">
                                                <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
                                                    <div className={`p-4 rounded-xl border text-center ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900/40 border-slate-800'}`}>
                                                        <div className="text-slate-500 font-black text-xs uppercase tracking-wider">Ordinary Tools</div>
                                                        <div className="text-2xl font-black text-slate-600 mt-2">1,000</div>
                                                        <p className="text-[10px] text-slate-550 mt-1">Random files drilled</p>
                                                    </div>
                                                    <div className={`p-4 rounded-xl border border-indigo-500/30 text-center bg-indigo-500/5`}>
                                                        <div className="text-indigo-400 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1">CAL-Log <Sparkles size={11} className="text-amber-400 animate-pulse" /></div>
                                                        <div className="text-2xl font-black text-indigo-300 mt-2">CALIBRATED</div>
                                                        <p className="text-[10px] text-indigo-450 mt-1">Targeted by cognitive style</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ── SLIDE 4: THE MATH ─────────────────────────────────────────── */}
                                    <div className="w-full shrink-0 p-8 flex flex-col justify-center gap-6">
                                        <div className="max-w-2xl">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-500/10 px-2.5 py-1 rounded">Technically Advanced</span>
                                            <h2 className={`text-3xl md:text-4xl font-black mt-2 leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                                Algorithmic Brain: <span className="text-indigo-400">Human-Paced Active Learning</span>
                                            </h2>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                                            <div className="lg:col-span-7 space-y-4">
                                                <p className="text-xs md:text-sm text-slate-450 leading-relaxed font-semibold">
                                                    The system scores every single text item before a human sees it, using a formula that balances learning value against reading time.
                                                </p>
                                                
                                                {/* Interactive formula tabs */}
                                                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-900 w-fit">
                                                    {['hx', 'log_l', 'alpha_beta'].map((tab) => (
                                                        <button
                                                            key={tab}
                                                            onClick={() => setActiveFormulaTab(tab)}
                                                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition ${
                                                                activeFormulaTab === tab 
                                                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/10' 
                                                                    : 'text-slate-400 hover:text-white'
                                                            }`}
                                                        >
                                                            {tab === 'hx' ? 'Model Learning' : tab === 'log_l' ? 'Word Length' : 'Cognitive Style'}
                                                        </button>
                                                    ))}
                                                </div>

                                                <div className="h-14">
                                                    {activeFormulaTab === 'hx' && (
                                                        <p className="text-xs text-indigo-300 italic leading-relaxed">
                                                            <span className="font-bold text-white">H(x) (Model Entropy):</span> Scores how much information the model gains from this sample. Prevents training on easy data the model already understands.
                                                        </p>
                                                    )}
                                                    {activeFormulaTab === 'log_l' && (
                                                        <p className="text-xs text-indigo-300 italic leading-relaxed">
                                                            <span className="font-bold text-white">log(1 + L) (Logarithmic Length):</span> Prevents chasing trivial one-liners. Ensures the budget is spent efficiently across short and long documents.
                                                        </p>
                                                    )}
                                                    {activeFormulaTab === 'alpha_beta' && (
                                                        <p className="text-xs text-indigo-300 italic leading-relaxed">
                                                            <span className="font-bold text-white">α + β (Cognitive Style):</span> Calibrated during the Pilot Test. Routes complex text batches only to analysts, and fast skims to speed-readers.
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {/* Formula Display */}
                                            <div className="lg:col-span-5 flex justify-center">
                                                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-900 text-center w-full max-w-sm flex flex-col justify-center min-h-[140px]">
                                                    <span className="text-[9px] font-black uppercase text-indigo-500 tracking-widest mb-1.5">The Equation</span>
                                                    <code className="text-xl md:text-3xl font-mono text-indigo-400 font-black">
                                                        {activeFormulaTab === 'hx' ? 'H(x)' : activeFormulaTab === 'log_l' ? 'log(1+L)' : 'α + β'}
                                                    </code>
                                                    <span className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-wider">ACL Peer-Reviewed Validation</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ── SLIDE 5: THE TRACTION & ROI ─────────────────────────────────── */}
                                    <div className="w-full shrink-0 p-8 flex flex-col justify-center gap-6">
                                        <div className="max-w-2xl">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded">The Traction</span>
                                            <h2 className={`text-3xl md:text-4xl font-black mt-2 leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                                Proven Outcomes: <span className="text-emerald-400">Cut Costs in Half</span>
                                            </h2>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                                            <div className="lg:col-span-6 space-y-4">
                                                <p className="text-sm md:text-base text-slate-450 leading-relaxed font-semibold">
                                                    We tested CAL-Log against 7 leading active learning models across 10 datasets. It beat them all.
                                                </p>
                                                
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2 text-xs font-bold text-white">
                                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                                        <span>59% Less Labeling Costs</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs font-bold text-white">
                                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                                        <span>3.88x Faster Model Convergence</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Large Metrics Visual */}
                                            <div className="lg:col-span-6 flex justify-center">
                                                <div className={`p-6 rounded-2xl border w-full max-w-sm text-center relative overflow-hidden ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900/60 border-slate-800'}`}>
                                                    <div className="text-4xl md:text-5xl font-black text-emerald-400 tracking-tight">59% SAVED</div>
                                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-2">Verified Commerical Labeling Cost Cut</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ── SLIDE 6: COMPATIBILITY ────────────────────────────────────── */}
                                    <div className="w-full shrink-0 p-8 flex flex-col justify-center gap-6">
                                        <div className="max-w-2xl">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded">Enterprise Ready</span>
                                            <h2 className={`text-3xl md:text-4xl font-black mt-2 leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                                Compatible with <span className="text-emerald-400">Your Current Labeling Stack</span>
                                            </h2>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                                            <div className="lg:col-span-7 space-y-4">
                                                <p className="text-xs md:text-sm text-slate-450 leading-relaxed font-semibold">
                                                    CAL-Log integrates as a plug-in. It operates in the background, telling your annotators what to label next through standard REST APIs.
                                                </p>
                                                <div className="grid grid-cols-2 gap-3.5 mt-2">
                                                    <div className={`p-3.5 rounded-xl border ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/40 border-slate-800'}`}>
                                                        <h4 className="font-bold text-xs text-white">Drops Into Label Studio</h4>
                                                        <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">Connects directly via API, serving as the sample selector.</p>
                                                    </div>
                                                    <div className={`p-3.5 rounded-xl border ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/40 border-slate-800'}`}>
                                                        <h4 className="font-bold text-xs text-white">Works Anywhere</h4>
                                                        <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">Ships in Docker container, running in any cloud or locally.</p>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Visual Flow diagram */}
                                            <div className="lg:col-span-5 flex justify-center">
                                                <div className="flex flex-col items-center gap-2 text-xs font-bold w-full max-w-sm">
                                                    <div className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-center w-36">Raw Dataset</div>
                                                    <div className="w-0.5 h-3 bg-indigo-500" />
                                                    <div className="px-3 py-2 bg-indigo-600 rounded-xl text-center w-40 text-white font-extrabold shadow-lg shadow-indigo-500/10">CAL-Log API</div>
                                                    <div className="w-0.5 h-3 bg-indigo-500" />
                                                    <div className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-center w-36">Label Studio UI</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>

                        {/* Slide Footer Navigation */}
                        <div className={`p-6 md:p-8 pt-4 border-t flex items-center justify-between shrink-0 ${
                            isLight ? 'border-slate-200/80 bg-white' : 'border-slate-900 bg-slate-950'
                        }`}>
                            <div className="flex gap-2.5">
                                {[0, 1, 2, 3, 4, 5].map((idx) => (
                                    <span 
                                        key={idx} 
                                        className={`w-2.5 h-2.5 rounded-full transition-all duration-350 cursor-pointer ${
                                            idx === currentSlide ? 'bg-indigo-500 w-8' : 'bg-slate-800'
                                        }`} 
                                        onClick={() => setCurrentSlide(idx)}
                                    />
                                ))}
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={prevSlide}
                                    disabled={currentSlide === 0}
                                    className={`p-2.5 rounded-xl border transition disabled:opacity-30 ${
                                        isLight 
                                            ? 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200' 
                                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
                                    }`}
                                    title="Previous Slide"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <button
                                    onClick={currentSlide === 5 ? onClose : nextSlide}
                                    className="px-6 py-2.5 bg-gradient-to-r from-indigo-650 to-indigo-550 hover:from-indigo-600 hover:to-indigo-450 text-white text-xs font-black rounded-xl transition flex items-center gap-2 shadow-lg shadow-indigo-500/10"
                                >
                                    {currentSlide === 5 ? 'Start Live Demo' : 'Next Slide'} <ChevronRight size={15} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default PitchDeckModal;
