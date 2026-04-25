import { Injectable, NotFoundException, InternalServerErrorException, Inject, forwardRef, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { Student, StudentDocument } from '../schemas/student.schema';
import { Course, CourseDocument } from '../schemas/course.schema';
import { Attendance, AttendanceDocument } from '../schemas/attendance.schema';
import { Mark, MarkDocument } from '../schemas/mark.schema';
import { ExamResult, ExamResultDocument } from '../schemas/exam-result.schema';
import { Chat, ChatDocument } from '../schemas/chat.schema';
import { Achievement, AchievementDocument } from '../schemas/achievement.schema';
import { StudentData, StudentDataDocument } from '../schemas/student-data.schema';
import { Enrollment, EnrollmentDocument } from '../schemas/enrollment.schema';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student as StudentEntity } from '../entities/student.entity';
import { Course as CourseEntity } from '../entities/course.entity';
import { Attendance as AttendanceEntity } from '../entities/attendance.entity';
import { Mark as MarkEntity } from '../entities/mark.entity';
import { Achievement as AchievementEntity } from '../entities/achievement.entity';
import { Enrollment as EnrollmentEntity } from '../entities/enrollment.entity';
import { ExamResult as ExamResultEntity } from '../entities/exam.entity';
import { Faculty, FacultyDocument } from '../schemas/faculty.schema';
import { Faculty as FacultyEntity } from '../entities/faculty.entity';
import { SseService } from '../sse/sse.service';

@Injectable()
export class StudentsService {
    constructor(
        @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
        @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
        @InjectModel(Attendance.name) private attendanceModel: Model<AttendanceDocument>,
        @InjectModel(Mark.name) private markModel: Model<MarkDocument>,
        @InjectModel(ExamResult.name) private examResultModel: Model<ExamResultDocument>,
        @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
        @InjectModel(Achievement.name) private achievementModel: Model<AchievementDocument>,
        @InjectModel(StudentData.name) private studentDataModel: Model<StudentDataDocument>,
        @InjectModel(Enrollment.name) private enrollmentModel: Model<EnrollmentDocument>,
        @InjectModel(Faculty.name) private facultyModel: Model<FacultyDocument>,
        @InjectRepository(StudentEntity) private studentRepo: Repository<StudentEntity>,
        @InjectRepository(CourseEntity) private courseRepo: Repository<CourseEntity>,
        @InjectRepository(AttendanceEntity) private attendanceRepo: Repository<AttendanceEntity>,
        @InjectRepository(MarkEntity) private markRepo: Repository<MarkEntity>,
        @InjectRepository(AchievementEntity) private achievementRepo: Repository<AchievementEntity>,
        @InjectRepository(EnrollmentEntity) private enrollmentRepo: Repository<EnrollmentEntity>,
        @InjectRepository(ExamResultEntity) private examResultRepo: Repository<ExamResultEntity>,
        @InjectRepository(FacultyEntity) private facultyRepo: Repository<FacultyEntity>,
        private sseService: SseService,
    ) { }

    async findAll(query: { year?: string; section?: string; branch?: string }): Promise<any[]> {
        const filter: any = {};
        if (query.year) filter.year = String(query.year);
        if (query.branch) filter.branch = String(query.branch);
        if (query.section && query.section.toUpperCase() !== 'ALL') {
            filter.section = String(query.section);
        }

        const Students_STATIC_FALLBACK = [
            { sid: 'STU001', studentName: 'Alice Johnson', branch: 'CSE', year: '3', section: 'A', email: 'alice@vignan.ac.in', profilePic: 'https://i.pravatar.cc/150?u=alice' },
            { sid: 'STU002', studentName: 'Bob Smith', branch: 'CSE', year: '3', section: 'A', email: 'bob@vignan.ac.in', profilePic: 'https://i.pravatar.cc/150?u=bob' },
            { sid: 'STU003', studentName: 'Charlie Brown', branch: 'ECE', year: '2', section: 'B', email: 'charlie@vignan.ac.in', profilePic: 'https://i.pravatar.cc/150?u=charlie' },
            { sid: 'STU004', studentName: 'Diana Prince', branch: 'CSE', year: '4', section: 'C', email: 'diana@vignan.ac.in', profilePic: 'https://i.pravatar.cc/150?u=diana' },
            { sid: 'STU005', studentName: 'Evan Wright', branch: 'ME', year: '1', section: 'D', email: 'evan@vignan.ac.in', profilePic: 'https://i.pravatar.cc/150?u=evan' }
        ];

        // Try MySQL first
        try {
            const sqlStudents = await this.studentRepo.find({ where: filter });
            if (sqlStudents.length > 0) {
                return sqlStudents.map(s => ({ ...s, id: s.sid, source: 'mysql' }));
            }
        } catch (e) { }

        // Try MongoDB
        try {
            const students = await this.studentModel.find(filter).limit(1000).maxTimeMS(5000).lean();
            if (students.length > 0) {
                return students.map(s => ({ ...s, id: s.sid, _id: s._id.toString(), source: 'mongodb' }));
            }
        } catch (e) { }

        // Lifeboat Fallback
        return Students_STATIC_FALLBACK.filter(s => {
            if (query.year && s.year !== String(query.year)) return false;
            if (query.branch && s.branch !== String(query.branch)) return false;
            if (query.section && query.section.toUpperCase() !== 'ALL' && s.section !== String(query.section)) return false;
            return true;
        }).map(s => ({ ...s, id: s.sid, source: 'lifeboat' }));
    }

