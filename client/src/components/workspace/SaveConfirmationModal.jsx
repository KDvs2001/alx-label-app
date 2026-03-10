import React from 'react';
// lucide-react provides tree-shakable SVG icon components
// CITATION: lucide-react - SVG icon library as React components
// SOURCE: Lucide (n.d.). "lucide-react"
// URL: https://lucide.dev/guide/packages/lucide-react
import { Save, X, AlertTriangle } from 'lucide-react';

/**
 * SaveConfirmationModal Component
 * Prevents accidental loss of behavioral metadata (Alpha/Beta state) during browser reloads.
 */
const SaveConfirmationModal = ({ isOpen, onSave, onDiscard }) => {
    // guard clause: skip rendering when the modal is not active
    if (!isOpen) return null;

    // full-screen overlay with backdrop blur to focus the user on the save decision
    // CITATION: CSS backdrop-filter: blur() - frosted glass effect behind modals
    // SOURCE: MDN Web Docs (n.d.). "backdrop-filter"
    // URL: https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                    <AlertTriangle className="text-yellow-400" size={28} />
                    <h2 className="text-2xl font-bold text-white">Save Your Work?</h2>
                </div>

                <p className="text-slate-300 mb-6">
                    You're about to refresh. Do you want to save your current progress before starting fresh?
                </p>

                {/* vertical stack layout so the primary action (save) is visually above discard */}
                <div className="space-y-3">
                    {/* onSave callback triggers session persistence in ResearchWorkspace before redirect */}
                    {/* transition-all smoothly animates the background colour change on hover */}
                    {/* flex + items-center + gap-2 aligns the Save icon next to the button text */}
                    <button
                        onClick={onSave}
                        className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        <Save size={20} />
                        Yes, Save My Progress
                    </button>
                    {/* onDiscard skips the save step and clears session data */}
                    <button
                        onClick={onDiscard}
                        className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        <X size={20} />
                        No, Discard Everything
                    </button>
                </div>

                {/* short disclaimer so the evaluator knows both paths lead to a fresh contestant ID entry */}
                <p className="text-xs text-slate-500 mt-4 text-center">
                    Both options will redirect you to enter a contestant ID for a fresh start
                </p>
            </div>
        </div>
    );
};

export default SaveConfirmationModal;
