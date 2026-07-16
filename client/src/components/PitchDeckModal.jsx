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
    
    // Slide 4: Interactive Matrix states
    const [hoveredCompetitor, setHoveredCompetitor] = useState(null);

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
        if (currentSlide === 10 || currentSlide === 11) {
            onClose(); // Slide 11 (Close) or Slide 12 (Appendix) end of flow -> close and start demo
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
            subtitle: "A smarter way to label data for AI. Built, tested, and published.",
            icon: Sparkles,
            iconColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
            content: (
                <div className="h-full flex flex-col justify-center items-center text-center gap-8 max-w-4xl mx-auto py-4">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-black uppercase tracking-widest animate-pulse">
                            <Award size={14} /> Peer-Reviewed at ACL 2026
                        </div>
                        <h1 className={`text-4xl md:text-6xl font-black tracking-tight leading-tight uppercase ${isLight ? 'text-slate-905' : 'text-white'}`}>
                            AI doesn't run out of data.<br />
                            <span className="bg-gradient-to-r from-rose-500 via-red-505 to-indigo-550 bg-clip-text text-transparent">
                                It runs out of time.
                            </span>
                        </h1>
                        <p className={`text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                            CAL-Log is a cost-aware active learning system that adapts to human speed limits in real-time.
                        </p>
                    </div>

                    <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent my-2" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
                        <div className={`p-4 rounded-2xl border flex flex-col gap-1 items-center justify-center ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-850'}`}>
                            <span className="text-2xl font-black text-rose-500">4</span>
                            <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider">Published Papers</span>
                        </div>
                        <div className={`p-4 rounded-2xl border flex flex-col gap-1 items-center justify-center ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-850'}`}>
                            <span className="text-2xl font-black text-indigo-400">ACL 2026</span>
                            <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider">A* Conference Publication</span>
                        </div>
                        <div className={`p-4 rounded-2xl border flex flex-col gap-1 items-center justify-center ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-850'}`}>
                            <span className="text-2xl font-black text-emerald-400">Vihanga Supasan</span>
                            <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider">Lead Researcher</span>
                        </div>
                    </div>
                </div>
            )
        },
        // SLIDE 2 — THE QUESTION
        {
            title: "How much of your AI project is spent labeling data by hand?",
            subtitle: "The unseen bottleneck holding back generative intelligence.",
            icon: HelpCircle,
            iconColor: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
            content: (
                <div className="h-full flex flex-col justify-center items-center text-center gap-8 max-w-3xl mx-auto py-4">
                    <div className="space-y-4">
                        <h2 className={`text-3xl md:text-5xl font-black tracking-tight leading-snug ${isLight ? 'text-slate-850' : 'text-white'}`}>
                            How much of your AI project is spent labeling data by hand?
                        </h2>
                        <p className={`text-base font-semibold tracking-wider uppercase text-rose-500 animate-pulse`}>
                            Take a guess.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                        {[
                            { name: "Requirements", pct: "5%", color: "border-slate-800 bg-slate-900/40 text-slate-500" },
                            { name: "Model Tuning", pct: "10%", color: "border-slate-800 bg-slate-900/40 text-slate-500" },
                            { name: "Deployment", pct: "5%", color: "border-slate-800 bg-slate-900/40 text-slate-500" },
                            { name: "Human Labeling", pct: "?", color: "border-rose-500/50 bg-rose-950/20 text-rose-400 font-black animate-pulse" }
                        ].map((stage, idx) => (
                            <div key={idx} className={`p-5 rounded-2xl border text-center flex flex-col gap-2 ${stage.color}`}>
                                <span className="text-xs uppercase font-bold tracking-wider">{stage.name}</span>
                                <span className="text-3xl font-black">{stage.pct}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )
        },
        // SLIDE 3 — THE ANSWER
        {
            title: "Eighty Percent.",
            subtitle: "Of every AI project. Humans. One sample at a time.",
            icon: AlertTriangle,
            iconColor: "text-rose-500 bg-rose-500/10 border-rose-500/20",
            content: (
                <div className="h-full flex flex-col justify-center gap-6 max-w-5xl mx-auto py-2">
                    <div className="text-center space-y-2">
                        <h2 className="text-5xl md:text-7xl font-black text-rose-500 tracking-tight uppercase animate-pulse">80%</h2>
                        <p className={`text-base font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                            Of every AI project. Humans, one sample at a time.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
                            <div key={idx} className={`p-5 rounded-2xl border flex flex-col gap-2 ${
                                isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
                            }`}>
                                <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">{stat.label}</span>
                                <h3 className={`text-2xl font-black ${isLight ? 'text-slate-850' : 'text-white'}`}>{stat.value}</h3>
                                <p className="text-[11px] text-slate-450 leading-relaxed mt-1 flex-1">{stat.desc}</p>
                                <span className="text-[9px] text-slate-500 font-mono text-right mt-2">— {stat.source}</span>
                            </div>
                        ))}
                    </div>

                    <div className={`p-4 rounded-xl border text-center font-bold text-xs italic ${
                        isLight ? 'bg-indigo-50 border-indigo-200 text-indigo-850' : 'bg-indigo-950/20 border-indigo-500/20 text-indigo-300'
                    }`}>
                        "If Meta thinks labeling is worth $14 billion, so should every AI team."
                    </div>
                </div>
            )
        },
        // SLIDE 4 — EXISTING SOLUTIONS
        {
            title: "A crowded market. Nobody solves the real problem.",
            subtitle: "Everyone competes on features. CAL-Log competes on time.",
            icon: BarChart2,
            iconColor: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
            content: (
                <div className="h-full flex flex-col justify-center gap-6 max-w-5xl mx-auto py-2">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                        {/* 2x2 Matrix Coordinates */}
                        <div className="lg:col-span-7 flex justify-center">
                            <div className="relative w-full max-w-[380px] aspect-square bg-slate-950 border border-slate-850 rounded-2xl p-6 flex flex-col justify-between overflow-hidden shadow-2xl">
                                
                                {/* Background Quadrants */}
                                <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 opacity-15 pointer-events-none">
                                    <div className="border-r border-b border-slate-800" />
                                    <div className="border-b border-slate-800 bg-indigo-500/5" />
                                    <div className="border-r border-slate-800" />
                                    <div className="bg-slate-900" />
                                </div>

                                {/* Y-Axis Label */}
                                <div className="absolute left-1.5 top-1/2 -translate-y-1/2 -rotate-90 text-[8px] font-black uppercase tracking-widest text-slate-500">
                                    Rigid ── Adaptive to Annotator
                                </div>
                                {/* X-Axis Label */}
                                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase tracking-widest text-slate-500">
                                    Cost-Blind ── Cost-Aware
                                </div>

                                {/* Competitor Coordinates */}
                                {[
                                    { name: "Prodigy", x: "25%", y: "75%", key: "prodigy", desc: "Rigid, Cost-Blind. Treats all annotations as instant." },
                                    { name: "Label Studio", x: "30%", y: "65%", key: "labelstudio", desc: "Rigid, Cost-Blind. Standard manual workflow." },
                                    { name: "Doccano", x: "20%", y: "80%", key: "doccano", desc: "Simple open-source. Rigid & Cost-Blind." },
                                    { name: "Snorkel Flow", x: "40%", y: "45%", key: "snorkel", desc: "Weak supervision focused. High annotator friction." },
                                    { name: "Scale AI", x: "70%", y: "70%", key: "scale", desc: "Cost-Aware but rigid one-size-fits-all queues." },
                                    { name: "CAL-Log", x: "85%", y: "20%", key: "callog", desc: "Adaptive & Cost-Aware. Evaluates cognitive time.", highlight: true }
                                ].map((c) => (
                                    <button
                                        key={c.key}
                                        className={`absolute px-2 py-1 rounded text-[9px] font-black tracking-wide border transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 ${
                                            c.highlight 
                                                ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-extrabold shadow-lg shadow-rose-500/10 scale-110 z-10 animate-pulse'
                                                : hoveredCompetitor === c.key 
                                                    ? 'bg-slate-800 border-slate-600 text-white z-10 scale-105' 
                                                    : 'bg-slate-900/80 border-slate-800/80 text-slate-500'
                                        }`}
                                        style={{ left: c.x, top: c.y }}
                                        onMouseEnter={() => setHoveredCompetitor(c.key)}
                                        onMouseLeave={() => setHoveredCompetitor(null)}
                                    >
                                        {c.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Content Right side */}
                        <div className="lg:col-span-5 space-y-4">
                            <h3 className={`text-2xl font-black leading-tight ${isLight ? 'text-slate-805' : 'text-white'}`}>
                                The Market Map
                            </h3>
                            <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                                Traditional annotation suites build cost-blind features. Scale AI has cost awareness but treats every human timing as identical. 
                            </p>
                            <div className={`p-4 rounded-xl border ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950/60 border-slate-900'}`}>
                                {hoveredCompetitor ? (
                                    <div className="animate-fade-in space-y-1">
                                        <div className="text-xs font-black uppercase text-indigo-400">
                                            {hoveredCompetitor.toUpperCase()}
                                        </div>
                                        <p className="text-[11px] text-slate-300 leading-relaxed">
                                            {hoveredCompetitor === 'callog' ? "CAL-Log (Us): Combines real-time human timing models with uncertainty loops." : "Traditional baseline tools ignore individual speed profiles and sample complexity."}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="text-xs text-slate-500 font-mono italic">
                                        *Hover over a competitor on the map to evaluate positioning.*
                                    </div>
                                )}
                            </div>
                            <div className="text-xs font-black text-rose-500 uppercase tracking-widest flex items-center gap-1.5">
                                <Zap size={14} /> CAL-Log competes on time.
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        // SLIDE 5 — THE GAPS
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
                            badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        },
                        {
                            num: "2",
                            type: "PRIORITY 2 · BUSINESS",
                            title: "Nobody adapts to the annotator",
                            desc: "One-size-fits-all queues ignore that annotators have different speeds and get tired. Result: burnout and quality drops.",
                            badge: "Flagged in interviews & academic literature (Mortagua, 2025)",
                            badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        },
                        {
                            num: "3",
                            type: "PRIORITY 3 · TECHNICAL",
                            title: "Nobody trusts the model early",
                            desc: "Active learning tools use uncalibrated confidence from round one. Result: the model picks bad samples and the loop degrades.",
                            badge: "Documented failure mode in 52% of active learning benchmarks",
                            badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20"
                        }
                    ].map((gap) => (
                        <div key={gap.num} className={`p-4 rounded-xl border flex flex-col md:flex-row gap-4 justify-between items-start md:items-center ${
                            isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-850'
                        }`}>
                            <div className="flex gap-4 items-start">
                                <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center font-black text-sm shrink-0">
                                    {gap.num}
                                </div>
                                <div className="space-y-0.5">
                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{gap.type}</div>
                                    <h4 className={`font-black text-sm ${isLight ? 'text-slate-800' : 'text-white'}`}>{gap.title}</h4>
                                    <p className="text-xs text-slate-400 leading-relaxed">{gap.desc}</p>
                                </div>
                            </div>
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${gap.badgeColor}`}>
                                {gap.badge}
                            </span>
                        </div>
                    ))}
                </div>
            )
        },
        // SLIDE 6 — OUR SOLUTION
        {
            title: "Our Solution: Waze for data labeling.",
            subtitle: "It routes your team around the slow, the redundant, and the uncertain.",
            icon: Brain,
            iconColor: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
            content: (
                <div className="h-full flex flex-col justify-center gap-6 max-w-5xl mx-auto py-2">
                    <div className={`p-4 rounded-xl border text-center ${
                        isLight ? 'bg-indigo-50 border-indigo-200' : 'bg-indigo-950/10 border-indigo-500/25'
                    }`}>
                        <p className={`text-sm font-bold ${isLight ? 'text-indigo-900' : 'text-indigo-300'}`}>
                            "Think of it as Waze for data labeling. It routes your team around the slow, the redundant, and the uncertain."
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {[
                            {
                                title: "INNOVATION",
                                label: "A new kind of Active Learning",
                                desc: "First framework to combine cost-aware selection, live annotator adaptation, and calibrated confidence in one loop."
                            },
                            {
                                title: "APPLICATION",
                                label: "Production-Grade Engineering",
                                desc: "RoBERTa + SBERT + Node/React + MongoDB. Distributed microservices. Not a research script. A running product."
                            },
                            {
                                title: "COMPATIBILITY",
                                label: "Plugs into any Pipeline",
                                desc: "Standard REST API. JSON in, JSON out. Any annotation team, any domain, any deployment."
                            }
                        ].map((col, idx) => (
                            <div key={idx} className={`p-5 rounded-2xl border flex flex-col gap-2 ${
                                isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-slate-800'
                            }`}>
                                <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">{col.title}</span>
                                <h4 className={`font-black text-sm mt-1 ${isLight ? 'text-slate-800' : 'text-white'}`}>{col.label}</h4>
                                <p className="text-xs text-slate-400 leading-relaxed mt-1">{col.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )
        },
        // SLIDE 7 — TESTED. VALIDATED. STANDARDS-READY.
        {
            title: "Does it actually work? Six of six ticks.",
            subtitle: "3.9x faster than the next best tool to reach target accuracy.",
            icon: ShieldCheck,
            iconColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
            content: (
                <div className="h-full flex flex-col justify-center gap-4 max-w-5xl mx-auto py-1">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                        
                        {/* Comparison Table */}
                        <div className="lg:col-span-8 overflow-x-auto w-full">
                            <table className="w-full text-left border-collapse text-[10px]">
                                <thead>
                                    <tr className="border-b border-slate-800">
                                        <th className="py-1.5 font-black text-slate-405">Features</th>
                                        <th className="py-1.5 font-black text-rose-400 text-center">CAL-Log</th>
                                        <th className="py-1.5 font-black text-slate-500 text-center">Prodigy</th>
                                        <th className="py-1.5 font-black text-slate-505 text-center">Scale AI</th>
                                        <th className="py-1.5 font-black text-slate-505 text-center">Snorkel</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-900/50">
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
                                            <td className="py-1.5 font-semibold text-slate-300">{row[0]}</td>
                                            <td className="py-1.5 text-center font-black text-rose-500">{row[1] ? "✓" : "—"}</td>
                                            <td className="py-1.5 text-center text-slate-600">{row[2] ? "✓" : "—"}</td>
                                            <td className="py-1.5 text-center text-slate-600">{row[3] ? "✓" : "—"}</td>
                                            <td className="py-1.5 text-center text-slate-600">{row[4] ? "✓" : "—"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Outcomes & Standards */}
                        <div className="lg:col-span-4 space-y-4">
                            <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl text-center">
                                <span className="text-[9px] font-black text-rose-400 uppercase tracking-wider block mb-1">PROVEN RESULT</span>
                                <h3 className="text-3xl font-black text-rose-500 leading-none">3.9x</h3>
                                <p className="text-[10px] text-rose-300 font-bold uppercase tracking-wider mt-1.5">faster to target accuracy</p>
                                <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">38 min (CAL-Log) vs. 148 min (Entropy) averaged across 10 datasets.</p>
                            </div>

                            <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">STANDARDS COMPLIANT</span>
                                <div className="grid grid-cols-2 gap-1 text-[9px] text-slate-400 font-bold">
                                    <span>✓ UK GDPR (Zero PII)</span>
                                    <span>✓ BCS Conduct Code</span>
                                    <span>✓ OWASP Security</span>
                                    <span>✓ WCAG Accessibility</span>
                                    <span>✓ ISO/IEC 25010</span>
                                    <span>✓ 99%+ Uptime</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        // SLIDE 8 — BUSINESS IMPACT
        {
            title: "Business Impact",
            subtitle: "One project's savings covers a month of running the tool.",
            icon: Cpu,
            iconColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
            content: (
                <div className="h-full flex flex-col justify-center gap-6 max-w-5xl mx-auto py-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        {/* Math */}
                        <div className={`p-5 rounded-2xl border flex flex-col gap-2 ${
                            isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
                        }`}>
                            <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">THE MATH</span>
                            <h4 className={`font-black text-base mt-1 ${isLight ? 'text-slate-850' : 'text-white'}`}>Simple Economics</h4>
                            <div className="space-y-2 mt-2 text-xs text-slate-400 leading-relaxed">
                                <div className="flex justify-between border-b border-slate-800/40 pb-1">
                                    <span>Costs to run:</span>
                                    <span className="font-mono text-white">$200–300 / mo</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-800/40 pb-1">
                                    <span>Saves per project:</span>
                                    <span className="font-mono text-emerald-400">$600 (Typical)</span>
                                </div>
                                <p className="text-[10px] text-slate-500 italic mt-2">Every project after the first is pure operating margin.</p>
                            </div>
                        </div>

                        {/* Revenue */}
                        <div className={`p-5 rounded-2xl border flex flex-col gap-2 ${
                            isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
                        }`}>
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">REVENUE MODEL</span>
                            <h4 className={`font-black text-base mt-1 ${isLight ? 'text-slate-850' : 'text-white'}`}>Tiers & Licensing</h4>
                            <div className="space-y-2 mt-2 text-[11px] text-slate-400">
                                <div><b className="text-slate-200">Free</b> — Solo researchers, small pilot runs</div>
                                <div><b className="text-indigo-400">$49/mo</b> — Small teams up to 5 annotators</div>
                                <div><b className="text-rose-500">$499/mo</b> — Enterprise: On-prem, SLAs, API integrations</div>
                            </div>
                        </div>

                        {/* Target Segment */}
                        <div className={`p-5 rounded-2xl border flex flex-col gap-2 ${
                            isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
                        }`}>
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">WHO IT'S FOR</span>
                            <h4 className={`font-black text-base mt-1 ${isLight ? 'text-slate-850' : 'text-white'}`}>Immediate Users</h4>
                            <div className="space-y-1.5 mt-2 text-xs text-slate-400">
                                <div>➔ <b className="text-slate-200">ML Text Teams</b> (Fintech, Legaltech)</div>
                                <div>➔ <b className="text-slate-200">University Labs</b> (Strict research budgets)</div>
                                <div>➔ <b className="text-slate-200">Label Agencies</b> (Firms billing hourly)</div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        // SLIDE 9 — VALIDATED BY EXPERTS
        {
            title: "31 experts reviewed it. Their feedback shaped what shipped.",
            subtitle: "42 contacted · 31 responses · 19 researchers · 12 ML engineers",
            icon: Users,
            iconColor: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
            content: (
                <div className="h-full flex flex-col justify-center gap-4 max-w-5xl mx-auto py-2">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        
                        {/* Quotes Left */}
                        <div className="lg:col-span-5 space-y-3">
                            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
                                <p className="text-[10px] text-slate-350 italic">"Strong practical and commercial value. The balance between utility and annotation time is effective."</p>
                                <span className="text-[9px] text-slate-500 font-mono block mt-1.5 text-right">— Evaluator 19 · ML Engineer</span>
                            </div>
                            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
                                <p className="text-[10px] text-slate-350 italic">"75.6% improvement over baselines, with a clear peak at 60 minutes of annotation."</p>
                                <span className="text-[9px] text-slate-500 font-mono block mt-1.5 text-right">— Evaluator 13 · AL Researcher</span>
                            </div>
                        </div>

                        {/* What Changed Right */}
                        <div className="lg:col-span-7 overflow-hidden w-full">
                            <div className={`p-4 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-950/60 border-slate-900'}`}>
                                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-wider block mb-2">FEEDBACK ➔ SHIPPED CHANGES</span>
                                <div className="space-y-2 text-[10px]">
                                    <div className="flex justify-between border-b border-slate-900/50 pb-1.5">
                                        <span className="text-rose-400 font-bold font-mono">"Spy Window" term unclear</span>
                                        <span className="text-emerald-400 font-bold font-mono">Added parameter explainer modal</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-900/50 pb-1.5">
                                        <span className="text-rose-400 font-bold font-mono">Alpha / Beta hidden</span>
                                        <span className="text-emerald-400 font-bold font-mono">Info icon + inline explanations</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-900/50 pb-1.5">
                                        <span className="text-rose-400 font-bold font-mono">Slow initial loading</span>
                                        <span className="text-emerald-400 font-bold font-mono">React lazy-loading + code splitting</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-900/50 pb-1.5">
                                        <span className="text-rose-400 font-bold font-mono">Accessibility gaps</span>
                                        <span className="text-emerald-400 font-bold font-mono">WCAG headers + ARIA structure</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        // SLIDE 10 — WHERE WE ARE
        {
            title: "Peer-reviewed. Deployed. Growing.",
            subtitle: "From academic acceptance to active production pilots.",
            icon: ShieldCheck,
            iconColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
            content: (
                <div className="h-full flex flex-col justify-center gap-6 max-w-5xl mx-auto py-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        
                        {/* Publications */}
                        <div className={`p-5 rounded-2xl border ${
                            isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
                        }`}>
                            <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest block mb-3">ACCEPTED & PUBLISHED</span>
                            <div className="space-y-2 text-xs">
                                <div className="flex items-center gap-2"><span className="text-emerald-400">✓</span> <b>ACL 2026</b> — Accepted and presented (A* NLP conference)</div>
                                <div className="flex items-center gap-2"><span className="text-emerald-400">✓</span> <b>IEEE CSNT 2026</b> — Accepted, in press</div>
                                <div className="flex items-center gap-2"><span className="text-emerald-400">✓</span> <b>ICAIIC 2026</b> — Published in IEEE Xplore</div>
                                <div className="flex items-center gap-2"><span className="text-emerald-400">✓</span> <b>IEEE SCSE 2026</b> — Published, indexing in progress</div>
                            </div>
                        </div>

                        {/* Roadmap */}
                        <div className={`p-5 rounded-2xl border ${
                            isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
                        }`}>
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-3">ROADMAP</span>
                            <div className="space-y-3 text-xs">
                                <div className="flex gap-2">
                                    <span className="font-black text-slate-300">NOW:</span>
                                    <span className="text-slate-450">Live deployment, 4 papers, 10-dataset benchmark</span>
                                </div>
                                <div className="flex gap-2">
                                    <span className="font-black text-indigo-400">Q1:</span>
                                    <span className="text-slate-450">Public pilot with 3 partner NLP research labs</span>
                                </div>
                                <div className="flex gap-2">
                                    <span className="font-black text-rose-500">Q2:</span>
                                    <span className="text-slate-450">Image and audio cost baselines, multi-modal expansion</span>
                                </div>
                                <div className="flex gap-2">
                                    <span className="font-black text-emerald-400">Q3:</span>
                                    <span className="text-slate-450">Enterprise on-prem license release with SLAs</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        // SLIDE 11 — CLOSE
        {
            title: "This isn't a research idea. It's a tool, ready today.",
            subtitle: "Same accuracy, a third of the time, at a fraction of the cost.",
            icon: Award,
            iconColor: "text-rose-500 bg-rose-500/10 border-rose-500/20",
            content: (
                <div className="h-full flex flex-col justify-center items-center text-center gap-8 max-w-4xl mx-auto py-4">
                    <div className="space-y-4">
                        <h2 className={`text-4xl md:text-5xl font-black uppercase tracking-tight ${isLight ? 'text-slate-905' : 'text-white'}`}>
                            This isn't a research idea.<br />
                            <span className="bg-gradient-to-r from-rose-500 to-indigo-500 bg-clip-text text-transparent">
                                It's a tool, ready today.
                            </span>
                        </h2>
                        <p className={`text-lg md:text-xl font-medium max-w-xl mx-auto leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-450'}`}>
                            Same accuracy. A third of the human time. At a fraction of the budget.
                        </p>
                    </div>

                    <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent my-2" />

                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <button
                            onClick={onClose}
                            className="px-8 py-4 bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-rose-500/15 transform hover:scale-105 active:scale-95 transition flex items-center gap-2"
                        >
                            <Play size={16} /> Start Live Annotation Demo
                        </button>
                        
                        <button
                            onClick={() => setCurrentSlide(11)}
                            className={`px-6 py-3 rounded-2xl border text-xs font-bold transition-all ${
                                isLight 
                                    ? 'border-slate-300 hover:bg-slate-100 text-slate-700' 
                                    : 'border-slate-800 hover:bg-slate-900 text-slate-350 hover:text-white'
                            }`}
                        >
                            Show Appendix: Lean Canvas ➔
                        </button>
                    </div>

                    <div className="text-[11px] text-slate-500 mt-2 font-black tracking-widest uppercase">
                        Thank you. Happy to take your questions.
                    </div>
                </div>
            )
        },
        // SLIDE 12 — LEAN CANVAS (APPENDIX)
        {
            title: "Appendix: Lean Canvas Dashboard",
            subtitle: "Strategic business overview and market viability indicators.",
            icon: Database,
            iconColor: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
            content: (
                <div className="h-full flex flex-col justify-center gap-4 max-w-5xl mx-auto py-1">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[10px]">
                        
                        {/* Box 1 */}
                        <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
                            <span className="font-black text-rose-500 uppercase tracking-wider block">PROBLEM</span>
                            <p className="text-slate-400 leading-relaxed">
                                • High human annotation costs (80% of project spend).<br />
                                • Annotator cognitive fatigue goes unmonitored.<br />
                                • Redundant text selection wastes expert time.
                            </p>
                        </div>

                        {/* Box 2 */}
                        <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
                            <span className="font-black text-rose-500 uppercase tracking-wider block">SOLUTION</span>
                            <p className="text-slate-400 leading-relaxed">
                                • Cost-aware active learning ranking algorithm.<br />
                                • Adaptive annotator speed timing loops.<br />
                                • Semantic text deduplication on client upload.
                            </p>
                        </div>

                        {/* Box 3 */}
                        <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
                            <span className="font-black text-rose-500 uppercase tracking-wider block">UNIQUE VALUE PROP</span>
                            <p className="text-slate-400 leading-relaxed">
                                • 3.9x speedup over standard baseline queues.<br />
                                • Plugs directly into standard pipelines (REST API).<br />
                                • Full transparency showing *why* samples were selected.
                            </p>
                        </div>

                        {/* Box 4 */}
                        <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
                            <span className="font-black text-indigo-400 uppercase tracking-wider block">UNFAIR ADVANTAGE</span>
                            <p className="text-slate-400 leading-relaxed">
                                • First framework combining cost-awareness, adaptation, and calibration.<br />
                                • Peer-reviewed status at ACL 2026.
                            </p>
                        </div>

                        {/* Box 5 */}
                        <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
                            <span className="font-black text-indigo-400 uppercase tracking-wider block">CUSTOMER SEGMENTS</span>
                            <p className="text-slate-400 leading-relaxed">
                                • ML research teams building language AI tools.<br />
                                • University NLP labs with tight grant budgets.<br />
                                • Data annotation agencies billing hourly.
                            </p>
                        </div>

                        {/* Box 6 */}
                        <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
                            <span className="font-black text-indigo-400 uppercase tracking-wider block">CHANNELS</span>
                            <p className="text-slate-400 leading-relaxed">
                                • Open-source model plugins (Label Studio integrations).<br />
                                • Research papers & ML presentations (ACL).<br />
                                • Direct developer word-of-mouth outreach.
                            </p>
                        </div>

                        {/* Box 7 */}
                        <div className="p-3 bg-slate-900/60 border border-slate-850 rounded-xl space-y-1">
                            <span className="font-black text-emerald-400 uppercase tracking-wider block">COST STRUCTURE</span>
                            <p className="text-slate-400 leading-relaxed">
                                • Microservice hosting: ~$200–300/mo.<br />
                                • Developer maintenance & pipeline scaling.<br />
                                • Continuous dataset calibration checks.
                            </p>
                        </div>

                        {/* Box 8 */}
                        <div className="p-3 bg-slate-900/60 border border-slate-850 rounded-xl space-y-1 col-span-1 md:col-span-2">
                            <span className="font-black text-emerald-400 uppercase tracking-wider block">REVENUE STREAMS</span>
                            <p className="text-slate-400 leading-relaxed">
                                • Free Tier for solo researchers and local pilots.<br />
                                • Pro Team License: $49/mo (Up to 5 annotators).<br />
                                • Enterprise Tier: $499/mo (SLA guarantees, custom integrations, active on-prem support).
                            </p>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    const CurrentIcon = slides[currentSlide].icon;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 p-0 animate-fade-in">
            <div className={`w-full h-full relative flex flex-col justify-between overflow-hidden text-left transition-all ${
                isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-white'
            }`}>
                {/* Visual Top Glow */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 via-indigo-500 to-emerald-500 z-20" />
                
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className={`absolute top-4 right-4 p-2.5 rounded-xl transition z-30 border ${
                        isLight 
                            ? 'bg-slate-100 border-slate-200 text-slate-650 hover:bg-slate-200' 
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
                                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-505 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
                                        {currentSlide === 11 ? "Appendix Slide" : `Slide ${currentSlide + 1} of 11`}
                                    </span>
                                    <h2 className={`text-xl md:text-2xl font-black mt-1 tracking-tight ${isLight ? 'text-slate-805' : 'text-white'}`}>{slides[currentSlide].title}</h2>
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
                                    onClick={nextSlide}
                                    className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-black rounded-xl transition flex items-center gap-2 shadow-lg shadow-indigo-500/10"
                                >
                                    {(currentSlide === 10 || currentSlide === 11) ? 'Start Live Demo' : 'Next Slide'} <ChevronRight size={15} />
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
