
import React from 'react';
import { BookOpen, X } from 'lucide-react';

const GuidelinesPanel = ({ isOpen, onClose }) => {
    return (
        <div className={`fixed inset-y-0 right-0 w-96 bg-slate-900 shadow-2xl border-l border-slate-800 transform transition-transform duration-300 z-50 p-6 overflow-y-auto ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-blue-400 flex items-center gap-2">
                    <BookOpen size={20} /> Guidelines
                </h2>
                <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded">
                    <X size={20} className="text-slate-400" />
                </button>
            </div>

            <div className="space-y-6 text-sm text-slate-300">
                <section>
                    <h3 className="font-bold text-white mb-2 border-b border-slate-700 pb-1">1. Sentiment Definition</h3>
                    <p className="mb-2">Determine if the review expresses a <span className="text-green-400">Positive</span> or <span className="text-red-400">Negative</span> opinion about the movie.</p>
                    <ul className="list-disc pl-4 space-y-1 text-slate-400">
                        <li>Focus on the <b>author's opinion</b>, not the plot description.</li>
                        <li>Sarcasm should be labeled based on the <i>intended</i> meaning.</li>
                    </ul>
                </section>

                <section>
                    <h3 className="font-bold text-green-400 mb-2 border-b border-slate-700 pb-1">Positive Indicators (Press 2)</h3>
                    <ul className="list-disc pl-4 space-y-1 text-slate-400">
                        <li>"Masterpiece", "Must-see", "Brilliant acting"</li>
                        <li>"Pleasantly surprised", "Touching", "Great direction"</li>
                        <li>Rating: 7/10 or higher (if mentioned)</li>
                    </ul>
                </section>

                <section>
                    <h3 className="font-bold text-red-400 mb-2 border-b border-slate-700 pb-1">Negative Indicators (Press 1)</h3>
                    <ul className="list-disc pl-4 space-y-1 text-slate-400">
                        <li>"Boring", "Waste of time", "Poor writing"</li>
                        <li>"Unbelievable", "Flat characters", "Disappointment"</li>
                        <li>Rating: 4/10 or lower (if mentioned)</li>
                    </ul>
                </section>

                <section>
                    <h3 className="font-bold text-white mb-2 border-b border-slate-700 pb-1">Edge Cases</h3>
                    <div className="bg-slate-800 p-3 rounded text-xs border border-slate-700">
                        <p className="mb-2"><b>Can't Decide?</b></p>
                        <p>If the review is mixed (e.g., "Good acting, bad plot"), pick the <b>dominant sentiment</b>. If truly neutral, skip or label as Negative (strict).</p>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default GuidelinesPanel;
