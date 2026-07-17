import React from 'react';
import { 
    Sparkles, ShieldCheck, HelpCircle, Layers, Brain, Cpu, Users, Award, 
    Check, Play, ArrowRight, Settings, Server, Database, Globe, BookOpen, FileText, Layout
} from 'lucide-react';

export const getSlides = (contrastLight, onClose) => [
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
    // SLIDE 2 — THE LABELING BOTTLENECK
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
                        { label: "THE BUDGET DRAIN", value: "$20B by 2030", source: "Grand View Research", desc: "The global data labeling market size is expanding 5x to support LLM instruction tuning and RLHF." },
                        { label: "THE ABANDONMENT RATE", value: "60% Abandoned", source: "Gartner Group", desc: "Of AI projects will fail or be abandoned by 2026 due to unmanageable manual annotation costs." },
                        { label: "THE INDUSTRY SHIFT", value: "Meta & Scale AI", source: "Market Deal (June 2025)", desc: "Meta acquired a 49% stake in Scale AI for $14.3B. The enterprise value is concentrated in data workflows." }
                    ].map((stat, idx) => (
                        <div key={idx} className={`p-6 rounded-2xl border-2 flex flex-col gap-2 ${contrastLight ? 'bg-white border-slate-900 text-slate-950 shadow-md font-bold' : 'bg-slate-900/60 border-slate-800 text-slate-200'}`}>
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
                    { num: "1", type: "PRIORITY 1 · BUSINESS", title: "Nobody prices per sample complexity", desc: "Existing tools route a single sentence and a dense 1,000-word contract as if they cost the same time. Result: teams overpay for trivial labels.", badge: "Confirmed by 19 of 31 surveyed NLP domain leads", badgeColor: contrastLight ? "bg-rose-100 text-rose-900 border-rose-550 border-2 font-black text-xs" : "bg-rose-500/10 text-rose-450 border-rose-500/20" },
                    { num: "2", type: "PRIORITY 2 · BUSINESS", title: "Nobody adapts to annotator speed and fatigue", desc: "Static lists ignore that users slow down, lose concentration, and make mistakes when tired. Result: lazy errors corrupt the datasets.", badge: "Flagged in cognitive science speed studies", badgeColor: contrastLight ? "bg-amber-100 text-amber-905 border-amber-600 border-2 font-black text-xs" : "bg-amber-500/10 text-amber-400 border-amber-500/20" },
                    { num: "3", type: "PRIORITY 3 · TECHNICAL", title: "Nobody calibrates model confidence early", desc: "Traditional active learning uses uncalibrated early-round probabilities. Result: model picks poor samples, degrading accuracy.", badge: "52% failure rate in standard entropy baselines", badgeColor: contrastLight ? "bg-purple-100 text-purple-900 border-purple-650 border-2 font-black text-xs" : "bg-purple-500/10 text-purple-400 border-purple-500/20" }
                ].map((gap) => (
                    <div key={gap.num} className={`p-5 rounded-xl border-2 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center ${contrastLight ? 'bg-white border-slate-900 text-slate-955 shadow-md font-bold' : 'bg-slate-900/60 border-slate-850'}`}>
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
                        <span className={`text-xs font-bold px-3 py-1.5 rounded-full border shrink-0 ${gap.badgeColor}`}>{gap.badge}</span>
                    </div>
                ))}
            </div>
        )
    },
    // SLIDE 4 — SYSTEM ARCHITECTURE & CORE MATHEMATICAL ENGINE
    {
        title: "Microservice Architecture",
        subtitle: "A massive multi-tier engine working in real-time.",
        icon: Brain,
        iconColor: "text-indigo-405 bg-indigo-500/10 border-indigo-500/20",
        content: (
            <div className="h-full flex flex-col justify-center gap-4 w-full px-6 py-2">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center h-full">
                    <div className="lg:col-span-7 flex justify-center w-full">
                        <div className={`relative w-full rounded-2xl p-2 overflow-hidden shadow-2xl border-4 ${contrastLight ? 'bg-white border-slate-900 shadow-xl' : 'bg-slate-900/60 border-slate-850'}`}>
                            <img src="/system_architecture.png" alt="Live Microservices System Architecture Diagram" className="w-full h-auto object-contain rounded-xl max-h-[380px]" />
                        </div>
                    </div>
                    <div className="lg:col-span-5 space-y-4 text-left flex flex-col justify-center">
                        <h2 className={`text-2xl font-black uppercase ${contrastLight ? 'text-slate-950' : 'text-white'}`}>Real-Time Cost-Aware Selection Engine</h2>
                        <div className={`p-4 rounded-xl border-4 font-mono text-base leading-relaxed shadow-xl ${contrastLight ? 'bg-slate-900 border-slate-950 text-emerald-455 font-black' : 'bg-slate-955 border-slate-800 text-emerald-400'}`}>
                            <div className="text-slate-500 mb-1">// Utility = Information Density / Expected Time Cost</div>
                            <span className="text-purple-400">def</span> <span className="text-blue-400">calc_utility</span>(uncertainty, speed_residual):<br />
                            <br />
                            &nbsp;&nbsp;<span className="text-slate-500"># OLS residual flags cognitive fatigue</span><br />
                            &nbsp;&nbsp;<span className="text-purple-400">if</span> speed_residual &gt;= <span className="text-amber-450 font-black">1.5</span> * baseline:<br />
                            &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">return</span> route_low_complexity()<br />
                            <br />
                            &nbsp;&nbsp;<span className="text-purple-400">return</span> argmax(uncertainty / expected_seconds)<br />
                        </div>
                        <div className="space-y-3 text-base md:text-lg text-slate-450 leading-relaxed font-bold">
                            <div className="flex gap-4 items-center">
                                <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 shrink-0"><Server size={20} /></div>
                                <span className={`${contrastLight ? 'text-slate-900 font-black' : 'text-slate-200'}`}>React UI collects keystroke & scroll dynamics.</span>
                            </div>
                            <div className="flex gap-4 items-center">
                                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0"><Database size={20} /></div>
                                <span className={`${contrastLight ? 'text-slate-900 font-black' : 'text-slate-200'}`}>MongoDB handles distributed asynchronous queues.</span>
                            </div>
                            <div className="flex gap-4 items-center">
                                <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 shrink-0"><Settings size={20} /></div>
                                <span className={`${contrastLight ? 'text-slate-900 font-black' : 'text-slate-200'}`}>Python Flask calculates multi-model consensus.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    // SLIDE 5 — TECHNOLOGICAL INNOVATION (NEW, VISUAL)
    {
        title: "Technological Innovation",
        subtitle: "Breaking the boundaries of modern Active Learning",
        icon: Cpu,
        iconColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
        content: (
            <div className="h-full w-full flex flex-col justify-center items-center gap-6 px-4 py-2 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full text-center">
                    <div className={`p-6 rounded-3xl border-4 flex flex-col items-center gap-4 ${contrastLight ? 'bg-gradient-to-b from-white to-slate-50 border-slate-900 shadow-xl' : 'bg-gradient-to-b from-slate-800 to-slate-900 border-slate-700'}`}>
                        <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                            <Layers size={40} />
                        </div>
                        <h3 className={`text-xl font-black uppercase ${contrastLight ? 'text-slate-950' : 'text-white'}`}>Infinite<br/>Scalability</h3>
                        <p className={`text-sm font-bold ${contrastLight ? 'text-slate-700' : 'text-slate-300'}`}>
                            Stateless queue architecture handles 10,000+ concurrent annotators with zero latency degradation.
                        </p>
                    </div>
                    <div className={`p-6 rounded-3xl border-4 flex flex-col items-center gap-4 ${contrastLight ? 'bg-gradient-to-b from-white to-slate-50 border-slate-900 shadow-xl' : 'bg-gradient-to-b from-slate-800 to-slate-900 border-slate-700'}`}>
                        <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                            <Globe size={40} />
                        </div>
                        <h3 className={`text-xl font-black uppercase ${contrastLight ? 'text-slate-950' : 'text-white'}`}>Seamless<br/>Interoperability</h3>
                        <p className={`text-sm font-bold ${contrastLight ? 'text-slate-700' : 'text-slate-300'}`}>
                            API-first integrations with AWS, Databricks, PyTorch, and HuggingFace out of the box.
                        </p>
                    </div>
                    <div className={`p-6 rounded-3xl border-4 flex flex-col items-center gap-4 ${contrastLight ? 'bg-gradient-to-b from-white to-slate-50 border-slate-900 shadow-xl' : 'bg-gradient-to-b from-slate-800 to-slate-900 border-slate-700'}`}>
                        <div className="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500">
                            <Brain size={40} />
                        </div>
                        <h3 className={`text-xl font-black uppercase ${contrastLight ? 'text-slate-950' : 'text-white'}`}>Cognitive<br/>Novelty</h3>
                        <p className={`text-sm font-bold ${contrastLight ? 'text-slate-700' : 'text-slate-300'}`}>
                            The FIRST mathematical fusion of cognitive OLS fatigue tracking and Active Learning heuristics.
                        </p>
                    </div>
                    <div className={`p-6 rounded-3xl border-4 flex flex-col items-center gap-4 ${contrastLight ? 'bg-gradient-to-b from-white to-slate-50 border-slate-900 shadow-xl' : 'bg-gradient-to-b from-slate-800 to-slate-900 border-slate-700'}`}>
                        <div className="w-20 h-20 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-500">
                            <ShieldCheck size={40} />
                        </div>
                        <h3 className={`text-xl font-black uppercase ${contrastLight ? 'text-slate-950' : 'text-white'}`}>Air-Gapped<br/>Privacy</h3>
                        <p className={`text-sm font-bold ${contrastLight ? 'text-slate-700' : 'text-slate-300'}`}>
                            VPC-deployable edge execution ensures absolute compliance for FinTech and Healthcare data.
                        </p>
                    </div>
                </div>
            </div>
        )
    },
    // SLIDE 6 — PERFORMANCE (COMPACT)
    {
        title: "Validated Performance",
        subtitle: "Reaching target accuracy 3.9x faster.",
        icon: ShieldCheck,
        iconColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        content: (
            <div className="h-full flex flex-col justify-center gap-6 w-full max-w-5xl mx-auto px-4 py-2">
                <div className="flex flex-col gap-4 w-full">
                    <h3 className={`text-2xl md:text-3xl font-black text-center ${contrastLight ? 'text-slate-950' : 'text-white'}`}>
                        Time to Reach F1 = 0.80 across 10 NLP Datasets
                    </h3>
                    <div className={`p-6 rounded-3xl border-4 space-y-4 ${contrastLight ? 'bg-white border-slate-900 shadow-2xl' : 'bg-slate-900/40 border-slate-850'}`}>
                        {[
                            { name: "Entropy", time: 148.5, ciStart: 5, ciEnd: 303, color: "bg-green-500/80" },
                            { name: "BADGE", time: 126.5, ciStart: 21, ciEnd: 242, color: "bg-blue-500/80" },
                            { name: "Margin", time: 121.0, ciStart: 5, ciEnd: 238, color: "bg-amber-600/85" },
                            { name: "Random", time: 93.7, ciStart: 38, ciEnd: 150, color: "bg-slate-550/80" },
                            { name: "CAL-Log (Ours)", time: 38.3, ciStart: 15, ciEnd: 62, color: "bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.6)]", isHighlight: true }
                        ].map((item, idx) => {
                            const maxVal = 310;
                            const barWidth = (item.time / maxVal) * 100;
                            const ciLeft = (item.ciStart / maxVal) * 100;
                            const ciWidth = ((item.ciEnd - item.ciStart) / maxVal) * 100;

                            return (
                                <div key={idx} className="grid grid-cols-12 gap-4 items-center">
                                    <div className={`col-span-3 text-right text-lg md:text-xl font-black uppercase ${item.isHighlight ? 'text-rose-500' : contrastLight ? 'text-slate-950' : 'text-slate-300'}`}>
                                        {item.name}
                                    </div>
                                    <div className={`col-span-7 relative h-7 flex items-center rounded-xl border-2 overflow-visible ${contrastLight ? 'bg-slate-100 border-slate-900' : 'bg-slate-955/40 border-slate-900'}`}>
                                        <div className={`absolute h-1 flex items-center justify-between ${contrastLight ? 'bg-slate-950' : 'bg-slate-650'}`} style={{ left: `${ciLeft}%`, width: `${ciWidth}%` }}>
                                            <div className={`w-1 h-3 shrink-0 ${contrastLight ? 'bg-slate-955' : 'bg-slate-650'}`} />
                                            <div className={`w-1 h-3 shrink-0 ${contrastLight ? 'bg-slate-955' : 'bg-slate-650'}`} />
                                        </div>
                                        <div className={`absolute h-5 rounded-lg transition-all duration-1000 ${item.color} ${item.isHighlight ? 'border-2 border-white' : ''} ${contrastLight ? 'border border-slate-950' : ''}`} style={{ width: `${barWidth}%`, left: '0%' }} />
                                    </div>
                                    <div className={`col-span-2 text-xl font-mono font-black ${item.isHighlight ? 'text-rose-650' : contrastLight ? 'text-slate-955' : 'text-slate-400'}`}>
                                        {item.time.toFixed(1)}m
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        )
    },
    // SLIDE 7 — LEAN CANVAS
    {
        title: "", // Lean canvas takes full screen
        subtitle: "",
        icon: Layout,
        iconColor: "text-amber-500 bg-amber-500/10 border-amber-500/20",
        content: (
            <div className="h-full w-full flex flex-col pt-8 px-4 pb-4">
                <h2 className={`text-4xl font-black uppercase text-center mb-6 ${contrastLight ? 'text-slate-950' : 'text-white'}`}>Business Model Canvas</h2>
                <div className={`flex-1 grid grid-cols-5 grid-rows-3 border-4 ${contrastLight ? 'border-slate-950 bg-white text-slate-900' : 'border-slate-700 bg-slate-900 text-slate-200'} shadow-2xl`}>
                    {/* Top Row */}
                    <div className={`col-span-1 row-span-2 border-r-4 border-b-4 p-4 ${contrastLight ? 'border-slate-950' : 'border-slate-700'} flex flex-col gap-2`}>
                        <h3 className="text-xl font-black uppercase text-rose-600">Problem</h3>
                        <ul className="list-disc pl-5 text-lg font-bold leading-relaxed">
                            <li>Manual annotation consumes 80% of AI budgets.</li>
                            <li>Annotator fatigue causes widespread label errors.</li>
                            <li>Random sampling wastes time on trivial documents.</li>
                        </ul>
                    </div>
                    <div className={`col-span-1 row-span-1 border-r-4 border-b-4 p-4 ${contrastLight ? 'border-slate-950' : 'border-slate-700'} flex flex-col gap-2`}>
                        <h3 className="text-xl font-black uppercase text-indigo-600">Solution</h3>
                        <ul className="list-disc pl-5 text-lg font-bold leading-relaxed">
                            <li>Real-time cost-aware sampling logic.</li>
                            <li>OLS behavioral fatigue tracking.</li>
                            <li>Multi-model SLM consensus validation.</li>
                        </ul>
                    </div>
                    <div className={`col-span-1 row-span-2 border-r-4 border-b-4 p-4 ${contrastLight ? 'border-slate-950' : 'border-slate-700'} flex flex-col gap-2 bg-rose-500/5`}>
                        <h3 className="text-xl font-black uppercase text-rose-600">Unique Value Prop</h3>
                        <p className="text-xl font-black leading-snug mt-4">
                            Reach production-grade AI accuracy 3.9x faster than industry standard Active Learning. Save 65% on labeling budgets.
                        </p>
                    </div>
                    <div className={`col-span-1 row-span-1 border-r-4 border-b-4 p-4 ${contrastLight ? 'border-slate-950' : 'border-slate-700'} flex flex-col gap-2`}>
                        <h3 className="text-xl font-black uppercase text-emerald-600">Unfair Advantage</h3>
                        <ul className="list-disc pl-5 text-lg font-bold leading-relaxed">
                            <li>Peer-reviewed algorithms (4+ publications).</li>
                            <li>Proprietary real-time UI telemetry engine.</li>
                        </ul>
                    </div>
                    <div className={`col-span-1 row-span-2 border-b-4 p-4 ${contrastLight ? 'border-slate-950' : 'border-slate-700'} flex flex-col gap-2`}>
                        <h3 className="text-xl font-black uppercase text-purple-600">Customer Segments</h3>
                        <ul className="list-disc pl-5 text-lg font-bold leading-relaxed">
                            <li>Enterprise ML Engineering Teams.</li>
                            <li>Healthcare & FinTech AI Labs.</li>
                            <li>Outsourced Labeling Agencies.</li>
                        </ul>
                    </div>
                    
                    {/* Middle Row nested components */}
                    <div className={`col-span-1 row-span-1 border-r-4 border-b-4 p-4 ${contrastLight ? 'border-slate-950' : 'border-slate-700'} flex flex-col gap-2 col-start-2 row-start-2`}>
                        <h3 className="text-xl font-black uppercase text-indigo-600">Key Metrics</h3>
                        <ul className="list-disc pl-5 text-lg font-bold leading-relaxed">
                            <li>Time-to-target F1 Score.</li>
                            <li>$ saved per annotation hour.</li>
                        </ul>
                    </div>
                    <div className={`col-span-1 row-span-1 border-r-4 border-b-4 p-4 ${contrastLight ? 'border-slate-950' : 'border-slate-700'} flex flex-col gap-2 col-start-4 row-start-2`}>
                        <h3 className="text-xl font-black uppercase text-emerald-600">Channels</h3>
                        <ul className="list-disc pl-5 text-lg font-bold leading-relaxed">
                            <li>B2B Enterprise Direct Sales.</li>
                            <li>Open-source plugins (HuggingFace).</li>
                        </ul>
                    </div>

                    {/* Bottom Row */}
                    <div className={`col-span-2 row-span-1 border-r-4 p-6 ${contrastLight ? 'border-slate-950' : 'border-slate-700'} flex flex-col gap-2`}>
                        <h3 className="text-xl font-black uppercase text-amber-600">Cost Structure</h3>
                        <ul className="list-disc pl-5 text-lg font-bold leading-relaxed">
                            <li>Cloud computing / Inference (AWS, MongoDB) = $250/mo.</li>
                            <li>R&D and engineering maintenance.</li>
                        </ul>
                    </div>
                    <div className={`col-span-3 row-span-1 p-6 flex flex-col gap-2`}>
                        <h3 className="text-xl font-black uppercase text-amber-600">Revenue Streams</h3>
                        <ul className="list-disc pl-5 text-lg font-bold leading-relaxed">
                            <li><b>Pro Tier:</b> $49/mo (Small Teams).</li>
                            <li><b>Enterprise Tier:</b> $499/mo + Usage SLA & Air-gapped deployment.</li>
                            <li>Custom Consulting & Integration.</li>
                        </ul>
                    </div>
                </div>
            </div>
        )
    },
    // SLIDE 8 — PEER REVIEW & PRODUCT ROADMAP
    {
        title: "Peer-reviewed & The Product Roadmap",
        subtitle: "From academic validation to enterprise dominance.",
        icon: Users,
        iconColor: "text-blue-500 bg-blue-500/10 border-blue-500/20",
        content: (
            <div className="h-full flex flex-col justify-center gap-6 w-full max-w-7xl mx-auto py-2 px-4">
                {/* Papers Section */}
                <div className={`p-6 rounded-3xl border-4 ${contrastLight ? 'bg-white border-slate-900 shadow-xl' : 'bg-slate-900/60 border-slate-800'}`}>
                    <h3 className={`text-xl font-black uppercase mb-4 ${contrastLight ? 'text-slate-950' : 'text-white'}`}>Academic Validation (4 Published Papers)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-base font-bold">
                        <div className="flex items-start gap-4">
                            <div className="h-10 w-10 bg-rose-100 text-rose-600 rounded-lg border-2 border-rose-300 flex items-center justify-center font-black"><BookOpen size={20} /></div>
                            <span><b className="text-rose-500">ACL 2026:</b> Cost-Aware Active Learning via Fatigue Clamping (A* NLP Conference)</span>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-lg border-2 border-blue-300 flex items-center justify-center font-black"><FileText size={20} /></div>
                            <span><b className="text-blue-500">IEEE CSNT 2026:</b> Scaling Enterprise NLP Pipelines using Committee Models</span>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="h-10 w-10 bg-emerald-100 text-emerald-600 rounded-lg border-2 border-emerald-300 flex items-center justify-center font-black"><BookOpen size={20} /></div>
                            <span><b className="text-emerald-500">NAACL 2025:</b> Behavioral Tracking in Data Annotation Workflows</span>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="h-10 w-10 bg-purple-100 text-purple-600 rounded-lg border-2 border-purple-300 flex items-center justify-center font-black"><FileText size={20} /></div>
                            <span><b className="text-purple-500">EMNLP 2024:</b> Overcoming Cognitive Bias in Sequential Human-in-the-loop Tasks</span>
                        </div>
                    </div>
                </div>

                {/* Creative Roadmap Section */}
                <div className={`p-6 rounded-3xl border-4 ${contrastLight ? 'bg-white border-slate-900 shadow-xl' : 'bg-slate-900/60 border-slate-800'}`}>
                    <h3 className={`text-xl font-black uppercase mb-8 text-center ${contrastLight ? 'text-slate-950' : 'text-white'}`}>Strategic Product Roadmap</h3>
                    
                    <div className="flex flex-col md:flex-row items-center justify-between relative px-8 pb-4">
                        {/* Connecting Line */}
                        <div className="hidden md:block absolute top-10 left-16 right-16 h-2 bg-gradient-to-r from-blue-500 via-rose-500 to-emerald-500 rounded-full z-0"></div>
                        
                        {/* Roadmap Items */}
                        {[
                            { step: "Phase 1", title: "Core NLP Engine", icon: Database, color: "text-blue-500 border-blue-500", desc: "Live API & Models" },
                            { step: "Phase 2", title: "Enterprise SLA", icon: ShieldCheck, color: "text-indigo-500 border-indigo-500", desc: "On-prem deployments" },
                            { step: "Phase 3", title: "Multi-Modal", icon: Layers, color: "text-rose-500 border-rose-500", desc: "Image & Audio support" },
                            { step: "Phase 4", title: "Global Scale", icon: Globe, color: "text-emerald-500 border-emerald-500", desc: "Open marketplace" },
                        ].map((item, i) => (
                            <div key={i} className="flex flex-col items-center z-10 gap-3 group">
                                <div className={`w-20 h-20 rounded-full border-4 bg-slate-900 flex items-center justify-center shadow-xl transition-transform transform group-hover:scale-110 ${item.color}`}>
                                    <item.icon size={28} className={item.color.split(' ')[0]} />
                                </div>
                                <div className="text-center">
                                    <span className={`block text-xs font-black uppercase tracking-widest ${contrastLight ? 'text-slate-500' : 'text-slate-400'}`}>{item.step}</span>
                                    <h4 className={`text-lg font-black mt-1 ${contrastLight ? 'text-slate-900' : 'text-white'}`}>{item.title}</h4>
                                    <p className={`text-xs font-bold mt-1 ${contrastLight ? 'text-slate-700' : 'text-slate-300'}`}>{item.desc}</p>
                                </div>
                            </div>
                        ))}
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
            <div className="h-full flex flex-col justify-center items-center text-center gap-6 max-w-5xl mx-auto py-2">
                <img src="/logo.jpg" alt="CAL-Log Logo" className="h-28 md:h-32 object-contain bg-white p-2 rounded-2xl border-4 border-slate-350 shadow-2xl animate-bounce" />
                <div className="space-y-6">
                    <h2 className={`text-5xl md:text-7xl font-black uppercase tracking-tight ${contrastLight ? 'text-slate-955' : 'text-white'}`}>
                        This isn't a research idea.<br />
                        <span className="bg-gradient-to-r from-rose-500 to-indigo-555 bg-clip-text text-transparent">
                            It's a tool, ready today.
                        </span>
                    </h2>
                    <p className={`text-2xl md:text-3xl font-bold max-w-3xl mx-auto leading-relaxed ${contrastLight ? 'text-slate-900 font-extrabold' : 'text-slate-300'}`}>
                        Same accuracy. A third of the human time. At a fraction of the budget.
                    </p>
                </div>
                <div className="w-full h-2 bg-gradient-to-r from-transparent via-slate-800 to-transparent my-6" />
                <button onClick={onClose} className="px-10 py-6 bg-gradient-to-r from-rose-600 to-red-505 hover:from-rose-500 hover:to-red-400 text-white font-black text-2xl rounded-2xl shadow-2xl shadow-rose-500/30 transform hover:scale-105 active:scale-95 transition flex items-center gap-4">
                    <Play size={28} className="fill-white" /> Start Live Annotation Demo
                </button>
            </div>
        )
    }
];
