const mongoose = require('mongoose');
const { randomUUID } = require('crypto');
const dotenv = require('dotenv');

dotenv.config();

const Project = require('./infrastructure/database/models/Project');
const AnnotationSession = require('./infrastructure/database/models/AnnotationSession');
const AnnotatorProfile = require('./infrastructure/database/models/AnnotatorProfile');

async function seed() {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is missing from .env');
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB:', process.env.MONGO_URI.split('@')[1]);

        const existingProfiles = await AnnotatorProfile.find();
        console.log('Currently in DB Profiles:', existingProfiles.length, existingProfiles.map(p => ({ username: p.username, pilotCompleted: p.pilotCompleted })));

        // Clear existing demo projects/sessions
        await Project.deleteMany({});
        await AnnotationSession.deleteMany({});
        
        // Ensure "vihanga" profile has pilotCompleted = true to fix their issue
        await AnnotatorProfile.findOneAndUpdate(
            { username: 'vihanga' },
            { 
                username: 'vihanga',
                readingStyle: 'Moderate Reader',
                baselineSpeed: 0.35,
                pilotCompleted: true 
            },
            { upsert: true }
        );
        console.log('Ensured user "vihanga" has completed the pilot.');

        // 1. Pending IMDB project for all annotators
        const imdbProjectId = randomUUID();
        
        // Generate 900 mock IMDB reviews to match the ML service dataset size
        const imdbTexts = Array.from({ length: 900 }).map((_, i) => ({
            id: `text_${Date.now()}_${i}`,
            text: i % 2 === 0 
                ? `Movie review sample ${i}: This was an absolutely fantastic cinematic experience.` 
                : `Movie review sample ${i}: Terrible plot, completely wooden acting and boring pacing.`
        }));

        const imdbProject = new Project({
            projectId: imdbProjectId,
            name: "IMDB Sentiment Analysis (Demo)",
            description: "A pending sentiment analysis project for all new annotators to begin their task.",
            labelTypes: ["Positive", "Neutral", "Negative"],
            texts: imdbTexts,
            complexityScore: 0.3,
            targetProfile: 'All', // 'All' means it appears for every annotator
            createdBy: "admin",
            status: "active"
        });
        await imdbProject.save();
        console.log('Created pending IMDB project (Available to everyone).');

        // 2. Financial Document NER (In Progress/Done projects for Manager Dashboard Demo)
        const nerProjectId = randomUUID();
        const nerProject = new Project({
            projectId: nerProjectId,
            name: "Financial Document NER",
            description: "Extract entities from quarterly earnings reports.",
            labelTypes: ["Person", "Organization", "Location", "Money"],
            texts: Array.from({length: 20}).map((_, i) => ({ id: `text_ner_${i}`, text: `Financial doc snippet ${i}` })),
            complexityScore: 0.8,
            targetProfile: 'Careful Analyst',
            createdBy: "admin",
            status: "active"
        });
        await nerProject.save();

        // 3. Customer Support Intent Routing
        const csProjectId = randomUUID();
        const csProject = new Project({
            projectId: csProjectId,
            name: "Customer Support Intent Routing",
            description: "Categorize incoming support tickets into routing buckets.",
            labelTypes: ["Billing", "Technical", "Account", "Other"],
            texts: Array.from({length: 15}).map((_, i) => ({ id: `text_cs_${i}`, text: `Support ticket ${i}` })),
            complexityScore: 0.4,
            targetProfile: 'Moderate Reader',
            createdBy: "admin",
            status: "active"
        });
        await csProject.save();

        // Create mock Annotation Sessions for the Manager Dashboard to show stats
        // NER Project - 2 annotators, partially done
        const annotators = ['alice', 'bob', 'charlie'];
        for (const username of annotators) {
             await AnnotatorProfile.findOneAndUpdate(
                 { username },
                 {
                     username,
                     readingStyle: 'Moderate Reader',
                     baselineSpeed: 0.4,
                     pilotCompleted: true
                 },
                 { upsert: true }
             );
        }

        const nerSession1 = new AnnotationSession({
            contestantId: `alice_${nerProjectId}`,
            annotationCount: 10,
            labeledTaskIds: Array.from({length: 10}).map((_, i) => i),
            cumulativeTimeSaved: 120,
            cumulativeEntropyCost: 15.5,
            cumulativeRandomCost: 20.0,
            cumulativeCalLogCost: 4.5,
            datasetName: "Financial Document NER",
            labels: ["Person", "Organization"],
            uploadedTexts: []
        });
        await nerSession1.save();

        const nerSession2 = new AnnotationSession({
            contestantId: `bob_${nerProjectId}`,
            annotationCount: 20, // finished
            labeledTaskIds: Array.from({length: 20}).map((_, i) => i),
            cumulativeTimeSaved: 250,
            cumulativeEntropyCost: 30.0,
            cumulativeRandomCost: 40.0,
            cumulativeCalLogCost: 10.0,
            datasetName: "Financial Document NER",
            labels: ["Money"],
            uploadedTexts: []
        });
        await nerSession2.save();

        // CS Project - 1 annotator, partially done
        const csSession1 = new AnnotationSession({
            contestantId: `charlie_${csProjectId}`,
            annotationCount: 5,
            labeledTaskIds: [0, 1, 2, 3, 4],
            cumulativeTimeSaved: 45,
            cumulativeEntropyCost: 5.5,
            cumulativeRandomCost: 10.0,
            cumulativeCalLogCost: 2.5,
            datasetName: "Customer Support Intent Routing",
            labels: ["Billing"],
            uploadedTexts: []
        });
        await csSession1.save();

        console.log('Created mock annotation sessions for dashboard stats.');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
seed();
