param([string]$BasePath = "e:\fnbXaiproject-main\backend-nest\src")

# Module definitions: [ModuleName, ControllerRoute, ServiceName, OriginalRoute]
$modules = @(
  @{ name = "Courses"; route = "courses"; ctrl = "CoursesController"; svc = "CoursesService" }
  @{ name = "Attendance"; route = "attendance"; ctrl = "AttendanceController"; svc = "AttendanceService" }
  @{ name = "Marks"; route = "marks"; ctrl = "MarksController"; svc = "MarksService" }
  @{ name = "Admin"; route = "admin"; ctrl = "AdminController"; svc = "AdminService" }
  @{ name = "Analytics"; route = "analytics"; ctrl = "AnalyticsController"; svc = "AnalyticsService" }
  @{ name = "Reports"; route = "reports"; ctrl = "ReportsController"; svc = "ReportsService" }
  @{ name = "Schedule"; route = "schedule"; ctrl = "ScheduleController"; svc = "ScheduleService" }
  @{ name = "Chat"; route = "chat"; ctrl = "ChatController"; svc = "ChatService" }
  @{ name = "Exams"; route = "exams"; ctrl = "ExamsController"; svc = "ExamsService" }
  @{ name = "Events"; route = "events"; ctrl = "EventsController"; svc = "EventsService" }
  @{ name = "Achievements"; route = "achievements"; ctrl = "AchievementsController"; svc = "AchievementsService" }
  @{ name = "Placements"; route = "placements"; ctrl = "PlacementsController"; svc = "PlacementsService" }
  @{ name = "Fee"; route = "fees"; ctrl = "FeeController"; svc = "FeeService" }
  @{ name = "Hostel"; route = "hostel"; ctrl = "HostelController"; svc = "HostelService" }
  @{ name = "Library"; route = "library"; ctrl = "LibraryController"; svc = "LibraryService" }
  @{ name = "Transport"; route = "transport"; ctrl = "TransportController"; svc = "TransportService" }
  @{ name = "Whiteboard"; route = "whiteboard"; ctrl = "WhiteboardController"; svc = "WhiteboardService" }
  @{ name = "SkillBoost"; route = "skill-boost"; ctrl = "SkillBoostController"; svc = "SkillBoostService" }
  @{ name = "Materials"; route = "materials"; ctrl = "MaterialsController"; svc = "MaterialsService" }
  @{ name = "Agent"; route = "agent"; ctrl = "AgentController"; svc = "AgentService" }
  @{ name = "AdminData"; route = "admin-data"; ctrl = "AdminDataController"; svc = "AdminDataService" }
  @{ name = "FacultyData"; route = "faculty-data"; ctrl = "FacultyDataController"; svc = "FacultyDataService" }
  @{ name = "StudentData"; route = "student-data"; ctrl = "StudentDataController"; svc = "StudentDataService" }
  @{ name = "AdminMessages"; route = "admin-messages"; ctrl = "AdminMessagesController"; svc = "AdminMessagesService" }
  @{ name = "StudentNotes"; route = "student-notes"; ctrl = "StudentNotesController"; svc = "StudentNotesService" }
  @{ name = "StudentGrades"; route = "student-grades"; ctrl = "StudentGradesController"; svc = "StudentGradesService" }
  @{ name = "StudentProgress"; route = "student-progress"; ctrl = "StudentProgressController"; svc = "StudentProgressService" }
  @{ name = "AcademicPulse"; route = "academic-pulse"; ctrl = "AcademicPulseController"; svc = "AcademicPulseService" }
  @{ name = "Fast"; route = "fast"; ctrl = "FastController"; svc = "FastService" }
)

foreach ($m in $modules) {
  $folderName = $m.name.ToLower() -replace '([A-Z])', '-$1' -replace '^-', ''
  # convert PascalCase to kebab-case for folder
  $folderName = $m.route -replace '/', '-'
  $dir = Join-Path $BasePath $folderName

  # Special handling for some names
  if ($m.name -eq "SkillBoost") { $folderName = "skill-boost"; $dir = Join-Path $BasePath "skill-boost" }
  if ($m.name -eq "AdminData") { $folderName = "admin-data"; $dir = Join-Path $BasePath "admin-data" }
  if ($m.name -eq "FacultyData") { $folderName = "faculty-data"; $dir = Join-Path $BasePath "faculty-data" }
  if ($m.name -eq "StudentData") { $folderName = "student-data"; $dir = Join-Path $BasePath "student-data" }
  if ($m.name -eq "AdminMessages") { $folderName = "admin-messages"; $dir = Join-Path $BasePath "admin-messages" }
  if ($m.name -eq "StudentNotes") { $folderName = "student-notes"; $dir = Join-Path $BasePath "student-notes" }
  if ($m.name -eq "StudentGrades") { $folderName = "student-grades"; $dir = Join-Path $BasePath "student-grades" }
  if ($m.name -eq "StudentProgress") { $folderName = "student-progress"; $dir = Join-Path $BasePath "student-progress" }
  if ($m.name -eq "AcademicPulse") { $folderName = "academic-pulse"; $dir = Join-Path $BasePath "academic-pulse" }

  New-Item -ItemType Directory -Force -Path $dir | Out-Null

  $lowerName = $m.name.ToLower()

  # Service file
  $serviceContent = @"
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class $($m.svc) {
  constructor(@InjectConnection() private connection: Connection) {}

  // TODO: Implement service methods
  // This service wraps the original routes/$($m.route).js logic
}
"@

  # Controller file
  $controllerContent = @"
import { Controller, Get, Post, Put, Delete, Patch, Param, Body, Query, UseGuards, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/guards';
import { Public } from '../decorators/public.decorator';
import { $($m.svc) } from './$($lowerName).service';

@Controller('$($m.route)')
export class $($m.ctrl) {
  constructor(private $($lowerName)Service: $($m.svc)) {}

  // Routes are mapped from the original backend/routes/ files
  // See backend/routes/$($m.route)*.js for the original implementation
}
"@

  # For some controllers we need to pass through to original Express router
  # We use a proxy approach for complex routes

  # Module file
  $moduleContent = @"
import { Module } from '@nestjs/common';
import { $($m.ctrl) } from './$($lowerName).controller';
import { $($m.svc) } from './$($lowerName).service';

@Module({
  controllers: [$($m.ctrl)],
  providers: [$($m.svc)],
  exports: [$($m.svc)],
})
export class $($m.name)Module {}
"@

  # Write files
  $serviceFile = Join-Path $dir "$($lowerName).service.ts"
  $controllerFile = Join-Path $dir "$($lowerName).controller.ts"
  $moduleFile = Join-Path $dir "$($lowerName).module.ts"

  $serviceContent | Out-File -FilePath $serviceFile -Encoding utf8
  $controllerContent | Out-File -FilePath $controllerFile -Encoding utf8
  $moduleContent | Out-File -FilePath $moduleFile -Encoding utf8

  Write-Host "Created module: $($m.name) at $dir"
}

Write-Host "All modules created successfully!"
