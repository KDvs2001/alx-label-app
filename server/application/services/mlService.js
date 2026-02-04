const axios = require("axios");

class MLService {
  constructor() {
    this.baseUrl = process.env.ML_SERVICE_URL || "http://localhost:5002";
  }

  async getEmbeddings(texts) {
    try {
      const res = await axios.post(`${this.baseUrl}/embed`, { texts });
      return res.data;
    } catch (err) {
      console.error("ML Service Error:", err.message);
      return [];
    }
  }
}

module.exports = new MLService();
