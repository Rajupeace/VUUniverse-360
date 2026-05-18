const dns = require('dns');
// Override DNS servers to Google's Public DNS to bypass local SRV lookup failure
dns.setServers(['8.8.8.8', '8.8.4.4']);

const { MongoClient } = require('mongodb');

// Using the exact SRV style URI from .env
const MONGO_URI = "mongodb+srv://bobbyteja4_db_user:4ZltK5qmHHCxuFt6@cluster0.im2uv.mongodb.net/fbn_xai_system?appName=Cluster0";

async function checkAdmins() {
    console.log('Connecting to MongoDB Atlas via SRV with Google DNS...');
    const client = new MongoClient(MONGO_URI);
    try {
        await client.connect();
        console.log('Connected successfully to MongoDB.');
        
        const db = client.db('fbn_xai_system');
        
        // Let's first list collections to find the correct collection name
        const collections = await db.listCollections().toArray();
        console.log('Available collections:', collections.map(c => c.name));
        
        // Find if there is an admin/admins collection
        const adminCollectionName = collections.map(c => c.name).find(name => name.toLowerCase().includes('admin'));
        console.log('Admin collection identified as:', adminCollectionName);
        
        if (adminCollectionName) {
            const adminCollection = db.collection(adminCollectionName);
            const admins = await adminCollection.find({}).toArray();
            console.log('Found admins:', JSON.stringify(admins, null, 2));
        } else {
            console.log('No collection matching "admin" was found.');
        }
    } catch (err) {
        console.error('Error connecting or querying:', err);
    } finally {
        await client.close();
    }
}

checkAdmins();
