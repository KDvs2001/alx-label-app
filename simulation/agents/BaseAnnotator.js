const axios = require('axios');

class BaseAnnotator {
    constructor(name, config) {
        this.name = name;
        this.API_URL = config.apiUrl || 'http://localhost:5000/api';
        this.config = config;
        this.state = {
            energy: 100,
            tasksCompleted: 0
        };
    }

    async login() {
        // Mock login or minimal auth if needed
        console.log(`[${this.name}] Logging in...`);
    }

    async fetchBatch(projectId, maxRetries = 3) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const res = await axios.get(`${this.API_URL}/tasks/next?projectId=${projectId}&userId=${this.name}&batchSize=10&role=annotator`);
                return res.data.batch || [];
            } catch (err) {
                if (attempt === maxRetries) {
                    console.error(`[${this.name}] ❌ Fetch Error after ${maxRetries} attempts:`, err.message);
                    return [];
                }
                // Retry with exponential backoff
                const delayMs = 1000 * attempt;
                console.log(`[${this.name}] ⚠️  Fetch attempt ${attempt}/${maxRetries} failed, retrying in ${delayMs}ms...`);
                await this.sleep(delayMs);
            }
        }
        return [];
    }

    async submitTask(task, decision) {
        try {
            await axios.post(`${this.API_URL}/tasks/submit`, {
                taskId: task._id || task.id,
                datasetId: task.datasetId || this.config.projectId,
                label: decision.label,
                laborCostMs: decision.timeMs, // Match server expectation: laborCostMs (not timeMs)
                annotatorId: this.name,
                isAmbiguous: decision.isAmbiguous || false,
                confusionNote: decision.confusionNote || ""
            });
            this.state.tasksCompleted++;
            console.log(`   [${this.name}] Submitted: ${decision.label} (${(decision.timeMs / 1000).toFixed(1)}s)`);
        } catch (err) {
            console.error(`[${this.name}] ❌ Submit Error:`, err.message);
            if (err.response) {
                console.error(`   Status: ${err.response.status}, Data:`, err.response.data);
            }
        }
    }

    decide(task, groundTruth) {
        throw new Error("Abstract method 'decide' must be implemented");
    }

    // Utilities
    sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
}

module.exports = BaseAnnotator;
