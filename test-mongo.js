/**
 * Test MongoDB Connection
 */
const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

async function testConnection() {
    console.log('Testing MongoDB connection...');
    console.log('URI:', MONGO_URI.replace(/:([^:@]{4})[^:@]*@/, ':****@')); // Hide password

    try {
        const client = new MongoClient(MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
        });

        await client.connect();
        console.log('✅ Connected successfully!');

        const db = client.db('fbn_xai_system');
        const collections = await db.listCollections().toArray();
        console.log('📊 Collections:', collections.map(c => c.name));

        await client.close();
        console.log('🔌 Disconnected');

    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        console.error('Full error:', error);
    }
}

testConnection();