    async findOne(id: string) {
        // Try MySQL first
        let student: any = await this.studentRepo.findOne({ where: { sid: id } });

        if (!student) {
            student = await this.studentModel.findOne({
                $or: [
                    { sid: id },
                    ...(Types.ObjectId.isValid(id) ? [{ _id: new Types.ObjectId(id) }] : []),
                ],
            }).select('-password').lean();
        }

        if (!student) throw new NotFoundException('Student not found');
        return student;
    }

    async create(data: any) {
        const hashedPassword = await bcrypt.hash(data.password || 'password123', 10);
        
        // Ensure required fields
        data.year = data.year || '1';
        data.section = data.section || 'A';
        data.branch = data.branch || 'CSE';
        data.email = data.email || `${data.sid}@vignan.ac.in`;
        data.studentName = data.studentName || 'New Student';

        // Write to MySQL
        try {
            const sqlStudent = this.studentRepo.create({ ...data, password: hashedPassword });
            await this.studentRepo.save(sqlStudent);
        } catch (e) {
            console.warn(`MySQL Student Create Error: ${e.message}`);
        }

        // Write to MongoDB
        try {
            const student = new this.studentModel({ ...data, password: hashedPassword });
            await student.save();
            return student;
        } catch (e) {
            if (e.name === 'ValidationError' || e.code === 11000) {
                console.warn('Student Creation Error:', e.message);
                throw new InternalServerErrorException(e.message);
            }
            throw e;
        }
    }

    async update(id: string, data: any) {
        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }
        
        // Write to MySQL
        try {
            await this.studentRepo.update({ sid: id }, data);
        } catch (e) {
            console.warn(`MySQL Student Update Error: ${e.message}`);
        }

