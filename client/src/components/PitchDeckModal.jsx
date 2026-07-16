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
        if (currentSlide === 11) {
            onClose(); // Slide 12 is end of flow -> close and start demo
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
                <div className="h-full flex flex-col justify-center items-center text-center gap-8 max-w-4xl mx-auto py-6">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-black uppercase tracking-widest animate-pulse">
                            <Award size={16} /> Peer-Reviewed at ACL 2026
                        </div>
                        <h1 className={`text-5xl md:text-7xl font-black tracking-tight leading-tight uppercase ${isLight ? 'text-slate-905' : 'text-white'}`}>
                            AI doesn't run out of data.<br />
                            <span className="bg-gradient-to-r from-rose-500 via-red-500 to-indigo-550 bg-clip-text text-transparent">
                                It runs out of time.
                            </span>
                        </h1>
                        <p className={`text-xl md:text-2xl font-bold max-w-3xl mx-auto leading-relaxed ${isLight ? 'text-slate-655' : 'text-slate-350'}`}>
                            CAL-Log is a cost-aware active learning system that adapts to human speed limits in real-time.
                        </p>
                    </div>

                    <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent my-4" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
                        <div className={`p-6 rounded-2xl border flex flex-col gap-2 items-center justify-center ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-850'}`}>
                            <span className="text-3xl font-black text-rose-500">4</span>
                            <span className="text-xs text-slate-400 uppercase font-black tracking-wider">Published Papers</span>
                        </div>
                        <div className={`p-6 rounded-2xl border flex flex-col gap-2 items-center justify-center ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-850'}`}>
                            <span className="text-3xl font-black text-indigo-450">ACL 2026</span>
                            <span className="text-xs text-slate-400 uppercase font-black tracking-wider">A* Conference</span>
                        </div>
                        <div className={`p-6 rounded-2xl border flex flex-col gap-2 items-center justify-center ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-850'}`}>
                            <span className="text-3xl font-black text-emerald-450">Vihanga Supasan</span>
                            <span className="text-xs text-slate-400 uppercase font-black tracking-wider">Lead Researcher</span>
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
                <div className="h-full flex flex-col justify-center items-center text-center gap-10 max-w-4xl mx-auto py-6">
                    <div className="space-y-6">
                        <h2 className={`text-4xl md:text-6xl font-black tracking-tight leading-snug ${isLight ? 'text-slate-850' : 'text-white'}`}>
                            How much of your AI project is spent labeling data by hand?
                        </h2>
                        <p className="text-xl font-extrabold tracking-widest uppercase text-rose-500 animate-pulse">
                            Take a guess.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full">
                        {[
                            { name: "Requirements", pct: "5%", color: "border-slate-800 bg-slate-900/40 text-slate-500" },
                            { name: "Model Tuning", pct: "10%", color: "border-slate-800 bg-slate-900/40 text-slate-500" },
                            { name: "Deployment", pct: "5%", color: "border-slate-800 bg-slate-900/40 text-slate-500" },
                            { name: "Human Labeling", pct: "?", color: "border-rose-500 bg-rose-950/20 text-rose-455 font-black animate-pulse" }
                        ].map((stage, idx) => (
                            <div key={idx} className={`p-6 rounded-2xl border text-center flex flex-col gap-3 ${stage.color}`}>
                                <span className="text-sm uppercase font-bold tracking-wider">{stage.name}</span>
                                <span className="text-4xl font-black">{stage.pct}</span>
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
                <div className="h-full flex flex-col justify-center gap-8 max-w-5xl mx-auto py-4">
                    <div className="text-center space-y-3">
                        <h2 className="text-6xl md:text-8xl font-black text-rose-500 tracking-tight uppercase animate-pulse">80%</h2>
                        <p className={`text-2xl font-black ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                            Of every AI project. Humans, one sample at a time.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                            <div key={idx} className={`p-6 rounded-2xl border flex flex-col gap-3 ${
                                isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
                            }`}>
                                <span className="text-xs font-black text-rose-500 uppercase tracking-widest">{stat.label}</span>
                                <h3 className={`text-3xl font-black ${isLight ? 'text-slate-850' : 'text-white'}`}>{stat.value}</h3>
                                <p className="text-sm text-slate-400 leading-relaxed mt-1 flex-1">{stat.desc}</p>
                                <span className="text-[10px] text-slate-500 font-mono text-right mt-2">Source: {stat.source}</span>
                            </div>
                        ))}
                    </div>

                    <div className={`p-5 rounded-2xl border text-center font-bold text-sm italic ${
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
                <div className="h-full flex flex-col justify-center gap-8 max-w-5xl mx-auto py-4">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                        {/* 2x2 Matrix Coordinates Infographic */}
                        <div className="lg:col-span-7 flex justify-center">
                            <div className={`relative w-full max-w-[520px] rounded-2xl p-1.5 overflow-hidden shadow-2xl border hover:scale-102 transition-all duration-350 ${
                                isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-slate-850'
                            }`}>
                                <img 
                                    src="/market_gap_diagram.png" 
                                    alt="Market Gap Infographic Matrix" 
                                    className="w-full h-auto rounded-xl object-cover"
                                />
                            </div>
                        </div>

                        {/* Content Right side */}
                        <div className="lg:col-span-5 space-y-6">
                            <h3 className={`text-4xl font-black tracking-tight leading-tight ${isLight ? 'text-slate-805' : 'text-white'}`}>
                                A Crowded Market.<br />
                                <span className="bg-gradient-to-r from-rose-500 to-indigo-500 bg-clip-text text-transparent">
                                    Nobody Solves the Real Problem.
                                </span>
                            </h3>
                            <p className="text-sm md:text-base text-slate-400 leading-relaxed font-semibold">
                                Traditional annotation suites (Prodigy, Label Studio, Doccano) operate blindly with respect to time and cost. Scale AI addresses cost but uses rigid, static task allocation.
                            </p>
                            <p className="text-sm md:text-base text-slate-400 leading-relaxed">
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
        // SLIDE 5 — THE GAPS
        {
            title: "Three Gaps.",
            subtitle: "Ranked by what actually costs business organizations money.",
            icon: Layers,
            iconColor: "text-rose-500 bg-rose-500/10 border-rose-500/20",
            content: (
                <div className="h-full flex flex-col justify-center gap-6 max-w-5xl mx-auto py-4">
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
                        <div key={gap.num} className={`p-6 rounded-2xl border flex flex-col md:flex-row gap-5 justify-between items-start md:items-center ${
                            isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-850'
                        }`}>
                            <div className="flex gap-5 items-start">
                                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-black text-base shrink-0">
                                    {gap.num}
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xs font-black text-slate-500 uppercase tracking-widest">{gap.type}</div>
                                    <h4 className={`font-black text-base md:text-lg ${isLight ? 'text-slate-800' : 'text-white'}`}>{gap.title}</h4>
                                    <p className="text-sm text-slate-400 leading-relaxed">{gap.desc}</p>
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
        // SLIDE 6 — OUR SOLUTION & ARCHITECTURE
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
                            <div className={`relative w-full max-w-[500px] rounded-2xl p-1.5 overflow-hidden shadow-2xl border hover:scale-102 transition-all duration-300 ${
                                isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-slate-850'
                            }`}>
                                <img 
                                    src="/system_architecture.png" 
                                    alt="Live Microservices System Architecture Diagram" 
                                    className="w-full h-auto rounded-xl object-cover"
                                />
                            </div>
                        </div>

                        {/* Content Right side */}
                        <div className="lg:col-span-5 space-y-5">
                            <h3 className={`text-3xl font-black tracking-tight leading-tight ${isLight ? 'text-slate-805' : 'text-white'}`}>
                                Production-Grade<br />
                                <span className="bg-gradient-to-r from-emerald-400 to-indigo-500 bg-clip-text text-transparent">
                                    Microservice Loop
                                </span>
                            </h3>
                            <p className="text-sm text-slate-400 leading-relaxed font-semibold">
                                Not a simple prototype script. CAL-Log runs a distributed Node.js server gateway integrated with an active Python Flask simulation server.
                            </p>
                            
                            <div className="space-y-3 text-xs md:text-sm text-slate-450 leading-relaxed">
                                <div className="flex gap-2.5">
                                    <div className="p-1 rounded bg-indigo-500/10 text-indigo-400 shrink-0"><Check size={14} /></div>
                                    <span><b>Client Tier:</b> Workspace UI, Fatigue Tracking, and live ROI calculators in React.</span>
                                </div>
                                <div className="flex gap-2.5">
                                    <div className="p-1 rounded bg-indigo-500/10 text-indigo-400 shrink-0"><Check size={14} /></div>
                                    <span><b>Server Tier:</b> REST API gateway, Mongoose session controllers, and MongoDB storage.</span>
                                </div>
                                <div className="flex gap-2.5">
                                    <div className="p-1 rounded bg-indigo-500/10 text-indigo-400 shrink-0"><Check size={14} /></div>
                                    <span><b>Logic Tier:</b> Python adaptive regression engines. Recalibrates Alpha and Beta parameters every round to match target domain complexity, adjusting automatically from simple reviews to complex legal or medical documents.</span>
                                </div>
                            </div>
                        </div>
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
                <div className="h-full flex flex-col justify-center gap-5 max-w-[1200px] mx-auto py-2 px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        
                        {/* Comparison Table */}
                        <div className="lg:col-span-5 overflow-x-auto w-full space-y-4">
                            <h4 className={`text-base md:text-lg font-black tracking-tight ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                                Feature Matchup vs. Competitors
                            </h4>
                            <table className="w-full text-left border-collapse text-xs md:text-sm">
                                <thead>
                                    <tr className="border-b border-slate-800">
                                        <th className="py-3 font-black text-slate-400 text-sm">Features</th>
                                        <th className="py-3 font-black text-rose-400 text-center text-sm">CAL-Log</th>
                                        <th className="py-3 font-black text-slate-500 text-center text-sm">Prodigy</th>
                                        <th className="py-3 font-black text-slate-500 text-center text-sm">Scale AI</th>
                                        <th className="py-3 font-black text-slate-500 text-center text-sm">Snorkel</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/40">
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
                                            <td className="py-3 font-bold text-slate-300 text-sm">{row[0]}</td>
                                            <td className="py-3 text-center font-black text-rose-500 text-base">{row[1] ? "✓" : "—"}</td>
                                            <td className="py-3 text-center text-slate-500 text-base">{row[2] ? "✓" : "—"}</td>
                                            <td className="py-3 text-center text-slate-500 text-base">{row[3] ? "✓" : "—"}</td>
                                            <td className="py-3 text-center text-slate-500 text-base">{row[4] ? "✓" : "—"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Cost Efficiency Horizontal Bar Chart (Custom Dynamic CSS Graph) */}
                        <div className="lg:col-span-7 space-y-4">
                            <div className="flex flex-col gap-1">
                                <h4 className={`text-base md:text-lg font-black tracking-tight ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                                    Cost Efficiency: Time to Reach F1 = 0.80
                                </h4>
                                <span className="text-xs text-slate-500 font-semibold">
                                    Mean Annotation Time (minutes) averaged across 10 datasets (Lower = Better)
                                </span>
                            </div>

                            {/* Chart Container */}
                            <div className={`p-5 rounded-2xl border space-y-4 ${
                                isLight ? 'bg-white border-slate-200' : 'bg-slate-900/40 border-slate-850'
                            }`}>
                                {[
                                    { name: "Entropy", time: 148.5, ciStart: 5, ciEnd: 303, color: "bg-green-500/80" },
                                    { name: "CoreSet", time: 140.9, ciStart: 0, ciEnd: 286, color: "bg-cyan-500/80" },
                                    { name: "BADGE", time: 126.5, ciStart: 21, ciEnd: 242, color: "bg-blue-500/80" },
                                    { name: "Margin", time: 121.0, ciStart: 5, ciEnd: 238, color: "bg-amber-600/85" },
                                    { name: "LeastConfidence", time: 105.9, ciStart: 32, ciEnd: 190, color: "bg-purple-500/80" },
                                    { name: "Random", time: 93.7, ciStart: 38, ciEnd: 150, color: "bg-slate-500/80" },
                                    { name: "CAL-Log (Ours)", time: 38.3, ciStart: 15, ciEnd: 62, color: "bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.4)]", isHighlight: true }
                                ].map((item, idx) => {
                                    // Scale factor: max timeline is 310m
                                    const maxVal = 310;
                                    const barWidth = (item.time / maxVal) * 100;
                                    const ciLeft = (item.ciStart / maxVal) * 100;
                                    const ciWidth = ((item.ciEnd - item.ciStart) / maxVal) * 100;

                                    return (
                                        <div key={idx} className="grid grid-cols-12 gap-3 items-center">
                                            {/* Label */}
                                            <div className={`col-span-3 text-right text-xs md:text-sm font-bold truncate ${
                                                item.isHighlight ? 'text-rose-400 font-extrabold' : 'text-slate-400'
                                            }`}>
                                                {item.name}
                                            </div>

                                            {/* Bar and Error Range */}
                                            <div className="col-span-7 relative h-6 flex items-center bg-slate-950/40 rounded border border-slate-900/50 overflow-visible">
                                                {/* Error Bar (CI) */}
                                                <div 
                                                    className="absolute h-0.5 bg-slate-650 flex items-center justify-between"
                                                    style={{ left: `${ciLeft}%`, width: `${ciWidth}%` }}
                                                >
                                                    {/* CI Left Cap */}
                                                    <div className="w-0.5 h-2 bg-slate-650 shrink-0" />
                                                    {/* CI Right Cap */}
                                                    <div className="w-0.5 h-2 bg-slate-650 shrink-0" />
                                                </div>

                                                {/* Value Bar */}
                                                <div 
                                                    className={`absolute h-4 rounded-sm transition-all duration-1000 ${item.color} ${
                                                        item.isHighlight ? 'border-2 border-white' : ''
                                                    }`}
                                                    style={{ width: `${barWidth}%`, left: '0%' }}
                                                />
                                            </div>

                                            {/* Value */}
                                            <div className={`col-span-2 text-xs md:text-sm font-mono font-bold ${
                                                item.isHighlight ? 'text-rose-400 font-extrabold' : 'text-slate-550'
                                            }`}>
                                                {item.time.toFixed(1)}m
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* X-Axis Scale */}
                                <div className="grid grid-cols-12 gap-3 border-t border-slate-800/60 pt-2 text-[10px] font-mono text-slate-500">
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

                    {/* Bottom Banner for Standards & Proven Outcomes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
                        <div className="bg-rose-500/5 border border-rose-500/10 p-3 rounded-xl flex items-center justify-between px-6">
                            <span className="text-xs font-black text-rose-400 uppercase tracking-widest">PROVEN RESULT</span>
                            <div className="flex items-center gap-4">
                                <span className="text-3xl font-black text-rose-500">3.9x Faster</span>
                                <span className="text-xs text-slate-450 leading-tight">reach target accuracy vs. standard entropy models</span>
                            </div>
                        </div>

                        <div className="bg-slate-900/40 border border-slate-850 p-3 rounded-xl flex items-center justify-between px-6">
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">COMPLIANCE STATS</span>
                            <div className="flex gap-4 text-xs font-bold text-slate-400">
                                <span>✓ UK GDPR (Zero PII)</span>
                                <span>✓ OWASP Secure</span>
                                <span>✓ 99.9% Net Uptime</span>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        // SLIDE 8 — BUSINESS ECONOMICS
        {
            title: "Business Economics & Pricing Tiers",
            subtitle: "One project's savings covers a month of running the tool.",
            icon: Cpu,
            iconColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
            content: (
                <div className="h-full flex flex-col justify-center gap-8 max-w-[1200px] mx-auto py-4 px-4 text-slate-300">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* Math Breakdown */}
                        <div className={`p-8 rounded-3xl border flex flex-col justify-between min-h-[360px] ${
                            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/50 border-slate-850 shadow-2xl'
                        }`}>
                            <div className="space-y-4">
                                <span className="text-xs font-black text-rose-500 uppercase tracking-widest block">THE MATH</span>
                                <h4 className={`font-black text-2xl ${isLight ? 'text-slate-850' : 'text-white'}`}>Operating Economics</h4>
                                
                                <div className="space-y-3.5 text-sm text-slate-400">
                                    <div className="border-b border-slate-800/60 pb-2.5">
                                        <div className="flex justify-between font-bold text-slate-200">
                                            <span>Running Costs:</span>
                                            <span className="font-mono text-white text-base">$250 / mo</span>
                                        </div>
                                        <div className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                                            MongoDB Atlas ($120) + AWS Node Host ($80) + Security & Logging ($50). Supports up to 50 active annotators.
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <div className="flex justify-between font-bold text-slate-250">
                                            <span>Saves Per Project:</span>
                                            <span className="font-mono text-emerald-400 text-base">+$1,530 saved</span>
                                        </div>
                                        <div className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                                            Based on 10,000 text records: Manual labor (140 hrs × $15 = $2,100) vs. CAL-Log (38 hrs × $15 = $570).
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p className="text-[11px] text-slate-500 italic border-t border-slate-800/40 pt-3">
                                Every dataset labeled after the first project is pure operating margin.
                            </p>
                        </div>

                        {/* Revenue Model & SLAs */}
                        <div className={`p-8 rounded-3xl border flex flex-col justify-between min-h-[360px] ${
                            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/50 border-slate-850 shadow-2xl'
                        }`}>
                            <div className="space-y-4">
                                <span className="text-xs font-black text-indigo-400 uppercase tracking-widest block">REVENUE MODEL</span>
                                <h4 className={`font-black text-2xl ${isLight ? 'text-slate-850' : 'text-white'}`}>Tiers & Licensing</h4>
                                
                                <div className="space-y-4 text-sm text-slate-400">
                                    <div className="border-b border-slate-800/40 pb-2">
                                        <span className="font-black text-slate-200 block text-base">Free Tier</span>
                                        <span className="text-xs">Solo researchers, local projects, and small pilot runs.</span>
                                    </div>
                                    <div className="border-b border-slate-800/40 pb-2">
                                        <span className="font-black text-indigo-400 block text-base">$49 / mo (Teams)</span>
                                        <span className="text-xs">Small teams up to 5 concurrent annotators, shared MongoDB.</span>
                                    </div>
                                    <div>
                                        <span className="font-black text-rose-500 block text-base">$499 / mo (Enterprise)</span>
                                        <div className="text-[11px] text-slate-500 leading-relaxed mt-1">
                                            On-premise deployment, custom API integrations, and premium <b>Service Level Agreements (SLAs)</b>:
                                            <ul className="list-disc pl-4 mt-1 space-y-0.5 text-slate-450">
                                                <li>99.9% Net Platform Uptime Guarantee</li>
                                                <li>&lt;4-Hour Support Response Window</li>
                                                <li>Dedicated Kubernetes isolation node</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Target Segment */}
                        <div className={`p-8 rounded-3xl border flex flex-col justify-between min-h-[360px] ${
                            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/50 border-slate-850 shadow-2xl'
                        }`}>
                            <div className="space-y-4">
                                <span className="text-xs font-black text-emerald-400 uppercase tracking-widest block">WHO IT'S FOR</span>
                                <h4 className={`font-black text-2xl ${isLight ? 'text-slate-850' : 'text-white'}`}>Immediate Users</h4>
                                
                                <div className="space-y-5 text-sm text-slate-400 mt-2">
                                    <div className="flex gap-3">
                                        <span className="text-emerald-400 font-extrabold text-base">➔</span>
                                        <div>
                                            <b className="text-slate-200 block text-base">ML Text Teams</b>
                                            <span className="text-xs leading-relaxed block text-slate-450 mt-0.5">Fintech, legaltech, and clinical text developers with high privacy restrictions.</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <span className="text-emerald-400 font-extrabold text-base">➔</span>
                                        <div>
                                            <b className="text-slate-200 block text-base">University Labs</b>
                                            <span className="text-xs leading-relaxed block text-slate-450 mt-0.5">Strict academic research budgets seeking maximum accuracy per grant dollar.</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <span className="text-emerald-400 font-extrabold text-base">➔</span>
                                        <div>
                                            <b className="text-slate-200 block text-base">Labeling Agencies</b>
                                            <span className="text-xs leading-relaxed block text-slate-450 mt-0.5">Firms billing clients hourly using active learning to expand their margins.</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        // SLIDE 9 — BUSINESS STRATEGY (LEAN CANVAS INTEGRATED)
        {
            title: "Lean Canvas Business Strategy",
            subtitle: "Strategic business roadmap merged directly into the core presenter sequence.",
            icon: Database,
            iconColor: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
            content: (
                <div className="h-full flex flex-col justify-center gap-6 max-w-5xl mx-auto py-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs md:text-sm">
                        
                        {/* Box 1 */}
                        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                            <span className="font-black text-rose-500 uppercase tracking-wider block">1. PROBLEM</span>
                            <p className="text-slate-400 leading-relaxed">
                                • High human annotation costs (80% of project spend)<br />
                                • Annotator cognitive fatigue goes unmonitored<br />
                                • Redundant text selection wastes expert time
                            </p>
                        </div>

                        {/* Box 2 */}
                        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                            <span className="font-black text-rose-500 uppercase tracking-wider block">2. SOLUTION</span>
                            <p className="text-slate-400 leading-relaxed">
                                • Cost-aware active learning ranking algorithm<br />
                                • Adaptive annotator speed timing loops<br />
                                • Semantic text deduplication on client upload
                            </p>
                        </div>

                        {/* Box 3 */}
                        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                            <span className="font-black text-rose-500 uppercase tracking-wider block">3. UNIQUE VALUE PROP</span>
                            <p className="text-slate-400 leading-relaxed">
                                • 3.9x speedup over standard baseline queues<br />
                                • Plugs directly into standard pipelines (REST API)<br />
                                • Full transparency showing *why* samples were selected
                            </p>
                        </div>

                        {/* Box 4 */}
                        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                            <span className="font-black text-indigo-400 uppercase tracking-wider block">4. UNFAIR ADVANTAGE</span>
                            <p className="text-slate-400 leading-relaxed">
                                • First framework combining cost-awareness, adaptation, and calibration<br />
                                • Peer-reviewed status at ACL 2026
                            </p>
                        </div>

                        {/* Box 5 */}
                        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                            <span className="font-black text-indigo-400 uppercase tracking-wider block">5. CUSTOMER SEGMENTS</span>
                            <p className="text-slate-400 leading-relaxed">
                                • ML research teams building language AI tools<br />
                                • University NLP labs with tight grant budgets<br />
                                • Data annotation agencies billing hourly
                            </p>
                        </div>

                        {/* Box 6 */}
                        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                            <span className="font-black text-indigo-400 uppercase tracking-wider block">6. CHANNELS</span>
                            <p className="text-slate-400 leading-relaxed">
                                • Open-source model plugins (Label Studio integrations)<br />
                                • Research papers & ML presentations (ACL)<br />
                                • Direct developer word-of-mouth outreach
                            </p>
                        </div>
                    </div>
                </div>
            )
        },
        // SLIDE 10 — VALIDATED BY EXPERTS
        {
            title: "31 experts reviewed it. Their feedback shaped what shipped.",
            subtitle: "42 contacted, 31 responses, 19 researchers, 12 ML engineers",
            icon: Users,
            iconColor: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
            content: (
                <div className="h-full flex flex-col justify-center gap-6 max-w-5xl mx-auto py-4">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        
                        {/* Quotes Left */}
                        <div className="lg:col-span-5 space-y-4">
                            <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
                                <p className="text-sm md:text-base text-slate-300 italic leading-relaxed">
                                    "Strong practical and commercial value. The balance between utility and annotation time is effective."
                                </p>
                                <span className="text-xs text-indigo-400 font-extrabold block mt-2.5 text-right">
                                    ML Engineer at Meta
                                </span>
                            </div>
                            <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
                                <p className="text-sm md:text-base text-slate-300 italic leading-relaxed">
                                    "75.6% improvement over baselines, with a clear peak at 60 minutes of annotation."
                                </p>
                                <span className="text-xs text-indigo-400 font-extrabold block mt-2.5 text-right">
                                    Active Learning Researcher at Scale AI
                                </span>
                            </div>
                        </div>

                        {/* What Changed Right */}
                        <div className="lg:col-span-7 overflow-hidden w-full flex flex-col justify-center">
                            <div className={`p-6 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-950/60 border-slate-900'}`}>
                                <span className="text-xs font-black text-indigo-455 uppercase tracking-wider block mb-3">FEEDBACK ➔ SHIPPED CHANGES</span>
                                <div className="space-y-3 text-xs md:text-sm">
                                    <div className="flex justify-between border-b border-slate-900/50 pb-2">
                                        <span className="text-rose-400 font-bold font-mono">"Spy Window" term unclear</span>
                                        <span className="text-emerald-400 font-bold font-mono">Added parameter explainer modal</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-900/50 pb-2">
                                        <span className="text-rose-400 font-bold font-mono">Alpha / Beta hidden</span>
                                        <span className="text-emerald-400 font-bold font-mono">Info icon + inline explanations</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-900/50 pb-2">
                                        <span className="text-rose-400 font-bold font-mono">Slow initial loading</span>
                                        <span className="text-emerald-400 font-bold font-mono">React lazy-loading + code splitting</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-900/50 pb-2">
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
        // SLIDE 11 — WHERE WE ARE
        {
            title: "Peer-reviewed. Deployed. Growing.",
            subtitle: "From academic acceptance to active production pilots.",
            icon: ShieldCheck,
            iconColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
            content: (
                <div className="h-full flex flex-col justify-center gap-8 max-w-5xl mx-auto py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        
                        {/* Publications */}
                        <div className={`p-6 rounded-2xl border ${
                            isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
                        }`}>
                            <span className="text-xs font-black text-rose-500 uppercase tracking-widest block mb-4">ACCEPTED & PUBLISHED</span>
                            <div className="space-y-3 text-xs md:text-sm">
                                <div className="flex items-center gap-3"><span className="text-emerald-400 text-lg">✓</span> <span><b>ACL 2026</b> (Accepted and presented - A* NLP conference)</span></div>
                                <div className="flex items-center gap-3"><span className="text-emerald-400 text-lg">✓</span> <span><b>IEEE CSNT 2026</b> (Accepted, in press)</span></div>
                                <div className="flex items-center gap-3"><span className="text-emerald-400 text-lg">✓</span> <span><b>ICAIIC 2026</b> (Published in IEEE Xplore)</span></div>
                                <div className="flex items-center gap-3"><span className="text-emerald-400 text-lg">✓</span> <span><b>IEEE SCSE 2026</b> (Published, indexing in progress)</span></div>
                            </div>
                        </div>

                        {/* Roadmap */}
                        <div className={`p-6 rounded-2xl border ${
                            isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
                        }`}>
                            <span className="text-xs font-black text-indigo-400 uppercase tracking-widest block mb-4">ROADMAP</span>
                            <div className="space-y-4 text-xs md:text-sm">
                                <div className="flex gap-3">
                                    <span className="font-black text-slate-300">NOW:</span>
                                    <span className="text-slate-400">Live deployment, 4 papers, 10-dataset benchmark</span>
                                </div>
                                <div className="flex gap-3">
                                    <span className="font-black text-indigo-400">Q1:</span>
                                    <span className="text-slate-400">Public pilot with 3 partner NLP research labs</span>
                                </div>
                                <div className="flex gap-3">
                                    <span className="font-black text-rose-500">Q2:</span>
                                    <span className="text-slate-400">Image and audio cost baselines, multi-modal expansion</span>
                                </div>
                                <div className="flex gap-3">
                                    <span className="font-black text-emerald-400">Q3:</span>
                                    <span className="text-slate-400">Enterprise on-prem license release with SLAs</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        // SLIDE 12 — CLOSE
        {
            title: "This isn't a research idea. It's a tool, ready today.",
            subtitle: "Same accuracy, a third of the time, at a fraction of the cost.",
            icon: Award,
            iconColor: "text-rose-500 bg-rose-500/10 border-rose-500/20",
            content: (
                <div className="h-full flex flex-col justify-center items-center text-center gap-10 max-w-4xl mx-auto py-6">
                    <div className="space-y-6">
                        <h2 className={`text-5xl md:text-7xl font-black uppercase tracking-tight ${isLight ? 'text-slate-905' : 'text-white'}`}>
                            This isn't a research idea.<br />
                            <span className="bg-gradient-to-r from-rose-500 to-indigo-500 bg-clip-text text-transparent">
                                It's a tool, ready today.
                            </span>
                        </h2>
                        <p className={`text-xl md:text-2xl font-bold max-w-2xl mx-auto leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-350'}`}>
                            Same accuracy. A third of the human time. At a fraction of the budget.
                        </p>
                    </div>

                    <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent my-4" />

                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <button
                            onClick={onClose}
                            className="px-10 py-5 bg-gradient-to-r from-rose-600 to-red-505 hover:from-rose-500 hover:to-red-400 text-white font-extrabold text-base rounded-2xl shadow-2xl shadow-rose-500/20 transform hover:scale-105 active:scale-95 transition flex items-center gap-3"
                        >
                            <Play size={18} className="fill-white" /> Start Live Annotation Demo
                        </button>
                    </div>

                    <div className="text-xs md:text-sm text-slate-500 mt-2 font-black tracking-widest uppercase animate-pulse">
                        Thank you. Happy to take your questions.
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
                            <h3 className={`text-xl font-black ${isLight ? 'text-slate-855' : 'text-white'}`}>CAL-Log Presentation</h3>
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
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl border ${slides[currentSlide].iconColor}`}>
                                    <CurrentIcon size={28} />
                                </div>
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-505 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
                                        Slide {currentSlide + 1} of 12
                                    </span>
                                    <h2 className={`text-2xl md:text-3xl font-black mt-1 tracking-tight ${isLight ? 'text-slate-805' : 'text-white'}`}>{slides[currentSlide].title}</h2>
                                    <p className="text-sm font-semibold text-slate-400 mt-0.5">{slides[currentSlide].subtitle}</p>
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
                                    <div key={idx} className="w-full h-full shrink-0 overflow-y-auto px-6 md:px-8 py-6">
                                        {slide.content}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Slide Footer Navigation */}
                        <div className={`p-6 md:p-8 pt-4 border-t flex items-center justify-between ${
                            isLight ? 'border-slate-200/80 bg-white' : 'border-slate-900 bg-slate-950'
                        }`}>
                            <div className="flex gap-3">
                                {slides.map((_, i) => (
                                    <span 
                                        key={i} 
                                        className={`w-3 h-3 rounded-full transition-all duration-350 cursor-pointer ${
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
                                    className={`p-3 rounded-xl border transition disabled:opacity-30 ${
                                        isLight 
                                            ? 'bg-slate-100 border-slate-200 text-slate-650 hover:bg-slate-200' 
                                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
                                    }`}
                                    title="Previous Slide"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    onClick={nextSlide}
                                    className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-sm font-black rounded-xl transition flex items-center gap-2 shadow-lg shadow-indigo-500/10"
                                >
                                    {currentSlide === 11 ? 'Start Live Demo' : 'Next Slide'} <ChevronRight size={16} />
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
