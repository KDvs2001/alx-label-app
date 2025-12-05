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
                    console.error(`[${this.name}] Fetch Error after ${maxRetries} attempts:`, err.message);
                    return [];
                }
                // Retry with exponential backoff
                const delayMs = 1000 * attempt;
                console.log(`[${this.name}] Fetch attempt ${attempt} failed, retrying in ${delayMs}ms...`);
                await this.sleep(delayMs);
            }
        }
        return [];
    }

    // More methods to be added...
}

module.exports = BaseAnnotator;
