const { MongoClient } = require('mongodb');

async function run() {
    const uri = 'mongodb+srv://bobbyteja4_db_user:4ZltK5qmHHCxuFt6@cluster0.im2uv.mongodb.net/fbn_xai_system?appName=Cluster0';
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db('fbn_xai_system');
        const studentsCollection = db.collection('AdminDashboardDB_Sections_Students');
        const facultyCollection = db.collection('AdminDashboardDB_Sections_Faculty');

        // 1. Get all students
        const students = await studentsCollection.find({}).toArray();
        console.log(`Total Students: ${students.length}`);

        if (students.length === 0) {
            console.log('No students found to match against.');
            return;
        }

        // 2. Get distinct classes (Year-Section-Branch)
        const studentClasses = [...new Set(students.map(s => `${s.year}|${s.section}|${s.branch}`))];
        console.log('Student Classes found:', studentClasses);

        // 3. Get all faculty
        const faculty = await facultyCollection.find({}).toArray();
        console.log(`Total Faculty found: ${faculty.length}`);

        // 4. Update faculty assignments to match student classes
        // We'll distribute faculty across these classes so everyone sees something
        for (let i = 0; i < faculty.length; i++) {
            const f = faculty[i];
            
            // Pick a class to assign
            const classStr = studentClasses[i % studentClasses.length];
            const [year, section, branch] = classStr.split('|');

            // Find if already assigned
            const hasAssignment = (f.assignments || []).some(a => 
                String(a.year) === String(year) && 
                String(a.section) === String(section) && 
                String(a.branch) === String(branch)
            );

            if (!hasAssignment) {
                const newAssignment = {
                    year: String(year),
                    section: String(section),
                    branch: String(branch),
                    subject: f.name === 'Placement manager' ? 'Career Development' : 
                             f.name === 'Achievement manager' ? 'Soft Skills' : 
                             'Advanced Core Engineering',
                    semester: '5'
                };

                await facultyCollection.updateOne(
                    { _id: f._id },
                    { $push: { assignments: newAssignment } }
                );
                console.log(`✅ Assigned Faculty ${f.name} to class: ${classStr}`);
            } else {
                console.log(`ℹ️ Faculty ${f.name} already assigned to ${classStr}`);
            }
        }

        console.log('Data update complete.');

    } catch (err) {
        console.error('Update failed:', err);
    } finally {
        await client.close();
    }
}

run();
