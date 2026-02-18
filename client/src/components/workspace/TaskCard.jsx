
import React from 'react';
import { CheckCircle, AlertCircle, Activity, Clock } from 'lucide-react';

const TaskCard = ({ currentTask, submitting, onAnnotate, onRetry, elapsedTime }) => {
    // Preprocess text for display (remove HTML tags, clean whitespace)
    const cleanText = (text) => {
        if (!text) return "No Text Found";

        // Remove HTML tags like <br />, <br/>, <br>, etc.
        let cleaned = text.replace(/<br\s*\/?>/gi, ' ');
        cleaned = cleaned.replace(/<[^>]+>/g, ''); // Remove any other HTML tags

        // Remove extra whitespace
        cleaned = cleaned.replace(/\s+/g, ' ').trim();

        // Remove special characters but keep basic punctuation
        cleaned = cleaned.replace(/[^\w\s.,!?'-]/g, '');

        return cleaned;
    };

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

    const displayText = cleanText(currentTask?.data?.text || currentTask?.text);

    return (
        <div className="flex-1 bg-white text-slate-900 rounded-2xl p-8 shadow-2xl flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-500" />

            <div className="flex justify-between items-center mb-4">
                <h2 className="text-slate-400 font-bold text-xs uppercase tracking-wider">Task ID: {currentTask?.id}</h2>

                {/* Stopwatch */}
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

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={() => onAnnotate('Negative')}
                    disabled={submitting}
                    className="p-4 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-xl border border-red-300 transition-all flex items-center justify-center gap-2 group"
                >
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
