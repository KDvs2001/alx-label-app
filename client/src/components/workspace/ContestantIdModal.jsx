import React from 'react';
import { X, User, AlertCircle, ArrowLeft } from 'lucide-react';

const ContestantIdModal = ({ isOpen, onSubmit, onClose, existingSession }) => {
    const [contestantId, setContestantId] = React.useState('');
    const [showResumePrompt, setShowResumePrompt] = React.useState(false);
    const [isChecking, setIsChecking] = React.useState(false);
    const [mlReady, setMlReady] = React.useState(false);

    // WARMUP: Ping the ML service as soon as the modal opens to wake HF Spaces
    React.useEffect(() => {
        if (!isOpen) return;
        const API_URL = import.meta.env.VITE_ML_API_URL || "/ml";
        const warmup = async () => {
            try {
                const res = await fetch(`${API_URL}/health`, { signal: AbortSignal.timeout(45000) });
                if (res.ok) setMlReady(true);
            } catch { /* Space still waking — will be ready by /predict time */ }
        };
        warmup();
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!contestantId.trim() || isChecking) return;

        setIsChecking(true);
        // Check if session exists
        try {
            const SERVER_URL = (import.meta.env.VITE_SERVER_URL || "").replace(/\/$/, "");
            const response = await fetch(`${SERVER_URL}/api/session/load/${contestantId}`);
            const data = await response.json();

            setIsChecking(false);
            if (data.exists) {
                setShowResumePrompt(true);
            } else {
                // New session
                onSubmit(contestantId, null);
            }
        } catch (error) {
            console.error('Error checking session:', error);
            setIsChecking(false);
            // Proceed as new session
            onSubmit(contestantId, null);
        }
    };

    const handleResume = () => {
        onSubmit(contestantId, 'resume');
    };

    const handleFresh = () => {
        // Clear frontend session storage and proceed
        // All ML + backend reset logic is centralized in ResearchWorkspace.handleContestantIdSubmit
        sessionStorage.clear();
        localStorage.removeItem('cal_log_tour_seen');
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
                            disabled={isChecking}
                            className={`flex-1 px-6 py-3 font-bold text-white rounded-xl transition-all ${isChecking ? 'bg-blue-600/50 cursor-wait' : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                        >
                            {isChecking ? 'Checking...' : 'Continue'}
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
