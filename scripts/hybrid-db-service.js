/**
 * Hybrid Database Service
 * Connects to MongoDB Atlas, falls back to local JSON files
 */
const fs = require('fs');
const path = require('path');

class HybridDatabaseService {
    constructor() {
        this.dataDir = path.join(__dirname, '..', 'data');
        this.collections = {};
        this.loadJsonData();
    }

    loadJsonData() {
        const files = ['admins.json', 'achievements.json', 'attendance.json', 'materials.json', 'messages.json'];

        files.forEach(file => {
            try {
                const filePath = path.join(this.dataDir, file);
                if (fs.existsSync(filePath)) {
                    const collectionName = file.replace('.json', '');
                    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                    this.collections[collectionName] = data;
                    console.log(`📁 Loaded ${data.length} records from ${collectionName}`);
                }
            } catch (error) {
                console.error(`Error loading ${file}:`, error.message);
            }
        });
    }

    // Simulate MongoDB collection methods
    collection(name) {
        return {
            find: (query = {}) => {
                const data = this.collections[name] || [];
                // Simple query simulation
                if (Object.keys(query).length === 0) {
                    return {
                        toArray: async () => data,
                        limit: (n) => ({ toArray: async () => data.slice(0, n) })
                    };
                }
                // Filter data based on query
                const filtered = data.filter(item => {
                    return Object.keys(query).every(key => item[key] === query[key]);
                });
                return {
                    toArray: async () => filtered,
                    limit: (n) => ({ toArray: async () => filtered.slice(0, n) })
                };
            },

            findOne: async (query) => {
                const data = this.collections[name] || [];
                return data.find(item =>
                    Object.keys(query).every(key => item[key] === query[key])
                ) || null;
            },

            insertOne: async (doc) => {
                const data = this.collections[name] || [];
                doc._id = doc._id || this.generateId();
                doc.createdAt = doc.createdAt || new Date();
                doc.updatedAt = new Date();
                data.push(doc);
                this.saveCollection(name);
                return { insertedId: doc._id };
            },

            insertMany: async (docs) => {
                const data = this.collections[name] || [];
                docs.forEach(doc => {
                    doc._id = doc._id || this.generateId();
                    doc.createdAt = doc.createdAt || new Date();
                    doc.updatedAt = new Date();
                });
                data.push(...docs);
                this.saveCollection(name);
                return { insertedCount: docs.length };
            },

            updateOne: async (query, update) => {
                const data = this.collections[name] || [];
                const index = data.findIndex(item =>
                    Object.keys(query).every(key => item[key] === query[key])
                );
                if (index !== -1) {
                    Object.assign(data[index], update.$set || update);
                    data[index].updatedAt = new Date();
                    this.saveCollection(name);
                    return { modifiedCount: 1 };
                }
                return { modifiedCount: 0 };
            },

            deleteOne: async (query) => {
                const data = this.collections[name] || [];
                const index = data.findIndex(item =>
                    Object.keys(query).every(key => item[key] === query[key])
                );
                if (index !== -1) {
                    data.splice(index, 1);
                    this.saveCollection(name);
                    return { deletedCount: 1 };
                }
                return { deletedCount: 0 };
            },

            deleteMany: async (query = {}) => {
                const data = this.collections[name] || [];
                let deletedCount = 0;
                if (Object.keys(query).length === 0) {
                    deletedCount = data.length;
                    this.collections[name] = [];
                } else {
                    const filtered = data.filter(item => {
                        return !Object.keys(query).every(key => item[key] === query[key]);
                    });
                    deletedCount = data.length - filtered.length;
                    this.collections[name] = filtered;
                }
                this.saveCollection(name);
                return { deletedCount };
            }
        };
    }

    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    saveCollection(name) {
        try {
            const filePath = path.join(this.dataDir, `${name}.json`);
            fs.writeFileSync(filePath, JSON.stringify(this.collections[name], null, 2));
        } catch (error) {
            console.error(`Error saving ${name}:`, error.message);
        }
    }

    // Health check
    async ping() {
        return { ok: 1 };
    }
}

module.exports = HybridDatabaseService;