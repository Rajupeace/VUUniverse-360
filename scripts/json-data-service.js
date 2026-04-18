/**
 * JSON Data Service for Local Development
 * Serves data from JSON files when MongoDB is not available
 */
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 27018; // Different port from MongoDB
const DATA_DIR = path.join(__dirname, '..', 'data');

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to read JSON files
function readJsonFile(filename) {
    try {
        const filePath = path.join(DATA_DIR, filename);
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        }
        return [];
    } catch (error) {
        console.error(`Error reading ${filename}:`, error.message);
        return [];
    }
}

// API Routes
app.get('/api/admins', (req, res) => {
    const admins = readJsonFile('admins.json');
    res.json(admins);
});

app.get('/api/achievements', (req, res) => {
    const achievements = readJsonFile('achievements.json');
    res.json(achievements);
});

app.get('/api/attendance', (req, res) => {
    const attendance = readJsonFile('attendance.json');
    res.json(attendance);
});

app.get('/api/materials', (req, res) => {
    const materials = readJsonFile('materials.json');
    res.json(materials);
});

app.get('/api/messages', (req, res) => {
    const messages = readJsonFile('messages.json');
    res.json(messages);
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'JSON Data Service', collections: ['admins', 'achievements', 'attendance', 'materials', 'messages'] });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 JSON Data Service running on http://localhost:${PORT}`);
    console.log(`📁 Serving data from: ${DATA_DIR}`);
    console.log(`🔗 Available endpoints:`);
    console.log(`   GET /api/admins`);
    console.log(`   GET /api/achievements`);
    console.log(`   GET /api/attendance`);
    console.log(`   GET /api/materials`);
    console.log(`   GET /api/messages`);
    console.log(`   GET /health`);
});

module.exports = app;