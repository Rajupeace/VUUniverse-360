/**
 * Database Connection Service
 * Connects to MongoDB Atlas, falls back to Memory MongoDB (JSON files)
 */
const { MongoClient } = require('mongodb');
const MemoryMongoDB = require('./memory-mongodb.service');

class DatabaseService {
    constructor() {
        this.mongoClient = null;
        this.db = null;
        this.useMemoryFallback = false;
        this.memoryDb = null;
    }

    async connect() {
        const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/fbn_xai_system';

        try {
            console.log('🔗 Attempting to connect to MongoDB Atlas...');
            this.mongoClient = new MongoClient(MONGO_URI, {
                serverSelectionTimeoutMS: 10000,
                connectTimeoutMS: 10000,
                maxPoolSize: 10,
            });

            await this.mongoClient.connect();
            this.db = this.mongoClient.db('fbn_xai_system');

            // Test the connection
            await this.db.admin().ping();
            console.log('✅ Connected to MongoDB Atlas successfully');
            console.log('📊 Database:', this.db.databaseName);

        } catch (error) {
            console.warn('⚠️  MongoDB Atlas connection failed:', error.message);
            console.log('🗄️  Switching to Memory MongoDB (JSON files)...');

            this.useMemoryFallback = true;
            this.memoryDb = new MemoryMongoDB();
            this.db = this.memoryDb.db('fbn_xai_system');

            console.log('✅ Memory MongoDB initialized with local JSON data');
        }
    }

    getDatabase() {
        return this.db;
    }

    async close() {
        if (this.mongoClient && !this.useMemoryFallback) {
            await this.mongoClient.close();
            console.log('🔌 Disconnected from MongoDB Atlas');
        } else if (this.memoryDb) {
            await this.memoryDb.close();
        }
    }

    // Health check
    async healthCheck() {
        if (this.useMemoryFallback) {
            const collections = Array.from(this.memoryDb.collections.keys());
            return {
                status: 'OK',
                database: 'Memory MongoDB (JSON Files)',
                collections: collections,
                recordCounts: collections.reduce((acc, col) => {
                    acc[col] = this.memoryDb.collections.get(col).length;
                    return acc;
                }, {})
            };
        }

        try {
            await this.db.admin().ping();
            return {
                status: 'OK',
                database: 'MongoDB Atlas',
                name: this.db.databaseName
            };
        } catch (error) {
            return {
                status: 'ERROR',
                database: 'MongoDB Atlas',
                error: error.message
            };
        }
    }
}

module.exports = new DatabaseService();