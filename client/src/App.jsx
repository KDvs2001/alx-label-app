// react-router-dom handles client-side routing in our single-page application
// CITATION: react-router-dom - declarative routing for React web applications
// SOURCE: React Router (n.d.). "react-router-dom"
// URL: https://reactrouter.com/en/main/start/overview
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import ImpactDashboard from "./pages/ImpactDashboard";
import ResearchWorkspace from "./components/ResearchWorkspace";
// lucide-react provides tree-shakable SVG icon components
// CITATION: lucide-react - SVG icon library as React components
// SOURCE: Lucide (n.d.). "lucide-react"
// URL: https://lucide.dev/guide/packages/lucide-react
import { Terminal, TrendingUp, Eye } from "lucide-react";

// controls navigation between the public impact dashboard and the private evaluator workspace
const Navbar = () => {
  // useLocation lets us read the current URL path to highlight the active menu item
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-white hover:text-blue-400 transition">
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white">
            <Terminal size={18} />
          </div>
          CAL-Log Research Tool
        </Link>
        <div className="flex items-center gap-4">
          {/* template literal toggles text colour based on whether this route is currently active */}
          <Link
            to="/"
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${isActive('/') ? 'text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <TrendingUp size={16} />
            Impact
          </Link>
          <Link
            to="/spy"
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${isActive('/spy') ? 'text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <Eye size={16} />
            Spy Window
          </Link>
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
            <Route path="/spy" element={<ResearchWorkspace />} />
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
