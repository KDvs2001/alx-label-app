// CITATION: React Hooks (useState, useEffect, useRef) - state and lifecycle management
// SOURCE: React (n.d.). "Built-in React Hooks"
// URL: https://react.dev/reference/react/hooks
import React, { useState, useEffect, useRef } from 'react';
import {
    Plus, Trash2, X, Upload, Users, Tag, FileText,
    CheckCircle2, Edit2, Pause, Play, AlertCircle,
    BarChart2, ChevronDown, ChevronUp, Save, FolderPlus,
    RefreshCw, Layers
} from 'lucide-react';

const SERVER_URL = (import.meta.env.VITE_SERVER_URL || '').replace(/\/$/, '');

// ─── Label Chip Builder ───────────────────────────────────────────────────────
const LabelBuilder = ({ labels, onChange }) => {
    const [inputVal, setInputVal] = useState('');

    const addLabel = () => {
        const trimmed = inputVal.trim();
        if (trimmed && !labels.includes(trimmed)) {
            onChange([...labels, trimmed]);
        }
        setInputVal('');
    };

    const removeLabel = (l) => onChange(labels.filter(x => x !== l));

    const colors = [
        'bg-blue-500/15 text-blue-300 border-blue-500/30',
        'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        'bg-purple-500/15 text-purple-300 border-purple-500/30',
        'bg-amber-500/15 text-amber-300 border-amber-500/30',
        'bg-rose-500/15 text-rose-300 border-rose-500/30',
        'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    ];

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-2 min-h-[36px]">
                {labels.map((l, i) => (
                    <span key={l} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border ${colors[i % colors.length]}`}>
                        {l}
                        <button onClick={() => removeLabel(l)} className="hover:opacity-70">
                            <X size={12} />
                        </button>
                    </span>
                ))}
                {labels.length === 0 && (
                    <span className="text-slate-500 text-sm italic">No labels yet — add some below</span>
                )}
            </div>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={inputVal}
                    onChange={e => setInputVal(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addLabel())}
                    placeholder='e.g. "Positive" then press Enter'
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
                <button
                    type="button"
                    onClick={addLabel}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold transition"
                >
                    <Plus size={16} />
                </button>
            </div>
        </div>
    );
};

// ─── Field Wrapper ────────────────────────────────────────────────────────────
const Field = ({ label, children, hint }) => (
    <div className="space-y-1.5">
        <label className="text-sm font-bold text-slate-300">{label}</label>
        {children}
        {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
);

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const map = {
        active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        paused: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        completed: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${map[status] || map.active}`}>
            {status}
        </span>
    );
};

// ─── Project Row / Card ───────────────────────────────────────────────────────
const ProjectRow = ({ project, onDelete, onToggleStatus }) => {
    const [expanded, setExpanded] = useState(false);
    const pct = project.total > 0 ? Math.round((project.labeled / project.total) * 100) : 0;

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden transition-all duration-200 hover:border-slate-700">
            <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => setExpanded(!expanded)}>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-sm">{project.name}</span>
                        <StatusBadge status={project.status} />
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1"><FileText size={11} /> {project.total} texts</span>
                        <span className="flex items-center gap-1"><Users size={11} /> {(project.assignedAnnotators || []).length} annotators</span>
                        <span className="flex items-center gap-1"><BarChart2 size={11} /> {project.labeled || 0} labeled ({pct}%)</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={e => { e.stopPropagation(); onToggleStatus(project); }}
                        className="p-1.5 hover:bg-slate-700 rounded-lg transition text-slate-400 hover:text-white"
                        title={project.status === 'active' ? 'Pause project' : 'Activate project'}
                    >
                        {project.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
                    </button>
                    <button
                        onClick={e => { e.stopPropagation(); onDelete(project.projectId); }}
                        className="p-1.5 hover:bg-rose-900/40 rounded-lg transition text-slate-400 hover:text-rose-400"
                        title="Delete project"
                    >
                        <Trash2 size={14} />
                    </button>
                    {expanded ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
                </div>
            </div>

            {expanded && (
                <div className="border-t border-slate-800 px-4 pb-4 pt-3 space-y-3 bg-slate-950/30">
                    {project.description && (
                        <p className="text-sm text-slate-400 leading-relaxed">{project.description}</p>
                    )}
                    <div className="flex flex-wrap gap-1.5">
                        {(project.labelTypes || []).map(l => (
                            <span key={l} className="bg-slate-800 border border-slate-700 text-slate-300 px-2 py-0.5 rounded-full text-xs font-semibold">
                                <Tag size={10} className="inline mr-1" />{l}
                            </span>
                        ))}
                    </div>
                    {(project.assignedAnnotators || []).length > 0 && (
                        <div className="text-xs text-slate-400">
                            <span className="font-bold text-slate-300">Assigned: </span>
                            {project.assignedAnnotators.join(', ')}
                        </div>
                    )}
                    {/* Progress bar */}
                    <div>
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                            <span>Overall progress</span>
                            <span>{project.labeled || 0} / {project.total} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2">
                            <div
                                className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                                style={{ width: `${pct}%` }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Main Project Management Page ─────────────────────────────────────────────
/**
 * ProjectManagementPage Component
 * Manager-only interface for creating and managing annotation projects.
 * Projects created here are pushed to the assigned annotators' Kanban boards.
 */
const ProjectManagementPage = ({ username = 'admin' }) => {
    const fileInputRef = useRef(null);

    // Form state
    const [form, setForm] = useState({
        name: '',
        description: '',
        labelTypes: [],
        textsRaw: '',
        annotators: ''
    });
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Projects list state
    const [projects, setProjects] = useState([]);
    const [loadingProjects, setLoadingProjects] = useState(true);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // ── Fetch existing projects ──────────────────────────────────────────────
    const fetchProjects = async () => {
        setLoadingProjects(true);
        try {
            const res = await fetch(`${SERVER_URL}/api/projects/stats/all`);
            const data = await res.json();
            setProjects(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error('Failed to fetch projects', e);
        } finally {
            setLoadingProjects(false);
        }
    };

    useEffect(() => { fetchProjects(); }, []);

    // ── Parse uploaded file ──────────────────────────────────────────────────
    const handleFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const content = ev.target.result;
            if (file.name.endsWith('.json')) {
                try {
                    const parsed = JSON.parse(content);
                    if (Array.isArray(parsed)) {
                        setForm(f => ({ ...f, textsRaw: parsed.join('\n') }));
                    }
                } catch {
                    setFormError('Invalid JSON file. Must be an array of strings.');
                }
            } else {
                setForm(f => ({ ...f, textsRaw: content }));
            }
        };
        reader.readAsText(file);
    };

    // ── Parse raw texts from textarea ────────────────────────────────────────
    const parseTexts = (raw) =>
        raw.split('\n').map(t => t.trim()).filter(t => t.length > 0);

    // ── Submit new project ───────────────────────────────────────────────────
    const handleCreateProject = async (e) => {
        e.preventDefault();
        setFormError('');

        const texts = parseTexts(form.textsRaw);
        if (!form.name.trim()) return setFormError('Project name is required.');
        if (form.labelTypes.length < 2) return setFormError('Add at least 2 label types (e.g. Positive, Negative).');
        if (texts.length === 0) return setFormError('Add at least one text to the corpus.');

        const annotators = form.annotators
            .split(/[\n,]/)
            .map(s => s.trim())
            .filter(Boolean);

        setSaving(true);
        try {
            const res = await fetch(`${SERVER_URL}/api/projects`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name.trim(),
                    description: form.description.trim(),
                    labelTypes: form.labelTypes,
                    texts,
                    assignedAnnotators: annotators,
                    createdBy: username
                })
            });

            if (!res.ok) throw new Error('Server error');

            // Reset form
            setForm({ name: '', description: '', labelTypes: [], textsRaw: '', annotators: '' });
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2500);
            showToast(`Project "${form.name.trim()}" created successfully!`);
            fetchProjects();
        } catch (err) {
            setFormError('Failed to create project. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    // ── Delete project ───────────────────────────────────────────────────────
    const handleDelete = async (projectId) => {
        if (!window.confirm('Delete this project? This cannot be undone.')) return;
        try {
            await fetch(`${SERVER_URL}/api/projects/${projectId}`, { method: 'DELETE' });
            showToast('Project deleted.');
            fetchProjects();
        } catch {
            showToast('Failed to delete project.', 'error');
        }
    };

    // ── Toggle project status ────────────────────────────────────────────────
    const handleToggleStatus = async (project) => {
        const newStatus = project.status === 'active' ? 'paused' : 'active';
        try {
            await fetch(`${SERVER_URL}/api/projects/${project.projectId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...project, status: newStatus })
            });
            showToast(`Project ${newStatus === 'active' ? 'activated' : 'paused'}.`);
            fetchProjects();
        } catch {
            showToast('Failed to update project.', 'error');
        }
    };

    const textCount = parseTexts(form.textsRaw).length;

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 md:p-6 pb-16">

            {/* Toast */}
            {toast && (
                <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl border shadow-xl text-sm font-bold max-w-sm ${
                    toast.type === 'success'
                        ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-300'
                        : 'bg-rose-950/90 border-rose-500/50 text-rose-300'
                }`}>
                    {toast.message}
                </div>
            )}

            <div className="max-w-7xl mx-auto">

                {/* ── Page Header ──────────────────────────────────────────── */}
                <div className="mb-8 border-b border-slate-800 pb-5">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-1.5 bg-purple-600/20 rounded-lg border border-purple-500/30">
                            <FolderPlus size={16} className="text-purple-400" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest text-purple-400">Project Management</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                        Manage Projects
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Create annotation projects and assign them to your team. Projects appear instantly on annotators' boards.
                    </p>
                </div>

                {/* ── Two-Column Layout ─────────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                    {/* ── LEFT: Create Project Form ──────────────────────────── */}
                    <div className="lg:col-span-2">
                        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 md:p-6 backdrop-blur-sm sticky top-24">
                            <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                                <Plus size={18} className="text-purple-400" /> New Project
                            </h2>

                            <form onSubmit={handleCreateProject} className="space-y-5">
                                <Field label="Project Name *">
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                        placeholder="e.g. Customer Sentiment Q3"
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
                                    />
                                </Field>

                                <Field label="Description" hint="Shown to annotators on their board cards.">
                                    <textarea
                                        value={form.description}
                                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                        placeholder="Brief instructions or context for annotators..."
                                        rows={3}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition resize-none"
                                    />
                                </Field>

                                <Field label="Label Types *" hint="Press Enter or click + to add each label.">
                                    <LabelBuilder labels={form.labelTypes} onChange={v => setForm(f => ({ ...f, labelTypes: v }))} />
                                </Field>

                                <Field
                                    label="Text Corpus *"
                                    hint={`${textCount} text${textCount !== 1 ? 's' : ''} parsed. One text per line, or upload .txt / .json`}
                                >
                                    <textarea
                                        value={form.textsRaw}
                                        onChange={e => setForm(f => ({ ...f, textsRaw: e.target.value }))}
                                        placeholder={"The product quality exceeded expectations.\nWorst customer service I have ever experienced.\n..."}
                                        rows={7}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition resize-none font-mono"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
                                    >
                                        <Upload size={13} /> Upload file (.txt or .json)
                                    </button>
                                    <input ref={fileInputRef} type="file" accept=".txt,.json" onChange={handleFileUpload} className="hidden" />
                                </Field>

                                <Field
                                    label="Assign Annotators"
                                    hint="Enter usernames separated by commas or new lines."
                                >
                                    <textarea
                                        value={form.annotators}
                                        onChange={e => setForm(f => ({ ...f, annotators: e.target.value }))}
                                        placeholder={"vihanga\njohn_doe\nannotator3"}
                                        rows={3}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition resize-none font-mono"
                                    />
                                </Field>

                                {formError && (
                                    <div className="flex items-center gap-2 bg-rose-950/50 border border-rose-700/40 rounded-lg px-3 py-2.5 text-rose-300 text-sm">
                                        <AlertCircle size={14} /> {formError}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black transition ${
                                        saveSuccess
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-50'
                                    }`}
                                >
                                    {saveSuccess ? (
                                        <><CheckCircle2 size={16} /> Project Created!</>
                                    ) : saving ? (
                                        <><RefreshCw size={16} className="animate-spin" /> Creating...</>
                                    ) : (
                                        <><FolderPlus size={16} /> Create Project</>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* ── RIGHT: Projects List ───────────────────────────────── */}
                    <div className="lg:col-span-3 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <Layers size={16} className="text-purple-400" />
                                All Projects
                                {!loadingProjects && (
                                    <span className="text-sm font-semibold text-slate-400">({projects.length})</span>
                                )}
                            </h2>
                            <button
                                onClick={fetchProjects}
                                className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
                            >
                                <RefreshCw size={13} /> Refresh
                            </button>
                        </div>

                        {loadingProjects ? (
                            <div className="space-y-3">
                                {[1,2,3].map(i => (
                                    <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 h-20 animate-pulse" />
                                ))}
                            </div>
                        ) : projects.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-600 gap-3 border border-dashed border-slate-800 rounded-2xl">
                                <FolderPlus size={36} strokeWidth={1.2} />
                                <p className="text-sm font-semibold">No projects yet</p>
                                <p className="text-xs">Create your first project using the form on the left.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {projects.map(p => (
                                    <ProjectRow
                                        key={p.projectId}
                                        project={p}
                                        onDelete={handleDelete}
                                        onToggleStatus={handleToggleStatus}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ProjectManagementPage;
