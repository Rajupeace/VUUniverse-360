/**
 * Import JSON Data to MongoDB Atlas (Fresh Import)
 * Run: node scripts/import-json-data.js
 * Clears existing data and imports all JSON files from data/ folder to MongoDB Atlas
 */
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://bobbytej4_db_user:4ZltK5qmHHCxuFt6@cluster0.im2uv.mongodb.net/?appName=Cluster0';
const DATA_DIR = path.join(__dirname, '..', 'data');

async function importData() {
    let client;

    try {
        console.log('🔗 Connecting to MongoDB Atlas...');
        client = new MongoClient(MONGO_URI);
        await client.connect();
        const db = client.db('bobby'); // Use the correct database name
        console.log('✅ Connected to MongoDB Atlas');

        // STEP 1: Clear all existing data
        console.log('\n🗑️  Clearing existing data...');
        const collections = await db.listCollections().toArray();
        for (const collection of collections) {
            await db.collection(collection.name).drop();
            console.log(`🗑️  Dropped collection: ${collection.name}`);
        }
        console.log('✅ All existing data cleared');

        // STEP 2: Import new data from JSON files
        console.log('\n📥 Importing new data from JSON files...');

        // Get all JSON files from data directory
        const files = fs.readdirSync(DATA_DIR).filter(file => file.endsWith('.json'));

        for (const file of files) {
            const collectionName = file.replace('.json', ''); // Remove .json extension
            const filePath = path.join(DATA_DIR, file);

            console.log(`📁 Importing ${file} to collection '${collectionName}'...`);

            try {
                // Read and parse JSON file
                let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

                if (collectionName === 'materials' && Array.isArray(data)) {
                    const timestamp = new Date().toISOString();
                    data = data.map(item => ({
                        ...item,
                        uploadedAt: timestamp,
                        createdAt: timestamp,
                        updatedAt: timestamp,
                    }));
                }

                if (Array.isArray(data) && data.length > 0) {
                    // Insert new data
                    const result = await db.collection(collectionName).insertMany(data);
                    console.log(`✅ Imported ${result.insertedCount} documents to '${collectionName}'`);
                } else {
                    console.log(`⚠️  Skipping ${file} - empty or invalid data`);
                }
            } catch (error) {
                console.error(`❌ Error importing ${file}:`, error.message);
            }
        }

        // STEP 3: Verify import
        console.log('\n🔍 Verifying import...');
        const finalCollections = await db.listCollections().toArray();
        console.log('📊 Final collections in database:');
        for (const collection of finalCollections) {
            const count = await db.collection(collection.name).countDocuments();
            console.log(`   - ${collection.name}: ${count} documents`);
        }

        console.log('\n🎉 Database refresh completed successfully!');
        console.log('📊 Collections imported:', files.map(f => f.replace('.json', '')).join(', '));

    } catch (error) {
        console.error('❌ Import failed:', error.message);
        process.exit(1);
    } finally {
        if (client) {
            await client.close();
            console.log('🔌 Disconnected from MongoDB Atlas');
        }
    }
}

// Run the import
importData().catch(console.error);