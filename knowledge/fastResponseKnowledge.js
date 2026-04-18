// Fast Response Knowledge Base - Optimized for Quick Answers
module.exports = {
    // QUICK ANSWERS FOR COMMON QUESTIONS
    quick_answers: {
        keywords: ['what', 'how', 'why', 'when', 'where', 'who', 'explain', 'tell me', 'help me'],
        response: (context) => {
            const message = context?.message?.toLowerCase() || '';
            
            // Fast keyword-based responses
            if (message.includes('class') || message.includes('schedule')) {
                return getQuickClassInfo(context);
            }
            if (message.includes('attendance')) {
                return getQuickAttendanceInfo(context);
            }
            if (message.includes('assignment') || message.includes('homework')) {
                return getQuickAssignmentInfo(context);
            }
            if (message.includes('exam') || message.includes('test')) {
                return getQuickExamInfo(context);
            }
            if (message.includes('grade') || message.includes('marks')) {
                return getQuickGradeInfo(context);
            }
            if (message.includes('library') || message.includes('study')) {
                return getQuickLibraryInfo(context);
            }
            if (message.includes('help') || message.includes('support')) {
                return getQuickHelpInfo(context);
            }
            
            return getQuickDefaultResponse(context);
        }
    },

    // RAPID FIRE RESPONSES
    rapid_fire: {
        keywords: ['quick', 'fast', 'urgent', 'immediate', 'now', 'asap'],
        response: (context) => {
            return `⚡ **Quick Response** ⚡

${getRapidResponse(context)}

Need more details? Ask specifically!`;
        }
    },

    // STUDENT QUICK HELP
    student_quick: {
        keywords: ['student', 'dashboard', 'portal', 'login', 'profile'],
        response: (context) => {
            return `🎓 **Student Quick Help** 🎓

${getStudentQuickHelp(context)}

{{NAVIGATE: student-dashboard}} → Full Dashboard`;
        }
    },

    // FACULTY QUICK HELP
    faculty_quick: {
        keywords: ['faculty', 'professor', 'teacher', 'staff'],
        response: (context) => {
            return `👨‍🏫 **Faculty Quick Help** 👨‍🏫

${getFacultyQuickHelp(context)}

{{NAVIGATE: faculty-dashboard}} → Full Dashboard`;
        }
    },

    // ADMIN QUICK HELP
    admin_quick: {
        keywords: ['admin', 'administrator', 'management', 'system'],
        response: (context) => {
            return `🔧 **Admin Quick Help** 🔧

${getAdminQuickHelp(context)}

{{NAVIGATE: admin-dashboard}} → Full Dashboard`;
        }
    },

    // TECHNICAL QUICK HELP
    technical_quick: {
        keywords: ['error', 'problem', 'issue', 'bug', 'technical', 'support'],
        response: (context) => {
            return `🔧 **Technical Quick Help** 🔧

${getTechnicalQuickHelp(context)}

{{NAVIGATE: support}} → Technical Support`;
        }
    },

    default: {
        response: (context) => {
            return `⚡ **VUAI Agent - Fast Response** ⚡

I'm here to help you quickly! Ask me about:

🎓 **Students**: Classes, attendance, assignments, grades
👨‍🏫 **Faculty**: Teaching, research, students, schedules  
🔧 **Admin**: System, users, reports, management
📚 **Academics**: Engineering, science, mathematics
🗺️ **Campus**: Locations, navigation, facilities

**Quick Examples:**
- "What classes today?"
- "My attendance?"
- "Assignment help"
- "Where is library?"
- "How to login?"

I respond in **under 2 seconds**! ⚡

What do you need help with?`;
        }
    }
};

// Fast response helper functions
function getQuickClassInfo(context) {
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return `📅 **Today's Classes** - ${time}

**Next Class**: ${getNextClass()} in ${getTimeUntilNextClass()} minutes
**Location**: ${getQuickLocation()}
**Professor**: ${getQuickProfessor()}

{{NAVIGATE: timetable}} → Full Schedule`;
}

function getQuickAttendanceInfo(context) {
    return `📊 **Attendance** 

**Current**: ${getAttendancePercentage()}%
**Classes Today**: ${getTodayClasses()}/${getTotalTodayClasses()}
**Status**: ${getAttendanceStatus()}

{{NAVIGATE: attendance}} → Details`;
}

function getQuickAssignmentInfo(context) {
    return `📝 **Assignments**

**Due Today**: ${getAssignmentsDueToday()}
**Due This Week**: ${getAssignmentsDueWeek()}
**Overdue**: ${getOverdueAssignments()}

{{NAVIGATE: assignments}} → All Assignments`;
}

function getQuickExamInfo(context) {
    return `📋 **Exams**

**Next Exam**: ${getNextExam()} in ${getDaysUntilExam()} days
**This Week**: ${getExamsThisWeek()}
**Preparation**: ${getExamPrepStatus()}

{{NAVIGATE: exams}} → Exam Schedule`;
}

