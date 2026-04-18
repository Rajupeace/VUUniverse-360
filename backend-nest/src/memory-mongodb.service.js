/**
 * In-Memory MongoDB-like Database Service
 * Simulates MongoDB operations using local JSON files
 * Perfect for development when MongoDB Atlas is not accessible
 */
const fs = require('fs');
const path = require('path');
const { ObjectId } = require('mongodb');

class MemoryMongoDB {
    constructor(dataDir = path.join(__dirname, '..', 'data')) {
        this.dataDir = dataDir;
        this.collections = new Map();
        this.loadCollections();
        console.log('🗄️  Memory MongoDB initialized with collections:', Array.from(this.collections.keys()).join(', '));
    }

    loadCollections() {
        const jsonFiles = ['admins.json', 'achievements.json', 'attendance.json', 'materials.json', 'messages.json'];

        jsonFiles.forEach(file => {
            const collectionName = file.replace('.json', '');
            const filePath = path.join(this.dataDir, file);

            try {
                if (fs.existsSync(filePath)) {
                    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                    // Convert string _ids to ObjectIds for MongoDB compatibility
                    const processedData = data.map(item => ({
                        ...item,
                        _id: item._id ? (typeof item._id === 'string' ? new ObjectId(item._id) : item._id) : new ObjectId()
                    }));
                    this.collections.set(collectionName, processedData);
                    console.log(`📁 Loaded ${processedData.length} documents into '${collectionName}'`);
                } else {
                    this.collections.set(collectionName, []);
                    console.log(`📁 Created empty collection '${collectionName}'`);
                }
            } catch (error) {
                console.error(`❌ Error loading ${file}:`, error.message);
                this.collections.set(collectionName, []);
            }
        });
    }

    collection(name) {
        if (!this.collections.has(name)) {
            this.collections.set(name, []);
        }

        const data = this.collections.get(name);

        return {
            find: (query = {}, options = {}) => {
                let results = [...data];

                // Apply query filters
                if (Object.keys(query).length > 0) {
                    results = results.filter(doc => this.matchesQuery(doc, query));
                }

                // Apply sorting
                if (options.sort) {
                    results.sort((a, b) => {
                        for (const [key, order] of Object.entries(options.sort)) {
                            const aVal = this.getNestedValue(a, key);
                            const bVal = this.getNestedValue(b, key);
                            if (aVal < bVal) return order === 1 ? -1 : 1;
                            if (aVal > bVal) return order === 1 ? 1 : -1;
                        }
                        return 0;
                    });
                }

                // Apply limit
                if (options.limit) {
                    results = results.slice(0, options.limit);
                }

                return {
                    toArray: async () => results,
                    limit: (n) => ({ toArray: async () => results.slice(0, n) }),
                    sort: (sortObj) => ({ toArray: async () => results }),
                    count: async () => results.length
                };
            },

            findOne: async (query = {}) => {
                const results = await this.collection(name).find(query, { limit: 1 }).toArray();
                return results[0] || null;
            },

            insertOne: async (doc) => {
                const newDoc = {
                    ...doc,
                    _id: doc._id || new ObjectId(),
                    createdAt: doc.createdAt || new Date(),
                    updatedAt: new Date()
                };
                data.push(newDoc);
                this.saveCollection(name);
                return { insertedId: newDoc._id, acknowledged: true };
            },

            insertMany: async (docs) => {
                const insertedIds = [];
                docs.forEach(doc => {
                    const newDoc = {
                        ...doc,
                        _id: doc._id || new ObjectId(),
                        createdAt: doc.createdAt || new Date(),
                        updatedAt: new Date()
                    };
                    data.push(newDoc);
                    insertedIds.push(newDoc._id);
                });
                this.saveCollection(name);
                return { insertedIds, insertedCount: docs.length, acknowledged: true };
            },

            updateOne: async (query, update) => {
                const index = data.findIndex(doc => this.matchesQuery(doc, query));
                if (index !== -1) {
                    const updatedDoc = { ...data[index], ...update.$set, updatedAt: new Date() };
                    data[index] = updatedDoc;
                    this.saveCollection(name);
                    return { matchedCount: 1, modifiedCount: 1, acknowledged: true };
                }
                return { matchedCount: 0, modifiedCount: 0, acknowledged: true };
            },

            updateMany: async (query, update) => {
                let modifiedCount = 0;
                data.forEach((doc, index) => {
                    if (this.matchesQuery(doc, query)) {
                        data[index] = { ...doc, ...update.$set, updatedAt: new Date() };
                        modifiedCount++;
                    }
                });
                if (modifiedCount > 0) {
                    this.saveCollection(name);
                }
                return { matchedCount: modifiedCount, modifiedCount, acknowledged: true };
            },

            deleteOne: async (query) => {
                const index = data.findIndex(doc => this.matchesQuery(doc, query));
                if (index !== -1) {
                    data.splice(index, 1);
                    this.saveCollection(name);
                    return { deletedCount: 1, acknowledged: true };
                }
                return { deletedCount: 0, acknowledged: true };
            },

            deleteMany: async (query = {}) => {
                const initialLength = data.length;
                const filtered = data.filter(doc => !this.matchesQuery(doc, query));
                const deletedCount = initialLength - filtered.length;
                this.collections.set(name, filtered);
                if (deletedCount > 0) {
                    this.saveCollection(name);
                }
                return { deletedCount, acknowledged: true };
            },

            countDocuments: async (query = {}) => {
                const results = await this.collection(name).find(query).toArray();
                return results.length;
            }
        };
    }

    matchesQuery(doc, query) {
        return Object.keys(query).every(key => {
            const docValue = this.getNestedValue(doc, key);
            const queryValue = query[key];

            if (typeof queryValue === 'object' && queryValue !== null) {
                // Handle MongoDB operators
                if (queryValue.$eq !== undefined) return docValue === queryValue.$eq;
                if (queryValue.$ne !== undefined) return docValue !== queryValue.$ne;
                if (queryValue.$gt !== undefined) return docValue > queryValue.$gt;
                if (queryValue.$gte !== undefined) return docValue >= queryValue.$gte;
                if (queryValue.$lt !== undefined) return docValue < queryValue.$lt;
                if (queryValue.$lte !== undefined) return docValue <= queryValue.$lte;
                if (queryValue.$in !== undefined) return queryValue.$in.includes(docValue);
                if (queryValue.$nin !== undefined) return !queryValue.$nin.includes(docValue);
                if (queryValue.$regex !== undefined) return queryValue.$regex.test(docValue);
            }

            return docValue === queryValue;
        });
    }

    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    saveCollection(name) {
        try {
            const filePath = path.join(this.dataDir, `${name}.json`);
            const data = this.collections.get(name) || [];
            // Convert ObjectIds back to strings for JSON storage
            const jsonData = data.map(doc => ({
                ...doc,
                _id: doc._id?.toString ? doc._id.toString() : doc._id
            }));
            fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));
        } catch (error) {
            console.error(`❌ Error saving collection ${name}:`, error.message);
        }
    }

    // MongoDB-like methods
    db(name) {
        return {
            collection: (colName) => this.collection(colName),
            admin: () => ({
                ping: async () => ({ ok: 1 }),
                serverStatus: async () => ({ ok: 1, version: 'MemoryMongoDB-1.0' })
            })
        };
    }

    admin() {
        return {
            ping: async () => ({ ok: 1 }),
            serverStatus: async () => ({ ok: 1, version: 'MemoryMongoDB-1.0' })
        };
    }

    async close() {
        console.log('🗄️  Memory MongoDB connection closed');
    }
}

module.exports = MemoryMongoDB;