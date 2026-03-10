import React from 'react';
// Recharts is a composable chart library built on React components
// CITATION: Recharts - composable charting library built on React and D3
// SOURCE: Recharts (n.d.). "API: ResponsiveContainer"
// URL: https://recharts.org/en-US/api/ResponsiveContainer
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

/**
 * ParameterGraphs Component
 * Displays the core evaluation metrics: the evolution of cost parameters (Alpha/Beta) 
 * over time, and the cumulative annotation costs across different selection strategies.
 */
// props are destructured in the function signature for cleaner access
// CITATION: destructuring assignment - extract props in the function parameter
// SOURCE: MDN Web Docs (n.d.). "Destructuring assignment"
// URL: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
const ParameterGraphs = ({ metrics, history }) => {
    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex-1 flex flex-col">
            <h3 className="text-green-400 font-bold mb-2">PARAMETER EVOLUTION</h3>
            <p className="text-xs text-slate-500 mb-4">
                <b>Alpha (Overhead):</b> Cognitive task-switching cost (Fixed). <br />
                <b>Beta (Skimming):</b> Log-length scaling factor (Captures skimming behavior). <br />
                <i>*Lower Beta = More aggressive skimming.*</i>
            </p>

            <div className="bg-slate-950 rounded-lg p-2 mb-4 border border-slate-800">
                <div className="flex justify-between text-xs px-2 py-1">
                    {/* optional chaining (?.) guards against undefined metrics during initial load */}
                    {/* CITATION: optional chaining (?.) - safe property access without null checks */}
                    {/* SOURCE: MDN Web Docs (n.d.). "Optional chaining (?.)" */}
                    {/* URL: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining */}
                    <span className="text-purple-400">Alpha: <b>{metrics.alpha?.toFixed(2)}</b></span>
                    <span className="text-orange-400">Beta: <b>{metrics.beta?.toFixed(2)}</b></span>
                </div>
            </div>

            <div className="flex-1 w-full min-h-[150px]">
                <h4 className="text-xs text-slate-500 mb-1">Parameter Trend (History)</h4>
                {/* 
                 * Parameter Trend History:
                 * Visualizes how the system actively learns the annotator's profile.
                 * Alpha shows the fixed cognitive overhead (context switching),
                 * Beta shows the log-length speed (revealing if the user is skimming).
                 * Wrapped in Recharts' ResponsiveContainer to ensure UI flexibility.
                 */}
                <ResponsiveContainer width="100%" height={150} minWidth={0} minHeight={0}>
                    <LineChart data={history}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="step" stroke="#64748b" fontSize={10} />
                        <YAxis stroke="#64748b" fontSize={10} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} itemStyle={{ fontSize: 12 }} />
                        {/* each Line maps a key from the data array to a plotted series */}
                        {/* CITATION: Recharts Line component - plot a data series on the chart */}
                        {/* SOURCE: Recharts (n.d.). "API: Line" */}
                        {/* URL: https://recharts.org/en-US/api/Line */}
                        <Line type="monotone" dataKey="alpha" stroke="#a855f7" strokeWidth={2} dot={false} name="Alpha" />
                        <Line type="monotone" dataKey="beta" stroke="#f97316" strokeWidth={2} dot={false} name="Beta" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Cumulative Cost Comparison across strategies */}
            <div className="flex-1 w-full min-h-[150px] mt-4 border-t border-slate-800 pt-4">
                <h4 className="text-xs text-slate-500 mb-1 flex justify-between">
                    <span>Cumulative Annotation Cost (per Strategy)</span>
                    <span className="text-[10px] bg-slate-800 px-2 rounded">Lower is Better</span>
                </h4>
                {/*
                 * Cumulative Cost Comparison:
                 * Crucial for defending the AL-X⁶ framework's efficiency.
                 * Plots CAL-Log vs. Baselines (Random/Entropy) to visually prove that 
                 * CAL-Log ultimately requires less annotation time (lower total cost) 
                 * to achieve the same or better learning outcomes.
                 */}
                {/* conditional render: only show chart when there's actual cost data */}
                {/* CITATION: conditional rendering with ternary - show component or fallback */}
                {/* SOURCE: React (n.d.). "Conditional Rendering" */}
                {/* URL: https://react.dev/learn/conditional-rendering */}
                {metrics.cumulative_costs?.history?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={150} minWidth={0} minHeight={0}>
                        <LineChart data={metrics.cumulative_costs.history}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="batch" stroke="#64748b" fontSize={10} label={{ value: 'Batch', position: 'insideBottom', offset: -2, fontSize: 10, fill: '#64748b' }} />
                            <YAxis stroke="#64748b" fontSize={10} label={{ value: 'Cost (s)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
                            <Line type="monotone" dataKey="cal_log" stroke="#3b82f6" strokeWidth={3} dot={true} name="CAL-Log (You)" />
                            {/* strokeDasharray makes the baseline lines dashed to visually separate them from CAL-Log */}
                            <Line type="monotone" dataKey="entropy" stroke="#facc15" strokeWidth={2} strokeDasharray="4 4" name="Entropy Only" />
                            <Line type="monotone" dataKey="random" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 4" name="Random" />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-[150px] flex items-center justify-center text-slate-600 text-sm">
                        Cost comparison will appear after first batch...
                    </div>
                )}
            </div>

        </div>
    );
};


export default ParameterGraphs;
