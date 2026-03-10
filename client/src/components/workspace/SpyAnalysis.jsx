
import React from 'react';
// each child component handles one aspect of the real-time analysis display
import SelectionCard from './analysis/SelectionCard';
import ParameterGraphs from './analysis/ParameterGraphs';
import CostMathDebug from './analysis/CostMathDebug';
import ComparisonTable from './analysis/ComparisonTable';
// lucide-react provides tree-shakable SVG icon components
// CITATION: lucide-react - SVG icon library as React components
// SOURCE: Lucide (n.d.). "lucide-react"
// URL: https://lucide.dev/guide/packages/lucide-react
import { HelpCircle } from 'lucide-react';

/**
 * SpyAnalysis Component
 * The 'Spy Window' sidebar that hosts all real-time mathematical readouts and visual proofs.
 */
const SpyAnalysis = ({ selectionLogic, metrics, history, interactionLog, shadowMetrics, onShowAlphaBetaPanel }) => {
    // the Spy Window is composed of four sub-panels stacked vertically
    // each one exposes a different facet of the active learning mathematics
    return (
        <div className="flex flex-col gap-6 pb-8">

            {/* side-by-side efficiency comparison: CAL-Log vs Entropy vs Random */}
            <ComparisonTable shadowMetrics={shadowMetrics} />

            {/* shows why CAL-Log chose this particular task (entropy, cost, score) */}
            <SelectionCard selectionLogic={selectionLogic} />

            {/* alpha/beta convergence chart with an optional help button */}
            <div className="relative">
                {/* only render the help button if the parent passed a callback */}
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

            {/* raw calculation logs so the evaluator can verify the math themselves */}
            <CostMathDebug
                selectionLogic={selectionLogic}
                metrics={metrics}
                interactionLog={interactionLog}
            />
        </div>
    );
};

export default SpyAnalysis;
