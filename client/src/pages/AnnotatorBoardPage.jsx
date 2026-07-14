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
    const { boardStatus, progress, name, description, labelTypes = [], createdAt } = project;

    const daysSince = Math.floor((Date.now() - new Date(createdAt)) / 86400000);
    const timeLabel = daysSince === 0 ? 'today' : daysSince === 1 ? 'yesterday' : `${daysSince}d ago`;

    const actionButton = {
        pending: { label: 'Start Annotating', icon: Play, cls: 'bg-blue-600 hover:bg-blue-500 text-white' },
        in_progress: { label: 'Continue', icon: ArrowRight, cls: 'bg-indigo-600 hover:bg-indigo-500 text-white' },
        done: { label: 'View Results', icon: BarChart2, cls: 'bg-slate-700 hover:bg-slate-600 text-slate-200' },
    }[boardStatus] || { label: 'Open', icon: ArrowRight, cls: 'bg-slate-700 text-white' };

    const barColor = { pending: 'bg-amber-500', in_progress: 'bg-blue-500', done: 'bg-emerald-500' }[boardStatus];

    return (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 md:p-5 backdrop-blur-sm hover:border-slate-600 transition-all duration-200 group flex flex-col gap-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-base leading-tight line-clamp-1">{name}</h3>
                    {description && (
                        <p className="text-slate-400 text-sm mt-1 leading-relaxed line-clamp-2">{description}</p>
                    )}
                </div>
                <span className={`shrink-0 text-xs font-bold px-2 py-1 rounded-full ${
                    boardStatus === 'done' ? 'bg-emerald-500/15 text-emerald-400'
                    : boardStatus === 'in_progress' ? 'bg-blue-500/15 text-blue-400'
                    : 'bg-amber-500/15 text-amber-400'
                }`}>
                    {boardStatus === 'done' ? '✓ Done' : boardStatus === 'in_progress' ? '● Active' : '○ Pending'}
                </span>
            </div>

            {/* Label Types */}
            {labelTypes.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {labelTypes.map(l => <LabelBadge key={l} label={l} />)}
                </div>
            )}

            {/* Progress */}
            <ProgressBar labeled={progress.labeled} total={progress.total} colorClass={barColor} />

            {/* Footer */}
            <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock size={11} /> Assigned {timeLabel}
                </span>
                <button
                    onClick={() => onStart(project)}
                    disabled={boardStatus === 'done'}
                    className={`flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-lg transition ${actionButton.cls} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    <actionButton.icon size={14} />
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

// ─── Main Board Page ──────────────────────────────────────────────────────────
/**
 * AnnotatorBoardPage Component
 * A Jira-style Kanban board that shows an annotator's assigned projects
 * in three columns: Pending, In Progress, and Done.
 * Projects are dynamically assigned based on the user's reading style.
 */
const AnnotatorBoardPage = ({ username }) => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showPilot, setShowPilot] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch Profile
            const profileRes = await fetch(`${SERVER_URL}/api/session/profile/${username}`);
            if (profileRes.ok) {
                const profileData = await profileRes.json();
                if (!profileData.exists || !profileData.profile.pilotCompleted) {
                    setShowPilot(true);
                    setLoading(false);
                    return;
                }
                setProfile(profileData.profile);
            } else {
                setShowPilot(true);
                setLoading(false);
                return;
            }

            // Fetch Projects
            const res = await fetch(`${SERVER_URL}/api/projects/annotator/${username}`);
            if (!res.ok) throw new Error('Failed to load projects');
            const data = await res.json();
            setProjects(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
            setError('Could not load your projects. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (username) fetchData();
    }, [username]);

    const handlePilotComplete = () => {
        setShowPilot(false);
        fetchData();
    };

    // ── Start / Continue annotating a project ────────────────────────────────
    const handleStartProject = (project) => {
        if (project.boardStatus === 'done') return;

        const sessionKey = `${username}_${project.projectId}`;

        // Store the project config so the workspace can seed the ML service
        // CITATION: sessionStorage — stores data for the duration of the page session
        // SOURCE: MDN Web Docs (n.d.). "Window.sessionStorage"
        // URL: https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage
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

        navigate('/workspace');
    };

    // ── Bucket projects into columns ─────────────────────────────────────────
    const pending = projects.filter(p => p.boardStatus === 'pending');
    const inProgress = projects.filter(p => p.boardStatus === 'in_progress');
    const done = projects.filter(p => p.boardStatus === 'done');

    // ── Loading skeleton ─────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
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
        <div className="min-h-screen bg-slate-950 text-white p-4 md:p-6 pb-16 relative">
            {showPilot && <PilotTestModal username={username} onComplete={handlePilotComplete} />}
            
            <div className="max-w-7xl mx-auto">

                {/* ── Page Header ───────────────────────────────────────────── */}
                <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="p-1.5 bg-blue-600/20 rounded-lg border border-blue-500/30">
                                <Layers size={16} className="text-blue-400" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest text-blue-400">Annotation Board</span>
                            {profile && (
                                <span className="ml-2 text-xs font-bold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
                                    {profile.readingStyle}
                                </span>
                            )}
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black text-white">
                            Welcome back, <span className="capitalize bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">{username}</span>
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">
                            {projects.length === 0
                                ? 'No active projects match your profile right now.'
                                : `Auto-assigned ${projects.length} project${projects.length > 1 ? 's' : ''} based on your reading style.`}
                        </p>
                    </div>
                    <button
                        onClick={fetchData}
                        className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition"
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
                            <div key={stat.label} className={`rounded-xl border p-3 md:p-4 text-center ${stat.bg}`}>
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
