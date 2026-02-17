
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';

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
                    <span className="text-purple-400">Alpha: <b>{metrics.alpha?.toFixed(2)}</b></span>
                    <span className="text-orange-400">Beta: <b>{metrics.beta?.toFixed(2)}</b></span>
                </div>
            </div>

            <div className="flex-1 w-full min-h-[150px]">
                <h4 className="text-xs text-slate-500 mb-1">Parameter Trend (History)</h4>
                <ResponsiveContainer width="100%" height={150}>
                    <LineChart data={history}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="step" stroke="#64748b" fontSize={10} />
                        <YAxis stroke="#64748b" fontSize={10} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} itemStyle={{ fontSize: 12 }} />
                        <Line type="monotone" dataKey="alpha" stroke="#a855f7" strokeWidth={2} dot={false} name="Alpha" />
                        <Line type="monotone" dataKey="beta" stroke="#f97316" strokeWidth={2} dot={false} name="Beta" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* 2. CUMULATIVE COST COMPARISON (Replaces misleading accuracy chart) */}
            <div className="flex-1 w-full min-h-[150px] mt-4 border-t border-slate-800 pt-4">
                <h4 className="text-xs text-slate-500 mb-1 flex justify-between">
                    <span>Cumulative Annotation Cost (per Strategy)</span>
                    <span className="text-[10px] bg-slate-800 px-2 rounded">Lower is Better 📉</span>
                </h4>
                {metrics.cumulative_costs?.history?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={150}>
                        <LineChart data={metrics.cumulative_costs.history}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="batch" stroke="#64748b" fontSize={10} label={{ value: 'Batch', position: 'insideBottom', offset: -2, fontSize: 10, fill: '#64748b' }} />
                            <YAxis stroke="#64748b" fontSize={10} label={{ value: 'Cost (s)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
                            <Line type="monotone" dataKey="cal_log" stroke="#3b82f6" strokeWidth={3} dot={true} name="CAL-Log (You)" />
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

            <div className="flex-1 w-full min-h-[150px] mt-4 border-t border-slate-800 pt-4">
                <h4 className="text-xs text-slate-500 mb-1">Behavior Analysis (Regression)</h4>
                <ResponsiveContainer width="100%" height={150}>
                    <ScatterChart>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis type="number" dataKey="x" name="Log(Length)" stroke="#64748b" fontSize={10} domain={['dataMin', 'dataMax']} />
                        <YAxis type="number" dataKey="y" name="Time (s)" stroke="#64748b" fontSize={10} />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#0f172a' }} />
                        <Scatter name="Your Clicks" data={metrics.user_history || []} fill="#3b82f6" shape="circle" />
                        {/* Regression Line (Simulated via 2 points) */}
                        <Line type="linear" dataKey="line" stroke="#ef4444" strokeWidth={2} dot={false}
                            data={[
                                { x: 3, y: metrics.alpha + metrics.beta * 3 },
                                { x: 5, y: metrics.alpha + metrics.beta * 5 }
                            ]}
                        />
                    </ScatterChart>
                </ResponsiveContainer>
                <p className="text-[10px] text-slate-600 mt-1 italic">
                    Blue dots = Your actions. Red Line = The Model (Alpha + Beta * LogL).
                </p>
            </div>
        </div>
    );
};

export default ParameterGraphs;
