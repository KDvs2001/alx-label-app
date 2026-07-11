// CITATION: useState, useEffect - React hooks for local state and side effects
// SOURCE: React (n.d.). "useState" / "useEffect"
// URL: https://react.dev/reference/react/useState
import React, { useState, useEffect } from 'react';
import Joyride, { STATUS } from 'react-joyride';
// react-joyride renders step-by-step guided tours with spotlight overlays
// CITATION: react-joyride - guided user onboarding tours for React
// SOURCE: react-joyride (n.d.). "React Joyride"
// URL: https://docs.react-joyride.com/

/**
 * EvaluatorTour Component
 * Guided onboarding using react-joyride to explain the Active Learning UI.
 */
const EvaluatorTour = ({ onComplete }) => {
    // controls whether the tour overlay is currently visible
    const [run, setRun] = useState(false);

    useEffect(() => {
        // localStorage persists a flag across browser sessions so the tour only fires once
        // CITATION: localStorage - store key/value pairs that survive page reloads
        // SOURCE: MDN Web Docs (n.d.). "Window.localStorage"
        // URL: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
        const hasSeenTour = localStorage.getItem('cal_log_tour_seen');
        if (!hasSeenTour) {
            setRun(true);
        }
    }, []);

    // react-joyride fires this callback on every status change (step advance, skip, finish)
    const handleJoyrideCallback = (data) => {
        // destructure status and action from the callback payload
        // CITATION: destructuring assignment - extract named properties from an object
        // SOURCE: MDN Web Docs (n.d.). "Destructuring assignment"
        // URL: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
        const { status, action } = data;
        // STATUS.FINISHED and STATUS.SKIPPED are constants exported by react-joyride
        const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];

        // Array.includes checks whether the current status signals the tour is done
        // CITATION: Array.includes() - check if a value exists in an array
        // SOURCE: MDN Web Docs (n.d.). "Array.prototype.includes()"
        // URL: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes
        if (finishedStatuses.includes(status) || action === 'close') {
            setRun(false);
            localStorage.setItem('cal_log_tour_seen', 'true');
            if (onComplete) onComplete();
        }
    };

    // each step object defines a target CSS selector, placement direction, and the JSX content to show
    // react-joyride uses these to spotlight specific DOM elements in sequence
    const steps = [
        {
            target: 'body',
            placement: 'center',
            // disableBeacon skips the pulsing dot and opens the tooltip immediately
            disableBeacon: true,
            // bg-clip-text + text-transparent creates a gradient fill on the heading text
            // CITATION: CSS background-clip: text - clip gradient to text shape
            // SOURCE: MDN Web Docs (n.d.). "background-clip"
            // URL: https://developer.mozilla.org/en-US/docs/Web/CSS/background-clip
            title: <div className="text-3xl font-black bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent animate-pulse">Welcome to CAL-Log</div>,
            content: (
                <div className="text-base text-slate-300 space-y-3 mt-4 leading-relaxed">
                    <p>CAL-Log is an Adaptive Active Learning system. It learns <strong>how fast you read</strong> and adjusts its mathematics in real-time.</p>
                    <p>This quick tour will show you exactly what to do and where to look during your evaluation.</p>
                </div>
            )
        },
        {
            // targets the element with class .tour-step-spy-window to spotlight the Spy Window panel
            target: '.tour-step-spy-window',
            placement: 'left',
            title: <div className="text-2xl font-bold text-purple-400 font-mono flex items-center gap-2">THE SPY WINDOW</div>,
            content: (
                <div className="text-base text-slate-300 space-y-3 mt-2 leading-relaxed">
                    <p>This panel shows the model's internal thought process.</p>
                    <p>Every time you annotate a task, watch the <strong>Reading Factor (β)</strong> adapt to your natural speed.</p>
                    <p>You can also see the exact <strong>Entropy ÷ Cost</strong> mathematics that caused CAL-Log to select the specific task you are currently reading!</p>
                </div>
            )
        },
        {
            target: '.tour-step-task-card',
            placement: 'bottom',
            title: <div className="text-2xl font-bold text-green-400">Your Goal</div>,
            content: (
                <div className="text-base text-slate-300 space-y-3 mt-2 leading-relaxed">
                    <p>Read the text at your <strong>natural pace</strong> and click one of the classification buttons.</p>
                    {/* HTML <kbd> element represents a keyboard key, styled to look like a physical key cap */}
                    {/* CITATION: HTML kbd element - represent keyboard input */}
                    {/* SOURCE: MDN Web Docs (n.d.). "kbd: The Keyboard Input element" */}
                    {/* URL: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/kbd */}
                    <div className="bg-slate-800/80 border border-slate-700 rounded-lg p-3 text-sm">
                        <p className="font-bold text-blue-300 mb-1">Keyboard Shortcuts</p>
                        <p><kbd className="bg-slate-700 px-1.5 py-0.5 rounded text-xs font-mono text-white">1</kbd> - First label &nbsp;&nbsp; <kbd className="bg-slate-700 px-1.5 py-0.5 rounded text-xs font-mono text-white">2</kbd> - Second label</p>
                        <p className="mt-1"><kbd className="bg-slate-700 px-1.5 py-0.5 rounded text-xs font-mono text-white">Space</kbd> - Toggle Guidelines Panel</p>
                    </div>
                    <p>Please complete around <strong>15-20 annotations</strong> so the Cost Model has enough time to adapt to your style and prove the math!</p>
                </div>
            )
        },
        {
            target: '.tour-step-feedback-btn',
            placement: 'bottom',
            title: <div className="text-2xl font-bold text-blue-400">Provide Feedback</div>,
            content: (
                <div className="text-base text-slate-300 space-y-3 mt-2 leading-relaxed">
                    <p>When you are finished testing the system's adaptation, click the <strong>Finish Session</strong> button at the top right.</p>
                    <p>This will show you your final reading profile and allow you to rate the system!</p>
                </div>
            )
        }
    ];

    // the Joyride component handles spotlight rendering, step sequencing, and user interaction
    // CITATION: react-joyride props - configuration API for guided tours
    // SOURCE: react-joyride (n.d.). "Props"
    // URL: https://docs.react-joyride.com/props
    return (
        <Joyride
            steps={steps}
            run={run}
            continuous={true}
            showProgress={true}
            showSkipButton={true}
            hideCloseButton={true}
            callback={handleJoyrideCallback}
            spotlightPadding={8}
            spotlightClicks={true}
            // floaterProps customises the tooltip arrow and shadow effect
            // these are passed directly to the internal react-floater library
            floaterProps={{
                styles: {
                    floater: { filter: 'drop-shadow(0 0 15px rgba(139, 92, 246, 0.3))' },
                    arrow: { length: 8, spread: 16 }
                }
            }}
            styles={{
                options: {
                    arrowColor: '#0f172a',    // slate-950
                    backgroundColor: '#0f172a',
                    primaryColor: '#8b5cf6',  // purple-500
                    textColor: '#f1f5f9',     // slate-100
                    overlayColor: 'rgba(2, 6, 23, 0.85)',
                    zIndex: 1000,
                },
                tooltip: {
                    borderRadius: '16px',
                    border: '1px solid #334155', // slate-700
                    padding: '24px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    width: '450px',
                    maxWidth: '90vw',
                },
                tooltipContainer: {
                    textAlign: 'left'
                },
                buttonNext: {
                    backgroundColor: '#8b5cf6',
                    padding: '10px 24px',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 6px -1px rgba(139, 92, 246, 0.3)',
                },
                buttonBack: {
                    color: '#94a3b8',
                    marginRight: '12px'
                },
                buttonSkip: {
                    color: '#64748b'
                }
            }}
            locale={{
                last: "Let's Begin",
                skip: "Skip Tour"
            }}
        />
    );
};

export default EvaluatorTour;
