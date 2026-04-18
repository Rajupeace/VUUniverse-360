/**
 * MongoDB → MySQL Migration Script
 * Run: node scripts/migrate-to-sql.js
 * Migrates all core collections from MongoDB Atlas to local/cloud MySQL
 */
const { MongoClient } = require('mongodb');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/UniVerse360_System';
const SQL_CONFIG = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'universe360_db',
    multipleStatements: true,
};

async function migrate() {
    let mongoClient;
    let sqlConn;
    let totalMigrated = 0;

    try {
        console.log('\n🔗 Connecting to MongoDB...');
        mongoClient = new MongoClient(MONGO_URI);
        await mongoClient.connect();
        const db = mongoClient.db();
        console.log('✅ Connected to MongoDB');

        console.log('🔗 Connecting to MySQL...');
        sqlConn = await mysql.createConnection(SQL_CONFIG);
        console.log('✅ Connected to MySQL\n');

        const safe = (v, fallback = null) => (v === undefined ? fallback : v);
        const safeJson = (v) => (v ? JSON.stringify(v) : null);
        const safeDate = (v) => (v ? new Date(v) : new Date());

        // ── 1. ADMINS ──────────────────────────────────────────────────────────
        console.log('👤 Migrating admins...');
        const admins = await db.collection('admins').find({}).toArray();
        for (const a of admins) {
            try {
                await sqlConn.execute(
                    `INSERT INTO admins (adminId, password, name, role, isAdmin, createdAt, updatedAt)
                     VALUES (?, ?, ?, ?, ?, ?, ?)
                     ON DUPLICATE KEY UPDATE name=VALUES(name), role=VALUES(role)`,
                    [a.adminId, a.password, safe(a.name, 'Admin'), safe(a.role, 'admin'), safe(a.isAdmin, 1), safeDate(a.createdAt), safeDate(a.updatedAt)]
                );
                totalMigrated++;
            } catch (e) { console.warn(`  ⚠️  Admin skip: ${e.message}`); }
        }
        console.log(`   ✅ Admins: ${admins.length}`);

        // ── 2. STUDENTS ────────────────────────────────────────────────────────
        console.log('🎓 Migrating students...');
        const students = await db.collection('AdminDashboardDB_Sections_Students').find({}).toArray();
        for (const s of students) {
            try {
                await sqlConn.execute(
                    `INSERT INTO students (sid, studentName, password, email, branch, year, section, batch, phone, address, profileImage, role, createdAt, updatedAt)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'student', ?, ?)
                     ON DUPLICATE KEY UPDATE studentName=VALUES(studentName), email=VALUES(email)`,
                    [s.sid, s.studentName, s.password, safe(s.email), safe(s.branch), safe(s.year), safe(s.section), safe(s.batch), safe(s.phone), safe(s.address), safe(s.profileImage), safeDate(s.createdAt), safeDate(s.updatedAt)]
                );
                totalMigrated++;
            } catch (e) { console.warn(`  ⚠️  Student skip ${s.sid}: ${e.message}`); }
        }
        console.log(`   ✅ Students: ${students.length}`);

        // ── 3. FACULTY ─────────────────────────────────────────────────────────
        console.log('👨‍🏫 Migrating faculty...');
        const faculty = await db.collection('AdminDashboardDB_Sections_Faculty').find({}).toArray();
        for (const f of faculty) {
            try {
                await sqlConn.execute(
                    `INSERT INTO faculty (facultyId, facultyName, password, email, branch, designation, experience, expertise, phone, profilePic, role, isAchievementManager, createdAt, updatedAt)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'faculty', ?, ?, ?)
                     ON DUPLICATE KEY UPDATE facultyName=VALUES(facultyName)`,
                    [f.facultyId, safe(f.name || f.facultyName, 'Faculty'), f.password, safe(f.email), safe(f.branch), safe(f.designation), safe(f.experience), safe(f.expertise), safe(f.phone), safe(f.profilePic), safe(f.isAchievementManager, 0), safeDate(f.createdAt), safeDate(f.updatedAt)]
                );
                totalMigrated++;
            } catch (e) { console.warn(`  ⚠️  Faculty skip ${f.facultyId}: ${e.message}`); }
        }
        console.log(`   ✅ Faculty: ${faculty.length}`);

        // ── 4. ATTENDANCE ──────────────────────────────────────────────────────
        console.log('📋 Migrating attendance...');
        const atts = await db.collection('attendances').find({}).toArray();
        for (const a of atts) {
            try {
                await sqlConn.execute(
                    `INSERT INTO attendance (date, studentId, studentName, subject, year, branch, section, hour, status, facultyId, facultyName, topic, remarks, createdAt, updatedAt)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [safe(a.date, ''), safe(a.studentId, ''), safe(a.studentName), safe(a.subject, ''), safe(a.year, ''), safe(a.branch, ''), safe(a.section, ''), safe(a.hour, 1), safe(a.status, 'Present'), safe(a.facultyId, ''), safe(a.facultyName), safe(a.topic), safe(a.remarks), safeDate(a.createdAt), safeDate(a.updatedAt)]
                );
                totalMigrated++;
            } catch (e) { /* skip dups */ }
        }
        console.log(`   ✅ Attendance: ${atts.length}`);

        // ── 5. MARKS ──────────────────────────────────────────────────────────
        console.log('📊 Migrating marks...');
        const marks = await db.collection('marks').find({}).toArray();
        for (const m of marks) {
            try {
                await sqlConn.execute(
                    `INSERT INTO marks (studentId, subject, assessmentType, marks, maxMarks, updatedBy, createdAt, updatedAt)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                     ON DUPLICATE KEY UPDATE marks=VALUES(marks)`,
                    [safe(m.studentId, ''), safe(m.subject, ''), safe(m.assessmentType, 'cla1'), safe(m.marks, 0), safe(m.maxMarks, 100), safe(m.updatedBy), safeDate(m.createdAt), safeDate(m.updatedAt)]
                );
                totalMigrated++;
            } catch (e) { console.warn(`  ⚠️  Mark skip: ${e.message}`); }
        }
        console.log(`   ✅ Marks: ${marks.length}`);

        // ── 6. COURSES ─────────────────────────────────────────────────────────
        console.log('📚 Migrating courses...');
        const courses = await db.collection('AdminDashboardDB_Sections_Courses').find({}).toArray();
        for (const c of courses) {
            try {
                await sqlConn.execute(
                    `INSERT INTO courses (name, courseName, code, courseCode, branch, semester, year, section, credits, type, modules, students, createdAt, updatedAt)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [safe(c.name), safe(c.courseName), safe(c.code), safe(c.courseCode), safe(c.branch), safe(c.semester), safe(c.year), safe(c.section, 'All'), safe(c.credits), safe(c.type), safeJson(c.modules), safeJson(c.students), safeDate(c.createdAt), safeDate(c.updatedAt)]
                );
                totalMigrated++;
            } catch (e) { console.warn(`  ⚠️  Course skip: ${e.message}`); }
        }
        console.log(`   ✅ Courses: ${courses.length}`);

        // ── 7. ACHIEVEMENTS ────────────────────────────────────────────────────
        console.log('🏆 Migrating achievements...');
        const achievements = await db.collection('achievements').find({}).toArray();
        for (const a of achievements) {
            try {
                const sid = typeof a.studentId === 'object' ? a.studentId?.sid || String(a.studentId) : a.studentId;
                await sqlConn.execute(
                    `INSERT INTO achievements (studentId, studentName, rollNumber, year, section, department, title, category, level, position, eventName, description, achievementDate, status, documents, rejectionReason, createdAt, updatedAt)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [safe(sid, ''), safe(a.studentName), safe(a.rollNumber), safe(a.year), safe(a.section), safe(a.department), safe(a.title, ''), safe(a.category), safe(a.level), safe(a.position), safe(a.eventName), safe(a.description), safe(a.achievementDate), safe(a.status, 'Pending'), safeJson(a.documents), safe(a.rejectionReason), safeDate(a.createdAt), safeDate(a.updatedAt)]
                );
                totalMigrated++;
            } catch (e) { console.warn(`  ⚠️  Achievement skip: ${e.message}`); }
        }
        console.log(`   ✅ Achievements: ${achievements.length}`);

        // ── 8. TODOS ───────────────────────────────────────────────────────────
        console.log('✅ Migrating todos...');
        const todos = await db.collection('todos').find({}).toArray();
        for (const t of todos) {
            try {
                await sqlConn.execute(
                    `INSERT INTO todos (userId, title, description, completed, priority, dueDate, category, createdAt, updatedAt)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [safe(t.userId, ''), safe(t.title, ''), safe(t.description), safe(t.completed, 0), safe(t.priority, 'medium'), safe(t.dueDate), safe(t.category), safeDate(t.createdAt), safeDate(t.updatedAt)]
                );
                totalMigrated++;
            } catch (e) { /* skip */ }
        }
        console.log(`   ✅ Todos: ${todos.length}`);

        // ── 9. FEES ────────────────────────────────────────────────────────────
        console.log('💰 Migrating fees...');
        const fees = await db.collection('fees').find({}).toArray();
        for (const f of fees) {
            try {
                await sqlConn.execute(
                    `INSERT INTO fees (studentId, studentName, year, branch, semester, feeType, amount, paid, balance, status, dueDate, paidDate, transactionId, paymentMode, createdAt, updatedAt)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                     ON DUPLICATE KEY UPDATE paid=VALUES(paid), balance=VALUES(balance)`,
                    [safe(f.studentId, ''), safe(f.studentName), safe(f.year), safe(f.branch), safe(f.semester), safe(f.feeType, 'tuition'), safe(f.amount, 0), safe(f.paid, 0), safe(f.balance, 0), safe(f.status, 'pending'), safe(f.dueDate), safe(f.paidDate), safe(f.transactionId), safe(f.paymentMode), safeDate(f.createdAt), safeDate(f.updatedAt)]
                );
                totalMigrated++;
            } catch (e) { /* skip */ }
        }
        console.log(`   ✅ Fees: ${fees.length}`);

        // ── 10. EXAM RESULTS ──────────────────────────────────────────────────
        console.log('📝 Migrating exam results...');
        const exams = await db.collection('StudentDashboardDB_Sections_Exams').find({}).toArray();
        for (const er of exams) {
            try {
                await sqlConn.execute(
                    `INSERT INTO exam_results (examTitle, examType, date, year, semester, branch, subject, studentId, studentName, marksObtained, maxMarks, grade, summary, createdAt, updatedAt)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [safe(er.examTitle), safe(er.examType), safeDate(er.date), safe(er.year), safe(er.semester), safe(er.branch), safe(er.subject), safe(er.studentId), safe(er.studentName), safe(er.marksObtained, 0), safe(er.maxMarks, 100), safe(er.grade), safe(er.summary), safeDate(er.createdAt), safeDate(er.updatedAt)]
                );
                totalMigrated++;
            } catch (e) { /* skip */ }
        }
        console.log(`   ✅ Exam Results: ${exams.length}`);

        // ── 11. HOSTELS ────────────────────────────────────────────────────────
        console.log('🏠 Migrating hostels...');
        const hostels = await db.collection('AdminDashboardDB_Sections_Hostel').find({}).toArray();
        for (const h of hostels) {
            try {
                await sqlConn.execute(
                    `INSERT INTO hostels (studentId, studentName, hostelName, roomNumber, roomType, status, admissionDate, feePaid, createdAt, updatedAt)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [safe(h.rollNumber || h.studentId), safe(h.studentName), safe(h.hostelName), safe(h.roomNumber), safe(h.roomType), safe(h.status), safeDate(h.admissionDate), h.feePaid ? 1 : 0, safeDate(h.createdAt), safeDate(h.updatedAt)]
                );
                totalMigrated++;
            } catch (e) { /* skip */ }
        }
        console.log(`   ✅ Hostels: ${hostels.length}`);

        // ── 12. LIBRARY ────────────────────────────────────────────────────────
        console.log('📖 Migrating library...');
        const lib = await db.collection('AdminDashboardDB_Sections_Library').find({}).toArray();
        for (const l of lib) {
            try {
                await sqlConn.execute(
                    `INSERT INTO library (studentId, studentName, bookTitle, bookCode, issueDate, dueDate, returnDate, status, fine, createdAt, updatedAt)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [safe(l.rollNumber || l.studentId), safe(l.studentName), safe(l.bookTitle), safe(l.bookId), safe(l.issueDate), safe(l.dueDate), safe(l.returnDate), safe(l.status), safe(l.fine, 0), safeDate(l.createdAt), safeDate(l.updatedAt)]
                );
                totalMigrated++;
            } catch (e) { /* skip */ }
        }
        console.log(`   ✅ Library: ${lib.length}`);

        // ── 13. TRANSPORT ──────────────────────────────────────────────────────
        console.log('🚌 Migrating transport...');
        const trans = await db.collection('AdminDashboardDB_Sections_Transport').find({}).toArray();
        for (const t of trans) {
            try {
                await sqlConn.execute(
                    `INSERT INTO transport (studentId, studentName, busNumber, routeName, pickupPoint, pickupTime, status, fee, createdAt, updatedAt)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [safe(t.rollNumber || t.studentId), safe(t.studentName), safe(t.busNumber), safe(t.route), safe(t.pickupPoint), safe(t.pickupTime), safe(t.status), 0, safeDate(t.createdAt), safeDate(t.updatedAt)]
                );
                totalMigrated++;
            } catch (e) { /* skip */ }
        }
        console.log(`   ✅ Transport: ${trans.length}`);

        // ── SUMMARY ────────────────────────────────────────────────────────────
        console.log(`\n🎉 Migration Complete! Total records migrated: ${totalMigrated}`);

    } catch (err) {
        console.error('\n❌ Migration failed:', err.message);
        process.exit(1);
    } finally {
        if (mongoClient) await mongoClient.close();
        if (sqlConn) await sqlConn.end();
    }
}

migrate();
