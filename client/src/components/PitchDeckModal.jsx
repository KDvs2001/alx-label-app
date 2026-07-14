import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Award, Brain, BarChart2, Lightbulb, Compass } from 'lucide-react';

const PitchDeckModal = ({ isOpen, onClose }) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            title: "The Problem: The Cost of AI Data Quality",
            icon: Lightbulb,
            iconColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
            content: (
                <div className="space-y-4">
                    <p className="text-slate-300 text-sm leading-relaxed">
                        Modern LLMs and computer vision models require massive amounts of annotated data. 
                        However, manual data labeling has two major bottlenecks:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                            <h4 className="font-bold text-white text-sm">1. High Financial Costs</h4>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">Annotating thousands of data points statically is wasteful. Up to 70% of random samples provide no learning signal to the AI models.</p>
                        </div>
                        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                            <h4 className="font-bold text-white text-sm">2. Cognitive Fatigue & Noise</h4>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">Human annotators get tired. As fatigue increases, labeling accuracy drops and cognitive noise corrupts the training set quality.</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Scientific Validation: Top-Tier NLP Publication",
            icon: Award,
            iconColor: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
            content: (
                <div className="space-y-4">
                    <p className="text-slate-300 text-sm leading-relaxed">
                        The core active learning algorithms powering this workspace are not just commercial features—they are backed by peer-reviewed academic research.
                    </p>
                    <div className="bg-indigo-950/20 border border-indigo-500/30 p-4 rounded-2xl flex items-center gap-4">
                        <div className="w-14 h-14 bg-indigo-500/20 rounded-xl border border-indigo-500/30 flex items-center justify-center font-black text-indigo-400 text-lg shrink-0">
                            ACL
                        </div>
                        <div>
                            <h4 className="font-black text-white text-sm">Association for Computational Linguistics (ACL)</h4>
                            <p className="text-xs text-slate-400 mt-1">Ranked #1 globally for Natural Language Processing and Computational Linguistics.</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                        {['EMNLP', 'NAACL', 'COLING'].map(conf => (
                            <div key={conf} className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-xs font-bold text-slate-300">
                                {conf} Publication
                            </div>
                        ))}
                    </div>
                </div>
            )
        },
        {
            title: "Technological Core: How CAL-Log Works",
            icon: Brain,
            iconColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
            content: (
                <div className="space-y-4">
                    <p className="text-slate-300 text-sm leading-relaxed">
                        Rather than treating all annotators as perfect machines, the CAL-Log algorithm continuously calibrates to the human in the loop.
                    </p>
                    <div className="space-y-3">
                        <div className="flex gap-3 items-start bg-slate-950/60 p-3 rounded-xl border border-slate-900">
                            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</span>
                            <div>
                                <h5 className="font-bold text-white text-xs">Priors & Calibration</h5>
                                <p className="text-[11px] text-slate-400 mt-0.5">The system seeds user profiles using a Pilot Test to set baseline reading speed and noise limits.</p>
                            </div>
                        </div>
                        <div className="flex gap-3 items-start bg-slate-950/60 p-3 rounded-xl border border-slate-900">
                            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</span>
                            <div>
                                <h5 className="font-bold text-white text-xs">Adaptive Cognitive Fatigue Pacing</h5>
                                <p className="text-[11px] text-slate-400 mt-0.5">As the annotator works, speed variations trigger dynamic pacing alerts to recover human baseline accuracy.</p>
                            </div>
                        </div>
                        <div className="flex gap-3 items-start bg-slate-950/60 p-3 rounded-xl border border-slate-900">
                            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</span>
                            <div>
                                <h5 className="font-bold text-white text-xs">Informative Sampling Selection</h5>
                                <p className="text-[11px] text-slate-400 mt-0.5">The backbone model only requests labeling for high-uncertainty (entropy) tasks, auto-labeling the rest.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Competitor Comparison & ROI Summary",
            icon: BarChart2,
            iconColor: "text-rose-400 bg-rose-500/10 border-rose-500/20",
            content: (
                <div className="space-y-4">
                    <p className="text-slate-300 text-sm leading-relaxed">
                        CAL-Log outperforms traditional labeling platforms by factoring in the human annotator's limits:
                    </p>
                    <table className="w-full text-xs text-left border-collapse bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
                        <thead>
                            <tr className="bg-slate-950/80 border-b border-slate-800">
                                <th className="p-2.5 font-bold text-slate-300">Feature</th>
                                <th className="p-2.5 font-bold text-slate-400">Prodigy / LabelStudio</th>
                                <th className="p-2.5 font-bold text-indigo-400">CAL-Log Portal</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-slate-800/40">
                                <td className="p-2.5 font-semibold text-slate-300">Active Learning</td>
                                <td className="p-2.5 text-slate-500">Standard (static thresholds)</td>
                                <td className="p-2.5 text-emerald-400 font-bold">Dynamic Calibration</td>
                            </tr>
                            <tr className="border-b border-slate-800/40">
                                <td className="p-2.5 font-semibold text-slate-300">Annotator Matching</td>
                                <td className="p-2.5 text-slate-500">Manual assignments</td>
                                <td className="p-2.5 text-emerald-400 font-bold">Reading Profile Matching</td>
                            </tr>
                            <tr>
                                <td className="p-2.5 font-semibold text-slate-300">Fatigue Tracking</td>
                                <td className="p-2.5 text-slate-500">None</td>
                                <td className="p-2.5 text-emerald-400 font-bold">Adaptive Load pacing</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )
        }
    ];

    const nextSlide = () => setCurrentSlide(prev => (prev < slides.length - 1 ? prev + 1 : prev));
    const prevSlide = () => setCurrentSlide(prev => (prev > 0 ? prev - 1 : prev));

    // Keyboard navigation (Left/Right Arrows)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isOpen) return;
            if (e.key === 'ArrowRight') nextSlide();
            if (e.key === 'ArrowLeft') prevSlide();
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    if (!isOpen) return null;

    const CurrentIcon = slides[currentSlide].icon;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
            <div className="bg-slate-950 border border-slate-800/80 rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl relative flex flex-col justify-between min-h-[460px] overflow-hidden text-left">
                {/* Visual Top Glow */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
                
                {/* Header */}
                <div className="flex items-start justify-between border-b border-slate-800/60 pb-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl border ${slides[currentSlide].iconColor}`}>
                            <CurrentIcon size={20} />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">NBQSA Slide {currentSlide + 1} of {slides.length}</span>
                            <h2 className="text-xl font-black text-white mt-0.5">{slides[currentSlide].title}</h2>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-1.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Body Content */}
                <div className="flex-1 pb-6">
                    {slides[currentSlide].content}
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between border-t border-slate-800/60 pt-4 mt-2">
                    <div className="flex gap-1">
                        {slides.map((_, i) => (
                            <span 
                                key={i} 
                                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                                    i === currentSlide ? 'bg-indigo-500 w-4' : 'bg-slate-800'
                                }`} 
                            />
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={prevSlide}
                            disabled={currentSlide === 0}
                            className="p-2 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-xl disabled:opacity-40 transition"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            onClick={currentSlide === slides.length - 1 ? onClose : nextSlide}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-indigo-500/10"
                        >
                            {currentSlide === slides.length - 1 ? 'Start Demo' : 'Next'} <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PitchDeckModal;
