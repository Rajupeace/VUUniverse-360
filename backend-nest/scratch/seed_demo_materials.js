const { MongoClient, ObjectId } = require('mongodb');

async function run() {
    const uri = 'mongodb+srv://bobbyteja4_db_user:4ZltK5qmHHCxuFt6@cluster0.im2uv.mongodb.net/fbn_xai_system?appName=Cluster0';
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db('fbn_xai_system');
        const materialsCollection = db.collection('AdminDashboardDB_Sections_Materials');

        // Sample data for all semesters
        const demoData = [
            // Sem 1
            { sem: '1', sub: 'Mathematics - I', title: 'Calculus & Linear Algebra Notes', type: 'notes' },
            { sem: '1', sub: 'Applied Physics', title: 'Quantum Mechanics Basics Video', type: 'videos', isVideo: true },
            { sem: '1', sub: 'Programming for Problem Solving', title: 'PPS Model Paper 2023', type: 'model_paper' },
            // Sem 2
            { sem: '2', sub: 'Data Structures', title: 'All Algorithms Visualized', type: 'videos', isVideo: true },
            { sem: '2', sub: 'Engineering Chemistry', title: 'Unit 2: Material Science Notes', type: 'notes' },
            // Sem 3
            { sem: '3', sub: 'Analog & Digital Electronics', title: 'Logic Gates Simulation Lab', type: 'videos', isVideo: true },
            { sem: '3', sub: 'Object Oriented Programming (Java)', title: 'JAVA Mid-Term Model Paper', type: 'model_paper' },
            // Sem 4
            { sem: '4', sub: 'Database Management Systems', title: 'Normalization & SQL Mastery', type: 'notes' },
            { sem: '4', sub: 'Operating Systems', title: 'Process Scheduling Algorithm Video', type: 'videos', isVideo: true },
            // Sem 5
            { sem: '5', sub: 'Computer Networks', title: 'TCP/IP Protocol Suite Guide', type: 'notes' },
            { sem: '5', sub: 'Web Technologies', title: 'React Hooks & State Management', type: 'videos', isVideo: true },
            { sem: '5', sub: 'Formal Languages & Automata Theory', title: 'FLAT model paper', type: 'model_paper' },
            // Sem 6
            { sem: '6', sub: 'Software Engineering', title: 'Agile & DevOps Workflow Video', type: 'videos', isVideo: true },
            { sem: '6', sub: 'Artificial Intelligence', title: 'Neural Networks from Scratch', type: 'notes' },
            // Sem 7
            { sem: '7', sub: 'Cloud Computing', title: 'AWS Architect Associate Notes', type: 'notes' },
            { sem: '7', sub: 'Information Security', title: 'Cryptography and RSA Algorithm', type: 'videos', isVideo: true },
            // Sem 8
            { sem: '8', sub: 'Major Project', title: 'Documentation & Thesis Template', type: 'notes' },
            { sem: '8', sub: 'Major Project', title: 'Viva Voice Preparation Guide', type: 'model_paper' },
        ];

        const pdfUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
        const videoUrl = 'https://www.w3schools.com/html/mov_bbb.mp4';

        console.log('Seeding semester-wise materials...');
        
        for (const item of demoData) {
            const material = {
                title: item.title,
                description: `Standard academic resource for ${item.sub} (Semester ${item.sem}). High quality content for examination preparation.`,
                year: Math.ceil(parseInt(item.sem) / 2).toString(),
                branch: 'CSE',
                semester: item.sem,
                section: 'All',
                subject: item.sub,
                type: item.type === 'videos' ? 'videos' : (item.type === 'model_paper' ? 'model_paper' : 'notes'),
                isAdvanced: false,
                fileUrl: item.isVideo ? videoUrl : pdfUrl,
                url: item.isVideo ? videoUrl : pdfUrl,
                fileType: item.isVideo ? 'video/mp4' : 'application/pdf',
                facultyName: 'Dr. Nexus Demo',
                uploadedBy: 'system',
                createdAt: new Date(),
                updatedAt: new Date(),
                views: Math.floor(Math.random() * 500) + 100,
                downloads: Math.floor(Math.random() * 200) + 50
            };

            await materialsCollection.updateOne(
                { title: material.title, semester: material.semester },
                { $set: material },
                { upsert: true }
            );
            console.log(`✅ [Sem ${item.sem}] Seeded: ${material.title}`);
        }

        // Also add some Advanced Learning Hub content specifically
        const advancedTech = ['Python', 'Java', 'React', 'Node.js', 'DevOps', 'Cloud'];
        for (const tech of advancedTech) {
            await materialsCollection.updateOne(
                { title: `Mastering ${tech} - Industrial Course`, subject: tech },
                { $set: {
                    title: `Mastering ${tech} - Industrial Course`,
                    description: `Professional bootcamp content for ${tech} covering industrial use cases and architecture patterns.`,
                    subject: tech,
                    type: 'videos',
                    isAdvanced: true,
                    fileUrl: videoUrl,
                    url: videoUrl,
                    fileType: 'video/mp4',
                    facultyName: 'Tech Lead Bobby',
                    uploadedBy: 'system',
                    semester: 'All',
                    year: 'All',
                    createdAt: new Date(),
                    updatedAt: new Date()
                }},
                { upsert: true }
            );
            console.log(`🚀 [Advanced] Seeded: ${tech} Mastery`);
        }

        console.log('--- Comprehensive Seeding Complete ---');

    } catch (err) {
        console.error('Seeding failed:', err);
    } finally {
        await client.close();
    }
}

run();
