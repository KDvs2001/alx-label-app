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
import AnnotatorBoardPage from "./pages/AnnotatorBoardPage";
import ProjectManagementPage from "./pages/ProjectManagementPage";
import PitchDeckModal from "./components/PitchDeckModal";
// lucide-react provides tree-shakable SVG icon components
// CITATION: lucide-react - SVG icon library as React components
// SOURCE: Lucide (n.d.). "lucide-react"
// URL: https://lucide.dev/guide/packages/lucide-react
import { Terminal, TrendingUp, Edit3, ShieldAlert, BookOpen, LogIn, LogOut, User, Sun, Moon, Menu, X, Layers, FolderPlus, Sparkles } from "lucide-react";

// controls navigation between the public impact dashboard and the private evaluator workspace
const Navbar = ({ role, username, onSignOut, theme, onToggleTheme, onOpenPitchDeck }) => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const navLinkClass = (path) =>
    `flex items-center gap-2 text-sm font-semibold transition-colors px-3 py-2 rounded-lg ${
      isActive(path)
        ? 'text-white bg-slate-800 border border-slate-700'
        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
    }`;

  return (
    <nav className="bg-slate-900 border-b border-slate-800 px-4 md:px-6 py-3 transition-colors duration-300 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 font-black text-lg text-white hover:text-blue-400 transition shrink-0">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white text-sm font-black">
            CAL
          </div>
          <span className="hidden sm:block">CAL-Log Portal</span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-2 font-semibold">
          <Link to="/" className={navLinkClass('/')}>  
            <TrendingUp size={15} /> Impact
          </Link>
          {/* Annotator Board — visible to all logged-in users */}
          {role && (
            <Link to="/board" className={navLinkClass('/board')}>
              <Layers size={15} /> My Board
            </Link>
          )}
          {/* Manager-only links */}
          {role === 'manager' && (
            <Link to="/dashboard" className={navLinkClass('/dashboard')}>
              <ShieldAlert size={15} /> Dashboard
            </Link>
          )}
          {role === 'manager' && (
            <Link to="/projects" className={navLinkClass('/projects')}>
              <FolderPlus size={15} /> Projects
            </Link>
          )}
          <a
            href="https://cal-log-docs.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-800/50 transition"
          >
            <BookOpen size={15} /> Docs
          </a>
          <button
            onClick={onOpenPitchDeck}
            className="flex items-center gap-1.5 text-sm font-semibold text-indigo-400 hover:text-indigo-300 px-3 py-2 rounded-lg hover:bg-slate-800/50 transition border border-indigo-500/10 bg-indigo-500/5 font-bold"
          >
            <Sparkles size={15} className="animate-pulse" /> Pitch Deck
          </button>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? <Moon size={15} className="text-amber-400" /> : <Sun size={15} className="text-amber-400" />}
          </button>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-2 border-l border-slate-700 pl-2 ml-1">
            {role ? (
              <>
                <span className="text-sm text-slate-400 flex items-center gap-1.5 bg-slate-950/60 px-3 py-2 rounded-lg border border-slate-800">
                  <User size={13} className="text-blue-400" />
                  <span className="font-mono text-xs font-bold capitalize">{username}</span>
                </span>
                <button
                  onClick={onSignOut}
                  className="flex items-center gap-1.5 text-sm bg-slate-800 hover:bg-slate-700 text-rose-400 px-3 py-2 rounded-lg border border-slate-700 transition font-bold"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 text-sm bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold transition shadow-lg shadow-blue-500/10"
              >
                <LogIn size={14} /> Sign In
              </Link>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2.5 bg-slate-800 text-slate-300 rounded-lg border border-slate-700"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileOpen && (
        <div className="md:hidden mt-3 pb-3 border-t border-slate-800 pt-3 flex flex-col gap-1">
          <Link to="/" onClick={() => setMobileOpen(false)} className={navLinkClass('/')}>
            <TrendingUp size={15} /> Impact Calculator
          </Link>
          {role && (
            <Link to="/board" onClick={() => setMobileOpen(false)} className={navLinkClass('/board')}>
              <Layers size={15} /> My Board
            </Link>
          )}
          {role === 'manager' && (
            <Link to="/dashboard" onClick={() => setMobileOpen(false)} className={navLinkClass('/dashboard')}>
              <ShieldAlert size={15} /> Manager Dashboard
            </Link>
          )}
          {role === 'manager' && (
            <Link to="/projects" onClick={() => setMobileOpen(false)} className={navLinkClass('/projects')}>
              <FolderPlus size={15} /> Projects
            </Link>
          )}
          <a
            href="https://cal-log-docs.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 text-sm font-semibold text-slate-400 px-3 py-2 rounded-lg"
          >
            <BookOpen size={15} /> Documentation
          </a>
          <button
            onClick={() => { setMobileOpen(false); onOpenPitchDeck(); }}
            className="flex items-center gap-2 text-sm font-semibold text-indigo-400 px-3 py-2 rounded-lg hover:bg-slate-800/50 transition"
          >
            <Sparkles size={15} /> Pitch Slides
          </button>
          <div className="border-t border-slate-800 pt-2 mt-1">
            {role ? (
              <>
                <div className="flex items-center gap-2 px-3 py-2 text-sm text-slate-400">
                  <User size={13} className="text-blue-400" />
                  <span className="font-mono font-bold capitalize">{username}</span>
                </div>
                <button onClick={onSignOut} className="w-full flex items-center gap-2 text-sm text-rose-400 px-3 py-2 font-bold">
                  <LogOut size={14} /> Sign Out
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-sm bg-blue-600 text-white px-3 py-2 rounded-lg font-bold mx-3">
                <LogIn size={14} /> Sign In
              </Link>
            )}
          </div>
        </div>
      )}
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
  const [showPitchDeck, setShowPitchDeck] = useState(false);

  // Keyboard shortcut listener to toggle presentation mode instantly
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setShowPitchDeck(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('theme-light', 'bg-slate-50', 'text-slate-800');
      document.body.classList.remove('theme-dark', 'bg-slate-950', 'text-slate-200');
    } else {
      document.body.classList.add('theme-dark', 'bg-slate-950', 'text-slate-200');
      document.body.classList.remove('theme-light', 'bg-slate-50', 'text-slate-800');
    }
  }, [theme]);

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
    // Preserve theme across sign-out so dark/light preference is maintained
    const savedTheme = localStorage.getItem("cal_log_theme");
    localStorage.clear();
    if (savedTheme) localStorage.setItem("cal_log_theme", savedTheme);
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
        <Navbar role={role} username={username} onSignOut={handleSignOut} theme={theme} onToggleTheme={handleToggleTheme} onOpenPitchDeck={() => setShowPitchDeck(true)} />
        <main className="flex-grow flex flex-col">
          <Routes>
            <Route path="/" element={<ImpactDashboard />} />
            <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
            {/* Annotator Board — Jira-style Kanban */}
            <Route
              path="/board"
              element={
                <AnnotatorRoute role={role}>
                  <AnnotatorBoardPage username={username} />
                </AnnotatorRoute>
              }
            />
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
            {/* Project Management — manager only */}
            <Route
              path="/projects"
              element={
                <ManagerRoute role={role}>
                  <ProjectManagementPage username={username} />
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
        <PitchDeckModal isOpen={showPitchDeck} onClose={() => setShowPitchDeck(false)} />
      </div>
    </Router>
  );
}

export default App;
