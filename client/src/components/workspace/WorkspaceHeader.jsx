import React from 'react';
import { Brain, BookOpen, Save, User, ArrowLeft, Download, CheckCircle } from 'lucide-react';

/**
 * WorkspaceHeader Component
 * Global control strip. Enforces experimental timeline constraints and data export requirements.
 */
const WorkspaceHeader = ({ historyCount, onToggleGuidelines, contestantId, onSaveAndExit, onExport, onEndSession }) => {
    return (
        <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                    <Brain size={24} className="text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-bold">Research Workspace</h1>
                    <p className="text-xs text-slate-400">Dataset: IMDB (Sentiment Analysis)</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                {contestantId && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 text-slate-300 text-xs rounded border border-slate-700">
                        <User size={14} />
                        <span className="font-mono font-bold">{contestantId}</span>
                    </div>
                )}
                <button
                    onClick={() => window.location.href = '/'}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded border border-slate-700 transition-colors"
                >
                    <ArrowLeft size={14} /> Back
                </button>
                <button
                    onClick={onToggleGuidelines}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded border border-slate-700 transition-colors"
                >
                    <BookOpen size={14} /> Guidelines
                </button>
                {contestantId && onSaveAndExit && (
                    <button
                        onClick={onSaveAndExit}
                        className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded border border-green-700 transition-colors font-bold"
                    >
                        <Save size={14} /> Save & Exit
                    </button>
                )}
                {contestantId && (
                    <button
                        onClick={onEndSession}
                        className="tour-step-feedback-btn flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded border border-blue-700 transition-colors font-bold"
                    >
                        <CheckCircle size={14} /> Finish Session
                    </button>
                )}
                {contestantId && onExport && (
                    <button
                        onClick={onExport}
                        className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded border border-purple-700 transition-colors font-bold"
                    >
                        <Download size={14} /> Export Data
                    </button>
                )}
                {/* Real-time progression counter validates active learning throughput to the evaluator */}
                <div className="text-right border-l border-slate-700 pl-4">
                    <div className="text-2xl font-mono font-bold text-blue-400">{historyCount}</div>
                    <div className="text-xs text-slate-500">Samples Annotated</div>
                </div>
            </div>
        </div>
    );
};

export default WorkspaceHeader;
