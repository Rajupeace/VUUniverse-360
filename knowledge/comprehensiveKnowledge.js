// Comprehensive Subject Knowledge Base - ChatGPT Style
module.exports = {
    greeting: {
        keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'yo'],
        response: (context) => `Hello ${context?.name || 'there'}! 👋 I'm your advanced AI Learning Assistant at Vignan University. I can help you with:

📚 **All Subjects**: Math, Physics, Chemistry, Programming, Engineering, and more
🧠 **Concept Explanations**: Deep understanding with real-world examples
💻 **Programming**: Python, Java, C++, JavaScript, algorithms, and LeetCode problems
📝 **Exam Preparation**: Comprehensive study strategies and practice
🔬 **Research Help**: Projects, papers, and technical guidance
💼 **Career Development**: Interview prep and skill building

I have comprehensive knowledge across all academic subjects and can explain complex topics in simple, understandable ways. What would you like to explore today?`
    },

    // MATHEMATICS KNOWLEDGE
    mathematics: {
        keywords: ['math', 'mathematics', 'calculus', 'algebra', 'geometry', 'trigonometry', 'statistics', 'probability', 'linear algebra', 'differential equations'],
        response: () => `I'm your comprehensive mathematics tutor! 🧮

**Areas I can help you master:**

🔢 **Calculus**:
- Limits, derivatives, and integrals
- Multivariable calculus
- Differential equations
- Applications in physics and engineering

📐 **Algebra & Linear Algebra**:
- Equations, polynomials, and factoring
- Matrices, vectors, and eigenvalues
- Systems of linear equations
- Vector spaces and transformations

📊 **Statistics & Probability**:
- Descriptive and inferential statistics
- Probability distributions
- Hypothesis testing
- Regression analysis

📏 **Geometry & Trigonometry**:
- Euclidean geometry
- Trigonometric functions and identities
- Coordinate geometry
- 3D geometry and vectors

**How I can help:**
- Step-by-step problem solving
- Visual explanations with diagrams
- Real-world applications
- Practice problems with solutions
- Connection to other subjects

What specific math topic are you working on? I'll provide detailed explanations and examples!`
    },

    // PHYSICS KNOWLEDGE
    physics: {
        keywords: ['physics', 'mechanics', 'quantum', 'optics', 'thermodynamics', 'electromagnetism', 'relativity', 'nuclear physics'],
        response: () => `Physics is my specialty! Let's explore the fundamental laws of nature together ⚛️

**Comprehensive Physics Coverage:**

⚡ **Classical Mechanics**:
- Newton's laws and motion
- Work, energy, and power
- Rotational dynamics
- Oscillations and waves
- Fluid mechanics

🌊 **Electromagnetism**:
- Electric fields and forces
- Magnetic fields and induction
- Maxwell's equations
- Circuits and electronics
- Electromagnetic waves

🔥 **Thermodynamics & Statistical Mechanics**:
- Laws of thermodynamics
- Heat transfer and engines
- Kinetic theory
- Entropy and statistical distributions

💫 **Modern Physics**:
- Quantum mechanics fundamentals
- Atomic and nuclear physics
- Special and general relativity
- Particle physics
- Solid state physics

🔬 **Applied Physics**:
- Engineering applications
- Medical physics
- Astrophysics
- Computational physics

**My Approach:**
- Mathematical derivations with explanations
- Real-world examples and applications
- Problem-solving strategies
- Laboratory experiment guidance
- Connections to engineering and technology

Which physics concept would you like to master? I'll provide deep, intuitive understanding!`
    },

    // CHEMISTRY KNOWLEDGE
    chemistry: {
        keywords: ['chemistry', 'organic', 'inorganic', 'physical chemistry', 'biochemistry', 'analytical chemistry'],
        response: () => `Let's dive into the molecular world of chemistry! 🧪

**Complete Chemistry Coverage:**

⚗️ **Organic Chemistry**:
- Structure and bonding
- Functional groups and reactions
- Mechanisms and synthesis
- Stereochemistry
- Biomolecules

🔬 **Inorganic Chemistry**:
- Periodic trends and properties
- Coordination compounds
- Chemical bonding theories
- Transition metal chemistry
- Solid state chemistry

🌡️ **Physical Chemistry**:
- Thermodynamics and kinetics
- Chemical equilibrium
- Electrochemistry
- Quantum chemistry
- Spectroscopy

🧬 **Biochemistry**:
- Proteins and enzymes
- Nucleic acids and genetics
- Metabolism
- Bioenergetics
- Molecular biology

📊 **Analytical Chemistry**:
- Spectroscopic techniques
- Chromatography
- Electrochemical analysis
- Statistical analysis
- Quality control

**Learning Support:**
- Reaction mechanisms with step-by-step explanations
- 3D molecular visualization
- Laboratory techniques and safety
- Problem-solving strategies
- Real-world applications

What chemistry topic are you exploring? I'll make complex molecular concepts crystal clear!`
    },

    // PROGRAMMING KNOWLEDGE
    programming: {
        keywords: ['programming', 'coding', 'python', 'java', 'c++', 'javascript', 'web development', 'software engineering', 'data structures', 'algorithms'],
        response: () => `Welcome to the world of programming! I'm your expert coding mentor 💻

**Comprehensive Programming Knowledge:**

🐍 **Python**:
- Basic syntax and data structures
- Object-oriented programming
- Libraries: NumPy, Pandas, Matplotlib, TensorFlow
- Web development with Django/Flask
- Data science and machine learning

☕ **Java**:
- Core Java and OOP concepts
- Spring framework
- Android development
- Enterprise applications
- Multithreading and concurrency

🔧 **C++**:
- Memory management and pointers
- STL and data structures
- System programming
- Game development
- Competitive programming

🌐 **Web Development**:
- HTML5, CSS3, JavaScript (ES6+)
- React, Angular, Vue.js
- Node.js and Express
- Database integration (SQL/NoSQL)
- RESTful APIs and microservices

📊 **Data Structures & Algorithms**:
- Arrays, linked lists, stacks, queues
- Trees, graphs, heaps
- Sorting and searching algorithms
- Dynamic programming
- Greedy algorithms and divide-and-conquer

🔧 **Software Engineering**:
- Design patterns and architecture
- Version control (Git)
- Testing and debugging
- Agile methodologies
- DevOps and CI/CD

**My Teaching Method:**
- Live coding examples
- Step-by-step problem solving
- Best practices and code optimization
- Project-based learning
- Interview preparation

What programming language or concept would you like to master? I'll provide comprehensive guidance!`
    },

    // ENGINEERING SUBJECTS
    engineering: {
        keywords: ['engineering', 'computer science', 'electrical', 'mechanical', 'civil', 'electronics', 'communication'],
        response: () => `Engineering excellence starts here! I'm your comprehensive engineering tutor 🏗️

**All Engineering Disciplines:**

💻 **Computer Science & Engineering**:
- Data structures and algorithms
- Operating systems and computer networks
- Database management systems
- Software engineering principles
- AI and machine learning
- Cybersecurity

⚡ **Electrical & Electronics Engineering**:
- Circuit analysis and design
- Digital electronics and logic gates
- Power systems and machines
- Control systems
- Signal processing
- VLSI design

🔧 **Mechanical Engineering**:
- Thermodynamics and fluid mechanics
- Strength of materials
- Machine design and CAD
- Manufacturing processes
- Robotics and automation
- Automotive engineering

🏗️ **Civil Engineering**:
- Structural analysis and design
- Transportation engineering
- Geotechnical engineering
- Environmental engineering
- Construction management
- Surveying and GIS

📡 **Electronics & Communication**:
- Analog and digital communication
- Microwave engineering
- Antenna and wave propagation
- Digital signal processing
- Embedded systems
- IoT and wireless communication

**Engineering Support:**
- Mathematical modeling and analysis
- Simulation and design tools
- Laboratory experiments
- Project guidance
- Industry applications
- Exam preparation (GATE, etc.)

Which engineering field and specific topic are you working on? I'll provide detailed technical explanations!`
    },

    // LEETCODE & ALGORITHMS
    leetcode: {
        keywords: ['leetcode', 'algorithm', 'data structure', 'coding interview', 'programming problem', 'solve problem', 'two sum', 'palindrome', 'roman to integer', 'add two numbers', 'longest substring', 'reverse integer', 'string to integer', 'valid parentheses', 'merge two lists', 'remove duplicates', 'climbing stairs', 'best time to buy', 'maximum subarray', 'house robber', 'binary tree', 'linked list', 'stack', 'queue', 'hash map', 'dynamic programming', 'dp', 'binary search', 'sorting', 'graph', 'dfs', 'bfs', 'time complexity', 'space complexity', 'big o', 'o(n)', 'o(log n)', 'optimize', 'efficient', 'optimal solution', 'brute force', 'interview', 'technical', 'coding test', 'programming test'],
        response: () => `Master LeetCode and algorithms with expert guidance! 🚀

**Comprehensive LeetCode Coverage:**

� **Easy Problems (10+ problems):**
- Two Sum, Palindrome Number, Roman to Integer
- Longest Common Prefix, Valid Parentheses
- Merge Two Sorted Lists, Remove Duplicates
- Search Insert Position, and more!

🎯 **Medium Problems (8+ problems):**
- Two Sum II, Add Two Numbers, Longest Substring
- Median of Two Arrays, Longest Palindromic Substring
- Zigzag Conversion, Reverse Integer, and more!

🔧 **Algorithm Mastery:**
- **Binary Search**: O(log n) efficient searching
- **Two Pointers**: O(n) array problem solving
- **Sliding Window**: Subarray optimization
- **Dynamic Programming**: Overlapping subproblems
- **DFS/BFS**: Graph traversal techniques
- **Quick Sort**: Efficient sorting algorithm

**What I can help you with:**
• Step-by-step problem solutions
• Multiple approaches (brute force → optimal)
• Time and space complexity analysis
• Code in Python, Java, C++, JavaScript
• Algorithm explanations with real examples
• Interview preparation strategies

**Ask me about:**
- Specific LeetCode problems by name or number
- Algorithm concepts and techniques
- Code optimization and best practices
- Interview questions and patterns

Ready to tackle any coding challenge! What problem would you like to solve?`
    },

    // ARTIFICIAL INTELLIGENCE
    ai: {
        keywords: ['artificial intelligence', 'machine learning', 'deep learning', 'neural networks', 'data science', 'ai', 'ml'],
        response: () => `Dive into the fascinating world of AI and Machine Learning! 🤖

**Complete AI & ML Coverage:**

🧠 **Machine Learning Fundamentals**:
- Supervised, Unsupervised, Reinforcement Learning
- Regression, Classification, Clustering
- Feature Engineering and Selection
- Model Evaluation and Validation
- Cross-validation and Hyperparameter Tuning

🔗 **Deep Learning**:
- Neural Networks and Backpropagation
- Convolutional Neural Networks (CNNs)
- Recurrent Neural Networks (RNNs, LSTMs)
- Transformer Models and Attention
- Transfer Learning and Fine-tuning

📊 **Data Science**:
- Data Collection and Cleaning
- Exploratory Data Analysis
- Statistical Analysis and Visualization
- Big Data Technologies
- Data Warehousing and ETL

🛠️ **Tools and Frameworks**:
- Python: NumPy, Pandas, Scikit-learn
- Deep Learning: TensorFlow, PyTorch, Keras
- Big Data: Apache Spark, Hadoop
- Visualization: Matplotlib, Seaborn, Plotly

🎯 **Advanced Topics**:
- Natural Language Processing (NLP)
- Computer Vision and Image Processing
- Reinforcement Learning and Q-Learning
- Generative AI and GPT Models
- MLOps and Model Deployment

**Practical Applications:**
- Real-world project guidance
- Model deployment strategies
- Ethics in AI
- Industry case studies
- Research paper analysis

What AI concept or application interests you most? I'll provide comprehensive explanations and practical guidance!`
    },

    communication_skills: {
        keywords: ['how to talk', 'communication', 'social skills', 'make friends', 'connect with people', 'conversation'],
        response: () => `Oh, this is such a good topic! Communication is like, super important but nobody really teaches us how to do it well, you know? 😊

Here's what I've learned about good conversations:

**🎯 Be Genuinely Curious**
Instead of thinking "what should I say next?" try thinking "I wonder what they mean by that?" People can totally tell when you're actually interested vs just waiting for your turn to talk.

**👂 Listen Like You Mean It**
Like, REALLY listen. Not just waiting to respond. Sometimes the most powerful thing you can say is just "tell me more about that."

**💬 Ask Open Questions**
Instead of "Did you have a good day?" try "What was the best part of your day?" It invites actual stories instead of yes/no answers.

**😊 Be Real**
Authenticity is magnetic. It's okay to say "I don't know" or "I'm not sure." People connect with realness, not perfection.

Want to practice? We could totally work on specific scenarios! What kind of conversations do you find challenging? 🌟`
    },

    chatgpt_direct: {
        keywords: ['chatgpt', 'direct chat', 'ai chat', 'talk to ai', 'chat with gpt', 'openai chat'],
        response: () => `Access Direct ChatGPT! 🤖

Connect directly with ChatGPT for instant AI-powered assistance:

💬 **Direct ChatGPT Features:**
- Real-time ChatGPT responses powered by OpenAI
- Natural conversation with context awareness
- Academic support and learning assistance
- Personalized responses based on your profile
- Conversation history and session management

🎯 **What You Can Ask:**
- Study help and concept explanations
- Assignment guidance and problem-solving
- Career advice and interview preparation
- Personal development and skill building
- Research assistance and project ideas

🔗 **How to Use:**
- Click the ChatGPT tab in your dashboard
- Start typing your question
- Get instant responses from ChatGPT
- Continue the conversation naturally
- Access your chat history anytime

📊 **Chat Features:**
- Session management with conversation history
- Context-aware responses with your student profile
- Usage statistics and activity tracking
- Privacy-protected conversations
- Multiple chat sessions support

Ready to chat with ChatGPT? {{NAVIGATE: chatgpt}}

*Note: Requires OpenAI API key configuration for full functionality*`
    },

    default: {
        response: (userMessage) => `That's an interesting question! 🤔

I have comprehensive knowledge across all academic subjects and can help you with virtually any topic. Here's how I can assist:

**📚 Academic Subjects:**
- Mathematics (Calculus, Algebra, Statistics, etc.)
- Physics, Chemistry, Biology
- Engineering (CSE, ECE, Mechanical, Civil)
- Computer Science and Programming
- AI/ML (Machine Learning, Deep Learning, Data Science)

**💻 Technical Skills:**
- Programming in multiple languages
- Algorithm and data structure mastery
- LeetCode problem solving
- Software engineering best practices
- Interview preparation strategies

**🎯 Learning Support:**
- Concept explanations with examples
- Step-by-step problem solving
- Exam preparation strategies
- Project guidance
- Career development

Could you tell me more about what you're trying to learn? Whether it's a specific subject, programming concept, algorithm, or any academic topic, I'm here to help you master it! {{NAVIGATE: overview}}`
    }
};
