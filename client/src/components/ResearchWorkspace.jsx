// CITATION: React Hooks (useState, useEffect, useRef, useCallback) - state and lifecycle management
// SOURCE: React (n.d.). "Built-in React Hooks"
// URL: https://react.dev/reference/react/hooks
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
import SimpleExplanationModal from './workspace/SimpleExplanationModal';
import { Pause, Play, X, Settings, Activity } from 'lucide-react';

/**
 * ResearchWorkspace Component
 * Main container component for the annotation interface.
 * Manages the state and communication between the frontend React application, 
 * the Node.js API, and the remote Python ML service.
 */
const ResearchWorkspace = () => {
    // core state for tracking the current task and ML parameters
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
    const [showExplanationModal, setShowExplanationModal] = useState(false);
    const [toast, setToast] = useState(null); // { message, type }
    const [isAutoLabeling, setIsAutoLabeling] = useState(false);

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

    // AbortController allows us to cancel pending network requests if component unmounts or state changes
    // CITATION: AbortController - abort web requests
    // SOURCE: MDN Web Docs (n.d.). "AbortController"
    // URL: https://developer.mozilla.org/en-US/docs/Web/API/AbortController
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

    // Pause State - allows the presenter to freeze the timer mid-session (e.g., for Viva explanation)
    const [isPaused, setIsPaused] = useState(false);
    const pauseStartTimeRef = useRef(null);
    const totalPauseTimeRef = useRef(0);
    
    // Dataset Configuration State
    const [datasetConfig, setDatasetConfig] = useState(null);

    // Active Learning & Verification Queue States
    const [roundSize, setRoundSize] = useState(10);
    const [autoLabelThreshold, setAutoLabelThreshold] = useState('dynamic');
    const [currentRound, setCurrentRound] = useState(1);
    const [showRoundTransition, setShowRoundTransition] = useState(false);
    const [verificationQueue, setVerificationQueue] = useState([]);
    const [isVerifying, setIsVerifying] = useState(false);

    // Vite exposes environment variables via import.meta.env instead of process.env
    // CITATION: Env Variables and Modes - exposing variables in Vite
    // SOURCE: Vite (n.d.). "Env Variables and Modes"
    // URL: https://vitejs.dev/guide/env-and-mode.html
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

    // monitors time between annotations to detect if the user has left the keyboard or needs a break.
    // drops the top 20% longest times to prevent outliers (like getting a coffee) from skewing the average.
    useEffect(() => {
        if (!currentTask || tourActive || isFatigueModalOpen || isPaused || showRoundTransition) return;

        const timer = setInterval(() => {
            // Need to account for any time we spent paused in the fatigue modal
            const elapsed = ((Date.now() - viewStartTime) - fatiguePauseTime - totalPauseTimeRef.current) / 1000;
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
    }, [currentTask, viewStartTime, tourActive, isFatigueModalOpen, annotationTimes, fatiguePauseTime, fatigueTriggeredForTask, isPaused, showRoundTransition]);

    // Reset timer when task changes
    useEffect(() => {
        if (currentTask) {
            setViewStartTime(Date.now());
            setElapsedTime(0);
            setFatiguePauseTime(0); // Reset paused accumulation
            setFatigueTriggeredForTask(false); // Enable fatigue warning for the new task
            totalPauseTimeRef.current = 0; // Reset pause accumulation for the new task
            setIsPaused(false);
            pauseStartTimeRef.current = null;
        }
    }, [currentTask]);

    // Cognitive Pacing State Transition Toast Notification
    const prevPacingActiveRef = useRef(false);
    useEffect(() => {
        if (metrics?.cognitive_pacing_active !== undefined) {
            if (metrics.cognitive_pacing_active && !prevPacingActiveRef.current) {
                setToast({ 
                    message: "Cognitive Pacing Active: Fatigue detected. Prioritizing short, simple recovery texts.", 
                    type: "warning" 
                });
            } else if (!metrics.cognitive_pacing_active && prevPacingActiveRef.current) {
                setToast({ 
                    message: "Reading speed recovered. Resuming standard CAL-Log active learning.", 
                    type: "success" 
                });
            }
            prevPacingActiveRef.current = !!metrics.cognitive_pacing_active;
        }
    }, [metrics?.cognitive_pacing_active]);

    // Pause/Resume toggle handler
    const handleTogglePause = useCallback(() => {
        setIsPaused(prev => {
            if (!prev) {
                // Entering pause: record when we paused
                pauseStartTimeRef.current = Date.now();
            } else {
                // Resuming: accumulate the pause duration
                if (pauseStartTimeRef.current) {
                    totalPauseTimeRef.current += Date.now() - pauseStartTimeRef.current;
                    pauseStartTimeRef.current = null;
                }
            }
            return !prev;
        });
    }, []);


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
            // CITATION: AbortError DOMException - thrown when a fetch is aborted
            // SOURCE: MDN Web Docs (n.d.). "DOMException"
            // URL: https://developer.mozilla.org/en-US/docs/Web/API/DOMException
            if (e.name === 'AbortError') {
                clearInterval(stageTimer);
                return; 
            }

            console.error("Failed to fetch tasks from ML service", e);
            // 4 retries with exponential backoff: 3s, 6s, 12s, 20s
            if (retryCount < 4) {
                const backoffDelays = [3000, 6000, 12000, 20000];
                setLoadingStage(retryCount < 2 ? 2 : 3);
                // using setTimeout to implement exponential backoff for recovering the ML service connection
                // CITATION: setTimeout - delays execution of a functional callback
                // SOURCE: MDN Web Docs (n.d.). "setTimeout"
                // URL: https://developer.mozilla.org/en-US/docs/Web/API/setTimeout
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
            // standard browser Fetch API used to pull the current selection rationale from the ML service
            // CITATION: Fetch API - provides an interface for fetching resources
            // SOURCE: MDN Web Docs (n.d.). "Fetch API"
            // URL: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
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
                    cumulative_costs: cumulativeCosts,
                    pool_remaining: mData.pool_remaining,
                    pool_total: mData.pool_total,
                    ece: mData.ece,
                    last_bg_auto_labeled_count: mData.last_bg_auto_labeled_count,
                    auto_label_threshold: mData.auto_label_threshold,
                    cognitive_pacing_active: mData.cognitive_pacing_active,
                    baseline_beta: mData.baseline_beta
                });
                if (mData.verification_queue) {
                    setVerificationQueue(mData.verification_queue);
                }
            }
        } catch (e) {
            // Ignore poll errors
        }
    };

    const handleAutoLabel = async () => {
        if (isAutoLabeling) return;
        setIsAutoLabeling(true);
        try {
            const response = await fetch(`${API_URL}/auto-label`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    labeled_task_ids: labeledIdsRef.current
                })
            });
            const data = await response.json();
            if (data.status === 'success') {
                const count = data.count;
                if (count > 0) {
                    setToast({ message: `Queued ${count} high-confidence tasks for verification!`, type: "success" });
                    setIsVerifying(true);
                    pollMetrics();
                } else {
                    setToast({ message: `No tasks met the ${metrics.auto_label_threshold ? (metrics.auto_label_threshold * 100).toFixed(0) : '95'}% confidence threshold for auto-labeling.`, type: "warning" });
                }
            } else {
                setToast({ message: "Auto-labeling failed: " + data.message, type: "error" });
            }
        } catch (error) {
            console.error("Auto-labeling error:", error);
            setToast({ message: "Network error during auto-labeling.", type: "error" });
        } finally {
            setIsAutoLabeling(false);
        }
    };

    const handleVerify = async (taskId, action, correctedLabel = null) => {
        try {
            const body = { action };
            if (taskId !== null) body.taskId = taskId;
            if (correctedLabel !== null) body.correctedLabel = correctedLabel;
            
            const res = await fetch(`${API_URL}/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (res.ok) {
                if (action === 'approve_all') {
                    setVerificationQueue([]);
                    setToast({ message: "Approved all auto-labeled predictions!", type: "success" });
                    setIsVerifying(false);
                } else {
                    setVerificationQueue(prev => prev.filter(item => item.id !== taskId));
                    setToast({ message: action === 'approve' ? "Prediction approved!" : `Corrected to ${correctedLabel}!`, type: "success" });
                }
                pollMetrics();
            } else {
                setToast({ message: "Verification failed: " + data.message, type: "error" });
            }
        } catch (e) {
            console.error("Verification failed:", e);
            setToast({ message: "Network error during verification.", type: "error" });
        }
    };

    const handleAnnotate = async (label) => {
        if (!currentTask || submitting) return;
        setSubmitting(true);

        // Date.now() returns the number of milliseconds elapsed since the epoch
        // CITATION: Date.now() - timestamp resolution for human interaction
        // SOURCE: MDN Web Docs (n.d.). "Date.now()"
        // URL: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/now
        const timeTaken = ((Date.now() - viewStartTime) - fatiguePauseTime - totalPauseTimeRef.current) / 1000;
        const taskText = currentTask.data?.text || currentTask.text;
        const textLength = taskText.split(" ").length;

        // update the UI immediately before the network request completes, reducing perceived latency 
        // so the user's annotation flow isn't interrupted by waiting for the server
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
            taskId: currentTask.id,
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

            // Check if model was retrained (but skip instant fetch if we hit round boundary)
            if (data.trained && newCount % roundSize !== 0) {
                setToast({ message: "Model Retrained! Fetching new tasks...", type: "success" });
                pollMetrics();  // Non-blocking refresh
                fetchNextBatch();  // Uses labeledIdsRef (always fresh)
            }

            // Auto-save session (non-blocking, fire-and-forget)
            saveSession(newCount, newLabeledIds, fullAnnotation);

            // Fetch more tasks if running low
            if (newCount % roundSize === 0) {
                setShowRoundTransition(true);
            } else if (nextTasks.length < 3) {
                fetchNextBatch();
            } else {
                setTimeout(fetchSpySelection, 300);
            }
        } catch (error) {
            console.error('Annotation error:', error);
        }
    };

    // Global keyboard event listener for rapid, mouse-free annotation labeling
    // Keys 1..N map to each label in order; spacebar toggles the guidelines panel
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (submitting || !currentTask || showRoundTransition) return;
            // Resolve the same label list that TaskCard uses so shortcuts always match buttons
            const activeLabels = (datasetConfig?.labels?.length >= 2)
                ? datasetConfig.labels
                : ['Class A', 'Class B'];
            const keyIndex = parseInt(e.key, 10) - 1; // '1' → 0, '2' → 1, etc.
            if (!isNaN(keyIndex) && keyIndex >= 0 && keyIndex < activeLabels.length) {
                handleAnnotate(activeLabels[keyIndex]);
            }
            // Element.matches() prevents hotkeys from firing if the user is simultaneously typing in a text field
            // CITATION: Element.matches() - check if element would be selected by specified CSS selector
            // SOURCE: MDN Web Docs (n.d.). "Element.matches()"
            // URL: https://developer.mozilla.org/en-US/docs/Web/API/Element/matches
            if (e.key === ' ' && !e.target.matches('input, textarea')) {
                // Event.preventDefault() stops the spacebar from accidentally scrolling the browser page down
                // CITATION: Event.preventDefault() - cancel default browser action
                // SOURCE: MDN Web Docs (n.d.). "Event.preventDefault()"
                // URL: https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault
                e.preventDefault();
                setShowGuidelines(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentTask, submitting, showRoundTransition, datasetConfig]);

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
            // Include dataset config if available
            if (datasetConfig) {
                payload.datasetName = datasetConfig.datasetName;
                payload.labels = datasetConfig.labels;
                payload.uploadedTexts = datasetConfig.uploadedTexts;
                payload.roundSize = roundSize;
                payload.autoLabelThreshold = autoLabelThreshold;
            }
            // Include full annotation data if provided
            if (newAnnotation) {
                payload.newAnnotation = newAnnotation;
            }
            // JSON.stringify converts our Javascript session state object into a JSON string for deterministic network transit
            // CITATION: JSON.stringify() - convert object to JSON string
            // SOURCE: MDN Web Docs (n.d.). "JSON.stringify()"
            // URL: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
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

    const handleContestantIdSubmit = async (id, action, config) => {

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

                    // Recover dataset config
                    const rSize = data.session.roundSize || 10;
                    setRoundSize(rSize);
                    const thresh = data.session.autoLabelThreshold || 'dynamic';
                    setAutoLabelThreshold(thresh);
                    setCurrentRound(Math.floor(data.session.annotationCount / rSize) + 1);
                    setShowRoundTransition(false);

                    const recConfig = {
                        datasetName: data.session.datasetName || 'imdb',
                        labels: data.session.labels || null,
                        uploadedTexts: data.session.uploadedTexts || null
                    };
                    setDatasetConfig(recConfig);

                    // Reset ML server with recovered config to reload tasks correctly
                    try {
                        await fetch(`${API_URL}/reset`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                ...recConfig,
                                seedType: 'unlabeled',
                                roundSize: rSize,
                                autoLabelThreshold: thresh
                            })
                        });
                    } catch (e) {
                        console.error('Failed to sync ML server on resume:', e);
                    }
                }
            } catch (error) {
                console.error('Failed to load session:', error);
            }
        } else {
            // Both 'fresh' AND null (brand new user) need a full reset
            const rSize = config?.roundSize || 10;
            setRoundSize(rSize);
            const thresh = config?.autoLabelThreshold || 'dynamic';
            setAutoLabelThreshold(thresh);
            setCurrentRound(1);
            setShowRoundTransition(false);

            setDatasetConfig(config);
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
            // clearing the tour state from HTML5 local storage forces the UI tour to reappear for newly registered evaluators
            // CITATION: Window.localStorage - web storage API
            // SOURCE: MDN Web Docs (n.d.). "Window.localStorage"
            // URL: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
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

            // Reset ML service state (backbone, cost model, history)
            try {
                await fetch(`${API_URL}/reset`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(config || {})
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
            // direct window location assignment used here instead of React Router to ensure a full DOM flush and state reset
            // CITATION: React button onClick redirect using window.location
            // SOURCE: Stack Overflow (2018). "React button onclick redirect page"
            // URL: https://stackoverflow.com/questions/50644976/react-button-onclick-redirect-page
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
        // JavaScript Blob and URL API pattern to dynamically generate a downloadable JSON payload directly from browser cache
        // CITATION: Download JSON object as a file from browser
        // SOURCE: Stack Overflow (2013). "Download JSON object as a file from browser"
        // URL: https://stackoverflow.com/questions/19721439/download-json-object-as-a-file-from-browser
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `callog_session_${contestantId}_${Date.now()}.json`;
        a.click();
        
        // Revoking the URL immediately after the click frees up browser memory
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

            <SimpleExplanationModal
                isOpen={showExplanationModal}
                onClose={() => setShowExplanationModal(false)}
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
                <div className="col-span-12 max-w-5xl mx-auto w-full flex flex-col gap-6 h-full min-h-0">
                    <WorkspaceHeader
                        historyCount={annotationCount}
                        onToggleGuidelines={() => setShowGuidelines(!showGuidelines)}
                        contestantId={contestantId}
                        onSaveAndExit={handleSaveAndExit}
                        onEndSession={() => setShowSummary(true)}
                        isPaused={isPaused}
                        onTogglePause={handleTogglePause}
                        autoLabelThreshold={metrics.auto_label_threshold || (autoLabelThreshold === 'dynamic' ? null : autoLabelThreshold)}
                        datasetConfig={datasetConfig}
                        onToggleExplanation={() => setShowExplanationModal(prev => !prev)}
                    />

                    {/* ── Live Pool Countdown Bar ─────────────────────────────────
                        Shows the annotation pool shrinking in real-time.
                        Metrics are derived from backend: pool_total, pool_remaining, auto_label_threshold.
                        No hardcoded numbers — every value comes from live ML server state.
                    ───────────────────────────────────────────────────────────── */}
                    {metrics.pool_total > 0 && (() => {
                        const pTotal = metrics.pool_total;
                        const pRemaining = metrics.pool_remaining ?? pTotal;
                        const autoLabeled = Math.max(0, pTotal - pRemaining - annotationCount);
                        const processedPct = Math.min(100, Math.round(((annotationCount + autoLabeled) / pTotal) * 100));
                        const manualPct = Math.min(100, (annotationCount / pTotal) * 100);
                        const autoPct = Math.min(100 - manualPct, (autoLabeled / pTotal) * 100);
                        const urgencyColor = pRemaining > pTotal * 0.6
                            ? 'border-slate-700/40 bg-slate-900/60'
                            : pRemaining > pTotal * 0.3
                                ? 'border-blue-700/30 bg-blue-950/20'
                                : 'border-emerald-700/40 bg-emerald-950/20';
                        return (
                            <div className={`shrink-0 rounded-xl border p-3 ${urgencyColor} transition-all duration-700`}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            Pool: <span className="text-white font-black text-sm">{pRemaining}</span>
                                            <span className="text-slate-500 font-normal"> / {pTotal} remaining</span>
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px]">
                                        {autoLabeled > 0 && (
                                            <span className="flex items-center gap-1 text-emerald-400 font-bold">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                                                {autoLabeled} auto-pruned
                                            </span>
                                        )}
                                        <span className="font-mono font-black text-slate-300">{processedPct}% done</span>
                                    </div>
                                </div>
                                {/* Segmented Pool Bar */}
                                <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
                                    <div
                                        style={{ width: `${manualPct}%` }}
                                        className="bg-blue-500 transition-all duration-700 ease-in-out"
                                        title={`Manually annotated: ${annotationCount}`}
                                    />
                                    <div
                                        style={{ width: `${autoPct}%` }}
                                        className="bg-emerald-400 transition-all duration-700 ease-in-out"
                                        title={`Auto-pruned by model: ${autoLabeled}`}
                                    />
                                </div>
                            </div>
                        );
                    })()}


                    <div className="flex-1 min-h-0 relative">
                        {/* Task Card Container - Flex-1 ensures it grows natively */}
                        <div className="absolute inset-0 flex flex-col">
                            {verificationQueue.length > 0 && (
                                <div className="bg-gradient-to-r from-purple-900/60 to-indigo-900/60 border border-purple-500/50 rounded-xl p-3 flex items-center justify-between mb-4 shadow-lg animate-pulse shrink-0">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping" />
                                        <span className="text-xs font-semibold text-slate-200">
                                            CAL-Log auto-labeled <span className="font-bold text-purple-300">{verificationQueue.length}</span> high-confidence tasks. Validate them to ensure accuracy!
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setIsVerifying(true)}
                                        className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                                    >
                                        Verify Predictions
                                    </button>
                                </div>
                            )}
                            <TaskCard
                                currentTask={currentTask}
                                submitting={submitting || isPaused}
                                onAnnotate={handleAnnotate}
                                onRetry={fetchNextBatch}
                                elapsedTime={elapsedTime}
                                labels={datasetConfig?.labels}
                            />
                        </div>
                        {/* Pause Overlay - freezes the workspace visually during Viva explanations */}
                        {isPaused && (
                            <div className="absolute inset-0 z-20 bg-slate-950/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center gap-4 border-2 border-amber-500/50">
                                <div className="w-16 h-16 rounded-full bg-amber-600/20 border-2 border-amber-500 flex items-center justify-center">
                                    <Pause size={32} className="text-amber-400" />
                                </div>
                                <div className="text-xl font-bold text-amber-400">Session Paused</div>
                                <div className="text-sm text-slate-400">Timer and fatigue detection are frozen</div>
                                <button
                                    onClick={handleTogglePause}
                                    className="mt-2 flex items-center gap-2 px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold transition-colors"
                                >
                                    <Play size={16} /> Resume Annotation
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Human-in-the-Loop Verification Modal */}
            {isVerifying && (
                <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] flex flex-col gap-5 shadow-2xl relative">
                        <button
                            onClick={() => setIsVerifying(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
                        >
                            <X size={20} />
                        </button>
                        
                        <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Settings size={22} className="text-purple-400" />
                                Human-in-the-Loop Double Validation
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">
                                Review high-confidence auto-label predictions. Correct mistakes to retrain the model.
                            </p>
                        </div>

                        {/* Scrollable list of verification tasks */}
                        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4 max-h-[50vh] custom-scrollbar">
                            {verificationQueue.length === 0 ? (
                                <div className="text-center py-8 text-slate-500">
                                    No tasks pending verification.
                                </div>
                            ) : (
                                verificationQueue.map(task => (
                                    <div key={task.id} className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 flex flex-col gap-3">
                                        <p className="text-xs text-slate-300 font-serif leading-relaxed line-clamp-3">
                                            "{task.text}"
                                        </p>
                                        <div className="flex items-center justify-between border-t border-slate-700/50 pt-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 bg-slate-800 px-2 py-1 rounded">
                                                    Confidence: {(task.confidence * 100).toFixed(1)}%
                                                </span>
                                                <span className="text-xs text-slate-300">
                                                    Predicted: <span className="font-bold text-purple-400">{task.predicted_label}</span>
                                                </span>
                                            </div>
                                            <div className="flex gap-2">
                                                {/* Approve Button */}
                                                <button
                                                    onClick={() => handleVerify(task.id, 'approve')}
                                                    className="px-3 py-1 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 text-green-400 text-xs font-bold rounded-lg transition-all"
                                                >
                                                    Approve
                                                </button>
                                                {/* Correct Buttons (alternative labels) */}
                                                {(() => {
                                                    // Use datasetConfig labels if available, otherwise derive alternatives from predicted label
                                                    const knownLabels = datasetConfig?.labels;
                                                    const alternatives = knownLabels
                                                        ? knownLabels.filter(lbl => lbl !== task.predicted_label)
                                                        : [];
                                                    return alternatives.length > 0
                                                        ? alternatives.map(lbl => (
                                                            <button
                                                                key={lbl}
                                                                onClick={() => handleVerify(task.id, 'correct', lbl)}
                                                                className="px-3 py-1 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 text-rose-400 text-xs font-bold rounded-lg transition-all"
                                                            >
                                                                Correct → {lbl}
                                                            </button>
                                                        ))
                                                        : (
                                                            <button
                                                                onClick={() => handleVerify(task.id, 'reject')}
                                                                className="px-3 py-1 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 text-rose-400 text-xs font-bold rounded-lg transition-all"
                                                            >
                                                                Reject
                                                            </button>
                                                        );
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Batch Verification Footer */}
                        <div className="border-t border-slate-800 pt-4 flex gap-3">
                            <button
                                onClick={() => handleVerify(null, 'approve_all')}
                                disabled={verificationQueue.length === 0}
                                className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-700/50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 transition-all text-sm"
                            >
                                Approve All {verificationQueue.length} Predictions
                            </button>
                            <button
                                onClick={() => setIsVerifying(false)}
                                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl border border-slate-700 transition-all text-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Round Transition Screen Overlay */}
            {showRoundTransition && (
                <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-8 max-w-lg w-full shadow-2xl relative overflow-hidden flex flex-col gap-5">
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-blue-500/10 border-2 border-blue-500/50 flex items-center justify-center mx-auto mb-4 text-blue-400">
                                <Activity size={32} className="animate-pulse" />
                            </div>
                            <h2 className="text-3xl font-extrabold text-white">Round {currentRound} Complete!</h2>
                            <p className="text-sm text-slate-400 mt-2">
                                Model retrained. CAL-Log re-ranked the pool — see what changed below.
                            </p>
                        </div>

                        {/* 4-stat grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
                                <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Model Accuracy</span>
                                <span className="text-2xl font-bold text-green-400">
                                    {metrics.accuracy_history && metrics.accuracy_history.length > 0
                                        ? (metrics.accuracy_history[metrics.accuracy_history.length - 1].cal_log * 100).toFixed(0) + '%'
                                        : '—'}
                                </span>
                            </div>
                            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
                                <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Tasks Remaining</span>
                                <span className="text-2xl font-bold text-blue-400">
                                    {metrics.pool_remaining ?? '—'}
                                </span>
                                {metrics.pool_total && (
                                    <span className="text-[10px] text-slate-500 block">of {metrics.pool_total} total</span>
                                )}
                            </div>
                            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
                                <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Pruned This Round</span>
                                <span className="text-2xl font-bold text-purple-400">
                                    {metrics.last_bg_auto_labeled_count || 0}
                                </span>
                                <span className="text-[10px] text-slate-500 block">auto-labeled tasks removed</span>
                            </div>
                            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
                                <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Pruning Threshold</span>
                                <span className="text-2xl font-bold text-amber-400">
                                    {metrics.auto_label_threshold
                                        ? (metrics.auto_label_threshold * 100).toFixed(0) + '%'
                                        : '—'}
                                </span>
                                <span className="text-[10px] text-slate-500 block">self-tuned by CAL-Log</span>
                            </div>
                        </div>

                        {/* CAL-Log Adaptation breakdown */}
                        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 flex flex-col gap-2">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">CAL-Log Adaptive Cost Model</span>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-slate-300">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Setup Overhead (α)</span>
                                    <span className="font-mono font-bold">{metrics.alpha ? metrics.alpha.toFixed(2) : '5.00'}s</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Reading Factor (β)</span>
                                    <span className="font-mono font-bold text-amber-400">{metrics.beta ? metrics.beta.toFixed(2) : '3.00'}s</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Calibration (ECE)</span>
                                    <span className="font-mono font-bold text-rose-400">{metrics.ece ? metrics.ece.toFixed(3) : '—'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Round Size</span>
                                    <span className="font-mono font-bold">{roundSize} tasks</span>
                                </div>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                                CAL-Log scores each task as <span className="font-mono text-slate-400">Entropy(x) / (α + β·log(len))</span> — tasks that are informative AND fast to read rank highest. The confidence threshold above is self-tuned each round from your accuracy and ECE — no hardcoded values.
                            </p>
                        </div>

                        <button
                            onClick={() => {
                                setShowRoundTransition(false);
                                setCurrentRound(prev => prev + 1);
                                pollMetrics();
                                fetchNextBatch();
                            }}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all text-sm"
                        >
                            Start Round {currentRound + 1} →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResearchWorkspace;
