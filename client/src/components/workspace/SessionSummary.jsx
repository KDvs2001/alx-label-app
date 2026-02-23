import React, { useState } from 'react';
import { Home, Download, CheckCircle, TrendingDown, Clock, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import EvaluatorFeedbackModal from './EvaluatorFeedbackModal';

const SessionSummary = ({ metrics, history, shadowMetrics, annotationCount, onHome, onExport }) => {
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);

    // Calculate Key Metrics
    const startBeta = 3.0; // Fixed start
    const endBeta = metrics.beta;
    const betaChange = ((endBeta - startBeta) / startBeta) * 100;

    // Determine Evaluator Type
    let evaluatorType = "Balanced Reader";
    if (endBeta < 1.5) evaluatorType = "Fast Skimmer";
    if (endBeta > 3.0) evaluatorType = "Careful Reader";

    // Calculate Savings (using Cumulative Costs if available, else Shadow Snapshot)
    let timeSaved = 0;
    let percentSaved = 0;

    if (metrics.cumulative_costs) {
        const calLogCost = metrics.cumulative_costs.cal_log;
        const entropyCost = metrics.cumulative_costs.entropy;
        timeSaved = entropyCost - calLogCost;
        percentSaved = (timeSaved / entropyCost) * 100;
    } else if (shadowMetrics) {
        // Fallback to snapshot estimation (extrapolated)
        const diffPerTask = shadowMetrics.entropy.estimated_cost - shadowMetrics.cal_log.estimated_cost;
        timeSaved = diffPerTask * annotationCount;
        percentSaved = (diffPerTask / shadowMetrics.entropy.estimated_cost) * 100;
    }

    return (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden">

                {/* Header */}
                <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-slate-900 p-8 text-center border-b border-slate-800">
                    <div className="inline-flex items-center justify-center p-3 bg-green-500/20 rounded-full mb-4 ring-1 ring-green-500/50">
                        <CheckCircle size={32} className="text-green-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Session Complete</h1>
                    <p className="text-slate-400">Here is how CAL-Log adapted to your reading style.</p>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Card 1: Adaptation Profile */}
                    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                        <div className="flex items-center gap-3 mb-4">
                            <Activity className="text-blue-400" />
                            <h3 className="text-slate-300 font-bold">Adaptation Profile</h3>
                        </div>
                        <div className="text-4xl font-bold text-white mb-2">{evaluatorType}</div>
                        <div className="text-sm text-slate-400 mb-6">
                            Based on your final reading factor (β).
                        </div>

                        <div className="flex justify-between items-end border-t border-slate-700 pt-4">
                            <div>
                                <div className="text-xs text-slate-500 uppercase">Start Beta</div>
                                <div className="text-xl font-mono text-slate-400">3.00</div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-slate-500 uppercase">End Beta</div>
                                <div className={`text-2xl font-mono font-bold ${endBeta < 3.0 ? 'text-green-400' : 'text-orange-400'}`}>
                                    {endBeta.toFixed(2)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Efficiency Savings */}
                    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                        <div className="flex items-center gap-3 mb-4">
                            <TrendingDown className="text-green-400" />
                            <h3 className="text-slate-300 font-bold">Efficiency Gains</h3>
                        </div>
                        <div className="text-4xl font-bold text-green-400 mb-2">
                            {timeSaved > 0 ? `-${timeSaved.toFixed(0)}s` : "0s"}
                        </div>
                        <div className="text-sm text-slate-400 mb-6">
                            Total time saved compared to Entropy Sampling.
                        </div>

                        <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                            <div
                                className="bg-green-500 h-full transition-all"
                                style={{ width: `${Math.min(percentSaved, 100)}%` }}
                            />
                        </div>
                        <div className="text-right text-xs text-green-400 mt-2 font-bold">
                            {percentSaved.toFixed(1)}% More Efficient
                        </div>
                    </div>

                    {/* Card 3: Production Stats */}
                    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                        <div className="flex items-center gap-3 mb-4">
                            <Clock className="text-purple-400" />
                            <h3 className="text-slate-300 font-bold">Throughput</h3>
                        </div>
                        <div className="text-4xl font-bold text-white mb-2">{annotationCount}</div>
                        <div className="text-sm text-slate-400 mb-6">
                            Total tasks annotated in this session.
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t border-slate-700 pt-4">
                            <div>
                                <div className="text-[10px] sm:text-xs text-slate-500 font-medium">History Steps</div>
                                <div className="text-lg text-white font-mono">{history.length}</div>
                                <div className="text-[10px] text-slate-500 italic mt-0.5 leading-tight">Snapshots of your reading speed (β)</div>
                            </div>
                            <div>
                                <div className="text-[10px] sm:text-xs text-slate-500 font-medium">Model Updates</div>
                                <div className="text-lg text-white font-mono">{Math.floor(annotationCount / 10)}</div>
                                <div className="text-[10px] text-slate-500 italic mt-0.5 leading-tight">Times the background models retrained</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chart Section */}
                <div className="px-8 pb-8">
                    <div className="bg-slate-950 rounded-xl border border-slate-800 p-4">
                        <h4 className="text-slate-500 text-xs font-bold uppercase mb-4">Parameter Convergence (System Learning)</h4>
                        <div className="h-48 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={history}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis dataKey="step" stroke="#64748b" fontSize={10} />
                                    <YAxis stroke="#64748b" fontSize={10} />
                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
                                    <Line type="monotone" dataKey="beta" stroke="#f97316" strokeWidth={3} dot={false} name="Beta (Reading Factor)" />
                                    <Line type="monotone" dataKey="alpha" stroke="#64748b" strokeWidth={1} strokeDasharray="5 5" dot={false} name="Alpha (Fixed)" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
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
                                ⚠️ Please complete this final step!
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
            <EvaluatorFeedbackModal
                isOpen={showFeedbackModal}
                onClose={() => setShowFeedbackModal(false)}
                sessionData={{
                    sessionId: "SESS-" + Date.now(), // Generate a unique session ID for evaluation tracking
                    annotationsCompleted: annotationCount,
                    startingBeta: startBeta,
                    endingBeta: endBeta,
                    avgTimeSavedVsEntropy: (timeSaved / Math.max(1, annotationCount)) || 0,
                    systemReadingProfile: evaluatorType
                }}
            />
        </div>
    );
};

export default SessionSummary;
