const { MongoClient } = require('mongodb');

async function run() {
    const uri = 'mongodb+srv://bobbyteja4_db_user:4ZltK5qmHHCxuFt6@cluster0.im2uv.mongodb.net/fbn_xai_system?appName=Cluster0';
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db('fbn_xai_system');
        const marksCollection = db.collection('StudentMarks');

        console.log('Seeding student marks...');
        
        const demoMarks = [
            {
                sid: '231fa04A17',
                studentName: 'Demo Student',
                examination: 'Mid-Term 1',
                academicYear: '2023-24',
                semester: '5',
                subjects: [
                    { name: 'Computer Networks', internal: 24, external: 0, total: 24, credits: 3, grade: 'A' },
                    { name: 'Java Programming', internal: 28, external: 0, total: 28, credits: 3, grade: 'S' },
                    { name: 'DBMS', internal: 22, external: 0, total: 22, credits: 4, grade: 'B' },
                    { name: 'Operating Systems', internal: 26, external: 0, total: 26, credits: 3, grade: 'A' }
                ],
                totalMarks: 100,
                maxMarks: 120,
                gpa: 8.8,
                publishedAt: new Date()
            },
            {
                sid: '231fa04A17',
                studentName: 'Demo Student',
                examination: 'End-Semester (Reg)',
                academicYear: '2023-24',
                semester: '4',
                subjects: [
                    { name: 'Software Engineering', internal: 25, external: 55, total: 80, credits: 3, grade: 'A' },
                    { name: 'Python Basics', internal: 28, external: 60, total: 88, credits: 3, grade: 'S' },
                    { name: 'Discrete Math', internal: 22, external: 48, total: 70, credits: 4, grade: 'B' }
                ],
                totalMarks: 238,
                maxMarks: 300,
                gpa: 8.92,
                publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30) // 1 month ago
            }
        ];

        await marksCollection.deleteMany({ sid: '231fa04A17' });
        await marksCollection.insertMany(demoMarks);
        
        console.log('✅ Student marks seeded.');

    } catch (err) {
        console.error('Seeding failed:', err);
    } finally {
        await client.close();
    }
}

run();