function getQuickGradeInfo(context) {
    return `📊 **Grades**

**Current GPA**: ${getCurrentGPA()}
**Last Updated**: ${getGradesLastUpdated()}
**Rank**: ${getClassRank()}

{{NAVIGATE: grades}} → All Grades`;
}

function getQuickLibraryInfo(context) {
    return `📚 **Library**

**Hours**: ${getLibraryHours()}
**Available**: ${getLibraryStatus()}
**Location**: ${getLibraryLocation()}

{{NAVIGATE: library}} → Library Portal`;
}

function getQuickHelpInfo(context) {
    return `🆘 **Quick Help**

**Student Support**: {{NAVIGATE: student-support}}
**Technical Help**: {{NAVIGATE: technical-support}}
**Emergency**: {{NAVIGATE: emergency}}

**Phone**: 1234 | **Email**: help@vuai.edu`;
}

function getRapidResponse(context) {
    const message = context?.message?.toLowerCase() || '';
    
    if (message.includes('class')) return 'Next class in 30 mins - Room A-201';
    if (message.includes('attendance')) return `Attendance: ${getAttendancePercentage()}%`;
    if (message.includes('assignment')) return `${getAssignmentsDueToday()} due today`;
    if (message.includes('exam')) return `Next exam: ${getNextExam()}`;
    if (message.includes('grade')) return `Current GPA: ${getCurrentGPA()}`;
    if (message.includes('library')) return 'Library open until 10 PM';
    
    return 'I can help with classes, attendance, assignments, exams, grades, and more!';
}

function getStudentQuickHelp(context) {
    return `**Quick Links:**
- 📅 Today's Classes: {{NAVIGATE: today-classes}}
- 📊 Attendance: {{NAVIGATE: attendance}}
- 📝 Assignments: {{NAVIGATE: assignments}}
- 📋 Exams: {{NAVIGATE: exams}}
- 📚 Study Materials: {{NAVIGATE: study}}`;
}

function getFacultyQuickHelp(context) {
    return `**Quick Links:**
- 👥 My Classes: {{NAVIGATE: my-classes}}
- 📊 Student Reports: {{NAVIGATE: student-reports}}
- 📝 Materials: {{NAVIGATE: materials}}
- 📅 Schedule: {{NAVIGATE: faculty-schedule}}
- 📊 Analytics: {{NAVIGATE: analytics}}`;
}

function getAdminQuickHelp(context) {
    return `**Quick Links:**
- 👥 Users: {{NAVIGATE: users}}
- 📊 Reports: {{NAVIGATE: reports}}
- ⚙️ Settings: {{NAVIGATE: settings}}
- 🔔 Notifications: {{NAVIGATE: notifications}}
- 📊 Analytics: {{NAVIGATE: admin-analytics}}`;
}

function getTechnicalQuickHelp(context) {
    return `**Quick Fixes:**
- 🔄 Refresh page
- 🔄 Clear cache
- 🔄 Check internet
- 📧 Email support@vuai.edu
- 📞 Call 1234`;
}

// Fast data generators
function getNextClass() { return 'Engineering Mathematics'; }
function getTimeUntilNextClass() { return Math.floor(Math.random() * 60) + 15; }
function getQuickLocation() { return 'A-201 (Ground Floor)'; }
function getQuickProfessor() { return 'Dr. Smith'; }
function getAttendancePercentage() { return Math.floor(Math.random() * 20) + 75; }
function getTodayClasses() { return Math.floor(Math.random() * 3) + 1; }
function getTotalTodayClasses() { return 4; }
function getAttendanceStatus() { return 'Good'; }
function getAssignmentsDueToday() { return Math.floor(Math.random() * 3); }
function getAssignmentsDueWeek() { return Math.floor(Math.random() * 5) + 2; }
function getOverdueAssignments() { return Math.floor(Math.random() * 2); }
function getNextExam() { return 'Physics Midterm'; }
function getDaysUntilExam() { return Math.floor(Math.random() * 14) + 3; }
function getExamsThisWeek() { return Math.floor(Math.random() * 3); }
function getExamPrepStatus() { return 'On Track'; }
function getCurrentGPA() { return (Math.random() * 2 + 2).toFixed(2); }
function getGradesLastUpdated() { return '2 days ago'; }
function getClassRank() { return Math.floor(Math.random() * 50) + 1; }
function getLibraryHours() { return '8 AM - 10 PM'; }
function getLibraryStatus() { return 'Open'; }
function getLibraryLocation() { return 'Building #12'; }
function getQuickDefaultResponse(context) {
    return `I can help with classes, attendance, assignments, exams, grades, library, and more!

**Quick Examples:**
- "What classes today?"
- "My attendance?"
- "Assignment help"
- "Where is library?"

{{NAVIGATE: help}} → Full Help`;
}
