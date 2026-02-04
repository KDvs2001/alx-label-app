import React, { useState } from 'react';
import { DollarSign, Users, Building, Briefcase, TrendingDown, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const ROICalculator = () => {
    const [annotations, setAnnotations] = useState(10000);
    const [hourlyWage, setHourlyWage] = useState(20);

    // Average times (in seconds) from experiment data
    const avgTimeRandom = 3.75;
    const avgTimeCALLog = 2.47;

    const calculateROI = () => {
        const randomCost = (annotations * avgTimeRandom / 3600) * hourlyWage;
        const calLogCost = (annotations * avgTimeCALLog / 3600) * hourlyWage;
        const savings = randomCost - calLogCost;
        const savingsPercent = ((savings / randomCost) * 100).toFixed(1);
        const hoursSaved = (annotations * (avgTimeRandom - avgTimeCALLog) / 3600).toFixed(0);

        return { randomCost, calLogCost, savings, savingsPercent, hoursSaved };
    };

    const roi = calculateROI();

    const chartData = [
        { name: 'Random', cost: roi.randomCost, color: '#ef4444' }, // Red-500
        { name: 'CAL-Log', cost: roi.calLogCost, color: '#3b82f6' }  // Blue-500
    ];

    const presets = [
        { name: "Small Lab", icon: Users, annotations: 1000, wage: 15 },
        { name: "Startup", icon: Briefcase, annotations: 10000, wage: 25 },
        { name: "Enterprise", icon: Building, annotations: 100000, wage: 40 }
    ];

    const applyPreset = (preset) => {
        setAnnotations(preset.annotations);
        setHourlyWage(preset.wage);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Controls */}
            <div className="space-y-8">
                {/* Presets */}
                <div className="grid grid-cols-3 gap-3">
                    {presets.map((preset) => (
                        <button
                            key={preset.name}
                            onClick={() => applyPreset(preset)}
                            className="bg-slate-800 hover:bg-slate-700 p-3 rounded-xl border border-slate-700 transition-all text-left group"
                        >
                            <preset.icon className="text-slate-400 group-hover:text-blue-400 mb-2" size={20} />
                            <h4 className="text-white font-semibold text-sm">{preset.name}</h4>
                            <p className="text-[10px] text-slate-500">{preset.annotations.toLocaleString()} items</p>
                        </button>
                    ))}
                </div>

                {/* Sliders */}
                <div className="space-y-6 bg-slate-900/50 p-6 rounded-xl border border-slate-800">
                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-sm text-slate-400">Annual Annotations</label>
                            <span className="text-blue-400 font-mono font-bold">{annotations.toLocaleString()}</span>
                        </div>
                        <input
                            type="range"
                            min="1000"
                            max="100000"
                            step="1000"
                            value={annotations}
                            onChange={(e) => setAnnotations(parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-sm text-slate-400">Hourly Cost ($)</label>
                            <span className="text-green-400 font-mono font-bold">${hourlyWage}/hr</span>
                        </div>
                        <input
                            type="range"
                            min="10"
                            max="100"
                            step="1"
                            value={hourlyWage}
                            onChange={(e) => setHourlyWage(parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                        />
                    </div>
                </div>

                <div className="text-xs text-slate-500 italic">
                    * Based on average speeds: Random ({avgTimeRandom}s) vs CAL-Log ({avgTimeCALLog}s) per task.
                </div>
            </div>

            {/* Right Column: Impact Visualization */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-900/50 p-6 rounded-xl border border-slate-800 flex flex-col justify-between">

                {/* Hero Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-xl">
                        <div className="flex items-center gap-2 mb-1 text-green-400">
                            <DollarSign size={18} />
                            <span className="text-sm font-semibold uppercase tracking-wider">Projected Savings</span>
                        </div>
                        <p className="text-3xl font-bold text-white tracking-tight">
                            ${roi.savings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </p>
                    </div>

                    <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-xl">
                        <div className="flex items-center gap-2 mb-1 text-blue-400">
                            <Clock size={18} />
                            <span className="text-sm font-semibold uppercase tracking-wider">Time Saved</span>
                        </div>
                        <p className="text-3xl font-bold text-white tracking-tight">
                            {roi.hoursSaved} <span className="text-base font-normal text-slate-400">hours</span>
                        </p>
                    </div>
                </div>

                {/* Chart */}
                <div className="flex-grow min-h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis
                                dataKey="name"
                                stroke="#94a3b8"
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#94a3b8"
                                tickFormatter={(value) => `$${value}`}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                cursor={{ fill: '#1e293b' }}
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                                itemStyle={{ color: '#f8fafc' }}
                                formatter={(value) => [`$${value.toLocaleString()}`, 'Cost']}
                            />
                            <Bar dataKey="cost" radius={[4, 4, 0, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="mt-4 text-center">
                    <p className="text-white">
                        Projected cost reduction of <span className="text-green-400 font-bold text-xl">{roi.savingsPercent}%</span>
                    </p>
                </div>

            </div>
        </div>
    );
};

export default ROICalculator;
