import React, { useState } from 'react';
import { TrendingUp, Eye, Zap, Clock, BarChart3 } from 'lucide-react';
import ShadowAuditModal from './ShadowAuditModal';

/**
 * ComparisonTable Component
 * Live dashboard comparing CAL-Log against Random and Entropy-only baselines.
 * Demonstrates the effectiveness of the cost-aware approach.
 */
const ComparisonTable = ({ shadowMetrics }) => {
    const [showAudit, setShowAudit] = useState(false);

    if (!shadowMetrics) return null;

    // Primary metric: Information Efficiency (Bits per second).
    // Calculated as: Entropy (bits resolved) / Cost (annotation time).
    const calLogEff = shadowMetrics.cal_log.info_efficiency || 0;
    const entropyEff = shadowMetrics.entropy.info_efficiency || 0;
    const randomEff = shadowMetrics.random.info_efficiency || 0;

    // Percentage improvement of CAL-Log over baselines: ((New - Old) / Old) * 100
    const vsEntropyPct = entropyEff > 0
        ? (((calLogEff - entropyEff) / entropyEff) * 100).toFixed(1)
        : '0.0';
    const vsRandomPct = randomEff > 0
        ? (((calLogEff - randomEff) / randomEff) * 100).toFixed(1)
        : '0.0';

    // Determines if CAL-Log is currently outperforming the baselines to update UI states.
    const isWinningVsEntropy = calLogEff > entropyEff;
    const isWinningVsRandom = calLogEff > randomEff;

    /**
     * Renders strategy performance cards.
     * Shows Efficiency, Entropy, and Cost to explain why a strategy wins 
     * (e.g., slightly lower entropy but much lower cost).
     */
    const renderStrategyCard = (name, efficiency, entropy, cost, color, borderColor, isHighlighted) => (
        <div className={`p-3 rounded-lg border ${isHighlighted ? `${borderColor} shadow-[0_0_15px_rgba(59,130,246,0.1)]` : 'border-slate-700/50'} ${isHighlighted ? 'bg-blue-900/20' : 'bg-slate-900/50'}`}>
            <div className={`text-[10px] uppercase tracking-widest mb-2 font-bold ${color}`}>{name}</div>
            <div className={`text-lg font-bold font-mono ${color}`}>
                {efficiency.toFixed(4)}
            </div>
            <div className="text-[9px] text-slate-500 mt-1">bits/sec</div>
            <div className="mt-2 pt-2 border-t border-white/5 grid grid-cols-2 gap-1">
                <div>
                    <div className="text-[9px] text-slate-600">Entropy</div>
                    <div className="text-[10px] font-mono text-slate-400">{(entropy || 0).toFixed(3)}</div>
                </div>
                <div>
                    <div className="text-[9px] text-slate-600">Cost</div>
                    <div className="text-[10px] font-mono text-slate-400">{cost}s</div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-white font-bold flex items-center gap-2">
                        <Zap size={18} className="text-blue-400" />
                        INFORMATION EFFICIENCY
                    </h3>
                    {/* Audit trail shows exact samples picked by each shadow strategy. */}
                    <button
                        onClick={() => setShowAudit(true)}
                        className="text-xs flex items-center gap-1 text-slate-400 hover:text-white transition px-2 py-1 rounded hover:bg-slate-700"
                    >
                        <Eye size={12} /> Audit
                    </button>
                </div>

                {/* Metric Explanation */}
                <div className="text-[9px] text-slate-500 mb-3 flex items-center gap-1">
                    <BarChart3 size={10} />
                    <span>Entropy &divide; Cost = bits of information resolved per second of annotation</span>
                </div>

                {/* Strategy Cards */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                    {renderStrategyCard(
                        'Random', randomEff,
                        shadowMetrics.random.avg_entropy,
                        shadowMetrics.random.estimated_cost,
                        'text-slate-300', 'border-slate-600', false
                    )}
                    {renderStrategyCard(
                        'Entropy', entropyEff,
                        shadowMetrics.entropy.avg_entropy,
                        shadowMetrics.entropy.estimated_cost,
                        'text-yellow-500', 'border-yellow-700', false
                    )}
                    {renderStrategyCard(
                        'CAL-Log', calLogEff,
                        shadowMetrics.cal_log.avg_entropy,
                        shadowMetrics.cal_log.estimated_cost,
                        'text-blue-300', 'border-blue-500/30', true
                    )}
                </div>

                {/* CAL-Log Advantage Banner */}
                {/* Highlights CAL-Log's advantage to validate the research hypothesis. */}
                <div className={`rounded-lg p-3 text-center border ${isWinningVsEntropy ? 'bg-green-900/20 border-green-900/50' : 'bg-slate-800/50 border-slate-700/50'}`}>
                    <div className={`text-[10px] mb-1 uppercase tracking-wider font-bold ${isWinningVsEntropy ? 'text-green-400/80' : 'text-slate-400'}`}>
                        CAL-Log vs Baselines
                    </div>
                    <div className="flex justify-center gap-6 text-sm font-bold">
                        <div className="flex items-center gap-1">
                            <span className="text-[10px] text-slate-500">vs Entropy:</span>
                            <span className={isWinningVsEntropy ? 'text-green-300' : 'text-slate-400'}>
                                {isWinningVsEntropy ? '+' : ''}{vsEntropyPct}%
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-[10px] text-slate-500">vs Random:</span>
                            <span className={isWinningVsRandom ? 'text-green-300' : 'text-slate-400'}>
                                {isWinningVsRandom ? '+' : ''}{vsRandomPct}%
                            </span>
                        </div>
                    </div>
                    {/* Core thesis argument summarized in UI. */}
                    <div className="text-[9px] text-slate-500 mt-2 italic leading-tight max-w-[90%] mx-auto">
                        Higher information efficiency = more uncertainty resolved per second of annotation time.
                        CAL-Log optimises Entropy &divide; Cost, while Entropy ignores cost entirely.
                    </div>
                </div>
            </div>

            <ShadowAuditModal
                isOpen={showAudit}
                onClose={() => setShowAudit(false)}
                metrics={shadowMetrics}
            />
        </>
    );
};

export default ComparisonTable;
