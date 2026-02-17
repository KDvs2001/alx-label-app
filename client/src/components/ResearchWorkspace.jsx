
import React, { useState, useEffect } from 'react';
import WorkspaceHeader from './workspace/WorkspaceHeader';
import GuidelinesPanel from './workspace/GuidelinesPanel';
import TaskCard from './workspace/TaskCard';
import SpyAnalysis from './workspace/SpyAnalysis';
import ContestantIdModal from './workspace/ContestantIdModal';
import SaveConfirmationModal from './workspace/SaveConfirmationModal';
import AlphaBetaImpactPanel from './workspace/AlphaBetaImpactPanel';
import EvaluatorBriefingModal from './workspace/EvaluatorBriefingModal';

const ResearchWorkspace = () => {
    // State
    const [tasks, setTasks] = useState([]);
    const [currentTask, setCurrentTask] = useState(null);
    const [history, setHistory] = useState([]);
    const [selectionLogic, setSelectionLogic] = useState(null);
    const [metrics, setMetrics] = useState({ alpha: 5.0, beta: 3.0, step: 0 });
    const [shadowMetrics, setShadowMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
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

    // Evaluator Briefing
    const [showBriefing, setShowBriefing] = useState(true);

    // Debug: Cost Model Inputs
    const [interactionLog, setInteractionLog] = useState([]);

    // Fatigue Detection
    const [viewStartTime, setViewStartTime] = useState(Date.now());
    const [fatigueDetected, setFatigueDetected] = useState(false);
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
            return () => clearInterval(interval);
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

    // Fatigue Detection Timer
    useEffect(() => {
        if (!currentTask) return;

        const timer = setInterval(() => {
            const elapsed = (Date.now() - viewStartTime) / 1000;
            setElapsedTime(elapsed);

            // Calculate expected time: alpha + beta * log(length)
            const textLength = (currentTask?.data?.text || currentTask?.text || "").split(" ").length;
            const expectedTime = metrics.alpha + metrics.beta * Math.log1p(textLength);

            // Detect fatigue: 5x expected time
            if (elapsed > expectedTime * 5 && !fatigueDetected) {
                setFatigueDetected(true);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [currentTask, viewStartTime, metrics, fatigueDetected]);

    // Reset fatigue when task changes
    useEffect(() => {
        if (currentTask) {
            setViewStartTime(Date.now());
            setFatigueDetected(false);
            setElapsedTime(0);
        }
    }, [currentTask]);


    const fetchNextBatch = async () => {
        setLoading(true);
        try {
            // SERVER-SIDE ARCHITECTURE: ML service owns the 50k dataset.
            // Client sends only labeled IDs (~1KB), server returns 50 ranked tasks.
            const rankRes = await fetch(`${API_URL}/predict`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    labeled_task_ids: labeledTaskIds
                })
            });
            const data = await rankRes.json();
            const ranked = Array.isArray(data) ? data : (data.tasks || []);
            const shadows = Array.isArray(data) ? null : data.shadow_metrics;

            if (ranked.length > 0) {
                setTasks(ranked);
                setCurrentTask(ranked[0]);
                setShadowMetrics(shadows);
                fetchSpySelection();
            } else {
                setToast({ message: "All tasks have been labeled! 🎉", type: "success" });
            }
        } catch (e) {
            console.error("Failed to fetch tasks from ML service", e);
            setToast({ message: "ML service unavailable. Please wait for it to start.", type: "error" });
        }
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
            if (mData.status === 'ok') {
                const scatterData = (mData.user_history || []).map(h => ({ x: h[0], y: h[1] }));
                setMetrics({
                    alpha: mData.alpha,
                    beta: mData.beta,
                    step: history.length * 5,
                    user_history: scatterData,
                    accuracy_history: mData.accuracy_history // New
                });
            }
        } catch (e) {
            // Ignore poll errors
        }
    };

    const handleAnnotate = async (label) => {
        if (!currentTask || submitting) return;

        setSubmitting(true);
        const timeTaken = (Date.now() - viewStartTime) / 1000;

        // Log interaction with formatted data for UI display
        const textLength = (currentTask.data?.text || currentTask.text).split(" ").length;
        const interaction = {
            text: currentTask.data?.text || currentTask.text,
            label,
            time_taken: timeTaken,
            // Formatted data for Cost Model Inputs table
            len: textLength,
            logL: Math.log1p(textLength).toFixed(2),
            time: timeTaken.toFixed(2)
        };

        setInteractionLog(prev => [interaction, ...prev].slice(0, 5));  // Keep last 5

        try {
            const response = await fetch(`${API_URL}/annotate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(interaction)
            });

            const data = await response.json();

            // Check if model was trained
            if (data.trained) {
                setToast({ message: "🧠 Model Retrained! CAL-Log adapted to your behavior.", type: "success" });

                // PAUSE ANNOTATION - Show training message
                setSubmitting(true);  // Keep UI disabled
                setToast({ message: "⏳ Training complete! Selecting new tasks based on your behavior...", type: "info" });

                // Refresh metrics with new alpha/beta
                await pollMetrics();

                // CRITICAL: Force re-ranking of tasks with new alpha/beta
                // This ensures CAL-Log selects tasks based on updated cost model
                await fetchNextBatch();  // Re-rank ALL tasks with new model

                // Wait 2 seconds to let user see the message
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Skip the normal task progression since we already fetched new batch
                setSubmitting(false);
                return;  // Exit early
            }

            // Update session state
            const newCount = annotationCount + 1;
            const newLabeledIds = [...labeledTaskIds, currentTask.id];
            setAnnotationCount(newCount);
            setLabeledTaskIds(newLabeledIds);
            setHasUnsavedWork(true);

            // Auto-save session
            await saveSession(newCount, newLabeledIds);

            // Move to next task
            const nextTasks = tasks.slice(1);
            if (nextTasks.length < 3) {
                // Fetch more tasks but don't reset count
                fetchNextBatch();
            } else {
                setTasks(nextTasks);
                setCurrentTask(nextTasks[0]);
                // Refresh selection logic with new predicted cost
                setTimeout(fetchSpySelection, 500);
            }
        } catch (error) {
            console.error('Annotation error:', error);
        } finally {
            setSubmitting(false);
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
    const saveSession = async (count = annotationCount, ids = labeledTaskIds) => {
        if (!contestantId) return;
        try {
            await fetch(`${SERVER_URL}/api/session/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contestantId,
                    annotationCount: count,
                    labeledTaskIds: ids
                })
            });
            setHasUnsavedWork(false);
        } catch (error) {
            console.error('Failed to save session:', error);
        }
    };

    const handleContestantIdSubmit = async (id, action) => {
        setContestantId(id);

        if (action === 'resume') {
            // Load existing session
            try {
                const response = await fetch(`${SERVER_URL}/api/session/load/${id}`);
                const data = await response.json();
                if (data.exists) {
                    setAnnotationCount(data.session.annotationCount);
                    setLabeledTaskIds(data.session.labeledTaskIds);
                }
            } catch (error) {
                console.error('Failed to load session:', error);
            }
        } else if (action === 'fresh') {
            // Reset session in database AND local state
            setAnnotationCount(0);
            setLabeledTaskIds([]);
            setHistory([]);
            try {
                await fetch(`${SERVER_URL}/api/session/reset/${id}`, {
                    method: 'POST'
                });
            } catch (error) {
                console.error('Failed to reset session:', error);
            }
        }

        setShowContestantModal(false);
        setLoading(true);
    };

    const handleSaveAndExit = async () => {
        await saveSession();
        setToast({ message: "✅ Progress saved successfully!", type: "success" });
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

    if (showBriefing) {
        return <EvaluatorBriefingModal
            isOpen={showBriefing}
            onComplete={() => setShowBriefing(false)}
        />;
    }

    if (showContestantModal) {
        return <ContestantIdModal
            isOpen={showContestantModal}
            onSubmit={handleContestantIdSubmit}
        />;
    }

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-blue-400 gap-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-xl font-bold animate-pulse">AI Agent is Ranking Tasks...</div>
            <div className="text-sm text-slate-500">Comparing Random vs Entropy vs CAL-Log</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 grid grid-cols-12 gap-6 font-sans relative overflow-hidden">

            {/* Toast Notification */}
            {toast && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-2 animate-bounce">
                    <span>✨</span> {toast.message}
                </div>
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

            <div className="col-span-8 flex flex-col gap-6">
                <WorkspaceHeader
                    historyCount={annotationCount}
                    onToggleGuidelines={() => setShowGuidelines(!showGuidelines)}
                    contestantId={contestantId}
                    onSaveAndExit={handleSaveAndExit}
                />

                <TaskCard
                    currentTask={currentTask}
                    submitting={submitting}
                    onAnnotate={handleAnnotate}
                    onRetry={fetchNextBatch}
                    elapsedTime={elapsedTime}
                    fatigueDetected={fatigueDetected}
                />
            </div>

            <SpyAnalysis
                selectionLogic={selectionLogic}
                metrics={metrics}
                history={history}
                interactionLog={interactionLog}
                shadowMetrics={shadowMetrics}
                onShowAlphaBetaPanel={() => setShowAlphaBetaPanel(true)}
            />
        </div>
    );
};

export default ResearchWorkspace;
