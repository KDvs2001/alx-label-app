import React from 'react';
import { X, Trophy, AlertTriangle, Dice5 } from 'lucide-react';

/**
 * ShadowAuditModal Component
 * An interactive overlay providing full transparency into the theoretical selections
 * that Random and Entropy-only baselines would have made, serving as direct evaluation proof.
 */
const ShadowAuditModal = ({ isOpen, onClose, metrics }) => {
    if (!isOpen || !metrics) return null;

    const renderStrategyColumn = (title, icon, data, color) => (
        <div className={`flex-1 border-r border-slate-700 last:border-0 p-4 ${color}`}>
            <h4 className="font-bold flex items-center gap-2 mb-4 uppercase text-xs tracking-wider">
                {icon} {title}
            </h4>
            <div className="space-y-3">
                {data?.audit_trail?.map((task) => (
                    <div key={task.id} className="bg-slate-900/50 p-3 rounded text-xs border border-white/5">
                        <div className="flex justify-between text-slate-400 mb-1">
                            <span>ID: {task.id}</span>
                            <span className="font-mono">{task.len}w</span>
                        </div>
                        <p className="text-slate-300 italic mb-2">"{task.text}"</p>
                        <div className="text-[10px] text-slate-500">
                            Entropy: {task.entropy?.toFixed(3)}
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 text-center space-y-2">
                <div>
                    <div className="text-[10px] uppercase text-slate-400">Avg Cost</div>
                    <div className="text-lg font-bold font-mono">{data.estimated_cost}s</div>
                </div>
                <div>
                    <div className="text-[10px] uppercase text-slate-400">Avg Entropy</div>
                    <div className="text-sm font-bold font-mono">{(data.avg_entropy || 0).toFixed(4)}</div>
                </div>
                <div>
                    <div className="text-[10px] uppercase text-green-400">Info Efficiency</div>
                    <div className="text-sm font-bold font-mono text-green-300">{(data.info_efficiency || 0).toFixed(4)}</div>
                    <div className="text-[8px] text-slate-600">bits/sec</div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] backdrop-blur-sm p-10">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl w-full max-w-5xl flex flex-col max-h-full overflow-hidden">

                {/* Header */}
                <div className="p-6 bg-slate-900 border-b border-slate-700 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            Shadow Audit
                        </h2>
                        <p className="text-sm text-slate-400">
                            Verifying what other algorithms <i>would</i> have picked this round.
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition">
                        <X size={24} className="text-slate-400" />
                    </button>
                </div>

                {/* 
                 * Shadow Audit Content Layout:
                 * Uses flexbox columns for a direct side-by-side comparison. 
                 * This granular layout lets us defend CAL-Log by showing exactly *which* 
                 * high-cost instances the Entropy-only model blindly selected, compared 
                 * to CAL-Log's cost-efficient choices.
                 */}
                <div className="flex-1 overflow-y-auto">
                    <div className="flex h-full">
                        {renderStrategyColumn("Random", <Dice5 size={16} />, metrics.random, "text-slate-300")}
                        {renderStrategyColumn("Entropy", <AlertTriangle size={16} />, metrics.entropy, "text-yellow-400")}
                        {renderStrategyColumn("CAL-Log (Yours)", <Trophy size={16} />, metrics.cal_log, "bg-blue-900/10 text-blue-400")}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-950 border-t border-slate-800 text-center text-xs text-slate-500">
                    * Costs are estimated using your current reading speed metadata (Alpha/Beta).
                </div>
            </div>
        </div>
    );
};

export default ShadowAuditModal;
