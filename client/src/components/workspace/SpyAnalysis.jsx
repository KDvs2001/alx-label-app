
import React from 'react';
import SelectionCard from './analysis/SelectionCard';
import ParameterGraphs from './analysis/ParameterGraphs';
import CostMathDebug from './analysis/CostMathDebug';
import ComparisonTable from './analysis/ComparisonTable'; // New
import { HelpCircle } from 'lucide-react';

const SpyAnalysis = ({ selectionLogic, metrics, history, interactionLog, shadowMetrics, onShowAlphaBetaPanel }) => {
    return (
        <div className="flex flex-col gap-6 pb-8">

            {/* 0. NEW COMPARISON TABLE (High Visibility) */}
            <ComparisonTable shadowMetrics={shadowMetrics} />

            {/* 1. SELECTION LOGIC (Why this task?) */}
            <SelectionCard selectionLogic={selectionLogic} />

            {/* 2. GRAPHS (Alpha/Beta History) with Help Button */}
            <div className="relative">
                {onShowAlphaBetaPanel && (
                    <button
                        onClick={onShowAlphaBetaPanel}
                        className="absolute top-4 right-4 z-10 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all flex items-center gap-2 text-sm font-bold shadow-lg"
                        title="Learn about Alpha & Beta"
                    >
                        <HelpCircle size={16} />
                        What do these mean?
                    </button>
                )}
                <ParameterGraphs metrics={metrics} history={history} />
            </div>

            {/* 3. DEBUG (Math Verification) */}
            <CostMathDebug
                selectionLogic={selectionLogic}
                metrics={metrics}
                interactionLog={interactionLog}
            />
        </div>
    );
};

export default SpyAnalysis;
