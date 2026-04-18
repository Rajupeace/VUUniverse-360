// Faculty Knowledge Base (SENTINEL v7.0)
module.exports = {
    greeting: {
        keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
        response: (context) => `👨‍🏫 **Welcome back, ${context?.name || 'Professor'}!**\n\nYour classroom is ready. I can help you manage attendance, upload notes, or track student progress. \n\n*How can I assist your teaching today?*`
    },

    students: {
        keywords: ['student', 'students', 'my students', 'class', 'section', 'roster', 'cadets'],
        response: () => "Here's your **Student Roster**. 📋\n\nYou can view profiles, academic history, and contact details for all your students here:\n\n{{NAVIGATE: students}}"
    },

    upload: {
        keywords: ['upload', 'add material', 'upload notes', 'add content', 'share material'],
        response: () => "Let's share some knowledge! 📤\n\nHead to **Materials** to upload lecture notes, videos, or assignments for your class.\n\n{{NAVIGATE: materials}}\n\n*Tip: PDFs and Videos are most popular with students!*"
    },

    materials: {
        keywords: ['materials', 'notes', 'content', 'resources', 'my uploads'],
        response: () => "Accessing your **Digital Library**. 📚\n\nManage your course content and see what you've shared so far:\n\n{{NAVIGATE: materials}}"
    },

    attendance: {
        keywords: ['attendance', 'mark attendance', 'present', 'absent', 'roster'],
        response: () => "Time to mark attendance! 📝\n\nGo to the **Attendance Register** to log today's presence.\n\n{{NAVIGATE: attendance}}"
    },

    doubts: {
        keywords: ['doubts', 'questions', 'queries', 'student questions'],
        response: () => "Handling student doubts? 🤔\n\nYou can address common queries in class or upload a 'Q&A' document in the **Materials** section.\n\n{{NAVIGATE: materials}}"
    },

    papers: {
        keywords: ['question paper', 'exam paper', 'set paper', 'model paper'],
        response: () => "Preparing for exams? 📝\n\nYou can upload **Model Papers** or Previous Year Questions in the Materials section under the 'Model Papers' category.\n\n{{NAVIGATE: materials}}"
    },

    grades: {
        keywords: ['grades', 'marks', 'evaluation', 'assessment', 'score', 'exam'],
        response: () => "Let's check the performance. 📊\n\nManage exam markings and view subject-wise performance here:\n\n{{NAVIGATE: exams}}"
    },

    schedule: {
        keywords: ['schedule', 'timetable', 'my classes', 'teaching schedule', 'when is my next class'],
        response: () => "Checking your schedule... 📅\n\nHere are your classes for the day/week:\n\n{{NAVIGATE: schedule}}"
    },

    communication: {
        keywords: ['message', 'notify', 'announcement', 'communicate', 'send', 'broadcast'],
        response: () => "Need to make an announcement? 📢\n\nSend a **Broadcast Message** to your entire class or specific students instantly:\n\n{{NAVIGATE: broadcast}}"
    },

    default: {
        response: (userMessage) => `I heard you say *"${userMessage}"*.\n\nI'm not exactly sure how to help with that, but you can explore your **Dashboard Overview** for all options:\n\n{{NAVIGATE: overview}}`
    }
};
