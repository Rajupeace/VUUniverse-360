// Syllabus and Courses Knowledge Base
module.exports = {
    syllabus: {
        keywords: ['syllabus', 'course structure', 'curriculum', 'subjects', 'topics', 'what are my subjects'],
        response: (context) => `📚 **Your Academic Syllabus**\n\nYour syllabus for this semester covers core subjects and electives based on your branch.\n\n- **Core Subjects**: Data Structures, Operating Systems, Computer Networks\n- **Electives**: AI & ML, Cloud Computing\n\nYou can view your detailed syllabus, course handouts, and module-wise topics in the Materials section.\n\n{{NAVIGATE: semester}} → View Full Syllabus`
    },

    topics: {
        keywords: ['topics', 'module', 'unit', 'chapter', 'what topics', 'important topics'],
        response: () => `📖 **Subject Topics & Modules**\n\nEach subject is divided into 5 units. You can find the weightage, important topics, and previous year questions (PYQs) attached to each unit in your course dashboard.\n\n{{NAVIGATE: materials}}`
    },

    courses: {
        keywords: ['course', 'courses', 'my courses', 'registered courses', 'electives'],
        response: () => `🎓 **Registered Courses**\n\nYou can manage your registered courses, track progress, and view faculty assignments in the Academic section.\n\n{{NAVIGATE: semester}}`
    },

    branches: {
        keywords: ['branch', 'branches', 'cse', 'ece', 'mech', 'civil', 'eee', 'aiml', 'it'],
        response: () => `🏛️ **University Branches**\n\nVignan University offers specialized branches including:\n- Computer Science (CSE, IT, AIML)\n- Electronics & Communication (ECE)\n- Electrical & Electronics (EEE)\n- Mechanical & Civil Engineering\n\nYou can switch to branch-specific materials in the Library.\n\n{{NAVIGATE: overview}}`
    },
    
    general: {
        keywords: ['university', 'vignan', 'about vignan', 'college info', 'campus', 'facilities'],
        response: () => `🏫 **Vignan University Information**\n\nVignan University is a premier educational institution committed to providing high-quality engineering and management education. We offer state-of-the-art labs, a massive library, excellent placement opportunities, and vibrant student clubs.\n\n{{NAVIGATE: overview}}`
    }
};
