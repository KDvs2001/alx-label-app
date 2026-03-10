// CITATION: useState - React hook for local component state
// SOURCE: React (n.d.). "useState"
// URL: https://react.dev/reference/react/useState
import React, { useState } from 'react';
// lucide-react provides tree-shakable SVG icon components
// CITATION: lucide-react - SVG icon library as React components
// SOURCE: Lucide (n.d.). "lucide-react"
// URL: https://lucide.dev/guide/packages/lucide-react
import { Send, CheckCircle, AlertCircle, X, Copy, ExternalLink } from 'lucide-react';

/**
 * EvaluatorFeedbackModal Component
 * Post-evaluation survey. Captures user metrics and attaches ML params for analysis.
 */
const EvaluatorFeedbackModal = ({
    isOpen,
    onClose,
    sessionData /* Attaches ML metadata (Alpha/Beta) for correlation */
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
        mostSurprising: '',
        mostConfusing: '',
        strengthenSubmission: ''
    });

    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [errorMsg, setErrorMsg] = useState('');
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    // spread the previous state and overwrite the changed field to keep React state immutable
    // CITATION: spread syntax (...) - shallow-copy an object while overriding specific keys
    // SOURCE: MDN Web Docs (n.d.). "Spread syntax (...)"
    // URL: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
    const handleChange = (e) => {
        // computed property name [name] lets us update whichever form field triggered the event
        // CITATION: computed property names - use a variable as an object key inside brackets
        // SOURCE: MDN Web Docs (n.d.). "Object initializer - Computed property names"
        // URL: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer#computed_property_names
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRating = (name, val) => setFormData(prev => ({ ...prev, [name]: val }));

    // preventDefault stops the browser from refreshing the page on form submit
    // CITATION: Event.preventDefault() - stop the browser's default form submission
    // SOURCE: MDN Web Docs (n.d.). "Event.preventDefault()"
    // URL: https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Closes the modal immediately to feel fast, then saves in background
        setStatus('success');

        // Save in background (fire-and-forget)
        try {
            const payload = { ...formData, ...sessionData };
            const SERVER_URL = (import.meta.env.VITE_SERVER_URL || "http://localhost:5001").replace(/\/$/, "");
            // fire-and-forget: POST the feedback to the server without blocking the UI
            // CITATION: Fetch API - make HTTP requests from the browser
            // SOURCE: MDN Web Docs (n.d.). "fetch()"
            // URL: https://developer.mozilla.org/en-US/docs/Web/API/fetch
            fetch(`${SERVER_URL}/api/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            // JSON.stringify converts the JS object into a JSON string for the request body
            // CITATION: JSON.stringify() - serialize a JavaScript value to a JSON string
            // SOURCE: MDN Web Docs (n.d.). "JSON.stringify()"
            // URL: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
                body: JSON.stringify(payload)
            }).catch(err => console.error('Feedback save failed (will retry on next visit):', err));
        } catch (err) {
            console.error('Feedback submit error:', err);
        }
    };

    // renders a 1-5 Likert scale row for each quantitative UX metric
    // CITATION: Array.map() - transform an array into a list of JSX elements
    // SOURCE: React (n.d.). "Rendering Lists"
    // URL: https://react.dev/learn/rendering-lists
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
                    <div className="p-8 md:p-10 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Thank You!</h2>
                        <p className="text-slate-400 mb-8">Your feedback is incredibly valuable for our research.<br />We appreciate your time.</p>

                        {/* Reveals incentive code only after a successful feedback submission */}
                        <div className="w-full max-w-md bg-slate-800/60 border border-slate-700 rounded-xl p-6 text-left space-y-4">
                            {/* noopener noreferrer prevents the opened tab from accessing window.opener */}
                            {/* this is a standard security measure for target="_blank" links */}
                            {/* CITATION: noopener noreferrer - security for external links */}
                            {/* SOURCE: MDN Web Docs (n.d.). "Link types: noopener" */}
                            {/* URL: https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/noopener */}
                            <p className="text-sm text-slate-300 leading-relaxed">
                                Redeem the following Survey Code at{' '}
                                <a href="https://www.surveycircle.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline hover:text-blue-300 transition-colors">surveycircle.com</a>{' '}
                                and get free survey participants through SurveyCircle.
                            </p>

                            {/* Survey Code with Copy Button */}
                            <div className="flex items-center gap-2 bg-slate-900 border border-slate-600 rounded-lg px-4 py-3">
                                <code className="flex-1 text-lg font-mono font-bold text-green-400 tracking-wider select-all">
                                    8J2N-SGKQ-QQ38-QTCG
                                </code>
                                <button
                                    type="button"
                                    // copy the survey code to the user's clipboard
                                    // CITATION: navigator.clipboard.writeText() - copy text to the system clipboard
                                    // SOURCE: MDN Web Docs (n.d.). "Clipboard.writeText()"
                                    // URL: https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText
                                    onClick={() => {
                                        navigator.clipboard.writeText('8J2N-SGKQ-QQ38-QTCG');
                                        setCopied(true);
                                        // setTimeout resets the "Copied!" label back to "Copy" after 2 seconds
                                        // CITATION: setTimeout() - schedule a one-off callback after a delay
                                        // SOURCE: MDN Web Docs (n.d.). "setTimeout()"
                                        // URL: https://developer.mozilla.org/en-US/docs/Web/API/setTimeout
                                        setTimeout(() => setCopied(false), 2000);
                                    }}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${copied
                                            ? 'bg-green-600 text-white'
                                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
                                        }`}
                                >
                                    {copied ? (
                                        <><CheckCircle size={14} /> Copied!</>
                                    ) : (
                                        <><Copy size={14} /> Copy</>
                                    )}
                                </button>
                            </div>

                            {/* Redemption Link Button */}
                            <a
                                href="https://www.surveycircle.com/8J2N-SGKQ-QQ38-QTCG/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-900/40 hover:-translate-y-0.5"
                            >
                                Redeem on SurveyCircle <ExternalLink size={16} />
                            </a>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 md:p-8">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-white mb-2">Evaluator Feedback</h2>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Thank you for testing CAL-Log! The system auto-captured your stats:
                                {/* optional chaining safely handles cases where the session hasn't ended yet */}
                                <span className="text-blue-400 font-mono text-xs ml-2 bg-blue-900/30 px-2 py-1 rounded">α: {sessionData.endingAlpha?.toFixed(2)} β: {sessionData.endingBeta?.toFixed(2)}</span>
                                <span className="text-green-400 font-mono text-xs ml-2 bg-green-900/30 px-2 py-1 rounded">vs Entropy: {sessionData.vsEntropyPct}%</span>
                                <span className="text-purple-400 font-mono text-xs ml-2 bg-purple-900/30 px-2 py-1 rounded">vs Random: {sessionData.vsRandomPct}%</span>
                            </p>
                        </div>

                        {/* short-circuit evaluation: conditionally render the error banner only if status is 'error' */}
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
                                    {/* controlled select component: the selected 'value' is driven by React state */}
                                    <select name="role" value={formData.role} onChange={handleChange} required className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 transition-colors">
                                        <option value="" disabled>Select role...</option>
                                        {/* mapping over an array to generate options, using the string itself as the unique React key */}
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

                                {renderLikert('ratingDocumentSelection', 'The simulation effectively demonstrated how CAL-Log selects tasks based on user behavior')}
                                {renderLikert('ratingMathUnderstandable', 'The connection between the mathematical score (Entropy/Cost) and task selection was evident')}
                                {renderLikert('ratingSystemAdaptationVisible', 'I could visibly see the system adjusting task lengths according to the displayed reading profile')}
                                {renderLikert('ratingTrustSystem', 'The Spy Window provided useful insight into the model\'s internal decision-making process')}
                                {renderLikert('ratingInterfaceClear', 'Overall, the tool successfully simulated an adaptive active learning scenario')}
                            </div>

                            {/* Section 4 */}
                            <div className="p-5 bg-slate-800/40 rounded-xl border border-slate-700/50 space-y-4">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-700 pb-2 mb-4">4. Final Thoughts</h3>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">What did you find most surprising or interesting?</label>
                                    {/* CSS resize-none ensures the textarea cannot be dragged to break the modal layout */}
                                    <textarea name="mostSurprising" value={formData.mostSurprising} onChange={handleChange} rows={2} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 transition-colors resize-none" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1 text-orange-200">What felt wrong, unconvincing, or confusing? (Crucial for paper)</label>
                                    <textarea name="mostConfusing" value={formData.mostConfusing} onChange={handleChange} rows={3} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2.5 outline-none focus:border-orange-500/50 transition-colors resize-none" />
                                </div>

                                {/* only show the expert question if the user selected Intermediate or Expert */}
                                {/* CITATION: Array.includes() - check if a value exists in an array */}
                                {/* SOURCE: MDN Web Docs (n.d.). "Array.prototype.includes()" */}
                                {/* URL: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes */}
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
