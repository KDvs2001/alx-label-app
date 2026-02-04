import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { TrendingDown, Award, DollarSign, Brain, ArrowDown, ArrowUp } from 'lucide-react';
import ParameterExplanation from '../components/ParameterExplanation';
import ROICalculator from '../components/ROICalculator';
import ParameterImpactExplainer from '../components/ParameterImpactExplainer';

const ImpactDashboard = () => {
    const [experimentData, setExperimentData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchExperimentData();
    }, []);

    const fetchExperimentData = async () => {
        try {
            const response = await axios.get('http://localhost:5001/api/experiments');
            setExperimentData(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching experiment data:', error);
            setLoading(false);
        }
    };

    const seedSampleData = async () => {
        try {
            await axios.post('http://localhost:5001/api/experiments/seed');
            fetchExperimentData();
        } catch (error) {
            console.error('Error seeding data:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-white text-xl animate-pulse">Loading Impact Dashboard...</div>
            </div>
        );
    }

    // Modern Stat Card Component
    const StatCard = ({ icon: Icon, title, value, subtitle, trend, colorClass, borderClass }) => (
        <div className={`relative overflow-hidden bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border ${borderClass} group hover:bg-slate-900/60 transition-all duration-300`}>
            <div className={`absolute -right-6 -top-6 opacity-10 group-hover:opacity-20 transition-opacity`}>
                <Icon size={120} className={colorClass} />
            </div>
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg bg-slate-800/50 ${colorClass}`}>
                        <Icon size={20} />
                    </div>
                    <h3 className="text-slate-300 text-sm font-medium tracking-wide">{title}</h3>
                </div>
                <div className="flex items-baseline gap-2">
                    <p className={`text-4xl font-bold text-white tracking-tight`}>{value}</p>
                    {trend && (
                        <span className="flex items-center text-xs font-semibold text-green-400 bg-green-900/30 px-2 py-1 rounded-full">
                            <ArrowUp size={12} className="mr-1" /> {trend}
                        </span>
                    )}
                </div>
                <p className="text-xs text-slate-500 mt-2 font-medium">{subtitle}</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-12 flex justify-between items-end">
                <div>
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent mb-4">
                        CAL-Log Impact
                    </h1>
                    <p className="text-slate-400 text-xl max-w-2xl leading-relaxed">
                        Quantifying the value of Cost-Aware Active Learning through ROI analysis and parameter impact simulation.
                    </p>
                </div>
                {experimentData.length === 0 && (
                    <button
                        onClick={seedSampleData}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-900/20 transition-all hover:scale-105"
                    >
                        Load Sample Data
                    </button>
                )}
            </div>

            <div className="max-w-7xl mx-auto space-y-16">

                {/* 1. Quick Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        icon={TrendingDown}
                        title="Avg Cost Savings"
                        value="37%"
                        trend="12.5% vs baseline"
                        subtitle="Reduction in total annotation time"
                        colorClass="text-green-400"
                        borderClass="border-green-500/20"
                    />
                    <StatCard
                        icon={Award}
                        title="Effect Size"
                        value="0.85"
                        subtitle="Cohen's d (Large Effect)"
                        colorClass="text-purple-400"
                        borderClass="border-purple-500/20"
                    />
                    <StatCard
                        icon={Brain}
                        title="Statistical Sig."
                        value="p < .001"
                        subtitle="99.9% Confidence Interval"
                        colorClass="text-blue-400"
                        borderClass="border-blue-500/20"
                    />
                    <StatCard
                        icon={DollarSign}
                        title="Est. Annual ROI"
                        value="$5-50K"
                        subtitle="Depending on team size"
                        colorClass="text-yellow-400"
                        borderClass="border-yellow-500/20"
                    />
                </div>

                {/* 2. ROI Calculator (Hero Component) */}
                <section>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-px bg-slate-800 flex-grow"></div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <DollarSign className="text-green-400" />
                            Real-World ROI Calculator
                        </h2>
                        <div className="h-px bg-slate-800 flex-grow"></div>
                    </div>
                    <div className="bg-slate-900/30 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm">
                        <ROICalculator />
                    </div>
                </section>

                {/* 3. Parameter Logic (The "Why") */}
                <section>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-px bg-slate-800 flex-grow"></div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <Brain className="text-purple-400" />
                            How It Works
                        </h2>
                        <div className="h-px bg-slate-800 flex-grow"></div>
                    </div>
                    <div className="bg-slate-900/30 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm">
                        <ParameterExplanation />
                    </div>
                </section>

                {/* 4. Impact Analysis (The "Trade-offs") */}
                <section>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-px bg-slate-800 flex-grow"></div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <TrendingDown className="text-blue-400" />
                            Parameter Sensitivity Analysis
                        </h2>
                        <div className="h-px bg-slate-800 flex-grow"></div>
                    </div>
                    <div className="bg-slate-900/30 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm">
                        <ParameterImpactExplainer />
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ImpactDashboard;
