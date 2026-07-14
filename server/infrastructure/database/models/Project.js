// Schema for a single annotation project managed by the research team.
// One document per project; annotators are linked by username in assignedAnnotators.
/**
 * DOMAIN MODEL: Project
 * ARCHITECTURAL ROLE: Aggregate Root (Data Persistence)
 *
 * Holds the full definition of one annotation campaign: its texts, label
 * taxonomy, assigned annotators, and lifecycle status.
 * Texts are embedded as sub-documents because the full list is always needed
 * together and is bounded in size (well within Mongo's 16 MB doc limit).
 */
const mongoose = require('mongoose');

// crypto is a Node built-in — no external package required.
// randomUUID() produces a standards-compliant v4 UUID for stable, collision-free ids.
// CITATION: crypto.randomUUID() — generate a v4 UUID without external dependencies
// SOURCE: Node.js Foundation (n.d.). "Crypto: crypto.randomUUID()"
// URL: https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
const { randomUUID } = require('crypto');

// each text to be annotated is stored as a sub-document.
// { _id: false } stops Mongoose from generating a pointless ObjectId
// on every sub-doc — we don't need to query them individually.
// CITATION: { _id: false } — disable auto-generated _id on subdocuments
// SOURCE: Mongoosejs.com (n.d.). "Subdocuments"
// URL: https://mongoosejs.com/docs/subdocs.html#subdocuments-versus-nested-paths
const TextItemSchema = new mongoose.Schema({
    id:   String,   // stable text identifier, e.g. 'text_<timestamp>_<index>'
    text: String    // the raw text the annotator will label
}, { _id: false });

// main project document. projectId is unique so we can reference it from
// AnnotationSession.contestantId as '<username>_<projectId>'.
const ProjectSchema = new mongoose.Schema({
    projectId: {
        type: String,
        required: true,
        // unique: true tells Mongoose to create a unique index on this field
        // CITATION: unique — create a unique index to prevent duplicate values
        // SOURCE: Stack Overflow (2014). "Mongoose unique validation"
        // URL: https://stackoverflow.com/questions/24430220/mongoose-unique-validation
        unique: true,
        default: () => randomUUID()
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    // label taxonomy for this project, e.g. ['Positive', 'Negative']
    labelTypes: [{ type: String }],
    // embed the texts directly inside the project doc.
    // each project has a bounded number of texts and the full list is
    // always loaded together, so embedding beats a separate collection + JOIN here.
    // CITATION: embedded subdocuments — nest related data inside the parent doc
    // SOURCE: Stack Overflow (2013). "Mongoose subdocuments vs nested schema"
    // URL: https://stackoverflow.com/questions/17254008/mongoose-subdocuments-vs-nested-schema
    texts: [TextItemSchema],
    // AI-driven text complexity evaluation score
    complexityScore: {
        type: Number,
        default: 0
    },
    // Required reader profile based on project complexity
    targetProfile: {
        type: String,
        enum: ['Fast Skimmer', 'Moderate Reader', 'Careful Analyst', 'All'],
        default: 'All'
    },
    createdBy: {
        type: String,
        required: true
    },
    // lifecycle gate — only 'active' projects appear in the annotator dashboard
    // CITATION: enum validator — restrict a String field to a fixed set of values
    // SOURCE: Mongoosejs.com (n.d.). "Validation"
    // URL: https://mongoosejs.com/docs/validation.html#built-in-validators
    status: {
        type: String,
        enum: ['active', 'paused', 'completed'],
        default: 'active'
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    // timestamps: true auto-adds createdAt and updatedAt fields
    // CITATION: timestamps option — auto-manage createdAt and updatedAt
    // SOURCE: Stack Overflow (2016). "Mongoose timestamps option"
    // URL: https://stackoverflow.com/questions/12669615/add-created-at-and-updated-at-fields-to-mongoose-schemas
    timestamps: true
});

// bump lastUpdated every time we save
// CITATION: pre('save') — middleware hook that runs before document persistence
// SOURCE: Mongoosejs.com (n.d.). "Middleware"
// URL: https://mongoosejs.com/docs/middleware.html#pre
ProjectSchema.pre('save', function (next) {
    this.lastUpdated = Date.now();
    next();
});

module.exports = mongoose.model('Project', ProjectSchema);
