import React from 'react';
import { BookOpen, Zap, TrendingUp } from 'lucide-react';

const ParameterExplanation = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Card 1: Alpha */}
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50 hover:border-blue-500/50 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Zap className="text-blue-400" size={24} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">α (Alpha)</h3>
                <p className="text-xs font-mono text-blue-400 mb-2">Default: 5.0 seconds</p>
                <p className="text-sm text-slate-400 leading-relaxed">
                    The <strong>"Switching Cost"</strong>. Represents the mental overhead to stop one task and start another, regardless of length.
                </p>
            </div>

            {/* Card 2: Beta */}
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50 hover:border-purple-500/50 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <BookOpen className="text-purple-400" size={24} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">β (Beta)</h3>
                <p className="text-xs font-mono text-purple-400 mb-2">Default: 3.0</p>
                <p className="text-sm text-slate-400 leading-relaxed">
                    The <strong>"Reading Speed"</strong>. Measures how much harder a task becomes as it gets longer. Higher Beta = Penalty for long text.
                </p>
            </div>

            {/* Card 3: Log-Length */}
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50 hover:border-green-500/50 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <TrendingUp className="text-green-400" size={24} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Log(Length)</h3>
                <p className="text-xs font-mono text-green-400 mb-2">Sublinear Scaling</p>
                <p className="text-sm text-slate-400 leading-relaxed">
                    Humans <strong>skim and scan</strong>. A 1000-word text doesn't take 10x longer than a 100-word text to categorize.
                </p>
            </div>

        </div>
    );
};

export default ParameterExplanation;
