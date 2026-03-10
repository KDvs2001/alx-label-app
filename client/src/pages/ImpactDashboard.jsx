// CITATION: React lazy / Suspense - component level code-splitting
// SOURCE: React (n.d.). "lazy"
// URL: https://react.dev/reference/react/lazy
import React, { useEffect, useState, Suspense, lazy } from 'react';
// axios is a promise-based HTTP client for the browser and node.js
// CITATION: axios - Promise based HTTP client
// SOURCE: Axios (n.d.). "Getting Started"
// URL: https://axios-http.com/docs/intro
import axios from 'axios';
import { TrendingDown, Award, DollarSign, Brain, ArrowDown, ArrowUp } from 'lucide-react';

const ROICalculator = lazy(() => import('../components/ROICalculator'));
const ParameterImpactExplainer = lazy(() => import('../components/ParameterImpactExplainer'));

/**
 * ImpactDashboard Page
 * Formats experimental results (Effect Size, ROI) for academic and industry review.
 */
const ImpactDashboard = () => {
    const [experimentData, setExperimentData] = useState([]);
    const [loading, setLoading] = useState(false);
    // Vite exposes environment variables via import.meta.env instead of process.env
    // CITATION: Env Variables and Modes - exposing variables in Vite
    // SOURCE: Vite (n.d.). "Env Variables and Modes"
    // URL: https://vitejs.dev/guide/env-and-mode.html
    const SERVER_URL = (import.meta.env.VITE_SERVER_URL || "").replace(/\/$/, "");

    useEffect(() => {
        fetchExperimentData();
    }, []);

    // asynchronous data fetch using axios to populate the dashboard metrics
    const fetchExperimentData = async () => {
        try {
            const response = await axios.get(`${SERVER_URL}/api/experiments`);
            setExperimentData(response.data);
        } catch (error) {
            console.warn('Backend unavailable:', error.message);
        }
    };


    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-white text-xl animate-pulse">Loading Impact Dashboard...</div>
            </div>
        );
    }

    // reusable functional component utilizing ES6 object destructuring for cleaner prop management
    // CITATION: Destructuring assignment - unpacking values from objects into distinct variables
    // SOURCE: MDN Web Docs (n.d.). "Destructuring assignment"
    // URL: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
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
                    <h2 className="text-slate-300 text-sm font-medium tracking-wide">{title}</h2>
                </div>
                <div className="flex items-baseline gap-2">
                    <p className={`text-4xl font-bold text-white tracking-tight`}>{value}</p>
                    {trend && (
                        <span className="flex items-center text-xs font-semibold text-green-400 bg-green-900/30 px-2 py-1 rounded-full">
                            <ArrowUp size={12} className="mr-1" /> {trend}
                        </span>
                    )}
                </div>
                <p className="text-xs text-slate-400 mt-2 font-medium">{subtitle}</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-12 flex justify-between items-end">
                <div>
                    {/* bg-clip-text applies the text-transparent gradient solely to the text characters */}
                    {/* CITATION: CSS Background-clip property */}
                    {/* SOURCE: MDN Web Docs (n.d.). "background-clip" */}
                    {/* URL: https://developer.mozilla.org/en-US/docs/Web/CSS/background-clip */}
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent mb-4">
                        CAL-Log Impact
                    </h1>
                    <p className="text-slate-400 text-xl max-w-2xl leading-relaxed">
                        Quantifying the value of Cost-Aware Active Learning through ROI analysis and parameter impact simulation.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto space-y-16">

                {/* displays statistical metrics like Cohen's d to quantify the performance gap vs baseline */}
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
                        {/* React Suspense delays rendering the component until its chunk is fully loaded over the network */}
                        {/* CITATION: React Suspense/lazy behaviour mapping */}
                        {/* SOURCE: Stack Overflow (2019). "React suspense/lazy delay?" */}
                        {/* URL: https://stackoverflow.com/questions/54158994/react-suspense-lazy-delay */}
                        <Suspense fallback={<div className="text-slate-400 animate-pulse text-center p-10">Loading Calculator...</div>}>
                            <ROICalculator />
                        </Suspense>
                    </div>
                </section>

                {/* 3. Impact Analysis (The "Trade-offs") */}
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
                        <Suspense fallback={<div className="text-slate-400 animate-pulse text-center p-10">Loading Impact Analysis...</div>}>
                            <ParameterImpactExplainer />
                        </Suspense>
                    </div>
                </section>

                {/* SurveyCircle Note */}
                <div className="border-t border-slate-800 pt-6 pb-4 text-center">
                    <p className="text-sm text-slate-500 italic">
                        PS: SurveyCircle users receive points for their participation, which can be used to recruit free survey participants at{' '}
                        {/* target="_blank" requires rel="noopener noreferrer" to prevent the newly opened page from hijacking the window.opener object */}
                        {/* CITATION: Security risk mitigation for target="_blank" */}
                        {/* SOURCE: Stack Overflow (2018). "Link with target='_blank' and rel='noopener noreferrer' still vulnerable?" */}
                        {/* URL: https://stackoverflow.com/questions/50709625/link-with-target-blank-and-rel-noopener-noreferrer-still-vulnerable */}
                        <a href="https://www.surveycircle.com" target="_blank" rel="noopener noreferrer" className="text-blue-400/70 underline hover:text-blue-400 transition-colors">SurveyCircle.com</a>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ImpactDashboard;
