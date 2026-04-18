
const mongoose = require('mongoose');
const MONGO_URI = 'mongodb+srv://bobbyteja4_db_user:4ZltK5qmHHCxuFt6@cluster0.im2uv.mongodb.net/fbn_xai_system?appName=Cluster0';

async function check() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected!');
        
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));
        
        for (const col of collections) {
            const count = await mongoose.connection.db.collection(col.name).countDocuments();
            console.log(` - ${col.name}: ${count} docs`);
        }
        
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

check();
