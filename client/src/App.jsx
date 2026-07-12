// react-router-dom handles client-side routing in our single-page application
// CITATION: react-router-dom - declarative routing for React web applications
// SOURCE: React Router (n.d.). "react-router-dom"
// URL: https://reactrouter.com/en/main/start/overview
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import ImpactDashboard from "./pages/ImpactDashboard";
import ResearchWorkspace from "./components/ResearchWorkspace";
import ManagerDashboardPage from "./pages/ManagerDashboardPage";
// lucide-react provides tree-shakable SVG icon components
// CITATION: lucide-react - SVG icon library as React components
// SOURCE: Lucide (n.d.). "lucide-react"
// URL: https://lucide.dev/guide/packages/lucide-react
import { Terminal, TrendingUp, Edit3, ShieldAlert, BookOpen } from "lucide-react";

// controls navigation between the public impact dashboard and the private evaluator workspace
const Navbar = () => {
  // useLocation lets us read the current URL path to highlight the active menu item
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-white hover:text-blue-400 transition">
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white text-sm font-black">
            CAL
          </div>
          CAL-Log Portal
        </Link>
        <div className="flex items-center gap-4 font-semibold">
          {/* template literal toggles text colour based on whether this route is currently active */}
          <Link
            to="/"
            className={`flex items-center gap-1.5 text-xs transition-colors ${isActive('/') || isActive('/impact') ? 'text-white bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700' : 'text-slate-400 hover:text-white px-2 py-1.5'}`}
          >
            <TrendingUp size={14} />
            Impact Calculator
          </Link>
          <Link
            to="/workspace"
            className={`flex items-center gap-1.5 text-xs transition-colors ${isActive('/workspace') ? 'text-white bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 animate-pulse' : 'text-slate-400 hover:text-white px-2 py-1.5'}`}
          >
            <Edit3 size={14} />
            Annotator Workspace
          </Link>
          <Link
            to="/dashboard"
            className={`flex items-center gap-1.5 text-xs transition-colors ${isActive('/dashboard') ? 'text-white bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700' : 'text-slate-400 hover:text-white px-2 py-1.5'}`}
          >
            <ShieldAlert size={14} />
            Manager Dashboard
          </Link>
          <a
            href="https://cal-log-docs.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs transition-colors text-slate-400 hover:text-white px-2 py-1.5"
          >
            <BookOpen size={14} />
            Docs
          </a>
        </div>
      </div>
    </nav>
  );
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
        <Navbar />
        <main>
          {/* Routes handles the rendering of the correct page component based on the URL */}
          <Routes>
            <Route path="/" element={<ImpactDashboard />} />
            <Route path="/workspace" element={<ResearchWorkspace />} />
            <Route path="/dashboard" element={<ManagerDashboardPage />} />
            <Route path="/spy" element={<ManagerDashboardPage />} />
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
