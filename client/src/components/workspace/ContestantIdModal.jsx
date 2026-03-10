import React from 'react';
// lucide-react provides tree-shakable SVG icon components
// CITATION: lucide-react - SVG icon library as React components
// SOURCE: Lucide (n.d.). "lucide-react"
// URL: https://lucide.dev/guide/packages/lucide-react
import { X, User, AlertCircle, ArrowLeft } from 'lucide-react';

/**
 * ContestantIdModal Component
 * Session entry point. Masks ML cold-start latency during typing.
 */
const ContestantIdModal = ({ isOpen, onSubmit, onClose, existingSession }) => {
    // local state for the input field and UI flags
    // CITATION: useState - React hook for local component state
    // SOURCE: React (n.d.). "useState"
    // URL: https://react.dev/reference/react/useState
    const [contestantId, setContestantId] = React.useState('');
    const [showResumePrompt, setShowResumePrompt] = React.useState(false);
    const [isChecking, setIsChecking] = React.useState(false);
    const [mlReady, setMlReady] = React.useState(false);
    const [warmupAttempts, setWarmupAttempts] = React.useState(0);

    // wakes up the HF Space early so the user doesn't wait
    // useEffect runs the polling side-effect and returns a cleanup that cancels it on unmount
    // CITATION: useEffect - run side effects and clean them up on unmount
    // SOURCE: React (n.d.). "useEffect"
    // URL: https://react.dev/reference/react/useEffect
    React.useEffect(() => {
        if (!isOpen || mlReady) return;
        const API_URL = import.meta.env.VITE_ML_API_URL || "/ml";
        let cancelled = false;

        const pollWarmup = async () => {
            while (!cancelled) {
                try {
                    // AbortSignal.timeout gives the fetch a hard 15s deadline before it throws
                    // CITATION: AbortSignal.timeout() - auto-cancel a fetch after N milliseconds
                    // SOURCE: MDN Web Docs (n.d.). "AbortSignal.timeout()"
                    // URL: https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/timeout_static
                    const res = await fetch(`${API_URL}/health`, { signal: AbortSignal.timeout(15000) });
                    if (res.ok && !cancelled) {
                        setMlReady(true);
                        return; // Service is alive, stop polling
                    }
                } catch {
                    // Space still waking - retry
                }
                if (!cancelled) {
                    // functional updater form: prev => prev + 1 avoids stale closures in async loops
                    // CITATION: functional updates - use the previous state when the next depends on it
                    // SOURCE: React (n.d.). "useState - Updating state based on the previous state"
                    // URL: https://react.dev/reference/react/useState#updating-state-based-on-the-previous-state
                    setWarmupAttempts(prev => prev + 1);
                    // wrapping setTimeout in a Promise lets us use await to pause the loop
                    // CITATION: promisified setTimeout - create an awaitable delay in async functions
                    // SOURCE: Stack Overflow. "What is the JavaScript version of sleep()?"
                    // URL: https://stackoverflow.com/questions/951021/what-is-the-javascript-version-of-sleep
                    await new Promise(r => setTimeout(r, 5000));
                }
            }
        };
        pollWarmup();

        // cleanup function: setting cancelled = true stops the polling loop when the component unmounts
        return () => { cancelled = true; };
    }, [isOpen, mlReady]);

    if (!isOpen) return null;

    // preventDefault stops the browser from doing a full page reload on form submit
    // CITATION: Event.preventDefault() - stop the browser's default form submission
    // SOURCE: MDN Web Docs (n.d.). "Event.preventDefault()"
    // URL: https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!contestantId.trim() || isChecking) return;

        setIsChecking(true);
        // Validates contestant IDs in MongoDB to handle session resuming
        try {
            // fetch the session endpoint to check if this contestant has an existing session
            // CITATION: Fetch API - make HTTP requests from the browser
            // SOURCE: MDN Web Docs (n.d.). "fetch()"
            // URL: https://developer.mozilla.org/en-US/docs/Web/API/fetch
            const SERVER_URL = (import.meta.env.VITE_SERVER_URL || "").replace(/\/$/, "");
            const response = await fetch(`${SERVER_URL}/api/session/load/${contestantId}`);
            // response.json() parses the HTTP response body as JSON
            // CITATION: Response.json() - read the response body and parse it as JSON
            // SOURCE: MDN Web Docs (n.d.). "Response.json()"
            // URL: https://developer.mozilla.org/en-US/docs/Web/API/Response/json
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
        // clear frontend session storage and proceed
        // all ML + backend reset logic is centralized in ResearchWorkspace.handleContestantIdSubmit
        // CITATION: sessionStorage.clear() - wipe all key/value pairs from session storage
        // SOURCE: MDN Web Docs (n.d.). "Storage.clear()"
        // URL: https://developer.mozilla.org/en-US/docs/Web/API/Storage/clear
        sessionStorage.clear();
        localStorage.removeItem('cal_log_tour_seen');
        onSubmit(contestantId, 'fresh');
    };

    // if the server found an existing session, show the resume/fresh prompt instead of the entry form
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
                    {/* only render the close button if the parent passed an onClose callback */}
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
                            // controlled component: React owns the input value, onChange syncs it back to state
                            // CITATION: controlled components - React state as the single source of truth for inputs
                            // SOURCE: React (n.d.). "Sharing State Between Components"
                            // URL: https://react.dev/learn/sharing-state-between-components
                            onChange={(e) => setContestantId(e.target.value)}
                            placeholder="e.g., CONTESTANT001"
                            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                            autoFocus
                            required
                        />
                    </div>

                    <div className="flex gap-3">
                        {/* window.location.href navigates the browser to the landing page */}
                        <button
                            type="button"
                            onClick={() => window.location.href = '/'}
                            className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                            <ArrowLeft size={18} />
                            Back
                        </button>
                        {/* disabled greys out the button while we check the server */}
                        {/* ternary in the template literal swaps between a dim "waiting" style and the normal style */}
                        <button
                            type="submit"
                            disabled={isChecking}
                            className={`flex-1 px-6 py-3 font-bold text-white rounded-xl transition-all ${isChecking ? 'bg-blue-600/50 cursor-wait' : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                        >
                            {/* swap the button label depending on whether we're mid-request */}
                            {isChecking ? 'Checking...' : 'Continue'}
                        </button>
                    </div>
                </form>

                <p className="text-xs text-slate-500 mt-4 text-center">
                    Your progress will be automatically saved
                </p>

                {/* ML Service Warmup Status Indicator */}
                {/* warmup indicator: ternary switches between a green "ready" dot and amber "connecting" pulse */}
                <div className={`mt-3 flex items-center justify-center gap-2 text-xs transition-all duration-500 ${mlReady ? 'text-green-400' : 'text-amber-400'}`}>
                    {mlReady ? (
                        <>
                            <div className="w-2 h-2 rounded-full bg-green-400" />
                            <span>ML Service Ready ✓</span>
                        </>
                    ) : (
                        <>
                            {/* animate-pulse gives the dot a breathing effect while the service is still waking */}
                            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                            <span>
                                {/* template literal shows which polling attempt we're on */}
                                {warmupAttempts === 0
                                    ? 'Connecting to ML Service...'
                                    : `Waking up ML Service... (attempt ${warmupAttempts + 1})`
                                }
                            </span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContestantIdModal;
