const express = require('express');
const router = express.Router();
const Schedule = require('../models/Schedule');

// GET Schedule
router.get('/', async (req, res) => {
    try {
        const { branch, year, section } = req.query;
        const schedule = await Schedule.findOne({ branch, year, section });

        if (!schedule) {
            return res.json({ success: true, data: {} });
        }

        res.json({ success: true, data: schedule.gridData, lastUpdated: schedule.lastUpdated });
    } catch (error) {
        console.error('Fetch Schedule Error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch schedule' });
    }
});

// SAVE Schedule
router.post('/', async (req, res) => {
    try {
        const { branch, year, section, gridData } = req.body;

        const schedule = await Schedule.findOneAndUpdate(
            { branch, year, section },
            {
                gridData,
                lastUpdated: new Date()
            },
            { new: true, upsert: true }
        );

        res.json({ success: true, data: schedule.gridData, lastUpdated: schedule.lastUpdated });
    } catch (error) {
        console.error('Save Schedule Error:', error);
        res.status(500).json({ success: false, error: 'Failed to save schedule' });
    }
});

module.exports = router;
