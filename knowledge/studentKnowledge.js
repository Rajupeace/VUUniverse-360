// Comprehensive Student Knowledge Base - B.Tech Edition
// With extensive subject knowledge and doubt clearing support
module.exports = {
    // GREETING & WELCOME
    greeting: {
        keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'yo', 'welcome'],
        response: () => `👋 Welcome to Your Learning Hub!\n\nI'm your AI Study Companion ready to help you ace your B.Tech! 🚀\n\n💪 **What I Can Do:**\n📚 Explain all B.Tech concepts (DSA, OOPS, Database, Networks, OS, etc.)\n🧠 Clear doubts step-by-step\n💻 Help with coding and debugging\n📝 Guide exam preparation\n⚡ Quick answers on any topic\n\nWhat can I help with today?`
    },

    // B.TECH CORE SUBJECTS
    data_structures: {
        keywords: ['data structure', 'ds', 'array', 'linked list', 'list', 'stack', 'queue', 'tree', 'binary tree', 'bst', 'graph', 'sorting', 'searching', 'heap', 'trie', 'hash'],
        response: () => `📊 **Data Structures Explained!**\n\n**Topics I cover:**\n✅ Linear: Arrays, Linked Lists, Stacks, Queues\n✅ Trees: Binary Trees, BST, AVL Trees, Heaps\n✅ Graphs: DFS, BFS, Dijkstra, Bellman-Ford\n✅ Sorting: QuickSort, MergeSort, HeapSort\n✅ Searching: Linear, Binary Search\n✅ Hashing: Hash Tables, Collision Resolution\n\n**Share your doubt:**\n🤔 What concept are you struggling with?\n📝 Share the problem or example\n💡 Let me explain with examples!\n\nReady? Tell me which topic! 🧠`
    },

    oops: {
        keywords: ['oops', 'object oriented', 'class', 'object', 'inheritance', 'polymorphism', 'encapsulation', 'abstraction', 'constructor', 'method over', 'interface', 'oop'],
        response: () => `🎯 **Object-Oriented Programming Made Easy!**\n\n**Core Concepts:**\n✅ Classes & Objects - Building blocks\n✅ Inheritance - Code reuse strategies\n✅ Polymorphism - Overloading & Overriding\n✅ Encapsulation - Data hiding\n✅ Abstraction - Simplified interfaces\n✅ Design Patterns - Proven solutions\n\n**Code Examples Available** for:\n📝 Java, Python, C++\n\n**What's confusing you?**\n• Inheritance hierarchy?\n• Method overriding vs overloading?\n• When to use interface vs abstract class?\n\nLet's clarify! 🚀`
    },

    database: {
        keywords: ['database', 'db', 'sql', 'mysql', 'query', 'table', 'schema', 'normalization', 'nosql', 'mongodb', 'join', 't-sql', 'select', 'where'],
        response: () => `🗄️ **Database Systems & SQL!**\n\n**What I Explain:**\n✅ SQL Queries - SELECT, INSERT, UPDATE, DELETE\n✅ Joins - INNER, LEFT, RIGHT, FULL OUTER\n✅ Normalization - 1NF, 2NF, 3NF, BCNF\n✅ Schema Design - ER Diagrams, Keys\n✅ Advanced - Views, Triggers, Transactions\n✅ NoSQL - MongoDB basics\n\n**Debug Your Query:**\n❌ Query not working?\n📝 Paste it here\n✅ I'll fix it!\n\n**Common Issues:**\n• JOIN confusion\n• GROUP BY & HAVING\n• Normalization rules\n• Complex queries\n\nLet's debug together! 🔧`
    },

    algorithms: {
        keywords: ['algorithm', 'time complexity', 'space complexity', 'big o', 'notation', 'dynamic programming', 'dp', 'greedy', 'backtracking', 'recursion', 'brute force'],
        response: () => `🔧 **Algorithms & Complexity Analysis!**\n\n**Big O & Complexity:**\n✅ O(1), O(n), O(n²), O(log n), O(n log n)\n✅ Best, Average, Worst Cases\n✅ Space Complexity Analysis\n✅ Recurrence Relations\n\n**Algorithm Techniques:**\n✅ Sorting & Searching\n✅ Dynamic Programming\n✅ Greedy Algorithms\n✅ Backtracking\n✅ Recursion & Memoization\n\n**Your Problem:**\n📊 Share the algorithm\n⏱️ I'll analyze complexity\n🎯 Optimize your solution\n\nLet's solve it step-by-step! 💪`
    },

    web_technologies: {
        keywords: ['web', 'html', 'css', 'javascript', 'react', 'node', 'express', 'frontend', 'backend', 'api', 'rest', 'http', 'json', 'server'],
        response: () => `🌐 **Web Development Technologies!**\n\n**Frontend:**\n✅ HTML5, CSS3, Responsive Design\n✅ JavaScript ES6+\n✅ React.js, Vue.js\n✅ Bootstrap, Tailwind CSS\n\n**Backend:**\n✅ Node.js & Express\n✅ Python, Java frameworks\n✅ RESTful APIs\n✅ Database integration\n\n**Help With:**\n💻 Frontend issues?\n🔌 Backend problems?\n🔗 API design?\n📱 Full-stack project?\n\nI've built web apps! Ask away! 🚀`
    },

    operating_systems: {
        keywords: ['os', 'operating system', 'process', 'thread', 'mutex', 'semaphore', 'deadlock', 'memory', 'virtual memory', 'paging', 'scheduling', 'disk'],
        response: () => `💻 **Operating Systems Concepts!**\n\n**Process Management:**\n✅ Processes & Threads\n✅ Synchronization & Deadlock\n✅ CPU Scheduling Algorithms\n✅ Semaphores & Mutexes\n\n**Memory Management:**\n✅ Paging & Segmentation\n✅ Virtual Memory\n✅ Cache Management\n\n**File Systems & Disks:**\n✅ File Organization\n✅ Disk Scheduling\n✅ I/O Management\n\n**Confused About:**\n🔄 Process states?\n🔐 Synchronization?\n⚙️ Scheduling algorithms?\n\nLet's understand OS! 🎓`
    },

    computer_networks: {
        keywords: ['network', 'networking', 'osi', 'tcp', 'ip', 'udp', 'routing', 'switching', 'dns', 'dhcp', 'firewall', 'bandwidth', 'layer', 'protocol'],
        response: () => `🌍 **Computer Networks Simplified!**\n\n**OSI Model:**\n✅ All 7 Layers explained\n✅ Protocol interactions\n✅ Data flow\n\n**Protocols:**\n✅ TCP vs UDP\n✅ IP, DNS, DHCP\n✅ HTTP, HTTPS, FTP\n✅ SMTP, POP3, IMAP\n\n**Concepts:**\n✅ Routing Algorithms\n✅ Switching\n✅ Subnetting\n✅ Network Security\n\n**Need Help:**\n📡 Protocol differences?\n🗂️ OSI model layers?\n🔀 Routing concepts?\n\nNetworks made simple! 🌐`
    },

    software_engineering: {
        keywords: ['software', 'engineering', 'sdlc', 'requirements', 'design', 'testing', 'agile', 'waterfall', 'uml', 'design pattern', 'dev'],
        response: () => `🏗️ **Software Engineering Principles!**\n\n**SDLC Models:**\n✅ Waterfall Model\n✅ Agile & Scrum\n✅ Spiral Model\n✅ DevOps\n\n**Development Process:**\n✅ Requirements Analysis\n✅ System Design\n✅ Implementation\n✅ Testing Strategies\n✅ Maintenance\n\n**Design Elements:**\n✅ UML Diagrams\n✅ Design Patterns\n✅ Architecture\n\n**Ask About:**\n📋 SDLC differences?\n🧪 Testing types?\n🎯 Design patterns?\n\nLet's design better software! 🏆`
    },

    notes_materials: {
        keywords: ['notes', 'study material', 'pdf', 'download', 'materials', 'document', 'lecture', 'handout', 'reading', 'resources'],
        response: () => `📚 **Access Your Study Materials!**\n\n**All Notes Available:**\n📖 Organized by subject\n📑 Chapter-wise breakdown\n⭐ Quick revision notes\n🧮 Formulas & concepts\n\n**Navigate to Semester Notes:**\n{{NAVIGATE: semester-notes}}\n\n**Then:**\n✅ Select your subject\n✅ Find the chapter\n✅ Download or view\n✅ Learn actively\n\n**Pro Tip:**\n Don't just read - make notes, create mind maps, try problems!\n\nLet's ace these concepts! 📝`
    },

    doubts_help: {
        keywords: ['doubt', 'don\'t understand', 'confused', 'help me understand', 'explain', 'clarify', 'what is', 'how to', 'why', 'cannot understand', 'stuck', 'how does'],
        response: () => `🧠 **Doubt Clearing Session!**\n\n**I'm Here to Explain:**\n✅ Any concept, any subject\n✅ Step-by-step breakdowns\n✅ Real-world examples\n✅ Multiple approaches\n✅ Visual explanations\n\n**For Best Help, Tell Me:**\n📚 **Subject?** (DSA, OOPS, Database, etc.)\n🎯 **Topic?** (Which chapter/concept)\n❓ **Specific Issue?** (What exactly is confusing)\n💡 **What you tried?** (Any approach attempted)\n\n**Example Good Questions:**\n✅ \"Explain how quicksort partitioning works\"\n✅ \"Why does left outer join behave this way?\"\n✅ \"How does inheritance actually work in Python?\"\n\n❌ \"I don't understand recursion\"\n❌ \"Help me with DSA\"\n\nLet's make it crystal clear! 💎`
    },

    coding_help: {
        keywords: ['code', 'coding', 'debug', 'error', 'compile', 'runtime', 'syntax', 'logic', 'program', 'function', 'bug', 'implementation', 'code help'],
        response: () => `💻 **Code Debugging & Help!**\n\n**I Can Debug:**\n✅ Java, Python, C++, JavaScript\n✅ Syntax errors\n✅ Logic errors\n✅ Runtime errors\n✅ Performance issues\n\n**Please Share:**\n1️⃣ Your code (paste it)\n2️⃣ Error message (if any)\n3️⃣ Expected behavior\n4️⃣ What you tried\n5️⃣ Your programming language\n\n**I Can Help With:**\n🔍 Find the bug\n✅ Fix the issue\n⚡ Optimize performance\n📚 Explain the fix\n\nPaste away! Let's fix it! 🔧`
    },

    exam_preparation: {
        keywords: ['exam', 'test', 'prepare', 'preparation', 'practice', 'revision', 'study', 'midterm', 'final', 'mock', 'assessment', 'quiz'],
        response: () => `🎯 **Exam Success Strategy!**\n\n**My Prep Formula:**\n1️⃣ **Identify Topics** - What to focus on\n2️⃣ **Learn Deeply** - Understand, don't memorize\n3️⃣ **Practice** - Solve problems repeatedly\n4️⃣ **Mock Tests** - Full-length practice\n5️⃣ **Revise** - Quick reviews before exam\n\n**I Can Help With:**\n📋 Topics that will come?\n🧠 Deep concept understanding\n📝 Previous year papers\n⏱️ Time management\n💡 Tricky questions\n\n**Tell Me:**\n📚 Your next exam?\n📅 When is it?\n🎯 Which subjects?\n💪 Your current level?\n\nLet's crush this exam! 🚀`
    },

    quick_answer: {
        keywords: ['what is', 'define', 'example', 'short', 'quickly', 'tldr'],
        response: () => `⚡ **Quick Answer Mode!**\n\n**Ask Me:**\n• \"What is recursion?\"\n• \"Define encapsulation\"\n• \"Give an example of  polymorphism\"\n• \"Quick summary of sorting\"\n\n**I'll Provide:**\n✅ Simple definition\n✅ One great example\n✅ Key takeaway\n✅ When to use it\n\n**For Deep Learning:**\nAsk me to \"explain\" instead of \"define\" for detailed breakdown!\n\nWhat concept? 💭`
    },

    assignments_projects: {
        keywords: ['assignment', 'homework', 'project', 'submission', 'deadline', 'task', 'problem set', 'work'],
        response: () => `💼 **Assignment & Project Support!**\n\n**I Help With:**\n✅ Understanding requirements\n✅ Choosing the right approach\n✅ Implementation guidance\n✅ Debugging errors\n✅ Optimization\n✅ Documentation\n\n**Share With Me:**\n📋 Assignment details\n❓ What you need to do\n📝 What you've tried\n🐛 Where you're stuck\n\n**Remember:**\nMy goal: Help you LEARN, not just complete!\n\n**Your Assignment:**\nLet's break it down together! 🎯`
    },

    formulas_calculations: {
        keywords: ['formula', 'equation', 'calculate', 'solve', 'math', 'derive', 'derivation', 'proof', 'theorem'],
        response: () => `📐 **Formulas & Mathematical Solutions!**\n\n**I Can Explain:**\n✅ Why formulas work\n✅ Derivations step-by-step\n✅ When to apply them\n✅ Real problems using formulas\n✅ Alternative approaches\n\n**Share:**\n🧮 The formula or equation\n📚 The topic/chapter\n❓ What you need help with\n\n**Examples:**\n• Time complexity derivations\n• Sorting algorithm proofs\n• Database normalization rules\n• Physics/Math formulas\n\nMath made clear! 🎓`
    },

    motivation_support: {
        keywords: ['stressed', 'overwhelmed', 'tired', 'demotivated', 'struggling', 'hard', 'difficult', 'can\'t focus', 'help'],
        response: () => `💪 **You've Got This! Believe in Yourself!**\n\n**Remember:**\n✅ You're stronger than you think\n✅ Every expert was once a beginner\n✅ Struggles = Learning\n✅ Progress > Perfection\n✅ You've handled 100% of bad days\n\n**Quick Energy Boost:**\n1. Take 3 deep breaths 🫁\n2. Move around 2 minutes 🚶\n3. Drink water 💧\n4. Start ONE task 🚀\n\n**Let's Do This:**\n• What's the most urgent task?\n• Break it into smaller chunks\n• We'll tackle it together\n• Celebrate small wins\n\n**You Are Capable of Amazing Things!**\n\nWhat do we attack first? 💯`
    },

    study_tips: {
        keywords: ['tip', 'trick', 'hack', 'method', 'strategy', 'technique', 'how to study', 'learn better', 'tips'],
        response: () => `✨ **Pro Study Hacks & Tips!**\n\n**Time Management:**\n⏱️ Pomodoro: 25min focus, 5min break\n🎯 Study during peak hours\n📅 Plan weekly\n\n**Learning Techniques:**\n🧠 Feynman: Teach someone else\n🔁 Active Recall: Test yourself\n📝 Spaced Repetition: Review intervals\n🗺️ Mind Maps: Visualize connections\n\n**Exam Tips:**\n📖 Read all questions first\n⏰ Allocate time by marks\n✍️ Show working (partial credit)\n🔍 Review answers\n\n**Coding Tips:**\n🐛 Debug with print statements\n📦 Break into functions\n🧪 Test edge cases\n🧹 Refactor for clarity\n\nWhich tip would help you most? 🎓`
    },

    about_me: {
        keywords: ['who are you', 'what are you', 'about you', 'your name', 'introduced yourself'],
        response: () => `🤖 **I'm Your AI Study Companion!**\n\n**About Me:**\nI'm an intelligent learning assistant created to help Vignan University B.Tech students succeed! 🎓\n\n**My Purpose:**\n✅ Explain complex concepts clearly\n✅ Help with assignments and projects\n✅ Prepare you for exams\n✅ Support your entire learning journey\n\n**Why Trust Me:**\n🔸 24/7 availability - Always ready\n🔸 Expert knowledge - All B.Tech subjects\n🔸 No judgment - Questions are welcome\n🔸 Simplified explanations - Easy to understand\n🔸 Real examples - Practical learning\n\n**What I Know:**\n📚 Data Structures, OOPS, Database, Networks, OS\n💻 Web Development, Algorithms, Software Engineering\n🔧 Multiple programming languages\n📝 Study strategies & exam prep\n\n**Let's Learn Together!** 🚀`
    },

    default: {
        response: (userMessage) => `🤔 **I'm Here to Help!**\n\n**Topics I Cover:**\n📚 **B.Tech Subjects** → DSA, OOPS, Database, Networks, OS, Web Dev, Algorithms, Compiler Design\n🧠 **Doubt Clearing** → Explain any concept step-by-step\n💻 **Coding** → Debug your code, multiple languages\n📝 **Exams** → Preparation strategy & practice\n📖 **Materials** → Access notes and resources\n\n**Try Asking:**\n• \"Explain quicksort algorithm\"\n• \"Help with my database query\"\n• \"Is my code correct?\"\n• \"How to prepare for finals?\"\n• \"I'm confused about inheritance\"\n\n**Or Navigate to:**\n{{NAVIGATE: semester-notes}}\n\n**Be Specific For Best Help:**\n• Subject name\n• Specific topic\n• What's confusing\n\n**I'm Ready to Help! What's Your Question?** 💪`
    }
};
