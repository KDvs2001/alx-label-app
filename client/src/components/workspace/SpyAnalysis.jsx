
import React from 'react';
import SelectionCard from './analysis/SelectionCard';
import ParameterGraphs from './analysis/ParameterGraphs';
import CostMathDebug from './analysis/CostMathDebug';
import ComparisonTable from './analysis/ComparisonTable';
import { HelpCircle } from 'lucide-react';

/**
 * SpyAnalysis Component
 * The 'Spy Window' sidebar that hosts all real-time mathematical readouts and visual proofs.
 */
const SpyAnalysis = ({ selectionLogic, metrics, history, interactionLog, shadowMetrics, onShowAlphaBetaPanel }) => {
    return (
        <div className="flex flex-col gap-6 pb-8">

            {/* Real-time comparison dashboard of Information Efficiency */}
            <ComparisonTable shadowMetrics={shadowMetrics} />

            {/* Translates selection math into intuitive UI metrics */}
            <SelectionCard selectionLogic={selectionLogic} />

            {/* Visualizes real-time convergence of cost parameters */}
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

            {/* Exposes raw calculation logs (Information Gain, Speed) for absolute transparency */}
            <CostMathDebug
                selectionLogic={selectionLogic}
                metrics={metrics}
                interactionLog={interactionLog}
            />
        </div>
    );
};

export default SpyAnalysis;
