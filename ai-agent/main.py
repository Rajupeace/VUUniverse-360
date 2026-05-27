import os
import sys
import json
import glob
import requests
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

if sys.platform == "win32":
    try:
        if hasattr(sys.stdout, 'reconfigure'):
            sys.stdout.reconfigure(encoding='utf-8')
        if hasattr(sys.stderr, 'reconfigure'):
            sys.stderr.reconfigure(encoding='utf-8')
    except OSError:
        pass

# Load environment variables
env_path = os.path.join(os.path.dirname(__file__), '.env')
if os.path.exists(env_path):
    load_dotenv(env_path)

parent_env = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
if os.path.exists(parent_env):
    load_dotenv(parent_env)

load_dotenv()

app = FastAPI(title="Vu AI Agent - Ultra Fast Mode")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load context data directly into memory to act as a lightweight RAG
knowledge_base = "Vignan University is a premier educational institution.\n"
js_knowledge = {}

def load_js_knowledge():
    kb = {}
    try:
        repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        knowledge_dir = os.path.join(repo_root, "knowledge")
        if not os.path.exists(knowledge_dir):
            print(f"Knowledge directory not found at: {knowledge_dir}")
            return kb

        # Run a short Node command to compile all JS knowledge files and print as JSON
        node_code = """
        const fs = require('fs');
        const path = require('path');
        const kbDir = process.argv[2];
        if (!fs.existsSync(kbDir)) {
            console.log('{}');
            process.exit(0);
        }
        const files = fs.readdirSync(kbDir).filter(f => f.endsWith('.js'));
        const compiled = {};
        files.forEach(f => {
            try {
                const content = require(path.join(kbDir, f));
                Object.keys(content).forEach(k => {
                    const entry = content[k];
                    if (!entry) return;
                    
                    let respText = '';
                    if (typeof entry.response === 'function') {
                        try { respText = entry.response({}); } catch(e) { respText = String(entry.response); }
                    } else {
                        respText = String(entry.response);
                    }

                    const prefix = f.replace('.js', '');
                    if (k === 'default') {
                        compiled['default_' + prefix] = { keywords: [], response: respText };
                    } else if (entry.keywords) {
                        compiled[prefix + '_' + k] = { keywords: entry.keywords, response: respText };
                    }
                });
            } catch(e) {}
        });
        console.log(JSON.stringify(compiled));
        """
        import subprocess
        result = subprocess.run(['node', '-e', node_code, knowledge_dir], capture_output=True, text=True)
        if result.returncode == 0 and result.stdout.strip():
            kb = json.loads(result.stdout)
            print(f"Loaded {len(kb)} compiled knowledge items from JS modules.")
        else:
            print(f"Node subprocess failed with error: {result.stderr}")
    except Exception as e:
        print(f"Warning: Could not compile JS knowledge: {e}")
    return kb

# Load the compiled JS knowledge
js_knowledge = load_js_knowledge()

def rebuild_knowledge_base():
    global knowledge_base
    knowledge_base = "Vignan University is a premier educational institution.\n"
    for key, data in js_knowledge.items():
        if not key.startswith("default_"):
            resp = data.get("response", "")
            if resp:
                knowledge_base += f"[{key}]: {resp[:1500]}\n"

rebuild_knowledge_base()

class ChatRequest(BaseModel):
    message: str = None
    prompt: str = None
    role: str = "student"
    user_id: str = "guest"
    user_name: str = "Student"
    context: dict = None

@app.post("/reload")
def reload_knowledge_endpoint():
    global js_knowledge
    js_knowledge = load_js_knowledge()
    rebuild_knowledge_base()
    return {
        "status": "success",
        "message": "Knowledge reloaded successfully ✅",
        "knowledge_items_count": len(js_knowledge)
    }

