const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://bobbyteja4_db_user:VuUniverse360SecurePass2026!@cluster0.im2uv.mongodb.net/fbn_xai_system?appName=Cluster0';

async function wipeDatabase() {
    try {
        console.log("Connecting to MongoDB Atlas...");
        await mongoose.connect(MONGODB_URI);
        console.log("Connected. Dropping database...");
        
        await mongoose.connection.db.dropDatabase();
        
        console.log("Database dropped successfully.");
    } catch (e) {
        console.error("Error dropping database:", e);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected.");
    }
}

wipeDatabase();
