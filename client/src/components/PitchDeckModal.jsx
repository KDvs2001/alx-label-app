import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Award, Brain, BarChart2, Lightbulb, Lock, ArrowRight, ShieldCheck, Database, Layers, Cpu } from 'lucide-react';

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
            title: "Understanding of the Problem",
            subtitle: "The Trillion-Dollar Bottleneck in AI Development",
            icon: Lightbulb,
            iconColor: "text-rose-400 bg-rose-500/10 border-rose-500/20",
            content: (
                <div className="space-y-6">
                    <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl text-center">
                        <p className={`text-base font-bold ${isLight ? 'text-rose-800' : 'text-rose-300'}`}>
                            Teaching an AI to read means paying people to label thousands of examples by hand. <span className="underline">It eats over 80% of an AI project's budget, and most of that spend is wasted.</span>
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4">
                        <div className={`p-5 rounded-2xl border transition-all ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'}`}>
                            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500 font-bold mb-3">1</div>
                            <h4 className={`font-bold ${isLight ? 'text-slate-800' : 'text-white'} text-sm`}>Picks the Wrong Data <span className="text-[10px] text-slate-500 font-normal">(selection)</span></h4>
                            <p className="text-xs text-slate-400 mt-2 leading-relaxed">Tools pick redundant, low-value examples to label, so effort goes to data the model learns nothing from.</p>
                        </div>
                        <div className={`p-5 rounded-2xl border transition-all ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'}`}>
                            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500 font-bold mb-3">2</div>
                            <h4 className={`font-bold ${isLight ? 'text-slate-800' : 'text-white'} text-sm`}>Ignores Real Effort <span className="text-[10px] text-slate-500 font-normal">(cost-blind)</span></h4>
                            <p className="text-xs text-slate-400 mt-2 leading-relaxed">A two-second tweet and a four-minute review are treated as equal cost, so long texts quietly drain the budget.</p>
                        </div>
                        <div className={`p-5 rounded-2xl border transition-all ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'}`}>
                            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500 font-bold mb-3">3</div>
                            <h4 className={`font-bold ${isLight ? 'text-slate-800' : 'text-white'} text-sm`}>Blind and Rigid <span className="text-[10px] text-slate-500 font-normal">(no trust)</span></h4>
                            <p className="text-xs text-slate-400 mt-2 leading-relaxed">Tools give confidence you can't trust, never adapt to the person, and can't explain why they chose an example.</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Project Overview & Product Value",
            subtitle: "CAL-Log is That Smarter Way",
            icon: Layers,
            iconColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
            content: (
                <div className="space-y-6">
                    <div className={`p-4 rounded-xl text-center border ${isLight ? 'bg-indigo-50 border-indigo-200 text-indigo-850' : 'bg-indigo-950/20 border-indigo-500/25 text-indigo-300'}`}>
                        <p className="text-base font-bold">CAL-Log acts as an intelligent plug-in for the labeling tools teams already use: it decides which example a person should label next.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <div className="space-y-3.5">
                            <div className="flex gap-3">
                                <div className="p-1 rounded bg-indigo-500/10 text-indigo-400 mt-0.5 font-bold text-xs shrink-0">Analogy</div>
                                <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'} leading-relaxed`}>
                                    <span className="font-bold text-slate-300">Think of a smart teacher:</span> instead of drilling you on all 1,000 flashcards, they hand you the single card that teaches you the most.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <div className="p-1 rounded bg-indigo-500/10 text-indigo-400 mt-0.5 font-bold text-xs shrink-0">Integration</div>
                                <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'} leading-relaxed`}>
                                    Delivers the same AI quality, at a fraction of the time and cost, with <span className="underline">zero changes</span> to how the team already works.
                                </p>
                            </div>
                        </div>

                        {/* Stats Panel */}
                        <div className={`p-5 rounded-2xl border grid grid-cols-3 gap-2 text-center ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'}`}>
                            <div>
                                <div className="text-2xl md:text-3xl font-black text-rose-500">3.88x</div>
                                <div className="text-[10px] text-slate-400 mt-1 font-semibold">faster to a good model</div>
                            </div>
                            <div>
                                <div className="text-2xl md:text-3xl font-black text-rose-500">59%</div>
                                <div className="text-[10px] text-slate-400 mt-1 font-semibold">less labeling cost</div>
                            </div>
                            <div>
                                <div className="text-2xl md:text-3xl font-black text-rose-500">10 / 7</div>
                                <div className="text-[10px] text-slate-400 mt-1 font-semibold">datasets / rivals beaten</div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Algorithmic Innovation & Science Core",
            subtitle: "Mathematically Optimizing Human Labeling Efficiencies",
            icon: Brain,
            iconColor: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
            content: (
                <div className="space-y-6">
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 text-center flex flex-col items-center justify-center">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">The Scoring Brain</span>
                        <code className="text-lg md:text-2xl font-mono text-indigo-400 font-bold">U(x) = H(x) / (α + β · log(1 + L))</code>
                        <span className="text-[10px] text-slate-400 mt-2">Scores every task: how much it teaches <span className="text-indigo-400">(entropy H(x))</span> divided by how long it takes to read <span className="text-indigo-400">(logarithmic word length L)</span>.</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Why it Wins:</h4>
                            <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-300'} leading-relaxed`}>
                                Earlier tools divided by raw word count and broke, chasing trivial one-liners. The logarithm fixes that, so the budget never goes on easy, repetitive text.
                            </p>
                            <div className="pt-2">
                                <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/25">Published in ACL (Ranked #1 globally in NLP)</span>
                            </div>
                        </div>
                        
                        <div className="text-xs">
                            <table className={`w-full text-left border-collapse border rounded-xl overflow-hidden ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'}`}>
                                <thead>
                                    <tr className={`border-b ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950/80 border-slate-800'}`}>
                                        <th className="p-2 font-bold text-slate-400">Feature Comparison</th>
                                        <th className="p-2 font-bold text-slate-500 text-center">Ordinary</th>
                                        <th className="p-2 font-bold text-indigo-400 text-center">CAL-Log</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className={`border-b ${isLight ? 'border-slate-100' : 'border-slate-800/40'}`}>
                                        <td className="p-2 text-slate-300 font-medium">Picks useful examples</td>
                                        <td className="p-2 text-center text-slate-500">✓</td>
                                        <td className="p-2 text-center text-indigo-400 font-bold">✓</td>
                                    </tr>
                                    <tr className={`border-b ${isLight ? 'border-slate-100' : 'border-slate-800/40'}`}>
                                        <td className="p-2 text-slate-300 font-medium">Values reading time</td>
                                        <td className="p-2 text-center text-rose-500">✗</td>
                                        <td className="p-2 text-center text-indigo-400 font-bold">✓</td>
                                    </tr>
                                    <tr className={`border-b ${isLight ? 'border-slate-100' : 'border-slate-800/40'}`}>
                                        <td className="p-2 text-slate-300 font-medium">Adapts to fatigue changes</td>
                                        <td className="p-2 text-center text-rose-500">✗</td>
                                        <td className="p-2 text-center text-indigo-400 font-bold">✓</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Product Stability, Reliability & Architecture",
            subtitle: "Production-Ready, Containerized Architecture",
            icon: ShieldCheck,
            iconColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
            content: (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <div className="space-y-3.5">
                            <div className="flex gap-2">
                                <div className="p-1 rounded bg-emerald-500/10 text-emerald-400 mt-0.5"><Cpu size={14} /></div>
                                <div>
                                    <h4 className={`font-bold ${isLight ? 'text-slate-850' : 'text-white'} text-xs`}>Microservice Segregation</h4>
                                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                                        Separates the Node.js API server from the Python active learning scoring engine. Under high load, resources scale independently.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <div className="p-1 rounded bg-emerald-500/10 text-emerald-400 mt-0.5"><Database size={14} /></div>
                                <div>
                                    <h4 className={`font-bold ${isLight ? 'text-slate-850' : 'text-white'} text-xs`}>State Persistence & Reliability</h4>
                                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                                        Mongoose/MongoDB safeguards state. Annotator disconnects trigger zero data loss; the system restores progress instantly on login.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className={`p-4 rounded-xl border flex flex-col justify-between h-full space-y-4 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'}`}>
                            <div className="text-center">
                                <span className="text-[9px] font-black uppercase text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">Product Testing Status</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-center text-xs">
                                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-900">
                                    <div className="font-bold text-white text-lg">288</div>
                                    <div className="text-[10px] text-slate-500 mt-0.5">Experiments run</div>
                                </div>
                                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-900">
                                    <div className="font-bold text-white text-lg">Docker</div>
                                    <div className="text-[10px] text-slate-500 mt-0.5">Containerized deploy</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Business Environment, User Needs & Compatibility",
            subtitle: "Interoperable Architecture Fitting Current Workflows",
            icon: Cpu,
            iconColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
            content: (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className={`p-4 rounded-xl border transition-all ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'}`}>
                            <h4 className={`font-bold ${isLight ? 'text-slate-850' : 'text-white'} text-sm`}>1. Compatibility</h4>
                            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                                Standard REST APIs enable CAL-Log to connect with tools like **Prodigy** or **Label Studio**, serving as an drop-in decision engine.
                            </p>
                        </div>
                        <div className={`p-4 rounded-xl border transition-all ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'}`}>
                            <h4 className={`font-bold ${isLight ? 'text-slate-850' : 'text-white'} text-sm`}>2. Interoperability</h4>
                            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                                Formats data payloads in standardized JSON structures, allowing easy data exports into ML training pipelines.
                            </p>
                        </div>
                        <div className={`p-4 rounded-xl border transition-all ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'}`}>
                            <h4 className={`font-bold ${isLight ? 'text-slate-850' : 'text-white'} text-sm`}>3. User Requirements</h4>
                            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                                Adapts to cognitive speed dynamically. Distributes high-complexity texts to analysts and rapid items to skimmers.
                            </p>
                        </div>
                    </div>

                    <div className="text-center pt-2">
                        <span className="text-xs text-indigo-400 font-bold bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                            Plug & Play Design: Standardize Quality, Reduce Costs, Zero Workflow Friction.
                        </span>
                    </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 p-0 md:p-6 animate-fade-in">
            <div className={`w-full h-full md:max-w-6xl md:max-h-[680px] md:rounded-3xl shadow-2xl relative flex flex-col justify-between overflow-hidden text-left transition-all ${
                isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-white'
            }`}>
                {/* Visual Top Glow */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-rose-500 z-20" />
                
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className={`absolute top-4 right-4 p-2 rounded-xl transition z-30 border ${
                        isLight 
                            ? 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200' 
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                    title="Exit Pitch Deck"
                >
                    <X size={18} />
                </button>

                {!isAuthenticated ? (
                    /* Lock Screen */
                    <div className="flex-grow flex flex-col items-center justify-center py-10 space-y-6 text-center">
                        <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                            <Lock size={30} className="animate-pulse" />
                        </div>
                        <div>
                            <h3 className={`text-xl font-black ${isLight ? 'text-slate-850' : 'text-white'}`}>CAL-Log Presentation</h3>
                            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">Please enter the pitch presentation passkey to unlock the deck.</p>
                        </div>
                        <form onSubmit={handlePasswordSubmit} className="w-full max-w-xs space-y-3">
                            <input
                                type="password"
                                required
                                value={passwordInput}
                                onChange={(e) => setPasswordInput(e.target.value)}
                                placeholder="Enter presentation passkey..."
                                className={`w-full px-4 py-3.5 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition font-mono ${
                                    isLight ? 'bg-white border border-slate-200 text-slate-850 shadow-inner' : 'bg-slate-900 border border-slate-800 text-white'
                                }`}
                            />
                            {errorMsg && (
                                <p className="text-xs text-rose-500 font-semibold">{errorMsg}</p>
                            )}
                            <button
                                type="submit"
                                className="w-full py-3.5 bg-gradient-to-r from-indigo-650 to-indigo-500 hover:from-indigo-600 hover:to-indigo-450 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/10 transition"
                            >
                                Access Deck <ArrowRight size={15} />
                            </button>
                        </form>
                    </div>
                ) : (
                    /* Full-Screen Slides Presentation View */
                    <>
                        {/* Slide Header */}
                        <div className={`p-6 md:p-8 pb-4 border-b flex flex-col sm:flex-row justify-between sm:items-center gap-4 ${
                            isLight ? 'border-slate-200/80 bg-white' : 'border-slate-900 bg-slate-950'
                        }`}>
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl border ${slides[currentSlide].iconColor}`}>
                                    <CurrentIcon size={22} />
                                </div>
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-rose-500 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded">
                                        Slide {currentSlide + 1} of {slides.length}
                                    </span>
                                    <h2 className={`text-xl md:text-2xl font-black mt-1 ${isLight ? 'text-slate-800' : 'text-white'}`}>{slides[currentSlide].title}</h2>
                                    <p className="text-xs text-slate-400 mt-0.5 font-medium">{slides[currentSlide].subtitle}</p>
                                </div>
                            </div>
                            
                            {/* Academic logos block mockup */}
                            <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0 border-l border-slate-800/20 pl-4">
                                <div className="text-right">
                                    <span className="text-[10px] font-bold text-rose-500 block leading-tight">CuttingEdge '26</span>
                                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Informatics Inst. Tech</span>
                                </div>
                            </div>
                        </div>

                        {/* Slide Body Content */}
                        <div className="flex-grow p-6 md:p-8 overflow-y-auto">
                            {slides[currentSlide].content}
                        </div>

                        {/* Slide Footer Navigation */}
                        <div className={`p-6 md:p-8 pt-4 border-t flex items-center justify-between ${
                            isLight ? 'border-slate-200/80 bg-white' : 'border-slate-900 bg-slate-950'
                        }`}>
                            <div className="flex gap-2.5">
                                {slides.map((_, i) => (
                                    <span 
                                        key={i} 
                                        className={`w-2.5 h-2.5 rounded-full transition-all duration-350 ${
                                            i === currentSlide ? 'bg-indigo-500 w-8' : 'bg-slate-800'
                                        }`} 
                                    />
                                ))}
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={prevSlide}
                                    disabled={currentSlide === 0}
                                    className={`p-2.5 rounded-xl border transition disabled:opacity-30 ${
                                        isLight 
                                            ? 'bg-slate-100 border-slate-250 text-slate-600 hover:bg-slate-200' 
                                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
                                    }`}
                                    title="Previous Slide"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <button
                                    onClick={currentSlide === slides.length - 1 ? onClose : nextSlide}
                                    className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-black rounded-xl transition flex items-center gap-2 shadow-lg shadow-indigo-500/10"
                                >
                                    {currentSlide === slides.length - 1 ? 'Start Live Demo' : 'Next Slide'} <ChevronRight size={15} />
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
