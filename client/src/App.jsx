import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import ImpactDashboard from "./pages/ImpactDashboard";
import SimulationMode from "./pages/SimulationMode";
import SpyWindow from "./pages/SpyWindow";
import { Terminal, TrendingUp, Hand, Eye, PlayCircle } from "lucide-react";

// Simple Navbar Component
const Navbar = () => {
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
          <Link
            to="/simulation"
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${isActive('/simulation') ? 'text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <PlayCircle size={16} />
            Playback
          </Link>
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
          <Routes>
            <Route path="/" element={<ImpactDashboard />} />
            <Route path="/simulation" element={<SimulationMode />} />
            <Route path="/spy" element={<SpyWindow />} />
            <Route path="/impact" element={<ImpactDashboard />} />
            <Route path="*" element={<ImpactDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
