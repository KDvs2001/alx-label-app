import React from 'react';
import { 
    Sparkles, ShieldCheck, HelpCircle, Layers, Brain, Cpu, Users, Award, 
    Check, Play, ArrowRight, Settings, Server, Database, Globe, BookOpen, FileText, Layout,
    MessageSquare, AlertTriangle, Zap, CheckCircle2, Navigation, Crosshair
} from 'lucide-react';

export const getSlides = (contrastLight, onClose) => [
    // SLIDE 1 — TITLE / HOOK
    {
        title: "AI doesn't run out of data. It runs out of time.",
        subtitle: "A smarter way to label data for AI. Built, tested, and published.",
        icon: Sparkles,
        iconColor: "text-amber-450 bg-amber-500/10 border-amber-500/20",
        content: (
            <div className="h-full flex flex-col justify-center items-center text-center gap-6 max-w-4xl mx-auto py-2">
                <img src="/logo.jpg" alt="CAL-Log Logo" className="h-20 md:h-24 object-contain bg-white p-1.5 rounded-xl border-2 border-slate-900 shadow-sm animate-pulse" />
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border-2 border-emerald-600 bg-emerald-500/10 text-emerald-700 text-base font-black uppercase tracking-widest">
                        <ShieldCheck size={18} /> Vihanga Supasan · 4 Published Papers
                    </div>
                    <h1 className={`text-4xl md:text-6xl font-black tracking-tight leading-none uppercase ${contrastLight ? 'text-slate-955' : 'text-white'}`}>
                        AI doesn't run out of data.<br />
                        <span className="bg-gradient-to-r from-rose-500 via-red-500 to-indigo-550 bg-clip-text text-transparent">
                            It runs out of time.
                        </span>
                    </h1>
                </div>
            </div>
        )
    },
    // SLIDE 2 — THE QUESTION
    {
        title: "The Question",
        subtitle: "",
        icon: HelpCircle,
        iconColor: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
        content: (
            <div className="h-full flex flex-col justify-center items-center text-center gap-6 max-w-4xl mx-auto py-2">
                <h2 className={`text-4xl md:text-6xl font-black uppercase tracking-tight leading-snug ${contrastLight ? 'text-slate-955' : 'text-white'}`}>
                    How much of your AI project<br/>is spent labeling data by hand?
                </h2>
                <div className="mt-8">
                    <span className="text-2xl font-black text-rose-500 animate-pulse uppercase tracking-widest">Take a guess.</span>
                </div>
            </div>
        )
    },
    // SLIDE 3 — THE ANSWER
    {
        title: "The Answer",
        subtitle: "The massive unseen cost of generative intelligence.",
        icon: AlertTriangle,
        iconColor: "text-rose-500 bg-rose-500/10 border-rose-500/20",
        content: (
            <div className="h-full flex flex-col justify-center items-center gap-6 max-w-5xl mx-auto py-2">
                <div className="text-center">
                    <h2 className={`text-4xl md:text-6xl font-black tracking-tight uppercase ${contrastLight ? 'text-slate-955' : 'text-white'}`}>
                        <span className="text-rose-500">80%</span> of every AI project.
                    </h2>
                    <p className={`text-xl md:text-2xl font-bold mt-2 ${contrastLight ? 'text-slate-900' : 'text-slate-350'}`}>
                        Humans. One sample at a time.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-6 text-left">
                    <div className={`p-6 rounded-2xl border-4 flex flex-col gap-2 ${contrastLight ? 'bg-white border-slate-900 shadow-xl' : 'bg-slate-900/60 border-slate-800'}`}>
                        <span className="text-sm font-black text-blue-500 uppercase tracking-widest">SCALE</span>
                        <h3 className={`text-3xl font-black ${contrastLight ? 'text-slate-950' : 'text-white'}`}>$20B</h3>
                        <p className={`text-base font-bold flex-1 ${contrastLight ? 'text-slate-800' : 'text-slate-300'}`}>Projected data labeling market by 2030, growing 5x from 2024.</p>
                        <span className="text-xs text-slate-500 font-mono mt-1">Grand View Research</span>
                    </div>
                    <div className={`p-6 rounded-2xl border-4 flex flex-col gap-2 ${contrastLight ? 'bg-white border-slate-900 shadow-xl' : 'bg-slate-900/60 border-slate-800'}`}>
                        <span className="text-sm font-black text-rose-500 uppercase tracking-widest">IMPACT</span>
                        <h3 className={`text-3xl font-black ${contrastLight ? 'text-slate-950' : 'text-white'}`}>60%</h3>
                        <p className={`text-base font-bold flex-1 ${contrastLight ? 'text-slate-800' : 'text-slate-300'}`}>Of AI projects abandoned by 2026 due to poor data quality.</p>
                        <span className="text-xs text-slate-500 font-mono mt-1">Gartner</span>
                    </div>
                    <div className={`p-6 rounded-2xl border-4 flex flex-col gap-2 ${contrastLight ? 'bg-white border-slate-900 shadow-xl' : 'bg-slate-900/60 border-slate-800'}`}>
                        <span className="text-sm font-black text-emerald-500 uppercase tracking-widest">URGENCY</span>
                        <h3 className={`text-3xl font-black ${contrastLight ? 'text-slate-950' : 'text-white'}`}>$14.3B</h3>
                        <p className={`text-base font-bold flex-1 ${contrastLight ? 'text-slate-800' : 'text-slate-300'}`}>Meta paid this for 49% of Scale AI in June 2025.</p>
                        <span className="text-xs text-slate-500 font-mono mt-1">Market Deal</span>
                    </div>
                </div>
            </div>
        )
    },
    // SLIDE 4 — EXISTING SOLUTIONS
    {
        title: "Existing Solutions",
        subtitle: "A crowded market. Nobody solves the real problem.",
        icon: Crosshair,
        iconColor: "text-amber-500 bg-amber-500/10 border-amber-500/20",
        content: (
            <div className="h-full flex flex-col justify-center items-center gap-6 max-w-5xl mx-auto py-2">
                <h3 className={`text-2xl font-black uppercase ${contrastLight ? 'text-slate-950' : 'text-white'}`}>Everyone competes on features. CAL-Log competes on time.</h3>
                
                <div className={`relative w-full max-w-3xl aspect-video rounded-3xl border-4 flex items-center justify-center p-8 ${contrastLight ? 'bg-white border-slate-900 shadow-2xl' : 'bg-slate-900/60 border-slate-800'}`}>
                    {/* Axes */}
                    <div className="absolute left-8 right-8 top-1/2 h-1 bg-slate-300 -translate-y-1/2 rounded"></div>
                    <div className="absolute top-8 bottom-8 left-1/2 w-1 bg-slate-300 -translate-x-1/2 rounded"></div>
                    
                    {/* Labels */}
                    <span className="absolute top-4 left-1/2 -translate-x-1/2 font-black text-sm uppercase text-slate-400">Cost-Aware</span>
                    <span className="absolute bottom-4 left-1/2 -translate-x-1/2 font-black text-sm uppercase text-slate-400">Cost-Blind</span>
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-sm uppercase text-slate-400 -rotate-90">Rigid</span>
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-sm uppercase text-slate-400 rotate-90">Adaptive</span>

                    {/* Competitors (Bottom/Left) */}
                    <div className="absolute bottom-1/4 left-1/4 -translate-x-1/2 translate-y-1/2 bg-slate-100 border-2 border-slate-300 text-slate-700 font-bold px-4 py-2 rounded-lg text-sm shadow">Prodigy</div>
                    <div className="absolute bottom-1/3 left-1/3 -translate-x-1/2 translate-y-1/2 bg-slate-100 border-2 border-slate-300 text-slate-700 font-bold px-4 py-2 rounded-lg text-sm shadow">Label Studio</div>
                    <div className="absolute top-2/3 right-1/3 translate-x-1/2 translate-y-1/2 bg-slate-100 border-2 border-slate-300 text-slate-700 font-bold px-4 py-2 rounded-lg text-sm shadow">Scale AI</div>
                    <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 bg-slate-100 border-2 border-slate-300 text-slate-700 font-bold px-4 py-2 rounded-lg text-sm shadow">Snorkel Flow</div>
                    <div className="absolute bottom-1/4 right-1/3 translate-x-1/2 translate-y-1/2 bg-slate-100 border-2 border-slate-300 text-slate-700 font-bold px-4 py-2 rounded-lg text-sm shadow">Doccano</div>

                    {/* CAL-Log (Top Right) */}
                    <div className="absolute top-1/4 right-1/4 translate-x-1/2 -translate-y-1/2 bg-rose-500 border-4 border-rose-700 text-white font-black px-6 py-3 rounded-xl shadow-[0_0_30px_rgba(244,63,94,0.6)] animate-pulse text-lg">
                        CAL-Log
                    </div>
                </div>
            </div>
        )
    },
    // SLIDE 5 — THE GAPS
    {
        title: "Three Gaps",
        subtitle: "Ranked by what actually costs money.",
        icon: Layers,
        iconColor: "text-rose-500 bg-rose-500/10 border-rose-500/20",
        content: (
            <div className="h-full flex flex-col justify-center gap-4 max-w-6xl mx-auto py-2">
                {[
                    { num: "1", type: "PRIORITY 1 · BUSINESS", title: "Nobody prices per sample", desc: "Every tool assumes a tweet and a 500-word document cost the same. Result: teams pay for hours of trivial labels.", badge: "Confirmed by 19 of 31 surveyed domain experts", badgeColor: contrastLight ? "bg-rose-100 text-rose-900 border-rose-550 border-2" : "bg-rose-500/10 text-rose-450 border-rose-500/20" },
                    { num: "2", type: "PRIORITY 2 · BUSINESS", title: "Nobody adapts to the annotator", desc: "One-size-fits-all task queues ignore that annotators have different speeds and get tired. Result: burnout and quality drops.", badge: "Flagged in interviews & literature (Mortagua, 2025)", badgeColor: contrastLight ? "bg-amber-100 text-amber-905 border-amber-600 border-2" : "bg-amber-500/10 text-amber-400 border-amber-500/20" },
                    { num: "3", type: "PRIORITY 3 · TECHNICAL", title: "Nobody trusts the model early", desc: "Active learning tools use uncalibrated confidence from round one. Result: the model picks bad samples and the loop degrades.", badge: "Documented failure mode in 52% of AL benchmarks", badgeColor: contrastLight ? "bg-purple-100 text-purple-900 border-purple-650 border-2" : "bg-purple-500/10 text-purple-400 border-purple-500/20" }
                ].map((gap) => (
                    <div key={gap.num} className={`p-6 rounded-2xl border-4 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center ${contrastLight ? 'bg-white border-slate-900 shadow-xl' : 'bg-slate-900/60 border-slate-850'}`}>
                        <div className="flex gap-4 items-start text-left w-full">
                            <div className="w-14 h-14 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-black text-2xl shrink-0 border-2 border-rose-550/20">
                                {gap.num}
                            </div>
                            <div className="space-y-2 flex-1">
                                <div className={`text-sm font-black uppercase tracking-widest ${contrastLight ? 'text-slate-800' : 'text-slate-500'}`}>{gap.type}</div>
                                <h4 className={`font-black text-2xl ${contrastLight ? 'text-slate-955' : 'text-white'}`}>{gap.title}</h4>
                                <p className={`text-base font-bold ${contrastLight ? 'text-slate-900' : 'text-slate-400'}`}>{gap.desc}</p>
                            </div>
                            <span className={`text-sm font-black px-4 py-2 rounded-full shrink-0 max-w-[250px] text-center ${gap.badgeColor}`}>{gap.badge}</span>
                        </div>
                    </div>
                ))}
            </div>
        )
    },
    // SLIDE 6 — OUR SOLUTION
    {
        title: "Our Solution",
        subtitle: "CAL-Log fills all three gaps with one idea.",
        icon: Navigation,
        iconColor: "text-blue-500 bg-blue-500/10 border-blue-500/20",
        content: (
            <div className="h-full flex flex-col justify-center items-center gap-8 max-w-6xl mx-auto py-2 px-4">
                <div className={`w-full p-8 rounded-3xl border-4 text-center ${contrastLight ? 'bg-blue-50 border-blue-900 shadow-xl' : 'bg-blue-900/20 border-blue-800'}`}>
                    <h2 className={`text-3xl md:text-4xl font-black uppercase ${contrastLight ? 'text-blue-950' : 'text-blue-100'}`}>
                        Think of it as <span className="text-blue-600">Waze</span> for data labeling.
                    </h2>
                    <p className={`text-xl font-bold mt-2 ${contrastLight ? 'text-blue-900' : 'text-blue-300'}`}>
                        It routes your team around the slow, the redundant, and the uncertain.
                    </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
                    <div className={`p-8 rounded-3xl border-4 flex flex-col gap-4 ${contrastLight ? 'bg-white border-slate-900 shadow-xl' : 'bg-slate-900/60 border-slate-800'}`}>
                        <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-600 mb-2">
                            <Brain size={32} />
                        </div>
                        <h3 className={`text-2xl font-black uppercase ${contrastLight ? 'text-slate-950' : 'text-white'}`}>Innovation</h3>
                        <p className={`text-base font-bold leading-relaxed ${contrastLight ? 'text-slate-800' : 'text-slate-300'}`}>
                            A new kind of active learning. First framework to combine cost-aware selection, live annotator adaptation, and calibrated confidence in one loop.
                        </p>
                    </div>
                    <div className={`p-8 rounded-3xl border-4 flex flex-col gap-4 ${contrastLight ? 'bg-white border-slate-900 shadow-xl' : 'bg-slate-900/60 border-slate-800'}`}>
                        <div className="w-16 h-16 rounded-2xl bg-rose-500/20 flex items-center justify-center text-rose-600 mb-2">
                            <Server size={32} />
                        </div>
                        <h3 className={`text-2xl font-black uppercase ${contrastLight ? 'text-slate-950' : 'text-white'}`}>Application</h3>
                        <p className={`text-base font-bold leading-relaxed ${contrastLight ? 'text-slate-800' : 'text-slate-300'}`}>
                            Production-grade engineering. RoBERTa + SBERT + Node/React + MongoDB. Distributed microservices. Not a research script. A running product.
                        </p>
                    </div>
                    <div className={`p-8 rounded-3xl border-4 flex flex-col gap-4 ${contrastLight ? 'bg-white border-slate-900 shadow-xl' : 'bg-slate-900/60 border-slate-800'}`}>
                        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-600 mb-2">
                            <Settings size={32} />
                        </div>
                        <h3 className={`text-2xl font-black uppercase ${contrastLight ? 'text-slate-950' : 'text-white'}`}>Compatibility</h3>
                        <p className={`text-base font-bold leading-relaxed ${contrastLight ? 'text-slate-800' : 'text-slate-300'}`}>
                            Plugs into any pipeline. Standard REST API. JSON in, JSON out. Any annotation team, any domain, any deployment.
                        </p>
                    </div>
                </div>
            </div>
        )
    },
    // SLIDE 7 — TESTED. VALIDATED. STANDARDS-READY.
    {
        title: "Tested. Validated. Standards-Ready.",
        subtitle: "Does it actually work? Six of six ticks.",
        icon: ShieldCheck,
        iconColor: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
        content: (
            <div className="h-full flex flex-col justify-center gap-6 w-full max-w-7xl mx-auto px-4 py-2">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full items-stretch">
                    
                    {/* Left: Table */}
                    <div className={`p-6 rounded-3xl border-4 flex flex-col ${contrastLight ? 'bg-white border-slate-900 shadow-xl' : 'bg-slate-900/60 border-slate-800'}`}>
                        <table className="w-full text-left border-collapse text-sm flex-1">
                            <thead>
                                <tr className={`border-b-2 ${contrastLight ? 'border-slate-900' : 'border-slate-700'}`}>
                                    <th className={`py-3 font-black ${contrastLight ? 'text-slate-950' : 'text-slate-200'}`}>Features</th>
                                    <th className="py-3 font-black text-rose-600 text-center">CAL-Log</th>
                                    <th className={`py-3 font-black text-center ${contrastLight ? 'text-slate-500' : 'text-slate-500'}`}>Prodigy</th>
                                    <th className={`py-3 font-black text-center ${contrastLight ? 'text-slate-500' : 'text-slate-500'}`}>Scale AI</th>
                                    <th className={`py-3 font-black text-center ${contrastLight ? 'text-slate-500' : 'text-slate-500'}`}>Snorkel</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y-2 ${contrastLight ? 'divide-slate-200' : 'divide-slate-800/40'}`}>
                                {[
                                    ["Active Learning", true, true, true, false],
                                    ["Cost-Aware Selection", true, false, true, false],
                                    ["Adaptive to Annotator Speed", true, false, false, false],
                                    ["Real-Time Fatigue Detection", true, false, false, false],
                                    ["Semantic Deduplication", true, false, false, true],
                                    ["Calibrated Confidence", true, false, false, false],
                                    ["Transparent 'Why' Explanation", true, false, false, false]
                                ].map((row, idx) => (
                                    <tr key={idx}>
                                        <td className={`py-3 font-bold ${contrastLight ? 'text-slate-950 font-black' : 'text-slate-300'}`}>{row[0]}</td>
                                        <td className="py-3 text-center font-black text-rose-600 text-lg">{row[1] ? "✓" : "—"}</td>
                                        <td className={`py-3 text-center text-lg ${contrastLight ? 'text-slate-400 font-bold' : 'text-slate-600'}`}>{row[2] ? "✓" : "—"}</td>
                                        <td className={`py-3 text-center text-lg ${contrastLight ? 'text-slate-400 font-bold' : 'text-slate-600'}`}>{row[3] ? "✓" : "—"}</td>
                                        <td className={`py-3 text-center text-lg ${contrastLight ? 'text-slate-400 font-bold' : 'text-slate-600'}`}>{row[4] ? "✓" : "—"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Right: Graph + Standards */}
                    <div className="flex flex-col gap-6">
                        <div className={`p-6 rounded-3xl border-4 ${contrastLight ? 'bg-white border-slate-900 shadow-xl' : 'bg-slate-900/60 border-slate-800'}`}>
                            <span className="text-sm font-black text-rose-600 uppercase tracking-widest">PROVEN RESULT</span>
                            <h3 className={`text-2xl font-black mt-1 ${contrastLight ? 'text-slate-950' : 'text-white'}`}>3.9x faster than the next best tool</h3>
                            <p className={`text-base font-bold mt-1 mb-4 ${contrastLight ? 'text-slate-800' : 'text-slate-400'}`}>38 min vs. 148 min to hit F1=0.80 target across 10 real datasets.</p>
                            
                            {/* Mini Graph */}
                            <div className="space-y-3">
                                {[
                                    { name: "Entropy", time: 148.5, color: "bg-green-500" },
                                    { name: "CAL-Log", time: 38.3, color: "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]", highlight: true }
                                ].map((item, idx) => (
                                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                                        <div className={`col-span-3 text-right text-sm font-black uppercase ${item.highlight ? 'text-rose-600' : contrastLight ? 'text-slate-950' : 'text-slate-400'}`}>{item.name}</div>
                                        <div className="col-span-7 h-5 flex items-center">
                                            <div className={`h-full rounded ${item.color}`} style={{ width: `${(item.time/150)*100}%` }}></div>
                                        </div>
                                        <div className={`col-span-2 text-sm font-mono font-black ${item.highlight ? 'text-rose-600' : contrastLight ? 'text-slate-950' : 'text-slate-400'}`}>{item.time}m</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={`p-6 rounded-3xl border-4 flex-1 ${contrastLight ? 'bg-white border-slate-900 shadow-xl' : 'bg-slate-900/60 border-slate-800'}`}>
                            <span className="text-sm font-black text-emerald-600 uppercase tracking-widest">STANDARDS COMPLIANT</span>
                            <div className="grid grid-cols-2 gap-4 mt-4 text-sm font-bold">
                                <div className="flex items-center gap-2"><CheckCircle2 size={18} className="text-emerald-500"/> UK GDPR · 0 trackers, 0 PII</div>
                                <div className="flex items-center gap-2"><CheckCircle2 size={18} className="text-emerald-500"/> BCS Code of Conduct</div>
                                <div className="flex items-center gap-2"><CheckCircle2 size={18} className="text-emerald-500"/> OWASP · 0 critical vulnerabilities</div>
                                <div className="flex items-center gap-2"><CheckCircle2 size={18} className="text-emerald-500"/> WCAG · accessible by design</div>
                                <div className="flex items-center gap-2"><CheckCircle2 size={18} className="text-emerald-500"/> Nielsen Heuristics · 8 of 10 clean</div>
                                <div className="flex items-center gap-2"><CheckCircle2 size={18} className="text-emerald-500"/> 99%+ uptime · verified</div>
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
        subtitle: "Every project saves a month of running the tool.",
        icon: Cpu,
        iconColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
        content: (
            <div className="h-full flex flex-col justify-center gap-6 max-w-6xl mx-auto py-2 px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full items-stretch">
                    
                    <div className="flex flex-col gap-6">
                        <div className={`p-8 rounded-3xl border-4 ${contrastLight ? 'bg-white border-slate-900 shadow-xl' : 'bg-slate-900/60 border-slate-800'}`}>
                            <span className="text-sm font-black text-rose-500 uppercase tracking-widest block mb-4">THE MATH</span>
                            <div className="space-y-4">
                                <div className="flex justify-between items-end border-b-2 pb-2 border-slate-200 dark:border-slate-700">
                                    <span className={`text-xl font-black ${contrastLight ? 'text-slate-950' : 'text-white'}`}>Costs to run:</span>
                                    <span className="text-2xl font-mono font-black text-rose-500">$200–300 / month</span>
                                </div>
                                <div className="flex justify-between items-end border-b-2 pb-2 border-slate-200 dark:border-slate-700">
                                    <span className={`text-xl font-black ${contrastLight ? 'text-slate-950' : 'text-white'}`}>Saves per project:</span>
                                    <span className="text-2xl font-mono font-black text-emerald-500">$600 (typical job)</span>
                                </div>
                            </div>
                        </div>

                        <div className={`p-8 rounded-3xl border-4 flex-1 ${contrastLight ? 'bg-white border-slate-900 shadow-xl' : 'bg-slate-900/60 border-slate-800'}`}>
                            <span className="text-sm font-black text-emerald-500 uppercase tracking-widest block mb-4">REVENUE MODEL</span>
                            <ul className="space-y-4 text-lg font-bold">
                                <li className="flex items-start gap-3"><span className="text-emerald-500 font-black">Free</span> <span>solo researchers, small pilots</span></li>
                                <li className="flex items-start gap-3"><span className="text-emerald-500 font-black">$49/mo</span> <span>small teams up to 5 annotators</span></li>
                                <li className="flex items-start gap-3"><span className="text-emerald-500 font-black">$499/mo</span> <span>enterprise: on-prem, SLA, integrations</span></li>
                            </ul>
                        </div>
                    </div>

                    <div className={`p-8 rounded-3xl border-4 flex flex-col ${contrastLight ? 'bg-white border-slate-900 shadow-xl' : 'bg-slate-900/60 border-slate-800'}`}>
                        <span className="text-sm font-black text-indigo-500 uppercase tracking-widest block mb-4">WHO IT'S FOR</span>
                        <div className="space-y-6 text-lg font-bold flex-1">
                            <div className="flex gap-4 items-start">
                                <ArrowRight className="text-indigo-500 shrink-0 mt-1" />
                                <div>
                                    <h4 className={`text-xl font-black ${contrastLight ? 'text-slate-950' : 'text-white'}`}>ML teams building text AI</h4>
                                    <p className={`${contrastLight ? 'text-slate-700' : 'text-slate-400'}`}>fintech, legaltech, healthtech, moderation</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <ArrowRight className="text-indigo-500 shrink-0 mt-1" />
                                <div>
                                    <h4 className={`text-xl font-black ${contrastLight ? 'text-slate-950' : 'text-white'}`}>University NLP labs</h4>
                                    <p className={`${contrastLight ? 'text-slate-700' : 'text-slate-400'}`}>annotation projects with real budget pressure</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <ArrowRight className="text-indigo-500 shrink-0 mt-1" />
                                <div>
                                    <h4 className={`text-xl font-black ${contrastLight ? 'text-slate-950' : 'text-white'}`}>Data labeling agencies</h4>
                                    <p className={`${contrastLight ? 'text-slate-700' : 'text-slate-400'}`}>firms billing hourly, needing throughput edge</p>
                                </div>
                            </div>
                        </div>
                        <div className={`p-4 rounded-xl mt-4 border-2 ${contrastLight ? 'bg-indigo-50 border-indigo-200' : 'bg-indigo-900/20 border-indigo-800'}`}>
                            <p className="text-lg font-black text-center text-indigo-600">One project's savings covers a month of running it. Every project after that is pure margin.</p>
                        </div>
                    </div>

                </div>
            </div>
        )
    },
    // SLIDE 9 — VALIDATED BY EXPERTS
    {
        title: "Validated by Experts",
        subtitle: "31 experts reviewed it. Their feedback shaped what shipped.",
        icon: Users,
        iconColor: "text-amber-500 bg-amber-500/10 border-amber-500/20",
        content: (
            <div className="h-full flex flex-col justify-center gap-6 max-w-7xl mx-auto py-2 px-4">
                {/* Stats */}
                <div className="flex flex-wrap justify-center gap-4">
                    <div className="px-6 py-2 rounded-full border-4 border-slate-300 bg-slate-100 text-slate-800 font-black text-sm md:text-base">42 Experts Contacted</div>
                    <div className="px-6 py-2 rounded-full border-4 border-rose-500 bg-rose-500 text-white font-black text-sm md:text-base shadow-lg shadow-rose-500/30">31 Usable Responses</div>
                    <div className="px-6 py-2 rounded-full border-4 border-slate-300 bg-slate-100 text-slate-800 font-black text-sm md:text-base">19 AL/NLP Researchers</div>
                    <div className="px-6 py-2 rounded-full border-4 border-slate-300 bg-slate-100 text-slate-800 font-black text-sm md:text-base">12 ML Engineers</div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                    {/* Quotes */}
                    <div className={`p-6 rounded-3xl border-4 flex flex-col gap-4 ${contrastLight ? 'bg-white border-slate-900 shadow-xl' : 'bg-slate-900/60 border-slate-800'}`}>
                        <span className="text-sm font-black text-indigo-500 uppercase tracking-widest">WHAT THEY SAID</span>
                        
                        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/50">
                            <p className="text-base font-bold italic">"Strong practical and commercial value. The balance between utility and annotation time is effective."</p>
                            <span className="block mt-2 text-sm font-black text-rose-500">— Evaluator 19 · ML Engineer</span>
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/50">
                            <p className="text-base font-bold italic">"75.6% improvement over baselines, with a clear peak at 60 minutes of annotation."</p>
                            <span className="block mt-2 text-sm font-black text-rose-500">— Evaluator 13 · AL Researcher</span>
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/50">
                            <p className="text-base font-bold italic">"Cost angle is an important but largely neglected dimension in current active learning."</p>
                            <span className="block mt-2 text-sm font-black text-rose-500">— Evaluator 2 · Domain Expert</span>
                        </div>
                    </div>

                    {/* Feedback to changes */}
                    <div className={`p-6 rounded-3xl border-4 flex flex-col gap-4 ${contrastLight ? 'bg-white border-slate-900 shadow-xl' : 'bg-slate-900/60 border-slate-800'}`}>
                        <span className="text-sm font-black text-emerald-500 uppercase tracking-widest">FEEDBACK → WHAT CHANGED</span>
                        <div className="space-y-4 text-base font-bold flex-1">
                            <div className="flex items-center justify-between border-b-2 border-slate-200 dark:border-slate-700 pb-3">
                                <span className={contrastLight ? 'text-slate-700' : 'text-slate-400'}>"Spy Window" term unclear</span>
                                <ArrowRight className="text-slate-400 mx-2 shrink-0"/>
                                <span className={contrastLight ? 'text-slate-950 font-black' : 'text-white font-black'}>Added parameter explainer modal</span>
                            </div>
                            <div className="flex items-center justify-between border-b-2 border-slate-200 dark:border-slate-700 pb-3">
                                <span className={contrastLight ? 'text-slate-700' : 'text-slate-400'}>Alpha / Beta hidden</span>
                                <ArrowRight className="text-slate-400 mx-2 shrink-0"/>
                                <span className={contrastLight ? 'text-slate-950 font-black' : 'text-white font-black'}>Info icon + inline explainer</span>
                            </div>
                            <div className="flex items-center justify-between border-b-2 border-slate-200 dark:border-slate-700 pb-3">
                                <span className={contrastLight ? 'text-slate-700' : 'text-slate-400'}>Slow initial load</span>
                                <ArrowRight className="text-slate-400 mx-2 shrink-0"/>
                                <span className={contrastLight ? 'text-slate-950 font-black' : 'text-white font-black'}>React lazy-loading + code-splitting</span>
                            </div>
                            <div className="flex items-center justify-between border-b-2 border-slate-200 dark:border-slate-700 pb-3">
                                <span className={contrastLight ? 'text-slate-700' : 'text-slate-400'}>Accessibility gaps</span>
                                <ArrowRight className="text-slate-400 mx-2 shrink-0"/>
                                <span className={contrastLight ? 'text-slate-950 font-black' : 'text-white font-black'}>WCAG heading + ARIA restructure</span>
                            </div>
                            <div className="flex items-center justify-between border-b-2 border-slate-200 dark:border-slate-700 pb-3">
                                <span className={contrastLight ? 'text-slate-700' : 'text-slate-400'}>Notification spam</span>
                                <ArrowRight className="text-slate-400 mx-2 shrink-0"/>
                                <span className={contrastLight ? 'text-slate-950 font-black' : 'text-white font-black'}>Throttled to session milestones</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    // SLIDE 10 — WHERE WE ARE
    {
        title: "Where We Are",
        subtitle: "Peer-reviewed. Deployed. Growing.",
        icon: Award,
        iconColor: "text-blue-500 bg-blue-500/10 border-blue-500/20",
        content: (
            <div className="h-full flex flex-col justify-center gap-6 w-full max-w-7xl mx-auto py-2 px-4">
                {/* Papers Section */}
                <div className={`p-6 rounded-3xl border-4 ${contrastLight ? 'bg-white border-slate-900 shadow-xl' : 'bg-slate-900/60 border-slate-800'}`}>
                    <h3 className={`text-xl font-black uppercase mb-4 ${contrastLight ? 'text-slate-950' : 'text-white'}`}>PUBLISHED IN:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-base font-bold">
                        <div className="flex items-start gap-4">
                            <div className="h-10 w-10 bg-rose-100 text-rose-600 rounded-lg border-2 border-rose-300 flex items-center justify-center font-black"><BookOpen size={20} /></div>
                            <span><b className="text-rose-500">ACL 2026:</b> Accepted, presented, and published (A* NLP)</span>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-lg border-2 border-blue-300 flex items-center justify-center font-black"><FileText size={20} /></div>
                            <span><b className="text-blue-500">IEEE CSNT 2026:</b> Accepted</span>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="h-10 w-10 bg-emerald-100 text-emerald-600 rounded-lg border-2 border-emerald-300 flex items-center justify-center font-black"><BookOpen size={20} /></div>
                            <span><b className="text-emerald-500">ICAIIC 2026:</b> Published</span>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="h-10 w-10 bg-purple-100 text-purple-600 rounded-lg border-2 border-purple-300 flex items-center justify-center font-black"><FileText size={20} /></div>
                            <span><b className="text-purple-500">SCSE 2026:</b> Published</span>
                        </div>
                    </div>
                </div>

                {/* Creative Roadmap Section */}
                <div className={`p-6 rounded-3xl border-4 ${contrastLight ? 'bg-white border-slate-900 shadow-xl' : 'bg-slate-900/60 border-slate-800'}`}>
                    <h3 className={`text-xl font-black uppercase mb-8 text-center ${contrastLight ? 'text-slate-950' : 'text-white'}`}>THE ROADMAP</h3>
                    
                    <div className="flex flex-col md:flex-row items-center justify-between relative px-8 pb-4">
                        {/* Connecting Line */}
                        <div className="hidden md:block absolute top-10 left-16 right-16 h-2 bg-gradient-to-r from-blue-500 via-rose-500 to-emerald-500 rounded-full z-0"></div>
                        
                        {/* Roadmap Items */}
                        {[
                            { step: "Now", title: "Live", icon: Database, color: "text-blue-500 border-blue-500", desc: "4 papers, 10 datasets" },
                            { step: "Q1", title: "Public Pilot", icon: Users, color: "text-indigo-500 border-indigo-500", desc: "3 partner labs" },
                            { step: "Q2", title: "Multi-Modal", icon: Layers, color: "text-rose-500 border-rose-500", desc: "Image & audio expansion" },
                            { step: "Q3", title: "Enterprise", icon: ShieldCheck, color: "text-emerald-500 border-emerald-500", desc: "On-prem release with SLA" },
                        ].map((item, i) => (
                            <div key={i} className="flex flex-col items-center z-10 gap-3 group text-center px-2">
                                <div className={`w-20 h-20 rounded-full border-4 bg-slate-900 flex items-center justify-center shadow-xl transition-transform transform group-hover:scale-110 ${item.color}`}>
                                    <item.icon size={28} className={item.color.split(' ')[0]} />
                                </div>
                                <div>
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
    // SLIDE 11 — CLOSE
    {
        title: "Close",
        subtitle: "",
        icon: Check,
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
                        Same accuracy, a third of the time, at a fraction of the cost.
                    </p>
                </div>
                <div className="w-full h-2 bg-gradient-to-r from-transparent via-slate-800 to-transparent my-6" />
                <h3 className={`text-2xl font-black italic ${contrastLight ? 'text-slate-500' : 'text-slate-400'}`}>Thank you. Happy to take your questions.</h3>
                <button onClick={onClose} className="mt-4 px-10 py-6 bg-gradient-to-r from-rose-600 to-red-505 hover:from-rose-500 hover:to-red-400 text-white font-black text-2xl rounded-2xl shadow-2xl shadow-rose-500/30 transform hover:scale-105 active:scale-95 transition flex items-center gap-4">
                    <Play size={28} className="fill-white" /> Start Live Annotation Demo
                </button>
            </div>
        )
    },
    // SLIDE 12 — APPENDIX (LEAN CANVAS)
    {
        title: "Appendix", // Lean canvas takes full screen
        subtitle: "The Business Model Canvas",
        icon: Layout,
        iconColor: "text-amber-500 bg-amber-500/10 border-amber-500/20",
        content: (
            <div className="h-full w-full flex flex-col pt-4 px-4 pb-4">
                <h2 className={`text-4xl font-black uppercase text-center mb-4 ${contrastLight ? 'text-slate-950' : 'text-white'}`}>Business Model Canvas</h2>
                <div className={`flex-1 grid grid-cols-5 grid-rows-3 border-4 ${contrastLight ? 'border-slate-950 bg-white text-slate-900' : 'border-slate-700 bg-slate-900 text-slate-200'} shadow-2xl`}>
                    {/* Top Row */}
                    <div className={`col-span-1 row-span-2 border-r-4 border-b-4 p-4 ${contrastLight ? 'border-slate-950' : 'border-slate-700'} flex flex-col gap-2`}>
                        <h3 className="text-xl font-black uppercase text-rose-600">Problem</h3>
                        <ul className="list-disc pl-5 text-base font-bold leading-relaxed">
                            <li>Manual annotation consumes 80% of AI budgets.</li>
                            <li>Annotator fatigue causes widespread label errors.</li>
                            <li>Random sampling wastes time on trivial documents.</li>
                        </ul>
                    </div>
                    <div className={`col-span-1 row-span-1 border-r-4 border-b-4 p-4 ${contrastLight ? 'border-slate-950' : 'border-slate-700'} flex flex-col gap-2`}>
                        <h3 className="text-xl font-black uppercase text-indigo-600">Solution</h3>
                        <ul className="list-disc pl-5 text-base font-bold leading-relaxed">
                            <li>Real-time cost-aware sampling logic.</li>
                            <li>OLS behavioral fatigue tracking.</li>
                            <li>Multi-model SLM consensus validation.</li>
                        </ul>
                    </div>
                    <div className={`col-span-1 row-span-2 border-r-4 border-b-4 p-4 ${contrastLight ? 'border-slate-950' : 'border-slate-700'} flex flex-col gap-2 bg-rose-500/5`}>
                        <h3 className="text-xl font-black uppercase text-rose-600">Unique Value Prop</h3>
                        <p className="text-lg font-black leading-snug mt-2">
                            Reach production-grade AI accuracy 3.9x faster than industry standard Active Learning. Save 65% on labeling budgets.
                        </p>
                    </div>
                    <div className={`col-span-1 row-span-1 border-r-4 border-b-4 p-4 ${contrastLight ? 'border-slate-950' : 'border-slate-700'} flex flex-col gap-2`}>
                        <h3 className="text-xl font-black uppercase text-emerald-600">Unfair Advantage</h3>
                        <ul className="list-disc pl-5 text-base font-bold leading-relaxed">
                            <li>Peer-reviewed algorithms (4+ publications).</li>
                            <li>Proprietary real-time UI telemetry engine.</li>
                        </ul>
                    </div>
                    <div className={`col-span-1 row-span-2 border-b-4 p-4 ${contrastLight ? 'border-slate-950' : 'border-slate-700'} flex flex-col gap-2`}>
                        <h3 className="text-xl font-black uppercase text-purple-600">Customer Segments</h3>
                        <ul className="list-disc pl-5 text-base font-bold leading-relaxed">
                            <li>Enterprise ML Engineering Teams.</li>
                            <li>Healthcare & FinTech AI Labs.</li>
                            <li>Outsourced Labeling Agencies.</li>
                        </ul>
                    </div>
                    
                    {/* Middle Row nested components */}
                    <div className={`col-span-1 row-span-1 border-r-4 border-b-4 p-4 ${contrastLight ? 'border-slate-950' : 'border-slate-700'} flex flex-col gap-2 col-start-2 row-start-2`}>
                        <h3 className="text-xl font-black uppercase text-indigo-600">Key Metrics</h3>
                        <ul className="list-disc pl-5 text-base font-bold leading-relaxed">
                            <li>Time-to-target F1 Score.</li>
                            <li>$ saved per annotation hour.</li>
                        </ul>
                    </div>
                    <div className={`col-span-1 row-span-1 border-r-4 border-b-4 p-4 ${contrastLight ? 'border-slate-950' : 'border-slate-700'} flex flex-col gap-2 col-start-4 row-start-2`}>
                        <h3 className="text-xl font-black uppercase text-emerald-600">Channels</h3>
                        <ul className="list-disc pl-5 text-base font-bold leading-relaxed">
                            <li>B2B Enterprise Direct Sales.</li>
                            <li>Open-source plugins (HuggingFace).</li>
                        </ul>
                    </div>

                    {/* Bottom Row */}
                    <div className={`col-span-2 row-span-1 border-r-4 p-6 ${contrastLight ? 'border-slate-950' : 'border-slate-700'} flex flex-col gap-2`}>
                        <h3 className="text-xl font-black uppercase text-amber-600">Cost Structure</h3>
                        <ul className="list-disc pl-5 text-base font-bold leading-relaxed">
                            <li>Cloud computing / Inference (AWS, MongoDB) = $250/mo.</li>
                            <li>R&D and engineering maintenance.</li>
                        </ul>
                    </div>
                    <div className={`col-span-3 row-span-1 p-6 flex flex-col gap-2`}>
                        <h3 className="text-xl font-black uppercase text-amber-600">Revenue Streams</h3>
                        <ul className="list-disc pl-5 text-base font-bold leading-relaxed">
                            <li><b>Pro Tier:</b> $49/mo (Small Teams).</li>
                            <li><b>Enterprise Tier:</b> $499/mo + Usage SLA & Air-gapped deployment.</li>
                            <li>Custom Consulting & Integration.</li>
                        </ul>
                    </div>
                </div>
            </div>
        )
    }
];
