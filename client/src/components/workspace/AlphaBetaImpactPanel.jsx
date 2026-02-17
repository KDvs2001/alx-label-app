import React from 'react';
import { TrendingUp, TrendingDown, Activity, Zap } from 'lucide-react';

const AlphaBetaImpactPanel = ({ alpha, beta, isOpen, onClose }) => {
    if (!isOpen) return null;

    // Calculate impact indicators
    const alphaImpact = alpha > 5 ? 'high' : alpha > 3 ? 'medium' : 'low';
    const betaImpact = beta > 3 ? 'high' : beta > 2 ? 'medium' : 'low';

    const getImpactColor = (impact) => {
        switch (impact) {
            case 'high': return 'text-red-400';
            case 'medium': return 'text-yellow-400';
            case 'low': return 'text-green-400';
            default: return 'text-slate-400';
        }
    };

    const getImpactBg = (impact) => {
        switch (impact) {
            case 'high': return 'bg-red-900/20 border-red-500/30';
            case 'medium': return 'bg-yellow-900/20 border-yellow-500/30';
            case 'low': return 'bg-green-900/20 border-green-500/30';
            default: return 'bg-slate-900/20 border-slate-500/30';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-6">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-4xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Activity className="text-blue-400" size={32} />
                        <h2 className="text-3xl font-bold text-white">Alpha & Beta Impact Explained</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition text-2xl font-bold"
                    >
                        ×
                    </button>
                </div>

                {/* Current Values Display */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className={`p-6 rounded-xl border ${getImpactBg(alphaImpact)}`}>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-bold text-white">Alpha (α) - Task Switching Cost</h3>
                            <Zap className={getImpactColor(alphaImpact)} size={24} />
                        </div>
                        <div className={`text-4xl font-bold ${getImpactColor(alphaImpact)} mb-2`}>
                            {alpha.toFixed(2)}
                        </div>
                        <p className="text-sm text-slate-300">
                            {alphaImpact === 'high' && '⚡ High overhead - significant context-switching penalty'}
                            {alphaImpact === 'medium' && '⚖️ Balanced - moderate task-switching cost'}
                            {alphaImpact === 'low' && '🎯 Low overhead - minimal context-switching time'}
                        </p>
                    </div>

                    <div className={`p-6 rounded-xl border ${getImpactBg(betaImpact)}`}>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-bold text-white">Beta (β) - Skimming Time</h3>
                            <TrendingUp className={getImpactColor(betaImpact)} size={24} />
                        </div>
                        <div className={`text-4xl font-bold ${getImpactColor(betaImpact)} mb-2`}>
                            {beta.toFixed(2)}
                        </div>
                        <p className="text-sm text-slate-300">
                            {betaImpact === 'high' && '🐌 Slow skimmer - heavily penalizes long texts'}
                            {betaImpact === 'medium' && '👤 Average skimmer - moderate length sensitivity'}
                            {betaImpact === 'low' && '⚡ Fast skimmer - can handle long texts quickly'}
                        </p>
                    </div>
                </div>

                {/* Simple Explanation */}
                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                    <h3 className="text-xl font-bold text-white mb-4">How This Affects Task Selection</h3>
                    <div className="space-y-3 text-slate-300">
                        <div className="flex items-start gap-3">
                            <div className="text-blue-400 font-bold text-lg">📊</div>
                            <p>
                                <strong className="text-white">CAL-Log Score = Uncertainty / Cost</strong>
                                <br />
                                <span className="text-sm">Higher score = better task to label next</span>
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="text-green-400 font-bold text-lg">⏱️</div>
                            <p>
                                <strong className="text-white">Cost = α + β × log(text length)</strong>
                                <br />
                                <span className="text-sm">Your current values adapt based on how fast you actually read</span>
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="text-purple-400 font-bold text-lg">🎯</div>
                            <p>
                                <strong className="text-white">Result:</strong> The system learns your reading speed and picks tasks that maximize learning while minimizing your time
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all"
                    >
                        Got It!
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AlphaBetaImpactPanel;
