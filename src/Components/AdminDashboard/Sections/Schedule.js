const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
    branch: { type: String, required: true },
    year: { type: String, required: true },
    section: { type: String, required: true },
    // Map of "Day-TimeIndex" (e.g., "MON-0") to class details
    gridData: {
        type: Map,
        of: new mongoose.Schema({
            subject: String,
            faculty: String,
            room: String,
            type: { type: String, enum: ['lecture', 'lab', 'break'], default: 'lecture' }
        }, { _id: false })
    },
    lastUpdated: { type: Date, default: Date.now }
});

// Ensure one schedule per section
ScheduleSchema.index({ branch: 1, year: 1, section: 1 }, { unique: true });

module.exports = mongoose.model('Schedule', ScheduleSchema);
