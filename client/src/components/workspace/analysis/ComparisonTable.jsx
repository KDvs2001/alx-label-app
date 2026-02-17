
import React, { useState } from 'react';
import { TrendingDown, Eye } from 'lucide-react';
import ShadowAuditModal from './ShadowAuditModal';

const ComparisonTable = ({ shadowMetrics }) => {
    const [showAudit, setShowAudit] = useState(false);

    if (!shadowMetrics) return null;

    const savings = {
        time: (shadowMetrics.entropy.estimated_cost - shadowMetrics.cal_log.estimated_cost).toFixed(1),
        words: (shadowMetrics.entropy.avg_len - shadowMetrics.cal_log.avg_len).toFixed(0)
    };

    return (
        <>
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-white font-bold flex items-center gap-2">
                        <TrendingDown size={18} className="text-green-400" />
                        EFFICIENCY SAVINGS
                    </h3>
                    <button
                        onClick={() => setShowAudit(true)}
                        className="text-xs flex items-center gap-1 text-slate-400 hover:text-white transition px-2 py-1 rounded hover:bg-slate-700"
                    >
                        <Eye size={12} /> Audit
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center mb-4">
                    <div className="p-2 bg-slate-900/50 rounded border border-slate-700/50">
                        <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Random</div>
                        <div className="text-sm font-mono text-slate-300">{shadowMetrics.random.estimated_cost}s</div>
                        <div className="text-[10px] text-slate-600">{shadowMetrics.random.avg_len} words</div>
                    </div>
                    <div className="p-2 bg-slate-900/50 rounded border border-yellow-900/20">
                        <div className="text-[10px] text-yellow-600 uppercase tracking-widest mb-1">Entropy</div>
                        <div className="text-sm font-mono text-yellow-500">{shadowMetrics.entropy.estimated_cost}s</div>
                        <div className="text-[10px] text-slate-600">{shadowMetrics.entropy.avg_len} words</div>
                    </div>
                    <div className="p-2 bg-blue-900/20 rounded border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                        <div className="text-[10px] text-blue-400 uppercase tracking-widest mb-1">CAL-Log</div>
                        <div className="text-lg font-bold font-mono text-blue-300">{shadowMetrics.cal_log.estimated_cost}s</div>
                        <div className="text-[10px] text-blue-400/60">{shadowMetrics.cal_log.avg_len} words</div>
                    </div>
                </div>

                {/* Savings Banner */}
                <div className="bg-green-900/20 border border-green-900/50 rounded-lg p-3 text-center">
                    <div className="text-xs text-green-400 mb-1">Compared to Standard Entropy Sampling:</div>
                    <div className="text-sm font-bold text-white">
                        Saved <span className="text-green-300">{savings.words} words</span> & <span className="text-green-300">{savings.time}s</span> per task
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
