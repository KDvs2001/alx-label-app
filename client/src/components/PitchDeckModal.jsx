import React, { useState, useEffect } from 'react';
import { 
    X, ChevronLeft, ChevronRight, Award, Brain, BarChart2, Lightbulb, Lock, 
    ArrowRight, ShieldCheck, Database, Layers, Cpu, Users, Zap, Clock, 
    AlertTriangle, Check, HelpCircle, TrendingUp, Sparkles, Play, CheckCircle2 
} from 'lucide-react';
import { getSlides } from './PitchDeckSlides';

const PitchDeckModal = ({ isOpen, onClose }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [passwordInput, setPasswordInput] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem('pitch_deck_auth') === 'true');
    const [errorMsg, setErrorMsg] = useState('');
    const [isLight, setIsLight] = useState(() => document.body.classList.contains('theme-light'));
    const [isProjectorMode, setIsProjectorMode] = useState(false);

    const contrastLight = isLight || isProjectorMode;

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

    const nextSlide = () => {
        if (currentSlide === slides.length - 1) {
            onClose(); // End of flow -> close and start demo
        } else {
            setCurrentSlide(prev => prev + 1);
        }
    };

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
    }, [isOpen, isAuthenticated, currentSlide]);

    if (!isOpen) return null;

    const slides = getSlides(contrastLight, onClose);

    const CurrentIcon = slides[currentSlide].icon;

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-0 animate-fade-in ${contrastLight ? 'bg-white' : 'bg-slate-950'}`}>
            <div className={`w-full h-full relative flex flex-col justify-between overflow-hidden text-left transition-all ${
                contrastLight ? 'bg-white text-slate-955' : 'bg-slate-955 text-white'
            }`}>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 via-indigo-500 to-emerald-500 z-20" />
                
                <button 
                    onClick={onClose}
                    className={`absolute top-4 right-4 p-2.5 rounded-xl transition z-30 border ${
                        contrastLight 
                            ? 'bg-slate-100 border-slate-350 text-slate-955 hover:bg-slate-200 border-2 font-bold' 
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                    title="Exit Presentation"
                >
                    <X size={18} />
                </button>

                {!isAuthenticated ? (
                    <div className="flex-grow flex flex-col items-center justify-center py-10 space-y-6 text-center">
                        <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                            <Lock size={30} className="animate-pulse" />
                        </div>
                        <div>
                            <h3 className={`text-xl font-black ${contrastLight ? 'text-slate-955' : 'text-white'}`}>CAL-Log Presentation</h3>
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
                                    contrastLight ? 'bg-white border-2 border-slate-900 text-slate-950 shadow-inner font-bold' : 'bg-slate-900 border border-slate-800 text-white'
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
                    <>
                        <div className={`p-6 md:p-8 pb-4 border-b flex justify-between items-center ${
                            contrastLight ? 'border-slate-350 bg-white border-b-2' : 'border-slate-900 bg-slate-950'
                        }`}>
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl border ${slides[currentSlide].iconColor}`}>
                                    <CurrentIcon size={28} />
                                </div>
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-505 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
                                        Slide {currentSlide + 1} of {slides.length}
                                    </span>
                                    <h2 className={`text-2xl md:text-3xl font-black mt-1 tracking-tight ${contrastLight ? 'text-slate-955' : 'text-white'}`}>{slides[currentSlide].title}</h2>
                                    <p className={`text-sm font-semibold mt-0.5 ${contrastLight ? 'text-slate-900' : 'text-slate-400'}`}>{slides[currentSlide].subtitle}</p>
                                </div>
                            </div>
                            
                            <button
                                onClick={() => setIsProjectorMode(!isProjectorMode)}
                                className={`mr-14 px-4 py-2 text-xs font-black rounded-lg transition border-2 ${
                                    isProjectorMode 
                                        ? 'bg-amber-500 border-amber-600 text-black shadow-md' 
                                        : contrastLight
                                            ? 'bg-slate-100 border-slate-300 text-slate-805 hover:bg-slate-200'
                                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                                }`}
                                title="Optimize colors for low-contrast projection on white walls"
                            >
                                {isProjectorMode ? '☀ Projector Mode On' : '☼ Optimize for Projector (White Wall)'}
                            </button>
                        </div>

                        <div className="flex-grow overflow-hidden relative">
                            <div 
                                className="flex h-full transition-transform duration-500 ease-out"
                                style={{ transform: `translate3d(-${currentSlide * 100}%, 0, 0)` }}
                            >
                                {slides.map((slide, idx) => (
                                    <div key={idx} className="w-full h-full shrink-0 overflow-y-auto px-6 md:px-8 py-4">
                                        {slide.content}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={`p-6 md:p-8 pt-4 border-t flex items-center justify-between ${
                            contrastLight ? 'border-slate-350 bg-white border-t-2' : 'border-slate-900 bg-slate-950'
                        }`}>
                            <div className="flex gap-2">
                                {slides.map((_, i) => (
                                    <span 
                                        key={i} 
                                        className={`w-3.5 h-3.5 rounded-full transition-all duration-350 cursor-pointer ${
                                            i === currentSlide 
                                                ? 'bg-indigo-500 w-8' 
                                                : contrastLight ? 'bg-slate-300' : 'bg-slate-850'
                                        }`} 
                                        onClick={() => setCurrentSlide(i)}
                                    />
                                ))}
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={prevSlide}
                                    disabled={currentSlide === 0}
                                    className={`p-3 rounded-xl border transition disabled:opacity-30 ${
                                        contrastLight 
                                            ? 'bg-slate-100 border-slate-300 text-slate-955 hover:bg-slate-200 border-2 font-bold' 
                                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
                                    }`}
                                    title="Previous Slide"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    onClick={nextSlide}
                                    className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-sm font-black rounded-xl transition flex items-center gap-2 shadow-lg shadow-indigo-500/10 border-2 border-indigo-700 font-extrabold"
                                >
                                    {currentSlide === slides.length - 1 ? 'Start Live Demo' : 'Next Slide'} <ChevronRight size={16} />
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
