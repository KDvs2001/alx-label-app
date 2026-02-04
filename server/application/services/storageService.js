const Project = require("../../infrastructure/database/models/Project");
const Task = require("../../infrastructure/database/models/Task");
const Annotation = require("../../infrastructure/database/models/Annotation");

class StorageService {
  async getProject(id) {
    return await Project.findById(id);
  }

  async createTasks(tasks) {
    return await Task.insertMany(tasks);
  }
  
  async saveAnnotation(data) {
    const annotation = new Annotation(data);
    return await annotation.save();
  }
}

module.exports = new StorageService();
