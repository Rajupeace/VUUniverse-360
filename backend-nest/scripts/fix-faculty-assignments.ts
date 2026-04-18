import { MongoClient } from 'mongodb';

async function fix() {
  const uri = "mongodb+srv://bobbyteja4_db_user:4ZltK5qmHHCxuFt6@cluster0.im2uv.mongodb.net/fbn_xai_system?appName=Cluster0";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('fbn_xai_system');
    const facultyColl = db.collection('AdminDashboardDB_Sections_Faculty');

    const faculties = await facultyColl.find({}).toArray();
    console.log("Found " + faculties.length + " faculty records.");

    const subjects = ['Artificial Intelligence', 'Data Science', 'Machine Learning', 'Cloud Computing'];
    const branches = ['CSE', 'ECE', 'IT', 'AIML'];
    const sections = ['A', 'B', 'C', 'D'];

    for (const f of faculties) {
      if (!f.assignments || f.assignments.length === 0) {
        console.log("Adding assignments to faculty: " + (f.facultyId || f.name));
        const newAssignments = [
          {
            year: "3",
            section: "A",
            branch: f.department || "CSE",
            subject: subjects[Math.floor(Math.random() * subjects.length)],
            semester: "5"
          },
          {
            year: "2",
            section: "B",
            branch: f.department || "CSE",
            subject: subjects[Math.floor(Math.random() * subjects.length)],
            semester: "3"
          }
        ];
        await facultyColl.updateOne({ _id: f._id }, { $set: { assignments: newAssignments } });
      }
    }

    console.log('Faculty assignments fix complete!');
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

fix();
