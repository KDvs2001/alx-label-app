import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ShieldAlert, ArrowRight, Activity, Terminal } from 'lucide-react';

/**
 * LoginPage Component
 * A premium, glassmorphic login and registration portal.
 * Registers and routes users dynamically based on their role: Annotator vs Manager.
 */
const LoginPage = ({ onLogin }) => {
    const navigate = useNavigate();
    
    // Auth inputs state
    const [annotatorIdInput, setAnnotatorIdInput] = useState('');
    const [managerPasswordInput, setManagerPasswordInput] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [isChecking, setIsChecking] = useState(false);

    // Dynamic UI states
    const [selectedRole, setSelectedRole] = useState('annotator'); // 'annotator' or 'manager'

    const handleAnnotatorLogin = async (e) => {
        e.preventDefault();
        const username = annotatorIdInput.trim();
        if (!username) {
            setErrorMsg('Please enter a username or Contestant ID.');
            return;
        }

        setIsChecking(true);
        setErrorMsg('');
        try {
            const SERVER_URL = (import.meta.env.VITE_SERVER_URL || "").replace(/\/$/, "");
            
            // Check database if session already exists
            const res = await fetch(`${SERVER_URL}/api/session/load/${username}`);
            const data = await res.json();
            
            setIsChecking(false);
            
            // Call parent App.jsx login handler
            onLogin('annotator', username);
            navigate('/board');
        } catch (error) {
            console.error('Annotator login error:', error);
            setIsChecking(false);
            
            // Fallback: log in anyway
            onLogin('annotator', username);
            navigate('/board');
        }
    };

    const handleManagerLogin = (e) => {
        e.preventDefault();
        if (managerPasswordInput === 'admin') {
            onLogin('manager', 'admin');
            navigate('/dashboard');
        } else {
            setErrorMsg('Access denied: Invalid Project Manager credentials.');
        }
    };

    return (
        <div className="min-h-[85vh] flex items-center justify-center p-6 text-slate-200">
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 max-w-lg w-full shadow-2xl backdrop-blur-md relative text-left">
                
                {/* Logo Section */}
                <div className="flex items-center gap-3 border-b border-slate-800 pb-5 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white text-sm font-black">
                        CAL
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white">CAL-Log Gateway</h2>
                        <p className="text-xs text-slate-500">Access your role-based labeling interface</p>
                    </div>
                </div>

                {/* Role Switch Tabs */}
                <div className="flex bg-slate-950 p-1 rounded-xl mb-6 border border-slate-800">
                    <button
                        onClick={() => { setSelectedRole('annotator'); setErrorMsg(''); }}
                        className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                            selectedRole === 'annotator'
                                ? 'bg-blue-600 text-white shadow'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <User size={14} /> Data Annotator
                    </button>
                    <button
                        onClick={() => { setSelectedRole('manager'); setErrorMsg(''); }}
                        className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                            selectedRole === 'manager'
                                ? 'bg-indigo-600 text-white shadow'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <ShieldAlert size={14} /> Project Manager
                    </button>
                </div>

                {/* Errors Block */}
                {errorMsg && (
                    <div className="mb-5 p-3 bg-rose-950/40 border border-rose-800 rounded-xl text-xs text-rose-400 font-medium">
                        {errorMsg}
                    </div>
                )}

                {/* Annotator Form */}
                {selectedRole === 'annotator' && (
                    <form onSubmit={handleAnnotatorLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-slate-400 text-xs font-bold block uppercase tracking-wider">
                                Annotator Name / ID
                            </label>
                            <input
                                type="text"
                                required
                                value={annotatorIdInput}
                                onChange={(e) => setAnnotatorIdInput(e.target.value)}
                                placeholder="Enter your name or registration code..."
                                className="w-full bg-slate-950 border border-slate-800 px-4 py-3.5 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition"
                            />
                            <p className="text-[10px] text-slate-500 leading-relaxed">
                                Enter your name or ID. If a session is already active for this ID, we will resume your exact progress instantly.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={isChecking}
                            className="w-full py-4 mt-6 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 transition disabled:opacity-50"
                        >
                            {isChecking ? 'Loading session...' : 'Join Workspace'}
                            <ArrowRight size={16} />
                        </button>
                    </form>
                )}

                {/* Manager Form */}
                {selectedRole === 'manager' && (
                    <form onSubmit={handleManagerLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-slate-400 text-xs font-bold block uppercase tracking-wider">
                                Manager Passkey
                            </label>
                            <input
                                type="password"
                                required
                                value={managerPasswordInput}
                                onChange={(e) => setManagerPasswordInput(e.target.value)}
                                placeholder="Enter admin password..."
                                className="w-full bg-slate-950 border border-slate-800 px-4 py-3.5 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 transition font-mono"
                            />
                            <p className="text-[10px] text-slate-500 leading-relaxed">
                                Authorized portal for project setup, active learning telemetry, and calibration audits. (Password: <code className="bg-slate-950 px-1 py-0.5 rounded text-indigo-400">admin</code>)
                            </p>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-4 mt-6 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/10 transition"
                        >
                            Access PM Dashboard
                            <ArrowRight size={16} />
                        </button>
                    </form>
                )}

            </div>
        </div>
    );
};

export default LoginPage;