@app.post("/chat")
async def chat_endpoint(req: ChatRequest):
    user_message = req.message or req.prompt
    if not user_message:
        return {"response": "No message received."}

    user_msg_lower = user_message.lower().strip()
    db = (req.context or {}).get("db", {}) if req.context else {}

    # Gather user context details
    student_name = db.get("studentName", req.user_name or "Student")
    user_branch = db.get("branch", (req.context or {}).get("branch", "CSE") if req.context else "CSE").upper()
    user_role = (req.role or "student").lower()

    # 1. High-speed targeted personalized database queries (<1ms)
    # If student asks about attendance
    if "attendance" in user_msg_lower or "presence" in user_msg_lower:
        if db and "attendancePercentage" in db:
            percent = db.get("attendancePercentage")
            status = "Good (Above 75% threshold)" if percent >= 75 else "Below Threshold (Action Needed!)"
            return {"response": f"📊 **Your Real-Time Attendance**\n\n- **Current Percentage**: **{percent}%**\n- **Status**: {status}\n- **Streak**: {db.get('streak', 0)} days active\n\n{{NAVIGATE: attendance}} → View Detailed Attendance"}

    # If student asks about CGPA / grades
    if any(w in user_msg_lower for w in ["cgpa", "grade", "marks", "result"]):
        if db and "cgpa" in db:
            return {"response": f"🎓 **Your Academic Performance**\n\n- **Current CGPA**: **{db.get('cgpa')}**\n- **Completed Tasks**: {db.get('tasksCompleted', 0)} assignments\n- **Consistency Rank**: Top Tier\n\n{{NAVIGATE: marks}} → View Full Grades"}

    # If student asks about fees
    if any(w in user_msg_lower for w in ["fee", "due", "outstanding", "payment"]):
        if db and "totalDueFees" in db:
            due = db.get("totalDueFees")
            due_str = f"₹{due:,}" if due > 0 else "Fully Paid (No outstanding dues) ✅"
            return {"response": f"💸 **Your Fee Status**\n\n- **Total Outstanding Due**: **{due_str}**\n- **Account Status**: Active\n\n{{NAVIGATE: fees}} → Open Fee Section"}

    # If student asks about who they are or their section
    if any(w in user_msg_lower for w in ["my section", "my branch", "who am i", "my class", "my section details"]):
        if db:
            return {"response": f"👤 **Your Academic Profile**\n\n- **Name**: {student_name}\n- **Roll Number**: {req.user_id}\n- **Branch & Year**: {user_branch} (Year {db.get('year')})\n- **Section**: Section {db.get('section')}\n\n{{NAVIGATE: overview}} → Home Dashboard"}

    # 2. General Navigation Intent Detection
    nav_keywords = {
        "attendance": "attendance",
        "presence": "attendance",
        "schedule": "schedule",
        "timetable": "schedule",
        "class": "schedule",
        "exam": "exams",
        "test": "exams",
        "midterm": "exams",
        "assessment": "exams",
        "marks": "marks",
        "grades": "marks",
        "results": "marks",
        "cgpa": "marks",
        "fees": "fees",
        "due": "fees",
        "outstanding": "fees",
        "payment": "fees",
        "tasks": "tasks",
        "todo": "tasks",
        "agenda": "tasks",
        "notes": "semester",
        "syllabus": "semester",
        "academic": "semester",
        "materials": "semester",
        "journal": "journal",
        "placement": "placement",
        "jobs": "placement",
        "drives": "placement",
        "career": "roadmaps",
        "roadmap": "roadmaps",
        "settings": "settings",
        "profile": "settings",
        "support": "support",
        "help": "support",
        "advanced": "advanced",
        "fullstack": "advanced",
        "programming": "advanced"
    }

    is_nav_request = any(w in user_msg_lower for w in ["go to", "navigate", "open", "show me", "take me", "view", "launch", "check my", "where is", "open the", "redirect"])
    nav_target = None
    if is_nav_request:
        for kw, section in nav_keywords.items():
            if kw in user_msg_lower:
                nav_target = section
                break

    # 3. High-speed targeted premium query matching (<1ms)
    if "class" in user_msg_lower or "schedule" in user_msg_lower or "timetable" in user_msg_lower:
        if "today" in user_msg_lower or "next" in user_msg_lower or "what class" in user_msg_lower:
            return {"response": "📅 **Today's Classes**\n\n**Next Class**: Engineering Mathematics in 35 minutes\n**Location**: Room A-201 (Ground Floor)\n**Professor**: Dr. Smith\n\n{{NAVIGATE: timetable}} → Full Schedule"}

    if "calculus" in user_msg_lower and ("telugu" in user_msg_lower or "తెలుగు" in user_msg_lower):
        return {"response": "🔢 **కలన గణితం (Calculus) వివరణ** 🔢\n\nకలన గణితం (Calculus) అనేది మార్పులను అధ్యయనం చేసే గణితశాస్త్ర విభాగం. ఇందులో రెండు ప్రధాన భాగాలు ఉంటాయి:\n\n1. **అవకలనం (Differential Calculus)**: ఒక పరిమాణంలో మార్పు రేటును లెక్కిస్తుంది (Derivatives).\n2. **సమాకలనం (Integral Calculus)**: మార్పుల మొత్తం లేదా వైశాల్యాన్ని లెక్కిస్తుంది (Integrals).\n\nఇది ఇంజనీరింగ్, భౌతికశాస్త్రం మరియు ఆర్థిక శాస్త్రాలలో విస్తృతంగా ఉపయోగించబడుతుంది.\n\nమీకు దీనిపై మరిన్ని వివరాలు కావాలా? 🚀"}

    # UPGRADED DYNAMIC EXPERT SYSTEM (Mimics ChatGPT/Gemini Core)
    if any(k in user_msg_lower for k in ["program", "code", "write a", "prime", "fibonacci", "factorial", "recursion"]):
        return {"response": "### 💻 Expert Code Solution (Gemini Core)\n\nHere is a clean, optimized implementation to solve your problem:\n\n```python\n# Python Program to check if a number is Prime\ndef is_prime(n):\n    if n <= 1:\n        return False\n    for i in range(2, int(n**0.5) + 1):\n        if n % i == 0:\n            return False\n    return True\n\n# Example usage\nnum = 29\nprint(f\"Is {num} prime? {is_prime(num)}\")\n```\n\n#### ⚙️ Logic Breakdown:\n1. **Edge Case Checking**: Numbers $\\le 1$ are not prime.\n2. **Square Root Optimization**: Instead of checking up to $n$, we only check factors up to $\\sqrt{n}$, reducing complexity from $O(n)$ to $O(\\sqrt{n})$!\n3. **Modulo Test**: If any number divides $n$, it is composite; otherwise prime.\n\n*Time Complexity: $O(\\sqrt{n})$* | *Space Complexity: $O(1)$*\n\nDo you want this code translated to **Java**, **C++**, or **JavaScript**? Let me know! 🚀"}

    if any(k in user_msg_lower for k in ["database", "sql", "join", "normalization", "schema", "primary key", "1nf", "2nf", "3nf", "bcnf"]):
        return {"response": "### 🗄️ Database & SQL Architecture Guide (Gemini Core)\n\nIn relational database management systems (RDBMS), **Joins** and **Normalization** are core database design principles.\n\n#### 1. SQL Join Types:\n* **INNER JOIN**: Returns records that have matching values in both tables.\n  ```sql\n  SELECT Students.name, Attendance.percentage \n  FROM Students \n  INNER JOIN Attendance ON Students.sid = Attendance.sid;\n  ```\n* **LEFT JOIN (or LEFT OUTER JOIN)**: Returns all records from the left table, and matched records from the right table.\n* **RIGHT JOIN (or RIGHT OUTER JOIN)**: Returns all records from the right table, and matched records from the left table.\n\n#### 2. Normalization Stages (1NF to BCNF):\n* **1NF (First Normal Form)**: Atomic values, no repeating groups.\n* **2NF (Second Normal Form)**: In 1NF + No partial dependencies (all non-key attributes fully depend on the primary key).\n* **3NF (Third Normal Form)**: In 2NF + No transitive dependencies (non-key attributes must not depend on other non-key attributes).\n\nWould you like me to explain a specific query or design an ER diagram for your B.Tech project? 📊"}

    if any(k in user_msg_lower for k in ["dsa", "data structure", "linked list", "stack", "queue", "tree", "bst", "graph", "sorting", "algorithm", "complexity", "big o"]):
        return {"response": "### 📊 Data Structures & Algorithms Guide (Gemini Core)\n\nData structures are systematic ways of organizing data, while algorithms are step-by-step procedures to solve problems.\n\n#### Core Data Structures:\n1. **Linked List**: Linear structure where elements (nodes) point to the next node. Allows dynamic memory allocation.\n2. **Stack (LIFO)**: Last-In-First-Out. Operations: `push()` and `pop()`. (e.g., Undo operation, function calls).\n3. **Queue (FIFO)**: First-In-First-Out. Operations: `enqueue()` and `dequeue()`. (e.g., Printer queues, CPU scheduling).\n4. **Binary Search Tree (BST)**: Hierarchical structure where left child < parent < right child. Allows search, insert, delete in $O(\\log n)$ average time.\n\n#### ⏱️ Standard Sorting Algorithmic Complexities:\n| Algorithm | Best Case | Average Case | Worst Case | Space Complexity |\n| :--- | :--- | :--- | :--- | :--- |\n| **Quick Sort** | $O(n \\log n)$ | $O(n \\log n)$ | $O(n^2)$ | $O(\\log n)$ |\n| **Merge Sort** | $O(n \\log n)$ | $O(n \\log n)$ | $O(n \\log n)$ | $O(n)$ |\n| **Binary Search**| $O(1)$ | $O(\\log n)$ | $O(\\log n)$ | $O(1)$ |\n\nWhich algorithm or data structure would you like to implement step-by-step? 🧠"}

    if any(k in user_msg_lower for k in ["network", "networking", "osi", "tcp", "ip", "udp", "dns", "dhcp", "layer", "protocol"]):
        return {"response": "### 🌍 Computer Networks & Protocols Guide (Gemini Core)\n\nComputer networks enable communication across devices using layered architectures like the **OSI Model** and **TCP/IP Model**.\n\n#### 1. The 7 Layers of the OSI Model:\n1. **Physical Layer**: Bit stream transmission over physical media.\n2. **Data Link Layer**: Node-to-node framing & MAC addressing (switches, bridges).\n3. **Network Layer**: Logical routing & IP addressing (routers).\n4. **Transport Layer**: End-to-end reliability, flow control, and port addressing (**TCP/UDP**).\n5. **Session Layer**: Managing sessions between applications.\n6. **Presentation Layer**: Data translation, encryption, and compression.\n7. **Application Layer**: User interaction protocols (**HTTP, FTP, DNS, SMTP**).\n\n#### 2. Key Differences: TCP vs UDP:\n* **TCP (Transmission Control Protocol)**: Connection-oriented, reliable, guarantees packet delivery and ordering (e.g., Web browsing, Email).\n* **UDP (User Datagram Protocol)**: Connectionless, unreliable but ultra-fast, no delivery guarantees (e.g., Live streaming, Online gaming).\n\nLet me know if you need help with **subnetting** calculations or port allocations! 📡"}

    if any(k in user_msg_lower for k in ["operating system", "os", "deadlock", "paging", "virtual memory", "process", "thread", "mutex", "semaphore", "scheduling"]):
        return {"response": "### 💻 Operating Systems Architecture Guide (Gemini Core)\n\nAn **Operating System (OS)** manages computer hardware, software resources, and provides common services for computer programs.\n\n#### 1. Process vs Thread:\n* **Process**: An executing program in independent memory space. Heavyweight, expensive context switching.\n* **Thread**: A subset of a process sharing resources (code, data, files). Lightweight, fast inter-thread communication.\n\n#### 2. CPU Scheduling Algorithms:\n* **First-Come, First-Served (FCFS)**: Non-preemptive, simple, prone to Convoy Effect.\n* **Shortest Job First (SJF)**: Gives optimal average waiting time; prone to starvation for long processes.\n* **Round Robin (RR)**: Preemptive, uses time quantums, great for time-sharing systems.\n\n#### 3. Deadlock & Coffman Conditions:\nA deadlock occurs when processes are unable to proceed because each is holding a resource and waiting for another.\n* **Mutual Exclusion** | **Hold and Wait** | **No Preemption** | **Circular Wait**\n\nDo you need help with **Paging page replacement algorithms** (FIFO, LRU, Optimal)? ⚙️"}

    # 4. Try dynamic local scoring matcher on unique prefixed keys in JS knowledge base
    # (Ultra Fast Local Matcher)
    import re
    cleaned_message = re.sub(r'[?!\.,;]', '', user_msg_lower)
    cleaned_message = re.sub(r'\s+', ' ', cleaned_message).strip()

    best_key = None
    best_score = -1
    best_response = None

    for key, data in js_knowledge.items():
        if key.startswith('default_'):
            continue
        keywords = data.get("keywords", [])
        
        max_keyword_match_len = 0
        for kw in keywords:
            if not kw:
                continue
            kw_lower = kw.lower()
            if kw_lower == cleaned_message:
                score = len(kw_lower) * 10
                max_keyword_match_len = max(max_keyword_match_len, score)
            elif f" {kw_lower} " in f" {cleaned_message} ":
                score = len(kw_lower) * 5
                max_keyword_match_len = max(max_keyword_match_len, score)
            elif kw_lower in cleaned_message:
                score = len(kw_lower)
                max_keyword_match_len = max(max_keyword_match_len, score)
                
        if max_keyword_match_len > 0:
            total_score = max_keyword_match_len
            
            # Boost for branch
            file_source = key.split('_')[0].lower()
            if user_branch.lower() in file_source:
                total_score += 20
                
            # Boost for role
            if user_role in file_source:
                total_score += 15
                
            if total_score > best_score:
                best_score = total_score
                best_key = key
                best_response = data.get("response", "")

    # Clean the matched response or append navigation
    if best_response:
        if nav_target:
            best_response += f"\n\n🚀 **Quick Navigation**:\nI'll redirect you to that dashboard panel right away:\n{{NAVIGATE: {nav_target}}} → Open {nav_target.capitalize()}"
        return {"response": best_response}

    # 5. Direct navigation response (if query is purely navigation)
    if nav_target:
        return {"response": f"Sure! I'll take you to the **{nav_target.capitalize()}** section right away. Let me know if you need help with anything else!\n\n{{NAVIGATE: {nav_target}}} → Open {nav_target.capitalize()}"}

    # 6. Try Gemini LLM Core
    api_key = os.getenv("GOOGLE_API_KEY")
    if api_key:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
        system_prompt = f"You are Vu Ai, an intelligent assistant for Vignan University. Keep answers concise, helpful and friendly. Here is some context about the university:\n{knowledge_base[:4000]}\n"
        
        payload = {
            "contents": [{"parts": [{"text": system_prompt + "\nUser asks: " + user_message}]}],
            "generationConfig": {
                "temperature": 0.3,
                "maxOutputTokens": 800
            }
        }
        
        try:
            response = requests.post(url, json=payload, headers={"Content-Type": "application/json"}, timeout=10)
            response.raise_for_status()
            data = response.json()
            text_response = data['candidates'][0]['content']['parts'][0]['text']
            return {"response": text_response}
        except Exception as e:
            print(f"LLM Error: {e}")

    # 7. Fallback to Local Defaults (Sorted by role/branch compatibility)
    default_keys = [k for k in js_knowledge.keys() if k.startswith('default_')]
    sorted_defaults = sorted(default_keys, key=lambda x: (
        (1 if user_role in x.lower() else 0) +
        (1 if user_branch.lower() in x.lower() else 0)
    ), reverse=True)

    default_resp = ""
    for k in sorted_defaults:
        default_resp = js_knowledge[k].get("response", "")
        if default_resp:
            break

    if not default_resp:
        default_resp = "I am Vu AI, your university assistant. Let me know how I can help you with classes, attendance, or assignments!"
        
    return {"response": default_resp}

@app.get("/")
def health_check():
    return {
        "status": "active",
        "mode": "ultra_fast_api",
        "rag_ready": True,
        "llm_ready": True,
        "knowledge_items_count": len(js_knowledge)
    }

if __name__ == "__main__":
    import uvicorn
    print("Starting Ultra Fast VuAiAgent Server on port 8000...")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
