const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb+srv://bobbyteja4_db_user:VuUniverse360SecurePass2026!@cluster0.im2uv.mongodb.net/fbn_xai_system?appName=Cluster0';

async function seedFaculty() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB.");

        const facultySchema = new mongoose.Schema({
            facultyId: String,
            facultyName: String,
            email: String,
            password: String,
            department: String,
            designation: String,
            role: { type: String, default: 'faculty' },
            profileImage: String
        }, { collection: 'faculties' });

        const Faculty = mongoose.models.Faculty || mongoose.model('Faculty', facultySchema);

        const password = 'facultypassword';
        const hashedPassword = await bcrypt.hash(password, 10);

        const existing = await Faculty.findOne({ facultyId: 'FA123' });
        if (existing) {
            await Faculty.updateOne({ facultyId: 'FA123' }, { $set: { password: hashedPassword } });
            console.log("Faculty FA123 already exists. Password updated to: facultypassword");
        } else {
            const faculty = new Faculty({
                facultyId: 'FA123',
                facultyName: 'Dr. John Doe',
                email: 'johndoe@vignan.ac.in',
                password: hashedPassword,
                department: 'Computer Science',
                designation: 'Professor',
                role: 'faculty',
                profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'
            });
            await faculty.save();
            console.log("Faculty FA123 created. Password: facultypassword");
        }
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await mongoose.disconnect();
    }
}

seedFaculty();
