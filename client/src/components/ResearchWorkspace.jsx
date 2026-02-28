
import React, { useState, useEffect, useRef, useCallback } from 'react';
import WorkspaceHeader from './workspace/WorkspaceHeader';
import GuidelinesPanel from './workspace/GuidelinesPanel';
import TaskCard from './workspace/TaskCard';
import SpyAnalysis from './workspace/SpyAnalysis';
import ContestantIdModal from './workspace/ContestantIdModal';
import SaveConfirmationModal from './workspace/SaveConfirmationModal';
import AlphaBetaImpactPanel from './workspace/AlphaBetaImpactPanel';
import SessionSummary from './workspace/SessionSummary';
import EvaluatorTour from './workspace/EvaluatorTour';
import FatigueTrackerModal from './workspace/FatigueTrackerModal';

const ResearchWorkspace = () => {
    // State
    const [tasks, setTasks] = useState([]);
    const [currentTask, setCurrentTask] = useState(null);
    const [history, setHistory] = useState([]);
    const [selectionLogic, setSelectionLogic] = useState(null);
    const [metrics, setMetrics] = useState({ alpha: 5.0, beta: 3.0, step: 0 });
    const [shadowMetrics, setShadowMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingStage, setLoadingStage] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [showGuidelines, setShowGuidelines] = useState(false);
    const [showAlphaBetaPanel, setShowAlphaBetaPanel] = useState(false);
    const [toast, setToast] = useState(null); // { message, type }

    // Session Management State
    const [contestantId, setContestantId] = useState(null);
    const [annotationCount, setAnnotationCount] = useState(0);
    const [labeledTaskIds, setLabeledTaskIds] = useState([]);
    const [showContestantModal, setShowContestantModal] = useState(true);
    const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
    const [hasUnsavedWork, setHasUnsavedWork] = useState(false);

    // Full annotation log for data export & research analysis
    const [fullAnnotations, setFullAnnotations] = useState([]);

    // Cumulative efficiency
    const [cumulativeTimeSaved, setCumulativeTimeSaved] = useState(0);
    const [cumulativeEntropyCost, setCumulativeEntropyCost] = useState(0);
    const [cumulativeRandomCost, setCumulativeRandomCost] = useState(0);
    const [cumulativeCalLogCost, setCumulativeCalLogCost] = useState(0);

    // Ref to avoid stale closures in async handlers
    const labeledIdsRef = useRef([]);

    // Ref for the current in-flight fetch AbortController
    // This ensures we can cancel stale fetches on re-render, unmount, or new requests
    const fetchControllerRef = useRef(null);

    // Evaluator Tour State
    const [tourActive, setTourActive] = useState(!localStorage.getItem('cal_log_tour_seen'));

    // Fatigue Detection State
    const [annotationTimes, setAnnotationTimes] = useState([]);
    const [isFatigueModalOpen, setIsFatigueModalOpen] = useState(false);
    const [fatiguePauseTime, setFatiguePauseTime] = useState(0);
    const [fatigueTriggeredForTask, setFatigueTriggeredForTask] = useState(false);

    // Session Summary
    const [showSummary, setShowSummary] = useState(false);

    // Cost Model Inputs
    const [interactionLog, setInteractionLog] = useState([]);

    // Task Timer
    const [viewStartTime, setViewStartTime] = useState(Date.now());
    const [elapsedTime, setElapsedTime] = useState(0);

    // API URL (Simulation Server - Env for Cloud, Proxy for Local)
    const API_URL = import.meta.env.VITE_ML_API_URL || "/ml";
    const SERVER_URL = (import.meta.env.VITE_SERVER_URL || "").replace(/\/$/, "");

    // Toast Timer
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    // 1. Initial Load & Polling (only after contestant ID is set)
    useEffect(() => {
        if (contestantId) {
            fetchNextBatch();
            const interval = setInterval(pollMetrics, 2000); // Poll graphs every 2s
            return () => {
                clearInterval(interval);
                // Cancel any in-flight fetch when effect cleans up
                if (fetchControllerRef.current) {
                    fetchControllerRef.current.abort();
                    fetchControllerRef.current = null;
                }
            };
        }
    }, [contestantId]);

    // Check for page refresh/unload
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (contestantId && annotationCount > 0) {
                e.preventDefault();
                setShowSaveConfirmation(true);
                return (e.returnValue = '');
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [contestantId, annotationCount]);

    // Task Timer & Fatigue Check
    useEffect(() => {
        if (!currentTask || tourActive || isFatigueModalOpen) return;

        const timer = setInterval(() => {
            // Need to account for any time we spent paused in the fatigue modal
            const elapsed = ((Date.now() - viewStartTime) - fatiguePauseTime) / 1000;
            setElapsedTime(elapsed);

            // Fatigue Check Logic: Only check if they've done at least 3 tasks to get a baseline
            if (annotationTimes.length >= 3) {
                // Ignore the top 20% longest times to prevent outliers from skewing the baseline
                const sortedTimes = [...annotationTimes].sort((a, b) => a - b);
                const validTimes = sortedTimes.slice(0, Math.floor(sortedTimes.length * 0.8));
                const sum = validTimes.reduce((acc, val) => acc + val, 0);
                const avgSeconds = sum / validTimes.length;

                // If current elapsed time is 5x the average, trigger fatigue popup
                // Set a sensible minimum bar of 30 seconds just in case their average is super fast.
                const threshold = Math.max(avgSeconds * 5, 30);

                if (elapsed > threshold && !isFatigueModalOpen && !fatigueTriggeredForTask) {
                    setIsFatigueModalOpen(true);
                    setFatigueTriggeredForTask(true);
                }
            }

        }, 1000);

        return () => clearInterval(timer);
    }, [currentTask, viewStartTime, tourActive, isFatigueModalOpen, annotationTimes, fatiguePauseTime, fatigueTriggeredForTask]);

    // Reset timer when task changes
    useEffect(() => {
        if (currentTask) {
            setViewStartTime(Date.now());
            setElapsedTime(0);
            setFatiguePauseTime(0); // Reset paused accumulation
            setFatigueTriggeredForTask(false); // Enable fatigue warning for the new task
        }
    }, [currentTask]);


    const fetchNextBatch = async (retryCount = 0) => {
        setLoading(true);
        setLoadingStage(0);

        // Progressive loading messages (advance every 15s to cover 90s cold-start)
        const stageTimer = setInterval(() => {
            setLoadingStage(prev => Math.min(prev + 1, 4));
        }, 15000);

        try {
            // Abort any previous in-flight fetch before starting a new one
            if (fetchControllerRef.current) {
                fetchControllerRef.current.abort();
            }

            const controller = new AbortController();
            fetchControllerRef.current = controller;

            // Timeout: 90s to cover full HF Spaces cold boot (typically 60-90s)
            const timeout = setTimeout(() => controller.abort(), 90000);

            const rankRes = await fetch(`${API_URL}/predict`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    labeled_task_ids: labeledIdsRef.current
                }),
                signal: controller.signal
            });
            clearTimeout(timeout);

            // If this controller was superseded by a newer request, discard results
            if (fetchControllerRef.current !== controller) {
                clearInterval(stageTimer);
                return;
            }

            const data = await rankRes.json();
            const ranked = Array.isArray(data) ? data : (data.tasks || []);
            const shadows = Array.isArray(data) ? null : data.shadow_metrics;

            if (ranked.length > 0) {
                setTasks(ranked);
                setCurrentTask(ranked[0]);
                setShadowMetrics(shadows);
                fetchSpySelection();
            } else {
                setToast({ message: "All tasks have been labeled!", type: "success" });
            }
        } catch (e) {
            // Silently ignore AbortErrors, these are expected when:
            // - A new fetchNextBatch call supersedes an old one
            // - The component unmounts or the effect re-runs (e.g. tab reactivation)
            // - The 25s timeout fires on an idle/slow service
            if (e.name === 'AbortError') {
                clearInterval(stageTimer);
                return; // Don't retry, don't show errors, this is intentional cancellation
            }

            console.error("Failed to fetch tasks from ML service", e);
            // 4 retries with exponential backoff: 3s, 6s, 12s, 20s
            if (retryCount < 4) {
                const backoffDelays = [3000, 6000, 12000, 20000];
                setLoadingStage(retryCount < 2 ? 2 : 3);
                setTimeout(() => fetchNextBatch(retryCount + 1), backoffDelays[retryCount]);
                return;
            }
            setToast({ message: "ML service unavailable. Please try refreshing the page.", type: "error" });
        }
        clearInterval(stageTimer);
        setLoading(false);
    };


    const fetchSpySelection = async () => {
        try {
            // Read from API (formerly file)
            const res = await fetch(`${API_URL}/spy/selection`);
            const data = await res.json();
            setSelectionLogic(data);
        } catch (e) {
            console.error("No spy selection data");
        }
    };

    const pollMetrics = async () => {
        try {
            const histRes = await fetch(`${API_URL}/spy/history`);
            const histData = await histRes.json();
            setHistory(histData);

            const mRes = await fetch(`${API_URL}/health`);
            const mData = await mRes.json();

            // Also fetch cumulative costs from /spy/metrics
            let cumulativeCosts = null;
            try {
                const costRes = await fetch(`${API_URL}/spy/metrics`);
                const costData = await costRes.json();
                cumulativeCosts = costData.cumulative_costs || null;
            } catch (e) { /* ignore */ }

            if (mData.status === 'ok') {
                setMetrics({
                    alpha: mData.alpha,
                    beta: mData.beta,
                    step: history.length * 5,
                    accuracy_history: mData.accuracy_history,
                    cumulative_costs: cumulativeCosts
                });
            }
        } catch (e) {
            // Ignore poll errors
        }
    };

    const handleAnnotate = async (label) => {
        if (!currentTask || submitting) return;
        setSubmitting(true);

        const timeTaken = ((Date.now() - viewStartTime) - fatiguePauseTime) / 1000;
        const taskText = currentTask.data?.text || currentTask.text;
        const textLength = taskText.split(" ").length;

        // 1. INSTANT UI UPDATE (optimistic)
        // Move to next task IMMEDIATELY so the user sees no delay
        const nextTasks = tasks.slice(1);
        if (nextTasks.length > 0) {
            setTasks(nextTasks);
            setCurrentTask(nextTasks[0]);
        }

        // Update labeled IDs immediately (fixes stale-closure bug)
        const newLabeledIds = [...labeledIdsRef.current, currentTask.id];
        labeledIdsRef.current = newLabeledIds;
        setLabeledTaskIds(newLabeledIds);
        const newCount = annotationCount + 1;
        setAnnotationCount(newCount);

        // Compute incremental savings right away if we have shadow metrics for this task
        let incrementalTimeSaved = 0;
        let incrementalEntropyCost = 0;
        if (shadowMetrics && shadowMetrics.entropy && shadowMetrics.cal_log && shadowMetrics.random) {
            const entropyCost = shadowMetrics.entropy.estimated_cost || 0;
            const callogCost = shadowMetrics.cal_log.estimated_cost || 0;
            const randomCost = shadowMetrics.random.estimated_cost || 0;
            incrementalTimeSaved = entropyCost - callogCost;
            incrementalEntropyCost = entropyCost;
            setCumulativeTimeSaved(prev => prev + incrementalTimeSaved);
            setCumulativeEntropyCost(prev => prev + incrementalEntropyCost);
            setCumulativeRandomCost(prev => prev + randomCost);
            setCumulativeCalLogCost(prev => prev + callogCost);
        }

        // Log for Cost Model Inputs table
        const interaction = {
            text: taskText, label, time_taken: timeTaken,
            len: textLength,
            logL: Math.log1p(textLength).toFixed(2),
            time: timeTaken.toFixed(2)
        };
        setInteractionLog(prev => [interaction, ...prev].slice(0, 5));
        setAnnotationTimes(prev => [...prev, timeTaken]);

        // Track full annotation for research export
        const fullAnnotation = {
            taskId: currentTask.id,
            textSnippet: taskText.substring(0, 100),
            wordCount: textLength,
            label,
            timeSeconds: parseFloat(timeTaken.toFixed(2)),
            timestamp: new Date().toISOString(),
            alpha: metrics.alpha,
            beta: metrics.beta,
            annotationIndex: newCount
        };
        setFullAnnotations(prev => [...prev, fullAnnotation]);

        // Re-enable button IMMEDIATELY after optimistic UI update
        setSubmitting(false);

        // 2. ASYNC WORK (non-blocking)
        try {
            const response = await fetch(`${API_URL}/annotate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(interaction)
            });
            const data = await response.json();

            // Check if model was retrained
            if (data.trained) {
                setToast({ message: "Model Retrained! Fetching new tasks...", type: "success" });
                pollMetrics();  // Non-blocking refresh
                fetchNextBatch();  // Uses labeledIdsRef (always fresh)
            }

            // Auto-save session (non-blocking, fire-and-forget)
            saveSession(newCount, newLabeledIds, fullAnnotation);

            // Fetch more tasks if running low
            if (nextTasks.length < 3) {
                fetchNextBatch();
            } else {
                setTimeout(fetchSpySelection, 300);
            }
        } catch (error) {
            console.error('Annotation error:', error);
        }
    };

    // 5. Hotkeys
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (submitting || !currentTask) return;
            if (e.key === '1') handleAnnotate('Negative');
            if (e.key === '2') handleAnnotate('Positive');
            if (e.key === ' ' && !e.target.matches('input, textarea')) {
                e.preventDefault();
                setShowGuidelines(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentTask, submitting]);

    // Session Management Functions
    const saveSession = async (count = annotationCount, ids = labeledTaskIds, newAnnotation = null) => {
        if (!contestantId) return;
        try {
            // Use functional getters to avoid stale closure
            const payload = {
                contestantId,
                annotationCount: count,
                labeledTaskIds: ids,
                cumulativeTimeSaved,
                cumulativeEntropyCost,
                cumulativeRandomCost,
                cumulativeCalLogCost
            };
            // Include full annotation data if provided
            if (newAnnotation) {
                payload.newAnnotation = newAnnotation;
            }
            fetch(`${SERVER_URL}/api/session/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }).catch(err => console.error('Session save failed:', err));
            setHasUnsavedWork(false);
        } catch (error) {
            console.error('Failed to save session:', error);
        }
    };

    const handleContestantIdSubmit = async (id, action) => {

        if (action === 'resume') {
            try {
                const response = await fetch(`${SERVER_URL}/api/session/load/${id}`);
                const data = await response.json();
                if (data.exists) {
                    setAnnotationCount(data.session.annotationCount);
                    setLabeledTaskIds(data.session.labeledTaskIds || []);
                    labeledIdsRef.current = data.session.labeledTaskIds || [];
                    setFullAnnotations(data.session.annotations || []);
                    setCumulativeTimeSaved(data.session.cumulativeTimeSaved || 0);
                    setCumulativeEntropyCost(data.session.cumulativeEntropyCost || 0);
                    setCumulativeRandomCost(data.session.cumulativeRandomCost || 0);
                    setCumulativeCalLogCost(data.session.cumulativeCalLogCost || 0);
                }
            } catch (error) {
                console.error('Failed to load session:', error);
            }
        } else {
            // Both 'fresh' AND null (brand new user) need a full reset
            setAnnotationCount(0);
            setLabeledTaskIds([]);
            labeledIdsRef.current = [];
            setFullAnnotations([]);
            setCumulativeTimeSaved(0);
            setCumulativeEntropyCost(0);
            setCumulativeRandomCost(0);
            setCumulativeCalLogCost(0);
            setHistory([]);
            setMetrics({ alpha: 5.0, beta: 3.0, step: 0 });
            setShadowMetrics(null);
            setSelectionLogic(null);
            setInteractionLog([]);
            setAnnotationTimes([]);
            setIsFatigueModalOpen(false);
            setFatiguePauseTime(0);
            localStorage.removeItem('cal_log_tour_seen');
            setTourActive(true);

            // Reset Node.js session (MongoDB)
            try {
                await fetch(`${SERVER_URL}/api/session/reset/${id}`, {
                    method: 'POST'
                });
            } catch (error) {
                console.error('Failed to reset Node.js session:', error);
            }

            // CRITICAL: Reset ML service state (backbone, cost model, history)
            try {
                await fetch(`${API_URL}/reset`, {
                    method: 'POST'
                });
                // ML service state reset for new annotator
            } catch (error) {
                console.error('Failed to reset ML service:', error);
            }
        }

        setLoading(true);
        setContestantId(id);
        setShowContestantModal(false);
    };

    const handleSaveAndExit = async () => {
        await saveSession();
        setToast({ message: "Progress saved successfully!", type: "success" });
        setTimeout(() => {
            window.location.href = '/';
        }, 1500);
    };


    const handleSaveOnRefresh = async () => {
        await saveSession();
        setShowSaveConfirmation(false);
        setShowContestantModal(true);
    };

    const handleDiscardOnRefresh = () => {
        setShowSaveConfirmation(false);
        setShowContestantModal(true);
    };

    // Data Export for evaluators - downloads full session as JSON
    const exportSessionData = () => {
        const report = {
            meta: {
                contestantId,
                exportedAt: new Date().toISOString(),
                totalAnnotations: annotationCount,
                sessionDuration: fullAnnotations.length > 0
                    ? ((new Date(fullAnnotations[fullAnnotations.length - 1]?.timestamp) -
                        new Date(fullAnnotations[0]?.timestamp)) / 1000).toFixed(0) + 's'
                    : 'N/A'
            },
            costModel: {
                currentAlpha: metrics.alpha,
                currentBeta: metrics.beta,
                formula: 'C(x) = alpha + beta * log(1 + wordCount)'
            },
            annotations: fullAnnotations,
            shadowComparison: shadowMetrics || null
        };
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `callog_session_${contestantId}_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        setToast({ message: 'Session data exported!', type: 'success' });
    };

    if (showSummary) {
        return <SessionSummary
            metrics={metrics}
            history={history}
            shadowMetrics={shadowMetrics}
            annotationCount={annotationCount}
            cumulativeTimeSaved={cumulativeTimeSaved}
            cumulativeEntropyCost={cumulativeEntropyCost}
            cumulativeRandomCost={cumulativeRandomCost}
            cumulativeCalLogCost={cumulativeCalLogCost}
            annotations={fullAnnotations}
            contestantId={contestantId}
            onHome={() => window.location.href = '/'}
            onExport={exportSessionData}
        />;
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans relative overflow-hidden flex flex-col">

            {/* Toast Notification */}
            {toast && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-2 animate-bounce">
                    <span></span> {toast.message}
                </div>
            )}

            {/* Modals and Overlays (out of document flow or conditionally rendered) */}
            <ContestantIdModal
                isOpen={showContestantModal}
                onSubmit={handleContestantIdSubmit}
            />

            {/* Loading Overlay */}
            {loading && !showContestantModal && (
                <div className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center text-blue-400 gap-4">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <div className="text-2xl font-bold animate-pulse text-white">
                        {loadingStage === 0 && "Waking up ML Service..."}
                        {loadingStage === 1 && "Loading AI Models..."}
                        {loadingStage === 2 && "Retrying connection..."}
                        {loadingStage === 3 && "Cold-starting server..."}
                        {loadingStage >= 4 && "Almost ready..."}
                    </div>
                    <div className="text-sm text-slate-400">
                        {loadingStage === 0 && "The server may need a moment to start up"}
                        {loadingStage === 1 && "Preparing task ranking pipeline"}
                        {loadingStage === 2 && "Reconnecting to ML service"}
                        {loadingStage === 3 && "Server is booting up - this can take up to 90 seconds"}
                        {loadingStage >= 4 && "Ranking tasks by information value"}
                    </div>
                </div>
            )}

            {/* Modals and Overlays (out of document flow or conditionally rendered) */}
            <FatigueTrackerModal
                isOpen={isFatigueModalOpen}
                onResume={() => {
                    setIsFatigueModalOpen(false);
                    const modalTimeSeconds = (elapsedTime * 1000) - ((Date.now() - viewStartTime) - fatiguePauseTime);
                    setFatiguePauseTime(Date.now() - viewStartTime - (elapsedTime * 1000));
                }}
            />

            {(!loading && !showContestantModal && currentTask) && (
                <EvaluatorTour
                    key={contestantId}
                    onComplete={() => {
                        setTourActive(false);
                        setViewStartTime(Date.now());
                        setElapsedTime(0);
                    }}
                />
            )}

            <SaveConfirmationModal
                isOpen={showSaveConfirmation}
                onSave={handleSaveOnRefresh}
                onDiscard={handleDiscardOnRefresh}
            />

            <AlphaBetaImpactPanel
                isOpen={showAlphaBetaPanel}
                onClose={() => setShowAlphaBetaPanel(false)}
                alpha={metrics.alpha || 5.0}
                beta={metrics.beta || 3.0}
            />

            <GuidelinesPanel
                isOpen={showGuidelines}
                onClose={() => setShowGuidelines(false)}
            />

            {/* Main Application Grid */}
            <div className="flex-1 p-6 grid grid-cols-12 gap-6 h-screen max-h-screen overflow-hidden">
                <div className="col-span-8 flex flex-col gap-6 h-full min-h-0">
                    <WorkspaceHeader
                        historyCount={annotationCount}
                        onToggleGuidelines={() => setShowGuidelines(!showGuidelines)}
                        contestantId={contestantId}
                        onSaveAndExit={handleSaveAndExit}
                        onExport={exportSessionData}
                        onEndSession={() => setShowSummary(true)}
                    />

                    <div className="flex-1 min-h-0 relative">
                        {/* Task Card Container - Flex-1 ensures it grows natively */}
                        <div className="absolute inset-0 flex flex-col">
                            <TaskCard
                                currentTask={currentTask}
                                submitting={submitting}
                                onAnnotate={handleAnnotate}
                                onRetry={fetchNextBatch}
                                elapsedTime={elapsedTime}
                            />
                        </div>
                    </div>
                </div>

                <div className="tour-step-spy-window col-span-4 rounded-xl border border-slate-700 bg-slate-900 shadow-xl overflow-hidden shadow-[0_0_20px_rgba(139,92,246,0.15)] ring-1 ring-white/10 flex flex-col h-full relative z-20">
                    {/* Header for Spy Window to make it look classy */}
                    <div className="bg-slate-800 border-b border-slate-700 p-4 shrink-0 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                            <span className="font-mono text-sm font-bold text-slate-300 uppercase tracking-widest">Spy Window Server</span>
                        </div>
                    </div>
                    {/* Scrollable Content Area */}
                    <div className="flex-1 overflow-y-auto w-full p-5 custom-scrollbar bg-slate-900/50">
                        <SpyAnalysis
                            selectionLogic={selectionLogic}
                            metrics={metrics}
                            history={history}
                            interactionLog={interactionLog}
                            shadowMetrics={shadowMetrics}
                            onShowAlphaBetaPanel={() => setShowAlphaBetaPanel(true)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResearchWorkspace;
