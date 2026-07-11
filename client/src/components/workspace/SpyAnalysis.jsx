import React, { useState } from 'react';
import SelectionCard from './analysis/SelectionCard';
import ParameterGraphs from './analysis/ParameterGraphs';
import CostMathDebug from './analysis/CostMathDebug';
import ComparisonTable from './analysis/ComparisonTable';
import { HelpCircle, Eye, EyeOff, BarChart2, Zap, Layers, ShieldCheck, Clock, Award } from 'lucide-react';

/**
 * SpyAnalysis Component
 * Provides a user-friendly simplified mode showing dynamic active pruning stats,
 * and an advanced developer mode showing the raw scientific curves.
 */
const SpyAnalysis = ({ selectionLogic, metrics, history, interactionLog, shadowMetrics, onShowAlphaBetaPanel, annotationCount }) => {
    const [devMode, setDevMode] = useState(false);

    // Dynamic stats calculation
    const poolTotal = metrics?.pool_total || 1000;
    const poolRemaining = metrics?.pool_remaining !== undefined ? metrics?.pool_remaining : (poolTotal - annotationCount);
    
    // Auto labeled tasks are those that are in the pool but are no longer remaining and haven't been manually annotated
    const autoLabeledCount = Math.max(0, poolTotal - poolRemaining - annotationCount);
    const savingsPercent = Math.min(100, Math.max(0, Math.round((autoLabeledCount / poolTotal) * 100)));
    
    // ECE calibration state
    const ece = metrics?.ece !== undefined ? metrics.ece : 0.05;
    let calibrationStatus = { text: "Excellent Calibration", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
    if (ece > 0.25) {
        calibrationStatus = { text: "Drift Warning / Low Calibration", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" };
    } else if (ece > 0.12) {
        calibrationStatus = { text: "Fair Calibration", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
    }

    // Get current validation accuracy of CAL-Log
    const latestAccHistory = metrics?.accuracy_history || [];
    const currentAccuracy = latestAccHistory.length > 0 
        ? Math.round(latestAccHistory[latestAccHistory.length - 1].cal_log * 100) 
        : 50;

    // Estimate time saved (in seconds, converted to minutes/hours)
    // We compare random (shadow) vs cal_log to find cumulative saved seconds
    let secondsSaved = 0;
    if (shadowMetrics?.cumulative_random_cost && shadowMetrics?.cumulative_cal_log_cost) {
        const randTotal = shadowMetrics.cumulative_random_cost.reduce((a, b) => a + b, 0);
        const calTotal = shadowMetrics.cumulative_cal_log_cost.reduce((a, b) => a + b, 0);
        secondsSaved = Math.max(0, randTotal - calTotal);
    } else {
        // Fallback simulated logic: human effort is ~15s per item. 15s saved per auto-labeled text.
        secondsSaved = autoLabeledCount * 12;
    }
    const minutesSaved = (secondsSaved / 60).toFixed(1);

    return (
        <div className="flex flex-col gap-6 pb-8">
            
            {/* Developer Mode Toggle Switch */}
            <div className="flex items-center justify-between p-4 bg-slate-800/80 border border-slate-700/60 rounded-xl">
                <div className="flex items-center gap-2">
                    <BarChart2 className="text-violet-400" size={18} />
                    <span className="text-sm font-medium text-slate-200">
                        {devMode ? "Developer Mode (Advanced Math)" : "Simplified Business Analytics"}
                    </span>
                </div>
                <button
                    onClick={() => setDevMode(!devMode)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white text-xs font-bold rounded-lg border border-slate-600 transition-all"
                >
                    {devMode ? (
                        <>
                            <EyeOff size={13} />
                            Simplified Mode
                        </>
                    ) : (
                        <>
                            <Eye size={13} />
                            Developer Mode
                        </>
                    )}
                </button>
            </div>

            {/* SIMPLIFIED MODE RENDERING */}
            {!devMode ? (
                <div className="flex flex-col gap-6 animate-fadeIn">
                    
                    {/* Workload Progress Card */}
                    <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-5 shadow-lg">
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Layers size={14} className="text-blue-400" />
                            Workload Pruning Progress
                        </h3>

                        {/* Progress Segment Bar */}
                        <div className="h-4 bg-slate-800 rounded-full overflow-hidden flex mb-4 border border-slate-700/30">
                            {/* Manually Annotated */}
                            <div 
                                style={{ width: `${Math.max(3, (annotationCount / poolTotal) * 100)}%` }}
                                className="bg-blue-500 transition-all duration-500" 
                                title={`Manually Annotated: ${annotationCount}`}
                            />
                            {/* Auto Labeled */}
                            <div 
                                style={{ width: `${(autoLabeledCount / poolTotal) * 100}%` }}
                                className="bg-emerald-500 transition-all duration-500" 
                                title={`Auto Labeled: ${autoLabeledCount}`}
                            />
                        </div>

                        {/* Progress Details Grid */}
                        <div className="grid grid-cols-3 gap-3 text-center mb-4">
                            <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/20">
                                <p className="text-[10px] font-semibold text-slate-500 uppercase">Manual</p>
                                <p className="text-lg font-bold text-blue-400 mt-0.5">{annotationCount}</p>
                            </div>
                            <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/20">
                                <p className="text-[10px] font-semibold text-slate-500 uppercase">Auto-Pruned</p>
                                <p className="text-lg font-bold text-emerald-400 mt-0.5">{autoLabeledCount}</p>
                            </div>
                            <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/20">
                                <p className="text-[10px] font-semibold text-slate-500 uppercase">Remaining</p>
                                <p className="text-lg font-bold text-slate-400 mt-0.5">{poolRemaining}</p>
                            </div>
                        </div>

                        {/* Performance Savings Banner */}
                        <div className="flex items-center gap-3 p-3 bg-violet-950/20 border border-violet-900/30 rounded-lg">
                            <Zap className="text-violet-400 shrink-0" size={20} />
                            <div className="text-left">
                                <p className="text-sm font-bold text-white">Workload Reduced by {savingsPercent}%!</p>
                                <p className="text-xs text-slate-400">
                                    The active learning model has automatically labeled or filtered {autoLabeledCount} redundant tasks.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Efficiency & Accuracy Savings Card */}
                    <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-5 shadow-lg text-left">
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Award size={14} className="text-emerald-400" />
                            Active Learning ROI metrics
                        </h3>

                        <div className="flex flex-col gap-4">
                            {/* Saved Time metric */}
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                                    <Clock size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">Time Saved</p>
                                    <p className="text-xs text-slate-400">
                                        You saved approximately <span className="font-bold text-blue-400">{minutesSaved} minutes</span> of typing/reading effort.
                                    </p>
                                </div>
                            </div>

                            {/* Validation Accuracy metric */}
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                                    <ShieldCheck size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">Model Validation Accuracy</p>
                                    <p className="text-xs text-slate-400">
                                        Generalization accuracy is currently sitting at <span className="font-bold text-emerald-400">{currentAccuracy}%</span>.
                                    </p>
                                </div>
                            </div>

                            {/* ECE warning panel */}
                            <div className={`p-3 rounded-lg border text-center font-semibold text-xs mt-1 transition-all ${calibrationStatus.color}`}>
                                {calibrationStatus.text} (Expected Calibration Error: {ece})
                            </div>
                        </div>
                    </div>

                    {/* Quick Selection Explainer */}
                    <SelectionCard selectionLogic={selectionLogic} />
                </div>
            ) : (
                /* DEVELOPER MODE RENDERING (Full scientific curves for the Thesis Viva) */
                <div className="flex flex-col gap-6 animate-fadeIn">
                    
                    {/* side-by-side efficiency comparison: CAL-Log vs Entropy vs Random */}
                    <ComparisonTable shadowMetrics={shadowMetrics} />

                    {/* shows why CAL-Log chose this particular task (entropy, cost, score) */}
                    <SelectionCard selectionLogic={selectionLogic} />

                    {/* alpha/beta convergence chart with an optional help button */}
                    <div className="relative text-left">
                        {onShowAlphaBetaPanel && (
                            <button
                                onClick={onShowAlphaBetaPanel}
                                className="absolute top-4 right-4 z-10 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all flex items-center gap-2 text-sm font-bold shadow-lg"
                                title="Learn about Alpha & Beta"
                            >
                                <HelpCircle size={16} />
                                What do these mean?
                            </button>
                        )}
                        <ParameterGraphs metrics={metrics} history={history} />
                    </div>

                    {/* raw calculation logs so the evaluator can verify the math themselves */}
                    <CostMathDebug
                        selectionLogic={selectionLogic}
                        metrics={metrics}
                        interactionLog={interactionLog}
                    />
                </div>
            )}
        </div>
    );
};

export default SpyAnalysis;
