const { MongoClient } = require('mongodb');

async function run() {
    const uri = 'mongodb+srv://bobbyteja4_db_user:4ZltK5qmHHCxuFt6@cluster0.im2uv.mongodb.net/fbn_xai_system?appName=Cluster0';
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db('fbn_xai_system');
        const facultyCollection = db.collection('Faculty');

        console.log('Updating faculty assignments for student discovery...');

        // Faculty 1: Dr. Nexus (CSE, Year 3, Section A)
        await facultyCollection.updateOne(
            { facultyId: 'FAC001' },
            { $set: {
                name: 'Dr. Nexus Demo',
                email: 'nexus@vignan.ac.in',
                designation: 'Professor',
                department: 'CSE',
                profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nexus',
                assignments: [
                    { year: '3', section: 'A', branch: 'CSE', subject: 'Computer Networks' },
                    { year: '3', section: 'B', branch: 'CSE', subject: 'Computer Networks' }
                ]
            }},
            { upsert: true }
        );

        // Faculty 2: Prof. Sarah (CSE, Year 3, Section A)
        await facultyCollection.updateOne(
            { facultyId: 'FAC002' },
            { $set: {
                name: 'Prof. Sarah Jenkins',
                email: 'sarah@vignan.ac.in',
                designation: 'Associate Professor',
                department: 'CSE',
                profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
                assignments: [
                    { year: '3', section: 'A', branch: 'CSE', subject: 'Web Technologies' }
                ]
            }},
            { upsert: true }
        );

        // Faculty 3: Dr. Alan (CSE, Year 1, Section All)
        await facultyCollection.updateOne(
            { facultyId: 'FAC003' },
            { $set: {
                name: 'Dr. Alan Turing',
                email: 'alan@vignan.ac.in',
                designation: 'HOD',
                department: 'CSE',
                assignments: [
                    { year: '1', section: 'A', branch: 'CSE', subject: 'Mathematics - I' },
                    { year: '1', section: 'B', branch: 'CSE', subject: 'Mathematics - I' }
                ]
            }},
            { upsert: true }
        );

        console.log('✅ Faculty assignments updated.');

    } catch (err) {
        console.error('Update failed:', err);
    } finally {
        await client.close();
    }
}

run();
