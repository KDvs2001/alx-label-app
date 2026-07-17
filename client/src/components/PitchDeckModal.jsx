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
        if (currentSlide === 12) {
            onClose(); // Slide 13 is end of flow -> close and start demo
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
            iconColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
            content: (
                <div className="h-full flex flex-col justify-center items-center text-center gap-4 max-w-4xl mx-auto py-2">
                    <img src="/logo.jpg" alt="CAL-Log Logo" className="h-16 md:h-20 object-contain bg-white p-1 rounded-xl border-2 border-slate-900 shadow-sm" />
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border-2 border-emerald-600 bg-emerald-500/10 text-emerald-700 text-sm font-black uppercase tracking-widest">
                            <ShieldCheck size={16} /> Enterprise-Grade Data Labeling
                        </div>
                        <h1 className={`text-4xl md:text-6xl font-black tracking-tight leading-none uppercase ${contrastLight ? 'text-slate-955' : 'text-white'}`}>
                            AI doesn't run out of data.<br />
                            <span className="bg-gradient-to-r from-rose-500 via-red-500 to-indigo-550 bg-clip-text text-transparent">
                                It runs out of time.
                            </span>
                        </h1>
                        <p className={`text-lg md:text-xl font-bold max-w-3xl mx-auto leading-relaxed ${contrastLight ? 'text-slate-900' : 'text-slate-300'}`}>
                            CAL-Log is a cost-aware active learning system that adapts to human speed limits in real-time, accelerating your data pipelines.
                        </p>
                    </div>

                    <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent my-2" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl">
                        <div className={`p-4 rounded-xl border-2 flex flex-col gap-1 items-center justify-center ${contrastLight ? 'bg-white border-slate-900 text-slate-950 shadow-md' : 'bg-slate-900/60 border-slate-850'}`}>
                            <span className="text-3xl font-black text-rose-500">65%</span>
                            <span className={`text-xs uppercase font-black tracking-wider ${contrastLight ? 'text-slate-900' : 'text-slate-400'}`}>Avg Time Saved</span>
                        </div>
                        <div className={`p-4 rounded-xl border-2 flex flex-col gap-1 items-center justify-center ${contrastLight ? 'bg-white border-slate-900 text-slate-950 shadow-md' : 'bg-slate-900/60 border-slate-850'}`}>
                            <span className="text-3xl font-black text-indigo-500">Local</span>
                            <span className={`text-xs uppercase font-black tracking-wider ${contrastLight ? 'text-slate-900' : 'text-slate-400'}`}>100% Data Privacy</span>
                        </div>
                        <div className={`p-4 rounded-xl border-2 flex flex-col gap-1 items-center justify-center ${contrastLight ? 'bg-white border-slate-900 text-slate-950 shadow-md' : 'bg-slate-900/60 border-slate-850'}`}>
                            <span className="text-3xl font-black text-emerald-500">Adaptive</span>
                            <span className={`text-xs uppercase font-black tracking-wider ${contrastLight ? 'text-slate-900' : 'text-slate-400'}`}>To Annotator Speed</span>
                        </div>
                    </div>
                </div>
            )
        },
        // SLIDE 2 — THE QUESTION (RESTORED)
        {
            title: "How much of your AI project is spent labeling data by hand?",
            subtitle: "The unseen bottleneck holding back generative intelligence.",
            icon: HelpCircle,
            iconColor: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
            content: (
                <div className="h-full flex flex-col justify-center items-center text-center gap-6 max-w-4xl mx-auto py-2">
                    <div className="space-y-4">
                        <h2 className={`text-4xl md:text-5xl font-black tracking-tight leading-snug ${contrastLight ? 'text-slate-955' : 'text-white'}`}>
                            How much of your AI project is spent labeling data by hand?
                        </h2>
                        <p className="text-lg font-extrabold tracking-widest uppercase text-rose-500 animate-pulse">
                            Take a guess.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mt-2">
                        {[
                            { name: "Requirements", pct: "5%", color: contrastLight ? "border-slate-900 text-slate-700 bg-white" : "border-slate-800 bg-slate-900/40 text-slate-500" },
                            { name: "Model Tuning", pct: "10%", color: contrastLight ? "border-slate-900 text-slate-700 bg-white" : "border-slate-800 bg-slate-900/40 text-slate-500" },
                            { name: "Deployment", pct: "5%", color: contrastLight ? "border-slate-900 text-slate-700 bg-white" : "border-slate-800 bg-slate-900/40 text-slate-500" },
                            { name: "Human Labeling", pct: "80%+", color: "border-rose-550 bg-rose-500/10 text-rose-600 font-black animate-pulse" }
                        ].map((stage, idx) => (
                            <div key={idx} className={`p-5 rounded-xl border-2 text-center flex flex-col gap-2 ${stage.color} shadow-sm`}>
                                <span className="text-xs uppercase font-bold tracking-wider">{stage.name}</span>
                                <span className="text-3xl font-black">{stage.pct}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )
        },
        // SLIDE 3 — THE ANSWER/STATS (RESTORED)
        {
            title: "Eighty Percent.",
            subtitle: "Of every AI project. Humans. One sample at a time.",
            icon: AlertTriangle,
            iconColor: "text-rose-500 bg-rose-500/10 border-rose-500/20",
            content: (
                <div className="h-full flex flex-col justify-center gap-6 max-w-5xl mx-auto py-2">
                    <div className="text-center space-y-2">
                        <h2 className="text-5xl md:text-7xl font-black text-rose-500 tracking-tight uppercase">80%</h2>
                        <p className={`text-xl md:text-2xl font-black ${contrastLight ? 'text-slate-950' : 'text-slate-300'}`}>
                            Of every AI project. Humans, one sample at a time.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                        {[
                            {
                                label: "SCALE",
                                value: "$20 Billion",
                                source: "Grand View Research",
                                desc: "Projected global data labeling market size by 2030, growing 5x from 2024 values."
                            },
                            {
                                label: "IMPACT",
                                value: "60% Abandoned",
                                source: "Gartner Group",
                                desc: "Of AI projects will be completely abandoned by 2026 due to poor training data quality."
                            },
                            {
                                label: "URGENCY",
                                value: "$14.3 Billion",
                                source: "Market Transaction",
                                desc: "Meta acquired 49% of Scale AI for $14.3B in June 2025. The enterprise market has spoken."
                            }
                        ].map((stat, idx) => (
                            <div key={idx} className={`p-5 rounded-xl border-2 flex flex-col gap-2 ${
                                contrastLight ? 'bg-white border-slate-900 text-slate-950 shadow-md animate-none' : 'bg-slate-900/60 border-slate-800 text-slate-200'
                            }`}>
                                <span className="text-xs font-black text-rose-550 uppercase tracking-widest">{stat.label}</span>
                                <h3 className="text-2xl font-black">{stat.value}</h3>
                                <p className={`text-xs leading-relaxed mt-1 flex-1 ${contrastLight ? 'text-slate-850 font-bold' : 'text-slate-400'}`}>{stat.desc}</p>
                                <span className="text-[9px] text-slate-500 font-mono text-right mt-1">Source: {stat.source}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )
        },
        // SLIDE 4 — BUSINESS + TECHNOLOGY CHALLENGE
        {
            title: "The Double Bottleneck: Business Cost & Tech Latency",
            subtitle: "Human annotation budgets drain capital, while static models waste compute and annotator time.",
            icon: HelpCircle,
            iconColor: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
            content: (
                <div className="h-full flex flex-col justify-center items-center text-center gap-6 max-w-4xl mx-auto py-2">
                    <div className="space-y-4">
                        <h2 className={`text-4xl md:text-5xl font-black tracking-tight leading-snug ${contrastLight ? 'text-slate-955' : 'text-white'}`}>
                            The Dual Challenge of AI Projects
                        </h2>
                        <p className={`text-lg md:text-xl font-bold ${contrastLight ? 'text-slate-900 font-extrabold' : 'text-slate-350'}`}>
                            Traditional active learning only looks at model uncertainty, ignoring human labor costs and mental fatigue.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-2">
                        <div className={`p-6 rounded-2xl border-2 text-left ${contrastLight ? 'bg-white border-slate-900 text-slate-950 shadow-md' : 'bg-slate-900/60 border-slate-800'}`}>
                            <span className="text-xs font-black text-rose-550 uppercase tracking-widest block mb-2">1. The Business Drain</span>
                            <h3 className="text-2xl font-black mb-2">Annotation Labor Costs</h3>
                            <p className={`text-sm leading-relaxed ${contrastLight ? 'text-slate-850 font-bold' : 'text-slate-400'}`}>
                                Data labeling takes up **80% of AI project budgets**. Paying experts to read long, redundant texts costs thousands of dollars in wasted hourly wages.
                             </p>
                        </div>
                        <div className={`p-6 rounded-2xl border-2 text-left ${contrastLight ? 'bg-white border-slate-900 text-slate-950 shadow-md' : 'bg-slate-900/60 border-slate-800'}`}>
                            <span className="text-xs font-black text-indigo-500 uppercase tracking-widest block mb-2">2. The Technology Fail</span>
                            <h3 className="text-2xl font-black mb-2">Cognitive Fatigue & Noise</h3>
                            <p className={`text-sm leading-relaxed ${contrastLight ? 'text-slate-855 font-bold' : 'text-slate-400'}`}>
                                Annotators read at different speeds and suffer from fatigue. Blind algorithms route complex files when users are tired, leading to lazy errors that corrupt the dataset.
                            </p>
                        </div>
                    </div>
                </div>
            )
        },
        // SLIDE 5 — THE CONVERGENCE
        {
            title: "CAL-Log: Merging Business ROI with Adaptive Tech",
            subtitle: "A machine learning pipeline built to optimize both accuracy and cash flow.",
            icon: AlertTriangle,
            iconColor: "text-rose-500 bg-rose-500/10 border-rose-500/20",
            content: (
                <div className="h-full flex flex-col justify-center gap-6 max-w-5xl mx-auto py-2">
                    <div className="text-center space-y-2">
                        <h2 className="text-4xl md:text-5xl font-black text-rose-500 tracking-tight uppercase">THE CONVERGENCE</h2>
                        <p className={`text-lg md:text-xl font-black ${contrastLight ? 'text-slate-955' : 'text-slate-350'}`}>
                            Optimizing the two critical variables: Model Performance & Annotator Pacing.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className={`p-6 rounded-2xl border-2 ${contrastLight ? 'bg-white border-slate-900 text-slate-950 shadow-md' : 'bg-slate-900/60 border-slate-800'}`}>
                            <span className="text-xs font-black text-rose-500 uppercase tracking-widest block mb-1">BUSINESS OUTCOME</span>
                            <h3 className="text-2xl font-black mb-2">65% Financial ROI</h3>
                            <p className={`text-sm leading-relaxed ${contrastLight ? 'text-slate-850 font-bold' : 'text-slate-400'}`}>
                                By estimating text complexity *before* assigning it, the system filters out trivial files and auto-labels them. This saves up to **a third of total human labor hours**.
                            </p>
                        </div>

                        <div className={`p-6 rounded-2xl border-2 ${contrastLight ? 'bg-white border-slate-900 text-slate-950 shadow-md' : 'bg-slate-900/60 border-slate-800'}`}>
                            <span className="text-xs font-black text-indigo-500 uppercase tracking-widest block mb-1">TECHNOLOGY ENABLER</span>
                            <h3 className="text-2xl font-black mb-2">Online OLS Timing & QBC</h3>
                            <p className={`text-sm leading-relaxed ${contrastLight ? 'text-slate-850 font-bold' : 'text-slate-400'}`}>
                                Standard deviation residuals from Ordinary Least Squares timer models detect fatigue. The system switches to simple tasks automatically, keeping data error-free.
                            </p>
                        </div>
                    </div>

                    <div className={`p-4 rounded-xl border-2 text-center font-bold text-sm ${
                        contrastLight ? 'bg-slate-100 border-slate-900 text-slate-900' : 'bg-indigo-950/20 border-indigo-500/20 text-indigo-300'
                    }`}>
                        "A technology stack designed to save engineering hours and corporate budgets."
                    </div>
                </div>
            )
        },
        // SLIDE 6 — EXISTING SOLUTIONS
        {
            title: "A crowded market. Nobody solves the real problem.",
            subtitle: "Everyone competes on features. CAL-Log competes on time.",
            icon: BarChart2,
            iconColor: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
            content: (
                <div className="h-full flex flex-col justify-center gap-6 max-w-5xl mx-auto py-2">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                        {/* 2x2 Matrix Coordinates Infographic */}
                        <div className="lg:col-span-7 flex justify-center">
                            <div className={`relative w-full max-w-[450px] rounded-2xl p-1 overflow-hidden shadow-2xl border-2 hover:scale-102 transition-all duration-350 ${
                                contrastLight ? 'bg-white border-slate-900 shadow-sm' : 'bg-slate-900/60 border-slate-850'
                            }`}>
                                <img 
                                    src="/market_gap_diagram.png" 
                                    alt="Market Gap Infographic Matrix" 
                                    className="w-full h-auto rounded-xl object-cover"
                                />
                            </div>
                        </div>

                        {/* Content Right side */}
                        <div className="lg:col-span-5 space-y-4 text-left">
                            <h3 className={`text-3xl font-black tracking-tight leading-tight ${contrastLight ? 'text-slate-955' : 'text-white'}`}>
                                A Crowded Market.<br />
                                <span className="bg-gradient-to-r from-rose-500 to-indigo-500 bg-clip-text text-transparent">
                                    Nobody Solves the Real Problem.
                                </span>
                            </h3>
                            <p className={`text-sm leading-relaxed ${contrastLight ? 'text-slate-850 font-bold' : 'text-slate-400'}`}>
                                Traditional annotation suites (Prodigy, Label Studio, Doccano) operate blindly with respect to time and cost. Scale AI addresses cost but uses rigid, static task allocation.
                            </p>
                            <p className={`text-sm leading-relaxed ${contrastLight ? 'text-slate-850 font-bold' : 'text-slate-400'}`}>
                                CAL-Log alone maps to the top-right quadrant, delivering **adaptive active learning** that calculates real cognitive time profiles to optimize budget.
                            </p>
                            <div className="text-sm font-black text-rose-500 uppercase tracking-widest flex items-center gap-2 animate-pulse">
                                <Zap size={16} /> Everyone competes on features. CAL-Log competes on time.
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        // SLIDE 7 — THE GAPS
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
                            title: "Nobody prices per sample",
                            desc: "Every tool assumes a tweet and a 500-word document cost the same. Result: teams pay for hours of trivial labels.",
                            badge: "Confirmed by 19 of 31 domain experts we surveyed",
                            badgeColor: contrastLight ? "bg-rose-100 text-rose-900 border-rose-550 border-2 font-bold" : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        },
                        {
                            num: "2",
                            type: "PRIORITY 2 · BUSINESS",
                            title: "Nobody adapts to the annotator",
                            desc: "One-size-fits-all queues ignore that annotators have different speeds and get tired. Result: burnout and quality drops.",
                            badge: "Flagged in interviews & academic literature (Mortagua, 2025)",
                            badgeColor: contrastLight ? "bg-amber-100 text-amber-905 border-amber-600 border-2 font-bold" : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        },
                        {
                            num: "3",
                            type: "PRIORITY 3 · TECHNICAL",
                            title: "Nobody trusts the model early",
                            desc: "Active learning tools use uncalibrated confidence from round one. Result: the model picks bad samples and the loop degrades.",
                            badge: "Documented failure mode in 52% of active learning benchmarks",
                            badgeColor: contrastLight ? "bg-purple-100 text-purple-900 border-purple-650 border-2 font-bold" : "bg-purple-500/10 text-purple-400 border-purple-500/20"
                        }
                    ].map((gap) => (
                        <div key={gap.num} className={`p-4 rounded-xl border-2 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center ${
                            contrastLight ? 'bg-white border-slate-900 text-slate-950 shadow-md' : 'bg-slate-900/60 border-slate-850'
                        }`}>
                            <div className="flex gap-4 items-start text-left">
                                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-black text-base shrink-0 border-2 border-rose-550/20">
                                    {gap.num}
                                </div>
                                <div className="space-y-1">
                                    <div className={`text-[10px] font-black uppercase tracking-widest ${contrastLight ? 'text-slate-800' : 'text-slate-500'}`}>{gap.type}</div>
                                    <h4 className={`font-black text-base md:text-lg ${contrastLight ? 'text-slate-955' : 'text-white'}`}>{gap.title}</h4>
                                    <p className={`text-xs md:text-sm leading-relaxed ${contrastLight ? 'text-slate-850 font-bold' : 'text-slate-400'}`}>{gap.desc}</p>
                                </div>
                            </div>
                            <span className={`text-[10px] md:text-xs font-bold px-3 py-1 rounded-full border shrink-0 ${gap.badgeColor}`}>
                                {gap.badge}
                            </span>
                        </div>
                    ))}
                </div>
            )
        },
        // SLIDE 8 — OUR SOLUTION & ARCHITECTURE
        {
            title: "Our Solution: Live Microservice Architecture",
            subtitle: "100% accurate view of our deployed Node.js & Python backend pipeline.",
            icon: Brain,
            iconColor: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
            content: (
                <div className="h-full flex flex-col justify-center gap-6 max-w-5xl mx-auto py-2">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                        
                        {/* 100% Accurate Architecture Diagram */}
                        <div className="lg:col-span-7 flex justify-center">
                            <div className={`relative w-full max-w-[450px] rounded-2xl p-1 overflow-hidden shadow-2xl border-2 hover:scale-102 transition-all duration-300 ${
                                contrastLight ? 'bg-white border-slate-900 shadow-md' : 'bg-slate-900/60 border-slate-850'
                            }`}>
                                <img 
                                    src="/system_architecture.png" 
                                    alt="Live Microservices System Architecture Diagram" 
                                    className="w-full h-auto rounded-xl object-cover"
                                />
                            </div>
                        </div>

                        {/* Content Right side */}
                        <div className="lg:col-span-5 space-y-4 text-left">
                            <h3 className={`text-2xl md:text-3xl font-black tracking-tight leading-tight ${contrastLight ? 'text-slate-955' : 'text-white'}`}>
                                Production-Grade<br />
                                <span className="bg-gradient-to-r from-emerald-400 to-indigo-500 bg-clip-text text-transparent">
                                    Microservice Loop
                                </span>
                            </h3>
                            <p className={`text-sm leading-relaxed ${contrastLight ? 'text-slate-800 font-bold' : 'text-slate-400'}`}>
                                Not a simple prototype script. CAL-Log runs a distributed Node.js server gateway integrated with an active Python Flask simulation server.
                            </p>
                            
                            <div className="space-y-2.5 text-xs md:text-sm text-slate-450 leading-relaxed">
                                <div className="flex gap-2">
                                    <div className="p-1 rounded bg-indigo-500/10 text-indigo-400 shrink-0"><Check size={12} /></div>
                                    <span className={`${contrastLight ? 'text-slate-900 font-bold' : ''}`}><b>Client Tier:</b> Workspace UI, Fatigue Tracking, and live ROI calculators in React.</span>
                                </div>
                                <div className="flex gap-2">
                                    <div className="p-1 rounded bg-indigo-500/10 text-indigo-400 shrink-0"><Check size={12} /></div>
                                    <span className={`${contrastLight ? 'text-slate-900 font-bold' : ''}`}><b>Server Tier:</b> REST API gateway, Mongoose session controllers, and MongoDB storage.</span>
                                </div>
                                <div className="flex gap-2">
                                    <div className="p-1 rounded bg-indigo-500/10 text-indigo-400 shrink-0"><Check size={12} /></div>
                                    <span className={`${contrastLight ? 'text-slate-900 font-bold' : ''}`}><b>Logic Tier:</b> Python adaptive regression engines. Recalibrates Alpha and Beta parameters every round.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        // SLIDE 9 — THE CORE MATHEMATICAL ENGINE
        {
            title: "Under The Hood: Core Algorithmic Selection",
            subtitle: "Cost-Aware Active Learning selection balanced against online timing timing models.",
            icon: Cpu,
            iconColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
            content: (
                <div className="h-full flex flex-col justify-center gap-6 max-w-5xl mx-auto py-2">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                        {/* Left Side: Code Block */}
                        <div className="lg:col-span-7 w-full">
                            <div className={`p-4 rounded-xl border-2 font-mono text-xs md:text-sm leading-relaxed overflow-x-auto text-left shadow-lg ${
                                contrastLight ? 'bg-slate-900 border-slate-950 text-emerald-450 font-bold' : 'bg-slate-950 border-slate-800 text-emerald-400'
                            }`}>
                                <div className="text-slate-500 mb-1">// Dynamic Selection Utility balancing info vs. human latency</div>
                                <span className="text-purple-400">def</span> <span className="text-blue-400">calculate_selection_utility</span>(uncertainty, reading_speed_residual):<br />
                                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-500"># 1. Fatigue check using OLS residual timing signals</span><br />
                                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">if</span> reading_speed_residual &gt;= <span className="text-amber-450 font-black">1.5</span> * baseline_speed:<br />
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-500"># User is fatigued: route simple calibration texts</span><br />
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">return</span> route_low_complexity_samples()<br />
                                <br />
                                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-500"># 2. Information density divided by expected cost (in seconds)</span><br />
                                &nbsp;&nbsp;&nbsp;&nbsp;expected_seconds = alpha + beta * log(text_length)<br />
                                &nbsp;&nbsp;&nbsp;&nbsp;utility = uncertainty / expected_seconds<br />
                                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">return</span> argmax(utility)<br />
                            </div>
                        </div>

                        {/* Right Side: Math Explanation */}
                        <div className="lg:col-span-5 space-y-4 text-left">
                            <h3 className={`text-2xl md:text-3xl font-black tracking-tight leading-tight ${contrastLight ? 'text-slate-955' : 'text-white'}`}>
                                How the Algorithm Thinks
                            </h3>
                            <p className={`text-sm leading-relaxed ${contrastLight ? 'text-slate-800 font-bold' : 'text-slate-400'}`}>
                                Instead of just selecting the most uncertain text, CAL-Log selection is **divided by the predicted human time cost** ($\alpha + \beta \log(L)$).
                            </p>
                            <p className={`text-sm leading-relaxed ${contrastLight ? 'text-slate-800 font-bold' : 'text-slate-400'}`}>
                                By tracking the standard deviation of annotator reading speed, we monitor cognitive friction. If a user slows down (fatigue), the system pivots to easy recovery texts to prevent dataset label collapse.
                            </p>
                        </div>
                    </div>
                </div>
            )
        },
        // SLIDE 10 — FEATURE MATCHUP & PERFORMANCE
        {
            title: "Does it actually work? Six of six ticks.",
            subtitle: "3.9x faster than the next best tool to reach target accuracy.",
            icon: ShieldCheck,
            iconColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
            content: (
                <div className="h-full flex flex-col justify-center gap-4 max-w-[1200px] mx-auto py-2 px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        
                        {/* Comparison Table */}
                        <div className="lg:col-span-5 overflow-x-auto w-full space-y-3 text-left">
                            <h4 className={`text-base font-black tracking-tight ${contrastLight ? 'text-slate-955' : 'text-slate-200'}`}>
                                Feature Matchup vs. Competitors
                            </h4>
                            <table className="w-full text-left border-collapse text-xs md:text-sm">
                                <thead>
                                    <tr className={`border-b ${contrastLight ? 'border-slate-900' : 'border-slate-800'}`}>
                                        <th className={`py-2 font-black text-sm ${contrastLight ? 'text-slate-950' : 'text-slate-400'}`}>Features</th>
                                        <th className="py-2 font-black text-rose-500 text-center text-sm">CAL-Log</th>
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
                                        ["Calibrated Confidence", true, false, false, false],
                                        ["Transparent Explanations", true, false, false, false]
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
 
                        {/* Cost Efficiency Horizontal Bar Chart (Custom Dynamic CSS Graph) */}
                        <div className="lg:col-span-7 space-y-3">
                            <div className="flex flex-col gap-1 text-left">
                                <h4 className={`text-base font-black tracking-tight ${contrastLight ? 'text-slate-950' : 'text-slate-200'}`}>
                                    Cost Efficiency: Time to Reach F1 = 0.80
                                </h4>
                                <span className={`text-xs font-bold ${contrastLight ? 'text-slate-800 font-black' : 'text-slate-500'}`}>
                                    Mean Annotation Time (minutes) across 10 datasets (Lower = Better)
                                </span>
                            </div>
 
                            {/* Chart Container */}
                            <div className={`p-4 rounded-xl border-2 space-y-3 ${
                                contrastLight ? 'bg-white border-slate-900 text-slate-950' : 'bg-slate-900/40 border-slate-850'
                            }`}>
                                {[
                                    { name: "Entropy", time: 148.5, ciStart: 5, ciEnd: 303, color: "bg-green-500/80" },
                                    { name: "CoreSet", time: 140.9, ciStart: 0, ciEnd: 286, color: "bg-cyan-500/80" },
                                    { name: "BADGE", time: 126.5, ciStart: 21, ciEnd: 242, color: "bg-blue-500/80" },
                                    { name: "Margin", time: 121.0, ciStart: 5, ciEnd: 238, color: "bg-amber-600/85" },
                                    { name: "LeastConfidence", time: 105.9, ciStart: 32, ciEnd: 190, color: "bg-purple-500/80" },
                                    { name: "Random", time: 93.7, ciStart: 38, ciEnd: 150, color: "bg-slate-550/80" },
                                    { name: "CAL-Log (Ours)", time: 38.3, ciStart: 15, ciEnd: 62, color: "bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.4)]", isHighlight: true }
                                ].map((item, idx) => {
                                    const maxVal = 310;
                                    const barWidth = (item.time / maxVal) * 100;
                                    const ciLeft = (item.ciStart / maxVal) * 100;
                                    const ciWidth = ((item.ciEnd - item.ciStart) / maxVal) * 100;
 
                                    return (
                                        <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                                            {/* Label */}
                                            <div className={`col-span-3 text-right text-xs font-bold truncate ${
                                                item.isHighlight ? 'text-rose-500 font-black' : contrastLight ? 'text-slate-950 font-black' : 'text-slate-400'
                                            }`}>
                                                {item.name}
                                            </div>
 
                                            {/* Bar and Error Range */}
                                            <div className={`col-span-7 relative h-5 flex items-center rounded border overflow-visible ${contrastLight ? 'bg-slate-100 border-slate-900 border-2' : 'bg-slate-950/40 border-slate-900/50'}`}>
                                                {/* Error Bar (CI) */}
                                                <div 
                                                    className={`absolute h-0.5 flex items-center justify-between ${contrastLight ? 'bg-slate-950' : 'bg-slate-650'}`}
                                                    style={{ left: `${ciLeft}%`, width: `${ciWidth}%` }}
                                                >
                                                    <div className={`w-0.5 h-2 shrink-0 ${contrastLight ? 'bg-slate-955' : 'bg-slate-650'}`} />
                                                    <div className={`w-0.5 h-2 shrink-0 ${contrastLight ? 'bg-slate-955' : 'bg-slate-650'}`} />
                                                </div>
 
                                                {/* Value Bar */}
                                                <div 
                                                    className={`absolute h-3.5 rounded-sm transition-all duration-1000 ${item.color} ${
                                                        item.isHighlight ? 'border-2 border-white' : ''
                                                    } ${contrastLight ? 'border border-slate-950' : ''}`}
                                                    style={{ width: `${barWidth}%`, left: '0%' }}
                                                />
                                            </div>
 
                                            {/* Value */}
                                            <div className={`col-span-2 text-xs font-mono font-bold ${
                                                item.isHighlight ? 'text-rose-600 font-extrabold' : contrastLight ? 'text-slate-955 font-black' : 'text-slate-400'
                                            }`}>
                                                {item.time.toFixed(1)}m
                                            </div>
                                        </div>
                                    );
                                })}
 
                                {/* X-Axis Scale */}
                                <div className="grid grid-cols-12 gap-2 border-t border-slate-800/60 pt-2 text-[10px] font-mono text-slate-500">
                                    <div className="col-span-3" />
                                    <div className="col-span-7 flex justify-between px-1">
                                        <span>0m</span>
                                        <span>100m</span>
                                        <span>200m</span>
                                        <span>300m</span>
                                    </div>
                                    <div className="col-span-2 text-right">Time</div>
                                </div>
                            </div>
                        </div>
 
                    </div>
                </div>
            )
        },
        // SLIDE 11 — BUSINESS ECONOMICS
        {
            title: "Business Economics & Pricing Tiers",
            subtitle: "One project's savings covers a month of running the tool.",
            icon: Cpu,
            iconColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
            content: (
                <div className="h-full flex flex-col justify-center gap-6 max-w-[1200px] mx-auto py-2 px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* Math Breakdown */}
                        <div className={`p-6 rounded-2xl border-2 flex flex-col justify-between min-h-[300px] ${
                            contrastLight ? 'bg-white border-slate-900 text-slate-950 shadow-md' : 'bg-slate-900/50 border-slate-850 shadow-2xl'
                        }`}>
                            <div className="space-y-3 text-left">
                                <span className="text-xs font-black text-rose-500 uppercase tracking-widest block">THE MATH</span>
                                <h4 className="font-black text-xl">Operating Economics</h4>
                                
                                <div className="space-y-3 text-xs md:text-sm text-slate-400">
                                    <div className={`border-b pb-2 ${contrastLight ? 'border-slate-300' : 'border-slate-800/60'}`}>
                                        <div className="flex justify-between font-bold text-slate-200">
                                            <span className={`${contrastLight ? 'text-slate-900 font-bold' : ''}`}>Running Costs:</span>
                                            <span className={`font-mono text-base ${contrastLight ? 'text-slate-950 font-black' : 'text-white'}`}>$250 / mo</span>
                                        </div>
                                        <div className={`text-[10px] leading-relaxed mt-1 ${contrastLight ? 'text-slate-800' : 'text-slate-500'}`}>
                                            MongoDB Atlas ($120) + AWS Node Host ($80) + Security & Logging ($50). Supports up to 50 active annotators.
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <div className="flex justify-between font-bold text-slate-250">
                                            <span className={`${contrastLight ? 'text-slate-900 font-bold' : ''}`}>Saves Per Project:</span>
                                            <span className="font-mono text-emerald-600 text-base font-black">+$1,530 saved</span>
                                        </div>
                                        <div className={`text-[10px] leading-relaxed mt-1 ${contrastLight ? 'text-slate-800 font-bold' : 'text-slate-500'}`}>
                                            Based on 10,000 records: Manual labor (140 hrs × $15) vs. CAL-Log (38 hrs × $15).
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p className={`text-[10px] italic border-t pt-2 text-left ${contrastLight ? 'border-slate-300 text-slate-800 font-black' : 'border-slate-800/40 text-slate-500'}`}>
                                Every dataset labeled after the first project is pure operating margin.
                            </p>
                        </div>

                        {/* Revenue Model & SLAs */}
                        <div className={`p-6 rounded-2xl border-2 flex flex-col justify-between min-h-[300px] ${
                            contrastLight ? 'bg-white border-slate-900 text-slate-950 shadow-md' : 'bg-slate-900/50 border-slate-850 shadow-2xl'
                        }`}>
                            <div className="space-y-3 text-left">
                                <span className="text-xs font-black text-indigo-400 uppercase tracking-widest block">REVENUE MODEL</span>
                                <h4 className="font-black text-xl">Tiers & Licensing</h4>
                                
                                <div className="space-y-3 text-xs md:text-sm text-slate-400">
                                    <div className={`border-b pb-2 ${contrastLight ? 'border-slate-300' : 'border-slate-800/40'}`}>
                                        <span className={`font-black block text-base ${contrastLight ? 'text-slate-950' : 'text-slate-200'}`}>Free Tier</span>
                                        <span className={`text-[10px] ${contrastLight ? 'text-slate-800 font-bold' : ''}`}>Solo researchers, local projects, and small pilot runs.</span>
                                    </div>
                                    <div className={`border-b pb-2 ${contrastLight ? 'border-slate-300' : 'border-slate-800/40'}`}>
                                        <span className="font-black text-indigo-500 block text-base">$49 / mo (Teams)</span>
                                        <span className={`text-[10px] ${contrastLight ? 'text-slate-800 font-bold' : ''}`}>Small teams up to 5 concurrent annotators, shared MongoDB.</span>
                                    </div>
                                    <div>
                                        <span className="font-black text-rose-500 block text-base">$499 / mo (Enterprise)</span>
                                        <div className={`text-[10px] leading-relaxed mt-1 ${contrastLight ? 'text-slate-800 font-bold' : 'text-slate-550'}`}>
                                            On-premise deployment, custom API integrations, and premium <b>Service Level Agreements (SLAs)</b>:
                                            <ul className="list-disc pl-4 mt-0.5 space-y-0.5">
                                                <li>99.9% Net Platform Uptime Guarantee</li>
                                                <li>&lt;4-Hour Support Response Window</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Target Segment */}
                        <div className={`p-6 rounded-2xl border-2 flex flex-col justify-between min-h-[300px] ${
                            contrastLight ? 'bg-white border-slate-900 text-slate-950 shadow-md' : 'bg-slate-900/50 border-slate-850 shadow-2xl'
                        }`}>
                            <div className="space-y-3 text-left">
                                <span className="text-xs font-black text-emerald-400 uppercase tracking-widest block">WHO IT'S FOR</span>
                                <h4 className="font-black text-xl">Immediate Users</h4>
                                
                                <div className="space-y-4 text-xs md:text-sm text-slate-400 mt-1">
                                    <div className="flex gap-2">
                                        <span className="text-emerald-500 font-extrabold text-sm">➔</span>
                                        <div>
                                            <b className={`block text-base ${contrastLight ? 'text-slate-950' : 'text-slate-200'}`}>ML Text Teams</b>
                                            <span className={`text-[10px] leading-tight block mt-0.5 ${contrastLight ? 'text-slate-800 font-bold' : 'text-slate-450'}`}>Fintech, legaltech, and clinical developers with privacy restrictions.</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-emerald-500 font-extrabold text-sm">➔</span>
                                        <div>
                                            <b className={`block text-base ${contrastLight ? 'text-slate-955' : 'text-slate-200'}`}>University Labs</b>
                                            <span className={`text-[10px] leading-tight block mt-0.5 ${contrastLight ? 'text-slate-800 font-bold' : 'text-slate-450'}`}>NLP labs seeking maximum accuracy per grant dollar.</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-emerald-500 font-extrabold text-sm">➔</span>
                                        <div>
                                            <b className={`block text-base ${contrastLight ? 'text-slate-955' : 'text-slate-200'}`}>Labeling Agencies</b>
                                            <span className={`text-[10px] leading-tight block mt-0.5 ${contrastLight ? 'text-slate-800 font-bold' : 'text-slate-450'}`}>Firms billing clients hourly using active learning to expand margins.</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        // SLIDE 12 — LEAN CANVAS STRATEGY - PART 1
        {
            title: "Lean Canvas Business Strategy (Part 1)",
            subtitle: "First three columns of the strategic business roadmap.",
            icon: Database,
            iconColor: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
            content: (
                <div className="h-full flex flex-col justify-center gap-6 max-w-5xl mx-auto py-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                        
                        {/* Box 1 */}
                        <div className={`p-6 rounded-2xl border-2 space-y-3 min-h-[320px] ${
                            contrastLight ? 'bg-white border-slate-900 text-slate-950 shadow-md font-bold' : 'bg-slate-900/60 border-slate-800 text-slate-400'
                        }`}>
                            <span className="font-black text-rose-500 uppercase tracking-wider block text-sm">1. PROBLEM</span>
                            <div className="h-px bg-rose-500/30 my-2" />
                            <ul className={`space-y-2 text-sm leading-relaxed ${contrastLight ? 'text-slate-900 font-black' : ''}`}>
                                <li>• High human annotation costs (80% of project spend)</li>
                                <li>• Annotator cognitive fatigue goes unmonitored</li>
                                <li>• Redundant text selection wastes expert time</li>
                            </ul>
                        </div>
 
                        {/* Box 2 */}
                        <div className={`p-6 rounded-2xl border-2 space-y-3 min-h-[320px] ${
                            contrastLight ? 'bg-white border-slate-900 text-slate-950 shadow-md font-bold' : 'bg-slate-900/60 border-slate-800 text-slate-400'
                        }`}>
                            <span className="font-black text-rose-500 uppercase tracking-wider block text-sm">2. SOLUTION</span>
                            <div className="h-px bg-rose-500/30 my-2" />
                            <ul className={`space-y-2 text-sm leading-relaxed ${contrastLight ? 'text-slate-900 font-black' : ''}`}>
                                <li>• Cost-aware active learning selection</li>
                                <li>• Adaptive annotator speed timing loops (OLS)</li>
                                <li>• Semantic text deduplication on client upload</li>
                            </ul>
                        </div>
 
                        {/* Box 3 */}
                        <div className={`p-6 rounded-2xl border-2 space-y-3 min-h-[320px] ${
                            contrastLight ? 'bg-white border-slate-900 text-slate-950 shadow-md font-bold' : 'bg-slate-900/60 border-slate-800 text-slate-400'
                        }`}>
                            <span className="font-black text-rose-500 uppercase tracking-wider block text-sm">3. UNIQUE VALUE PROP</span>
                            <div className="h-px bg-rose-500/30 my-2" />
                            <ul className={`space-y-2 text-sm leading-relaxed ${contrastLight ? 'text-slate-900 font-black' : ''}`}>
                                <li>• 3.9x speedup over standard baseline queues</li>
                                <li>• Plugs directly into standard pipelines (REST API)</li>
                                <li>• Full transparency showing *why* samples were selected</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )
        },
        // SLIDE 13 — LEAN CANVAS STRATEGY - PART 2
        {
            title: "Lean Canvas Business Strategy (Part 2)",
            subtitle: "Remaining three columns of the strategic business roadmap.",
            icon: Database,
            iconColor: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
            content: (
                <div className="h-full flex flex-col justify-center gap-6 max-w-5xl mx-auto py-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                        
                        {/* Box 4 */}
                        <div className={`p-6 rounded-2xl border-2 space-y-3 min-h-[320px] ${
                            contrastLight ? 'bg-white border-slate-900 text-slate-950 shadow-md font-bold' : 'bg-slate-900/60 border-slate-800 text-slate-400'
                        }`}>
                            <span className="font-black text-indigo-505 uppercase tracking-wider block text-sm">4. UNFAIR ADVANTAGE</span>
                            <div className="h-px bg-indigo-505/30 my-2" />
                            <ul className={`space-y-2 text-sm leading-relaxed ${contrastLight ? 'text-slate-900 font-black' : ''}`}>
                                <li>• First framework combining cost-awareness, speed adaptation, and confidence calibration</li>
                                <li>• Peer-reviewed status at ACL 2026</li>
                            </ul>
                        </div>
 
                        {/* Box 5 */}
                        <div className={`p-6 rounded-2xl border-2 space-y-3 min-h-[320px] ${
                            contrastLight ? 'bg-white border-slate-900 text-slate-950 shadow-md font-bold' : 'bg-slate-900/60 border-slate-800 text-slate-400'
                        }`}>
                            <span className="font-black text-indigo-505 uppercase tracking-wider block text-sm">5. CUSTOMER SEGMENTS</span>
                            <div className="h-px bg-indigo-505/30 my-2" />
                            <ul className={`space-y-2 text-sm leading-relaxed ${contrastLight ? 'text-slate-900 font-black' : ''}`}>
                                <li>• ML research teams building language AI tools</li>
                                <li>• University NLP labs with tight grant budgets</li>
                                <li>• Data annotation agencies billing hourly</li>
                            </ul>
                        </div>
 
                        {/* Box 6 */}
                        <div className={`p-6 rounded-2xl border-2 space-y-3 min-h-[320px] ${
                            contrastLight ? 'bg-white border-slate-900 text-slate-950 shadow-md font-bold' : 'bg-slate-900/60 border-slate-800 text-slate-400'
                        }`}>
                            <span className="font-black text-indigo-505 uppercase tracking-wider block text-sm">6. CHANNELS</span>
                            <div className="h-px bg-indigo-505/30 my-2" />
                            <ul className={`space-y-2 text-sm leading-relaxed ${contrastLight ? 'text-slate-900 font-black' : ''}`}>
                                <li>• Open-source model plugins (Label Studio integrations)</li>
                                <li>• Research papers & ML presentations (ACL)</li>
                                <li>• Direct developer word-of-mouth outreach</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )
        },
        // SLIDE 14 — VALIDATED BY EXPERTS (quotes from user feedback)
        {
            title: "Validated by the ML & Cognitive Science Community",
            subtitle: "Peer feedback and evaluations from PhD candidates, researchers, and engineers.",
            icon: Users,
            iconColor: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
            content: (
                <div className="h-full flex flex-col justify-center gap-6 max-w-6xl mx-auto py-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* Quote 1: METU PhD Cognitive Science */}
                        <div className={`p-5 rounded-xl border-2 flex flex-col justify-between ${contrastLight ? 'bg-white border-slate-900 text-slate-950 shadow-md' : 'bg-slate-900/60 border-slate-800'}`}>
                            <p className={`text-[13px] italic leading-relaxed ${contrastLight ? 'text-slate-900 font-bold' : 'text-slate-200'}`}>
                                "Personalizing the annotation process is great. Using reading time and overhead patterns as a proxy for cognitive load is highly valid... Differentiating underlying causes of reading speed variations is crucial for real-world application."
                            </p>
                            <div className="mt-3 border-t border-slate-850 pt-2 text-right">
                                <span className="font-black text-xs block">Ibrahim Ethem Deveci</span>
                                <span className="text-[10px] text-indigo-400 font-extrabold">PhD Student, METU Cognitive Science</span>
                            </div>
                        </div>

                        {/* Quote 2: UF NLP Candidate */}
                        <div className={`p-5 rounded-xl border-2 flex flex-col justify-between ${contrastLight ? 'bg-white border-slate-900 text-slate-950 shadow-md' : 'bg-slate-900/60 border-slate-800'}`}>
                            <p className={`text-[13px] italic leading-relaxed ${contrastLight ? 'text-slate-900 font-bold' : 'text-slate-200'}`}>
                                "Dynamic cost calculation is a huge step up from pure entropy sampling which often just feeds annotators garbage data. Clamping the parameters makes a lot of sense for outlier filtering."
                            </p>
                            <div className="mt-3 border-t border-slate-850 pt-2 text-right">
                                <span className="font-black text-xs block">Shlok Gilda</span>
                                <span className="text-[10px] text-indigo-455 font-extrabold">PhD Candidate @ UF | NLP & Cybersecurity</span>
                            </div>
                        </div>

                        {/* Quote 3: Cognitive Science Researcher */}
                        <div className={`p-5 rounded-xl border-2 flex flex-col justify-between ${contrastLight ? 'bg-white border-slate-900 text-slate-950 shadow-md' : 'bg-slate-900/60 border-slate-800'}`}>
                            <p className={`text-[13px] italic leading-relaxed ${contrastLight ? 'text-slate-900 font-bold' : 'text-slate-200'}`}>
                                "Using reading speed together with interaction time is a meaningful way to analyze cognitive load... these signals can be robust to individual baseline differences."
                            </p>
                            <div className="mt-3 border-t border-slate-850 pt-2 text-right">
                                <span className="font-black text-xs block">Hinduja Balasubramaniyam</span>
                                <span className="text-[10px] text-indigo-400 font-extrabold">Cognitive Science & NLP Researcher</span>
                            </div>
                        </div>

                        {/* Quote 4: Data Analyst */}
                        <div className={`p-5 rounded-xl border-2 flex flex-col justify-between ${contrastLight ? 'bg-white border-slate-900 text-slate-950 shadow-md' : 'bg-slate-900/60 border-slate-800'}`}>
                            <p className={`text-[13px] italic leading-relaxed ${contrastLight ? 'text-slate-900 font-bold' : 'text-slate-200'}`}>
                                "Real-world annotation fatigue isn't just about reading time. It is influenced by context switching, complexity, and micro-interactions. Real-time client-side timing is a solid, practical approach."
                            </p>
                            <div className="mt-3 border-t border-slate-850 pt-2 text-right">
                                <span className="font-black text-xs block">Seif Feroz</span>
                                <span className="text-[10px] text-indigo-400 font-extrabold">Data Analyst & Operations Lead</span>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        // SLIDE 15 — WHERE WE ARE (WITH IEEE/ACL LOGOS)
        {
            title: "Peer-reviewed. Deployed. Growing.",
            subtitle: "From academic acceptance to active production pilots.",
            icon: ShieldCheck,
            iconColor: "text-emerald-450 bg-emerald-500/10 border-emerald-550/20",
            content: (
                <div className="h-full flex flex-col justify-center gap-6 max-w-5xl mx-auto py-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Publications with logos */}
                        <div className={`p-6 rounded-2xl border-2 text-left flex flex-col justify-between ${
                            contrastLight ? 'bg-white border-slate-900 text-slate-955 shadow-md font-bold' : 'bg-slate-900/60 border-slate-800'
                        }`}>
                            <div>
                                <span className="text-xs font-black text-rose-505 uppercase tracking-widest block mb-4">ACCEPTED & PUBLISHED</span>
                                <div className="space-y-4 text-sm font-bold">
                                    <div className="flex items-center gap-3">
                                        <img src="https://aclanthology.org/images/acl-logo-square.svg" alt="ACL Logo" className="h-8 w-8 object-contain bg-white p-0.5 rounded border border-slate-300 shrink-0" />
                                        <span><b>ACL 2026</b> (Accepted and presented - A* NLP conference)</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/e/e9/IEEE_logo.svg" alt="IEEE Logo" className="h-8 w-8 object-contain bg-white p-0.5 rounded border border-slate-300 shrink-0" />
                                        <span><b>IEEE CSNT 2026</b> (Accepted, in press)</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/e/e9/IEEE_logo.svg" alt="IEEE Logo" className="h-8 w-8 object-contain bg-white p-0.5 rounded border border-slate-300 shrink-0" />
                                        <span><b>ICAIIC 2026</b> (Published in IEEE Xplore)</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/e/e9/IEEE_logo.svg" alt="IEEE Logo" className="h-8 w-8 object-contain bg-white p-0.5 rounded border border-slate-300 shrink-0" />
                                        <span><b>IEEE SCSE 2026</b> (Published, indexing in progress)</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Roadmap */}
                        <div className={`p-6 rounded-2xl border-2 text-left flex flex-col justify-between ${
                            contrastLight ? 'bg-white border-slate-900 text-slate-955 shadow-md' : 'bg-slate-900/60 border-slate-800'
                        }`}>
                            <div>
                                <span className="text-xs font-black text-indigo-505 uppercase tracking-widest block mb-4">ROADMAP</span>
                                <div className="space-y-4 text-xs md:text-sm font-bold">
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
                                        <span className="font-black text-emerald-505">Q3:</span>
                                        <span className={`${contrastLight ? 'text-slate-900 font-extrabold' : 'text-slate-450'}`}>Enterprise on-prem license release with SLAs</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        // SLIDE 16 — CLOSE
        {
            title: "This isn't a research idea. It's a tool, ready today.",
            subtitle: "Same accuracy, a third of the time, at a fraction of the cost.",
            icon: Award,
            iconColor: "text-rose-500 bg-rose-500/10 border-rose-500/20",
            content: (
                <div className="h-full flex flex-col justify-center items-center text-center gap-6 max-w-4xl mx-auto py-2">
                    <img src="/logo.jpg" alt="CAL-Log Logo" className="h-16 md:h-20 object-contain bg-white p-1 rounded-xl border-2 border-slate-350 shadow-md animate-bounce" />
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

                    <div className={`text-xs md:text-sm mt-1 font-black tracking-widest uppercase animate-pulse ${contrastLight ? 'text-slate-955' : 'text-slate-400'}`}>
                        Thank you. Happy to take your questions.
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
                {/* Visual Top Glow */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 via-indigo-500 to-emerald-500 z-20" />
                
                {/* Close Button */}
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
                    /* Lock Screen */
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
                    /* Sliding Carousel Viewport */
                    <>
                        {/* Slide Header */}
                        <div className={`p-6 md:p-8 pb-4 border-b flex justify-between items-center ${
                            contrastLight ? 'border-slate-350 bg-white border-b-2' : 'border-slate-900 bg-slate-950'
                        }`}>
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl border ${slides[currentSlide].iconColor}`}>
                                    <CurrentIcon size={28} />
                                </div>
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-505 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
                                        Slide {currentSlide + 1} of 16
                                    </span>
                                    <h2 className={`text-2xl md:text-3xl font-black mt-1 tracking-tight ${contrastLight ? 'text-slate-955' : 'text-white'}`}>{slides[currentSlide].title}</h2>
                                    <p className={`text-sm font-semibold mt-0.5 ${contrastLight ? 'text-slate-900' : 'text-slate-400'}`}>{slides[currentSlide].subtitle}</p>
                                </div>
                            </div>
                            
                            {/* Projector Optimization Mode Toggle */}
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
                                    {currentSlide === 15 ? 'Start Live Demo' : 'Next Slide'} <ChevronRight size={16} />
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
