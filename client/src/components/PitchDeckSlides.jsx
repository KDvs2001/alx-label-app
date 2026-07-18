import React from "react";
import {
  Sparkles,
  ShieldCheck,
  HelpCircle,
  Layers,
  Brain,
  Cpu,
  Users,
  Award,
  Check,
  Play,
  ArrowRight,
  Settings,
  Server,
  Database,
  Globe,
  BookOpen,
  FileText,
  Layout,
  MessageSquare,
  AlertTriangle,
  Zap,
  CheckCircle2,
  Navigation,
  Crosshair,
} from "lucide-react";

export const getSlides = (contrastLight, onClose) => [
  // SLIDE 1 — TITLE / HOOK
  {
    title: "AI doesn't run out of data. It runs out of time.",
    subtitle: "A smarter way to label data for AI. Built for the enterprise.",
    icon: Sparkles,
    iconColor: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    content: (
      <div className="h-full w-full flex flex-col justify-center items-center text-center gap-6 max-w-4xl mx-auto py-2 overflow-y-auto">
        <img
          src="/logo.jpg"
          alt="CAL-Log Logo"
          className="h-20 md:h-24 object-contain bg-white p-1.5 rounded-xl border-2 border-slate-900 shadow-sm animate-pulse"
        />
        <div className="space-y-4 mt-4">
          <h1
            className={`text-4xl md:text-6xl font-black tracking-tight leading-tight uppercase ${contrastLight ? "text-slate-950" : "text-white"}`}
          >
            AI doesn't run out of data.
            <br />
            <span className="bg-gradient-to-r from-rose-500 via-red-500 to-indigo-600 bg-clip-text text-transparent">
              It runs out of time.
            </span>
          </h1>
        </div>
      </div>
    ),
  },
  // SLIDE 2 — THE QUESTION
  {
    title: "The Question",
    subtitle: "",
    icon: HelpCircle,
    iconColor: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    content: (
      <div className="h-full w-full flex flex-col justify-center items-center text-center gap-6 max-w-4xl mx-auto py-2 overflow-y-auto">
        <h2
          className={`text-3xl md:text-5xl font-black uppercase tracking-tight leading-snug ${contrastLight ? "text-slate-950" : "text-white"}`}
        >
          How much of your AI project
          <br />
          is spent labeling data by hand?
        </h2>
        <div className="mt-8">
          <span className="text-3xl font-black text-rose-500 animate-pulse uppercase tracking-widest">
            Take a guess.
          </span>
        </div>
      </div>
    ),
  },
  // SLIDE 3 — THE ANSWER
  {
    title: "The Answer",
    subtitle: "The massive unseen cost of generative intelligence.",
    icon: AlertTriangle,
    iconColor: "text-rose-500 bg-rose-500/10 border-rose-500/20",
    content: (
      <div className="h-full w-full flex flex-col justify-center items-center gap-6 max-w-6xl mx-auto py-2 px-4 overflow-y-auto">
        <div className="text-center">
          <h2
            className={`text-4xl md:text-6xl font-black tracking-tight uppercase ${contrastLight ? "text-slate-950" : "text-white"}`}
          >
            <span className="text-rose-500">80%</span> of every AI project.
          </h2>
          <p
            className={`text-2xl md:text-3xl font-bold mt-2 ${contrastLight ? "text-slate-900" : "text-slate-400"}`}
          >
            Humans. One sample at a time.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-8 text-left">
          <div
            className={`p-8 rounded-3xl border-4 flex flex-col gap-4 ${contrastLight ? "bg-white border-slate-900 shadow-xl" : "bg-slate-900/60 border-slate-800"}`}
          >
            <span className="text-sm font-black text-blue-500 uppercase tracking-widest">
              SCALE
            </span>
            <h3
              className={`text-4xl md:text-5xl font-black ${contrastLight ? "text-slate-950" : "text-white"}`}
            >
              $20B
            </h3>
            <p
              className={`text-lg font-bold flex-1 ${contrastLight ? "text-slate-800" : "text-slate-300"}`}
            >
              Projected data labeling market by 2030, growing 5x from 2024.
            </p>
            <span className="text-sm text-slate-500 font-mono mt-2">
              Grand View Research
            </span>
          </div>
          <div
            className={`p-8 rounded-3xl border-4 flex flex-col gap-4 ${contrastLight ? "bg-white border-slate-900 shadow-xl" : "bg-slate-900/60 border-slate-800"}`}
          >
            <span className="text-sm font-black text-rose-500 uppercase tracking-widest">
              IMPACT
            </span>
            <h3
              className={`text-4xl md:text-5xl font-black ${contrastLight ? "text-slate-950" : "text-white"}`}
            >
              60%
            </h3>
            <p
              className={`text-lg font-bold flex-1 ${contrastLight ? "text-slate-800" : "text-slate-300"}`}
            >
              Of AI projects abandoned by 2026 due to poor data quality.
            </p>
            <span className="text-sm text-slate-500 font-mono mt-2">
              Gartner
            </span>
          </div>
          <div
            className={`p-8 rounded-3xl border-4 flex flex-col gap-4 ${contrastLight ? "bg-white border-slate-900 shadow-xl" : "bg-slate-900/60 border-slate-800"}`}
          >
            <span className="text-sm font-black text-emerald-500 uppercase tracking-widest">
              URGENCY
            </span>
            <h3
              className={`text-4xl md:text-5xl font-black ${contrastLight ? "text-slate-950" : "text-white"}`}
            >
              $14.3B
            </h3>
            <p
              className={`text-lg font-bold flex-1 ${contrastLight ? "text-slate-800" : "text-slate-300"}`}
            >
              Meta paid this for 49% of Scale AI in June 2025.
            </p>
            <span className="text-sm text-slate-500 font-mono mt-2">
              Market Deal
            </span>
          </div>
        </div>
      </div>
    ),
  },
  // SLIDE 4 — EXISTING SOLUTIONS
  {
    title: "Existing Solutions",
    subtitle: "A crowded market. Nobody solves the real problem.",
    icon: Crosshair,
    iconColor: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    content: (
      <div className="h-full w-full flex flex-col justify-center items-center gap-6 max-w-5xl mx-auto py-2 overflow-y-auto">
        <h3
          className={`text-2xl font-black uppercase ${contrastLight ? "text-slate-950" : "text-white"}`}
        >
          Everyone competes on features. CAL-Log competes on time.
        </h3>

        <div
          className={`relative w-full max-w-4xl aspect-video rounded-3xl border-4 flex items-center justify-center p-8 ${contrastLight ? "bg-white border-slate-900 shadow-2xl" : "bg-slate-900/60 border-slate-800"}`}
        >
          {/* Axes */}
          <div className="absolute left-8 right-8 top-1/2 h-1 bg-slate-300 -translate-y-1/2 rounded"></div>
          <div className="absolute top-8 bottom-8 left-1/2 w-1 bg-slate-300 -translate-x-1/2 rounded"></div>

          {/* Labels */}
          <span className="absolute top-4 left-1/2 -translate-x-1/2 font-black text-lg uppercase text-slate-400 bg-white dark:bg-slate-900 px-2">
            Cost-Aware
          </span>
          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 font-black text-lg uppercase text-slate-400 bg-white dark:bg-slate-900 px-2">
            Cost-Blind
          </span>
          <span className="absolute left-0 top-1/2 -translate-y-1/2 font-black text-lg uppercase text-slate-400 -rotate-90 bg-white dark:bg-slate-900 px-2">
            Rigid
          </span>
          <span className="absolute right-0 top-1/2 -translate-y-1/2 font-black text-lg uppercase text-slate-400 rotate-90 bg-white dark:bg-slate-900 px-2">
            Adaptive
          </span>

          {/* Competitors (Bottom/Left) */}
          <div className="absolute bottom-1/4 left-1/4 -translate-x-1/2 translate-y-1/2 bg-slate-100 border-2 border-slate-300 text-slate-700 font-black px-6 py-3 rounded-xl shadow-lg">
            Prodigy
          </div>
          <div className="absolute bottom-1/3 left-1/3 -translate-x-1/2 translate-y-1/2 bg-slate-100 border-2 border-slate-300 text-slate-700 font-black px-6 py-3 rounded-xl shadow-lg">
            Label Studio
          </div>
          <div className="absolute top-2/3 right-1/3 translate-x-1/2 translate-y-1/2 bg-slate-100 border-2 border-slate-300 text-slate-700 font-black px-6 py-3 rounded-xl shadow-lg">
            Scale AI
          </div>
          <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 bg-slate-100 border-2 border-slate-300 text-slate-700 font-black px-6 py-3 rounded-xl shadow-lg">
            Snorkel Flow
          </div>
          <div className="absolute bottom-1/4 right-1/3 translate-x-1/2 translate-y-1/2 bg-slate-100 border-2 border-slate-300 text-slate-700 font-black px-6 py-3 rounded-xl shadow-lg">
            Doccano
          </div>

          {/* CAL-Log (Top Right) */}
          <div className="absolute top-1/4 right-1/4 translate-x-1/2 -translate-y-1/2 bg-rose-500 border-4 border-rose-700 text-white font-black px-8 py-4 rounded-2xl shadow-[0_0_40px_rgba(244,63,94,0.6)] animate-pulse text-2xl">
            CAL-Log
          </div>
        </div>
      </div>
    ),
  },
  // SLIDE 5 — THE GAPS
  {
    title: "Three Gaps",
    subtitle: "Ranked by what actually costs money.",
    icon: Layers,
    iconColor: "text-rose-500 bg-rose-500/10 border-rose-500/20",
    content: (
      <div className="h-full w-full flex flex-col justify-center gap-6 max-w-7xl mx-auto py-2 px-4 overflow-y-auto">
        {[
          {
            num: "1",
            type: "PRIORITY 1 · BUSINESS",
            title: "Nobody prices per sample",
            desc: "Every tool assumes a tweet and a 500-word document cost the same. Result: teams pay for hours of trivial labels.",
            badge: "Confirmed by 19 of 31 surveyed experts",
            badgeColor: contrastLight
              ? "bg-rose-100 text-rose-900 border-rose-600 border-2"
              : "bg-rose-500/10 text-rose-500 border-rose-500/20",
          },
          {
            num: "2",
            type: "PRIORITY 2 · BUSINESS",
            title: "Nobody adapts to the annotator",
            desc: "One-size-fits-all task queues ignore that annotators have different speeds and get tired. Result: burnout and quality drops.",
            badge: "Flagged in literature (Mortagua, 2025)",
            badgeColor: contrastLight
              ? "bg-amber-100 text-amber-900 border-amber-600 border-2"
              : "bg-amber-500/10 text-amber-400 border-amber-500/20",
          },
          {
            num: "3",
            type: "PRIORITY 3 · TECHNICAL",
            title: "Nobody trusts the model early",
            desc: "Active learning tools use uncalibrated confidence from round one. Result: the model picks bad samples and the loop degrades.",
            badge: "Failure mode in 52% of AL benchmarks",
            badgeColor: contrastLight
              ? "bg-purple-100 text-purple-900 border-purple-700 border-2"
              : "bg-purple-500/10 text-purple-400 border-purple-500/20",
          },
        ].map((gap) => (
          <div
            key={gap.num}
            className={`p-6 md:p-8 rounded-3xl border-4 flex flex-col md:flex-row md:items-center gap-4 md:gap-6 ${contrastLight ? "bg-white border-slate-900 shadow-xl" : "bg-slate-900/60 border-slate-900"}`}
          >
            <div className="flex gap-4 md:gap-6 items-start text-left flex-1 min-w-0">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-black text-2xl md:text-3xl shrink-0 border-2 border-rose-600/20">
                {gap.num}
              </div>
              <div className="space-y-2 flex-1 min-w-0">
                <div
                  className={`text-sm font-black uppercase tracking-widest ${contrastLight ? "text-slate-800" : "text-slate-500"}`}
                >
                  {gap.type}
                </div>
                <h4
                  className={`font-black text-xl md:text-2xl ${contrastLight ? "text-slate-950" : "text-white"}`}
                >
                  {gap.title}
                </h4>
                <p
                  className={`text-base md:text-lg font-bold ${contrastLight ? "text-slate-900" : "text-slate-400"}`}
                >
                  {gap.desc}
                </p>
              </div>
            </div>
            <span
              className={`text-sm font-black px-4 py-3 rounded-xl shrink-0 md:max-w-[220px] text-center ${gap.badgeColor}`}
            >
              {gap.badge}
            </span>
          </div>
        ))}
      </div>
    ),
  },
  // SLIDE 6 — OUR SOLUTION
  {
    title: "Our Solution",
    subtitle: "CAL-Log fills all three gaps with one idea.",
    icon: Navigation,
    iconColor: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    content: (
      <div className="h-full w-full flex flex-col justify-center items-center gap-8 max-w-7xl mx-auto py-2 px-4 overflow-y-auto">
        <div
          className={`w-full p-10 rounded-3xl border-4 text-center ${contrastLight ? "bg-blue-50 border-blue-900 shadow-xl" : "bg-blue-900/20 border-blue-800"}`}
        >
          <h2
            className={`text-4xl md:text-5xl font-black uppercase ${contrastLight ? "text-blue-950" : "text-blue-100"}`}
          >
            Think of it as <span className="text-blue-600">Waze</span> for data
            labeling.
          </h2>
          <p
            className={`text-2xl font-bold mt-4 ${contrastLight ? "text-blue-900" : "text-blue-300"}`}
          >
            It routes your team around the slow, the redundant, and the
            uncertain.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full text-left">
          <div
            className={`p-8 rounded-3xl border-4 flex flex-col gap-4 ${contrastLight ? "bg-white border-slate-900 shadow-xl" : "bg-slate-900/60 border-slate-800"}`}
          >
            <div className="w-20 h-20 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-600 mb-4">
              <Brain size={40} />
            </div>
            <h3
              className={`text-3xl font-black uppercase ${contrastLight ? "text-slate-950" : "text-white"}`}
            >
              Innovation
            </h3>
            <p
              className={`text-lg font-bold leading-relaxed ${contrastLight ? "text-slate-800" : "text-slate-300"}`}
            >
              A new kind of active learning. First framework to combine
              cost-aware selection, live annotator adaptation, and calibrated
              confidence in one loop.
            </p>
          </div>
          <div
            className={`p-8 rounded-3xl border-4 flex flex-col gap-4 ${contrastLight ? "bg-white border-slate-900 shadow-xl" : "bg-slate-900/60 border-slate-800"}`}
          >
            <div className="w-20 h-20 rounded-2xl bg-rose-500/20 flex items-center justify-center text-rose-600 mb-4">
              <Server size={40} />
            </div>
            <h3
              className={`text-3xl font-black uppercase ${contrastLight ? "text-slate-950" : "text-white"}`}
            >
              Application
            </h3>
            <p
              className={`text-lg font-bold leading-relaxed ${contrastLight ? "text-slate-800" : "text-slate-300"}`}
            >
              Production-grade engineering. RoBERTa + SBERT + Node/React +
              MongoDB. Distributed microservices. Not a research script. A
              running product.
            </p>
          </div>
          <div
            className={`p-8 rounded-3xl border-4 flex flex-col gap-4 ${contrastLight ? "bg-white border-slate-900 shadow-xl" : "bg-slate-900/60 border-slate-800"}`}
          >
            <div className="w-20 h-20 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-600 mb-4">
              <Settings size={40} />
            </div>
            <h3
              className={`text-3xl font-black uppercase ${contrastLight ? "text-slate-950" : "text-white"}`}
            >
              Compatibility
            </h3>
            <p
              className={`text-lg font-bold leading-relaxed ${contrastLight ? "text-slate-800" : "text-slate-300"}`}
            >
              Plugs into any pipeline. Standard REST API. JSON in, JSON out. Any
              annotation team, any domain, any deployment.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  // SLIDE 7 — SYSTEM ARCHITECTURE & CORE MATHEMATICAL ENGINE
  {
    title: "Microservice Architecture",
    subtitle: "A massive multi-tier engine working in real-time.",
    icon: Brain,
    iconColor: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    content: (
      <div className="h-full flex flex-col justify-center gap-4 w-full max-w-7xl mx-auto px-6 py-2 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center h-full">
          <div className="lg:col-span-6 flex justify-center items-center w-full h-full">
            <div
              className={`relative w-full rounded-2xl p-2 overflow-hidden shadow-lg border-4 ${contrastLight ? "bg-white border-slate-900 shadow-xl" : "bg-slate-900/60 border-slate-900"}`}
            >
              {/* Scaled down to ensure no vertical scrolling */}
              <img
                src="/system_architecture.png"
                alt="Live Microservices System Architecture Diagram"
                className="w-full max-h-[50vh] object-contain rounded-lg"
              />
            </div>
          </div>
          <div className="lg:col-span-6 space-y-4 text-left flex flex-col justify-center">
            <h2
              className={`text-2xl font-black uppercase ${contrastLight ? "text-slate-950" : "text-white"}`}
            >
              Real-Time Cost-Aware Selection Engine
            </h2>
            {/* Shrunk padding and text size to fit screen comfortably */}
            <div
              className={`p-4 rounded-xl border-4 font-mono text-sm leading-relaxed shadow-lg ${contrastLight ? "bg-slate-900 border-slate-950 text-emerald-500 font-black" : "bg-slate-950 border-slate-800 text-emerald-400"}`}
            >
              <div className="text-slate-500 mb-1">
                // Utility = Information Density / Expected Time Cost
              </div>
              <span className="text-purple-400">def</span>{" "}
              <span className="text-blue-400">calc_utility</span>(uncertainty,
              speed_residual):
              <br />
              <br />
              &nbsp;&nbsp;
              <span className="text-slate-500">
                # OLS residual flags cognitive fatigue
              </span>
              <br />
              &nbsp;&nbsp;<span className="text-purple-400">if</span>{" "}
              speed_residual &gt;={" "}
              <span className="text-amber-500 font-black">1.5</span> * baseline:
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;
              <span className="text-purple-400">return</span>{" "}
              route_low_complexity_samples()
              <br />
              <br />
              &nbsp;&nbsp;
              <span className="text-slate-500">
                # Cost: alpha + beta * log(length)
              </span>
              <br />
              &nbsp;&nbsp;expected_seconds = alpha + beta * log(length)
              <br />
              &nbsp;&nbsp;<span className="text-purple-400">return</span>{" "}
              argmax(uncertainty / expected_seconds)
              <br />
            </div>
            <div className="space-y-3 text-base text-slate-500 leading-snug font-bold">
              <div className="flex gap-3 items-center">
                <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 shrink-0">
                  <Server size={20} />
                </div>
                <span
                  className={`${contrastLight ? "text-slate-900 font-black" : "text-slate-200"}`}
                >
                  React UI collects keystroke & scroll dynamics.
                </span>
              </div>
              <div className="flex gap-3 items-center">
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
                  <Database size={20} />
                </div>
                <span
                  className={`${contrastLight ? "text-slate-900 font-black" : "text-slate-200"}`}
                >
                  MongoDB handles distributed asynchronous queues.
                </span>
              </div>
              <div className="flex gap-3 items-center">
                <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 shrink-0">
                  <Settings size={20} />
                </div>
                <span
                  className={`${contrastLight ? "text-slate-900 font-black" : "text-slate-200"}`}
                >
                  Python Flask calculates multi-model consensus.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  // SLIDE 8 — TECHNOLOGICAL INNOVATION (DATA DRIVEN FOR NBQSA GOLD)
  {
    title: "Technological Innovation",
    subtitle: "Core Academic Novelty & Production Engineering Standards",
    icon: Cpu,
    iconColor: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    content: (
      <div className="h-full w-full flex flex-col justify-center items-center gap-4 px-6 py-2 max-w-7xl mx-auto overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-stretch">
          {/* Left Pane: Two Core Scientific Novelties (HCI-ML Loop Fusion & ECE Self-Tuning Pruning) */}
          <div
            className={`lg:col-span-8 p-5 rounded-3xl border-4 flex flex-col justify-between ${contrastLight ? "bg-white border-slate-900 shadow-xl" : "bg-slate-900/60 border-slate-800"} relative overflow-hidden`}
          >
            {/* Ambient glow decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-3">
                <span className="text-[12px] font-black uppercase tracking-widest text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                  Double Academic Novelty
                </span>
                <h3
                  className={`text-xl font-black uppercase ${contrastLight ? "text-slate-950" : "text-white"}`}
                >
                  Scientific Innovations
                </h3>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch h-full">
              {/* Novelty 1: HCI-ML Cognitive Loop */}
              <div
                className={`p-4 rounded-2xl border flex flex-col justify-between gap-4 ${contrastLight ? "bg-slate-50 border-slate-200" : "bg-slate-950/30 border-slate-900/60"}`}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-purple-500">
                    <Brain size={18} />
                    <h4
                      className={`text-xs font-black uppercase ${contrastLight ? "text-slate-950" : "text-white"}`}
                    >
                      1. HCI-ML Cognitive Loop
                    </h4>
                  </div>
                  <p
                    className={`text-[12px] font-bold leading-normal ${contrastLight ? "text-slate-700" : "text-slate-400"}`}
                  >
                    Fuses{" "}
                    <span className="text-purple-500 font-bold">
                      HCI (Human-Computer Interaction)
                    </span>{" "}
                    telemetry with active learning.
                  </p>

                  {/* Tech details */}
                  <div className="space-y-1 mt-2 text-[11px] font-semibold text-slate-500 border-l border-purple-500/30 pl-2">
                    <div>
                      •{" "}
                      <span className="font-bold text-slate-400 uppercase">
                        Tech Mechanism:
                      </span>{" "}
                      Fits OLS (Ordinary Least Squares) regression on keystroke
                      and scroll latency. Tethers beta ($\beta$) complexity
                      dynamically based on speed residuals.
                    </div>
                  </div>
                </div>

                {/* Plain English Analogy */}
                <div
                  className={`p-2.5 rounded-xl border text-[12px] font-semibold leading-relaxed ${contrastLight ? "bg-purple-50/50 border-purple-200 text-purple-950" : "bg-purple-500/5 border-purple-500/20 text-purple-300"}`}
                >
                  <span className="font-black uppercase tracking-wider block text-[11px] text-purple-400 mb-0.5">
                    💡 In Plain English
                  </span>
                  Like a smart treadmill that automatically slows down when it
                  senses your heart rate rising, ensuring you don't burn out or
                  make sloppy errors.
                </div>
              </div>

              {/* Novelty 2: ECE Self-Tuning Pruning */}
              <div
                className={`p-4 rounded-2xl border flex flex-col justify-between gap-4 ${contrastLight ? "bg-slate-50 border-slate-200" : "bg-slate-950/30 border-slate-900/60"}`}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-indigo-500">
                    <Cpu size={18} />
                    <h4
                      className={`text-xs font-black uppercase ${contrastLight ? "text-slate-950" : "text-white"}`}
                    >
                      2. Self-Tuning Active Pruning
                    </h4>
                  </div>
                  <p
                    className={`text-[12px] font-bold leading-normal ${contrastLight ? "text-slate-700" : "text-slate-400"}`}
                  >
                    Thresholds dynamically auto-tune based on accuracy and{" "}
                    <span className="text-indigo-500 font-bold">
                      ECE (Expected Calibration Error)
                    </span>
                    .
                  </p>

                  {/* Tech details */}
                  <div className="space-y-1 mt-2 text-[11px] font-semibold text-slate-500 border-l border-indigo-500/30 pl-2">
                    <div>
                      •{" "}
                      <span className="font-bold text-slate-400 uppercase">
                        Tech Mechanism:
                      </span>{" "}
                      Tracks model certainty shifts, scaling confidence
                      boundaries ($85\% \rightarrow 98\%$) to prevent
                      overconfident pool pollution.
                    </div>
                  </div>
                </div>

                {/* Plain English Analogy */}
                <div
                  className={`p-2.5 rounded-xl border text-[12px] font-semibold leading-relaxed ${contrastLight ? "bg-indigo-50/50 border-indigo-200 text-indigo-950" : "bg-indigo-500/5 border-indigo-500/20 text-indigo-300"}`}
                >
                  <span className="font-black uppercase tracking-wider block text-[11px] text-indigo-400 mb-0.5">
                    💡 In Plain English
                  </span>
                  Like an automated factory inspector that does the easy work
                  itself, but immediately stops and calls in human experts if it
                  feels uncertain.
                </div>
              </div>
            </div>
          </div>

          {/* Right Pane: Supporting Enterprise Engineering & Security Standards */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-4">
            <div
              className={`p-4 rounded-2xl border-4 flex flex-col gap-1.5 ${contrastLight ? "bg-white border-slate-900 shadow-sm" : "bg-slate-900/60 border-slate-800"}`}
            >
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-500">
                  <Layers size={16} />
                </div>
                <h4
                  className={`text-xs font-black uppercase ${contrastLight ? "text-slate-950" : "text-white"}`}
                >
                  Semantic Deduplication
                </h4>
              </div>
              <p
                className={`text-[12px] font-bold leading-relaxed ${contrastLight ? "text-slate-700" : "text-slate-400"}`}
              >
                Uses <span className="text-blue-600 font-bold">SBERT</span> (
                <span className="italic text-[11px] text-slate-600 font-semibold">
                  Sentence-BERT
                </span>
                ) to prune redundant texts. Stateless architecture scales to
                10k+ concurrent users.
              </p>
            </div>

            <div
              className={`p-4 rounded-2xl border-4 flex flex-col gap-1.5 ${contrastLight ? "bg-white border-slate-900 shadow-sm" : "bg-slate-900/60 border-slate-800"}`}
            >
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-500">
                  <Globe size={16} />
                </div>
                <h4
                  className={`text-xs font-black uppercase ${contrastLight ? "text-slate-950" : "text-white"}`}
                >
                  Transparent Usability
                </h4>
              </div>
              <p
                className={`text-[12px] font-bold leading-relaxed ${contrastLight ? "text-slate-700" : "text-slate-400"}`}
              >
                Adheres to{" "}
                <span className="text-emerald-600 font-bold">WCAG</span> (
                <span className="italic text-[11px] text-slate-600 font-semibold">
                  Web Content Accessibility Guidelines
                </span>
                ) & <span className="text-emerald-600 font-bold">ARIA</span> (
                <span className="italic text-[11px] text-slate-600 font-semibold">
                  Accessible Rich Internet Applications
                </span>
                ) usability standards to simplify model parameters.
              </p>
            </div>

            <div
              className={`p-4 rounded-2xl border-4 flex flex-col gap-1.5 ${contrastLight ? "bg-white border-slate-900 shadow-sm" : "bg-slate-900/60 border-slate-800"}`}
            >
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-500">
                  <ShieldCheck size={16} />
                </div>
                <h4
                  className={`text-xs font-black uppercase ${contrastLight ? "text-slate-950" : "text-white"}`}
                >
                  Air-Gapped Compliance
                </h4>
              </div>
              <p
                className={`text-[12px] font-bold leading-relaxed ${contrastLight ? "text-slate-700" : "text-slate-400"}`}
              >
                Deployable inside private{" "}
                <span className="text-rose-500 font-bold">VPCs</span> (
                <span className="italic text-[11px] text-slate-500 font-semibold">
                  Virtual Private Clouds
                </span>
                ) for zero <span className="text-rose-500 font-bold">PII</span>{" "}
                (
                <span className="italic text-[11px] text-slate-500 font-semibold">
                  Personally Identifiable Information
                </span>
                ) risk with calibrated confidence scores.
              </p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  // SLIDE 9 — VALIDATED PERFORMANCE (MASSIVE GRAPH)
  {
    title: "Validated Performance",
    subtitle: "Reaching target accuracy 3.9x faster.",
    icon: Zap,
    iconColor: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    content: (
      <div className="h-full flex flex-col justify-center gap-8 w-full max-w-7xl mx-auto px-6 py-4 overflow-y-auto">
        <div className="flex flex-col gap-6 w-full text-center">
          <h3
            className={`text-4xl md:text-5xl font-black uppercase ${contrastLight ? "text-slate-950" : "text-white"}`}
          >
            Time to Reach F1 = 0.80
          </h3>
          <p
            className={`text-2xl font-bold ${contrastLight ? "text-slate-700" : "text-slate-300"}`}
          >
            Averaged across 10 distinct NLP datasets
          </p>

          <div
            className={`p-10 rounded-3xl border-4 space-y-8 mt-4 ${contrastLight ? "bg-white border-slate-900 shadow-2xl" : "bg-slate-900/40 border-slate-900"}`}
          >
            {[
              {
                name: "Entropy",
                time: 148.5,
                ciStart: 5,
                ciEnd: 303,
                color: "bg-green-500/80",
              },
              {
                name: "BADGE",
                time: 126.5,
                ciStart: 21,
                ciEnd: 242,
                color: "bg-blue-500/80",
              },
              {
                name: "Margin",
                time: 121.0,
                ciStart: 5,
                ciEnd: 238,
                color: "bg-amber-600/85",
              },
              {
                name: "Random",
                time: 93.7,
                ciStart: 38,
                ciEnd: 150,
                color: "bg-slate-600/80",
              },
              {
                name: "CAL-Log (Ours)",
                time: 38.3,
                ciStart: 15,
                ciEnd: 62,
                color: "bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.6)]",
                isHighlight: true,
              },
            ].map((item, idx) => {
              const maxVal = 310;
              const barWidth = (item.time / maxVal) * 100;
              const ciLeft = (item.ciStart / maxVal) * 100;
              const ciWidth = ((item.ciEnd - item.ciStart) / maxVal) * 100;

              return (
                <div key={idx} className="grid grid-cols-12 gap-8 items-center">
                  <div
                    className={`col-span-3 text-right text-2xl font-black uppercase ${item.isHighlight ? "text-rose-500" : contrastLight ? "text-slate-950" : "text-slate-300"}`}
                  >
                    {item.name}
                  </div>
                  <div
                    className={`col-span-7 relative h-12 flex items-center rounded-xl border-2 overflow-visible ${contrastLight ? "bg-slate-100 border-slate-900" : "bg-slate-950/40 border-slate-900"}`}
                  >
                    <div
                      className={`absolute h-1 flex items-center justify-between ${contrastLight ? "bg-slate-950" : "bg-slate-700"}`}
                      style={{ left: `${ciLeft}%`, width: `${ciWidth}%` }}
                    >
                      <div
                        className={`w-1 h-6 shrink-0 ${contrastLight ? "bg-slate-950" : "bg-slate-700"}`}
                      />
                      <div
                        className={`w-1 h-6 shrink-0 ${contrastLight ? "bg-slate-950" : "bg-slate-700"}`}
                      />
                    </div>
                    <div
                      className={`absolute h-10 rounded-lg transition-all duration-1000 ${item.color} ${item.isHighlight ? "border-4 border-white" : ""} ${contrastLight ? "border-2 border-slate-950" : ""}`}
                      style={{ width: `${barWidth}%`, left: "0%" }}
                    />
                  </div>
                  <div
                    className={`col-span-2 text-3xl font-mono font-black ${item.isHighlight ? "text-rose-700" : contrastLight ? "text-slate-950" : "text-slate-400"}`}
                  >
                    {item.time.toFixed(1)} min
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    ),
  },
  // SLIDE 10 — TESTED. VALIDATED. STANDARDS-READY. (TABLE + STANDARDS)
  {
    title: "Tested. Validated. Standards-Ready.",
    subtitle: "Does it actually work? Six of six ticks.",
    icon: ShieldCheck,
    iconColor: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    content: (
      <div className="h-full flex flex-col justify-center gap-6 w-full max-w-7xl mx-auto px-4 py-2 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full items-stretch">
          {/* Left: Table */}
          <div
            className={`p-8 rounded-3xl border-4 flex flex-col ${contrastLight ? "bg-white border-slate-900 shadow-xl" : "bg-slate-900/60 border-slate-800"}`}
          >
            <table className="w-full text-left border-collapse text-base flex-1">
              <thead>
                <tr
                  className={`border-b-4 ${contrastLight ? "border-slate-900" : "border-slate-700"}`}
                >
                  <th
                    className={`py-4 font-black text-xl ${contrastLight ? "text-slate-950" : "text-slate-200"}`}
                  >
                    Features
                  </th>
                  <th className="py-4 font-black text-rose-600 text-center text-xl">
                    CAL-Log
                  </th>
                  <th
                    className={`py-4 font-black text-center text-xl ${contrastLight ? "text-slate-500" : "text-slate-500"}`}
                  >
                    Prodigy
                  </th>
                  <th
                    className={`py-4 font-black text-center text-xl ${contrastLight ? "text-slate-500" : "text-slate-500"}`}
                  >
                    Scale AI
                  </th>
                  <th
                    className={`py-4 font-black text-center text-xl ${contrastLight ? "text-slate-500" : "text-slate-500"}`}
                  >
                    Snorkel
                  </th>
                </tr>
              </thead>
              <tbody
                className={`divide-y-2 ${contrastLight ? "divide-slate-200" : "divide-slate-800/40"}`}
              >
                {[
                  ["Active Learning", true, true, true, false],
                  ["Cost-Aware Selection", true, false, true, false],
                  ["Adaptive to Annotator Speed", true, false, false, false],
                  ["Real-Time Fatigue Detection", true, false, false, false],
                  ["Semantic Deduplication", true, false, false, true],
                  ["Calibrated Confidence", true, false, false, false],
                  ["Transparent 'Why' Explanation", true, false, false, false],
                ].map((row, idx) => (
                  <tr key={idx}>
                    <td
                      className={`py-4 font-bold text-lg ${contrastLight ? "text-slate-950 font-black" : "text-slate-300"}`}
                    >
                      {row[0]}
                    </td>
                    <td className="py-4 text-center font-black text-rose-600 text-2xl">
                      {row[1] ? "✓" : "—"}
                    </td>
                    <td
                      className={`py-4 text-center text-2xl ${contrastLight ? "text-slate-400 font-bold" : "text-slate-600"}`}
                    >
                      {row[2] ? "✓" : "—"}
                    </td>
                    <td
                      className={`py-4 text-center text-2xl ${contrastLight ? "text-slate-400 font-bold" : "text-slate-600"}`}
                    >
                      {row[3] ? "✓" : "—"}
                    </td>
                    <td
                      className={`py-4 text-center text-2xl ${contrastLight ? "text-slate-400 font-bold" : "text-slate-600"}`}
                    >
                      {row[4] ? "✓" : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Right: Standards */}
          <div
            className={`p-10 rounded-3xl border-4 flex flex-col justify-center ${contrastLight ? "bg-white border-slate-900 shadow-xl" : "bg-slate-900/60 border-slate-800"}`}
          >
            <span className="text-xl font-black text-emerald-600 uppercase tracking-widest text-center mb-8">
              STANDARDS COMPLIANT
            </span>
            <div className="space-y-6 text-2xl font-bold">
              <div className="flex items-center gap-4">
                <CheckCircle2 size={32} className="text-emerald-500 shrink-0" />{" "}
                <span
                  className={`${contrastLight ? "text-slate-900" : "text-slate-200"}`}
                >
                  UK GDPR · 0 trackers, 0 PII
                </span>
              </div>
              <div className="flex items-center gap-4">
                <CheckCircle2 size={32} className="text-emerald-500 shrink-0" />{" "}
                <span
                  className={`${contrastLight ? "text-slate-900" : "text-slate-200"}`}
                >
                  BCS Code of Conduct
                </span>
              </div>
              <div className="flex items-center gap-4">
                <CheckCircle2 size={32} className="text-emerald-500 shrink-0" />{" "}
                <span
                  className={`${contrastLight ? "text-slate-900" : "text-slate-200"}`}
                >
                  OWASP · 0 critical vulnerabilities
                </span>
              </div>
              <div className="flex items-center gap-4">
                <CheckCircle2 size={32} className="text-emerald-500 shrink-0" />{" "}
                <span
                  className={`${contrastLight ? "text-slate-900" : "text-slate-200"}`}
                >
                  WCAG · accessible by design
                </span>
              </div>
              <div className="flex items-center gap-4">
                <CheckCircle2 size={32} className="text-emerald-500 shrink-0" />{" "}
                <span
                  className={`${contrastLight ? "text-slate-900" : "text-slate-200"}`}
                >
                  Nielsen Heuristics · 8 of 10 clean
                </span>
              </div>
              <div className="flex items-center gap-4">
                <CheckCircle2 size={32} className="text-emerald-500 shrink-0" />{" "}
                <span
                  className={`${contrastLight ? "text-slate-900" : "text-slate-200"}`}
                >
                  99%+ uptime · verified by UptimeRobot
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  // SLIDE 11 — BUSINESS IMPACT & BUSINESS MODEL CANVAS
  {
    title: "Business Impact",
    subtitle: "The Business Model Canvas",
    icon: Layout,
    iconColor: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    content: (
      <div className="h-full w-full flex flex-col pt-1 px-4 pb-2 overflow-y-auto">
        {/* 
                  Merged Lean Canvas & Business Impact. 
                  Font sizes and padding reduced so it fits entirely on screen without scrolling.
                */}
        <div
          className={`flex-1 grid grid-cols-5 grid-rows-3 border-4 ${contrastLight ? "border-slate-950 bg-white text-slate-900" : "border-slate-700 bg-slate-900 text-slate-200"} shadow-2xl`}
        >
          {/* Top Row */}
          <div
            className={`col-span-1 row-span-2 border-r-4 border-b-4 p-4 ${contrastLight ? "border-slate-950" : "border-slate-700"} flex flex-col gap-2`}
          >
            <h3 className="text-lg font-black uppercase text-rose-600">
              Problem
            </h3>
            <ul className="list-disc pl-5 text-sm font-bold leading-relaxed space-y-1">
              <li>Manual annotation consumes 80% of AI budgets.</li>
              <li>Annotator fatigue causes widespread label errors.</li>
              <li>Random sampling wastes time on trivial documents.</li>
            </ul>
          </div>
          <div
            className={`col-span-1 row-span-1 border-r-4 border-b-4 p-4 ${contrastLight ? "border-slate-950" : "border-slate-700"} flex flex-col gap-2`}
          >
            <h3 className="text-lg font-black uppercase text-indigo-600">
              Solution
            </h3>
            <ul className="list-disc pl-5 text-sm font-bold leading-relaxed space-y-1">
              <li>Real-time cost-aware sampling logic.</li>
              <li>OLS behavioral fatigue tracking.</li>
              <li>Multi-model SLM consensus validation.</li>
            </ul>
          </div>
          <div
            className={`col-span-1 row-span-2 border-r-4 border-b-4 p-4 ${contrastLight ? "border-slate-950" : "border-slate-700"} flex flex-col gap-2 bg-rose-500/5`}
          >
            <h3 className="text-lg font-black uppercase text-rose-600">
              Unique Value Prop
            </h3>
            <p className="text-sm font-black leading-snug mt-2">
              Reach production-grade AI accuracy 3.9x faster than industry
              standard Active Learning. Save 65% on labeling budgets.
            </p>
            <div className="mt-auto bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 p-2 rounded-lg border-2 border-emerald-200 dark:border-emerald-800 text-xs font-black">
              "Every project saves $600 / mo vs current tools"
            </div>
          </div>
          <div
            className={`col-span-1 row-span-1 border-r-4 border-b-4 p-4 ${contrastLight ? "border-slate-950" : "border-slate-700"} flex flex-col gap-2`}
          >
            <h3 className="text-lg font-black uppercase text-emerald-600">
              Unfair Advantage
            </h3>
            <ul className="list-disc pl-5 text-sm font-bold leading-relaxed space-y-1">
              <li>Peer-reviewed algorithms (4+ publications).</li>
              <li>Proprietary real-time UI telemetry engine.</li>
            </ul>
          </div>
          <div
            className={`col-span-1 row-span-2 border-b-4 p-4 ${contrastLight ? "border-slate-950" : "border-slate-700"} flex flex-col gap-2`}
          >
            <h3 className="text-lg font-black uppercase text-purple-600">
              Customer Segments
            </h3>
            <span className="text-xs font-black uppercase bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-2 py-1 rounded inline-block w-fit mb-1">
              Who it's for:
            </span>
            <ul className="list-disc pl-5 text-sm font-bold leading-relaxed space-y-2">
              <li>
                <b>ML Engineering Teams</b> (fintech, legaltech, healthtech)
              </li>
              <li>
                <b>University NLP Labs</b> (budget pressure)
              </li>
              <li>
                <b>Data Labeling Agencies</b> (billing hourly, needing
                throughput edge)
              </li>
            </ul>
          </div>

          {/* Middle Row nested components */}
          <div
            className={`col-span-1 row-span-1 border-r-4 border-b-4 p-4 ${contrastLight ? "border-slate-950" : "border-slate-700"} flex flex-col gap-2 col-start-2 row-start-2`}
          >
            <h3 className="text-lg font-black uppercase text-indigo-600">
              Key Metrics
            </h3>
            <ul className="list-disc pl-5 text-sm font-bold leading-relaxed space-y-1">
              <li>Time-to-target F1 Score.</li>
              <li>$ saved per annotation hour.</li>
            </ul>
          </div>
          <div
            className={`col-span-1 row-span-1 border-r-4 border-b-4 p-4 ${contrastLight ? "border-slate-950" : "border-slate-700"} flex flex-col gap-2 col-start-4 row-start-2`}
          >
            <h3 className="text-lg font-black uppercase text-emerald-600">
              Channels
            </h3>
            <ul className="list-disc pl-5 text-sm font-bold leading-relaxed space-y-1">
              <li>B2B Enterprise Direct Sales.</li>
              <li>Open-source plugins (HuggingFace).</li>
            </ul>
          </div>

          {/* Bottom Row */}
          <div
            className={`col-span-2 row-span-1 border-r-4 p-4 ${contrastLight ? "border-slate-950" : "border-slate-700"} flex flex-col gap-2`}
          >
            <h3 className="text-lg font-black uppercase text-amber-600">
              Cost Structure
            </h3>
            <ul className="list-disc pl-5 text-sm font-bold leading-relaxed space-y-1">
              <li>
                Cloud computing / Inference (AWS, MongoDB) = $200–300 / mo.
              </li>
              <li>R&D and engineering maintenance.</li>
            </ul>
          </div>
          <div className={`col-span-3 row-span-1 p-4 flex flex-col gap-2`}>
            <h3 className="text-lg font-black uppercase text-amber-600">
              Revenue Streams
            </h3>
            <ul className="list-disc pl-5 text-sm font-bold leading-relaxed space-y-1">
              <li>
                <b>Free:</b> solo researchers, small pilots.
              </li>
              <li>
                <b>Pro Tier ($49/mo):</b> small teams up to 5 annotators.
              </li>
              <li>
                <b>Enterprise Tier ($499/mo):</b> On-prem release, Usage SLA &
                Air-gapped deployment.
              </li>
            </ul>
          </div>
        </div>
      </div>
    ),
  },
  // SLIDE 12 — VALIDATED BY EXPERTS
  {
    title: "Validated by Experts",
    subtitle: "31 experts reviewed it. Their feedback shaped what shipped.",
    icon: Users,
    iconColor: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    content: (
      <div className="h-full w-full flex flex-col justify-center gap-6 max-w-7xl mx-auto py-2 px-4 overflow-y-auto">
        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-4">
          <div className="px-6 py-3 rounded-full border-4 border-slate-300 bg-slate-100 text-slate-800 font-black text-lg md:text-xl">
            42 Experts Contacted
          </div>
          <div className="px-6 py-3 rounded-full border-4 border-rose-500 bg-rose-500 text-white font-black text-lg md:text-xl shadow-lg shadow-rose-500/30">
            31 Usable Responses
          </div>
          <div className="px-6 py-3 rounded-full border-4 border-slate-300 bg-slate-100 text-slate-800 font-black text-lg md:text-xl">
            19 AL/NLP Researchers
          </div>
          <div className="px-6 py-3 rounded-full border-4 border-slate-300 bg-slate-100 text-slate-800 font-black text-lg md:text-xl">
            12 ML Engineers
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch mt-4">
          {/* Quotes */}
          <div
            className={`p-8 rounded-3xl border-4 flex flex-col gap-6 ${contrastLight ? "bg-white border-slate-900 shadow-xl" : "bg-slate-900/60 border-slate-800"}`}
          >
            <span className="text-sm font-black text-indigo-500 uppercase tracking-widest">
              WHAT THEY SAID
            </span>

            <div className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-800/50">
              <p className="text-lg font-bold italic">
                "Strong practical and commercial value. The balance between
                utility and annotation time is effective."
              </p>
              <span className="block mt-3 text-base font-black text-rose-500">
                — Evaluator 19 · ML Engineer
              </span>
            </div>
            <div className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-800/50">
              <p className="text-lg font-bold italic">
                "75.6% improvement over baselines, with a clear peak at 60
                minutes of annotation."
              </p>
              <span className="block mt-3 text-base font-black text-rose-500">
                — Evaluator 13 · AL Researcher
              </span>
            </div>
            <div className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-800/50">
              <p className="text-lg font-bold italic">
                "Cost angle is an important but largely neglected dimension in
                current active learning."
              </p>
              <span className="block mt-3 text-base font-black text-rose-500">
                — Evaluator 2 · Domain Expert
              </span>
            </div>
          </div>

          {/* Feedback to changes */}
          <div
            className={`p-8 rounded-3xl border-4 flex flex-col gap-6 ${contrastLight ? "bg-white border-slate-900 shadow-xl" : "bg-slate-900/60 border-slate-800"}`}
          >
            <span className="text-sm font-black text-emerald-500 uppercase tracking-widest">
              FEEDBACK → WHAT CHANGED
            </span>
            <div className="space-y-6 text-lg font-bold flex-1">
              <div className="flex items-center justify-between border-b-2 border-slate-200 dark:border-slate-700 pb-4">
                <span
                  className={
                    contrastLight ? "text-slate-700" : "text-slate-400"
                  }
                >
                  "Spy Window" term unclear
                </span>
                <ArrowRight className="text-slate-400 mx-2 shrink-0" />
                <span
                  className={
                    contrastLight
                      ? "text-slate-950 font-black"
                      : "text-white font-black"
                  }
                >
                  Added parameter explainer modal
                </span>
              </div>
              <div className="flex items-center justify-between border-b-2 border-slate-200 dark:border-slate-700 pb-4">
                <span
                  className={
                    contrastLight ? "text-slate-700" : "text-slate-400"
                  }
                >
                  Alpha / Beta hidden
                </span>
                <ArrowRight className="text-slate-400 mx-2 shrink-0" />
                <span
                  className={
                    contrastLight
                      ? "text-slate-950 font-black"
                      : "text-white font-black"
                  }
                >
                  Info icon + inline explainer
                </span>
              </div>
              <div className="flex items-center justify-between border-b-2 border-slate-200 dark:border-slate-700 pb-4">
                <span
                  className={
                    contrastLight ? "text-slate-700" : "text-slate-400"
                  }
                >
                  Slow initial load
                </span>
                <ArrowRight className="text-slate-400 mx-2 shrink-0" />
                <span
                  className={
                    contrastLight
                      ? "text-slate-950 font-black"
                      : "text-white font-black"
                  }
                >
                  React lazy-loading + code-splitting
                </span>
              </div>
              <div className="flex items-center justify-between border-b-2 border-slate-200 dark:border-slate-700 pb-4">
                <span
                  className={
                    contrastLight ? "text-slate-700" : "text-slate-400"
                  }
                >
                  Accessibility gaps
                </span>
                <ArrowRight className="text-slate-400 mx-2 shrink-0" />
                <span
                  className={
                    contrastLight
                      ? "text-slate-950 font-black"
                      : "text-white font-black"
                  }
                >
                  WCAG heading + ARIA restructure
                </span>
              </div>
              <div className="flex items-center justify-between border-b-2 border-slate-200 dark:border-slate-700 pb-4">
                <span
                  className={
                    contrastLight ? "text-slate-700" : "text-slate-400"
                  }
                >
                  Notification spam
                </span>
                <ArrowRight className="text-slate-400 mx-2 shrink-0" />
                <span
                  className={
                    contrastLight
                      ? "text-slate-950 font-black"
                      : "text-white font-black"
                  }
                >
                  Throttled to session milestones
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  // SLIDE 13 — WHERE WE ARE
  {
    title: "Where We Are",
    subtitle: "Peer-reviewed. Deployed. Growing.",
    icon: Award,
    iconColor: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    content: (
      <div className="h-full flex flex-col justify-center gap-8 w-full max-w-7xl mx-auto py-2 px-4 overflow-y-auto">
        {/* Papers Section */}
        <div
          className={`p-8 rounded-3xl border-4 ${contrastLight ? "bg-white border-slate-900 shadow-xl" : "bg-slate-900/60 border-slate-800"}`}
        >
          <h3
            className={`text-2xl font-black uppercase mb-6 ${contrastLight ? "text-slate-950" : "text-white"}`}
          >
            TECHNICAL VALIDATION (PUBLISHED IN)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xl font-bold">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 bg-rose-100 text-rose-600 rounded-xl border-2 border-rose-300 flex items-center justify-center font-black shrink-0">
                <BookOpen size={24} />
              </div>
              <span>
                <b className="text-rose-500">ACL 2026:</b> Accepted, presented,
                and published (A* NLP)
              </span>
            </div>
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-xl border-2 border-blue-300 flex items-center justify-center font-black shrink-0">
                <FileText size={24} />
              </div>
              <span>
                <b className="text-blue-500">IEEE CSNT 2026:</b> Accepted
              </span>
            </div>
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 bg-emerald-100 text-emerald-600 rounded-xl border-2 border-emerald-300 flex items-center justify-center font-black shrink-0">
                <BookOpen size={24} />
              </div>
              <span>
                <b className="text-emerald-500">ICAIIC 2026:</b> Published
              </span>
            </div>
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 bg-purple-100 text-purple-600 rounded-xl border-2 border-purple-300 flex items-center justify-center font-black shrink-0">
                <FileText size={24} />
              </div>
              <span>
                <b className="text-purple-500">SCSE 2026:</b> Published
              </span>
            </div>
          </div>
        </div>

        {/* Creative Roadmap Section */}
        <div
          className={`p-8 rounded-3xl border-4 ${contrastLight ? "bg-white border-slate-900 shadow-xl" : "bg-slate-900/60 border-slate-800"}`}
        >
          <h3
            className={`text-2xl font-black uppercase mb-10 text-center ${contrastLight ? "text-slate-950" : "text-white"}`}
          >
            THE ROADMAP
          </h3>

          <div className="flex flex-col md:flex-row items-center justify-between relative px-10 pb-6">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-12 left-20 right-20 h-2 bg-gradient-to-r from-blue-500 via-rose-500 to-emerald-500 rounded-full z-0"></div>

            {/* Roadmap Items */}
            {[
              {
                step: "Now",
                title: "Live",
                icon: Database,
                color: "text-blue-500 border-blue-500",
                desc: "4 papers, 10 datasets",
              },
              {
                step: "Q1",
                title: "Public Pilot",
                icon: Users,
                color: "text-indigo-500 border-indigo-500",
                desc: "3 partner labs",
              },
              {
                step: "Q2",
                title: "Multi-Modal",
                icon: Layers,
                color: "text-rose-500 border-rose-500",
                desc: "Image & audio expansion",
              },
              {
                step: "Q3",
                title: "Enterprise",
                icon: ShieldCheck,
                color: "text-emerald-500 border-emerald-500",
                desc: "On-prem release with SLA",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex flex-col items-center z-10 gap-4 group text-center px-4"
              >
                <div
                  className={`w-24 h-24 rounded-full border-4 bg-slate-900 flex items-center justify-center shadow-xl transition-transform transform group-hover:scale-110 ${item.color}`}
                >
                  <item.icon size={36} className={item.color.split(" ")[0]} />
                </div>
                <div>
                  <span
                    className={`block text-sm font-black uppercase tracking-widest mt-2 ${contrastLight ? "text-slate-500" : "text-slate-400"}`}
                  >
                    {item.step}
                  </span>
                  <h4
                    className={`text-2xl font-black mt-1 ${contrastLight ? "text-slate-900" : "text-white"}`}
                  >
                    {item.title}
                  </h4>
                  <p
                    className={`text-base font-bold mt-1 ${contrastLight ? "text-slate-700" : "text-slate-300"}`}
                  >
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  // SLIDE 14 — CLOSE
  {
    title: "Close",
    subtitle: "",
    icon: Check,
    iconColor: "text-rose-500 bg-rose-500/10 border-rose-500/20",
    content: (
      <div className="h-full w-full flex flex-col justify-center items-center text-center gap-6 max-w-5xl mx-auto py-2 overflow-y-auto">
        <img
          src="/logo.jpg"
          alt="CAL-Log Logo"
          className="h-28 md:h-32 object-contain bg-white p-2 rounded-2xl border-4 border-slate-400 shadow-2xl animate-bounce"
        />
        <div className="space-y-6">
          <h2
            className={`text-4xl md:text-6xl font-black uppercase tracking-tight ${contrastLight ? "text-slate-950" : "text-white"}`}
          >
            This isn't a research idea.
            <br />
            <span className="bg-gradient-to-r from-rose-500 to-indigo-600 bg-clip-text text-transparent">
              It's a tool, ready today.
            </span>
          </h2>
          <p
            className={`text-2xl md:text-3xl font-bold max-w-3xl mx-auto leading-relaxed ${contrastLight ? "text-slate-900 font-extrabold" : "text-slate-300"}`}
          >
            Same accuracy, a third of the time, at a fraction of the cost.
          </p>
        </div>
        <div className="w-full h-2 bg-gradient-to-r from-transparent via-slate-800 to-transparent my-6" />
        <h3
          className={`text-2xl font-black italic ${contrastLight ? "text-slate-500" : "text-slate-400"}`}
        >
          Thank you. Happy to take your questions.
        </h3>
        <button
          onClick={onClose}
          className="mt-4 px-10 py-6 bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white font-black text-2xl rounded-2xl shadow-2xl shadow-rose-500/30 transform hover:scale-105 active:scale-95 transition flex items-center gap-4"
        >
          <Play size={28} className="fill-white" /> Start Live Annotation Demo
        </button>
      </div>
    ),
  },
];
