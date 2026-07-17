import React, { useState, useEffect } from 'react';
import { 
    X, ChevronLeft, ChevronRight, Award, Brain, BarChart2, Lightbulb, Lock, 
    ArrowRight, ShieldCheck, Database, Layers, Cpu, Users, Zap, Clock, 
    AlertTriangle, Check, HelpCircle, TrendingUp, Sparkles, Play, CheckCircle2 
} from 'lucide-react';

const PitchDeckModal = ({ isOpen, onClose }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [passwordInput, setPasswordInput] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem('pitch_deck_auth') === 'true');
    const [errorMsg, setErrorMsg] = useState('');
    const [isLight, setIsLight] = useState(() => document.body.classList.contains('theme-light'));
    const [isProjectorMode, setIsProjectorMode] = useState(false);

    const contrastLight = isLight || isProjectorMode;

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

    const nextSlide = () => {
        if (currentSlide === slides.length - 1) {
            onClose(); // End of flow -> close and start demo
        } else {
            setCurrentSlide(prev => prev + 1);
        }
    };

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
    }, [isOpen, isAuthenticated, currentSlide]);

    if (!isOpen) return null;

    const slides = [
        // SLIDE 1 — TITLE / HOOK
        {
            title: "AI doesn't run out of data. It runs out of time.",
            subtitle: "A smarter way to label data for AI. Built for the enterprise.",
            icon: Sparkles,
            iconColor: "text-amber-450 bg-amber-500/10 border-amber-500/20",
            content: (
                <div className="h-full flex flex-col justify-center items-center text-center gap-6 max-w-4xl mx-auto py-2">
                    <img src="/logo.jpg" alt="CAL-Log Logo" className="h-20 md:h-24 object-contain bg-white p-1.5 rounded-xl border-2 border-slate-900 shadow-sm animate-pulse" />
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border-2 border-emerald-600 bg-emerald-500/10 text-emerald-700 text-base font-black uppercase tracking-widest">
                            <ShieldCheck size={18} /> Enterprise-Grade Data Labeling
                        </div>
                        <h1 className={`text-4xl md:text-6xl font-black tracking-tight leading-none uppercase ${contrastLight ? 'text-slate-955' : 'text-white'}`}>
                            AI doesn't run out of data.<br />
                            <span className="bg-gradient-to-r from-rose-500 via-red-500 to-indigo-550 bg-clip-text text-transparent">
                                It runs out of time.
                            </span>
                        </h1>
                        <p className={`text-lg md:text-2xl font-bold max-w-3xl mx-auto leading-relaxed ${contrastLight ? 'text-slate-900 font-extrabold' : 'text-slate-300'}`}>
                            CAL-Log is a cost-aware active learning system that adapts to human speed limits in real-time, accelerating your data pipelines.
                        </p>
                    </div>

                    <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent my-2" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
                        <div className={`p-5 rounded-2xl border-2 flex flex-col gap-2 items-center justify-center ${contrastLight ? 'bg-white border-slate-900 text-slate-950 shadow-md font-bold' : 'bg-slate-900/60 border-slate-800'}`}>
                            <span className="text-4xl font-black text-rose-500">65%</span>
                            <span className={`text-sm uppercase font-black tracking-wider ${contrastLight ? 'text-slate-900 font-black' : 'text-slate-400'}`}>Avg Time Saved</span>
                        </div>
                        <div className={`p-5 rounded-2xl border-2 flex flex-col gap-2 items-center justify-center ${contrastLight ? 'bg-white border-slate-900 text-slate-950 shadow-md font-bold' : 'bg-slate-900/60 border-slate-800'}`}>
                            <span className="text-4xl font-black text-indigo-500">Local</span>
                            <span className={`text-sm uppercase font-black tracking-wider ${contrastLight ? 'text-slate-900 font-black' : 'text-slate-400'}`}>100% Data Privacy</span>
                        </div>
                        <div className={`p-5 rounded-2xl border-2 flex flex-col gap-2 items-center justify-center ${contrastLight ? 'bg-white border-slate-900 text-slate-950 shadow-md font-bold' : 'bg-slate-900/60 border-slate-800'}`}>
                            <span className="text-4xl font-black text-emerald-500">Adaptive</span>
                            <span className={`text-sm uppercase font-black tracking-wider ${contrastLight ? 'text-slate-900 font-black' : 'text-slate-400'}`}>To Annotator Speed</span>
                        </div>
                    </div>
                </div>
            )
        },
        // SLIDE 2 — THE LABELING BOTTLENECK (QUESTION + STATS RESTORED & COMBINED)
        {
            title: "The 80% Data Labeling Bottleneck",
            subtitle: "Uncovering the massive unseen cost of generative intelligence.",
            icon: HelpCircle,
            iconColor: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
            content: (
                <div className="h-full flex flex-col justify-center items-center gap-6 max-w-5xl mx-auto py-2">
                    <div className="space-y-3 text-center">
                        <h2 className={`text-3xl md:text-5xl font-black tracking-tight leading-snug uppercase ${contrastLight ? 'text-slate-955' : 'text-white'}`}>
                            Why is AI scaling so expensive?<br />
                            <span className="text-rose-500 font-black">Human Labeling Takes 80%+ of Project Budgets</span>
                        </h2>
                        <p className={`text-base md:text-xl font-bold max-w-3xl mx-auto leading-relaxed ${contrastLight ? 'text-slate-900 font-black' : 'text-slate-350'}`}>
                            Traditional active learning tools select samples blindly, forcing highly-paid human annotators to waste hours reading redundant, low-value documents.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-2 text-left">
                        {[
                            {
                                label: "THE BUDGET DRAIN",
                                value: "$20B by 2030",
                                source: "Grand View Research",
                                desc: "The global data labeling market size is expanding 5x to support LLM instruction tuning and RLHF."
                            },
                            {
                                label: "THE ABANDONMENT RATE",
                                value: "60% Abandoned",
                                source: "Gartner Group",
                                desc: "Of AI projects will fail or be abandoned by 2026 due to unmanageable manual annotation costs."
                            },
                            {
                                label: "THE INDUSTRY SHIFT",
                                value: "Meta & Scale AI",
                                source: "Market Deal (June 2025)",
                                desc: "Meta acquired a 49% stake in Scale AI for $14.3B. The enterprise value is concentrated in data workflows."
                            }
                        ].map((stat, idx) => (
                            <div key={idx} className={`p-6 rounded-2xl border-2 flex flex-col gap-2 ${
                                contrastLight ? 'bg-white border-slate-900 text-slate-950 shadow-md font-bold' : 'bg-slate-900/60 border-slate-800 text-slate-200'
                            }`}>
                                <span className="text-xs font-black text-rose-550 uppercase tracking-widest">{stat.label}</span>
                                <h3 className="text-2xl font-black">{stat.value}</h3>
                                <p className={`text-sm leading-relaxed mt-1 flex-1 ${contrastLight ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>{stat.desc}</p>
                                <span className="text-[10px] text-slate-500 font-mono text-right mt-1">Source: {stat.source}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )
        },
        // SLIDE 3 — THE GAPS
        {
            title: "Three Gaps.",
            subtitle: "Ranked by what actually costs business organizations money.",
            icon: Layers,
            iconColor: "text-rose-500 bg-rose-500/10 border-rose-500/20",
            content: (
                <div className="h-full flex flex-col justify-center gap-4 max-w-5xl mx-auto py-2">
                    {[
                        {
                            num: "1",
                            type: "PRIORITY 1 · BUSINESS",
                            title: "Nobody prices per sample complexity",
                            desc: "Existing tools route a single sentence and a dense 1,000-word contract as if they cost the same time. Result: teams overpay for trivial labels.",
                            badge: "Confirmed by 19 of 31 surveyed NLP domain leads",
                            badgeColor: contrastLight ? "bg-rose-100 text-rose-900 border-rose-550 border-2 font-black text-xs" : "bg-rose-500/10 text-rose-450 border-rose-500/20"
                        },
                        {
                            num: "2",
                            type: "PRIORITY 2 · BUSINESS",
                            title: "Nobody adapts to annotator speed and fatigue",
                            desc: "Static lists ignore that users slow down, lose concentration, and make mistakes when tired. Result: lazy errors corrupt the datasets.",
                            badge: "Flagged in cognitive science speed studies",
                            badgeColor: contrastLight ? "bg-amber-100 text-amber-905 border-amber-600 border-2 font-black text-xs" : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        },
                        {
                            num: "3",
                            type: "PRIORITY 3 · TECHNICAL",
                            title: "Nobody calibrates model confidence early",
                            desc: "Traditional active learning uses uncalibrated early-round probabilities. Result: model picks poor samples, degrading accuracy.",
                            badge: "52% failure rate in standard entropy baselines",
                            badgeColor: contrastLight ? "bg-purple-100 text-purple-900 border-purple-650 border-2 font-black text-xs" : "bg-purple-500/10 text-purple-400 border-purple-500/20"
                        }
                    ].map((gap) => (
                        <div key={gap.num} className={`p-5 rounded-xl border-2 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center ${
                            contrastLight ? 'bg-white border-slate-900 text-slate-955 shadow-md font-bold' : 'bg-slate-900/60 border-slate-850'
                        }`}>
                            <div className="flex gap-4 items-start text-left">
                                <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-550 flex items-center justify-center font-black text-lg shrink-0 border-2 border-rose-550/20">
                                    {gap.num}
                                </div>
                                <div className="space-y-1">
                                    <div className={`text-xs font-black uppercase tracking-widest ${contrastLight ? 'text-slate-800' : 'text-slate-500'}`}>{gap.type}</div>
                                    <h4 className={`font-black text-lg md:text-xl ${contrastLight ? 'text-slate-955' : 'text-white'}`}>{gap.title}</h4>
                                    <p className={`text-sm leading-relaxed ${contrastLight ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>{gap.desc}</p>
                                </div>
                            </div>
                            <span className={`text-xs font-bold px-3 py-1.5 rounded-full border shrink-0 ${gap.badgeColor}`}>
                                {gap.badge}
                            </span>
                        </div>
                    ))}
                </div>
            )
        },
        // SLIDE 4 — SYSTEM ARCHITECTURE & CORE MATHEMATICAL ENGINE
        {
            title: "Microservice Architecture & Core Selection Engine",
            subtitle: "Combining our deployed multi-tier loop with our cost-aware selection formula.",
            icon: Brain,
            iconColor: "text-indigo-405 bg-indigo-500/10 border-indigo-500/20",
            content: (
                <div className="h-full flex flex-col justify-center gap-4 max-w-[1250px] mx-auto py-2">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                        
                        <div className="lg:col-span-7 flex justify-center">
                            <div className={`relative w-full max-w-[580px] rounded-2xl p-1.5 overflow-hidden shadow-2xl border-2 hover:scale-102 transition-all duration-300 ${
                                contrastLight ? 'bg-white border-slate-900 shadow-md' : 'bg-slate-900/60 border-slate-850'
                            }`}>
                                <img 
                                    src="/system_architecture.png" 
                                    alt="Live Microservices System Architecture Diagram" 
                                    className="w-full h-auto rounded-xl object-contain"
                                />
                            </div>
                        </div>

                        <div className="lg:col-span-5 space-y-4 text-left">
                            <span className="text-xs font-black text-indigo-505 uppercase tracking-widest block">PYTHON ML ENGINE</span>
                            <div className={`p-4 rounded-xl border-2 font-mono text-xs md:text-sm leading-relaxed overflow-x-auto text-left shadow-lg ${
                                contrastLight ? 'bg-slate-900 border-slate-950 text-emerald-455 font-black' : 'bg-slate-955 border-slate-800 text-emerald-400'
                            }`}>
                                <div className="text-slate-500 mb-1">// Utility = Information Density / Expected Time Cost</div>
                                <span className="text-purple-400">def</span> <span className="text-blue-400">calculate_selection_utility</span>(uncertainty, speed_residual):<br />
                                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-500"># OLS residual flags cognitive fatigue</span><br />
                                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">if</span> speed_residual &gt;= <span className="text-amber-450 font-black">1.5</span> * baseline_speed:<br />
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">return</span> route_low_complexity_samples()<br />
                                <br />
                                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-500"># Expected cost: alpha + beta * log(length)</span><br />
                                &nbsp;&nbsp;&nbsp;&nbsp;expected_seconds = alpha + beta * log(text_length)<br />
                                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">return</span> argmax(uncertainty / expected_seconds)<br />
                            </div>

                            <div className="space-y-2 text-xs md:text-sm text-slate-450 leading-relaxed font-bold">
                                <div className="flex gap-2">
                                    <div className="p-1 rounded bg-indigo-500/10 text-indigo-400 shrink-0"><Check size={12} /></div>
                                    <span className={`${contrastLight ? 'text-slate-900 font-extrabold' : ''}`}><b>Client UI Tier:</b> fatigue timing metrics in React.</span>
                                </div>
                                <div className="flex gap-2">
                                    <div className="p-1 rounded bg-indigo-500/10 text-indigo-400 shrink-0"><Check size={12} /></div>
                                    <span className={`${contrastLight ? 'text-slate-900 font-extrabold' : ''}`}><b>Server Tier:</b> REST API gateway & MongoDB storage.</span>
                                </div>
                                <div className="flex gap-2">
                                    <div className="p-1 rounded bg-indigo-500/10 text-indigo-400 shrink-0"><Check size={12} /></div>
                                    <span className={`${contrastLight ? 'text-slate-900 font-extrabold' : ''}`}><b>Flask Logic Tier:</b> Python adaptive regression engines.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        // SLIDE 5 — PERFORMANCE
        {
            title: "Validated Performance: Six of Six Ticks",
            subtitle: "CAL-Log reaches target accuracy 3.9x faster than standard active learning tools.",
            icon: ShieldCheck,
            iconColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
            content: (
                <div className="h-full flex flex-col justify-center gap-4 max-w-[1200px] mx-auto py-2 px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        
                        <div className="lg:col-span-5 overflow-x-auto w-full space-y-3 text-left">
                            <h4 className={`text-lg font-black tracking-tight ${contrastLight ? 'text-slate-950' : 'text-slate-200'}`}>
                                Feature Matchup vs. Competitors
                            </h4>
                            <table className="w-full text-left border-collapse text-xs md:text-sm">
                                <thead>
                                    <tr className={`border-b ${contrastLight ? 'border-slate-900' : 'border-slate-800'}`}>
                                        <th className={`py-2 font-black text-sm ${contrastLight ? 'text-slate-950' : 'text-slate-450'}`}>Features</th>
                                        <th className="py-2 font-black text-rose-600 text-center text-sm">CAL-Log</th>
                                        <th className={`py-2 font-black text-center text-sm ${contrastLight ? 'text-slate-700' : 'text-slate-500'}`}>Prodigy</th>
                                        <th className={`py-2 font-black text-center text-sm ${contrastLight ? 'text-slate-700' : 'text-slate-500'}`}>Scale AI</th>
                                        <th className={`py-2 font-black text-center text-sm ${contrastLight ? 'text-slate-700' : 'text-slate-500'}`}>Snorkel</th>
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${contrastLight ? 'divide-slate-300' : 'divide-slate-800/40'}`}>
                                    {[
                                        ["Active Learning Queue", true, true, true, false],
                                        ["Cost-Aware Selection", true, false, true, false],
                                        ["Adaptive to Annotator Speed", true, false, false, false],
                                        ["Real-Time Fatigue Detection", true, false, false, false],
                                        ["Semantic Deduplication", true, false, false, true],
                                        ["Calibrated Confidence", true, false, false, false]
                                    ].map((row, idx) => (
                                        <tr key={idx} className="hover:bg-slate-900/30">
                                            <td className={`py-2 font-bold text-sm ${contrastLight ? 'text-slate-950 font-black' : 'text-slate-300'}`}>{row[0]}</td>
                                            <td className="py-2 text-center font-black text-rose-600 text-base">{row[1] ? "✓" : "—"}</td>
                                            <td className={`py-2 text-center text-base ${contrastLight ? 'text-slate-800 font-bold' : 'text-slate-500'}`}>{row[2] ? "✓" : "—"}</td>
                                            <td className={`py-2 text-center text-base ${contrastLight ? 'text-slate-800 font-bold' : 'text-slate-500'}`}>{row[3] ? "✓" : "—"}</td>
                                            <td className={`py-2 text-center text-base ${contrastLight ? 'text-slate-800 font-bold' : 'text-slate-500'}`}>{row[4] ? "✓" : "—"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
 
                        <div className="lg:col-span-7 space-y-3">
                            <div className="flex flex-col gap-1 text-left">
                                <h4 className={`text-lg font-black tracking-tight ${contrastLight ? 'text-slate-955' : 'text-slate-200'}`}>
                                    Cost Efficiency: Time to Reach F1 = 0.80
                                </h4>
                                <span className={`text-xs font-bold ${contrastLight ? 'text-slate-900 font-black' : 'text-slate-500'}`}>
                                    Mean Annotation Time (minutes) across 10 datasets (Lower = Better)
                                </span>
                            </div>
 
                            <div className={`p-4 rounded-xl border-2 space-y-2.5 ${
                                contrastLight ? 'bg-white border-slate-900 text-slate-950 shadow-md' : 'bg-slate-900/40 border-slate-850'
                            }`}>
                                {[
                                    { name: "Entropy", time: 148.5, ciStart: 5, ciEnd: 303, color: "bg-green-500/80" },
                                    { name: "BADGE", time: 126.5, ciStart: 21, ciEnd: 242, color: "bg-blue-500/80" },
                                    { name: "Margin", time: 121.0, ciStart: 5, ciEnd: 238, color: "bg-amber-600/85" },
                                    { name: "Random", time: 93.7, ciStart: 38, ciEnd: 150, color: "bg-slate-550/80" },
                                    { name: "CAL-Log (Ours)", time: 38.3, ciStart: 15, ciEnd: 62, color: "bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.4)]", isHighlight: true }
                                ].map((item, idx) => {
                                    const maxVal = 310;
                                    const barWidth = (item.time / maxVal) * 100;
                                    const ciLeft = (item.ciStart / maxVal) * 100;
                                    const ciWidth = ((item.ciEnd - item.ciStart) / maxVal) * 100;
 
                                    return (
                                        <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                                            <div className={`col-span-3 text-right text-xs font-bold truncate ${
                                                item.isHighlight ? 'text-rose-500 font-black' : contrastLight ? 'text-slate-950 font-black' : 'text-slate-400'
                                            }`}>
                                                {item.name}
                                            </div>
 
                                            <div className={`col-span-7 relative h-5 flex items-center rounded border overflow-visible ${contrastLight ? 'bg-slate-100 border-slate-900 border-2' : 'bg-slate-955/40 border-slate-900/50'}`}>
                                                <div 
                                                    className={`absolute h-0.5 flex items-center justify-between ${contrastLight ? 'bg-slate-950 font-bold' : 'bg-slate-650'}`}
                                                    style={{ left: `${ciLeft}%`, width: `${ciWidth}%` }}
                                                >
                                                    <div className={`w-0.5 h-2 shrink-0 ${contrastLight ? 'bg-slate-955' : 'bg-slate-650'}`} />
                                                    <div className={`w-0.5 h-2 shrink-0 ${contrastLight ? 'bg-slate-955' : 'bg-slate-650'}`} />
                                                </div>
 
                                                <div 
                                                    className={`absolute h-3.5 rounded-sm transition-all duration-1000 ${item.color} ${
                                                        item.isHighlight ? 'border-2 border-white' : ''
                                                    } ${contrastLight ? 'border border-slate-950' : ''}`}
                                                    style={{ width: `${barWidth}%`, left: '0%' }}
                                                />
                                            </div>
 
                                            <div className={`col-span-2 text-xs font-mono font-bold ${
                                                item.isHighlight ? 'text-rose-650 font-extrabold' : contrastLight ? 'text-slate-955 font-black' : 'text-slate-400'
                                            }`}>
                                                {item.time.toFixed(1)}m
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        // SLIDE 6 — STRATEGY & ECONOMICS
        {
            title: "Business Strategy & Operating Economics",
            subtitle: "One dashboard project's savings covers a month of running the tool.",
            icon: Cpu,
            iconColor: "text-purple-404 bg-purple-500/10 border-purple-500/20",
            content: (
                <div className="h-full flex flex-col justify-center gap-4 max-w-[1250px] mx-auto py-2">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                        
                        <div className="lg:col-span-5 flex flex-col gap-4 text-left">
                            <div className={`p-5 rounded-xl border-2 flex flex-col justify-between flex-1 ${
                                contrastLight ? 'bg-white border-slate-900 text-slate-955 shadow-md font-bold' : 'bg-slate-900/50 border-slate-850 shadow-2xl'
                            }`}>
                                <div className="space-y-2">
                                    <span className="text-xs font-black text-rose-500 uppercase tracking-widest block">OPERATING COSTS</span>
                                    <div className="flex justify-between border-b pb-2 font-bold text-slate-205">
                                        <span className={`${contrastLight ? 'text-slate-900 font-extrabold' : ''}`}>Running Costs:</span>
                                        <span className={`font-mono text-base ${contrastLight ? 'text-slate-955 font-black' : 'text-white'}`}>$250 / mo</span>
                                    </div>
                                    <p className={`text-xs mt-1 ${contrastLight ? 'text-slate-800' : 'text-slate-500'}`}>
                                        MongoDB ($120) + AWS Gateway ($80) + Log Security ($50). Handles 50 annotators.
                                    </p>
                                </div>

                                <div className="space-y-2 mt-2">
                                    <span className="text-xs font-black text-emerald-500 uppercase tracking-widest block">ROI MATH</span>
                                    <div className="flex justify-between border-b pb-2 font-bold text-slate-205">
                                        <span className={`${contrastLight ? 'text-slate-900 font-extrabold' : ''}`}>Savings / Project:</span>
                                        <span className="text-emerald-600 font-black">+$1,530 saved</span>
                                    </div>
                                    <p className={`text-xs mt-1 ${contrastLight ? 'text-slate-800' : 'text-slate-500'}`}>
                                        Based on 10,000 records: Manual (140 hrs @ $15) vs. CAL-Log (38 hrs @ $15).
                                    </p>
                                </div>

                                <div className="space-y-1 mt-2">
                                    <span className="text-xs font-black text-indigo-505 uppercase tracking-widest block">TIERS & SLAS</span>
                                    <p className={`text-xs font-bold ${contrastLight ? 'text-slate-900' : 'text-slate-400'}`}>
                                        • <b>Free:</b> Academics & small teams.<br />
                                        • <b>$49/mo (Teams):</b> Shared database support.<br />
                                        • <b>$499/mo (Enterprise):</b> 99.9% Platform Uptime SLA & &lt;4h response window.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-7 flex flex-col gap-4 text-left">
                            <div className={`p-5 rounded-xl border-2 flex-1 ${
                                contrastLight ? 'bg-white border-slate-900 text-slate-955 shadow-md font-bold' : 'bg-slate-900/60 border-slate-800'
                            }`}>
                                <span className="text-xs font-black text-indigo-550 uppercase tracking-widest block mb-3">LEAN CANVAS STRATEGY MAP</span>
                                <div className="grid grid-cols-2 gap-4 text-xs md:text-sm">
                                    <div className="space-y-1">
                                        <b className="text-rose-500 block text-xs tracking-wider uppercase">1. Problem</b>
                                        <p className={`text-[11px] leading-relaxed ${contrastLight ? 'text-slate-900 font-bold' : 'text-slate-450'}`}>High annotation spend (80% budget) & cognitive fatigue.</p>
                                    </div>
                                    <div className="space-y-1">
                                        <b className="text-rose-500 block text-xs tracking-wider uppercase">2. Solution</b>
                                        <p className={`text-[11px] leading-relaxed ${contrastLight ? 'text-slate-900 font-bold' : 'text-slate-450'}`}>Cost-aware selection, timing feedback loop (OLS).</p>
                                    </div>
                                    <div className="space-y-1">
                                        <b className="text-rose-500 block text-xs tracking-wider uppercase">3. Unique Value</b>
                                        <p className={`text-[11px] leading-relaxed ${contrastLight ? 'text-slate-900 font-bold' : 'text-slate-450'}`}>3.9x speedup to target F1, transparent explanations.</p>
                                    </div>
                                    <div className="space-y-1">
                                        <b className="text-indigo-505 block text-xs tracking-wider uppercase">4. Advantage</b>
                                        <p className={`text-[11px] leading-relaxed ${contrastLight ? 'text-slate-900 font-bold' : 'text-slate-450'}`}>Combined fatigue clamping & peer-reviewed at ACL 2026.</p>
                                    </div>
                                    <div className="space-y-1 col-span-2">
                                        <b className="text-indigo-505 block text-xs tracking-wider uppercase">5. Customer Segments & Channels</b>
                                        <p className={`text-[11px] leading-relaxed ${contrastLight ? 'text-slate-900 font-bold' : 'text-slate-450'}`}>ML text developers, university NLP labs, and hourly labeling agencies via open-source model plugins.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            )
        },
        // SLIDE 7 — VALIDATED
        {
            title: "Validated by the ML & Cognitive Science Community",
            subtitle: "Peer feedback and evaluations from PhD candidates, researchers, and engineers.",
            icon: Users,
            iconColor: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
            content: (
                <div className="h-full flex flex-col justify-center gap-4 max-w-6xl mx-auto py-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        <div className={`p-5 rounded-xl border-2 flex flex-col justify-between text-left ${contrastLight ? 'bg-white border-slate-900 text-slate-950 shadow-md font-bold' : 'bg-slate-900/60 border-slate-800'}`}>
                            <p className={`text-xs md:text-sm italic leading-relaxed ${contrastLight ? 'text-slate-900 font-black' : 'text-slate-205'}`}>
                                "Personalizing the annotation process is great. Using reading time and overhead patterns as a proxy for cognitive load is highly valid... Differentiating underlying causes of reading speed variations is crucial for real-world application."
                            </p>
                            <div className="mt-3 border-t border-slate-850 pt-2 text-right">
                                <span className={`font-black text-sm block ${contrastLight ? 'text-slate-955' : ''}`}>Ibrahim Ethem Deveci</span>
                                <span className="text-[10px] text-indigo-500 font-extrabold">PhD Student, METU Cognitive Science</span>
                            </div>
                        </div>

                        <div className={`p-5 rounded-xl border-2 flex flex-col justify-between text-left ${contrastLight ? 'bg-white border-slate-900 text-slate-950 shadow-md font-bold' : 'bg-slate-900/60 border-slate-800'}`}>
                            <p className={`text-xs md:text-sm italic leading-relaxed ${contrastLight ? 'text-slate-900 font-black' : 'text-slate-205'}`}>
                                "Dynamic cost calculation is a huge step up from pure entropy sampling which often just feeds annotators garbage data. Clamping the parameters makes a lot of sense for outlier filtering."
                            </p>
                            <div className="mt-3 border-t border-slate-850 pt-2 text-right">
                                <span className={`font-black text-sm block ${contrastLight ? 'text-slate-955' : ''}`}>Shlok Gilda</span>
                                <span className="text-[10px] text-indigo-500 font-extrabold">PhD Candidate @ UF | NLP & Cybersecurity</span>
                            </div>
                        </div>

                        <div className={`p-5 rounded-xl border-2 flex flex-col justify-between text-left ${contrastLight ? 'bg-white border-slate-900 text-slate-950 shadow-md font-bold' : 'bg-slate-900/60 border-slate-800'}`}>
                            <p className={`text-xs md:text-sm italic leading-relaxed ${contrastLight ? 'text-slate-900 font-black' : 'text-slate-205'}`}>
                                "Using reading speed together with interaction time is a meaningful way to analyze cognitive load... these signals can be robust to individual baseline differences."
                            </p>
                            <div className="mt-3 border-t border-slate-850 pt-2 text-right">
                                <span className={`font-black text-sm block ${contrastLight ? 'text-slate-955' : ''}`}>Hinduja Balasubramaniyam</span>
                                <span className="text-[10px] text-indigo-500 font-extrabold">Cognitive Science & NLP Researcher</span>
                            </div>
                        </div>

                        <div className={`p-5 rounded-xl border-2 flex flex-col justify-between text-left ${contrastLight ? 'bg-white border-slate-900 text-slate-950 shadow-md font-bold' : 'bg-slate-900/60 border-slate-800'}`}>
                            <p className={`text-xs md:text-sm italic leading-relaxed ${contrastLight ? 'text-slate-900 font-black' : 'text-slate-205'}`}>
                                "Real-world annotation fatigue isn't just about reading time. It is influenced by context switching, complexity, and micro-interactions. Real-time client-side timing is a solid, practical approach."
                            </p>
                            <div className="mt-3 border-t border-slate-850 pt-2 text-right">
                                <span className={`font-black text-sm block ${contrastLight ? 'text-slate-955' : ''}`}>Seif Feroz</span>
                                <span className="text-[10px] text-indigo-500 font-extrabold">Data Analyst & Operations Lead</span>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        // SLIDE 8 — PEER REVIEW & TIMELINE
        {
            title: "Peer-reviewed. Deployed. Growing.",
            subtitle: "From academic acceptance to active production pilots.",
            icon: ShieldCheck,
            iconColor: "text-emerald-450 bg-emerald-500/10 border-emerald-555/20",
            content: (
                <div className="h-full flex flex-col justify-center gap-6 max-w-5xl mx-auto py-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        <div className={`p-6 rounded-2xl border-2 text-left flex flex-col justify-between ${
                            contrastLight ? 'bg-white border-slate-900 text-slate-955 shadow-md font-bold' : 'bg-slate-900/60 border-slate-800'
                        }`}>
                            <div>
                                <span className="text-xs font-black text-rose-505 uppercase tracking-widest block mb-4">ACCEPTED & PUBLISHED</span>
                                <div className="space-y-4 text-sm md:text-base font-bold font-extrabold">
                                    <div className="flex items-center gap-3">
                                        <img src="https://aclanthology.org/images/acl-logo-square.svg" alt="ACL Logo" className="h-8 w-8 object-contain bg-white p-0.5 rounded border border-slate-300 shrink-0" />
                                        <span><b>ACL 2026</b> (Accepted and presented - A* NLP conference)</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/e/e9/IEEE_logo.svg" alt="IEEE Logo" className="h-8 w-8 object-contain bg-white p-0.5 rounded border border-slate-300 shrink-0" />
                                        <span><b>IEEE CSNT 2026</b> (Accepted, in press)</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={`p-6 rounded-2xl border-2 text-left flex flex-col justify-between ${
                            contrastLight ? 'bg-white border-slate-900 text-slate-955 shadow-md' : 'bg-slate-900/60 border-slate-800'
                        }`}>
                            <div>
                                <span className="text-xs font-black text-indigo-505 uppercase tracking-widest block mb-4">ROADMAP</span>
                                <div className="space-y-4 text-sm md:text-base font-bold font-extrabold">
                                    <div className="flex gap-3">
                                        <span className={`font-black ${contrastLight ? 'text-slate-955' : 'text-slate-300'}`}>NOW:</span>
                                        <span className={`${contrastLight ? 'text-slate-900 font-extrabold' : 'text-slate-450'}`}>Live deployment, 4 papers, 10-dataset benchmark</span>
                                    </div>
                                    <div className="flex gap-3">
                                        <span className="font-black text-indigo-500">Q1:</span>
                                        <span className={`${contrastLight ? 'text-slate-900 font-extrabold' : 'text-slate-450'}`}>Public pilot with 3 partner NLP research labs</span>
                                    </div>
                                    <div className="flex gap-3">
                                        <span className="font-black text-rose-500">Q2:</span>
                                        <span className={`${contrastLight ? 'text-slate-900 font-extrabold' : 'text-slate-450'}`}>Image and audio cost baselines, multi-modal expansion</span>
                                    </div>
                                    <div className="flex gap-3">
                                        <span className="font-black text-emerald-550">Q3:</span>
                                        <span className={`${contrastLight ? 'text-slate-900 font-extrabold' : 'text-slate-450'}`}>Enterprise on-prem license release with SLAs</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        // SLIDE 9 — CLOSE
        {
            title: "This isn't a research idea. It's a tool, ready today.",
            subtitle: "Same accuracy, a third of the time, at a fraction of the cost.",
            icon: Award,
            iconColor: "text-rose-500 bg-rose-500/10 border-rose-500/20",
            content: (
                <div className="h-full flex flex-col justify-center items-center text-center gap-6 max-w-4xl mx-auto py-2">
                    <img src="/logo.jpg" alt="CAL-Log Logo" className="h-20 md:h-24 object-contain bg-white p-1 rounded-xl border-2 border-slate-350 shadow-md animate-bounce" />
                    <div className="space-y-4">
                        <h2 className={`text-4xl md:text-6xl font-black uppercase tracking-tight ${contrastLight ? 'text-slate-955' : 'text-white'}`}>
                            This isn't a research idea.<br />
                            <span className="bg-gradient-to-r from-rose-500 to-indigo-555 bg-clip-text text-transparent">
                                It's a tool, ready today.
                            </span>
                        </h2>
                        <p className={`text-lg md:text-xl font-bold max-w-2xl mx-auto leading-relaxed ${contrastLight ? 'text-slate-900 font-extrabold' : 'text-slate-300'}`}>
                            Same accuracy. A third of the human time. At a fraction of the budget.
                        </p>
                    </div>

                    <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent my-2" />

                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <button
                            onClick={onClose}
                            className="px-8 py-4 bg-gradient-to-r from-rose-600 to-red-505 hover:from-rose-500 hover:to-red-400 text-white font-extrabold text-base rounded-xl shadow-2xl shadow-rose-500/20 transform hover:scale-105 active:scale-95 transition flex items-center gap-3"
                        >
                            <Play size={18} className="fill-white" /> Start Live Annotation Demo
                        </button>
                    </div>
                </div>
            )
        }
    ];

    const CurrentIcon = slides[currentSlide].icon;

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-0 animate-fade-in ${contrastLight ? 'bg-white' : 'bg-slate-950'}`}>
            <div className={`w-full h-full relative flex flex-col justify-between overflow-hidden text-left transition-all ${
                contrastLight ? 'bg-white text-slate-955' : 'bg-slate-955 text-white'
            }`}>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 via-indigo-500 to-emerald-500 z-20" />
                
                <button 
                    onClick={onClose}
                    className={`absolute top-4 right-4 p-2.5 rounded-xl transition z-30 border ${
                        contrastLight 
                            ? 'bg-slate-100 border-slate-350 text-slate-955 hover:bg-slate-200 border-2 font-bold' 
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                    title="Exit Presentation"
                >
                    <X size={18} />
                </button>

                {!isAuthenticated ? (
                    <div className="flex-grow flex flex-col items-center justify-center py-10 space-y-6 text-center">
                        <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                            <Lock size={30} className="animate-pulse" />
                        </div>
                        <div>
                            <h3 className={`text-xl font-black ${contrastLight ? 'text-slate-955' : 'text-white'}`}>CAL-Log Presentation</h3>
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
                                    contrastLight ? 'bg-white border-2 border-slate-900 text-slate-950 shadow-inner font-bold' : 'bg-slate-900 border border-slate-800 text-white'
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
                    <>
                        <div className={`p-6 md:p-8 pb-4 border-b flex justify-between items-center ${
                            contrastLight ? 'border-slate-350 bg-white border-b-2' : 'border-slate-900 bg-slate-950'
                        }`}>
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl border ${slides[currentSlide].iconColor}`}>
                                    <CurrentIcon size={28} />
                                </div>
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-505 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
                                        Slide {currentSlide + 1} of {slides.length}
                                    </span>
                                    <h2 className={`text-2xl md:text-3xl font-black mt-1 tracking-tight ${contrastLight ? 'text-slate-955' : 'text-white'}`}>{slides[currentSlide].title}</h2>
                                    <p className={`text-sm font-semibold mt-0.5 ${contrastLight ? 'text-slate-900' : 'text-slate-400'}`}>{slides[currentSlide].subtitle}</p>
                                </div>
                            </div>
                            
                            <button
                                onClick={() => setIsProjectorMode(!isProjectorMode)}
                                className={`mr-14 px-4 py-2 text-xs font-black rounded-lg transition border-2 ${
                                    isProjectorMode 
                                        ? 'bg-amber-500 border-amber-600 text-black shadow-md' 
                                        : contrastLight
                                            ? 'bg-slate-100 border-slate-300 text-slate-805 hover:bg-slate-200'
                                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                                }`}
                                title="Optimize colors for low-contrast projection on white walls"
                            >
                                {isProjectorMode ? '☀ Projector Mode On' : '☼ Optimize for Projector (White Wall)'}
                            </button>
                        </div>

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

                        <div className={`p-6 md:p-8 pt-4 border-t flex items-center justify-between ${
                            contrastLight ? 'border-slate-350 bg-white border-t-2' : 'border-slate-900 bg-slate-950'
                        }`}>
                            <div className="flex gap-2">
                                {slides.map((_, i) => (
                                    <span 
                                        key={i} 
                                        className={`w-3.5 h-3.5 rounded-full transition-all duration-350 cursor-pointer ${
                                            i === currentSlide 
                                                ? 'bg-indigo-500 w-8' 
                                                : contrastLight ? 'bg-slate-300' : 'bg-slate-850'
                                        }`} 
                                        onClick={() => setCurrentSlide(i)}
                                    />
                                ))}
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={prevSlide}
                                    disabled={currentSlide === 0}
                                    className={`p-3 rounded-xl border transition disabled:opacity-30 ${
                                        contrastLight 
                                            ? 'bg-slate-100 border-slate-300 text-slate-955 hover:bg-slate-200 border-2 font-bold' 
                                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
                                    }`}
                                    title="Previous Slide"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    onClick={nextSlide}
                                    className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-sm font-black rounded-xl transition flex items-center gap-2 shadow-lg shadow-indigo-500/10 border-2 border-indigo-700 font-extrabold"
                                >
                                    {currentSlide === slides.length - 1 ? 'Start Live Demo' : 'Next Slide'} <ChevronRight size={16} />
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
