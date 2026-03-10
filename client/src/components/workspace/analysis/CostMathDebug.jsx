import React from 'react';

/**
 * CostMathDebug Component
 * Visualizes Active Learning (AL) calculations.
 * Shows how instances are scored using Information Efficiency (Entropy / Cost) 
 * and displays real-time parameters of the Cost Model.
 */
// props are destructured directly in the function signature for readability
// CITATION: destructuring assignment - extract props in the function parameter
// SOURCE: MDN Web Docs (n.d.). "Destructuring assignment"
// URL: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
const CostMathDebug = ({ selectionLogic, metrics, interactionLog }) => {
    return (
        <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl space-y-4">

            {/* A. Entropy Explanation */}
            <div>
                <h4 className="text-slate-400 text-xs font-bold uppercase mb-2">Math Verification (Active Learning)</h4>
                {/* ternary operator: show the math breakdown if we have data, else a loading message */}
                {/* CITATION: ternary operator (? :) - inline conditional expression */}
                {/* SOURCE: MDN Web Docs (n.d.). "Conditional (ternary) operator" */}
                {/* URL: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_operator */}
                {selectionLogic ? (
                    <div className="font-mono text-xs text-slate-300">
                        {/* 
                         * Information Efficiency: Maximizes bits gained per second of human effort.
                         * Unlike standard AL (which only uses Entropy), this divides Entropy by Cost.
                         */}
                        <div className="flex justify-between">
                            <span>Score = Entropy / Cost</span>
                            {/* optional chaining (?.) safely handles cases where score may be undefined */}
                            {/* CITATION: optional chaining (?.) - safe property access without null checks */}
                            {/* SOURCE: MDN Web Docs (n.d.). "Optional chaining (?.)" */}
                            {/* URL: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining */}
                            <span className="text-blue-400">{selectionLogic.score?.toFixed(4)}</span>
                        </div>
                        <div className="text-slate-500">{selectionLogic.entropy?.toFixed(3)} / {selectionLogic.cost?.toFixed(1)}s</div>

                        {/* 
                         * Cold Start: Untrained models output max uncertainty (~0.69 for binary classification).
                         * The system waits for 30 tasks before training.
                         */}
                        {/* conditional render: only show the cold-start warning when entropy is near max */}
                        {/* CITATION: conditional rendering with && - short-circuit to show/hide JSX */}
                        {/* SOURCE: React (n.d.). "Conditional Rendering" */}
                        {/* URL: https://react.dev/learn/conditional-rendering */}
                        {selectionLogic.entropy > 0.68 && (
                            <div className="mt-2 text-yellow-400 border-l-2 border-yellow-400 pl-2">
                                <b>Why 0.69?</b> <br />
                                Model is "Cold" (Untrained). <br />
                                {/* modulo (%) tells us how many tasks are left until the next training cycle */}
                                {/* CITATION: remainder operator (%) - get the leftover after division */}
                                {/* SOURCE: MDN Web Docs (n.d.). "Remainder (%)" */}
                                {/* URL: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Remainder */}
                                <span className="text-white">Training starts in: {30 - (metrics.step % 30)} tasks.</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-slate-600 text-xs">Waiting for data...</div>
                )}
            </div>

            <div className="h-px bg-slate-700" />

            {/* B. Cost Model Inputs */}
            <div>
                <h4 className="text-slate-400 text-xs font-bold uppercase mb-2">Cost Model Inputs (Last 5)</h4>

                {/* 
                 * Cost Model predicts annotation time:
                 * Alpha (α): Fixed overhead (context switching).
                 * Beta (β): Variable time based on length.
                 * Log(Length): Accounts for "skimming" longer texts instead of reading linearly.
                 */}
                <div className="mb-3 p-2 bg-slate-900 rounded border border-slate-700 font-mono text-xs">
                    <div className="text-slate-500 mb-1">Prediction Formula:</div>
                    <div className="text-blue-300">Cost = α + (β × Log(Length))</div>
                    <div className="text-slate-500 mt-2 text-[10px] leading-tight">
                        <b>Why is Beta 0.10?</b> <br />
                        The model detects aggressive <i>Skimming Behavior</i>.
                        <br />(Time is dominated by Alpha overhead, not text length).
                    </div>
                </div>

                <div className="text-xs text-slate-400 mb-1">
                    <i>Feature: Log(1 + Length) -&gt; Target: Time</i>
                </div>
                <div className="grid grid-cols-3 text-xs font-bold text-slate-500 mb-1">
                    <span>Length</span>
                    <span>Log Input</span>
                    <span>Time Output</span>
                </div>
                {/* 
                 * System tracks your recent reading speed to recalibrate the adaptive cost model.
                 * This auto-adjusts the math (α and β) on the fly if you start skimming or get tired.
                 */}
                {/* render each interaction as a row using array.map() */}
                {/* CITATION: Array.map() - transform an array into a list of JSX elements */}
                {/* SOURCE: React (n.d.). "Rendering Lists" */}
                {/* URL: https://react.dev/learn/rendering-lists */}
                <div className="space-y-1 font-mono text-xs max-h-24 overflow-y-auto">
                    {interactionLog.length === 0 && <div className="text-slate-600 italic">No clicks yet...</div>}
                    {interactionLog.map((h, i) => (
                        <div key={i} className="grid grid-cols-3 text-slate-300">
                            <span>{h.len}w</span>
                            <span className="text-purple-400">{h.logL}</span>
                            <span className="text-orange-400">{h.time}s</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};


export default CostMathDebug;
