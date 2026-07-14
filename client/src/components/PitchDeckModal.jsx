import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Award, Brain, BarChart2, Lightbulb, Lock, ArrowRight, ShieldCheck, Database, Layers, Cpu, Users, Zap, Clock, AlertTriangle, ArrowDown } from 'lucide-react';

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

    const nextSlide = () => setCurrentSlide(prev => (prev < 6 ? prev + 1 : prev));
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

    // Inject SVG animation rules for flowing arrows in browser header/style
    const svgStyles = (
        <style dangerouslySetInnerHTML={{ __html: `
            @keyframes flow-dash {
                to { stroke-dashoffset: -20; }
            }
            .flow-line {
                stroke-dasharray: 6, 4;
                animation: flow-dash 1.2s linear infinite;
            }
            .animate-pulse-slow {
                animation: pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            }
        `}} />
    );

    const slides = [
        {
            title: "The Pain: Annotation Overload",
            subtitle: "Human Labor is the Critical AI Bottleneck",
            icon: Lightbulb,
            iconColor: "text-rose-500 bg-rose-500/10 border-rose-500/20",
            content: (
                <div className="h-full flex flex-col justify-center gap-6">
                    <div className={`p-6 rounded-2xl border text-center transition-all max-w-3xl mx-auto ${
                        isLight ? 'bg-rose-50 border-rose-200' : 'bg-rose-950/20 border-rose-500/20'
                    }`}>
                        <p className={`text-xl md:text-2xl font-bold ${isLight ? 'text-rose-800' : 'text-rose-300'} leading-relaxed`}>
                            Teaching AI models to read means paying humans to label thousands of repetitive documents. 
                            <span className="text-rose-500 font-extrabold underline block mt-2">
                                It eats over 80% of an AI project's budget, and most of that spend is wasted.
                            </span>
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto w-full">
                        <div className={`p-6 rounded-2xl border hover:scale-102 transition-all duration-300 flex flex-col gap-3 ${
                            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-slate-850'
                        }`}>
                            <div className="w-9 h-9 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500 font-black text-sm shrink-0">1</div>
                            <h4 className={`font-black ${isLight ? 'text-slate-800' : 'text-white'} text-base`}>Picks the Wrong Data</h4>
                            <p className="text-xs text-slate-405 leading-relaxed">Tools select redundant, low-value examples to label, so effort goes to data the model learns nothing from.</p>
                        </div>
                        <div className={`p-6 rounded-2xl border hover:scale-102 transition-all duration-300 flex flex-col gap-3 ${
                            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-slate-850'
                        }`}>
                            <div className="w-9 h-9 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500 font-black text-sm shrink-0">2</div>
                            <h4 className={`font-black ${isLight ? 'text-slate-800' : 'text-white'} text-base`}>Ignores Real Effort</h4>
                            <p className="text-xs text-slate-405 leading-relaxed">A two-second tweet and a four-minute review cost the same, so long texts quietly drain the budget.</p>
                        </div>
                        <div className={`p-6 rounded-2xl border hover:scale-102 transition-all duration-300 flex flex-col gap-3 ${
                            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-slate-850'
                        }`}>
                            <div className="w-9 h-9 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500 font-black text-sm shrink-0">3</div>
                            <h4 className={`font-black ${isLight ? 'text-slate-800' : 'text-white'} text-base`}>Blind & Rigid</h4>
                            <p className="text-xs text-slate-450 leading-relaxed">Tools give confidence you can't trust, never adapt to the person, and can't explain why they chose an example.</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Business Environment",
            subtitle: "Wasting Billions on Redundant Data",
            icon: BarChart2,
            iconColor: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
            content: (
                <div className="h-full flex flex-col justify-center gap-6">
                    <div className={`p-5 rounded-2xl border text-center transition-all max-w-3xl mx-auto ${
                        isLight ? 'bg-rose-50 border-rose-200' : 'bg-rose-950/20 border-rose-500/20'
                    }`}>
                        <p className={`text-base font-bold ${isLight ? 'text-rose-800' : 'text-rose-300'} leading-relaxed`}>
                            The data-labeling market is worth billions and growing fast. 
                            <span className="text-rose-500 font-black block mt-1">Meta paid $14B for a single labeling company in 2025.</span>
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto w-full">
                        {[
                            { title: "Same Model, Half the Bill", desc: "It cuts the single biggest AI cost, human labeling, by well over half." },
                            { title: "Cheap to Run & Scale", desc: "Auto-scaling cloud services with tiny overhead per user, and near-zero cost when idle." },
                            { title: "Clear Go-To-Market", desc: "Licensed as a paid plug-in for platforms teams already use, like Label Studio: new value, no new tool to buy." },
                            { title: "Validated Demand", desc: "31+ external experts confirmed it is commercially useful for real annotation work." }
                        ].map((card, idx) => (
                            <div key={card.title} className={`p-5 rounded-2xl border hover:scale-102 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 flex flex-col gap-2 ${
                                isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-slate-800'
                            }`}>
                                <div className="text-xs font-black text-rose-500">0{idx + 1}</div>
                                <h4 className={`font-black ${isLight ? 'text-slate-800' : 'text-white'} text-sm mt-1`}>{card.title}</h4>
                                <p className="text-xs text-slate-400 leading-relaxed mt-0.5">{card.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )
        },
        {
            title: "Project Overview",
            subtitle: "CAL-Log is That Smarter Way",
            icon: Layers,
            iconColor: "text-blue-500 bg-blue-500/10 border-blue-500/20",
            content: (
                <div className="h-full flex flex-col justify-center gap-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto w-full">
                        <div className="lg:col-span-7 space-y-6">
                            <h3 className={`text-2xl md:text-3xl font-black ${isLight ? 'text-slate-800' : 'text-white'}`}>
                                A Smart Teacher Plug-in
                            </h3>
                            <p className="text-sm md:text-base text-slate-400 leading-relaxed font-semibold">
                                Instead of drilling a labeler on all 1,000 flashcards, CAL-Log acts as an intelligent plug-in, handing them <span className="text-indigo-400 underline font-bold">only the high-value cards</span> they need to see next.
                            </p>
                            
                            <div className="grid grid-cols-2 gap-4 text-xs">
                                <div className="flex gap-2">
                                    <div className="p-1 rounded bg-indigo-500/10 text-indigo-400 shrink-0"><Zap size={14} /></div>
                                    <span className="text-slate-450">Same AI model quality, a fraction of the cost.</span>
                                </div>
                                <div className="flex gap-2">
                                    <div className="p-1 rounded bg-indigo-500/10 text-indigo-400 shrink-0"><Zap size={14} /></div>
                                    <span className="text-slate-455">Plugs into Label Studio with zero workflow friction.</span>
                                </div>
                            </div>
                        </div>

                        {/* Large Metric Cards */}
                        <div className="lg:col-span-5 grid grid-cols-3 gap-3">
                            <div className={`p-4 rounded-2xl border text-center transition-all hover:scale-105 duration-300 ${
                                isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-850'
                            }`}>
                                <div className="text-3xl md:text-4xl font-black text-rose-500">3.88x</div>
                                <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-wider leading-tight">faster to a good model</p>
                            </div>
                            <div className={`p-4 rounded-2xl border text-center transition-all hover:scale-105 duration-300 ${
                                isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-850'
                            }`}>
                                <div className="text-3xl md:text-4xl font-black text-rose-500">59%</div>
                                <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-wider leading-tight">less labeling cost</p>
                            </div>
                            <div className={`p-4 rounded-2xl border text-center transition-all hover:scale-105 duration-300 ${
                                isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-850'
                            }`}>
                                <div className="text-3xl md:text-4xl font-black text-rose-500">10 / 7</div>
                                <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-wider leading-tight">datasets / rivals beaten</p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Technological Core: CAL-Log Decision Engine",
            subtitle: "Interactive Algorithmic Logic and Math Validation",
            icon: Brain,
            iconColor: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
            content: (
                <div className="h-full flex flex-col justify-center gap-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center max-w-5xl mx-auto w-full">
                        <div className="lg:col-span-6 space-y-4">
                            <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 text-center flex flex-col items-center justify-center">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Active Learning Utility Equation</span>
                                <code className="text-xl md:text-2xl font-mono text-indigo-400 font-black">U(x) = H(x) / (α + β · log(1 + L))</code>
                                <span className="text-[10px] text-slate-400 mt-1">Scores each text: learning value divided by reading cost.</span>
                            </div>

                            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-900 w-fit mx-auto">
                                {['hx', 'log_l', 'alpha_beta'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveFormulaTab(tab)}
                                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition ${
                                            activeFormulaTab === tab 
                                                ? 'bg-indigo-655 text-white shadow-lg' 
                                                : 'text-slate-450 hover:text-white'
                                        }`}
                                    >
                                        {tab === 'hx' ? 'Model Entropy' : tab === 'log_l' ? 'Length Log' : 'Pacing Baseline'}
                                    </button>
                                ))}
                            </div>

                            <div className="h-10 text-center text-xs">
                                {activeFormulaTab === 'hx' && <p className="text-slate-400">Calculates model uncertainty. Only queries labels for data the model is confused about.</p>}
                                {activeFormulaTab === 'log_l' && <p className="text-slate-400">Applies a logarithmic dampener to prevent short text bias, optimizing human effort.</p>}
                                {activeFormulaTab === 'alpha_beta' && <p className="text-slate-400">Integrates baseline speed parameters calibrated during the Pilot Test.</p>}
                            </div>
                        </div>

                        {/* Interactive Data Flow Diagram matching code flow */}
                        <div className="lg:col-span-6 flex justify-center">
                            <div className={`p-4 rounded-2xl border w-full max-w-md ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-850'}`}>
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2.5">Live Data Flow Pipeline</span>
                                <div className="relative flex flex-col gap-3 items-center text-[10px] font-bold text-center text-slate-300">
                                    <div className="w-full grid grid-cols-3 gap-2">
                                        <div className="p-2 bg-slate-955 border border-slate-800 rounded-xl text-slate-400">1. Data Inputs</div>
                                        <div className="p-2 bg-indigo-600 rounded-xl text-white font-extrabold shadow-lg shadow-indigo-500/10">2. CAL-Log API</div>
                                        <div className="p-2 bg-slate-955 border border-slate-800 rounded-xl text-slate-400">3. Label Studio</div>
                                    </div>
                                    <div className="w-full flex items-center justify-between border border-slate-800 bg-slate-950 p-2.5 rounded-xl font-mono text-[9px] text-slate-400">
                                        <span>Evaluate complexity</span>
                                        <span className="text-indigo-400">→</span>
                                        <span>Measure speed</span>
                                        <span className="text-indigo-400">→</span>
                                        <span>Adapt loop</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Product Stability & Reliability",
            subtitle: "Benchmark Testing and System Fault Tolerances",
            icon: ShieldCheck,
            iconColor: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
            content: (
                <div className="h-full flex flex-col justify-center gap-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto w-full">
                        <div className="lg:col-span-6 space-y-4">
                            {[
                                { title: "Tested End to End", desc: "Every route and active learning API checked automatically." },
                                { title: "Tested Everywhere", desc: "Works on 10 diverse datasets, from short tweets to long reviews." },
                                { title: "Quality Re-Checked", desc: "The model is re-validated after every batch of labels." },
                                { title: "Handles the Messy Cases", desc: "Cold starts, huge documents, and spam clicking handled." }
                            ].map((card) => (
                                <div key={card.title} className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
                                    isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-850'
                                }`}>
                                    <div className="p-1 rounded bg-emerald-500/10 text-emerald-400 mt-0.5"><ShieldCheck size={14} /></div>
                                    <div>
                                        <h4 className={`font-bold ${isLight ? 'text-slate-800' : 'text-white'} text-xs`}>{card.title}</h4>
                                        <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{card.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Benchmark Bar Chart Mockup (Matching Slides exactly) */}
                        <div className="lg:col-span-6 flex flex-col gap-2">
                            <div className="text-center">
                                <span className="text-[10px] font-black uppercase text-slate-500">Minutes of human time to reach a good model</span>
                            </div>
                            <div className={`p-4 rounded-2xl border flex flex-col gap-3 ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-850'}`}>
                                {[
                                    { name: "CAL-Log", time: 38, color: "bg-rose-500" },
                                    { name: "Random", time: 94, color: "bg-slate-700" },
                                    { name: "Least Conf.", time: 106, color: "bg-slate-700" },
                                    { name: "Margin", time: 121, color: "bg-slate-700" },
                                    { name: "BADGE", time: 127, color: "bg-slate-700" },
                                    { name: "CoreSet", time: 141, color: "bg-slate-700" },
                                    { name: "Entropy", time: 149, color: "bg-slate-700" }
                                ].map((item) => (
                                    <div key={item.name} className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
                                        <span className="w-16 text-right shrink-0">{item.name}</span>
                                        <div className="flex-1 bg-slate-950 rounded-full h-3.5 overflow-hidden border border-slate-800">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-1000 ${item.color}`}
                                                style={{ width: `${(item.time / 149) * 100}%` }}
                                            />
                                        </div>
                                        <span className="w-6 shrink-0">{item.time}</span>
                                    </div>
                                ))}
                                <div className="text-[9px] text-center text-slate-500 font-bold italic mt-1">Lower is better. CAL-Log in red.</div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Compatibility & Interoperability",
            subtitle: "Enterprise Integration and Workflow Scalability",
            icon: Cpu,
            iconColor: "text-purple-500 bg-purple-500/10 border-purple-500/20",
            content: (
                <div className="h-full flex flex-col justify-center gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto w-full">
                        {[
                            { title: "Works Anywhere", desc: "Runs in any browser; ships in Docker for any computer or cloud." },
                            { title: "Easy to Connect", desc: "Clean, standard APIs that any system can talk to." },
                            { title: "Drops Into Your Tools", desc: "Installs as a plug-in for Label Studio and reads any common data file." },
                            { title: "No Lock-In", desc: "The underlying AI model can be swapped out freely." }
                        ].map((card, idx) => (
                            <div key={card.title} className={`p-5 rounded-2xl border hover:scale-102 transition-all duration-300 flex flex-col gap-2.5 ${
                                isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-slate-800'
                            }`}>
                                <h4 className={`font-black ${isLight ? 'text-slate-800' : 'text-white'} text-sm`}>{card.title}</h4>
                                <p className="text-xs text-slate-400 leading-relaxed mt-0.5">{card.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )
        },
        {
            title: "Content, Standards & User Requirements",
            subtitle: "Strict Compliance, Privacy Safeguards, and Real User Validation",
            icon: ShieldCheck,
            iconColor: "text-amber-500 bg-amber-500/10 border-amber-500/20",
            content: (
                <div className="h-full flex flex-col justify-center gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto w-full">
                        {[
                            { title: "Proven on Real Data", desc: "Tested against 7 leading methods on 10 public datasets, with honest, repeatable results." },
                            { title: "Engineering Standards", desc: "Clean architecture, documented APIs, and code-quality audits throughout." },
                            { title: "Privacy & Compliance", desc: "GDPR-aligned by design: no trackers, no personal data, checked by independent scanners." },
                            { title: "Peer-Reviewed Quality", desc: "4 papers accepted, including an A* at ACL 2026, plus ICAIIC, IEEE SCSE and IEEE CSNT." }
                        ].map((card) => (
                            <div key={card.title} className={`p-5 rounded-2xl border hover:scale-102 transition-all duration-305 flex flex-col gap-2.5 ${
                                isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-slate-800'
                            }`}>
                                <h4 className={`font-black ${isLight ? 'text-slate-800' : 'text-white'} text-sm`}>{card.title}</h4>
                                <p className="text-xs text-slate-400 leading-relaxed mt-0.5">{card.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 p-0 md:p-6 animate-fade-in">
            {svgStyles}
            <div className={`w-full h-full md:max-w-6xl md:max-h-[680px] md:rounded-3xl shadow-2xl relative flex flex-col justify-between overflow-hidden text-left transition-all ${
                isLight ? 'bg-slate-50 text-slate-900 border border-slate-200' : 'bg-slate-950 text-white border border-slate-900'
            }`}>
                {/* Visual Top Glow */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 via-indigo-500 to-emerald-500 z-20" />
                
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className={`absolute top-4 right-4 p-2.5 rounded-xl transition z-30 border ${
                        isLight 
                            ? 'bg-slate-105 border-slate-200 text-slate-650 hover:bg-slate-200' 
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
                    /* Sliding Carousel Viewport */
                    <>
                        {/* Slide Header */}
                        <div className={`p-6 md:p-8 pb-4 border-b flex justify-between items-center ${
                            isLight ? 'border-slate-200/80 bg-white' : 'border-slate-900 bg-slate-950'
                        }`}>
                            <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-xl border ${slides[currentSlide].iconColor}`}>
                                    <CurrentIcon size={24} />
                                </div>
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
                                        Slide {currentSlide + 1} of {slides.length}
                                    </span>
                                    <h2 className={`text-2xl md:text-3xl font-black mt-1 tracking-tight ${isLight ? 'text-slate-805' : 'text-white'}`}>{slides[currentSlide].title}</h2>
                                    <p className="text-xs font-semibold text-slate-400 mt-0.5">{slides[currentSlide].subtitle}</p>
                                </div>
                            </div>
                        </div>

                        {/* Slide Body (Carousels) */}
                        <div className="flex-grow overflow-hidden relative">
                            <div 
                                className="flex h-full transition-transform duration-500 ease-out"
                                style={{ transform: `translate3d(-${currentSlide * 100}%, 0, 0)` }}
                            >
                                {slides.map((slide, idx) => (
                                    <div key={idx} className="w-full h-full shrink-0 overflow-y-auto px-6 md:px-8 py-4">
                                        {slide.content}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Slide Footer Navigation */}
                        <div className={`p-6 md:p-8 pt-4 border-t flex items-center justify-between ${
                            isLight ? 'border-slate-200/80 bg-white' : 'border-slate-900 bg-slate-950'
                        }`}>
                            <div className="flex gap-2.5">
                                {slides.map((_, i) => (
                                    <span 
                                        key={i} 
                                        className={`w-2.5 h-2.5 rounded-full transition-all duration-350 cursor-pointer ${
                                            i === currentSlide ? 'bg-indigo-500 w-8' : 'bg-slate-850'
                                        }`} 
                                        onClick={() => setCurrentSlide(i)}
                                    />
                                ))}
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={prevSlide}
                                    disabled={currentSlide === 0}
                                    className={`p-2.5 rounded-xl border transition disabled:opacity-30 ${
                                        isLight 
                                            ? 'bg-slate-100 border-slate-200 text-slate-650 hover:bg-slate-200' 
                                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
                                    }`}
                                    title="Previous Slide"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <button
                                    onClick={currentSlide === slides.length - 1 ? onClose : nextSlide}
                                    className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-black rounded-xl transition flex items-center gap-2 shadow-lg shadow-indigo-500/10"
                                >
                                    {currentSlide === slides.length - 1 ? 'Start Live Demo' : 'Next Slide'} <ChevronRight size={15} />
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
