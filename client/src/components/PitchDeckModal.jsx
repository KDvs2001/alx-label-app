import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Award, Brain, BarChart2, Lightbulb, Lock, ArrowRight } from 'lucide-react';

const PitchDeckModal = ({ isOpen, onClose }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [passwordInput, setPasswordInput] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem('pitch_deck_auth') === 'true');
    const [errorMsg, setErrorMsg] = useState('');
    const [isLight, setIsLight] = useState(() => document.body.classList.contains('theme-light'));

    // Dynamic theme detection
    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsLight(document.body.classList.contains('theme-light'));
        });
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        const expected = import.meta.env.VITE_PITCH_DECK_PASSWORD || 'LOVEmyself@21';
        if (passwordInput === expected) {
            setIsAuthenticated(true);
            sessionStorage.setItem('pitch_deck_auth', 'true');
            setErrorMsg('');
        } else {
            setErrorMsg('Invalid Pitch Deck passkey.');
        }
    };

    const slides = [
        {
            title: "The Problem: The Cost of AI Data Quality",
            icon: Lightbulb,
            iconColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
            content: (
                <div className="space-y-4">
                    <p className={`${isLight ? 'text-slate-600' : 'text-slate-300'} text-sm leading-relaxed`}>
                        Modern LLMs and computer vision models require massive amounts of annotated data. 
                        However, manual data labeling has two major bottlenecks:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <div className={`p-4 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'}`}>
                            <h4 className={`font-bold ${isLight ? 'text-slate-800' : 'text-white'} text-sm`}>1. High Financial Costs</h4>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">Annotating thousands of data points statically is wasteful. Up to 70% of random samples provide no learning signal to the AI models.</p>
                        </div>
                        <div className={`p-4 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'}`}>
                            <h4 className={`font-bold ${isLight ? 'text-slate-800' : 'text-white'} text-sm`}>2. Cognitive Fatigue & Noise</h4>
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
                    <p className={`${isLight ? 'text-slate-600' : 'text-slate-300'} text-sm leading-relaxed`}>
                        The core active learning algorithms powering this workspace are not just commercial features—they are backed by peer-reviewed academic research.
                    </p>
                    <div className={`border p-4 rounded-2xl flex items-center gap-4 ${isLight ? 'bg-indigo-50/50 border-indigo-200' : 'bg-indigo-950/20 border-indigo-500/30'}`}>
                        <div className="w-14 h-14 bg-indigo-500/20 rounded-xl border border-indigo-500/30 flex items-center justify-center font-black text-indigo-400 text-lg shrink-0">
                            ACL
                        </div>
                        <div>
                            <h4 className={`font-black text-sm ${isLight ? 'text-slate-800' : 'text-white'}`}>Association for Computational Linguistics (ACL)</h4>
                            <p className="text-xs text-slate-400 mt-1">Ranked #1 globally for Natural Language Processing and Computational Linguistics.</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                        {['EMNLP', 'NAACL', 'COLING'].map(conf => (
                            <div key={conf} className={`p-2.5 rounded-xl text-xs font-bold ${isLight ? 'bg-slate-50 border border-slate-200 text-slate-700' : 'bg-slate-900 border border-slate-800 text-slate-300'}`}>
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
                    <p className={`${isLight ? 'text-slate-600' : 'text-slate-300'} text-sm leading-relaxed`}>
                        Rather than treating all annotators as perfect machines, the CAL-Log algorithm continuously calibrates to the human in the loop.
                    </p>
                    <div className="space-y-3">
                        <div className={`flex gap-3 items-start p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-900'}`}>
                            <span className="w-5 h-5 rounded-full bg-blue-605 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</span>
                            <div>
                                <h5 className={`font-bold text-xs ${isLight ? 'text-slate-800' : 'text-white'}`}>Priors & Calibration</h5>
                                <p className="text-[11px] text-slate-400 mt-0.5">The system seeds user profiles using a Pilot Test to set baseline reading speed and noise limits.</p>
                            </div>
                        </div>
                        <div className={`flex gap-3 items-start p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-900'}`}>
                            <span className="w-5 h-5 rounded-full bg-blue-605 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</span>
                            <div>
                                <h5 className={`font-bold text-xs ${isLight ? 'text-slate-800' : 'text-white'}`}>Adaptive Cognitive Fatigue Pacing</h5>
                                <p className="text-[11px] text-slate-400 mt-0.5">As the annotator works, speed variations trigger dynamic pacing alerts to recover human baseline accuracy.</p>
                            </div>
                        </div>
                        <div className={`flex gap-3 items-start p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-900'}`}>
                            <span className="w-5 h-5 rounded-full bg-blue-605 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</span>
                            <div>
                                <h5 className={`font-bold text-xs ${isLight ? 'text-slate-800' : 'text-white'}`}>Informative Sampling Selection</h5>
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
                    <p className={`${isLight ? 'text-slate-600' : 'text-slate-300'} text-sm leading-relaxed`}>
                        CAL-Log outperforms traditional labeling platforms by factoring in the human annotator's limits:
                    </p>
                    <table className={`w-full text-xs text-left border-collapse border rounded-xl overflow-hidden ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'}`}>
                        <thead>
                            <tr className={`border-b ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/80 border-slate-800'}`}>
                                <th className="p-2.5 font-bold text-slate-400">Feature</th>
                                <th className="p-2.5 font-bold text-slate-400">Prodigy / LabelStudio</th>
                                <th className="p-2.5 font-bold text-indigo-400">CAL-Log Portal</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className={`border-b ${isLight ? 'border-slate-100' : 'border-slate-800/40'}`}>
                                <td className={`p-2.5 font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Active Learning</td>
                                <td className="p-2.5 text-slate-400">Standard (static thresholds)</td>
                                <td className="p-2.5 text-emerald-500 font-bold">Dynamic Calibration</td>
                            </tr>
                            <tr className={`border-b ${isLight ? 'border-slate-100' : 'border-slate-800/40'}`}>
                                <td className={`p-2.5 font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Annotator Matching</td>
                                <td className="p-2.5 text-slate-400">Manual assignments</td>
                                <td className="p-2.5 text-emerald-500 font-bold">Reading Profile Matching</td>
                            </tr>
                            <tr>
                                <td className={`p-2.5 font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Fatigue Tracking</td>
                                <td className="p-2.5 text-slate-400">None</td>
                                <td className="p-2.5 text-emerald-500 font-bold">Adaptive Load pacing</td>
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
            if (!isOpen || !isAuthenticated) return;
            if (e.key === 'ArrowRight') nextSlide();
            if (e.key === 'ArrowLeft') prevSlide();
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isAuthenticated]);

    if (!isOpen) return null;

    const CurrentIcon = slides[currentSlide].icon;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
            <div className={`border rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl relative flex flex-col justify-between min-h-[460px] overflow-hidden text-left transition-all ${
                isLight ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800/80'
            }`}>
                {/* Visual Top Glow */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
                
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1.5 bg-slate-900/10 border border-slate-800/10 text-slate-400 hover:text-white rounded-lg transition z-10"
                >
                    <X size={16} />
                </button>

                {!isAuthenticated ? (
                    /* Lock Screen */
                    <div className="flex-grow flex flex-col items-center justify-center py-10 space-y-6 text-center">
                        <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                            <Lock size={30} className="animate-pulse" />
                        </div>
                        <div>
                            <h3 className={`text-xl font-black ${isLight ? 'text-slate-800' : 'text-white'}`}>Pitch Deck Locked</h3>
                            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">Please enter your presentation passkey to unlock slides.</p>
                        </div>
                        <form onSubmit={handlePasswordSubmit} className="w-full max-w-xs space-y-3">
                            <input
                                type="password"
                                required
                                value={passwordInput}
                                onChange={(e) => setPasswordInput(e.target.value)}
                                placeholder="Enter presentation passkey..."
                                className={`w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition font-mono ${
                                    isLight ? 'bg-slate-100 border border-slate-200 text-slate-800' : 'bg-slate-950 border border-slate-800 text-white'
                                }`}
                            />
                            {errorMsg && (
                                <p className="text-xs text-rose-500 font-semibold">{errorMsg}</p>
                            )}
                            <button
                                type="submit"
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/10 transition"
                            >
                                Unlock Presentation <ArrowRight size={15} />
                            </button>
                        </form>
                    </div>
                ) : (
                    /* Slides Presentation View */
                    <>
                        {/* Header */}
                        <div className="flex items-start justify-between border-b border-slate-800/10 pb-4 mb-6">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl border ${slides[currentSlide].iconColor}`}>
                                    <CurrentIcon size={20} />
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">NBQSA Slide {currentSlide + 1} of {slides.length}</span>
                                    <h2 className={`text-xl font-black mt-0.5 ${isLight ? 'text-slate-800' : 'text-white'}`}>{slides[currentSlide].title}</h2>
                                </div>
                            </div>
                        </div>

                        {/* Body Content */}
                        <div className="flex-grow pb-6">
                            {slides[currentSlide].content}
                        </div>

                        {/* Footer Controls */}
                        <div className="flex items-center justify-between border-t border-slate-800/10 pt-4 mt-2">
                            <div className="flex gap-1">
                                {slides.map((_, i) => (
                                    <span 
                                        key={i} 
                                        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                                            i === currentSlide ? 'bg-indigo-505 w-4' : 'bg-slate-200'
                                        }`} 
                                    />
                                ))}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={prevSlide}
                                    disabled={currentSlide === 0}
                                    className="p-2 bg-slate-905 border border-slate-200/50 text-slate-600 hover:text-white rounded-xl disabled:opacity-40 transition"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    onClick={currentSlide === slides.length - 1 ? onClose : nextSlide}
                                    className="px-4 py-2 bg-indigo-650 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-indigo-550/10"
                                >
                                    {currentSlide === slides.length - 1 ? 'Start Demo' : 'Next'} <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default PitchDeckModal;
