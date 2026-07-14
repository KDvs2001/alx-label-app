import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Award, Brain, BarChart2, Lightbulb, Lock, ArrowRight, ShieldCheck, Database, Layers, Cpu, Users, Smartphone, Zap } from 'lucide-react';

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
            iconColor: "text-rose-500 bg-rose-500/10 border-rose-500/20",
            content: (
                <div className="space-y-6">
                    <div className={`p-5 rounded-2xl border text-center transition-all ${
                        isLight ? 'bg-rose-50 border-rose-200' : 'bg-rose-950/20 border-rose-500/20'
                    }`}>
                        <p className={`text-lg md:text-xl font-bold ${isLight ? 'text-rose-800' : 'text-rose-300'} leading-relaxed`}>
                            Teaching an AI to read means paying people to label thousands of examples by hand. <span className="text-rose-500 font-extrabold underline block mt-1.5">It eats over 80% of an AI project's budget, and most of that spend is wasted.</span>
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                        <div className={`p-6 rounded-2xl border hover:scale-102 hover:border-rose-500/40 hover:shadow-lg transition-all duration-300 flex flex-col gap-3 relative overflow-hidden ${
                            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-slate-800'
                        }`}>
                            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 font-black text-sm shrink-0">1</div>
                            <h4 className={`font-black ${isLight ? 'text-slate-800' : 'text-white'} text-base`}>Picks the Wrong Data <span className="text-xs text-rose-500 font-extrabold block uppercase tracking-wider mt-0.5">selection</span></h4>
                            <p className="text-xs text-slate-400 leading-relaxed mt-1">Tools pick redundant, low-value examples to label, so effort goes to data the model learns nothing from.</p>
                        </div>
                        <div className={`p-6 rounded-2xl border hover:scale-102 hover:border-rose-500/40 hover:shadow-lg transition-all duration-300 flex flex-col gap-3 relative overflow-hidden ${
                            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-slate-800'
                        }`}>
                            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 font-black text-sm shrink-0">2</div>
                            <h4 className={`font-black ${isLight ? 'text-slate-800' : 'text-white'} text-base`}>Ignores Real Effort <span className="text-xs text-rose-500 font-extrabold block uppercase tracking-wider mt-0.5">cost-blind</span></h4>
                            <p className="text-xs text-slate-400 leading-relaxed mt-1">A two-second tweet and a four-minute review are treated as equal cost, so long texts quietly drain the budget.</p>
                        </div>
                        <div className={`p-6 rounded-2xl border hover:scale-102 hover:border-rose-500/40 hover:shadow-lg transition-all duration-300 flex flex-col gap-3 relative overflow-hidden ${
                            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-slate-800'
                        }`}>
                            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 font-black text-sm shrink-0">3</div>
                            <h4 className={`font-black ${isLight ? 'text-slate-800' : 'text-white'} text-base`}>Blind and Rigid <span className="text-xs text-rose-500 font-extrabold block uppercase tracking-wider mt-0.5">no trust</span></h4>
                            <p className="text-xs text-slate-400 leading-relaxed mt-1">Tools give confidence you can't trust, never adapt to the person, and can't explain why they chose an example.</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Project Overview",
            subtitle: "CAL-Log is That Smarter Way",
            icon: Layers,
            iconColor: "text-blue-500 bg-blue-500/10 border-blue-500/20",
            content: (
                <div className="space-y-6">
                    <div className={`p-5 rounded-2xl text-center border transition-all ${
                        isLight ? 'bg-indigo-50 border-indigo-200' : 'bg-indigo-950/20 border-indigo-500/20'
                    }`}>
                        <p className={`text-base font-bold ${isLight ? 'text-indigo-950' : 'text-indigo-300'} leading-relaxed`}>
                            It is a <span className="text-indigo-500 font-extrabold underline">plug-in for the labeling tools teams already use</span>: it decides which example a person should label next.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <div className="space-y-4">
                            <div className="flex gap-3.5 items-start">
                                <div className="p-1 rounded bg-indigo-500/10 text-indigo-400 font-black text-[10px] shrink-0 mt-0.5 uppercase tracking-wider">Analogy</div>
                                <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'} leading-relaxed`}>
                                    <span className="font-extrabold text-slate-300">Think of a smart teacher:</span> instead of drilling you on all 1,000 flashcards, they hand you the one that teaches you the most.
                                </p>
                            </div>
                            <div className="flex gap-3.5 items-start">
                                <div className="p-1 rounded bg-indigo-500/10 text-indigo-400 font-black text-[10px] shrink-0 mt-0.5 uppercase tracking-wider">Outcome</div>
                                <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'} leading-relaxed`}>
                                    Same AI quality, a fraction of the time and cost, with <span className="underline font-bold">no change</span> to how the team already works.
                                </p>
                            </div>
                        </div>

                        {/* Large Metric Cards */}
                        <div className="grid grid-cols-3 gap-3.5">
                            <div className={`p-4 rounded-2xl border text-center transition-all hover:scale-105 duration-300 ${
                                isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
                            }`}>
                                <div className="text-3xl md:text-4xl font-black text-rose-500">3.88x</div>
                                <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-wider leading-tight">faster to a good model</p>
                            </div>
                            <div className={`p-4 rounded-2xl border text-center transition-all hover:scale-105 duration-300 ${
                                isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
                            }`}>
                                <div className="text-3xl md:text-4xl font-black text-rose-500">59%</div>
                                <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-wider leading-tight">less labeling cost</p>
                            </div>
                            <div className={`p-4 rounded-2xl border text-center transition-all hover:scale-105 duration-300 ${
                                isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
                            }`}>
                                <div className="text-3xl md:text-4xl font-black text-rose-500">10 / 7</div>
                                <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-wider leading-tight">datasets / rivals beaten</p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Business Environment",
            subtitle: "Market Scale & Commerical Viability",
            icon: BarChart2,
            iconColor: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
            content: (
                <div className="space-y-6">
                    <div className={`p-5 rounded-2xl border text-center transition-all ${
                        isLight ? 'bg-rose-50 border-rose-200' : 'bg-rose-950/20 border-rose-500/20'
                    }`}>
                        <p className={`text-base font-bold ${isLight ? 'text-rose-800' : 'text-rose-350'} leading-relaxed`}>
                            The data-labeling market is worth billions and growing fast. <span className="text-rose-500 font-extrabold underline block mt-1">Meta paid $14B for a single labeling company in 2025.</span>
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                        {[
                            { title: "Same Model, Half the Bill", desc: "It cuts the single biggest AI cost, human labeling, by well over half.", num: "1", color: "text-blue-400 border-blue-500/25 bg-blue-500/5" },
                            { title: "Cheap to Run & Scale", desc: "Auto-scaling cloud services with tiny overhead per user, and near-zero cost when idle.", num: "2", color: "text-purple-400 border-purple-500/25 bg-purple-500/5" },
                            { title: "Clear Go-To-Market", desc: "Licensed as a paid plug-in for platforms teams already use, like Label Studio: new value, no new tool to buy.", num: "3", color: "text-amber-400 border-amber-500/25 bg-amber-500/5" },
                            { title: "Validated Demand", desc: "31+ external experts confirmed it is commercially useful for real annotation work.", num: "4", color: "text-emerald-400 border-emerald-500/25 bg-emerald-500/5" }
                        ].map(card => (
                            <div key={card.title} className={`p-5 rounded-2xl border hover:scale-102 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col gap-2 relative overflow-hidden ${
                                isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-slate-800'
                            }`}>
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs border ${card.color}`}>{card.num}</div>
                                <h4 className={`font-black ${isLight ? 'text-slate-800' : 'text-white'} text-sm mt-1.5`}>{card.title}</h4>
                                <p className="text-xs text-slate-400 leading-relaxed mt-0.5">{card.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )
        },
        {
            title: "Compatibility & Interoperability",
            subtitle: "Zero Friction Integration Into Existing Developer Stacks",
            icon: Cpu,
            iconColor: "text-purple-500 bg-purple-500/10 border-purple-500/20",
            content: (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { title: "Works Anywhere", desc: "Runs in any browser; ships in Docker for any computer or cloud.", icon: Smartphone, color: "text-blue-400 bg-blue-500/10" },
                            { title: "Easy to Connect", desc: "Clean, standard APIs that any system can talk to.", icon: Zap, color: "text-indigo-400 bg-indigo-500/10" },
                            { title: "Drops Into Your Tools", desc: "Installs as a plug-in for Label Studio and reads any common data file.", icon: Layers, color: "text-purple-400 bg-purple-500/10" },
                            { title: "No Lock-In", desc: "The underlying AI model can be swapped out freely.", icon: Brain, color: "text-rose-400 bg-rose-500/10" }
                        ].map(card => (
                            <div key={card.title} className={`p-5 rounded-2xl border hover:scale-102 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col gap-2 relative overflow-hidden ${
                                isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-slate-800'
                            }`}>
                                <div className={`p-2 rounded-xl w-10 h-10 flex items-center justify-center shrink-0 ${card.color}`}>
                                    <card.icon size={18} />
                                </div>
                                <h4 className={`font-black ${isLight ? 'text-slate-800' : 'text-white'} text-sm mt-1.5`}>{card.title}</h4>
                                <p className="text-xs text-slate-400 leading-relaxed mt-0.5">{card.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )
        },
        {
            title: "User Requirements",
            subtitle: "Human-Centric Workspace Calibrated for Annotators",
            icon: Users,
            iconColor: "text-amber-500 bg-amber-500/10 border-amber-500/20",
            content: (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { title: "Built Around Real Users", desc: "Designed from interviews and feedback with real annotators.", color: "border-blue-500/20 bg-blue-500/5 text-blue-400" },
                            { title: "Protects the Annotator", desc: "Tiredness alerts and resumable sessions keep the work humane.", color: "border-indigo-500/20 bg-indigo-500/5 text-indigo-400" },
                            { title: "Always Transparent", desc: "A live window shows exactly why each text was chosen.", color: "border-purple-500/20 bg-purple-500/5 text-purple-400" },
                            { title: "Shows Real Impact", desc: "A dashboard reports the time and money saved each session.", color: "border-rose-500/20 bg-rose-500/5 text-rose-400" }
                        ].map(card => (
                            <div key={card.title} className={`p-5 rounded-2xl border hover:scale-102 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col gap-2.5 relative overflow-hidden ${
                                isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-slate-800'
                            }`}>
                                <h4 className={`font-black ${isLight ? 'text-slate-800' : 'text-white'} text-sm`}>{card.title}</h4>
                                <p className="text-xs text-slate-400 leading-relaxed">{card.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )
        },
        {
            title: "Content & Standards",
            subtitle: "Validated Engineering and Peer-Reviewed Science Core",
            icon: ShieldCheck,
            iconColor: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
            content: (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { title: "Proven on Real Data", desc: "Tested against 7 leading methods on 10 public datasets, with honest, repeatable results.", color: "border-emerald-500/25 bg-emerald-500/5 text-emerald-400" },
                            { title: "Engineering Standards", desc: "Clean architecture, documented APIs, and code-quality audits throughout.", color: "border-teal-500/25 bg-teal-500/5 text-teal-400" },
                            { title: "Privacy & Compliance", desc: "GDPR-aligned by design: no trackers, no personal data, checked by independent scanners.", color: "border-cyan-500/25 bg-cyan-500/5 text-cyan-400" },
                            { title: "Peer-Reviewed Quality", desc: "4 papers accepted, including an A* at ACL 2026, plus ICAIIC, IEEE SCSE and IEEE CSNT.", color: "border-indigo-500/25 bg-indigo-500/5 text-indigo-400" }
                        ].map(card => (
                            <div key={card.title} className={`p-5 rounded-2xl border hover:scale-102 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col gap-2.5 relative overflow-hidden ${
                                isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-slate-800'
                            }`}>
                                <h4 className={`font-black ${isLight ? 'text-slate-800' : 'text-white'} text-sm`}>{card.title}</h4>
                                <p className="text-xs text-slate-400 leading-relaxed">{card.desc}</p>
                            </div>
                        ))}
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
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 z-20" />
                
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className={`absolute top-4 right-4 p-2 rounded-xl transition z-30 border ${
                        isLight 
                            ? 'bg-slate-100 border-slate-205 text-slate-650 hover:bg-slate-200' 
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                    title="Exit Presentation"
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
                            <h3 className={`text-xl font-black ${isLight ? 'text-slate-850' : 'text-white'}`}>CAL-Log Product Presentation</h3>
                            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">Please enter the pitch presentation passkey to unlock the slides.</p>
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
                                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/10 transition"
                            >
                                Access Deck <ArrowRight size={15} />
                            </button>
                        </form>
                    </div>
                ) : (
                    /* Full-Screen Slides Presentation View */
                    <>
                        {/* Slide Header */}
                        <div className={`p-6 md:p-8 pb-4 border-b flex justify-between items-center ${
                            isLight ? 'border-slate-200/80 bg-white' : 'border-slate-905 bg-slate-950'
                        }`}>
                            <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-xl border ${slides[currentSlide].iconColor}`}>
                                    <CurrentIcon size={24} />
                                </div>
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
                                        Slide {currentSlide + 1} of {slides.length}
                                    </span>
                                    <h2 className={`text-2xl md:text-3xl font-black mt-1 ${isLight ? 'text-slate-800' : 'text-white'} tracking-tight`}>{slides[currentSlide].title}</h2>
                                    <p className="text-xs font-semibold text-slate-400 mt-0.5">{slides[currentSlide].subtitle}</p>
                                </div>
                            </div>
                        </div>

                        {/* Slide Body Content */}
                        <div className="flex-grow p-6 md:p-8 overflow-y-auto">
                            {slides[currentSlide].content}
                        </div>

                        {/* Slide Footer Navigation */}
                        <div className={`p-6 md:p-8 pt-4 border-t flex items-center justify-between ${
                            isLight ? 'border-slate-200/80 bg-white' : 'border-slate-905 bg-slate-950'
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
                                            ? 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200' 
                                            : 'bg-slate-900 border-slate-805 text-slate-300 hover:text-white hover:bg-slate-800'
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
