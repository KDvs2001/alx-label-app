// react-router-dom handles client-side routing in our single-page application
// CITATION: react-router-dom - declarative routing for React web applications
// SOURCE: React Router (n.d.). "react-router-dom"
// URL: https://reactrouter.com/en/main/start/overview
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import ImpactDashboard from "./pages/ImpactDashboard";
import ResearchWorkspace from "./components/ResearchWorkspace";
import ManagerDashboardPage from "./pages/ManagerDashboardPage";
import LoginPage from "./pages/LoginPage";
// lucide-react provides tree-shakable SVG icon components
// CITATION: lucide-react - SVG icon library as React components
// SOURCE: Lucide (n.d.). "lucide-react"
// URL: https://lucide.dev/guide/packages/lucide-react
import { Terminal, TrendingUp, Edit3, ShieldAlert, BookOpen, LogIn, LogOut, User, Sun, Moon } from "lucide-react";

// controls navigation between the public impact dashboard and the private evaluator workspace
const Navbar = ({ role, username, onSignOut, theme, onToggleTheme }) => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-white hover:text-blue-400 transition">
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white text-sm font-black animate-pulse">
            CAL
          </div>
          CAL-Log Portal
        </Link>
        
        <div className="flex items-center gap-4 font-semibold">
          <Link
            to="/"
            className={`flex items-center gap-1.5 text-xs transition-colors ${isActive('/') || isActive('/impact') ? 'text-white bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700' : 'text-slate-400 hover:text-white px-2 py-1.5'}`}
          >
            <TrendingUp size={14} />
            Impact Calculator
          </Link>

          {/* Show Annotator Workspace only if logged in (annotator or manager) */}
          {role && (
            <Link
              to="/workspace"
              className={`flex items-center gap-1.5 text-xs transition-colors ${isActive('/workspace') ? 'text-white bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700' : 'text-slate-400 hover:text-white px-2 py-1.5'}`}
            >
              <Edit3 size={14} />
              Annotator Workspace
            </Link>
          )}

          {/* Show Manager Dashboard only if manager */}
          {role === 'manager' && (
            <Link
              to="/dashboard"
              className={`flex items-center gap-1.5 text-xs transition-colors ${isActive('/dashboard') ? 'text-white bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700' : 'text-slate-400 hover:text-white px-2 py-1.5'}`}
            >
              <ShieldAlert size={14} />
              Manager Dashboard
            </Link>
          )}

          <a
            href="https://cal-log-docs.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs transition-colors text-slate-400 hover:text-white px-2 py-1.5"
          >
            <BookOpen size={14} />
            Docs
          </a>

          {/* Theme Switcher Button */}
          <button
            onClick={onToggleTheme}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? <Moon size={14} className="text-amber-400" /> : <Sun size={14} className="text-amber-400 animate-spin-slow" />}
          </button>

          {/* Sign In / Sign Out controls */}
          {role ? (
            <div className="flex items-center gap-3 border-l border-slate-850 pl-3">
              <span className="text-xs text-slate-400 flex items-center gap-1 bg-slate-950/60 px-2.5 py-1.5 rounded-lg border border-slate-850">
                <User size={12} className="text-blue-400" />
                <span className="font-mono text-[10px] font-bold capitalize">{username}</span>
              </span>
              <button
                onClick={onSignOut}
                className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-rose-400 px-3 py-1.5 rounded-lg border border-slate-700 transition font-bold"
              >
                <LogOut size={13} />
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-lg font-bold transition shadow-lg shadow-blue-500/10"
            >
              <LogIn size={13} />
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

// Route guards to block unauthorized endpoints
const AnnotatorRoute = ({ role, children }) => {
  if (!role) return <Navigate to="/login" replace />;
  return children;
};

const ManagerRoute = ({ role, children }) => {
  if (role !== 'manager') return <Navigate to="/login" replace />;
  return children;
};

function App() {
  const [role, setRole] = useState(() => sessionStorage.getItem("cal_log_role") || null);
  const [username, setUsername] = useState(() => sessionStorage.getItem("cal_log_username") || null);
  const [theme, setTheme] = useState(() => localStorage.getItem("cal_log_theme") || "dark");

  const handleLogin = (selectedRole, selectedUser) => {
    setRole(selectedRole);
    setUsername(selectedUser);
    sessionStorage.setItem("cal_log_role", selectedRole);
    sessionStorage.setItem("cal_log_username", selectedUser);
    
    // Automatically set contestantId in session storage so ResearchWorkspace detects it
    if (selectedRole === 'annotator') {
      sessionStorage.setItem("contestantId", selectedUser);
    }
  };

  const handleSignOut = () => {
    setRole(null);
    setUsername(null);
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = '/';
  };

  const handleToggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem("cal_log_theme", newTheme);
  };

  return (
    <Router>
      <div className={`min-h-screen font-sans flex flex-col transition-all duration-350 ${
        theme === 'light' 
          ? 'theme-light bg-slate-50 text-slate-800' 
          : 'theme-dark bg-slate-950 text-slate-200'
      }`}>
        <Navbar role={role} username={username} onSignOut={handleSignOut} theme={theme} onToggleTheme={handleToggleTheme} />
        <main className="flex-grow flex flex-col">
          <Routes>
            <Route path="/" element={<ImpactDashboard />} />
            <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
            <Route 
              path="/workspace" 
              element={
                <AnnotatorRoute role={role}>
                  <ResearchWorkspace />
                </AnnotatorRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ManagerRoute role={role}>
                  <ManagerDashboardPage />
                </ManagerRoute>
              } 
            />
            {/* backwards compatibility spy route */}
            <Route 
              path="/spy" 
              element={
                <ManagerRoute role={role}>
                  <ManagerDashboardPage />
                </ManagerRoute>
              } 
            />
            <Route path="/impact" element={<ImpactDashboard />} />
            {/* catch-all route redirects any unknown paths back to the impact dashboard */}
            <Route path="*" element={<ImpactDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
