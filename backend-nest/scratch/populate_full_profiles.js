const { MongoClient } = require('mongodb');

async function run() {
    const uri = 'mongodb+srv://bobbyteja4_db_user:4ZltK5qmHHCxuFt6@cluster0.im2uv.mongodb.net/fbn_xai_system?appName=Cluster0';
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db('fbn_xai_system');
        const studentCollection = db.collection('Students');
        const studentDataCollection = db.collection('StudentData');

        console.log('Populating comprehensive profile data for all students...');

        const demoProfileData = {
            dateOfBirth: '2004-05-15',
            gender: 'Male',
            phone: '+91 9494928282',
            address: 'Plot 42, Vignan Colony, Duvvada, Visakhapatnam, AP',
            religion: 'Indian',
            admissionMode: 'EAPCET',
            schoolName: 'ZPH School',
            schoolLocation: 'Visakhapatnam',
            sscMarks: '9.8 GPA',
            sscPassOutYear: '2019',
            intermediateMarks: '978/1000',
            intermediatePassOutYear: '2021',
            intermediateCollegeLocation: 'Vijayawada',
            bio: 'Aspiring engineer dedicated to solving real-world problems through code and innovation.',
            lastSyncAt: new Date()
        };

        // Update Students collection (Source of Truth for profile)
        const studentsUpdate = await studentCollection.updateMany(
            { sid: { $exists: true } },
            { $set: demoProfileData }
        );

        // Update StudentData collection (Dashboard Cache)
        const studentDataUpdate = await studentDataCollection.updateMany(
            { sid: { $exists: true } },
            { $set: demoProfileData }
        );

        console.log(`✅ Successfully updated ${studentsUpdate.modifiedCount} profile records and ${studentDataUpdate.modifiedCount} dashboard cache records.`);

    } catch (err) {
        console.error('Data population failed:', err);
    } finally {
        await client.close();
    }
}

run();
