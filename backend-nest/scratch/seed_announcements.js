const { MongoClient } = require('mongodb');

async function run() {
    const uri = 'mongodb+srv://bobbyteja4_db_user:4ZltK5qmHHCxuFt6@cluster0.im2uv.mongodb.net/fbn_xai_system?appName=Cluster0';
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db('fbn_xai_system');
        const announcementCollection = db.collection('Announcements');

        console.log('Seeding demo announcements...');
        
        const demoAnnouncements = [
            {
                subject: 'End-Semester Examination Schedule',
                message: 'The examination schedule for all 3rd year students has been released. Please check the portal for specific subject dates.',
                sender: 'Exam Cell',
                senderRole: 'admin',
                type: 'urgent',
                target: 'students-specific',
                targetYear: '3',
                targetSections: ['A', 'B', 'C'],
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
            },
            {
                subject: 'Workshop on AI & Robotics',
                message: 'A specialized workshop on Robotics Automation will be held this Friday in Seminar Hall-A. Registration is open.',
                sender: 'Dr. Nexus',
                senderRole: 'faculty',
                type: 'info',
                target: 'students',
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
            },
            {
                subject: 'Hackathon 2024 Registration',
                message: 'Vu UniVerse360 annual Hackathon registration ends today at midnight. Participate to win exciting prizes!',
                sender: 'Department Office',
                senderRole: 'admin',
                type: 'warning',
                target: 'all',
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
            }
        ];

        await announcementCollection.deleteMany({ sender: { $in: ['Exam Cell', 'Dr. Nexus', 'Department Office'] } });
        await announcementCollection.insertMany(demoAnnouncements);
        
        console.log('✅ Demo announcements seeded.');

    } catch (err) {
        console.error('Seeding failed:', err);
    } finally {
        await client.close();
    }
}

run();
