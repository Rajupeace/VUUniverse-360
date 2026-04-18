const { MongoClient } = require('mongodb');

async function run() {
    const uri = 'mongodb+srv://bobbyteja4_db_user:4ZltK5qmHHCxuFt6@cluster0.im2uv.mongodb.net/fbn_xai_system?appName=Cluster0';
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db('fbn_xai_system');
        const materialCollection = db.collection('AdminDashboardDB_Sections_Materials');

        console.log('Cleaning and re-seeding VERIFIED academic materials...');
        await materialCollection.deleteMany({}); 

        const branches = ['CSE', 'ECE', 'MEE', 'CIVIL', 'IT', 'AI', 'DS'];
        const years = ['1', '2', '3', '4'];
        
        // Using local paths for better download/access control within the system
        const localNoteUrl = '/uploads/materials/demo_note.pdf';
        const localPaperUrl = '/uploads/materials/model_paper.pdf';
        const localVideoUrl = '/uploads/materials/demo_video.mp4';
        
        // Keep demo external links as fallback or for variety
        const externalPdf = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
        const externalVideo = 'https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4';

        const yearToSems = {
            '1': ['1', '2'],
            '2': ['3', '4'],
            '3': ['5', '6'],
            '4': ['7', '8']
        };

        const subjectMap = {
            '1': ['Mathematics-I', 'Engineering Physics', 'C Programming', 'English', 'Engineering Drawing'],
            '2': ['Mathematics-II', 'Engineering Chemistry', 'Data Structures', 'Python Programming', 'Environment Science'],
            '3': ['Discrete Mathematics', 'Java Programming', 'Digital Logic Design', 'DBMS', 'COA'],
            '4': ['Operating Systems', 'Software Engineering', 'Automata Theory', 'Web Technologies', 'HCI'],
            '5': ['Computer Networks', 'Design & Analysis of Algorithms', 'Cloud Computing', 'Compiler Design', 'AI Basics'],
            '6': ['Machine Learning', 'Network Security', 'Big Data', 'Distributed Systems', 'Mobile App Dev'],
            '7': ['Internet of Things', 'Embedded Systems', 'Professional Ethics', 'Deep Learning', 'Software Testing'],
            '8': ['Project Phase-II', 'Technical Seminar', 'Industrial Training', 'Comprehensive Viva']
        };

        const materialsToInsert = [];

        for (const branch of branches) {
            for (const year of years) {
                const semesters = yearToSems[year];
                for (const sem of semesters) {
                    const subjects = subjectMap[sem] || [];
                    for (const subject of subjects) {
                        for (let mod = 1; mod <= 5; mod++) {
                            // 1. NOTES
                            materialsToInsert.push({
                                title: `${subject} - Module ${mod} Analysis`,
                                description: `In-depth research notes for ${subject}.`,
                                url: mod % 2 === 0 ? localNoteUrl : externalPdf, // Mix of local and external
                                type: 'notes',
                                branch, year, semester: sem, subject,
                                section: 'All', module: `Module ${mod}`, unit: `Unit ${mod}`, topic: 'Concept Breakdown',
                                uploadedBy: 'FAC001', facultyName: 'Dr. Nexus',
                                uploadedAt: new Date(),
                                createdAt: new Date()
                            });

                            // 2. VIDEOS
                            materialsToInsert.push({
                                title: `${subject} - Visual Guide (Mod ${mod})`,
                                description: `High-definition video lecture for ${subject}.`,
                                url: mod % 2 === 0 ? localVideoUrl : externalVideo,
                                type: 'videos',
                                branch, year, semester: sem, subject,
                                section: 'All', module: `Module ${mod}`, unit: `Unit ${mod}`, topic: 'Case Study',
                                videoAnalysis: `Detailed analysis of ${subject} logic.`,
                                uploadedBy: 'FAC001', facultyName: 'Dr. Nexus',
                                uploadedAt: new Date(),
                                createdAt: new Date()
                            });
                        }

                        // 3. MODEL PAPERS
                        materialsToInsert.push({
                            title: `${subject} - Semester Exam Model Paper`,
                            description: `Official practice questions for ${subject} final exam.`,
                            url: localPaperUrl,
                            type: 'modelPapers',
                            branch, year, semester: sem, subject,
                            section: 'All', 
                            uploadedBy: 'FAC002', facultyName: 'Prof. Sarah',
                            uploadedAt: new Date(),
                            createdAt: new Date()
                        });
                    }
                }
            }
        }

        const result = await materialCollection.insertMany(materialsToInsert.slice(0, 5000)); // Limit to avoid memory issues in one go 
        console.log(`✅ ${result.insertedCount} resources injected successfully!`);

    } catch (err) {
        console.error('Comprehensive seeding failed:', err);
    } finally {
        await client.close();
    }
}

run();
