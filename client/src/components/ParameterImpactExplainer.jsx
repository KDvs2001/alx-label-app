import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle, Briefcase, Microscope, Scale } from 'lucide-react';

const ParameterImpactExplainer = () => {
    // Pre-computed trade-off data (from Kaggle experiments)
    const tradeoffData = [
        { alpha: 2.0, cost: 1456, f1: 0.91 },
        { alpha: 3.0, cost: 1389, f1: 0.90 },
        { alpha: 4.0, cost: 1298, f1: 0.89 },
        { alpha: 5.0, cost: 1234, f1: 0.89 }, // Sweet spot
        { alpha: 6.0, cost: 1189, f1: 0.88 },
        { alpha: 7.0, cost: 1156, f1: 0.87 },
        { alpha: 8.0, cost: 1123, f1: 0.86 }
    ];

    const scenarios = [
        {
            name: "Startup Speed",
            icon: Briefcase,
            params: "α=6, β=4",
            desc: "Prioritize speed. 15% cheaper, slightly lower accuracy.",
            color: "text-blue-400",
            bg: "bg-blue-900/20",
            borderColor: "border-blue-500/30"
        },
        {
            name: "Research Quality",
            icon: Microscope,
            params: "α=3, β=2",
            desc: "Prioritize accuracy. 20% more expensive, better diversity.",
            color: "text-purple-400",
            bg: "bg-purple-900/20",
            borderColor: "border-purple-500/30"
        },
        {
            name: "Balanced Default",
            icon: Scale,
            params: "α=5, β=3",
            desc: "Optimal trade-off. The CAL-Log 'sweet spot'.",
            color: "text-green-400",
            bg: "bg-green-900/20",
            borderColor: "border-green-500/30"
        }
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Left Col: Scenarios (Visual Cards) */}
            <div className="space-y-6">
                <h3 className="text-xl font-bold text-white mb-4">Choose Your Strategy</h3>
                <div className="space-y-4">
                    {scenarios.map((s, idx) => (
                        <div key={idx} className={`flex items-center gap-4 p-4 rounded-xl border ${s.borderColor} ${s.bg} hover:bg-opacity-50 transition-all cursor-pointer`}>
                            <div className={`p-3 rounded-lg bg-slate-900/50 ${s.color}`}>
                                <s.icon size={24} />
                            </div>
                            <div>
                                <h4 className="text-white font-bold">{s.name} <span className="ml-2 text-xs font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded">{s.params}</span></h4>
                                <p className="text-sm text-slate-300">{s.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="text-slate-400 flex-shrink-0 mt-1" size={18} />
                        <p className="text-sm text-slate-400 italic">
                            Changing α and β doesn't just change the score—it changes <strong>which tasks</strong> get picked first.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Col: Trade-off Chart */}
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50">
                <h3 className="text-xl font-bold text-white mb-2">Cost vs. Accuracy Trade-off</h3>
                <p className="text-sm text-slate-400 mb-6">Finding the efficiency frontier</p>

                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={tradeoffData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis
                                dataKey="alpha"
                                stroke="#94a3b8"
                                label={{ value: 'α (Alpha)', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                yAxisId="left"
                                stroke="#3b82f6"
                                tickFormatter={(v) => `${v}s`}
                                tickLine={false}
                                axisLine={false}
                                fontSize={12}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                stroke="#10b981"
                                domain={[0.85, 0.92]}
                                tickLine={false}
                                axisLine={false}
                                fontSize={12}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                                itemStyle={{ fontSize: 12 }}
                            />
                            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                            <Line yAxisId="left" type="monotone" dataKey="cost" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} name="Cost (sec)" />
                            <Line yAxisId="right" type="monotone" dataKey="f1" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} name="F1 Score" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

        </div>
    );
};

export default ParameterImpactExplainer;
