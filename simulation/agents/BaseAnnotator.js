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

    // More methods to be added...
}

module.exports = BaseAnnotator;
