/**
 * Ingest Sample Data Script
 * Populates the database with AG News-style sample data for Impact Dashboard demo.
 */
require("dotenv").config();
const mongoose = require("mongoose");

// Sample AG News-like data (real news headlines)
const sampleData = [
    { text: "Stock market rallies as tech giants report strong quarterly earnings", label: "Business" },
    { text: "Scientists discover high-speed galactic jets shooting from supermassive black hole", label: "Sci/Tech" },
    { text: "Lakers overcome 20-point deficit to defeat Celtics in overtime thriller", label: "Sports" },
    { text: "UN Security Council meets to discuss rising tensions in Eastern Europe", label: "World" },
    { text: "Apple unveils next-generation M4 chip with unprecedented AI capabilities", label: "Sci/Tech" },
    { text: "Federal Reserve signals potential interest rate cuts in upcoming quarter", label: "Business" },
    { text: "Olympic gold medalist announces retirement after 15-year career", label: "Sports" },
    { text: "Massive earthquake strikes coastal region, thousands evacuated", label: "World" },
    { text: "Tesla stock surges 15% following autonomous driving breakthrough announcement", label: "Business" },
    { text: "NASA confirms water ice deposits found in permanently shadowed lunar craters", label: "Sci/Tech" },
    { text: "World Cup qualifying match ends in controversial penalty shootout", label: "Sports" },
    { text: "Climate summit reaches historic agreement on carbon emissions reduction", label: "World" },
    { text: "Amazon acquires healthcare startup in multi-billion dollar deal", label: "Business" },
    { text: "Researchers develop new CRISPR technique to treat genetic disorders", label: "Sci/Tech" },
    { text: "Tennis championship final delayed due to severe weather conditions", label: "Sports" },
    { text: "Trade negotiations between major economies reach critical impasse", label: "World" },
    { text: "Cryptocurrency market experiences volatile week amid regulatory uncertainty", label: "Business" },
    { text: "SpaceX successfully launches 60 additional Starlink satellites into orbit", label: "Sci/Tech" },
    { text: "Premier League title race intensifies with three teams tied at top", label: "Sports" },
    { text: "Humanitarian crisis deepens as refugee camps reach maximum capacity", label: "World" },
    { text: "Major airline announces massive fleet expansion and new international routes", label: "Business" },
    { text: "Quantum computer achieves error correction milestone in landmark experiment", label: "Sci/Tech" },
    { text: "Baseball commissioner proposes rule changes to speed up game pace", label: "Sports" },
    { text: "Diplomatic relations restored between neighboring countries after decade-long dispute", label: "World" },
    { text: "Retail giant reports record holiday sales driven by e-commerce growth", label: "Business" },
    { text: "Machine learning algorithm outperforms doctors in early cancer detection", label: "Sci/Tech" },
    { text: "Golf tournament suspends play as lightning forces evacuation of course", label: "Sports" },
    { text: "International peacekeeping mission deployed to conflict zone", label: "World" },
    { text: "Oil prices spike following pipeline disruption in major producing region", label: "Business" },
    { text: "Rover discovers evidence of ancient river systems on Mars surface", label: "Sci/Tech" },
    { text: "Boxing champion defends title in unanimous decision victory", label: "Sports" },
    { text: "G7 leaders pledge billions in development aid for emerging economies", label: "World" },
    { text: "Pharmaceutical company wins FDA approval for groundbreaking cancer treatment", label: "Business" },
    { text: "Astronomers detect radio signals from distant exoplanet atmosphere", label: "Sci/Tech" },
    { text: "Soccer star completes record-breaking transfer to European club", label: "Sports" },
    { text: "Protests erupt across major cities demanding government reform", label: "World" },
    { text: "Merger between telecom giants creates industry largest player", label: "Business" },
    { text: "Fusion reactor achieves net energy gain for first time in history", label: "Sci/Tech" },
    { text: "Marathon runner sets new world record at prestigious international event", label: "Sports" },
    { text: "Election results contested as opposition party demands recount", label: "World" },
    { text: "Startup unicorn goes public with $50 billion market valuation", label: "Business" },
    { text: "AI language model demonstrates reasoning abilities matching human experts", label: "Sci/Tech" },
    { text: "NFL team fires head coach after disappointing playoff exit", label: "Sports" },
    { text: "Border security increased following intelligence warnings", label: "World" },
    { text: "Housing market shows signs of cooling after years of price increases", label: "Business" },
    { text: "Gene therapy trial shows promising results for rare inherited disease", label: "Sci/Tech" },
    { text: "Basketball superstar achieves career milestone with historic performance", label: "Sports" },
    { text: "Embassy evacuated as civil unrest spreads through capital city", label: "World" },
    { text: "Central bank announces quantitative easing measures to stimulate economy", label: "Business" },
    { text: "Particle accelerator experiment reveals new physics beyond Standard Model", label: "Sci/Tech" },
    { text: "Ice hockey team ends championship drought with dramatic game seven victory", label: "Sports" },
    { text: "Sanctions imposed on nation following human rights violations report", label: "World" },
    { text: "Supply chain disruptions threaten global manufacturing output", label: "Business" },
    { text: "3D bioprinting breakthrough creates functional human organ tissue", label: "Sci/Tech" },
    { text: "College football rivalry game draws record television viewership", label: "Sports" },
    { text: "Peace treaty signed ending decades of armed conflict", label: "World" },
    { text: "Credit card debt reaches all-time high as consumers struggle with inflation", label: "Business" },
    { text: "Blockchain technology adopted by major banking institutions worldwide", label: "Sci/Tech" },
    { text: "Track and field athlete breaks long-standing sprint record", label: "Sports" },
    { text: "New government formed after coalition negotiations conclude", label: "World" },
    // Longer texts for variety
    { text: "In a surprising turn of events, the stock market experienced its largest single-day gain in over a decade as investors responded positively to the Federal Reserve's announcement of a pause in interest rate hikes. Tech stocks led the rally with major companies seeing double-digit percentage gains.", label: "Business" },
    { text: "Scientists at the European Organization for Nuclear Research have announced the discovery of a new fundamental particle that could revolutionize our understanding of the universe. The particle, tentatively named the 'X17 boson', was detected during high-energy collisions at the Large Hadron Collider.", label: "Sci/Tech" },
    { text: "The championship game went down to the final seconds as the underdog team mounted an incredible comeback from a 21-point deficit in the fourth quarter. The winning touchdown was scored with just three seconds remaining on the clock, sending fans into a frenzy of celebration.", label: "Sports" },
    { text: "The United Nations held an emergency session today to address the humanitarian crisis unfolding in the region. Representatives from over 100 countries condemned the violence and called for immediate ceasefire while pledging support for displaced civilians seeking refuge in neighboring nations.", label: "World" },
    { text: "Breaking news from Silicon Valley as the world's largest technology company announces a revolutionary new product that combines artificial intelligence with augmented reality in ways never seen before. The device is expected to transform how humans interact with digital information.", label: "Sci/Tech" },
    { text: "Financial analysts are warning of potential market correction as valuation metrics reach levels not seen since the dot-com bubble. Despite strong corporate earnings, concerns about inflation, geopolitical tensions, and central bank policies are creating uncertainty among investors.", label: "Business" },
    { text: "The legendary athlete announced their retirement today after a career spanning over two decades and including multiple championship titles, MVP awards, and record-breaking performances. Fans and fellow athletes paid tribute to their incredible legacy and impact on the sport.", label: "Sports" },
    { text: "A devastating natural disaster has struck the coastal region, leaving thousands homeless and causing billions in damages. Emergency response teams from around the world are mobilizing to provide aid, while local authorities work to restore critical infrastructure and search for survivors.", label: "World" },
    { text: "Researchers have made a breakthrough in renewable energy technology with a new solar cell design that achieves unprecedented efficiency levels. The innovation could dramatically reduce the cost of solar power and accelerate the global transition away from fossil fuels.", label: "Sci/Tech" },
    { text: "The central bank's decision to cut interest rates has sparked debate among economists about the appropriate monetary policy response to current economic conditions. While some praise the move as necessary stimulus, others warn it could fuel inflation and asset bubbles.", label: "Business" }
];

