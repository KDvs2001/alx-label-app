import React from 'react';
// lucide-react provides tree-shakable SVG icon components
// CITATION: lucide-react - SVG icon library as React components
// SOURCE: Lucide (n.d.). "lucide-react"
// URL: https://lucide.dev/guide/packages/lucide-react
import { Activity, ArrowRight, Gauge, Ruler } from 'lucide-react';

/**
 * SelectionCard Component
 * Primary UI feedback loop exposing exactly *why* the AL engine selected the current batch.
 * It translates background math (entropies, predicted costs) into human-readable visual indicators.
 */
const SelectionCard = ({ selectionLogic, speedStdDev = 0 }) => {
    // map each reading pattern to its display style using a switch statement
    // CITATION: switch statement - match a value against multiple cases
    // SOURCE: MDN Web Docs (n.d.). "switch"
    // URL: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/switch
    const getPatternStyle = (pattern) => {
        switch (pattern) {
            case 'fast_skimmer':
                return { icon: '', color: 'text-green-400', bgColor: 'bg-green-900/30', borderColor: 'border-green-700' };
            case 'careful_reader':
                return { icon: '', color: 'text-blue-400', bgColor: 'bg-blue-900/30', borderColor: 'border-blue-700' };
            case 'balanced':
                return { icon: '', color: 'text-purple-400', bgColor: 'bg-purple-900/30', borderColor: 'border-purple-700' };
            default:
                return { icon: '', color: 'text-slate-400', bgColor: 'bg-slate-800', borderColor: 'border-slate-700' };
        }
    };


    // map each task length category to its display colour and label
    const getLengthStyle = (lengthClass) => {
        switch (lengthClass) {
            case 'short':
                return { color: 'text-green-400', label: 'Short Task' };
            case 'medium':
                return { color: 'text-yellow-400', label: 'Medium Task' };
            case 'long':
                return { color: 'text-orange-400', label: 'Long Task' };
            default:
                return { color: 'text-slate-400', label: 'Unknown' };
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Activity size={100} />
            </div>
            <h3 className="text-blue-400 font-bold mb-4 flex items-center gap-2">
                {/* animate-pulse gives the dot a breathing effect to signal live data */}
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" /> SELECTION LOGIC
            </h3>

            {selectionLogic ? (
                <div className="space-y-4">
                    {/* 
                     * Reading Pattern Feedback (Gauge Icon):
                     * Breaks down the user's active reading profile (e.g., 'Fast Skimmer').
                     * This demonstrates that the system doesn't just treat humans as static oracles,
                     * but continuously adapts its cost predictions to their real-time behavior.
                     */}
                    {/* CITATION: conditional rendering with && - short-circuit to show/hide JSX */}
                    {/* SOURCE: React (n.d.). "Conditional Rendering" */}
                    {/* URL: https://react.dev/learn/conditional-rendering */}
                    {selectionLogic.reading_pattern && selectionLogic.reading_pattern.pattern !== 'insufficient_data' && (
                        <div className={`p-3 rounded-lg border ${getPatternStyle(selectionLogic.reading_pattern.pattern).bgColor} ${getPatternStyle(selectionLogic.reading_pattern.pattern).borderColor}`}>
                            <div className="flex items-center gap-2 mb-2">
                                <Gauge size={16} className={getPatternStyle(selectionLogic.reading_pattern.pattern).color} />
                                <div className="text-xs text-slate-400">Reading Pattern (Last 5 Annotations)</div>
                            </div>
                            <div className={`font-bold ${getPatternStyle(selectionLogic.reading_pattern.pattern).color} text-sm`}>
                                {/* replace underscores with spaces and uppercase for display */}
                                {/* CITATION: String.replace() - replace matched substrings */}
                                {/* SOURCE: MDN Web Docs (n.d.). "String.prototype.replace()" */}
                                {/* URL: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace */}
                                {/* CITATION: String.toUpperCase() - convert string to all caps for display */}
                                {/* SOURCE: MDN Web Docs (n.d.). "String.prototype.toUpperCase()" */}
                                {/* URL: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/toUpperCase */}
                                {selectionLogic.reading_pattern.pattern.replace('_', ' ').toUpperCase()}
                            </div>
                        </div>
                    )}

                    {/* Pattern-Based Reasoning */}
                    {selectionLogic.pattern_reasoning && (
                        <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                            <div className="text-xs text-slate-500 mb-1">Why these tasks?</div>
                            <div className="font-medium text-slate-200 text-sm">{selectionLogic.pattern_reasoning}</div>
                        </div>
                    )}

                    {/* 
                     * Task Length Classification (Ruler Icon):
                     * Shows how the task compares to the dataset distribution.
                     * This is critical because length heavily dictates the predicted cost (via the Beta parameter),
                     * and explicitly showing it justifies why a task was scored efficiently or inefficiently.
                     */}
                    {selectionLogic.task_stats && selectionLogic.task_stats.length_class && (
                        <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                            <div className="flex items-center gap-2 mb-2">
                                <Ruler size={16} className="text-slate-400" />
                                <div className="text-xs text-slate-400">Task Length in Dataset</div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className={`font-bold ${getLengthStyle(selectionLogic.task_stats.length_class).color}`}>
                                        {getLengthStyle(selectionLogic.task_stats.length_class).label}
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1">
                                        {selectionLogic.task_stats.length} words ({selectionLogic.task_stats.length_description})
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-slate-500">Percentile</div>
                                    <div className="text-lg font-bold text-blue-400">{selectionLogic.task_stats.percentile}%</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 
                     * Raw Mathematics Panel: 
                     * Displays the exact Entropy and Predicted Cost calculated for the batch.
                     * Score (Information Efficiency) = Entropy / Cost.
                     * This transparency makes the active learning engine's black-box decisions defensible.
                     */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-xs text-slate-500">Entropy Score</div>
                         {/* fallback || 0 prevents NaN if the value hasn't arrived yet */}
                         <div className="text-xl font-bold text-purple-400">{(selectionLogic.entropy || 0).toFixed(3)}</div>
                        </div>
                        <div>
                            <div className="text-xs text-slate-500">Predicted Cost</div>
                            <div className="text-xl font-bold text-orange-400">
                                {(selectionLogic.cost || 0).toFixed(1)}s
                                {speedStdDev > 0 && (
                                    <span className="text-sm font-normal text-slate-500 ml-1">
                                        ±{(speedStdDev * Math.log1p((selectionLogic.task_stats?.length || 50))).toFixed(1)}s
                                    </span>
                                )}
                            </div>
                            {speedStdDev > 0 && (
                                <div className="text-[10px] text-slate-600 mt-0.5">95% confidence band from rolling speed avg</div>
                            )}
                        </div>
                    </div>

                    <div className="h-px bg-slate-800 my-2" />

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <ArrowRight size={14} />
                        <span>CAL-Log adapts to your reading behavior every 5 annotations.</span>
                    </div>
                </div>
            ) : (
                <div className="text-slate-600 text-sm">Waiting for selection data...</div>
            )}
        </div>
    );
};

export default SelectionCard;
