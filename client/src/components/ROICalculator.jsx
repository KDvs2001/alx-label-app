import React, { useState, useEffect } from 'react';
import { DollarSign, Users, Building, Briefcase, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

/**
 * ROICalculator Component
 * Translates the raw time savings of CAL-Log into projected financial savings for enterprise use cases.
 * Adapts dynamically to light and dark themes for premium legibility.
 */
const ROICalculator = () => {
    const [annotations, setAnnotations] = useState(10000);
    const [hourlyWage, setHourlyWage] = useState(20);
    const [isLight, setIsLight] = useState(() => document.body.classList.contains('theme-light'));

    // Dynamic theme detection
    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsLight(document.body.classList.contains('theme-light'));
        });
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    // average processing times in seconds, taken from the empirical results of our study
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
        { name: 'Random', cost: roi.randomCost, color: isLight ? '#f43f5e' : '#ef4444' }, 
        { name: 'CAL-Log', cost: roi.calLogCost, color: isLight ? '#4f46e5' : '#3b82f6' }  
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
            {/* Left Column: Controls */}
            <div className="space-y-8">
                {/* Presets */}
                <div className="grid grid-cols-3 gap-3">
                    {presets.map((preset) => (
                        <button
                            key={preset.name}
                            onClick={() => applyPreset(preset)}
                            className={`p-3.5 rounded-2xl border transition-all text-left group flex flex-col items-start ${
                                isLight
                                    ? 'bg-white hover:bg-slate-50 border-slate-200/80 shadow-sm'
                                    : 'bg-slate-900/60 hover:bg-slate-800 border-slate-800'
                            }`}
                        >
                            <preset.icon className={`mb-2.5 transition-colors ${isLight ? 'text-slate-400 group-hover:text-indigo-600' : 'text-slate-500 group-hover:text-blue-400'}`} size={20} />
                            <h3 className={`font-bold text-sm ${isLight ? 'text-slate-800' : 'text-white'}`}>{preset.name}</h3>
                            <p className="text-[10px] text-slate-400 mt-0.5">{preset.annotations.toLocaleString()} items</p>
                        </button>
                    ))}
                </div>

                {/* Sliders */}
                <div className={`space-y-6 p-6 rounded-2xl border transition-all ${
                    isLight 
                        ? 'bg-white border-slate-200/80 shadow-sm' 
                        : 'bg-slate-900/50 border-slate-850'
                }`}>
                    <div>
                        <div className="flex justify-between mb-2">
                            <label className={`text-sm font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Annual Annotations</label>
                            <span className={`font-mono font-bold ${isLight ? 'text-indigo-600' : 'text-blue-400'}`}>{annotations.toLocaleString()}</span>
                        </div>
                        <input
                            type="range"
                            min="1000"
                            max="100000"
                            step="1000"
                            value={annotations}
                            onChange={(e) => setAnnotations(parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            aria-label="Annual Annotations"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between mb-2">
                            <label className={`text-sm font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Hourly Cost ($)</label>
                            <span className={`font-mono font-bold ${isLight ? 'text-emerald-600' : 'text-green-400'}`}>${hourlyWage}/hr</span>
                        </div>
                        <input
                            type="range"
                            min="10"
                            max="100"
                            step="1"
                            value={hourlyWage}
                            onChange={(e) => setHourlyWage(parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                            aria-label="Hourly Cost"
                        />
                    </div>
                </div>

                <div className="text-[11px] text-slate-400 italic">
                    * Based on average speeds: Random ({avgTimeRandom}s) vs CAL-Log ({avgTimeCALLog}s) per task.
                </div>
            </div>

            {/* Right Column: Outcomes Dashboard */}
            <div className={`p-6 rounded-2xl border flex flex-col justify-between transition-all ${
                isLight 
                    ? 'bg-slate-100/70 border-slate-200' 
                    : 'bg-gradient-to-br from-slate-900 to-slate-900/50 border-slate-800'
            }`}>
                {/* Hero Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className={`p-4 rounded-xl border transition-all ${
                        isLight
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-green-900/20 border-green-500/30 text-green-400'
                    }`}>
                        <div className="flex items-center gap-2 mb-1.5 font-bold">
                            <DollarSign size={16} />
                            <span className="text-xs uppercase tracking-wider">Projected Savings</span>
                        </div>
                        <p className={`text-3xl font-black tracking-tight ${isLight ? 'text-emerald-900' : 'text-white'}`}>
                            ${roi.savings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </p>
                    </div>

                    <div className={`p-4 rounded-xl border transition-all ${
                        isLight
                            ? 'bg-blue-50 border-blue-200 text-blue-800'
                            : 'bg-blue-900/20 border-blue-500/30 text-blue-400'
                    }`}>
                        <div className="flex items-center gap-2 mb-1.5 font-bold">
                            <Clock size={16} />
                            <span className="text-xs uppercase tracking-wider">Time Saved</span>
                        </div>
                        <p className={`text-3xl font-black tracking-tight ${isLight ? 'text-blue-900' : 'text-white'}`}>
                            {roi.hoursSaved} <span className={`text-sm font-normal ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>hours</span>
                        </p>
                    </div>
                </div>

                {/* Chart */}
                <div className="flex-grow min-h-[190px] mb-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#cbd5e1' : '#334155'} vertical={false} />
                            <XAxis
                                dataKey="name"
                                stroke={isLight ? '#475569' : '#94a3b8'}
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 11, fontWeight: 'bold' }}
                            />
                            <YAxis
                                stroke={isLight ? '#475569' : '#94a3b8'}
                                tickFormatter={(value) => `$${value}`}
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 11, fontWeight: 'bold' }}
                            />
                            <Tooltip
                                cursor={{ fill: isLight ? '#f1f5f9' : '#1e293b' }}
                                contentStyle={{ 
                                    backgroundColor: isLight ? '#ffffff' : '#0f172a', 
                                    borderColor: isLight ? '#cbd5e1' : '#334155', 
                                    color: isLight ? '#0f172a' : '#f8fafc',
                                    borderRadius: '12px',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                                }}
                                itemStyle={{ color: isLight ? '#0f172a' : '#f8fafc' }}
                                formatter={(value) => [`$${value.toLocaleString()}`, 'Cost']}
                            />
                            <Bar dataKey="cost" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="mt-4 text-center space-y-3">
                    <p className={`font-semibold text-lg md:text-xl ${isLight ? 'text-slate-800' : 'text-white'}`}>
                        Projected cost reduction of <span className={`${isLight ? 'text-indigo-600' : 'text-green-400'} font-black text-2xl md:text-3xl`}>{roi.savingsPercent}%</span>
                    </p>
                    <div className={`p-4 rounded-xl border text-xs md:text-sm text-left leading-relaxed ${isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-slate-900/50 border-slate-800 text-slate-400'}`}>
                        <div className="font-bold mb-2 uppercase tracking-wider text-[10px] md:text-xs text-slate-500">Service Level Agreement (SLA) & Cost Math</div>
                        <ul className="space-y-1.5 list-disc list-inside">
                            <li><strong>Traditional Approach:</strong> {annotations.toLocaleString()} tasks × {avgTimeRandom}s/task = {(annotations * avgTimeRandom / 3600).toFixed(1)} hrs × ${hourlyWage}/hr = <span className="font-mono text-rose-400 font-bold">${roi.randomCost.toFixed(0)}</span></li>
                            <li><strong>CAL-Log SLA:</strong> {annotations.toLocaleString()} tasks × {avgTimeCALLog}s/task = {(annotations * avgTimeCALLog / 3600).toFixed(1)} hrs × ${hourlyWage}/hr = <span className="font-mono text-emerald-400 font-bold">${roi.calLogCost.toFixed(0)}</span></li>
                            <li><strong>System Infrastructure Costs:</strong> Lightweight local linear models mean computing costs are ~$0. Savings are pure labor ROI.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ROICalculator;
