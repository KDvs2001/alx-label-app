import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, FastForward, RotateCcw, Activity, DollarSign, TrendingUp, Archive, BarChart2 } from 'lucide-react';

const ProgressBar = ({ label, value, max, color, subtext, icon: Icon }) => (
    <div className="mb-6">
        <div className="flex justify-between items-end mb-2">
            <div className="flex items-center gap-2">
                {Icon && <Icon size={18} className={`text-${color}-400`} />}
                <span className="text-slate-300 font-medium">{label}</span>
            </div>
            <div className="text-right">
                <span className={`text-2xl font-bold text-${color}-400`}>{value}</span>
                <span className="text-xs text-slate-500 ml-2">{subtext}</span>
            </div>
        </div>
        <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <div
                className={`h-full bg-${color}-500 transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(0,0,0,0.3)]`}
                style={{ width: `${Math.min((parseFloat(value) / max) * 100, 100)}%` }}
            />
        </div>
    </div>
);

const SimulationMode = () => {
    // 1. Hooks
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(100);
    const timerRef = useRef(null);

    const [logsByDataset, setLogsByDataset] = useState({}); // { dataset: { strategy: [steps] } }
    const [datasets, setDatasets] = useState([]);
    const [strategies, setStrategies] = useState([]);

    const [selectedDataset, setSelectedDataset] = useState("");
    const [selectedStrategy, setSelectedStrategy] = useState("CAL-Log"); // Default challenger

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 2. Derived State
    const activeDatasetLogs = logsByDataset[selectedDataset] || {};

    // Get Random baseline and Selected challenger logs
    const randomLogs = activeDatasetLogs["Random"] || [];
    const challengerLogs = activeDatasetLogs[selectedStrategy] || [];

    // Safe current step data
    const currentRandom = randomLogs[currentIndex] || randomLogs[randomLogs.length - 1] || { cost: 0, accuracy: 0, f1: 0, round: 0 };
    const currentChallenger = challengerLogs[currentIndex] || challengerLogs[challengerLogs.length - 1] || { cost: 0, accuracy: 0, f1: 0, round: 0 };

    const maxSteps = Math.max(randomLogs.length, challengerLogs.length);
    const hasData = maxSteps > 0;
    const isFinished = hasData && currentIndex >= maxSteps - 1;

    // 3. Effects
    useEffect(() => {
        fetch('/results.csv')
            .then(res => {
                if (!res.ok) throw new Error("Could not find 'results.csv'.");
                return res.text();
            })
            .then(csvText => {
                const { parsedData, datasetList, strategyList } = parseCSV(csvText);
                setLogsByDataset(parsedData);
                setDatasets(datasetList);
                setStrategies(strategyList.filter(s => s !== 'Random')); // Exclude Random from challenger list

                if (datasetList.length > 0) setSelectedDataset(datasetList[0]);
                setLoading(false);
            })
            .catch(err => {
                console.error("CSV Error:", err);
                setError(err.message);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        if (isPlaying && !isFinished) {
            timerRef.current = setInterval(() => {
                setCurrentIndex(prev => {
                    if (prev >= maxSteps - 1) {
                        setIsPlaying(false);
                        return prev;
                    }
                    return prev + 1;
                });
            }, speed);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [isPlaying, isFinished, speed, maxSteps]);

    // Reset when dataset/strategy changes
    useEffect(() => {
        setCurrentIndex(0);
        setIsPlaying(false);
    }, [selectedDataset, selectedStrategy]);

    // 4. Helpers
    const parseCSV = (text) => {
        const lines = text.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

        // Helper to find column index loosely
        const getIdx = (key) => headers.findIndex(h => h.includes(key));
        const idxMap = {
            round: getIdx('round'),
            dataset: getIdx('dataset'),
            strategy: getIdx('strategy'),
            cost: getIdx('cost'),
            f1: getIdx('f1'),
            acc: getIdx('accur') // accuracy
        };

        const parsedData = {};
        const strategiesSet = new Set();
        const datasetsSet = new Set();

        lines.slice(1).forEach(line => {
            const cols = line.split(',');
            if (cols.length < 3) return;

            const round = parseInt(cols[idxMap.round]);
            const dataset = cols[idxMap.dataset]?.trim() || "unknown";
            const strategy = cols[idxMap.strategy]?.trim() || "Unknown";
            const cost = parseFloat(cols[idxMap.cost]) || 0;
            const f1 = parseFloat(cols[idxMap.f1]) || 0;
            const acc = parseFloat(cols[idxMap.acc]) || 0;

            if (isNaN(round)) return;

            strategiesSet.add(strategy);
            datasetsSet.add(dataset);

            if (!parsedData[dataset]) parsedData[dataset] = {};
            if (!parsedData[dataset][strategy]) parsedData[dataset][strategy] = [];

            // Only store relevant metrics
            parsedData[dataset][strategy].push({ round, cost, f1, acc });
        });

        // Parse and sort
        Object.keys(parsedData).forEach(ds => {
            Object.keys(parsedData[ds]).forEach(strat => {
                parsedData[ds][strat].sort((a, b) => a.round - b.round);
            });
        });

        return {
            parsedData,
            datasetList: Array.from(datasetsSet).sort(),
            strategyList: Array.from(strategiesSet).sort()
        };
    };

    // 5. Render
    if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500 font-mono">Loading Data...</div>;
    // if (error) return ... (allow trying regardless)

    // Metrics
    const randomF1 = currentRandom.f1 || currentRandom.accuracy || 0;
    const challengerF1 = currentChallenger.f1 || currentChallenger.accuracy || 0;
    const randomCost = currentRandom.cost || 1;
    const challengerCost = currentChallenger.cost || 1;

    const costSavings = randomCost - challengerCost;
    // Efficiency: (Acc/Cost) ratio comparison
    const efficiencyMult = ((challengerF1 / Math.max(challengerCost, 1)) / (Math.max(randomF1 / Math.max(randomCost, 1), 0.000001)));

    return (
        <div className="p-8 max-w-6xl mx-auto animate-in fade-in duration-500">

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-400">
                        Experimental Playback
                    </h1>

                    <div className="flex flex-wrap items-center gap-4 mt-3">
                        {/* Dataset Selector */}
                        <div className="flex items-center gap-2">
                            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Dataset</span>
                            <select
                                value={selectedDataset}
                                onChange={(e) => setSelectedDataset(e.target.value)}
                                className="bg-slate-800 border border-slate-700 text-white text-sm rounded px-3 py-1 focus:outline-none focus:border-blue-500"
                            >
                                {datasets.map(ds => <option key={ds} value={ds}>{ds}</option>)}
                            </select>
                        </div>

                        {/* Strategy Selector */}
                        <div className="flex items-center gap-2">
                            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">vs Strategy</span>
                            <select
                                value={selectedStrategy}
                                onChange={(e) => setSelectedStrategy(e.target.value)}
                                className="bg-slate-800 border border-slate-700 text-blue-400 font-bold text-sm rounded px-3 py-1 focus:outline-none focus:border-blue-500"
                            >
                                {strategies.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <button onClick={() => { setCurrentIndex(0); setIsPlaying(false); }} className="p-2 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition">
                        <RotateCcw size={20} />
                    </button>
                    <button
                        onClick={() => { if (isFinished) setCurrentIndex(0); else setIsPlaying(!isPlaying); }}
                        className={`px-6 py-2 rounded-md font-bold flex items-center gap-2 transition-all ${isPlaying ? 'bg-amber-500/10 text-amber-500 border border-amber-500/50' : 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20'}`}
                    >
                        {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                        {isPlaying ? "Pause" : (isFinished ? "Replay" : "Start")}
                    </button>
                    <div className="h-6 w-px bg-slate-700 mx-2" />
                    <button onClick={() => setSpeed(200)} className={`text-xs font-bold px-2 py-1 rounded ${speed === 200 ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>1x</button>
                    <button onClick={() => setSpeed(50)} className={`text-xs font-bold px-2 py-1 rounded ${speed === 50 ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>4x</button>
                    <button onClick={() => setSpeed(10)} className={`text-xs font-bold px-2 py-1 rounded ${speed === 10 ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>Max</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Visualizer Lanes */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Lane 1: Random (Baseline) */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                            <Archive size={100} />
                        </div>
                        <h3 className="text-slate-400 font-bold mb-6 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-slate-500" /> BASELINE: Random Sampling
                        </h3>

                        <ProgressBar
                            label="Reading Cost"
                            value={randomCost.toLocaleString()}
                            max={5000}
                            color="slate"
                            subtext="characters"
                            icon={DollarSign}
                        />
                        <ProgressBar
                            label="Model Accuracy (F1)"
                            value={(randomF1 * 100).toFixed(1)}
                            max={100}
                            color="orange"
                            subtext="%"
                            icon={Activity}
                        />
                    </div>

                    {/* Lane 2: Challenger (Selected Strategy) */}
                    <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-xl p-6 relative overflow-hidden shadow-2xl transition-all duration-500">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
                        <h3 className="text-blue-400 font-bold mb-6 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" /> CHALLENGER: {selectedStrategy}
                        </h3>

                        <ProgressBar
                            label="Reading Cost"
                            value={challengerCost.toLocaleString()}
                            max={5000}
                            color="blue"
                            subtext="characters"
                            icon={DollarSign}
                        />
                        <ProgressBar
                            label="Model Accuracy (F1)"
                            value={(challengerF1 * 100).toFixed(1)}
                            max={100}
                            color="green"
                            subtext="%"
                            icon={Activity}
                        />
                    </div>
                </div>

                {/* Scorecard Sidebar */}
                <div className="space-y-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Experimental Step</span>
                        <div className="text-5xl font-mono text-white mt-1 mb-1">{currentRandom.round}</div>
                        <div className="text-sm text-slate-400">Total Rounds</div>
                    </div>

                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                        <span className="text-xs font-bold text-green-400 uppercase tracking-wider flex items-center gap-2">
                            <BarChart2 size={14} /> Performance Gap
                        </span>
                        <div className="mt-4 space-y-4">
                            <div>
                                <div className={`text-3xl font-bold mb-1 ${efficiencyMult >= 1 ? 'text-green-400' : 'text-red-400'}`}>
                                    {efficiencyMult.toFixed(1)}x
                                </div>
                                <div className="text-xs text-slate-400">Efficiency Multiplier</div>
                            </div>
                            <div className="h-px bg-slate-700" />
                            <div>
                                <div className={`text-3xl font-bold mb-1 ${costSavings > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {costSavings > 0 ? '-' : '+'}{Math.abs(costSavings).toLocaleString()}
                                </div>
                                <div className="text-xs text-slate-400">Characters Saved</div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-blue-900/20 border border-blue-500/20 rounded-lg text-xs text-blue-300/80 leading-relaxed">
                        <strong className="text-blue-400 block mb-1">Benchmark Stats:</strong>
                        Comparing <b>{selectedStrategy}</b> against Random baseline on the <b>{selectedDataset}</b> dataset.
                        {efficiencyMult > 2 && <span className="block mt-2 text-green-300">✅ <strong>Strong Result:</strong> {selectedStrategy} is significantly more efficient.</span>}
                        {efficiencyMult < 1 && <span className="block mt-2 text-red-300">⚠️ <strong>Weak Result:</strong> {selectedStrategy} is underperforming baseline.</span>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SimulationMode;
