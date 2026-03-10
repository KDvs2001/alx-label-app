// CITATION: useState - React hook for local component state
// SOURCE: React (n.d.). "useState"
// URL: https://react.dev/reference/react/useState
import React, { useState } from 'react';
// lucide-react provides tree-shakable SVG icon components
// CITATION: lucide-react - SVG icon library as React components
// SOURCE: Lucide (n.d.). "lucide-react"
// URL: https://lucide.dev/guide/packages/lucide-react
import { Home, Download, CheckCircle, Zap, Clock, Activity, TrendingUp, ArrowRight } from 'lucide-react';
// recharts renders data-driven charts as React components
// CITATION: Recharts - composable charting library built on D3 and React
// SOURCE: Recharts (n.d.). "Getting Started"
// URL: https://recharts.org/en-US/guide
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import EvaluatorFeedbackModal from './EvaluatorFeedbackModal';

/**
 * SessionSummary Component
 * Final dashboard that proves AL-X efficiency over baselines by compiling all active learning metrics.
 */
const SessionSummary = ({ metrics, history, shadowMetrics, annotationCount, cumulativeTimeSaved, cumulativeEntropyCost, cumulativeRandomCost, cumulativeCalLogCost, annotations, contestantId, onHome, onExport }) => {
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);

    // compare the initial defaults against the converged values to show how the system adapted
    const startAlpha = 5.0;
    const startBeta = 3.0;
    const endAlpha = metrics.alpha;
    const endBeta = metrics.beta;

    // classify the evaluator's reading behaviour based on where Beta converged
    // lower beta means the user reads quickly, higher beta means they read carefully
    let evaluatorType = "Balanced Reader";
    let evaluatorDescription = "You read at a moderate pace. CAL-Log optimised tasks for a balanced information gain.";
    let evaluatorColor = "text-purple-400";
    let evaluatorBgColor = "from-purple-900/30 to-purple-900/10";
    let evaluatorBorderColor = "border-purple-500/30";

    if (endBeta < 1.5) {
        evaluatorType = "Fast Skimmer";
        evaluatorDescription = "You annotate quickly. CAL-Log gave you longer, more informative tasks to maximise information gained per session.";
        evaluatorColor = "text-green-400";
        evaluatorBgColor = "from-green-900/30 to-green-900/10";
        evaluatorBorderColor = "border-green-500/30";
    } else if (endBeta > 3.0) {
        evaluatorType = "Careful Reader";
        evaluatorDescription = "You read thoroughly. CAL-Log gave you shorter, high-uncertainty tasks to maximise your throughput.";
        evaluatorColor = "text-blue-400";
        evaluatorBgColor = "from-blue-900/30 to-blue-900/10";
        evaluatorBorderColor = "border-blue-500/30";
    }

    // optional chaining guards against undefined shadowMetrics before the first batch completes
    // CITATION: optional chaining (?.) - safe property access without null checks
    // SOURCE: MDN Web Docs (n.d.). "Optional chaining (?.)"
    // URL: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining
    const calLogEfficiency = shadowMetrics?.cal_log?.info_efficiency || 0;
    const entropyEfficiency = shadowMetrics?.entropy?.info_efficiency || 0;
    const randomEfficiency = shadowMetrics?.random?.info_efficiency || 0;

    // percentage improvement calculated as ((ours - baseline) / baseline) * 100
    const vsEntropyPct = entropyEfficiency > 0
        ? (((calLogEfficiency - entropyEfficiency) / entropyEfficiency) * 100)
        : 0;
    const vsRandomPct = randomEfficiency > 0
        ? (((calLogEfficiency - randomEfficiency) / randomEfficiency) * 100)
        : 0;

    const isWinningVsEntropy = calLogEfficiency > entropyEfficiency;
    const isWinningVsRandom = calLogEfficiency > randomEfficiency;

    return (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden">

                {/* Header */}
                <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-slate-900 p-8 text-center border-b border-slate-800">
                    <div className="inline-flex items-center justify-center p-3 bg-green-500/20 rounded-full mb-4 ring-1 ring-green-500/50">
                        <CheckCircle size={32} className="text-green-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Session Complete</h1>
                    <p className="text-slate-400">Here is how CAL-Log adapted to your annotation behavior.</p>
                </div>

                <div className="p-8 space-y-6">

                        {/* Reading Profile Hero: Validates that the system correctly profiled the human evaluator */}
                        <div className={`bg-gradient-to-r ${evaluatorBgColor} rounded-xl p-6 border ${evaluatorBorderColor}`}>
                        <div className="flex items-center gap-3 mb-4">
                            <Activity className={evaluatorColor} />
                            <h3 className="text-slate-300 font-bold">Your Reading Profile</h3>
                        </div>
                        <div className="flex items-start gap-8">
                            <div className="flex-1">
                                <div className={`text-4xl font-bold ${evaluatorColor} mb-2`}>{evaluatorType}</div>
                                <div className="text-sm text-slate-400 mb-4">
                                    {evaluatorDescription}
                                </div>
                            </div>
                            {/* Parameter Changes: Alpha and Beta */}
                            <div className="grid grid-cols-2 gap-6 bg-slate-900/50 rounded-lg p-4 border border-white/5">
                                <div className="text-center">
                                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Alpha (Overhead)</div>
                                    <div className="flex items-center gap-2 justify-center">
                                        <span className="text-sm font-mono text-slate-500">{startAlpha.toFixed(1)}</span>
                                        <ArrowRight size={12} className="text-slate-600" />
                                        <span className={`text-xl font-mono font-bold ${evaluatorColor}`}>{endAlpha.toFixed(2)}</span>
                                    </div>
                                    <div className="text-[9px] text-slate-600 mt-1">Fixed time per task (seconds)</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Beta (Reading Speed)</div>
                                    <div className="flex items-center gap-2 justify-center">
                                        <span className="text-sm font-mono text-slate-500">{startBeta.toFixed(1)}</span>
                                        <ArrowRight size={12} className="text-slate-600" />
                                        <span className={`text-xl font-mono font-bold ${evaluatorColor}`}>{endBeta.toFixed(2)}</span>
                                    </div>
                                    <div className="text-[9px] text-slate-600 mt-1">Time scaling with text length</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Highlights the core thesis: CAL-Log achieves higher information density per second than baselines */}
                        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                            <div className="flex items-center gap-3 mb-4">
                                <Zap className="text-blue-400" />
                                <h3 className="text-slate-300 font-bold">CAL-Log Advantage</h3>
                            </div>

                            <div className="text-[10px] text-slate-500 mb-3">
                                Information Efficiency = Entropy &divide; Cost (bits of uncertainty resolved per second)
                            </div>

                            {/* Strategy Comparison */}
                            <div className="space-y-3 mb-4">
                                {/* CAL-Log (highlighted) */}
                                <div className="bg-blue-900/20 rounded-lg p-3 border border-blue-500/30">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-blue-300 uppercase tracking-wide">CAL-Log</span>
                                        <span className="text-lg font-bold font-mono text-blue-300">{calLogEfficiency.toFixed(4)}</span>
                                    </div>
                                    <div className="text-[9px] text-blue-400/60 mt-1">bits/sec - Entropy &divide; Predicted Annotation Cost</div>
                                </div>
                                {/* Entropy */}
                                <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-yellow-500 uppercase tracking-wide">Entropy Sampling</span>
                                        <span className="text-sm font-mono text-yellow-500/80">{entropyEfficiency.toFixed(4)}</span>
                                    </div>
                                </div>
                                {/* Random */}
                                <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Random</span>
                                        <span className="text-sm font-mono text-slate-400/80">{randomEfficiency.toFixed(4)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Improvement Percentages */}
                            <div className={`rounded-lg p-3 text-center border ${isWinningVsEntropy ? 'bg-green-900/20 border-green-900/50' : 'bg-slate-800/50 border-slate-700/50'}`}>
                                <div className="flex justify-center gap-6 text-sm font-bold">
                                    <div>
                                        <span className="text-[10px] text-slate-500 block mb-1">vs Entropy</span>
                                        <span className={isWinningVsEntropy ? 'text-green-300' : 'text-slate-400'}>
                                            {isWinningVsEntropy ? '+' : ''}{vsEntropyPct.toFixed(1)}%
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-500 block mb-1">vs Random</span>
                                        <span className={isWinningVsRandom ? 'text-green-300' : 'text-slate-400'}>
                                            {isWinningVsRandom ? '+' : ''}{vsRandomPct.toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Session Statistics: Displays the frequency of model retrains and parameter updates */}
                        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                            <div className="flex items-center gap-3 mb-4">
                                <Clock className="text-purple-400" />
                                <h3 className="text-slate-300 font-bold">Session Statistics</h3>
                            </div>
                            <div className="text-4xl font-bold text-white mb-2">{annotationCount}</div>
                            <div className="text-sm text-slate-400 mb-6">
                                Total tasks annotated in this session.
                            </div>

                            <div className="grid grid-cols-2 gap-4 border-t border-slate-700 pt-4">
                                <div>
                                    <div className="text-[10px] sm:text-xs text-slate-500 font-medium">Cost Model Updates</div>
                                    <div className="text-lg text-white font-mono">{history.length}</div>
                                    <div className="text-[10px] text-slate-500 italic mt-0.5 leading-tight">Alpha &amp; Beta recalculated</div>
                                </div>
                                <div>
                                    <div className="text-[10px] sm:text-xs text-slate-500 font-medium">Model Retrains</div>
                                    {/* Math.floor rounds down to show whole retrain cycles (every 5 tasks) */}
                                    {/* CITATION: Math.floor() - round a number down to the nearest integer */}
                                    {/* SOURCE: MDN Web Docs (n.d.). "Math.floor()" */}
                                    {/* URL: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/floor */}
                                    <div className="text-lg text-white font-mono">{Math.floor(annotationCount / 5)}</div>
                                    <div className="text-[10px] text-slate-500 italic mt-0.5 leading-tight">All 3 models retrained every 5 tasks</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Visual proof: Recharts component mapping the real-time convergence of Alpha & Beta */}
                    <div className="bg-slate-950 rounded-xl border border-slate-800 p-4">
                        <h4 className="text-slate-500 text-xs font-bold uppercase mb-1">How CAL-Log Learned Your Reading Style</h4>
                        <p className="text-[10px] text-slate-600 mb-4">Alpha (grey dashed) = fixed overhead per task. Beta (orange) = how long text length affects annotation time. Both evolve as you annotate.</p>
                        <div className="h-48 w-full">
                            {/* ResponsiveContainer from recharts scales the chart to fill its parent */}
                            <ResponsiveContainer width="100%" height="100%">
                                {/* LineChart plots the alpha/beta trajectory over annotation steps */}
                                <LineChart data={history}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    {/* XAxis binds data to chronological annotation steps */}
                                    <XAxis dataKey="step" stroke="#64748b" fontSize={10} label={{ value: 'Annotations', position: 'insideBottomRight', offset: -5, style: { fontSize: 9, fill: '#64748b' } }} />
                                    <YAxis stroke="#64748b" fontSize={10} label={{ value: 'Seconds', angle: -90, position: 'insideLeft', style: { fontSize: 9, fill: '#64748b' } }} />
                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' }} />
                                    <Legend verticalAlign="top" height={24} iconSize={10} wrapperStyle={{ fontSize: '10px' }} />
                                    {/* orange solid line for Beta (reading speed), grey dashed for Alpha (overhead) */}
                                    <Line type="monotone" dataKey="beta" stroke="#f97316" strokeWidth={3} dot={false} name="Beta (Reading Speed)" />
                                    <Line type="monotone" dataKey="alpha" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Alpha (Fixed Overhead)" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* footer actions: home navigation, data export, and the mandatory feedback survey */}
                <div className="bg-slate-900 border-t border-slate-700 p-6 flex justify-between items-center">
                    <button
                        onClick={onHome}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors font-bold border-2 border-transparent"
                    >
                        <Home size={18} /> Back to Home
                    </button>

                    <div className="flex gap-4 items-center">
                        <button
                            onClick={onExport}
                            className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors font-bold shadow-lg border-2 border-transparent"
                        >
                            <Download size={18} /> Download Data
                        </button>
                        <div className="relative">
                            <span className="absolute -top-7 right-0 text-sm font-bold text-red-400 animate-pulse whitespace-nowrap">
                                Please complete this final step!
                            </span>
                            <button
                                onClick={() => setShowFeedbackModal(true)}
                                className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all font-bold shadow-lg shadow-blue-500/50 hover:-translate-y-1 animate-pulse border-2 border-blue-400"
                            >
                                <CheckCircle size={18} /> Evaluate System
                            </button>
                        </div>
                    </div>
                </div>

            </div>
            {/* passes session analytics to the feedback form so evaluator responses can be correlated with ML data */}
            <EvaluatorFeedbackModal
                isOpen={showFeedbackModal}
                onClose={() => setShowFeedbackModal(false)}
                sessionData={{
                    sessionId: "SESS-" + Date.now(),
                    contestantId: contestantId || 'unknown',
                    annotationsCompleted: annotationCount,
                    startingAlpha: startAlpha,
                    endingAlpha: endAlpha,
                    startingBeta: startBeta,
                    endingBeta: endBeta,
                    calLogEfficiency,
                    entropyEfficiency,
                    randomEfficiency,
                    avgTimeSavedVsEntropy: parseFloat(vsEntropyPct.toFixed(1)),
                    avgTimeSavedVsRandom: parseFloat(vsRandomPct.toFixed(1)),
                    vsEntropyPct: vsEntropyPct.toFixed(1),
                    vsRandomPct: vsRandomPct.toFixed(1),
                    systemReadingProfile: evaluatorType,
                    // Array.map extracts task IDs, filter(Boolean) removes any undefined entries
                    // CITATION: Array.map() / Array.filter() - transform and filter arrays
                    // SOURCE: MDN Web Docs (n.d.). "Array.prototype.map()"
                    // URL: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
                    tasksReceived: (annotations || []).map(a => a.taskId).filter(Boolean),
                    // Array.reduce sums up word counts to calculate the average task length
                    // CITATION: Array.reduce() - accumulate array values into a single result
                    // SOURCE: MDN Web Docs (n.d.). "Array.prototype.reduce()"
                    // URL: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce
                    avgTaskLength: (annotations || []).length > 0
                        ? (annotations.reduce((sum, a) => sum + (a.wordCount || 0), 0) / annotations.length)
                        : 0,
                    sessionDurationSeconds: (annotations || []).length > 1
                        ? ((new Date(annotations[annotations.length - 1]?.timestamp) - new Date(annotations[0]?.timestamp)) / 1000)
                        : 0
                }}
            />
        </div>
    );
};

export default SessionSummary;
