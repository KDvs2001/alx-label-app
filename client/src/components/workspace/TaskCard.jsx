
import React from 'react';
// lucide-react provides tree-shakable SVG icon components
// CITATION: lucide-react - SVG icon library as React components
// SOURCE: Lucide (n.d.). "lucide-react"
// URL: https://lucide.dev/guide/packages/lucide-react
import { CheckCircle, AlertCircle, Activity, Clock } from 'lucide-react';

/**
 * TaskCard Component
 * Core annotation interface for the CAL-Log framework.
 * This component intentionally isolates the binary classification action from the broader statistical
 * dashboards (Spy Window) to strictly minimize cognitive load and preserve the evaluator's "flow state".
 * High signal-to-noise ratio is maintained to ensure the measured 'time_taken' accurately reflects 
 * reading comprehension rather than UI navigation time.
 */
const TaskCard = ({ currentTask, submitting, onAnnotate, onRetry, elapsedTime }) => {
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
              * binary classification buttons bound to keyboard shortcuts (1 and 2)
              * disabled={submitting} prevents double-clicks while the server processes the annotation
              */}
            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={() => onAnnotate('Negative')}
                    disabled={submitting}
                    className="p-4 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-xl border border-red-300 transition-all flex items-center justify-center gap-2 group"
                >
                    {/* group-hover:scale-110 makes the icon grow when the user hovers the button */}
                    {/* CITATION: CSS transform: scale() - grow or shrink an element on hover */}
                    {/* SOURCE: MDN Web Docs (n.d.). "scale()" */}
                    {/* URL: https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/scale */}
                    <AlertCircle size={20} className="group-hover:scale-110 transition" />
                    <span>Negative</span>
                    <span className="text-xs opacity-70 ml-1">(Press 1)</span>
                </button>
                <button
                    onClick={() => onAnnotate('Positive')}
                    disabled={submitting}
                    className="p-4 bg-green-100 hover:bg-green-200 text-green-700 font-bold rounded-xl border border-green-300 transition-all flex items-center justify-center gap-2 group"
                >
                    <span>Positive</span>
                    <span className="text-xs opacity-70 ml-1">(Press 2)</span>
                    <CheckCircle size={20} className="group-hover:scale-110 transition" />
                </button>
            </div>
        </div>
    );
};

export default TaskCard;
