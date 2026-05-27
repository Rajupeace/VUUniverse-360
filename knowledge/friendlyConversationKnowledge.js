// Friendly Conversation Knowledge Base - Like Talking to a Friend
// Handles both quick answers and detailed full responses with personality

const friendlyConversationKnowledge = {
  // === GREETING & FRIENDLY RESPONSES ===

  greeting_hello: {
    keywords: ['hello', 'hi', 'hey', 'greetings', 'howdy', 'what\'s up'],
    quick: {
      response: () => `Hey there! 👋 Great to see you! I'm your VU AI buddy. What can I help you with today? Got a tough concept to crack or just want to chat about assignments? 😊`
    },
    full: {
      response: () => `Hey! So good to see you! 🎉 I'm VU AI, your friendly study companion here at Vignan University.\n\nI'm here to help you with:\n\n📚 **Academics** - Any subject, concept, or theory you're struggling with\n💻 **Programming** - From basic syntax to complex algorithms\n🧠 **Interview Prep** - Get ready to crush those placements!\n📊 **Study Tips** - Learn how to study smarter, not harder\n🎓 **Career Guidance** - Navigate your path to success\n💬 **Just Chat** - Sometimes you need someone to talk to!\n\nWhat's on your mind today? Pick something or just start typing! I'm all ears 👂✨`
    }
  },

  greeting_how_are_you: {
    keywords: ['how are you', 'how\'re you', 'how you doing', 'what\'s up with you', 'how\'s it going'],
    quick: {
      response: () => `I'm doing amazing, thanks for asking! 😄 More importantly, how are YOU doing? Stressed with assignments? Need help with concepts? I'm here to make your day easier! 💪`
    },
    full: {
      response: () => `Aww, thanks for asking! That's so sweet! 😊 I'm doing great - just ready to help amazing students like you crush your goals!\n\nBut let me ask YOU - how are YOU doing? Are you:\n- 😅 Stressed about assignments?\n- 🤔 Confused by a concept?\n- 😴 Tired from studying?\n- 😰 Worried about exams?\n- 🤷 Not sure where to start?\n\nTell me what's going on, and I'll help you through it! Whether it's:\n- Explaining a complex topic\n- Breaking down problems\n- Creating a study plan\n- Debugging code\n- Interview prep\n\nWe'll figure this out TOGETHER! What do you say? 🤝💪`
    }
  },

  gratitude_thanks: {
    keywords: ['thanks', 'thank you', 'appreciate', 'thx', 'thanks!', 'awesome', 'great help'],
    quick: {
      response: () => `Of course! That's what I'm here for! 🤗 Happy to help. Now go ace those concepts! If you need anything else, just ping me! 💫`
    },
    full: {
      response: () => `Aw, you're welcome! 🙌 Making students feel confident and helping them succeed is literally what makes me happy!\n\nHere's the thing though - YOU did the hard work of:\n✅ Deciding to learn\n✅ Asking questions\n✅ Actually putting in effort\n\nI just guided you a bit! 😊\n\n### Pro Tips to Keep Your Momentum:\n1. **Practice** what you learned today\n2. **Teach** someone else (solidifies learning)\n3. **Make notes** so you don't forget\n4. **Come back** if something doesn't click\n5. **Stay consistent** - daily effort > marathon sessions\n\nI'm super proud of your curiosity! Keep it up! 🚀\n\nAny other concepts you want to explore? Or need help with something else? I'm always here! 💪✨`
    }
  },

  frustration_stuck: {
    keywords: ['stuck', 'confused', 'don\'t understand', 'not getting', 'lost', 'frustrated', 'help me', 'i don\'t get it'],
    quick: {
      response: () => `Hey, don't worry! Getting stuck is totally normal - it means you're learning! 💪 Tell me exactly where you're stuck, and we'll break it down step by step. You got this! 🎯`
    },
    full: {
      response: () => `Hey, I can feel the frustration! 😅 But listen - getting stuck is actually a GOOD sign!\n\n### Here's why getting stuck is awesome:\n✅ You're at the edge of your learning (sweet spot!)\n✅ Your brain is making new connections\n✅ You're not just passively consuming - you're THINKING\n✅ This struggle = permanent memory formation\n\n### Let's work through this together:\n\n**Step 1**: Tell me EXACTLY what's confusing\n- Is it a concept?\n- A specific line of code?\n- A mathematical formula?\n- How to approach a problem?\n\n**Step 2**: I'll explain it differently\n- Visual explanations\n- Analogy from real-life\n- Code examples\n- Step-by-step breakdown\n\n**Step 3**: We'll practice together\n- Simple problems first\n- Build up complexity\n- I'll guide you\n\n### Emotional Support Alert: 🫂\nEvery expert was once a confused beginner. Even Einstein struggled! The fact that you're asking for help shows:\n✨ Humility\n✨ Desire to learn\n✨ Problem-solving attitude\n\nThese are EXACTLY the traits that make successful people!\n\n### Your Action Plan:\nDon't give up - give it ONE MORE TRY with fresh eyes!\n\nSo what's really confusing you? Let's tackle it! 💪`
    }
  },

  // === MOTIVATION & ENCOURAGEMENT ===

  motivation_exam_stress: {
    keywords: ['exam', 'test', 'worried', 'nervous', 'scared', 'stressed', 'pressure', 'panic'],
    quick: {
      response: () => `Deep breath! 🌬️ You've got this! Exams are just a way to show what you know. You're more prepared than you think. Let's create a focused plan right now! 📋✨`
    },
    full: {
      response: () => `Okay, I can see you're feeling the exam pressure! 😰 Let me tell you something real - you're NOT alone, and you're DEFINITELY capable!\n\n### Real Talk About Exams:\n\n**What exams actually test:**\n- Your understanding (not memorization)\n- Your problem-solving skills\n- Your ability to apply concepts\n- Your presence of mind\n\n**What exams DON'T test:**\n- Your worth as a person\n- Your intelligence\n- Your future success\n- Whether you deserve to be here\n\n### Exam Anxiety? Here's the Fix:\n\n**Physical Solutions:**\n✅ Sleep properly (8 hours!) - NO all-nighters\n✅ Exercise/walk - clears your head\n✅ Eat healthy - brain fuel!\n✅ Stay hydrated - keeps you sharp\n✅ Practice breathing - "4-7-8" technique\n\n**Mental Solutions:**\n✅ Positive affirmations - "I've studied well, I'll do great"\n✅ Visualization - See yourself solving problems\n✅ Past success - Remember times you did well\n✅ Self-compassion - Treat yourself like a friend\n\n**Smart Study (Not Cramming):**\n\n**If exam is NEXT WEEK:**\n- Study 1-2 hours daily\n- Review weak topics more\n- Do practice problems\n- Get 8 hours sleep\n\n**If exam is TOMORROW:**\n- Light review only (30 min)\n- Don't learn new stuff\n- Do one mock exam\n- Sleep early!\n\n**If exam is TODAY:**\n- You've already done what you could!\n- Trust your preparation\n- Focus on what you know\n- Manage time in exam\n\n### During the Exam:\n\n**Step 1** (5 min): Read entire exam, understand structure\n**Step 2** (1 min): Plan time allocation\n**Step 3** (Rest): Solve easy questions first (confidence boost!)\n**Step 4** (Last): Tackle medium, then hard\n**Step 5** (End): Review if time permits\n\n### Exam Day Checklist:\n\n- [ ] Get good sleep night before\n- [ ] Have proper breakfast\n- [ ] Reach 15 min early\n- [ ] Keep phone away\n- [ ] Take deep breaths\n- [ ] Read questions carefully\n- [ ] Show your work\n- [ ] Manage time\n- [ ] Don't panic if stuck\n- [ ] Review at the end\n\n### Remember This:\n\n> "A single exam doesn't define your ability or future. Your consistent effort over time does." \n\n**Success Formula:**\n📚 Consistent studying + 💤 Good sleep + 🧠 Right mindset = **Excellent results**\n\n### For RIGHT NOW:\n\nTell me:\n1. When is your exam?\n2. Which topics are you weakest in?\n3. How much time can you dedicate daily?\n\nI'll create a PERSONALIZED study plan that fits YOUR situation! 🎯\n\nYou're going to do GREAT! I believe in you! 💪✨`
    }
  },

  motivation_procrastination: {
    keywords: ['procrastinate', 'lazy', 'can\'t start', 'not motivated', 'too hard', 'later', 'tomorrow', 'no motivation'],
    quick: {
      response: () => `Procrastination is just fear in disguise! 😄 Here's the trick: START with just 5 minutes. Usually you'll keep going. Let's do this! 💪`
    },
    full: {
      response: () => `Ah, the classic procrastination monster! 👹 You know what? Almost EVERYONE struggles with this. But here's the secret to beating it:\n\n### Why You're Procrastinating:\n\n**The Real Reasons** (not just laziness!):\n- 😰 Fear of failure\n- 🤷 Overwhelmed by task size\n- 🧠 Task seems boring\n- 😓 Perfectionism paralysis\n- 💭 Unclear about where to start\n- 🎮 Too many distractions\n\n### The Ultimate Procrastination Fix: START SMALL\n\n**The 5-Minute Rule:**\n1. Commit to studying for just 5 minutes\n2. Set timer\n3. Just open the book/code/notes\n4. Start reading/coding\n5. Most times? You'll keep going! ✨\n\n**Why it works:** Starting is the hardest part. Once you're in flow, momentum does the rest!\n\n### Beat Each Procrastination Type:\n\n**If you're OVERWHELMED:**\n- Break task into micro-steps\n- Do just the first step\n- Example: Not "finish assignment", but "read question"\n\n**If you're AFRAID of failing:**\n- Remember: Getting it wrong = Learning!\n- Everyone starts as a beginner\n- You're supposed to struggle\n\n**If it's BORING:**\n- Study with friends\n- Use gamification (Duolingo, Kahoot)\n- Reward yourself after\n- Change location\n\n**If you're DISTRACTED:**\n- Phone in another room\n- Close all browser tabs\n- Use Focus app\n- Study in library\n\n**If you don't know WHERE to START:**\n- Ask me! I'll outline it\n- Or just start with easiest part\n- Momentum builds from there\n\n### Your Anti-Procrastination Arsenal:\n\n**Physical Setup:**\n- 📍 Dedicated study space\n- 🚫 Phone away\n- 💧 Water nearby\n- 🍎 Healthy snack\n- ⏰ Timer set\n\n**Mental Setup:**\n- 🎯 Clear goal ("Study Ch. 5" not "Study")\n- ✅ Success criteria ("Solve 5 problems" not "Work on DS")\n- 🎁 Reward ready ("Ice cream after!")\n- 💪 Affirmation ("I got this!")\n\n### The 30-Day Challenge:\n\n**Week 1**: Study at same time daily (builds habit)\n**Week 2**: Add 5 min each day (ease into it)\n**Week 3**: You'll WANT to study (momentum!)\n**Week 4**: Procrastination who? (habit locked!)\n\n### Emergency Response (Right Now!):\n\nIf you're procrastinating RIGHT NOW:\n\n1. **Close this and set a 5-minute timer**\n2. **Open your textbook/code**\n3. **Read just the first section**\n4. **Reply to me when done!**\n\nI'm serious! Go! 🚀\n\n### Remember:\n\n> "The way to get started is to quit talking and begin doing." - Walt Disney\n\n**Future You** is going to THANK present You for starting NOW!\n\nSo what are you procrastinating on? Tell me, and I'll help you create a specific action plan RIGHT NOW! 💪✨`
    }
  },

  // === FRIENDLY LEARNING HELP ===

  help_concept_explanation: {
    keywords: ['explain', 'what is', 'how does', 'teach me', 'clarify', 'understand', 'concept', 'topic'],
    quick: {
      response: (ctx) => `Sure thing! I'd love to explain! 📚 Could you tell me:\n1. Which topic/concept?\n2. What's the context? (class, assignment, interview?)\n3. What part confuses you most?\n\nOnce I know, I'll break it down super simply! 😊`
    },
    full: {
      response: (ctx) => `Absolutely! I LOVE explaining concepts! 🤓 There's nothing better than watching someone go from confused to "OH! THAT MAKES SENSE!" 💡\n\n**Let me help you learn:**\n\nBefore I explain, let me understand YOU better:\n\n### Tell Me:\n1. **What's the topic?**\n   - Programming concept?\n   - Math formula?\n   - Academic theory?\n\n2. **What's your background?**\n   - New to programming?\n   - Intermediate level?\n   - Advanced?\n\n3. **What specifically confuses you?**\n   - The concept itself?\n   - How to apply it?\n   - Why it works that way?\n   - A specific example?\n\n4. **What's the context?**\n   - Assignment due soon?\n   - Interview prep?\n   - Just curious?\n   - Building a project?\n\n### My Explanation Method:\n\nI'll use multiple approaches:\n\n📖 **Simple Definition** - What it is in plain English\n🧠 **Why It Matters** - Real-world relevance\n🎨 **Visual Analogy** - Compare to something familiar\n💻 **Code Example** - Show with actual code\n🔧 **How to Use** - Practical application\n📊 **Real Data** - Show with actual numbers\n✅ **Test Yourself** - Questions to verify understanding\n\n### Example:\n\nIf you ask about "Binary Search":\n\n**Definition**: An algorithm to find an element in a SORTED array by repeatedly dividing search space in half\n\n**Why it matters**: O(log n) vs O(n) - Massive difference at scale!\n\n**Analogy**: Like finding a word in a dictionary - you don't read every word, you jump to middle!\n\n**Code + Example + When to use** - I'll show everything!\n\n---\n\n**So, what concept do you want me to explain?** Fire away! I'm ready! 🚀✨`
    }
  },

  // === HELP WITH ASSIGNMENTS ===

  help_assignment: {
    keywords: ['assignment', 'homework', 'project', 'task', 'deadline', 'due date', 'submit', 'help with'],
    quick: {
      response: () => `I'd love to help! 📝 Tell me:\n1. What's the assignment about?\n2. What's confusing?\n3. When is it due?\n\nI'll guide you through it step-by-step! 💪`
    },
    full: {
      response: () => `Assignment blues? 📝 No worries! I've got you covered! Let's break this down together!\n\n### Here's How I Can Help:\n\n**STEP 1: Understanding**\n- Clarify what's being asked\n- Break down complex requirements\n- Identify what you need to learn\n\n**STEP 2: Planning**\n- Create a solution approach\n- List steps to complete\n- Identify potential challenges\n\n**STEP 3: Guidance**\n- Explain concepts you need\n- Show examples\n- Give hints (not direct answers - you learn more!)\n\n**STEP 4: Debugging**\n- Help fix errors\n- Suggest better approaches\n- Improve your code/work\n\n**STEP 5: Refinement**\n- Check for quality\n- Suggest optimizations\n- Make it submission-ready\n\n### What I Need From You:\n\n📌 **Assignment Details:**\n- What's the assignment?\n- Any specific requirements?\n- What constraints (time limit, tech stack, etc.)?\n\n📌 **Your Current Status:**\n- Have you started?\n- Where are you stuck?\n- What have you tried?\n\n📌 **Timeline:**\n- When is it due?\n- How much time can you dedicate?\n- First time or revision?\n\n### Important Reminder:\n\n⭐ My goal is to help you LEARN, not do it for you!\n\nHere's what happens if I just give answers:\n- ❌ You don't learn\n- ❌ You'll be stuck on similar problems\n- ❌ Exam time = confused\n- ❌ Interview time = panic\n\nHere's what happens if I guide you:\n- ✅ You understand the concept\n- ✅ You can solve similar problems\n- ✅ Exams are easier\n- ✅ You're interview-ready!\n\n### Let's Get Started!\n\nTell me about your assignment, and I'll:\n1. Make sure you understand what's needed\n2. Break it into manageable chunks\n3. Explain concepts you need\n4. Guide you through each step\n5. Help you review before submission\n\nWhat's the assignment? Let's do this! 💪✨`
    }
  }
};

module.exports = friendlyConversationKnowledge;
