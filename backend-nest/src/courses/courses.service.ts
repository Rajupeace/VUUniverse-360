import { Injectable, NotFoundException, ServiceUnavailableException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Course, CourseDocument } from '../schemas/course.schema';
import { Course as CourseEntity } from '../entities/course.entity';
import { SseService } from '../sse/sse.service';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectRepository(CourseEntity) private courseRepo: Repository<CourseEntity>,
    @InjectConnection() private readonly connection: Connection,
    private sseService: SseService,
  ) { }

  private checkDb() {
    if (this.connection.readyState !== 1) {
      console.warn('MongoDB not connected, but MySQL might be available');
    }
  }

  async createCourse(data: any): Promise<any> {
    const { code, name, branch, year, semester, courseCode, section } = data;
    const finalCode = code || courseCode;

    if (!finalCode || !name) {
      throw new BadRequestException('Missing required fields: code, name');
    }

    try {
      const newCourseData = {
        courseCode: finalCode,
        code: finalCode,
        name,
        courseName: name,
        branch: branch || 'Common',
        year: String(year),
        semester: String(semester),
        section: section || 'All',
        credits: data.credits || 4,
        type: data.type || 'Lecture',
        modules: data.modules || [],
        students: data.students || [],
        createdAt: new Date(),
        ...data,
      };

      // ── Write to MySQL ──
      try {
        const sqlCourse = this.courseRepo.create({
          code: finalCode,
          courseCode: finalCode,
          name: name,
          courseName: name,
          branch: branch || 'Common',
          year: String(year),
          semester: String(semester),
          section: section || 'All',
          credits: data.credits || 4,
          type: data.type || 'Lecture',
          modules: data.modules || [],
          students: data.students || [],
        });
        await this.courseRepo.save(sqlCourse);
      } catch (e) {
        console.warn(`MySQL Course Create Error: ${e.message}`);
      }

      // ── Write to MongoDB ──
      let mongoResult = null;
      try {
        const mongoCourse = new this.courseModel({ ...newCourseData, id: uuidv4() });
        mongoResult = await mongoCourse.save();
      } catch (e) {
        console.warn(`MongoDB Course Create Error: ${e.message}`);
      }

      const result = {
        ...newCourseData,
        source: 'dual',
      };

      this.sseService.broadcast({ resource: 'courses', action: 'create', data: { course: result } });
      return result;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getCourses(): Promise<any[]> {
    try {
      // Get from MySQL
      const sqlCourses = await this.courseRepo.find();

      // Get from MongoDB
      let mongoCourses: any[] = [];
      if (this.connection.readyState === 1) {
        mongoCourses = await this.courseModel.find({}).lean();
      }

      const combinedMap = new Map();
      sqlCourses.forEach(c => combinedMap.set(c.code, { ...c, id: c.id, source: 'mysql' }));
      mongoCourses.forEach(c => {
        if (!combinedMap.has(c.code)) {
          combinedMap.set(c.code, { ...c, id: c._id.toString(), source: 'mongodb' });
        }
      });

      return Array.from(combinedMap.values());
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async deleteCourse(id: string): Promise<any> {
    try {
      let deletedFromMongo = false;
      let deletedFromSql = false;

      // SQL delete
      const sqlResult = await this.courseRepo.delete({ code: id });
      if (sqlResult.affected > 0) deletedFromSql = true;

      if (!deletedFromSql && !isNaN(Number(id))) {
        await this.courseRepo.delete(Number(id));
      }

      // Mongo delete
      if (this.connection.readyState === 1) {
        const isValidObjectIdFormat = /^[0-9a-f]{24}$/i.test(id);
        if (isValidObjectIdFormat) {
          const m1 = await this.courseModel.findByIdAndDelete(id);
          if (m1) deletedFromMongo = true;
        }
        if (!deletedFromMongo) {
          const m2 = await this.courseModel.findOneAndDelete({ $or: [{ code: id }, { courseCode: id }] });
          if (m2) deletedFromMongo = true;
        }
      }

      if (deletedFromSql || deletedFromMongo) {
        this.sseService.broadcast({ resource: 'courses', action: 'delete', data: { id } });
        return { message: 'Course deleted' };
      } else {
        throw new NotFoundException('Course not found');
      }
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async updateCourse(id: string, updates: any): Promise<any> {
    try {
      // ── Update MySQL ──
      try {
        await this.courseRepo.update({ code: id }, updates);
        if (!isNaN(Number(id))) {
          await this.courseRepo.update(Number(id), updates);
        }
      } catch (e) { console.warn(`MySQL Course Update Error: ${e.message}`); }

      // ── Update MongoDB ──
      let mongoUpdated = null;
      if (this.connection.readyState === 1) {
        const isValidObjectIdFormat = /^[0-9a-f]{24}$/i.test(id);
        if (isValidObjectIdFormat) {
          mongoUpdated = await this.courseModel.findByIdAndUpdate(id, updates, { new: true });
        }
        if (!mongoUpdated) {
          mongoUpdated = await this.courseModel.findOneAndUpdate({ $or: [{ code: id }, { courseCode: id }] }, updates, { new: true });
        }
      }

      const result = mongoUpdated || updates;
      this.sseService.broadcast({ resource: 'courses', action: 'update', data: result });
      return result;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
