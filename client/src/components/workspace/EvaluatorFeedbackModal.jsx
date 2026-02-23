import React, { useState } from 'react';
import { Send, CheckCircle, AlertCircle, X } from 'lucide-react';

const EvaluatorFeedbackModal = ({
    isOpen,
    onClose,
    sessionData,
    // expects: sessionId, annotationsCompleted, startingBeta, endingBeta, avgTimeSavedVsEntropy, systemReadingProfile 
}) => {
    const [formData, setFormData] = useState({
        role: '',
        nlpFamiliarity: '',
        selfReportedReadingStyle: '',
        systemClassificationMatch: '',
        ratingDocumentSelection: 0,
        ratingMathUnderstandable: 0,
        ratingSystemAdaptationVisible: 0,
        ratingTrustSystem: 0,
        ratingInterfaceClear: 0,
        noticeChangeAtAnnotation: '',
        mostSurprising: '',
        mostConfusing: '',
        strengthenSubmission: ''
    });

    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [errorMsg, setErrorMsg] = useState('');

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRating = (name, val) => setFormData(prev => ({ ...prev, [name]: val }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        try {
            const payload = { ...formData, ...sessionData };

            // Convert to numbers where required
            if (payload.noticeChangeAtAnnotation) {
                payload.noticeChangeAtAnnotation = parseInt(payload.noticeChangeAtAnnotation, 10);
            }

            const SERVER_URL = (import.meta.env.VITE_SERVER_URL || "http://localhost:5001").replace(/\/$/, "");
            const res = await fetch(`${SERVER_URL}/api/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to submit feedback');

            setStatus('success');
            setTimeout(onClose, 2500); // Auto close after success
        } catch (err) {
            setErrorMsg(err.message);
            setStatus('error');
        }
    };

    const renderLikert = (name, label) => (
        <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
            <div className="flex gap-2 justify-between max-w-md">
                {[1, 2, 3, 4, 5].map(val => (
                    <button
                        key={val} type="button"
                        onClick={() => handleRating(name, val)}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold transition-all ${formData[name] === val
                            ? 'bg-blue-600 text-white ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-900 border-transparent'
                            : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                            }`}
                    >
                        {val}
                    </button>
                ))}
            </div>
            <div className="flex justify-between max-w-md text-xs text-slate-500 mt-1 px-1">
                <span>Strongly Disagree</span>
                <span>Strongly Agree</span>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/80 flex justify-center z-[100] backdrop-blur-sm overflow-y-auto p-4 sm:p-6 py-10">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl h-fit relative">

                <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white bg-slate-800 p-1.5 rounded-lg transition">
                    <X size={20} />
                </button>

                {status === 'success' ? (
                    <div className="p-12 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Thank You!</h2>
                        <p className="text-slate-400">Your feedback is incredibly valuable for our research.<br />We appreciate your time.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 md:p-8">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-white mb-2">Evaluator Feedback</h2>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Thank you for testing CAL-Log! The system auto-captured your stats:
                                <span className="text-blue-400 font-mono text-xs ml-2 bg-blue-900/30 px-2 py-1 rounded">β: {sessionData.endingBeta?.toFixed(2)}</span>
                                <span className="text-green-400 font-mono text-xs ml-2 bg-green-900/30 px-2 py-1 rounded">Saved: {sessionData.avgTimeSavedVsEntropy?.toFixed(1)}s</span>
                            </p>
                        </div>

                        {status === 'error' && (
                            <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-xl flex items-start gap-3">
                                <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={18} />
                                <div className="text-sm text-red-200">{errorMsg}</div>
                            </div>
                        )}

                        <div className="space-y-6">
                            {/* Section 1 */}
                            <div className="p-5 bg-slate-800/40 rounded-xl border border-slate-700/50 space-y-4">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-700 pb-2 mb-4">1. Background</h3>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">What is your current role?</label>
                                    <select name="role" value={formData.role} onChange={handleChange} required className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 transition-colors">
                                        <option value="" disabled>Select role...</option>
                                        {['Undergraduate student', 'Postgraduate / PhD student', 'Academic researcher', 'Industry professional', 'Other'].map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Familiarity with NLP / Machine Learning?</label>
                                    <select name="nlpFamiliarity" value={formData.nlpFamiliarity} onChange={handleChange} required className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 transition-colors">
                                        <option value="" disabled>Select familiarity...</option>
                                        {['None', 'Basic', 'Intermediate', 'Expert'].map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Self-reported natural reading style?</label>
                                    <select name="selfReportedReadingStyle" value={formData.selfReportedReadingStyle} onChange={handleChange} required className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 transition-colors">
                                        <option value="" disabled>Select style...</option>
                                        {['I skim quickly and pick up key points', 'I read at a moderate pace', 'I read carefully and thoroughly'].map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Section 2 */}
                            <div className="p-5 bg-slate-800/40 rounded-xl border border-slate-700/50 space-y-4">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-700 pb-2 mb-4">2. System Behavior Match</h3>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">
                                        The system classified you as a <span className="font-bold text-white bg-slate-700 px-2 py-0.5 rounded">{sessionData.systemReadingProfile}</span>. Did this match your self-reported style?
                                    </label>
                                    <select name="systemClassificationMatch" value={formData.systemClassificationMatch} onChange={handleChange} required className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 transition-colors">
                                        <option value="" disabled>Select observation...</option>
                                        {['Yes, it matched exactly', 'Partially matched', 'No, it was the opposite', "I didn't notice / couldn't tell"].map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Section 3 */}
                            <div className="p-5 bg-slate-800/40 rounded-xl border border-slate-700/50 space-y-2">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-700 pb-2 mb-4">3. System Experience (1-5)</h3>

                                {renderLikert('ratingDocumentSelection', 'The document selection felt meaningfully different from random order')}
                                {renderLikert('ratingMathUnderstandable', 'The cost/entropy math in the Spy window was understandable')}
                                {renderLikert('ratingSystemAdaptationVisible', 'I could visibly see the system adapting to my reading speed')}
                                {renderLikert('ratingTrustSystem', 'I would trust this system to budget time in a real annotation project')}
                                {renderLikert('ratingInterfaceClear', 'The annotation interface was clear and easy to use')}
                            </div>

                            {/* Section 4 */}
                            <div className="p-5 bg-slate-800/40 rounded-xl border border-slate-700/50 space-y-4">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-700 pb-2 mb-4">4. Final Thoughts</h3>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">At what annotation number (approx) did you first notice the system adapt?</label>
                                    <input type="number" name="noticeChangeAtAnnotation" value={formData.noticeChangeAtAnnotation} onChange={handleChange} placeholder="e.g. 15" className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 transition-colors" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">What did you find most surprising or interesting?</label>
                                    <textarea name="mostSurprising" value={formData.mostSurprising} onChange={handleChange} rows={2} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 transition-colors resize-none" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1 text-orange-200">What felt wrong, unconvincing, or confusing? (Crucial for paper)</label>
                                    <textarea name="mostConfusing" value={formData.mostConfusing} onChange={handleChange} rows={3} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2.5 outline-none focus:border-orange-500/50 transition-colors resize-none" />
                                </div>

                                {formData.nlpFamiliarity && ['Intermediate', 'Expert'].includes(formData.nlpFamiliarity) && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1 text-blue-200">As someone with NLP experience, what one thing would strengthen the submission?</label>
                                        <textarea name="strengthenSubmission" value={formData.strengthenSubmission} onChange={handleChange} rows={2} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 transition-colors resize-none" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-800 flex justify-end">
                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white transition-all shadow-lg ${status === 'loading' ? 'bg-blue-600/50 cursor-wait' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/40 hover:-translate-y-0.5'
                                    }`}
                            >
                                {status === 'loading' ? 'Submitting...' : (
                                    <>Submit Feedback <Send size={18} /></>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default EvaluatorFeedbackModal;
