import React from 'react';
import { X, User, AlertCircle, ArrowLeft } from 'lucide-react';

const ContestantIdModal = ({ isOpen, onSubmit, onClose, existingSession }) => {
    const [contestantId, setContestantId] = React.useState('');
    const [showResumePrompt, setShowResumePrompt] = React.useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!contestantId.trim()) return;

        // Check if session exists
        try {
            const response = await fetch(`/api/session/load/${contestantId}`);
            const data = await response.json();

            if (data.exists) {
                setShowResumePrompt(true);
            } else {
                // New session
                onSubmit(contestantId, null);
            }
        } catch (error) {
            console.error('Error checking session:', error);
            // Proceed as new session
            onSubmit(contestantId, null);
        }
    };

    const handleResume = () => {
        onSubmit(contestantId, 'resume');
    };

    const handleFresh = async () => {
        try {
            // Reset backend state for new contestant
            const ML_URL = import.meta.env.VITE_ML_API_URL || "/ml";
            const resetRes = await fetch(`${ML_URL}/reset`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (resetRes.ok) {
                console.log('✅ Backend state reset for new contestant');
            } else {
                console.error('Failed to reset backend state');
            }
        } catch (error) {
            console.error('Error resetting backend:', error);
        }

        // Clear frontend session storage and proceed
        sessionStorage.clear();
        onSubmit(contestantId, 'fresh');
    };

    if (showResumePrompt) {
        return (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
                <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
                    <div className="flex items-center gap-3 mb-6">
                        <AlertCircle className="text-blue-400" size={28} />
                        <h2 className="text-2xl font-bold text-white">Session Found</h2>
                    </div>

                    <p className="text-slate-300 mb-6">
                        We found an existing session for <span className="font-bold text-blue-400">{contestantId}</span>.
                        Would you like to resume where you left off or start fresh?
                    </p>

                    <div className="flex gap-3">
                        <button
                            onClick={handleResume}
                            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all"
                        >
                            Resume Session
                        </button>
                        <button
                            onClick={handleFresh}
                            className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all"
                        >
                            Start Fresh
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <User className="text-blue-400" size={28} />
                        <h2 className="text-2xl font-bold text-white">Enter Contestant ID</h2>
                    </div>
                    {onClose && (
                        <button onClick={onClose} className="text-slate-400 hover:text-white transition">
                            <X size={24} />
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Contestant ID
                        </label>
                        <input
                            type="text"
                            value={contestantId}
                            onChange={(e) => setContestantId(e.target.value)}
                            placeholder="e.g., CONTESTANT001"
                            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                            autoFocus
                            required
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => window.location.href = '/'}
                            className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                            <ArrowLeft size={18} />
                            Back
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all"
                        >
                            Continue
                        </button>
                    </div>
                </form>

                <p className="text-xs text-slate-500 mt-4 text-center">
                    Your progress will be automatically saved
                </p>
            </div>
        </div>
    );
};

export default ContestantIdModal;
