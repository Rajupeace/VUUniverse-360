import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Attendance, AttendanceDocument } from '../schemas/attendance.schema';
import { Faculty, FacultyDocument } from '../schemas/faculty.schema';
import { Student, StudentDocument } from '../schemas/student.schema';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance as AttendanceEntity } from '../entities/attendance.entity';
import { Faculty as FacultyEntity } from '../entities/faculty.entity';
import { Student as StudentEntity } from '../entities/student.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Attendance.name) private attendanceModel: Model<AttendanceDocument>,
    @InjectModel(Faculty.name) private facultyModel: Model<FacultyDocument>,
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
    @InjectRepository(AttendanceEntity) private attendanceRepo: Repository<AttendanceEntity>,
    @InjectRepository(FacultyEntity) private facultyRepo: Repository<FacultyEntity>,
    @InjectRepository(StudentEntity) private studentRepo: Repository<StudentEntity>,
    @InjectConnection() private readonly connection: Connection,
  ) { }

  private lastDashboardResult: any = null;
  private lastDashboardFetch: number = 0;
  private CACHE_TTL = 500; 

  private STATIC_FALLBACK = {
    overview: { totalRecords: 1250, overallAttendancePercent: 82, summary: { present: 950, absent: 150, late: 100, leave: 50 } },
    facultyActivity: { data: [{ facultyId: 'DEMO1', facultyName: 'Dr. John Doe (Demo)', recordsMarked: 450 }, { facultyId: 'DEMO2', facultyName: 'Prof. Jane Smith (Demo)', recordsMarked: 380 }, { facultyId: 'DEMO3', facultyName: 'Dr. Sarah Wilson (Demo)', recordsMarked: 310 }] },
    deptSummary: { data: [{ branch: 'CSE', attendancePercent: 88, totalRecords: 450 }, { branch: 'ECE', attendancePercent: 75, totalRecords: 380 }, { branch: 'ME', attendancePercent: 82, totalRecords: 220 }, { branch: 'EEE', attendancePercent: 79, totalRecords: 200 }] },
    dailyTrends: { data: [{ date: '2024-03-10', count: 120 }, { date: '2024-03-11', count: 145 }, { date: '2024-03-12', count: 130 }, { date: '2024-03-13', count: 160 }, { date: '2024-03-14', count: 140 }] },
    hourlyTrends: { data: [{ hour: 9, count: 450 }, { hour: 10, count: 480 }, { hour: 11, count: 420 }, { hour: 12, count: 390 }, { hour: 14, count: 350 }, { hour: 15, count: 310 }] },
    classAttendance: { data: [{ class: 'B.Tech III CSE-A', percent: 92 }, { class: 'B.Tech III CSE-B', percent: 88 }, { class: 'B.Tech II ECE-A', percent: 76 }, { class: 'B.Tech IV ME-C', percent: 81 }] },
    lowAttendance: { data: [{ sid: 'STU089', name: 'Ravi Kumar', percent: 62 }, { sid: 'STU112', name: 'Sita Ram', percent: 58 }, { sid: 'STU045', name: 'Amit Singh', percent: 64 }] },
    studentPerformance: { data: [{ category: 'Excellent (>90%)', count: 145 }, { category: 'Good (75-90%)', count: 380 }, { category: 'Average (60-75%)', count: 120 }, { category: 'Risky (<60%)', count: 45 }] },
    source: 'lifeboat',
    dbStatus: 'emergency_fallback'
  };


  private dbStatus = 'initializing';

  private checkDb() {
    this.dbStatus = this.connection.readyState === 1 ? 'connected' : 'disconnected';
    if (this.connection.readyState !== 1) throw new ServiceUnavailableException('Database not connected');
  }

  async getOverview(): Promise<any> {
    // 1. Try MySQL
    try {
      const sqlTotal = await this.attendanceRepo.count();
      if (sqlTotal > 0) {
        const sqlBreakdown = await this.attendanceRepo
          .createQueryBuilder('a')
          .select('a.status', 'status')
          .addSelect('COUNT(*)', 'count')
          .groupBy('a.status')
          .getRawMany();

        const statusMap: any = {};
        let presentCount = 0, absentCount = 0, lateCount = 0, leaveCount = 0;

        sqlBreakdown.forEach(item => {
          const count = Number(item.count);
          const pct = sqlTotal > 0 ? Math.round((count / sqlTotal) * 100) : 0;
          statusMap[item.status] = { count, percentage: pct };
          if (item.status === 'Present') presentCount = count;
          else if (item.status === 'Absent') absentCount = count;
          else if (item.status === 'Late') lateCount = count;
          else if (item.status === 'Leave') leaveCount = count;
        });

        return {
          totalRecords: sqlTotal,
          overallAttendancePercent: Math.round(((presentCount + lateCount) / sqlTotal) * 100),
          statusBreakdown: statusMap,
          summary: { present: presentCount, absent: absentCount, late: lateCount, leave: leaveCount },
          source: 'mysql'
        };
      }
    } catch (e) { console.warn(`MySQL Analytics Error: ${e.message}`); }

    // 2. Fallback to MongoDB
    if (this.connection.readyState !== 1) return { totalRecords: 0, overallAttendancePercent: 0, statusBreakdown: {}, summary: {} };

    const totalRecords = await this.attendanceModel.countDocuments();
    const statusBreakdown = await this.attendanceModel.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const statusMap: any = {};
    let presentCount = 0, absentCount = 0, lateCount = 0, leaveCount = 0;

    statusBreakdown.forEach(item => {
      const pct = totalRecords > 0 ? Math.round((item.count / totalRecords) * 100) : 0;
      statusMap[item._id] = { count: item.count, percentage: pct };
      if (item._id === 'Present') presentCount = item.count;
      else if (item._id === 'Absent') absentCount = item.count;
      else if (item._id === 'Late') lateCount = item.count;
      else if (item._id === 'Leave') leaveCount = item.count;
    });

    return {
      totalRecords,
      overallAttendancePercent: totalRecords > 0 ? Math.round(((presentCount + lateCount) / totalRecords) * 100) : 0,
      statusBreakdown: statusMap,
      summary: { present: presentCount, absent: absentCount, late: lateCount, leave: leaveCount },
      source: 'mongodb'
    };
  }

  async getFacultyActivity(): Promise<any> {
    // MySQL First
    try {
      const sqlActivity = await this.attendanceRepo
        .createQueryBuilder('a')
        .select(['a.facultyId', 'a.facultyName'])
        .addSelect('COUNT(*)', 'recordsMarked')
        .addSelect('COUNT(DISTINCT a.date)', 'datesMarked')
        .addSelect('COUNT(DISTINCT a.subject)', 'subjectsMarked')
        .addSelect('MAX(a.createdAt)', 'lastMarked')
        .groupBy('a.facultyId, a.facultyName')
        .orderBy('recordsMarked', 'DESC')
        .limit(10)
        .getRawMany();

      if (sqlActivity.length > 0) {
        const enriched = await Promise.all(sqlActivity.map(async item => {
          const faculty = await this.facultyRepo.findOneBy({ facultyId: item.a_facultyId });
          return {
            facultyId: item.a_facultyId,
            facultyName: item.a_facultyName,
            recordsMarked: Number(item.recordsMarked),
            datesMarked: Number(item.datesMarked),
            subjectsMarked: Number(item.subjectsMarked),
            lastMarked: item.lastMarked,
            image: faculty?.profilePic || (faculty as any)?.profileImage,
            source: 'mysql'
          };
        }));
        return { count: enriched.length, data: enriched };
      }
    } catch (e) { console.warn(`MySQL FacultyActivity Error: ${e.message}`); }

    // Fallback to MongoDB
    if (this.connection.readyState !== 1) return { count: 0, data: [] };
    const facultyActivity = await this.attendanceModel.aggregate([
      { $group: { _id: { facultyId: '$facultyId', facultyName: '$facultyName' }, recordsMarked: { $sum: 1 }, uniqueDates: { $addToSet: '$date' }, uniqueSubjects: { $addToSet: '$subject' }, lastMarked: { $max: '$markedAt' } } },
      { $lookup: { from: 'AdminDashboardDB_Sections_Faculty', localField: '_id.facultyId', foreignField: 'facultyId', as: 'facultyInfo' } },
      { $project: { facultyId: '$_id.facultyId', facultyName: '$_id.facultyName', recordsMarked: 1, datesMarked: { $size: '$uniqueDates' }, subjectsMarked: { $size: '$uniqueSubjects' }, lastMarked: 1, image: { $arrayElemAt: ['$facultyInfo.image', 0] }, profileImage: { $arrayElemAt: ['$facultyInfo.profileImage', 0] }, profilePic: { $arrayElemAt: ['$facultyInfo.profilePic', 0] }, _id: 0 } },
      { $sort: { recordsMarked: -1 } },
      { $limit: 10 }
    ]);
    return { count: facultyActivity.length, data: facultyActivity, source: 'mongodb' };
  }

  async getDashboard(): Promise<any> {
    const now = Date.now();
    if (this.lastDashboardResult && (now - this.lastDashboardFetch) < this.CACHE_TTL) {
      return this.lastDashboardResult;
    }

    let results: any = { 
      overview: { totalRecords: 0, overallAttendancePercent: 0, summary: { present: 0, absent: 0, late: 0, leave: 0 } }, 
      facultyActivity: { data: [] }, 
      deptSummary: { data: [] }, 
      dailyTrends: { data: [] },
      source: 'none',
      dbStatus: 'connecting'
    };

    // 1. Primary: MySQL Strategy
    try {
      const [sqlTotal, sqlFacultyRaw, sqlDeptRaw, sqlTrendsRaw] = await Promise.all([
        this.attendanceRepo.count(),
        this.attendanceRepo.createQueryBuilder('a').select(['a.facultyId', 'a.facultyName']).addSelect('COUNT(*)', 'count').groupBy('a.facultyId, a.facultyName').orderBy('count', 'DESC').limit(10).getRawMany(),
        this.attendanceRepo.createQueryBuilder('a').select('a.branch', 'branch').addSelect('COUNT(*)', 'total').addSelect("SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END)", 'present').groupBy('a.branch').getRawMany(),
        this.attendanceRepo.createQueryBuilder('a').select('a.date', 'date').addSelect('COUNT(*)', 'count').groupBy('a.date').orderBy('a.date', 'DESC').limit(7).getRawMany(),
      ]);

      if (sqlTotal > 0) {
        const sqlSummary = await this.attendanceRepo.createQueryBuilder('a').select('a.status', 'status').addSelect('COUNT(*)', 'count').groupBy('a.status').getRawMany();
        const summary = { present: 0, absent: 0, late: 0, leave: 0 };
        sqlSummary.forEach(item => {
          const c = Number(item.count);
          if (item.status === 'Present') summary.present = c;
          else if (item.status === 'Absent') summary.absent = c;
          else if (item.status === 'Late') summary.late = c;
          else if (item.status === 'Leave') summary.leave = c;
        });

        // Deep dive for MySQL
        const [sqlHourly, sqlClass, sqlRisk] = await Promise.all([
          this.attendanceRepo.createQueryBuilder('a').select('a.hour', 'hour').addSelect('COUNT(*)', 'count').groupBy('a.hour').getRawMany(),
          this.attendanceRepo.createQueryBuilder('a').select(['a.year', 'a.section', 'a.branch']).addSelect('COUNT(*)', 'total').addSelect("SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END)", 'present').groupBy('a.year, a.section, a.branch').getRawMany(),
          this.attendanceRepo.createQueryBuilder('a').select(['a.studentId', 'a.studentName']).addSelect('COUNT(*)', 'total').addSelect("SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END)", 'present').groupBy('a.studentId, a.studentName').getRawMany()
        ]);

        results = {
          overview: { 
            totalRecords: sqlTotal, 
            overallAttendancePercent: Math.round(((summary.present + (summary.late * 0.5)) / sqlTotal) * 100), 
            summary 
          },
          facultyActivity: { data: sqlFacultyRaw.map(f => ({ facultyId: f.a_facultyId, facultyName: f.a_facultyName, recordsMarked: Number(f.count) })) },
          deptSummary: { data: sqlDeptRaw.map(d => ({ branch: d.branch, attendancePercent: Math.round((Number(d.present) / Number(d.total)) * 100) })) },
          dailyTrends: { data: sqlTrendsRaw.map(t => ({ date: t.date, count: Number(t.count) })) },
          hourlyTrends: { data: sqlHourly.map(h => ({ hour: Number(h.hour || 1), count: Number(h.count) })) },
          classAttendance: { data: sqlClass.map(c => ({ class: `${c.a_branch} ${c.a_year}-${c.a_section}`, percent: Math.round((Number(c.present) / Number(c.total)) * 100) })) },
          lowAttendance: { 
            data: sqlRisk
              .map(r => ({ sid: r.a_studentId, name: r.a_studentName, percent: Math.round((Number(r.present) / Number(r.total)) * 100) }))
              .filter(r => r.percent < 75)
              .slice(0, 10)
          },
          studentPerformance: { 
            data: [
              { category: 'Excellent (>90%)', count: sqlRisk.filter(r => (Number(r.present) / Number(r.total)) > 0.9).length },
              { category: 'Good (75-90%)', count: sqlRisk.filter(r => (Number(r.present) / Number(r.total)) <= 0.9 && (Number(r.present) / Number(r.total)) >= 0.75).length },
              { category: 'Average (60-75%)', count: sqlRisk.filter(r => (Number(r.present) / Number(r.total)) < 0.75 && (Number(r.present) / Number(r.total)) >= 0.6).length },
              { category: 'Risky (<60%)', count: sqlRisk.filter(r => (Number(r.present) / Number(r.total)) < 0.6).length }
            ]
          },
          source: 'mysql',
          dbStatus: 'connected'
        };
      }
    } catch (e) { 
      console.warn('⚠️ [ANALYTICS] MySQL Deep Dive failed, falling back:', e.message); 
    }


    // 2. Try MongoDB if MySQL was empty/failed
    if (results.overview.totalRecords === 0 && this.connection.readyState === 1) {
      try {
        const [overviewRaw, facultyActivityRaw, deptSummaryRaw, dailyTrendsRaw] = await Promise.all([
          this.attendanceModel.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
          this.attendanceModel.aggregate([{ $group: { _id: { facultyId: '$facultyId', facultyName: '$facultyName' }, recordsMarked: { $sum: 1 } } }, { $sort: { recordsMarked: -1 } }, { $limit: 10 }]),
          this.attendanceModel.aggregate([{ $group: { _id: '$branch', totalRecords: { $sum: 1 }, presentCount: { $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] } } } }, { $project: { branch: '$_id', attendancePercent: { $round: [{ $cond: [{ $gt: ['$totalRecords', 0] }, { $multiply: [{ $divide: ['$presentCount', '$totalRecords'] }, 100] }, 0] }, 2] } } }]),
          this.attendanceModel.aggregate([{ $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: { $toDate: "$date" } } }, count: { $sum: 1 } } }, { $sort: { _id: -1 } }, { $limit: 7 }])
        ]);

        const totalRecords = overviewRaw.reduce((sum, item) => sum + item.count, 0);
        if (totalRecords > 0) {
          const summary = { present: 0, absent: 0, late: 0, leave: 0 };
          overviewRaw.forEach(item => {
            if (item._id === 'Present') summary.present = item.count;
            else if (item._id === 'Absent') summary.absent = item.count;
            else if (item._id === 'Late') summary.late = item.count;
            else if (item._id === 'Leave') summary.leave = item.count;
          });

          results = {
            overview: { totalRecords, overallAttendancePercent: Math.round(((summary.present + summary.late) / totalRecords) * 100), summary },
            facultyActivity: { data: facultyActivityRaw.map(f => ({ facultyId: f._id.facultyId, facultyName: f._id.facultyName, recordsMarked: f.recordsMarked })) },
            deptSummary: { data: deptSummaryRaw },
            dailyTrends: { data: dailyTrendsRaw.map(t => ({ date: t._id || 'N/A', count: t.count })) },
            hourlyTrends: { data: (await this.attendanceModel.aggregate([{ $group: { _id: { $hour: "$markedAt" }, count: { $sum: 1 } } }, { $project: { hour: "$_id", count: 1, _id: 0 } }, { $sort: { hour: 1 } }])).map(h => ({ hour: h.hour || 9, count: h.count })) },
            classAttendance: { data: (await this.attendanceModel.aggregate([{ $group: { _id: "$section", total: { $sum: 1 }, present: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } } } }, { $project: { class: "$_id", percent: { $round: [{ $multiply: [{ $divide: ["$present", "$total"] }, 100] }, 0] } } }])) },
            lowAttendance: { data: (await this.attendanceModel.aggregate([{ $group: { _id: { sid: "$studentId", name: "$studentName" }, total: { $sum: 1 }, present: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } } } }, { $project: { sid: "$_id.sid", name: "$_id.name", percent: { $multiply: [{ $divide: ["$present", "$total"] }, 100] } } }, { $match: { percent: { $lt: 75 } } }, { $limit: 10 }])) },
            studentPerformance: { data: [{ category: 'Excellent (>90%)', count: 0 }, { category: 'Good (75-90%)', count: 0 }, { category: 'Average (60-75%)', count: 0 }, { category: 'Risky (<60%)', count: 0 }] }, // Dynamic placeholder
            source: 'mongodb',
            dbStatus: 'connected'
          };

        }
      } catch (e) { console.warn('MongoDB Dashboard Error fallback to Demo'); }
    }

    // 3. Final Fallback (Lifeboat)
    if (results.overview.totalRecords === 0) {
      results = { ...this.STATIC_FALLBACK, serverTime: new Date().toISOString() };
    }

    this.lastDashboardResult = { ...results, serverTime: new Date().toISOString() };
    this.lastDashboardFetch = now;
    return this.lastDashboardResult;
  }
}
