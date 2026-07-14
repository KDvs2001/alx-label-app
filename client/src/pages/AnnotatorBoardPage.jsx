// CITATION: React Hooks (useState, useEffect) - state and lifecycle management
// SOURCE: React (n.d.). "Built-in React Hooks"
// URL: https://react.dev/reference/react/hooks
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Layers, Play, CheckCircle2, Clock, Tag, Users,
    ArrowRight, RefreshCw, BarChart2, AlertCircle, FolderOpen, Inbox
} from 'lucide-react';

const SERVER_URL = (import.meta.env.VITE_SERVER_URL || '').replace(/\/$/, '');

// ─── Label Badge ─────────────────────────────────────────────────────────────
const LabelBadge = ({ label }) => {
    const colors = [
        'bg-blue-500/15 text-blue-300 border-blue-500/30',
        'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        'bg-purple-500/15 text-purple-300 border-purple-500/30',
        'bg-amber-500/15 text-amber-300 border-amber-500/30',
        'bg-rose-500/15 text-rose-300 border-rose-500/30',
        'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    ];
    const hash = label.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${colors[hash % colors.length]}`}>
            {label}
        </span>
    );
};

// ─── Progress Bar ─────────────────────────────────────────────────────────────
const ProgressBar = ({ labeled, total, colorClass = 'bg-blue-500' }) => {
    const pct = total > 0 ? Math.round((labeled / total) * 100) : 0;
    return (
        <div className="mt-3">
            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                <span className="font-semibold">{labeled} / {total} texts</span>
                <span className="font-bold">{pct}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                    className={`h-2 rounded-full transition-all duration-700 ${colorClass}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
};

// ─── Empty Column Placeholder ─────────────────────────────────────────────────
const EmptyColumn = ({ message }) => (
    <div className="flex flex-col items-center justify-center py-14 text-slate-600 gap-3">
        <Inbox size={32} strokeWidth={1.5} />
        <p className="text-sm font-medium text-center">{message}</p>
    </div>
);

// ─── Project Card ─────────────────────────────────────────────────────────────
const ProjectCard = ({ project, username, onStart }) => {
    const { boardStatus, progress, name, description, labelTypes = [], createdAt, complexityScore } = project;

    const daysSince = Math.floor((Date.now() - new Date(createdAt)) / 86400000);
    const timeLabel = daysSince === 0 ? 'today' : daysSince === 1 ? 'yesterday' : `${daysSince}d ago`;

    const actionButton = {
        pending: { label: 'Start Annotating', icon: Play, cls: 'bg-blue-600 hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/25 text-white' },
        in_progress: { label: 'Continue', icon: ArrowRight, cls: 'bg-indigo-600 hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/25 text-white' },
        done: { label: 'View Results', icon: BarChart2, cls: 'bg-slate-800 hover:bg-slate-700 text-slate-300' },
    }[boardStatus] || { label: 'Open', icon: ArrowRight, cls: 'bg-slate-700 text-white' };

    const barColor = { pending: 'bg-amber-500', in_progress: 'bg-blue-500', done: 'bg-emerald-500' }[boardStatus];

    return (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm hover:border-indigo-500/40 hover:-translate-y-1 hover:shadow-[0_10px_35px_-10px_rgba(99,102,241,0.15)] transition-all duration-300 group flex flex-col gap-4 relative overflow-hidden">
            {/* Ambient hover light glow */}
            <div className="absolute -inset-px bg-gradient-to-r from-indigo-500/0 via-indigo-500/10 to-purple-500/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            {/* Header */}
            <div className="flex items-start justify-between gap-3 relative z-10">
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-base leading-tight group-hover:text-indigo-300 transition-colors line-clamp-1">{name}</h3>
                    {description && (
                        <p className="text-slate-400 text-sm mt-1 leading-relaxed line-clamp-2">{description}</p>
                    )}
                </div>
                <span className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full border transition-all ${
                    boardStatus === 'done' ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                    : boardStatus === 'in_progress' ? 'bg-blue-500/10 border-blue-500/25 text-blue-400'
                    : 'bg-amber-500/10 border-amber-500/25 text-amber-400'
                }`}>
                    {boardStatus === 'done' ? '✓ Done' : boardStatus === 'in_progress' ? '● Active' : '○ Pending'}
                </span>
            </div>

            {/* Label Types */}
            {labelTypes.length > 0 && (
                <div className="flex flex-wrap gap-1.5 relative z-10">
                    {labelTypes.map(l => <LabelBadge key={l} label={l} />)}
                </div>
            )}

            {/* Complexity Indicator */}
            {complexityScore !== undefined && (
                <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-1.5 relative z-10">
                    <span>Complexity Score:</span>
                    <span className="font-mono text-slate-400 bg-slate-800/60 px-1.5 py-0.5 rounded border border-slate-700/50">{complexityScore.toFixed(2)}</span>
                </div>
            )}

            {/* Progress */}
            <div className="relative z-10">
                <ProgressBar labeled={progress.labeled} total={progress.total} colorClass={barColor} />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/40 relative z-10 mt-1">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock size={11} /> Assigned {timeLabel}
                </span>
                <button
                    onClick={() => onStart(project)}
                    disabled={boardStatus === 'done'}
                    className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all duration-300 ${actionButton.cls} disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                    <actionButton.icon size={13} />
                    {actionButton.label}
                </button>
            </div>
        </div>
    );
};

// ─── Kanban Column ────────────────────────────────────────────────────────────
const KanbanColumn = ({ title, icon: Icon, color, count, children, emptyMsg }) => (
    <div className="flex-1 min-w-0 flex flex-col gap-3">
        {/* Column Header */}
        <div className={`flex items-center gap-2.5 pb-3 border-b ${color.border}`}>
            <div className={`p-1.5 rounded-lg ${color.iconBg}`}>
                <Icon size={15} className={color.iconText} />
            </div>
            <h2 className="font-bold text-white text-sm uppercase tracking-wider">{title}</h2>
            <span className={`ml-auto text-xs font-black px-2 py-0.5 rounded-full ${color.badge}`}>{count}</span>
        </div>
        {/* Cards */}
        <div className="flex flex-col gap-3 min-h-[200px]">
            {count === 0 ? <EmptyColumn message={emptyMsg} /> : children}
        </div>
    </div>
);

import PilotTestModal from '../components/workspace/PilotTestModal';
import ResearchWorkspace from '../components/ResearchWorkspace';
import { Bell, Sparkles, X as CloseIcon } from 'lucide-react';

// ─── Main Board Page ──────────────────────────────────────────────────────────
/**
 * AnnotatorBoardPage Component
 * A Jira-style Kanban board that shows an annotator's assigned projects
 * in three columns: Pending, In Progress, and Done.
 * Projects are dynamically assigned based on the user's reading style.
 * Renders the ResearchWorkspace inline directly under the boards section.
 */
const AnnotatorBoardPage = ({ username }) => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showPilot, setShowPilot] = useState(false);
    const [activeProject, setActiveProject] = useState(null);
    
    // Modern notification state
    const [toastNotification, setToastNotification] = useState(null);

    const fetchData = async (silent = false) => {
        if (!silent) setLoading(true);
        if (!silent) setError(null);
        try {
            // Fetch Profile
            const profileRes = await fetch(`${SERVER_URL}/api/session/profile/${username}`);
            if (profileRes.ok) {
                const profileData = await profileRes.json();
                if (!profileData.exists || !profileData.profile.pilotCompleted) {
                    setShowPilot(true);
                    if (!silent) setLoading(false);
                    return;
                }
                setProfile(profileData.profile);
            } else {
                setShowPilot(true);
                if (!silent) setLoading(false);
                return;
            }

            // Fetch Projects
            const res = await fetch(`${SERVER_URL}/api/projects/annotator/${username}`);
            if (!res.ok) throw new Error('Failed to load projects');
            const data = await res.json();
            
            // Check for new projects in background to trigger beautiful notification
            setProjects(prev => {
                if (prev.length > 0 && Array.isArray(data)) {
                    const prevIds = new Set(prev.map(p => p.projectId));
                    const newProjects = data.filter(p => !prevIds.has(p.projectId));
                    if (newProjects.length > 0) {
                        setToastNotification({
                            title: 'New Project Assigned!',
                            message: `"${newProjects[0].name}" matches your reading style.`,
                            type: 'info'
                        });
                    }
                }
                return Array.isArray(data) ? data : [];
            });
        } catch (e) {
            console.error(e);
            if (!silent) setError('Could not load your projects. Please check your connection.');
        } finally {
            if (!silent) setLoading(false);
        }
    };

    // Polling effect: refetch projects silently in background every 8 seconds
    // to instantly capture new admin-created projects.
    useEffect(() => {
        if (!username) return;
        
        fetchData(false);

        const pollTimer = setInterval(() => {
            if (!activeProject && !showPilot) {
                fetchData(true);
            }
        }, 8000);

        return () => clearInterval(pollTimer);
    }, [username, activeProject, showPilot]);

    const handlePilotComplete = () => {
        setShowPilot(false);
        fetchData();
    };

    // ── Start / Continue annotating a project ────────────────────────────────
    const handleStartProject = (project) => {
        if (project.boardStatus === 'done') return;

        const sessionKey = `${username}_${project.projectId}`;

        // Store project configuration in sessionStorage for local state syncing
        sessionStorage.setItem('contestantId', sessionKey);
        sessionStorage.setItem('cal_log_project_config', JSON.stringify({
            uploadedTexts: project.texts.map(t => t.text),
            labels: project.labelTypes,
            datasetName: project.name,
            roundSize: 10,
            autoLabelThreshold: 'dynamic',
            seedType: 'unlabeled',
            seedCount: 0
        }));
        sessionStorage.setItem('cal_log_project_id', project.projectId);
        sessionStorage.setItem('cal_log_project_name', project.name);

        setActiveProject(project);
    };

    const handleExitWorkspace = () => {
        sessionStorage.removeItem('contestantId');
        sessionStorage.removeItem('cal_log_project_config');
        sessionStorage.removeItem('cal_log_project_id');
        sessionStorage.removeItem('cal_log_project_name');
        setActiveProject(null);
        fetchData(false);
    };

    // Auto-dismiss toast notifications after 6 seconds
    useEffect(() => {
        if (toastNotification) {
            const timer = setTimeout(() => setToastNotification(null), 6000);
            return () => clearTimeout(timer);
        }
    }, [toastNotification]);

    // Render workspace inline if active project is selected
    if (activeProject) {
        return (
            <ResearchWorkspace onExit={handleExitWorkspace} />
        );
    }

    // ── Bucket projects into columns ─────────────────────────────────────────
    const pending = projects.filter(p => p.boardStatus === 'pending');
    const inProgress = projects.filter(p => p.boardStatus === 'in_progress');
    const done = projects.filter(p => p.boardStatus === 'done');

    // ── Loading skeleton ─────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 flex flex-col justify-center items-center">
                <div className="max-w-7xl w-full mx-auto">
                    <div className="h-8 w-64 bg-slate-800 rounded-lg animate-pulse mb-2" />
                    <div className="h-4 w-96 bg-slate-800/60 rounded animate-pulse mb-10" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1,2,3].map(i => (
                            <div key={i} className="flex flex-col gap-3">
                                <div className="h-6 w-28 bg-slate-800 rounded animate-pulse" />
                                {[1,2].map(j => (
                                    <div key={j} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 h-44 animate-pulse" />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 md:p-6 pb-16 relative overflow-x-hidden">
            {showPilot && <PilotTestModal username={username} onComplete={handlePilotComplete} />}

            {/* Custom Modern Floating Toast Notification */}
            {toastNotification && (
                <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-slate-900/90 border border-indigo-500/30 text-white px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md flex gap-3 items-start animate-slide-up transition-all duration-300">
                    <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20 text-indigo-400">
                        <Bell size={18} className="animate-wiggle" />
                    </div>
                    <div className="flex-1">
                        <div className="font-bold text-sm text-indigo-300 flex items-center gap-1.5">
                            {toastNotification.title} <Sparkles size={12} className="text-amber-400" />
                        </div>
                        <div className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toastNotification.message}</div>
                    </div>
                    <button 
                        onClick={() => setToastNotification(null)}
                        className="text-slate-500 hover:text-white p-0.5 rounded-lg hover:bg-slate-800 transition"
                    >
                        <CloseIcon size={14} />
                    </button>
                </div>
            )}
            
            <div className="max-w-7xl mx-auto">

                {/* ── Page Header ───────────────────────────────────────────── */}
                <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <div className="p-1.5 bg-blue-600/20 rounded-lg border border-blue-500/30">
                                <Layers size={16} className="text-blue-400" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest text-blue-400">Annotation Board</span>
                            {profile && (
                                <div className="group relative flex items-center gap-1.5 ml-2 text-xs font-bold bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-500/30 shadow-sm cursor-help hover:border-indigo-400/50 transition">
                                    <Sparkles size={12} className="text-indigo-400" />
                                    <span>{profile.readingStyle}</span>
                                    {/* Speed Tooltip */}
                                    <div className="absolute top-full mt-2 left-0 w-52 bg-slate-900 border border-slate-800 text-slate-300 text-[11px] p-2.5 rounded-xl hidden group-hover:block z-40 shadow-xl leading-relaxed">
                                        <div className="font-bold text-white mb-0.5">Profile Calibration Details</div>
                                        <div>Speed: <span className="font-mono text-indigo-400 font-bold">{profile.baselineSpeed ? profile.baselineSpeed.toFixed(2) : 'N/A'}</span> sec/word</div>
                                        <div className="mt-1 text-[10px] text-slate-500">Adaptive parameters recalibrate continuously to match your cognitive load limits.</div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black text-white">
                            Welcome back, <span className="capitalize bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">{username}</span>
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">
                            {projects.length === 0
                                ? 'No active projects match your profile right now.'
                                : `System auto-routed ${projects.length} project${projects.length > 1 ? 's' : ''} tailored to your current cognitive reading profile.`}
                        </p>
                    </div>
                    <button
                        onClick={() => fetchData(false)}
                        className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 hover:border-slate-500 transition-all duration-300"
                    >
                        <RefreshCw size={14} /> Refresh Board
                    </button>
                </div>

                {/* ── Error State ───────────────────────────────────────────── */}
                {error && (
                    <div className="mb-6 flex items-center gap-3 bg-rose-950/50 border border-rose-700/50 rounded-xl p-4 text-rose-300">
                        <AlertCircle size={18} />
                        <span className="text-sm font-semibold">{error}</span>
                    </div>
                )}

                {/* ── Summary Stats Strip ───────────────────────────────────── */}
                {projects.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 mb-8">
                        {[
                            { label: 'Pending', value: pending.length, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
                            { label: 'In Progress', value: inProgress.length, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
                            { label: 'Completed', value: done.length, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
                        ].map(stat => (
                            <div key={stat.label} className={`rounded-xl border p-3 md:p-4 text-center hover:border-slate-700 transition-all duration-305 ${stat.bg}`}>
                                <div className={`text-2xl md:text-3xl font-black ${stat.color}`}>{stat.value}</div>
                                <div className="text-xs font-semibold text-slate-400 mt-0.5">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Kanban Board ──────────────────────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">

                    {/* PENDING Column */}
                    <KanbanColumn
                        title="Pending"
                        icon={FolderOpen}
                        count={pending.length}
                        emptyMsg="No pending projects — great work!"
                        color={{
                            border: 'border-amber-500/30',
                            iconBg: 'bg-amber-500/15',
                            iconText: 'text-amber-400',
                            badge: 'bg-amber-500/20 text-amber-300',
                        }}
                    >
                        {pending.map(p => (
                            <ProjectCard key={p.projectId} project={p} username={username} onStart={handleStartProject} />
                        ))}
                    </KanbanColumn>

                    {/* IN PROGRESS Column */}
                    <KanbanColumn
                        title="In Progress"
                        icon={Play}
                        count={inProgress.length}
                        emptyMsg="Start a pending project to see it here."
                        color={{
                            border: 'border-blue-500/30',
                            iconBg: 'bg-blue-500/15',
                            iconText: 'text-blue-400',
                            badge: 'bg-blue-500/20 text-blue-300',
                        }}
                    >
                        {inProgress.map(p => (
                            <ProjectCard key={p.projectId} project={p} username={username} onStart={handleStartProject} />
                        ))}
                    </KanbanColumn>

                    {/* DONE Column */}
                    <KanbanColumn
                        title="Done"
                        icon={CheckCircle2}
                        count={done.length}
                        emptyMsg="Completed projects will appear here."
                        color={{
                            border: 'border-emerald-500/30',
                            iconBg: 'bg-emerald-500/15',
                            iconText: 'text-emerald-400',
                            badge: 'bg-emerald-500/20 text-emerald-300',
                        }}
                    >
                        {done.map(p => (
                            <ProjectCard key={p.projectId} project={p} username={username} onStart={handleStartProject} />
                        ))}
                    </KanbanColumn>

                </div>
            </div>
        </div>
    );
};

export default AnnotatorBoardPage;
