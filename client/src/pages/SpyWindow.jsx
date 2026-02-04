import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, Brain, Zap, Clock } from 'lucide-react';

const SpyWindow = () => {
    const [metrics, setMetrics] = useState(null);
    const [history, setHistory] = useState([]);
    const [lastStep, setLastStep] = useState(-1);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const response = await fetch('/spy_metrics.json?t=' + Date.now());
                if (response.ok) {
                    const data = await response.json();
                    setMetrics(data);

                    if (data.train_step > lastStep) {
                        setLastStep(data.train_step);
                        setHistory(prev => {
                            const newHistory = [...prev, {
                                step: data.train_step,
                                alpha: data.current_alpha,
                                beta: data.current_beta
                            }];
                            return newHistory.slice(-20);
                        });
                    }
                }
            } catch (error) {
                console.error("Waiting for metrics...", error);
            }
        };

        const interval = setInterval(fetchMetrics, 1000);
        return () => clearInterval(interval);
    }, [lastStep]);

    if (!metrics) return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-10 text-center">
            <div>
                <Brain className="w-16 h-16 text-gray-500 mx-auto mb-4 animate-pulse" />
                <h2 className="text-xl font-semibold">Waiting for CAL-Log Signal...</h2>
                <p className="text-gray-400 mt-2">Annotate a task in LabelStudio to wake up the Brain.</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            {/* Header */}
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
                <Brain className="text-pink-500" size={32} />
                CAL-Log "Spy Window"
                <span className="text-sm bg-green-500 text-black px-2 py-1 rounded-full ml-4 animate-pulse">LIVE</span>
            </h1>

            {/* LabelStudio Embed */}
            <div className="w-full h-[600px] bg-white rounded-xl overflow-hidden border border-gray-700 mb-8">
                <iframe
                    src="http://localhost:8080/projects"
                    title="Label Studio"
                    className="w-full h-full"
                    style={{ border: 'none' }}
                />
            </div>

            {/* Grid (Metrics) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Alpha Card */}
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-400">Alpha (Overhead)</span>
                        <Zap className="text-yellow-400" size={24} />
                    </div>
                    <div className="text-4xl font-bold text-yellow-400">
                        {metrics.current_alpha.toFixed(2)}s
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Fixed setup cost per task</p>
                </div>

                {/* Beta Card */}
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-400">Beta (Speed)</span>
                        <Clock className="text-blue-400" size={24} />
                    </div>
                    <div className="text-4xl font-bold text-blue-400">
                        {metrics.current_beta.toFixed(2)}s
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Seconds per word read</p>
                </div>

                {/* Steps Card */}
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-400">Knowledge Steps</span>
                        <Activity className="text-green-400" size={24} />
                    </div>
                    <div className="text-4xl font-bold text-green-400">
                        {metrics.train_step}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Model fine-tuning iterations</p>
                </div>
            </div>

            {/* Chart */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 h-64 mb-8">
                <h2 className="text-xl font-semibold mb-4">Parameter Adaptation (Real-Time)</h2>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={history}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="step" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', color: '#fff' }} />
                        <Legend />
                        <Line type="monotone" dataKey="alpha" stroke="#FACC15" strokeWidth={3} name="Alpha" dot={false} />
                        <Line type="monotone" dataKey="beta" stroke="#60A5FA" strokeWidth={3} name="Beta" dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SpyWindow;
