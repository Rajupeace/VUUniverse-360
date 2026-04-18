const { MongoClient } = require('mongodb');

async function run() {
    const uri = 'mongodb+srv://bobbyteja4_db_user:4ZltK5qmHHCxuFt6@cluster0.im2uv.mongodb.net/fbn_xai_system?appName=Cluster0';
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db('fbn_xai_system');
        const studentCollection = db.collection('Student');
        const facultyCollection = db.collection('Faculty');
        const studentDataCollection = db.collection('StudentData');

        console.log('Starting full data synchronization...');

        const students = await studentCollection.find({}).toArray();
        const faculties = await facultyCollection.find({}).toArray();

        for (const student of students) {
            console.log(`Syncing student: ${student.sid}...`);
            
            const studentYear = String(student.year || '3');
            const studentSection = String(student.section || 'A').toUpperCase();
            const studentBranch = String(student.branch || 'CSE').toUpperCase();

            const matchedFaculties = faculties.filter(f => 
                f.assignments && f.assignments.some(a => 
                    String(a.year) === studentYear && 
                    String(a.section).toUpperCase() === studentSection && 
                    String(a.branch).toUpperCase() === studentBranch
                )
            ).map(f => ({
                id: f.facultyId,
                name: f.name,
                email: f.email,
                designation: f.designation,
                department: f.department,
                profilePic: f.profileImage || f.profilePic || null,
                subjects: f.assignments
                    .filter(a => String(a.year) === studentYear && String(a.section).toUpperCase() === studentSection && String(a.branch).toUpperCase() === studentBranch)
                    .map(a => a.subject)
            }));

            await studentDataCollection.updateOne(
                { studentId: student._id },
                { $set: {
                    studentId: student._id,
                    rollNumber: student.sid,
                    name: student.studentName || student.name,
                    branch: studentBranch,
                    email: student.email,
                    'sections.overview': {
                        totalClasses: student.stats?.totalClasses || 100,
                        totalPresent: student.stats?.totalPresent || 85,
                        totalAbsent: (student.stats?.totalClasses || 100) - (student.stats?.totalPresent || 85),
                        overallAttendance: student.stats?.totalClasses ? Math.round((student.stats.totalPresent / student.stats.totalClasses) * 100) : 85,
                        performance: 78,
                        currentCGPA: student.stats?.cgpa || 8.5,
                        lastUpdated: new Date()
                    },
                    'progress': {
                        streak: student.stats?.streak || 5,
                        aiUsageCount: student.stats?.aiUsageCount || 12,
                        tasksCompleted: student.stats?.tasksCompleted || 8,
                        advancedProgress: 45,
                        lastUpdated: new Date()
                    },
                    'sections.faculty': {
                        totalFaculty: matchedFaculties.length,
                        facultyList: matchedFaculties,
                        lastUpdated: new Date()
                    },
                    updatedAt: new Date()
                }},
                { upsert: true }
            );
        }

        console.log('✅ Full synchronization complete.');

    } catch (err) {
        console.error('Sync failed:', err);
    } finally {
        await client.close();
    }
}

run();
