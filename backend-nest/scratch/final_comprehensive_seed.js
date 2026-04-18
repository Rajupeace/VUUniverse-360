const { MongoClient } = require('mongodb');

async function run() {
    const uri = 'mongodb+srv://bobbyteja4_db_user:4ZltK5qmHHCxuFt6@cluster0.im2uv.mongodb.net/fbn_xai_system?appName=Cluster0';
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db('fbn_xai_system');
        const materialCollection = db.collection('AdminDashboardDB_Sections_Materials');

        console.log('Cleaning and re-seeding comprehensive materials...');
        await materialCollection.deleteMany({});

        const branches = ['CSE', 'ECE', 'EEE', 'Mechanical', 'Civil', 'IT', 'AIML'];
        const types = ['notes', 'videos', 'modelPapers', 'models'];
        const semesters = ['1', '2', '3', '4', '5', '6', '7', '8'];

        const materialsDocs = [];

        // Sample Subjects mapping to help the student find results
        const subjectMap = {
            '5': ['Computer Networks', 'Java Programming', 'DBMS', 'Operating Systems', 'Software Engineering'],
            '1': ['Mathematics-I', 'Physics', 'Programming for Problem Solving'],
            '3': ['Data Structures', 'Digital Logic Design', 'Discrete Mathematics']
        };

        branches.forEach(branch => {
            semesters.forEach(sem => {
                const year = Math.ceil(parseInt(sem) / 2).toString();
                const subjects = subjectMap[sem] || ['Professional Elective', 'Open Elective', 'Technical Seminar'];

                subjects.forEach(subject => {
                    // Create at least 1 resource of each type for each subject
                    types.forEach(type => {
                        const isVideo = type === 'videos';
                        const url = isVideo ? '/uploads/materials/demo_video.mp4' : '/uploads/materials/demo_note.pdf';
                        
                        materialsDocs.push({
                            title: `${subject} ${type.charAt(0).toUpperCase() + type.slice(1)} - Full Guide`,
                            description: `Comprehensive ${type} for ${subject} covering all important concepts for University exams.`,
                            year: year,
                            branch: branch,
                            semester: sem,
                            section: 'All',
                            subject: subject,
                            module: 'All', // Make it visible across modules too
                            unit: 'All',
                            topic: 'General',
                            type: type,
                            fileUrl: url,
                            url: url,
                            fileType: isVideo ? 'video/mp4' : 'application/pdf',
                            uploadedBy: 'University Admin',
                            facultyName: 'Dr. Sarah Jenkins',
                            views: Math.floor(Math.random() * 500),
                            downloads: Math.floor(Math.random() * 200),
                            likes: Math.floor(Math.random() * 50),
                            duration: isVideo ? '45:20' : null,
                            createdAt: new Date(),
                            uploadedAt: new Date()
                        });
                    });

                    // Add some module-specific resources
                    [1, 2, 3].forEach(modNum => {
                        materialsDocs.push({
                            title: `Module ${modNum} Deep-Dive: ${subject}`,
                            description: `In-depth notes for Module ${modNum} of ${subject}.`,
                            year: year,
                            branch: branch,
                            semester: sem,
                            section: 'All',
                            subject: subject,
                            module: modNum.toString(),
                            unit: 'All',
                            topic: 'Detailed',
                            type: 'notes',
                            fileUrl: '/uploads/materials/demo_note.pdf',
                            url: '/uploads/materials/demo_note.pdf',
                            fileType: 'application/pdf',
                            uploadedBy: 'University Admin',
                            facultyName: 'Dr. Sarah Jenkins',
                            createdAt: new Date(),
                            uploadedAt: new Date()
                        });
                    });
                });
            });
        });

        // Specific seeds for the demo student (231fa04A17, CSE, Year 3, Sem 5, Section 13)
        // Wait, the student is in Year 3, Section 13.
        const demoSubject = 'Computer Networks';
        materialsDocs.push({
            title: 'Computer Networks - Unit 1 Video Lecture',
            description: 'Essential lecture on OSI Model and TCP/IP stack.',
            year: '3',
            branch: 'CSE',
            semester: '5',
            section: '13',
            subject: demoSubject,
            module: '1',
            unit: '1',
            topic: 'OSI Model',
            type: 'videos',
            fileUrl: '/uploads/materials/demo_video.mp4',
            url: '/uploads/materials/demo_video.mp4',
            fileType: 'video/mp4',
            uploadedBy: 'Prof. Rajesh Khanna',
            facultyName: 'Prof. Rajesh Khanna',
            duration: '15:45',
            createdAt: new Date(),
            uploadedAt: new Date()
        });

        const result = await materialCollection.insertMany(materialsDocs);
        console.log(`✅ Successfully seeded ${result.insertedCount} material records.`);

    } catch (err) {
        console.error('Seeding failed:', err);
    } finally {
        await client.close();
    }
}

run();