// Connect to MongoDB and seed data
async function seedDatabase() {
    try {
        console.log("🔌 Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/alx_research");
        console.log("✅ Connected to MongoDB");

        // Get or create a demo project
        const Project = mongoose.model("Project", new mongoose.Schema({
            name: String,
            description: String,
            labels: [String],
            createdAt: { type: Date, default: Date.now }
        }));

        let project = await Project.findOne({ name: "Demo Impact Project" });
        if (!project) {
            project = await Project.create({
                name: "Demo Impact Project",
                description: "Sample data for CAL-Log Impact Analysis",
                labels: ["World", "Sports", "Business", "Sci/Tech"]
            });
            console.log("✅ Created demo project:", project._id);
        }

        // Define Task schema
        const Task = mongoose.model("Task", new mongoose.Schema({
            projectId: mongoose.Schema.Types.ObjectId,
            data: mongoose.Schema.Types.Mixed,
            status: String,
            label: String,
            ground_truth: String,
            is_seed: Boolean,
            priority: Number,
            createdAt: { type: Date, default: Date.now }
        }));

        // Clear existing tasks
        const deleted = await Task.deleteMany({ projectId: project._id });
        console.log(`🗑️ Cleared ${deleted.deletedCount} existing tasks`);

        // Insert sample tasks
        const tasks = sampleData.map(item => ({
            projectId: project._id,
            data: { text: item.text },  // Store text in data.text field
            status: "pending",
            ground_truth: item.label,
            is_seed: false,
            priority: 0
        }));

        await Task.insertMany(tasks);
        console.log(`✅ Inserted ${tasks.length} sample tasks`);

        // Also add some seed tasks (labeled) for model training
        const seedTasks = sampleData.slice(0, 20).map(item => ({
            projectId: project._id,
            data: { text: item.text },
            status: "seed",
            label: item.label,
            ground_truth: item.label,
            is_seed: true,
            priority: 0
        }));

        await Task.insertMany(seedTasks);
        console.log(`✅ Inserted ${seedTasks.length} seed tasks for model training`);

        console.log("\n🎉 Database seeded successfully!");
        console.log(`   Project ID: ${project._id}`);
        console.log(`   Total tasks: ${tasks.length + seedTasks.length}`);

        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding database:", error);
        process.exit(1);
    }
}

seedDatabase();
