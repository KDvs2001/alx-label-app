import React, { useState, useEffect } from 'react';
import Joyride, { STATUS } from 'react-joyride';

const EvaluatorTour = () => {
    const [run, setRun] = useState(false);

    useEffect(() => {
        // Run once for the user based on localStorage
        const hasSeenTour = localStorage.getItem('cal_log_tour_seen');
        if (!hasSeenTour) {
            setRun(true);
        }
    }, []);

    const handleJoyrideCallback = (data) => {
        const { status } = data;
        const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];

        if (finishedStatuses.includes(status)) {
            setRun(false);
            localStorage.setItem('cal_log_tour_seen', 'true');
        }
    };

    const steps = [
        {
            target: 'body',
            placement: 'center',
            disableBeacon: true,
            title: <div className="text-xl font-bold text-slate-800">Welcome to CAL-Log 👋</div>,
            content: (
                <div className="text-sm text-slate-600 space-y-2 mt-2">
                    <p>CAL-Log is an Adaptive Active Learning system. It learns <strong>how fast you read</strong> and adjusts its task selection mathematical formula in real-time.</p>
                    <p>This quick 4-step tour will show you exactly what to do and where to look during your evaluation.</p>
                </div>
            )
        },
        {
            target: '.tour-step-spy-window',
            placement: 'left',
            title: <div className="text-lg font-bold text-purple-700 font-mono flex items-center gap-2">THE SPY WINDOW 👁️</div>,
            content: (
                <div className="text-sm text-slate-600 space-y-2 mt-2">
                    <p>This panel shows the AI's internal thought process.</p>
                    <p>Every time you annotate a task, watch the <strong>Reading Factor (β)</strong> adapt to your natural speed.</p>
                    <p>You can also see the exact <strong>Entropy ÷ Cost</strong> mathematics that caused CAL-Log to select the specific task you are currently reading!</p>
                </div>
            )
        },
        {
            target: '.tour-step-task-card',
            placement: 'bottom',
            title: <div className="text-lg font-bold text-green-700">Your Goal</div>,
            content: (
                <div className="text-sm text-slate-600 space-y-2 mt-2">
                    <p>Read the text at your <strong>natural pace</strong> and click Positive or Negative.</p>
                    <p>Please complete around <strong>15-20 annotations</strong> so the Cost Model has enough time to adapt to your style and prove the math!</p>
                </div>
            )
        },
        {
            target: '.tour-step-feedback-btn',
            placement: 'left',
            title: <div className="text-lg font-bold text-blue-700">Provide Feedback</div>,
            content: (
                <div className="text-sm text-slate-600 space-y-2 mt-2">
                    <p>When you are finished testing the system's adaptation, click the <strong>Complete Session</strong> button.</p>
                    <p>This will show you a breakdown of your reading profile and give you a button to evaluate the system. Thank you!</p>
                </div>
            )
        }
    ];

    return (
        <Joyride
            steps={steps}
            run={run}
            continuous={true}
            showProgress={true}
            showSkipButton={true}
            hideCloseButton={true}
            callback={handleJoyrideCallback}
            styles={{
                options: {
                    arrowColor: '#ffffff',
                    backgroundColor: '#ffffff',
                    primaryColor: '#2563eb', // Blue-600
                    textColor: '#1e293b',    // Slate-800
                    overlayColor: 'rgba(0, 0, 0, 0.75)',
                    zIndex: 1000,
                },
                buttonNext: {
                    backgroundColor: '#2563eb',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontWeight: 'bold'
                },
                buttonBack: {
                    color: '#64748b'
                },
                buttonSkip: {
                    color: '#94a3b8'
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
