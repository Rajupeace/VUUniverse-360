import { MongoClient } from 'mongodb';

async function seed() {
  const uri = "mongodb+srv://bobbyteja4_db_user:4ZltK5qmHHCxuFt6@cluster0.im2uv.mongodb.net/fbn_xai_system?appName=Cluster0";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('fbn_xai_system');
    const materials = db.collection('AdminDashboardDB_Sections_Materials');

    // Optional: Clear existing demo data to avoid duplicates if needed
    // await materials.deleteMany({ facultyName: 'Dr. Nexus Admin' });

    const demoData = [];
    const subjects = ['Artificial Intelligence', 'Data Science', 'Machine Learning', 'Cloud Computing', 'Cyber Security', 'DevOps', 'Blockchain', 'Full Stack Development', 'Mobile App Development', 'Internet of Things'];
    const types = ['notes', 'videos', 'model', 'exam'];
    const branches = ['CSE', 'ECE', 'IT', 'AIML'];
    const sections = ['A', 'B', 'C', 'D'];
    const units = ['1', '2', '3', '4', '5'];

    for (const branch of branches) {
      for (const year of ['1', '2', '3', '4']) {
        for (const section of sections) {
          for (const subject of subjects) {
            for (const type of types) {
               const title = "Demo " + type.toUpperCase() + " for " + subject + " - " + branch + " Year " + year + " Sec " + section;
               const fileUrl = type === 'videos' ? 'https://www.w3schools.com/html/mov_bbb.mp4' : 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
               
               demoData.push({
                 title,
                 description: "This is a high-quality demo " + type + " for academic excellence in " + subject + ".",
                 year,
                 branch,
                 semester: (parseInt(year) * 2 - 1).toString(), 
                 section,
                 subject,
                 type: type === 'notes' ? 'notes' : type === 'videos' ? 'videos' : type === 'model' ? 'assignments' : 'exams',
                 fileUrl,
                 url: fileUrl,
                 unit: units[Math.floor(Math.random() * units.length)],
                 topic: 'Introduction to Modern Concepts',
                 uploadedBy: { name: 'Dr. Nexus Admin', id: 'ADMIN001' },
                 facultyName: 'Dr. Nexus Admin',
                 views: Math.floor(Math.random() * 500),
                 downloads: Math.floor(Math.random() * 200),
                 likes: Math.floor(Math.random() * 100),
                 createdAt: new Date(),
                 updatedAt: new Date()
               });
            }
          }
        }
      }
    }

    console.log("Seeding " + demoData.length + " records...");
    for (let i = 0; i < demoData.length; i += 500) {
      const batch = demoData.slice(i, i + 500);
      await materials.insertMany(batch);
      console.log("Inserted batch " + (i / 500 + 1));
    }

    console.log('Seed successful!');
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

seed();
