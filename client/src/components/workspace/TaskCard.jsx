
import React from 'react';
// lucide-react provides tree-shakable SVG icon components
// CITATION: lucide-react - SVG icon library as React components
// SOURCE: Lucide (n.d.). "lucide-react"
// URL: https://lucide.dev/guide/packages/lucide-react
import { CheckCircle, AlertCircle, Activity, Clock, Tag } from 'lucide-react';

/**
 * Per-slot visual styles so the first label is always visually distinct from the second,
 * and any additional labels get sensible colours.
 * This intentionally avoids hardcoding Negative=red / Positive=green so the UI
 * stays meaningful for ANY domain (e.g. spam/ham, relevant/irrelevant, toxic/safe).
 */
const LABEL_STYLES = [
    {
        bg: 'bg-rose-100 hover:bg-rose-200 border-rose-300 text-rose-700',
        icon: <AlertCircle size={20} className="group-hover:scale-110 transition shrink-0" />,
    },
    {
        bg: 'bg-green-100 hover:bg-green-200 border-green-300 text-green-700',
        icon: <CheckCircle size={20} className="group-hover:scale-110 transition shrink-0" />,
    },
    {
        bg: 'bg-blue-100 hover:bg-blue-200 border-blue-300 text-blue-700',
        icon: <Tag size={20} className="group-hover:scale-110 transition shrink-0" />,
    },
    {
        bg: 'bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-700',
        icon: <Tag size={20} className="group-hover:scale-110 transition shrink-0" />,
    },
    {
        bg: 'bg-purple-100 hover:bg-purple-200 border-purple-300 text-purple-700',
        icon: <Tag size={20} className="group-hover:scale-110 transition shrink-0" />,
    },
];

/**
 * TaskCard Component
 * Core annotation interface for the CAL-Log framework.
 * This component intentionally isolates the binary (or multi-class) classification action
 * from the broader statistical dashboards (Spy Window) to strictly minimize cognitive load
 * and preserve the evaluator's "flow state".
 * High signal-to-noise ratio is maintained to ensure the measured 'time_taken' accurately
 * reflects reading comprehension rather than UI navigation time.
 *
 * @param {string[]} labels  - Array of label strings from the user's dataset config.
 *                             Falls back to ['Class A', 'Class B'] if not provided.
 */
const TaskCard = ({ currentTask, submitting, onAnnotate, onRetry, elapsedTime, labels }) => {
    // Resolve the actual label list — never fall back to hardcoded Negative/Positive
    const resolvedLabels = (Array.isArray(labels) && labels.length >= 2)
        ? labels
        : ['Class A', 'Class B'];

    // strips HTML tags and noise from the raw dataset text so the reading time measurement
    // reflects actual comprehension rather than time spent parsing broken markup
    const cleanText = (text) => {
        if (!text) return "No Text Found";

        // regex removes <br />, <br/>, <br> and any other HTML tags from the text
        // CITATION: String.replace() with regex - pattern-based string replacement
        // SOURCE: MDN Web Docs (n.d.). "String.prototype.replace()"
        // URL: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace
        let cleaned = text.replace(/<br\s*\/?>/gi, ' ');
        cleaned = cleaned.replace(/<[^>]+>/g, '');

        // collapse multiple spaces into one and trim leading/trailing whitespace
        // CITATION: String.trim() - remove whitespace from both ends of a string
        // SOURCE: MDN Web Docs (n.d.). "String.prototype.trim()"
        // URL: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/trim
        cleaned = cleaned.replace(/\s+/g, ' ').trim();

        // strip stray special characters but keep normal punctuation
        cleaned = cleaned.replace(/[^\w\s.,!?'-]/g, '');

        return cleaned;
    };

    // if there's no task yet, show a loading placeholder with a retry button
    if (!currentTask) {
        return (
            <div className="flex-1 bg-slate-900 rounded-2xl p-8 flex items-center justify-center text-slate-500">
                <div className="text-center">
                    <Activity size={48} className="mx-auto mb-4 opacity-20" />
                    <p>Waiting for tasks...</p>
                    <button
                        onClick={onRetry}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                        Retry Connection
                    </button>
                </div>
            </div>
        );
    }

    // optional chaining tries currentTask.data.text first, falls back to currentTask.text
    const displayText = cleanText(currentTask?.data?.text || currentTask?.text);

    // Choose grid layout based on number of labels
    const gridCols = resolvedLabels.length === 2
        ? 'grid-cols-2'
        : resolvedLabels.length === 3
            ? 'grid-cols-3'
            : 'grid-cols-2';

    return (
        <div className="tour-step-task-card flex-1 bg-white text-slate-900 rounded-2xl p-8 shadow-2xl flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-500" />

            <div className="flex justify-between items-center mb-4">
                <h2 className="text-slate-400 font-bold text-xs uppercase tracking-wider">Task ID: {currentTask?.id}</h2>

                {/* live stopwatch showing how long the evaluator has been reading this task */}
                {/* Math.floor rounds the elapsed seconds down so the display doesn't flicker with decimals */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-300">
                    <Clock size={16} className="text-slate-600" />
                    <span className="font-mono text-sm font-bold text-slate-700">
                        {Math.floor(elapsedTime || 0)}s
                    </span>
                </div>
            </div>

            <div className="overflow-y-auto mb-3 max-h-96">
                <p className="text-xl leading-relaxed font-medium">
                    {displayText}
                </p>
            </div>

            {/*
              * Dynamic label classification buttons bound to keyboard shortcuts (1..N)
              * disabled={submitting} prevents double-clicks while the server processes the annotation
              */}
            <div className={`grid ${gridCols} gap-4`}>
                {resolvedLabels.map((labelName, idx) => {
                    const style = LABEL_STYLES[idx % LABEL_STYLES.length];
                    return (
                        <button
                            key={labelName}
                            onClick={() => onAnnotate(labelName)}
                            disabled={submitting}
                            className={`p-4 ${style.bg} font-bold rounded-xl border transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {idx === 0 && style.icon}
                            <span>{labelName}</span>
                            <span className="text-xs opacity-70 ml-1">(Press {idx + 1})</span>
                            {idx > 0 && style.icon}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default TaskCard;