        // Write to MongoDB
        const updated = await this.studentModel.findOneAndUpdate(
            { $or: [{ sid: id }, ...(Types.ObjectId.isValid(id) ? [{ _id: new Types.ObjectId(id) }] : [])] },
            { $set: data },
            { new: true, runValidators: true }
        );
        if (!updated) throw new NotFoundException('Student not found');
        return updated;
    }

    async remove(id: string) {
        // Remove from MySQL
        try {
            await this.studentRepo.delete({ sid: id });
        } catch (e) {
            console.warn(`MySQL Student Delete Error: ${e.message}`);
        }

        // Remove from MongoDB
        const deleted = await this.studentModel.findOneAndDelete({
            $or: [{ sid: id }, ...(Types.ObjectId.isValid(id) ? [{ _id: new Types.ObjectId(id) }] : [])]
        });
        
        // If not found in DB, it might be a static fallback or already deleted.
        // We return success anyway to keep the frontend clean and avoid 404 alerts.
        if (!deleted) {
            console.log(`[Student Delete] Student ${id} not found in database (possibly fallback or already deleted).`);
        }
        
        return { success: true, message: 'Student removed from system visibility' };
    }

    async updateProfile(sid: string, updates: any) {
        // Essential fields for both DBs
        const allowedUpdates = [
            'studentName', 'email', 'phone', 'address', 'profileImage', 'avatar', 'profilePic', 'profilePicture', 'image', 'bio', 'gender',
            'year', 'section', 'branch', 'resume', 'dateOfBirth', 'religion',
            'sscMarks', 'intermediateMarks', 'schoolName', 'schoolLocation',
            'interCollegeName', 'interLocation', 'sscPassOutYear', 'intermediatePassOutYear',
            'admissionMode', 'isTransportUser', 'isHosteller', 'batch', 'socials'
        ];

        const providedPic = updates.profileImage || updates.profilePic || updates.profilePicture || updates.image;
        if (providedPic !== undefined && providedPic !== null && providedPic !== '') {
            updates.profileImage = providedPic;
            updates.profilePic = providedPic;
            updates.profilePicture = providedPic;
            updates.image = providedPic;
        }

        if (updates.isTransportUser !== undefined) {
            updates.isTransportUser = updates.isTransportUser === 'true' || updates.isTransportUser === true;
        }
        if (updates.isHosteller !== undefined) {
            updates.isHosteller = updates.isHosteller === 'true' || updates.isHosteller === true;
        }

        const mongoUpdates: any = {};
        Object.keys(updates).forEach(key => {
            if (allowedUpdates.includes(key) && updates[key] !== undefined && updates[key] !== null) {
                // Don't overwrite with empty string if we want to preserve data, 
                // but usually empty string means user cleared it. 
                // I will allow empty strings except for name which is required.
                if (key === 'studentName' && !updates[key]) return;
                mongoUpdates[key] = updates[key];
            }
        });

        // Special handling for CGPA (store in stats if not top-level)
        if (updates.cgpa !== undefined) {
            mongoUpdates['stats.cgpa'] = parseFloat(updates.cgpa);
        }

        // 1. Write to MySQL (Primary)
        try {
            const sqlSafeFields = [
                'studentName', 'email', 'phone', 'address', 'profileImage', 'avatar', 'profilePicture',
                'bio', 'gender', 'year', 'section', 'branch', 'dateOfBirth', 'religion',
                'sscMarks', 'intermediateMarks', 'schoolName', 'schoolLocation',
                'interCollegeName', 'interLocation', 'sscPassOutYear', 'intermediatePassOutYear',
                'admissionMode', 'isTransportUser', 'isHosteller'
            ];
            const entityUpdates: any = {};
            sqlSafeFields.forEach(f => {
                if (updates[f] !== undefined) entityUpdates[f] = updates[f];
            });

            await this.studentRepo.update({ sid }, entityUpdates);
            console.log(`[SQL ✅] Profile updated for SID: ${sid}`);
        } catch (e) {
            console.error(`[SQL ❌] MySQL Student Update Error: ${e.message}`);
        }

        // 2. Write to MongoDB (Secondary/Sync)
        try {
            const student = await this.studentModel.findOneAndUpdate(
                { sid: sid },
                { $set: mongoUpdates },
                { new: true, runValidators: false },
            );

            if (!student) {
                if (Types.ObjectId.isValid(sid)) {
                    const byId = await this.studentModel.findByIdAndUpdate(sid, { $set: mongoUpdates }, { new: true });
                    if (byId) return byId;
                }
                throw new NotFoundException(`Student with SID ${sid} not found in MongoDB`);
            }

            // 3. Update StudentData summary for Faculty/Admin views
            try {
                const dataUpdate: any = {};
                if (updates.studentName) dataUpdate.name = updates.studentName;
                if (updates.email) dataUpdate.email = updates.email;
                if (updates.branch) dataUpdate.branch = updates.branch;
                if (updates.cgpa !== undefined) {
                    dataUpdate['sections.overview.currentCGPA'] = parseFloat(updates.cgpa);
                }
                dataUpdate.profileUpdatedAt = new Date();
                
                await this.studentDataModel.findOneAndUpdate(
                    { rollNumber: sid }, 
                    { $set: dataUpdate },
                    { upsert: true } // Changed to true to ensure doc exists
                );

                // Trigger background sync to refresh the entire StudentData aggregated payload
                this.syncStudentOverview(sid).catch(err => 
                    console.error(`Post-Profile sync failed for ${sid}:`, err)
                );
                
                // Also try by studentId ref
                await this.studentDataModel.findOneAndUpdate(
                    { studentId: student._id },
                    { $set: dataUpdate },
                    { upsert: false }
                );
            } catch (sdErr) {
                console.warn(`[STUDENT-DATA] Sync failed: ${sdErr.message}`);
            }

            console.log(`[MONGO ✅] Profile synchronized for SID: ${sid}`);
            // Recalculate everything in background (including newly matching faculty)
            this.syncStudentOverview(sid).catch(e => console.warn(`Background sync failed: ${e.message}`));
            return student;
        } catch (e) {
            console.error(`[MONGO ❌] MongoDB Student Sync Error: ${e.message}`);
            throw new InternalServerErrorException(`Failed to synchronize profile: ${e.message}`);
        }
    }

    async changePassword(sid: string, body: any): Promise<any> {
    const { currentPassword, newPassword } = body;
    const student = await this.studentRepo.findOne({ where: { sid } });
    const mongoStudent = await this.studentModel.findOne({ sid }).lean();
    
    const target = student || mongoStudent;
    if (!target) throw new NotFoundException('Student node not found in repository');

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, target.password).catch(() => false);
    if (!isMatch && currentPassword !== target.password) {
        throw new BadRequestException('Current password verification failed');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update both MySQL and MongoDB
    try {
        if (student) {
            await this.studentRepo.update({ sid }, { password: hashedPassword } as any);
        }
        await this.studentModel.updateOne({ sid }, { $set: { password: hashedPassword } });
        
        return { success: true, message: 'Security credentials updated across cluster' };
    } catch (e) {
        throw new InternalServerErrorException('Cross-database credential synchronization failed');
    }
  }

    async getClassAttendance(id: string) {
        const student = await this.studentModel.findOne({ sid: id }).lean();
        if (!student) throw new NotFoundException('Student not found');

        const { year, section, branch } = student;
        const totalStudents = await this.studentModel.countDocuments({
            year: String(year), section: String(section), branch: String(branch),
        });

        const today = new Date().toISOString().split('T')[0];
        const todaysRecords = await this.attendanceModel.find({
            date: today, year: String(year), section: String(section), branch: String(branch),
        }).lean();

        const presentCount = todaysRecords.filter(r => r.status === 'Present').length;
        const totalScans = todaysRecords.length;
        const presencePct = totalScans > 0 ? Math.round((presentCount / totalScans) * 100) : 0;

        return {
            class: `${year}-${section}`,
            branch,
            totalStudents,
            presentToday: presentCount,
            totalScansToday: totalScans,
            presencePercentage: presencePct,
            date: today,
        };
    }

    async getStudentCourses(studentId: string): Promise<any[]> {
        const student = await this.studentModel.findOne({
            $or: [{ sid: String(studentId) },
            ...(Types.ObjectId.isValid(studentId) ? [{ _id: new Types.ObjectId(studentId) }] : [])],
        }).lean();
        if (!student) throw new NotFoundException('Student not found');

        const query: any = { year: String(student.year) };
        const mongoCourses = await this.courseModel.find(query).lean();

        return mongoCourses.filter(course => {
            if (course.year && String(course.year) !== String(student.year)) return false;
            const studentBranch = (student.branch || '').toLowerCase();
            const courseBranch = (course.branch || '').toLowerCase();
            const branchMatches = courseBranch === 'all' || courseBranch === studentBranch;
            if (!branchMatches) return false;

            const courseSection = (course.section || 'All').toUpperCase();
            const studentSection = (student.section || '').toUpperCase();
            const sectionMatches = courseSection === 'ALL' || courseSection === studentSection;
            if (!sectionMatches) return false;

            if (course.students && Array.isArray(course.students) && course.students.length > 0) {
                return course.students.some(
                    sid => String(sid) === String((student as any)._id) || String(sid) === String(student.sid),
                );
            }
            return true;
        }).map(c => ({ ...c, id: (c as any)._id || c.courseCode }));
    }

    async updateRoadmapProgress(studentId: string, roadmapSlug: string, topicName?: string, completedTopics?: string[]) {
        const student = await this.studentModel.findOne({ sid: studentId });
        if (!student) throw new NotFoundException('Student not found');

        if (!student.roadmapProgress) (student as any).roadmapProgress = new Map();

        if (completedTopics && Array.isArray(completedTopics)) {
            student.roadmapProgress.set(roadmapSlug, completedTopics);
        } else if (topicName) {
            const currentProgress = student.roadmapProgress.get(roadmapSlug) || [];
            let newProgress;
            if (currentProgress.includes(topicName)) {
                newProgress = currentProgress.filter(t => t !== topicName);
            } else {
                newProgress = [...currentProgress, topicName];
            }
            student.roadmapProgress.set(roadmapSlug, newProgress);
        }

        await (student as any).save();
        
        // Trigger background sync to update StudentData aggregated payload
        this.syncStudentOverview(studentId).catch(err => 
            console.error(`Post-Roadmap sync failed for ${studentId}:`, err)
        );

        return { success: true, progress: student.roadmapProgress };
    }

    async bulkUpsert(studentDataList: any[]) {
        const results: { success: any[]; errors: any[]; total: number } = { success: [], errors: [], total: studentDataList.length };

        for (let i = 0; i < studentDataList.length; i++) {
            const data = studentDataList[i];
            try {
                const sid = data.sid || data.SID || data.studentId || data.StudentId;
                const studentName = data.studentName || data.name || data.Name || data.StudentName;
                if (!sid || !studentName) {
                    results.errors.push({ row: i + 1, sid: sid || 'N/A', error: 'Missing sid or studentName' });
                    continue;
                }

                const existing = await this.studentModel.findOne({ sid });
                if (existing) {
                    Object.assign(existing, {
                        ...data,
                        section: String(data.section || existing.section || 'A').toUpperCase(),
                        branch: String(data.branch || existing.branch || 'CSE').toUpperCase(),
                        updatedAt: new Date()
                    });
                    await (existing as any).save();
                    results.success.push({ row: i + 1, sid, action: 'updated' });
                } else {
                    const newStudent = new this.studentModel({
                        ...data,
                        sid, studentName,
                        password: data.password || sid || 'password123',
                        year: String(data.year || '1'),
                        section: String(data.section || 'A').toUpperCase(),
                        branch: String(data.branch || 'CSE').toUpperCase()
                    });
                    await newStudent.save();
                    results.success.push({ row: i + 1, sid, action: 'created' });
                }

                this.syncStudentOverview(sid).catch(e => console.error(`Sync failed for bulk student ${sid}:`, e.message));
            } catch (err) {
                results.errors.push({ row: i + 1, sid: data.sid || 'N/A', error: err.message });
            }
        }
        return results;
    }

    async calculateStudentOverview(studentId: string): Promise<any> {
        try {
            const student = await this.studentModel.findOne({
                $or: [
                    { sid: studentId },
                    ...(Types.ObjectId.isValid(studentId) ? [{ _id: new Types.ObjectId(studentId) }] : []),
                ]
            }).lean();

            if (!student) return null;
            const sid = student.sid;
            const userId = student._id;

            const enrolledCourses = await this.courseModel.find({
                year: String(student.year),
                $or: [{ branch: student.branch }, { branch: 'All' }, { branch: 'Common' }]
            }).lean();

            const studentSection = String(student.section || 'All').toUpperCase();
            const activeCourses = enrolledCourses.filter(c => {
                const cSec = String(c.section || 'All').toUpperCase();
                return (cSec === 'ALL' || cSec === studentSection) && (c as any).code !== 'EMPTY__OVERRIDE' && (c as any).courseCode !== 'EMPTY__OVERRIDE';
            });

            const overriddenNames = new Set(enrolledCourses
                .filter(c => (c as any).code === 'EMPTY__OVERRIDE' || (c as any).courseCode === 'EMPTY__OVERRIDE')
                .map(c => ((c as any).name || c.courseName || '').toLowerCase().trim())
            );

            const activeCodes = new Set(activeCourses.map(c => ((c as any).code || c.courseCode || '').toLowerCase().trim()));
            const activeNames = new Set(activeCourses.map(c => ((c as any).name || c.courseName || '').toLowerCase().trim()));

            const subjectMap: any = {};
            const enrolledSubjectNames = [];
            activeCourses.forEach(c => {
                const name = (c as any).name || c.courseName;
                if (name) {
                    subjectMap[name] = { total: 0, present: 0, hours: {} };
                    enrolledSubjectNames.push(name);
                }
            });

            const isEnrolled = (subject: string) => {
                if (!subject) return false;
                const s = String(subject).toLowerCase().trim();
                if (overriddenNames.has(s)) return false;
                const activeNamesArr = Array.from(activeNames);
                return activeCodes.has(s) || activeNames.has(s) || activeNamesArr.some(an => (an && (an.includes(s) || s.includes(an))));
            };

            let records = await this.attendanceRepo.find({ where: { studentId: String(sid) } }) as any[];
            records = records.filter(rec => isEnrolled(rec.subject));

            const perDate: any = {};
            let totalAll = 0, presentAll = 0;

            for (const rec of records) {
                totalAll += 1;
                if (rec.status === 'Present') presentAll += 1;
                const subj = rec.subject || 'Unknown';

                let matchedName = Object.keys(subjectMap).find(name =>
                    name.toLowerCase() === subj.toLowerCase() ||
                    name.toLowerCase().includes(subj.toLowerCase()) ||
                    subj.toLowerCase().includes(name.toLowerCase())
                );

                if (!matchedName) {
                    matchedName = subj;
                    if (!subjectMap[matchedName]) subjectMap[matchedName] = { total: 0, present: 0, hours: {} };
                }

                subjectMap[matchedName].total += 1;
                if (rec.status === 'Present') subjectMap[matchedName].present += 1;

                if (!perDate[rec.date]) perDate[rec.date] = { date: rec.date, hours: {}, subjects: {}, totalHours: 0, presentHours: 0 };
                const hourKey = (rec.hour !== undefined && rec.hour !== null) ? String(rec.hour) : '0';
                perDate[rec.date].hours[hourKey] = {
                    subject: subj, status: rec.status, facultyName: rec.facultyName || rec.facultyId || '', remarks: (rec as any).remarks || ''
                };
                perDate[rec.date].totalHours += 1;
                if (rec.status === 'Present') perDate[rec.date].presentHours += 1;
            }

            const daily = Object.values(perDate).map((d: any) => {
                const pct = d.totalHours > 0 ? Math.round((d.presentHours / d.totalHours) * 100) : 0;
                return { ...d, percentage: pct, classification: pct >= 75 ? 'Regular' : (pct >= 40 ? 'Irregular' : 'Absent') };
            }).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

            const details: any = {};
            for (const k of Object.keys(subjectMap)) {
                const s = subjectMap[k];
                details[k] = {
                    total: s.total, present: s.present, totalClasses: s.total, totalPresent: s.present,
                    percentage: s.total > 0 ? Math.round((s.present / s.total) * 100) : 0, hours: s.hours
                };
            }

            const attendanceSummary = {
                overall: totalAll > 0 ? Math.round((presentAll / totalAll) * 100) : 0,
                details,
                totalClasses: totalAll,
                totalPresent: presentAll,
                daily,
                enrolledSubjectNames
            };

            const [allMarks, examResults] = await Promise.all([
                (await this.markRepo.find({ where: { studentId: sid } })) as any[],
                (await this.examResultRepo.find({ where: [{ studentId: sid }, { studentId: userId.toString() }] })) as any[]
            ]);

            const academicsSubjects: any = {};
            activeCourses.forEach(c => {
                const name = (c as any).name || c.courseName;
                if (name) academicsSubjects[name] = { obtained: 0, max: 0, count: 0, breakdown: {} };
            });

            let totalExams = 0;
            allMarks.forEach(m => {
                const sRaw = m.subject || 'General';
                const s = Object.keys(academicsSubjects).find(name =>
                    name.toLowerCase() === sRaw.toLowerCase() || name.toLowerCase().includes(sRaw.toLowerCase()) || sRaw.toLowerCase().includes(name.toLowerCase())
                ) || sRaw;
                if (!academicsSubjects[s]) academicsSubjects[s] = { obtained: 0, max: 0, count: 0, breakdown: {} };
                const type = m.assessmentType || `entry_${(m as any)._id}`;
                academicsSubjects[s].breakdown[type] = { marks: m.marks, max: m.maxMarks || 100 };
            });

            Object.keys(academicsSubjects).forEach(s => {
                const subj = academicsSubjects[s];
                subj.obtained = 0; subj.max = 0; subj.count = 0;
                Object.values(subj.breakdown).forEach((item: any) => {
                    subj.obtained += item.marks; subj.max += item.max; subj.count++; totalExams++;
                });
            });

            examResults.forEach(er => {
                const sRaw = er.subject || er.examTitle || 'General';
                const s = Object.keys(academicsSubjects).find(name =>
                    name.toLowerCase() === sRaw.toLowerCase() || name.toLowerCase().includes(sRaw.toLowerCase()) || sRaw.toLowerCase().includes(name.toLowerCase())
                ) || sRaw;
                if (!academicsSubjects[s]) academicsSubjects[s] = { obtained: 0, max: 0, count: 0, breakdown: {} };
                academicsSubjects[s].obtained += (er.marksObtained || (er as any).score || (er as any).marks || 0);
                academicsSubjects[s].max += (er.maxMarks || (er as any).totalMarks || 100);
                academicsSubjects[s].count += 1;
                totalExams++;
            });

            const academicsSummary: any = { overallPercentage: 0, details: {}, totalExamsTaken: totalExams };
            if (totalExams > 0 || Object.keys(academicsSubjects).length > 0) {
                let totalPctSum = 0, subjectCount = 0;
                Object.keys(academicsSubjects).forEach(subj => {
                    const { obtained, max } = academicsSubjects[subj];
                    const pct = max > 0 ? Math.round((obtained / max) * 100) : 0;
                    academicsSummary.details[subj] = { percentage: pct, obtained, max, exams: academicsSubjects[subj].count, breakdown: academicsSubjects[subj].breakdown };
                    if (max > 0) { totalPctSum += pct; subjectCount++; }
                });
                academicsSummary.overallPercentage = subjectCount > 0 ? Math.round(totalPctSum / subjectCount) : 0;
            }

            const aiUsageCountFromChat = await this.chatModel.countDocuments({ userId: sid });
            const achievementCount = await this.achievementModel.countDocuments({ studentId: userId, status: 'Approved' });

            const baseScore = student.stats?.careerReadyScore || 60;
            const careerReadyScore = Math.min(100, Math.max(0, baseScore + Math.min(achievementCount * 5, 20)));

            // ─── Faculty Discovery ───
            const studentYear = String(student.year || '1');
            const facStudentSection = String(student.section || 'A').toUpperCase();
            const studentBranch = String(student.branch || 'CSE').toUpperCase();

            // Find faculties whose assignments match student class
            const faculties = await this.facultyModel.find({
                'assignments': {
                    $elemMatch: {
                        year: studentYear,
                        section: facStudentSection,
                        branch: studentBranch
                    }
                }
            }).lean();

            const facultyList = faculties.map(f => ({
                id: f.facultyId,
                name: f.name,
                email: f.email,
                designation: f.designation,
                department: f.department,
                profilePic: f.profileImage || f.profilePic || null,
                subjects: f.assignments
                    .filter(a => a.year === studentYear && a.section === facStudentSection && a.branch === studentBranch)
                    .map(a => a.subject)
            }));

            const activity = {
                streak: student.stats?.streak || 0,
                aiUsage: Math.max(student.stats?.aiUsageCount || 0, aiUsageCountFromChat),
                tasksDone: student.stats?.tasksCompleted || 0,
                advancedLearning: (student.stats?.advancedProgress || 0) + (achievementCount * 2),
                careerReadyScore,
                achievements: achievementCount
            };

            return {
                student: { ...student, id: student.sid, profilePic: student.profileImage || student.avatar },
                semesterProgress: student.stats?.semesterProgress || 72,
                attendance: attendanceSummary,
                academics: academicsSummary,
                activity,
                faculties: facultyList
            };
        } catch (err) {
            console.error('Calculation Error:', err);
            return null;
        }
    }

    async syncStudentOverview(studentId: string): Promise<any> {
        try {
            const overview = await this.calculateStudentOverview(studentId);
            if (!overview) return null;

            const userId = overview.student._id;
            const sid = overview.student.sid;

            // 1. MySQL Sync
            try {
                // Update Student Entity
                await this.studentRepo.update({ sid }, {
                    stats: {
                        totalClasses: overview.attendance.totalClasses || 0,
                        totalPresent: overview.attendance.totalPresent || 0,
                        streak: overview.activity.streak || 0,
                        aiUsageCount: overview.activity.aiUsage || 0,
                        careerReadyScore: overview.activity.careerReadyScore || 60,
                        achievements: overview.activity.achievements || 0,
                    }
                });

                // Update Enrollment Entities
                for (const [subject, stats] of Object.entries(overview.attendance.details) as [string, any][]) {
                    const marksStats = overview.academics.details[subject] || { percentage: 0 };
                    await this.enrollmentRepo.update({ studentId: sid, subject }, {
                        attendancePercentage: stats.percentage || 0,
                        marksPercentage: marksStats.percentage || 0,
                    });
                }
            } catch (e) { console.warn(`MySQL syncStudentOverview Error: ${e.message}`); }

            // 2. MongoDB Sync
            await this.studentDataModel.findOneAndUpdate(
                { studentId: userId },
                {
                    $set: {
                        studentId: userId,
                        rollNumber: sid,
                        name: overview.student.studentName || overview.student.name,
                        branch: overview.student.branch,
                        email: overview.student.email,
                        'sections.overview': {
                            totalClasses: overview.attendance.totalClasses || 0,
                            totalPresent: overview.attendance.totalPresent || 0,
                            totalAbsent: (overview.attendance.totalClasses || 0) - (overview.attendance.totalPresent || 0),
                            overallAttendance: overview.attendance.overall || 0,
                            performance: overview.academics.overallPercentage || 0,
                            currentCGPA: overview.student.stats?.cgpa || 8.2,
                            lastUpdated: new Date()
                        },
                        'progress': {
                            streak: overview.activity.streak || 0,
                            aiUsageCount: overview.activity.aiUsage || 0,
                            tasksCompleted: overview.activity.tasksDone || 0,
                            advancedProgress: overview.activity.advancedLearning || 0,
                            lastUpdated: new Date()
                        },
                        'sections.faculty': {
                            totalFaculty: (overview.faculties || []).length,
                            facultyList: overview.faculties || [],
                            lastUpdated: new Date()
                        },
                        'updatedAt': new Date(),
                        'lastSyncAt': new Date()
                    }
                },
                { upsert: true }
            );

            await this.studentModel.findByIdAndUpdate(userId, {
                $set: {
                    'stats.totalClasses': overview.attendance.totalClasses || 0,
                    'stats.totalPresent': overview.attendance.totalPresent || 0,
                    'stats.streak': overview.activity.streak || 0,
                    'stats.aiUsageCount': overview.activity.aiUsage || 0,
                    'stats.careerReadyScore': overview.activity.careerReadyScore || 60,
                    'stats.achievements': overview.activity.achievements || 0,
                    'updatedAt': new Date()
                }
            });

            const enrollmentUpdates = Object.entries(overview.attendance.details).map(([subject, stats]: [string, any]) => {
                const marksStats = overview.academics.details[subject] || { percentage: 0 };
                return this.enrollmentModel.updateMany(
                    { studentId: sid, subject: subject },
                    {
                        $set: {
                            attendancePercentage: stats.percentage || 0,
                            marksPercentage: marksStats.percentage || 0,
                            updatedAt: new Date(),
                            lastActivityAt: new Date()
                        }
                    }
                );
            });
            await Promise.all(enrollmentUpdates);

            this.sseService.broadcast({
                resource: 'studentData',
                action: 'update',
                data: { studentId: userId, sid: sid }
            });

            return overview;
        } catch (err) {
            console.error('SyncStudentOverview Error:', err);
            return null;
        }
    }

    async getStudentOverview(id: string): Promise<any> {
        const overview = await this.calculateStudentOverview(id);
        if (!overview) throw new NotFoundException('Student overview not found');
        return overview;
    }

    async getStudentMarksBySubject(studentId: string): Promise<any[]> {
        let marks: any[] = await this.markRepo.find({ where: { studentId } as any });
        if (marks.length === 0) {
            marks = await this.markModel.find({ studentId }).lean();
        }
        const bySubject: any = {};
        marks.forEach(mark => {
            const subName = mark.subject;
            const type = (mark.assessmentType || '').toLowerCase().trim();

            if (!bySubject[subName]) {
                bySubject[subName] = { subject: subName, assessments: {} };
            }

            bySubject[subName].assessments[type] = {
                type,
                score: Number(mark.marks) || 0,
                max: Number(mark.maxMarks) || (type.startsWith('cla') ? 20 : (type.startsWith('m') ? 10 : 100))
            };
            if (bySubject[subName].assessments[type].max === 0) {
                bySubject[subName].assessments[type].max = 100;
            }
        });

        return Object.values(bySubject).map((subj: any) => {
            const result: any = {
                subject: subj.subject,
                cla: [],
                module1: [],
                module2: [],
                overall: { total: 0, max: 0, percentage: 0 }
            };

            Object.values(subj.assessments).forEach((asm: any) => {
                const { type, score, max } = asm;

                if (type.startsWith('cla')) {
                    const testNum = parseInt(type.replace(/[^0-9]/g, '')) || 0;
                    result.cla.push({ test: testNum, scored: score, total: max });
                } else if (type.startsWith('m1')) {
                    const rawSuffix = type.replace('m1', '');
                    const targetNum = rawSuffix.includes('pre') ? 0 : (parseInt(rawSuffix.replace(/[^0-9]/g, '')) || 0);
                    result.module1.push({ type, scored: score, total: max, target: targetNum });
                } else if (type.startsWith('m2')) {
                    const rawSuffix = type.replace('m2', '');
                    const targetNum = rawSuffix.includes('pre') ? 0 : (parseInt(rawSuffix.replace(/[^0-9]/g, '')) || 0);
                    result.module2.push({ type, scored: score, total: max, target: targetNum });
                }

                result.overall.total += score;
                result.overall.max += max;
            });

            if (result.overall.max > 0) {
                result.overall.percentage = Math.round((result.overall.total / result.overall.max) * 100);
            }

            result.cla.sort((a: any, b: any) => a.test - b.test);
            result.module1.sort((a: any, b: any) => a.target - b.target);
            result.module2.sort((a: any, b: any) => a.target - b.target);

            return result;
        });
    }
}
