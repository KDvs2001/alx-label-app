import React from 'react';
import { Save, X, AlertTriangle } from 'lucide-react';

const SaveConfirmationModal = ({ isOpen, onSave, onDiscard }) => {
    if (!isOpen) return null;

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

                <div className="space-y-3">
                    <button
                        onClick={onSave}
                        className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        <Save size={20} />
                        Yes, Save My Progress
                    </button>
                    <button
                        onClick={onDiscard}
                        className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        <X size={20} />
                        No, Discard Everything
                    </button>
                </div>

                <p className="text-xs text-slate-500 mt-4 text-center">
                    Both options will redirect you to enter a contestant ID for a fresh start
                </p>
            </div>
        </div>
    );
};

export default SaveConfirmationModal;
