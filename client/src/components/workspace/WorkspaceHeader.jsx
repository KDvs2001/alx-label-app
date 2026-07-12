import React from 'react';
// lucide-react provides tree-shakable SVG icon components
// CITATION: lucide-react - SVG icon library as React components
// SOURCE: Lucide (n.d.). "lucide-react"
// URL: https://lucide.dev/guide/packages/lucide-react
import { Brain, BookOpen, Save, User, ArrowLeft, Download, CheckCircle, Pause, Play } from 'lucide-react';

/**
 * WorkspaceHeader Component
 * Global control strip. Enforces experimental timeline constraints and data export requirements.
 */
const WorkspaceHeader = ({ historyCount, onToggleGuidelines, contestantId, onSaveAndExit, onExport, onEndSession, isPaused, onTogglePause, onAutoLabel, isAutoLabeling, autoLabelThreshold, datasetConfig }) => {
    return (
        <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                    <Brain size={24} className="text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-bold">Research Workspace</h1>
                    <p className="text-xs text-slate-400">
                        Dataset: {datasetConfig?.datasetName ? (datasetConfig.datasetName === 'ag_news' ? 'AG News (Categorization)' : datasetConfig.datasetName === 'rotten_tomatoes' ? 'Rotten Tomatoes (Sentiment)' : datasetConfig.datasetName === 'custom' ? 'Custom Dataset' : datasetConfig.datasetName) : 'IMDB (Sentiment Analysis)'}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                {/* only show the contestant badge if a contestant ID has been set */}
                {contestantId && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 text-slate-300 text-xs rounded border border-slate-700">
                        <User size={14} />
                        <span className="font-mono font-bold">{contestantId}</span>
                    </div>
                )}
                {/* window.location.href navigates the browser back to the landing page */}
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
                {contestantId && onTogglePause && (
                    <button
                        onClick={onTogglePause}
                        className={`flex items-center gap-2 px-3 py-1.5 text-white text-xs rounded border transition-colors font-bold ${
                            isPaused
                                ? 'bg-amber-600 hover:bg-amber-700 border-amber-700 animate-pulse'
                                : 'bg-slate-700 hover:bg-slate-600 border-slate-600'
                        }`}
                    >
                        {isPaused ? <Play size={14} /> : <Pause size={14} />}
                        {isPaused ? 'Resume' : 'Pause'}
                    </button>
                )}
                {/* short-circuit: only show Save & Exit when both contestantId and callback exist */}
                {contestantId && onSaveAndExit && (
                    <button
                        onClick={onSaveAndExit}
                        className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded border border-green-700 transition-colors font-bold"
                    >
                        <Save size={14} /> Save & Exit
                    </button>
                )}
                {/* tour-step-feedback-btn is the CSS class that react-joyride targets for the tour spotlight */}
                {contestantId && (
                    <button
                        onClick={onEndSession}
                        className="tour-step-feedback-btn flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded border border-blue-700 transition-colors font-bold"
                    >
                        <CheckCircle size={14} /> Finish Session
                    </button>
                )}
                {contestantId && onAutoLabel && (
                    <button
                        onClick={onAutoLabel}
                        disabled={isAutoLabeling}
                        className="flex items-center gap-2 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-900 text-white text-xs rounded border border-rose-700 transition-colors font-bold transition-all disabled:opacity-50"
                        title={`Automatically label tasks where the model confidence is >= ${autoLabelThreshold ? (autoLabelThreshold * 100).toFixed(0) : '95'}%`}
                    >
                        <Brain size={14} className={isAutoLabeling ? "animate-spin" : ""} /> 
                        {isAutoLabeling ? 'Auto-Labeling...' : `Auto-Label (>=${autoLabelThreshold ? (autoLabelThreshold * 100).toFixed(0) : '95'}%)`}
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
                {/* annotation counter gives the evaluator a sense of progress through the session */}
                <div className="text-right border-l border-slate-700 pl-4">
                    <div className="text-2xl font-mono font-bold text-blue-400">{historyCount}</div>
                    <div className="text-xs text-slate-500">Samples Annotated</div>
                </div>
            </div>
        </div>
    );
};

export default WorkspaceHeader;
