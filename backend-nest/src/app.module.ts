import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database.module';
import { SeedService } from './seed.service';

// Auth (Global)
import { AuthModule } from './auth/auth.module';
// SSE (Global)
import { SseModule } from './sse/sse.module';

// Feature Modules
import { StudentsModule } from './students/students.module';
import { FacultyModule } from './faculty/faculty.module';
import { CoursesModule } from './courses/courses.module';
import { AttendanceModule } from './attendance/attendance.module';
import { MarksModule } from './marks/marks.module';
import { AdminModule } from './admin/admin.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ReportsModule } from './reports/reports.module';
import { ScheduleModule } from './schedule/schedule.module';
import { ChatModule } from './chat/chat.module';
import { ExamsModule } from './exams/exams.module';
import { EventsModule } from './events/events.module';
import { AchievementsModule } from './achievements/achievements.module';
import { PlacementsModule } from './placements/placements.module';
import { FeeModule } from './fees/fee.module';
import { HostelModule } from './hostel/hostel.module';
import { LibraryModule } from './library/library.module';
import { TransportModule } from './transport/transport.module';
import { WhiteboardModule } from './whiteboard/whiteboard.module';
import { SkillBoostModule } from './skill-boost/skillboost.module';
import { TodosModule } from './todos/todos.module';
import { MaterialsModule } from './materials/materials.module';
import { SystemModule } from './system/system.module';
import { AgentModule } from './agent/agent.module';
import { AdminDataModule } from './admin-data/admindata.module';
import { FacultyDataModule } from './faculty-data/facultydata.module';
import { StudentDataModule } from './student-data/studentdata.module';
import { AdminMessagesModule } from './admin-messages/adminmessages.module';
import { StudentNotesModule } from './student-notes/studentnotes.module';
import { RoadmapModule } from './roadmap/roadmap.module';
import { StudentGradesModule } from './student-grades/studentgrades.module';
import { StudentProgressModule } from './student-progress/studentprogress.module';
import { AcademicPulseModule } from './academic-pulse/academicpulse.module';
import { FastModule } from './fast/fast.module';
import { AdmissionsModule } from './admissions/admissions.module';
import { FacultyStatsModule } from './faculty-stats/facultystats.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env', '../../.env'],
    }),

    // MongoDB (Primary Database) - Uses Memory Server if USE_MEMORY_DB=true
    DatabaseModule.forRootAsync(),

    // SQLite fallback for TypeORM repository wiring
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: './database.sqlite',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      autoLoadEntities: true,
      logging: false,
    }),

    // Rate Limiting (Permissive for high traffic internal usage)
    ThrottlerModule.forRoot([{
      ttl: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
      limit: parseInt(process.env.RATE_LIMIT_MAX || '50000'),
    }]),

    // Global Modules
    AuthModule,
    SseModule,

    // Feature Modules
    StudentsModule,
    FacultyModule,
    CoursesModule,
    AttendanceModule,
    MarksModule,
    AdminModule,
    AnalyticsModule,
    ReportsModule,
    ScheduleModule,
    ChatModule,
    ExamsModule,
    EventsModule,
    AchievementsModule,
    PlacementsModule,
    FeeModule,
    HostelModule,
    LibraryModule,
    TransportModule,
    WhiteboardModule,
    SkillBoostModule,
    TodosModule,
    MaterialsModule,
    SystemModule,
    AgentModule,
    AdminDataModule,
    FacultyDataModule,
    StudentDataModule,
    AdminMessagesModule,
    StudentNotesModule,
    RoadmapModule,
    StudentGradesModule,
    StudentProgressModule,
    AcademicPulseModule,
    FastModule,
    AdmissionsModule,
    FacultyStatsModule,
  ],
  providers: [SeedService],
})
export class AppModule { }
