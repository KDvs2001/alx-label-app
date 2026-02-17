import React, { useState } from 'react';
import { BookOpen, Zap, Eye, Brain, ArrowRight, ArrowLeft, CheckCircle, X } from 'lucide-react';

const steps = [
    {
        icon: BookOpen,
        title: "Welcome, Evaluator",
        color: "blue",
        content: (
            <div className="space-y-4">
                <p className="text-slate-300 leading-relaxed">
                    You are about to experience <span className="text-blue-400 font-bold">CAL-Log</span> — a
                    <span className="text-blue-300 font-semibold"> Cost-Aware Active Learning</span> system that adapts to
                    <em> your</em> annotation behaviour in real time.
                </p>
                <div className="p-4 bg-blue-900/20 border border-blue-800/50 rounded-xl">
                    <p className="text-blue-300 text-sm font-medium">
                        📌 Unlike traditional Active Learning which only considers <em>model uncertainty</em>,
                        CAL-Log also considers <em>how long it takes YOU to read</em> each sample.
                    </p>
                </div>
            </div>
        )
    },
    {
        icon: Zap,
        title: "Your Task",
        color: "green",
        content: (
            <div className="space-y-4">
                <p className="text-slate-300 leading-relaxed">
                    You will annotate text samples as <span className="px-2 py-0.5 bg-green-900/50 border border-green-700 rounded text-green-300 font-bold text-sm">Positive</span> or <span className="px-2 py-0.5 bg-red-900/50 border border-red-700 rounded text-red-300 font-bold text-sm">Negative</span> sentiment.
                </p>
                <div className="space-y-2">
                    <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
                        <span className="text-green-400 font-bold text-lg mt-0.5">1</span>
                        <div>
                            <div className="text-white font-medium">Read the text</div>
                            <div className="text-slate-400 text-sm">Take your natural time — the system is measuring your reading speed</div>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
                        <span className="text-green-400 font-bold text-lg mt-0.5">2</span>
                        <div>
                            <div className="text-white font-medium">Click Positive or Negative</div>
                            <div className="text-slate-400 text-sm">Or use keyboard: <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-xs font-mono">1</kbd> = Negative, <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-xs font-mono">2</kbd> = Positive</div>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
                        <span className="text-green-400 font-bold text-lg mt-0.5">3</span>
                        <div>
                            <div className="text-white font-medium">Repeat for ~20 samples</div>
                            <div className="text-slate-400 text-sm">After 20 annotations, the model retrains and CAL-Log adapts</div>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    {
        icon: Eye,
        title: "What to Observe",
        color: "purple",
        content: (
            <div className="space-y-4">
                <p className="text-slate-300 leading-relaxed">
                    The right panel is a <span className="text-purple-400 font-bold">"Spy Window"</span> showing
                    CAL-Log's internal decision-making in real time.
                </p>
                <div className="space-y-3">
                    <div className="p-3 bg-slate-800/50 rounded-lg border-l-2 border-purple-500">
                        <div className="text-purple-300 font-bold text-sm">📊 Efficiency Savings</div>
                        <div className="text-slate-400 text-xs mt-1">Compares CAL-Log's task selections vs Random and Entropy baselines</div>
                    </div>
                    <div className="p-3 bg-slate-800/50 rounded-lg border-l-2 border-blue-500">
                        <div className="text-blue-300 font-bold text-sm">🔍 Selection Logic</div>
                        <div className="text-slate-400 text-xs mt-1">Shows WHY CAL-Log chose this specific task — reading pattern classification, task length percentile</div>
                    </div>
                    <div className="p-3 bg-slate-800/50 rounded-lg border-l-2 border-green-500">
                        <div className="text-green-300 font-bold text-sm">📈 Parameter Graphs</div>
                        <div className="text-slate-400 text-xs mt-1">Watch α and β change after every 20 annotations as the system learns your behaviour</div>
                    </div>
                </div>
            </div>
        )
    },
    {
        icon: Brain,
        title: "The Science Behind It",
        color: "orange",
        content: (
            <div className="space-y-4">
                <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 text-center">
                    <div className="text-slate-400 text-xs uppercase tracking-widest mb-3">CAL-Log Cost Formula</div>
                    <div className="text-2xl font-mono text-white font-bold">
                        C(x) = α + β · log(1 + L)
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-orange-900/20 border border-orange-800/40 rounded-lg">
                        <div className="text-orange-400 font-bold text-sm">α (Alpha) = Overhead</div>
                        <div className="text-slate-400 text-xs mt-1">
                            Fixed cost of switching between tasks — the time your brain takes to context-switch.
                            Based on KLM-GOMS cognitive model. Default: 5 seconds.
                        </div>
                    </div>
                    <div className="p-3 bg-amber-900/20 border border-amber-800/40 rounded-lg">
                        <div className="text-amber-400 font-bold text-sm">β (Beta) = Skimming Effort</div>
                        <div className="text-slate-400 text-xs mt-1">
                            How much extra time each unit of text length adds.
                            Low β = fast skimmer. High β = careful reader.
                        </div>
                    </div>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                    <div className="text-xs text-slate-400 leading-relaxed">
                        <span className="text-green-400 font-bold">Fast skimmer (low β):</span> You get longer, model-confusing sentences — you can handle them efficiently.
                        <br />
                        <span className="text-blue-400 font-bold">Careful reader (high β):</span> You get shorter, model-confusing sentences — maximizing your throughput.
                        <br /><br />
                        The overall score is: <span className="font-mono text-white">Score = Entropy / Cost</span> — maximizing information gained per second spent.
                    </div>
                </div>
            </div>
        )
    }
];

const EvaluatorBriefingModal = ({ isOpen, onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);

    if (!isOpen) return null;

    const step = steps[currentStep];
    const StepIcon = step.icon;
    const isLast = currentStep === steps.length - 1;
    const isFirst = currentStep === 0;

    const colorMap = {
        blue: { icon: 'text-blue-400', bg: 'bg-blue-600', border: 'border-blue-500/30', dot: 'bg-blue-500' },
        green: { icon: 'text-green-400', bg: 'bg-green-600', border: 'border-green-500/30', dot: 'bg-green-500' },
        purple: { icon: 'text-purple-400', bg: 'bg-purple-600', border: 'border-purple-500/30', dot: 'bg-purple-500' },
        orange: { icon: 'text-orange-400', bg: 'bg-orange-600', border: 'border-orange-500/30', dot: 'bg-orange-500' },
    };
    const colors = colorMap[step.color];

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-md">
            <div className={`bg-slate-900 border ${colors.border} rounded-2xl max-w-xl w-full mx-4 shadow-2xl overflow-hidden`}>
                {/* Header */}
                <div className="p-6 pb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center`}>
                            <StepIcon size={20} className="text-white" />
                        </div>
                        <div>
                            <div className="text-white font-bold text-lg">{step.title}</div>
                            <div className="text-slate-500 text-xs">Step {currentStep + 1} of {steps.length}</div>
                        </div>
                    </div>
                    <button onClick={onComplete} className="text-slate-500 hover:text-white transition p-1">
                        <X size={18} />
                    </button>
                </div>

                {/* Progress bar */}
                <div className="px-6">
                    <div className="flex gap-1.5">
                        {steps.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= currentStep ? colors.dot : 'bg-slate-800'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 min-h-[280px]">
                    {step.content}
                </div>

                {/* Footer */}
                <div className="p-6 pt-0 flex justify-between items-center">
                    <button
                        onClick={() => setCurrentStep(prev => prev - 1)}
                        disabled={isFirst}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${isFirst
                                ? 'text-slate-600 cursor-not-allowed'
                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                            }`}
                    >
                        <ArrowLeft size={16} />
                        Back
                    </button>

                    {isLast ? (
                        <button
                            onClick={onComplete}
                            className={`flex items-center gap-2 px-6 py-2.5 ${colors.bg} hover:opacity-90 text-white font-bold rounded-xl transition-all shadow-lg`}
                        >
                            <CheckCircle size={16} />
                            Begin Annotation
                        </button>
                    ) : (
                        <button
                            onClick={() => setCurrentStep(prev => prev + 1)}
                            className={`flex items-center gap-2 px-6 py-2.5 ${colors.bg} hover:opacity-90 text-white font-bold rounded-xl transition-all shadow-lg`}
                        >
                            Next
                            <ArrowRight size={16} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EvaluatorBriefingModal;
