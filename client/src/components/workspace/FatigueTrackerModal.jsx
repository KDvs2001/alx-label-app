import React from 'react';
import { Coffee, Play, PauseCircle } from 'lucide-react';

/**
 * FatigueTrackerModal Component
 * Pauses the annotation timer to prevent skewed cost-model calculations when the user is idle.
 */
const FatigueTrackerModal = ({ isOpen, onResume }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Blur */}
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"></div>

            {/* Modal Box */}
            <div className="bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden max-w-lg w-full relative z-10 animate-in fade-in zoom-in duration-300">
                {/* Header Strip */}
                <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-6 py-4 flex items-center gap-3">
                    <Coffee className="text-yellow-400" size={24} />
                    <h2 className="text-xl font-bold bg-gradient-to-r from-yellow-200 to-yellow-400 bg-clip-text text-transparent">
                        Are you still there?
                    </h2>
                </div>

                {/* Alerts user of pause to maintain experimental data integrity */}
                <div className="p-6 space-y-4">
                    <p className="text-slate-300 text-lg leading-relaxed">
                        We noticed you've been on this single task much longer than your usual reading pace.
                    </p>

                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                        <div className="flex items-start gap-3">
                            <PauseCircle className="text-blue-400 mt-1 flex-shrink-0" size={20} />
                            <p className="text-sm text-slate-400">
                                <strong className="text-slate-200">The annotation timer has been paused.</strong><br />
                                This ensures the CAL-Log cost model mathematics remain accurate and aren't skewed by breaks or distractions.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Resumes tracking ensuring active time accurately reflects task difficulty */}
                <div className="bg-slate-950 p-6 flex justify-end gap-4 border-t border-slate-800">
                    <button
                        onClick={onResume}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold transition-colors shadow-lg shadow-blue-900/20"
                    >
                        <Play size={18} /> Resume Annotation
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FatigueTrackerModal;
