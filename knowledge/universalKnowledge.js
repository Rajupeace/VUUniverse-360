// Universal Multi-Language Knowledge Base for VUAI Agent
module.exports = {
    // UNIVERSAL LANGUAGE DETECTION AND RESPONSES
    universal_languages: {
        keywords: ['language', 'speak', 'talk', 'translate', 'multi-language', 'international', 'global'],
        response: (context) => {
            const languageMap = {
                'english': 'Hello! I can communicate in English and many other languages.',
                'hindi': 'नमस्ते! मैं हिंदी और कई अन्य भाषाओं में बात कर सकता हूँ।',
                'telugu': 'నమస్కారం! నేను తెలుగు మరియు ఇతర అనేక భాషలలో మాట్లాడగలను.',
                'tamil': 'வணக்கம்! நான் தமிழ் மற்றும் பல மொழிகளில் பேசலாம்.',
                'spanish': '¡Hola! Puedo comunicarme en español y muchos otros idiomas.',
                'french': 'Bonjour! Je peux communiquer en français et de nombreuses autres langues.',
                'german': 'Hallo! Ich kann in Deutsch und vielen anderen Sprachen kommunizieren.',
                'chinese': '你好！我可以用中文和许多其他语言交流。',
                'arabic': 'مرحبا! يمكنني التواصل باللغة العربية والعديد من اللغات الأخرى.',
                'japanese': 'こんにちは！私は日本語と多くの他の言語でコミュニケーションできます。'
            };

            const detectedLanguage = detectLanguage(context?.message || '');
            const response = languageMap[detectedLanguage] || languageMap['english'];

            return `${response}

## 🌍 **Universal Language Support**

I can communicate in **20+ languages** including:

### **🇮🇳 Indian Languages:**
- **Hindi** (हिंदी) - National language
- **Telugu** (తెలుగు) - Regional language
- **Tamil** (தமிழ்) - Regional language
- **Bengali** (বাংলা) - Regional language
- **Marathi** (मराठी) - Regional language
- **Gujarati** (ગુજરાતી) - Regional language
- **Kannada** (ಕನ್ನಡ) - Regional language
- **Malayalam** (മലയാളം) - Regional language
- **Punjabi** (ਪੰਜਾਬੀ) - Regional language

### **🌍 International Languages:**
- **English** - Global language
- **Spanish** (Español) - European/American
- **French** (Français) - European
- **German** (Deutsch) - European
- **Chinese** (中文) - Asian
- **Japanese** (日本語) - Asian
- **Arabic** (العربية) - Middle Eastern
- **Russian** (Русский) - European
- **Portuguese** (Português) - European/American

### **🎯 Role-Specific Language Support:**

**For Students:**
- Educational content in your preferred language
- Technical explanations in local languages
- Study materials with regional context

**For Faculty:**
- Academic communication in multiple languages
- Research collaboration across languages
- International student support

**For Admin:**
- System administration in preferred language
- Multi-language documentation
- Global team communication

## 💬 **How to Use:**

Simply type or speak in your preferred language, and I'll respond in the same language. I can also translate between languages if needed.

**Example:** Type in Hindi, Telugu, or any supported language!

Ready to communicate in your language? 🌟`;
        }
    },

    // STUDENT MULTI-LANGUAGE KNOWLEDGE
    student_multilanguage: {
        keywords: ['student language', 'study language', 'learn language', 'education language'],
        response: () => `🎓 **Student Multi-Language Support**

## 📚 **Study in Your Preferred Language**

### **🇮🇳 Indian Languages for Students:**

**Hindi (हिंदी):**
- सभी विषयों में हिंदी में सहायता
- इंजीनियरिंग, विज्ञान, गणित हिंदी में
- परीक्षा की तैयारी हिंदी में

**Telugu (తెలుగు):**
- అన్ని విషయాలలో తెలుగులో సహాయం
- ఇంజనీరింగ్, సైన్స్, గణితం తెలుగులో
- పరీక్షల సిద్ధి తెలుగులో

**Tamil (தமிழ்):**
- அனைத்த பாடங்களில் தமிழில் உதவி
- பொறியியல், அறிவியல், கணிதம் தமிழில்
- தேர்வு தயாரிப்பு தமிழில்

### **🌍 International Languages:**

**English:**
- Complete academic support in English
- Technical explanations in English
- International standard education

**Spanish (Español):**
- Soporte académico completo en español
- Explicaciones técnicas en español
- Educación de estándar internacional

**French (Français):**
- Soutien académique complet en français
- Explications techniques en français
- Éducation de norme internationale

### **📖 Subject-Specific Language Support:**

**Engineering (ఇంజనీరింగ్):**
- Electrical Engineering (విద్యుత్ ఇంజనీరింగ్)
- Computer Science (కంప్యూటర్ సైన్స్)
- Mechanical Engineering (మెకానికల్ ఇంజనీరింగ్)

**Science (విజ్ఞానం):**
- Physics (భౌతిక శాస్త్రం)
- Chemistry (రసాయన శాస్త్రం)
- Mathematics (గణితం)

**Mathematics (గణితం):**
- Algebra (బీజగణితం)
- Calculus (కలన శాస్త్రం)
- Statistics (సాంఖ్యా శాస్త్రం)

### **🎯 How to Study in Your Language:**

1. **Choose Your Language**: Tell me your preferred language
2. **Select Subject**: Pick any subject you want to study
3. **Ask Questions**: Get explanations in your language
4. **Practice Problems**: Solve problems with language support

### **💡 Language Learning Benefits:**

- **Better Understanding**: Learn complex concepts in your native language
- **Faster Learning**: Grasp concepts quickly in familiar language
- **Cultural Context**: Examples relevant to your culture
- **Confidence Boost**: Study comfortably in your language

## 🌟 **Start Learning in Your Language!**

Type "study [subject] in [language]" to begin!

Examples:
- "study physics in Telugu"
- "explain calculus in Hindi"
- "help with engineering in Tamil"

Ready to learn in your preferred language? 🚀`
    },

    // FACULTY MULTI-LANGUAGE KNOWLEDGE
    faculty_multilanguage: {
        keywords: ['faculty language', 'teaching language', 'professor language', 'academic language'],
        response: () => `👨‍🏫 **Faculty Multi-Language Support**

## 🎓 **Teaching & Research in Multiple Languages**

### **🇮🇳 Academic Communication in Indian Languages:**

**Hindi (हिंदी):**
- शैक्षणिक संचार हिंदी में
- शोध कार्य हिंदी में
- छात्रों के साथ हिंदी में बातचीत
- अंतरराष्ट्रीय छात्रों के लिए हिंदी समर्थन

**Telugu (తెలుగు):**
- విద్యాపరమైక సంభాషణ తెలుగులో
- పరిశోధ పనులు తెలుగులో
- విద్యార్థులతో తెలుగులో సంభాషణ
- అంతర్జాతీయ విద్యార్థులకు తెలుగు మద్దతు

**Tamil (தமிழ்):**
- கல்விசார் தகவல் தமிழில்
- ஆய்வுப் பணிகள் தமிழில்
- மாணவர்களுடன் தமிழில் உரையாடல்
- சர்வதேச மாணவர்களுக்கு தமிழ் ஆதரவு

### **🌍 International Academic Languages:**

**English:**
- International academic communication
- Research collaboration globally
- Publication in international journals
- Conference presentations

**Spanish (Español):**
- Comunicación académica en español
- Colaboración de investigación en español
- Publicaciones en revistas españolas
- Presentaciones en conferencias

**French (Français):**
- Communication académique en français
- Collaboration de recherche en français
- Publications dans des revues françaises
- Présentations en conférences

### **📚 Multi-Language Teaching Support:**

**Course Materials:**
- Lecture notes in multiple languages
- Textbook translations
- Assignment instructions in preferred language
- Exam papers in multiple languages

**Student Interaction:**
- Office hours in student's preferred language
- Email communication in multiple languages
- Feedback in student's language
- Mentoring in native language

**Research Collaboration:**
- International research teams
- Multi-language publications
- Cross-cultural research projects
- Global academic networks

### **🔬 Subject-Specific Academic Language:**

**Engineering (इंजीनियरिंग):**
- Technical terminology in multiple languages
- Engineering education in regional languages
- Research papers in multiple languages
- Industry collaboration in preferred language

**Science (विज्ञान):**
- Scientific concepts in multiple languages
- Laboratory instructions in preferred language
- Research methodology in multiple languages
- International collaboration

**Mathematics (गणित):**
- Mathematical concepts in multiple languages
- Problem-solving in preferred language
- Research in multiple languages
- International mathematical communication

### **🎯 Faculty Language Benefits:**

**For Teaching:**
- Better student engagement in native language
- Improved understanding of complex concepts
- Cultural relevance in examples
- Inclusive classroom environment

**For Research:**
- International collaboration opportunities
- Publication in multiple languages
- Global research networks
- Cross-cultural research insights

**For Administration:**
- Multi-language documentation
- International student support
- Global academic partnerships
- Diverse faculty communication

### **📊 Academic Language Services:**

**Translation Services:**
- Course material translation
- Research paper translation
- Student communication translation
- Administrative document translation

**Language Support:**
- Language learning resources
- Academic writing in multiple languages
- Presentation skills in multiple languages
- Conference preparation in multiple languages

## 🌟 **Enhance Your Academic Impact Globally!**

Communicate with students and colleagues worldwide in their preferred language!

**Examples:**
- "teach physics in Telugu"
- "research collaboration in Spanish"
- "student feedback in Hindi"
- "conference presentation in French"

Ready to expand your academic reach globally? 🚀`
    },

    // ADMIN MULTI-LANGUAGE KNOWLEDGE
    admin_multilanguage: {
        keywords: ['admin language', 'administration language', 'management language', 'system language'],
        response: () => `🔧 **Admin Multi-Language Support**

## 🏢 **System Administration in Multiple Languages**

### **🇮🇳 Administrative Communication in Indian Languages:**

**Hindi (हिंदी):**
- प्रशासनिक संचार हिंदी में
- सिस्टम प्रबंधन हिंदी में
- कर्मचारी संचार हिंदी में
- विभागीय रिपोर्टिंग हिंदी में

**Telugu (తెలుగు):**
- పాలనాపరమైక సంభాషణ తెలుగులో
- సిస్టమ్ నిర్వహణ తెలుగులో
- ఉద్యోగి సంభాషణ తెలుగులో
- విభాగ నివేదికలు తెలుగులో

**Tamil (தமிழ்):**
- நிர்வாகத் தகவல் தமிழில்
- கணினி மேலாண்மை தமிழில்
- ஊழியர் தகவல் தமிழில்
- துறை அறிக்கைகள் தமிழில்

### **🌍 International Administrative Languages:**

**English:**
- Global administrative communication
- International system documentation
- Multi-national team coordination
- International compliance reporting

**Spanish (Español):**
- Comunicación administrativa en español
- Documentación del sistema en español
- Coordinación de equipos multilingües
- Informes de cumplimiento internacional

**French (Français):**
- Communication administrative en français
- Documentation système en français
- Coordination d'équipes multilingues
- Rapports de conformité internationale

### **📊 Multi-Language System Management:**

**System Documentation:**
- User manuals in multiple languages
- System guides in preferred language
- Technical documentation translation
- Policy documents in multiple languages

**User Support:**
- Help desk in multiple languages
- Technical support in preferred language
- User training in native language
- FAQ in multiple languages

**Reporting & Analytics:**
- Dashboard in multiple languages
- Reports in preferred language
- Analytics in multiple languages
- KPI tracking in preferred language

### **🔧 Administrative Functions by Language:**

**User Management:**
- User registration in multiple languages
- Profile management in preferred language
- Permission management in native language
- User support in multiple languages

**System Configuration:**
- System settings in multiple languages
- Configuration guides in preferred language
- Troubleshooting in native language
- Maintenance schedules in multiple languages

**Security & Compliance:**
- Security policies in multiple languages
- Compliance documentation in preferred language
- Audit reports in native language
- Security training in multiple languages

### **🌐 Global Administration Benefits:**

**For International Teams:**
- Seamless communication across languages
- Consistent policies across regions
- Unified system understanding
- Cultural sensitivity in administration

**For Local Teams:**
- Better engagement in native language
- Improved understanding of policies
- Faster adoption of systems
- Cultural relevance in procedures

**For Management:**
- Global oversight with local relevance
- Multi-language reporting
- International compliance
- Cross-cultural team management

### **📈 Administrative Language Services:**

**Translation Services:**
- Policy document translation
- System manual translation
- Training material translation
- Communication translation

**Localization Services:**
- System interface localization
- Date/time format localization
- Currency localization
- Cultural adaptation

**Support Services:**
- Multi-language help desk
- Technical support in preferred language
- Training in native language
- Documentation in multiple languages

### **🎯 Admin Language Features:**

**Dashboard & Interface:**
- Multi-language dashboard
- Localized system interface
- Language preference settings
- Automatic language detection

**Communication Tools:**
- Multi-language email templates
- Notification systems in multiple languages
- Announcement systems in preferred language
- Chat support in multiple languages

**Reporting Tools:**
- Multi-language report generation
- Localized chart labels
- Regional formatting
- Cultural date/time formats

## 🌟 **Global Administration Made Easy!**

Manage your entire system in multiple languages seamlessly!

**Examples:**
- "system dashboard in Telugu"
- "user management in Hindi"
- "security policies in Tamil"
- "reports in Spanish"

Ready to administer globally with local relevance? 🚀`
    },

    // LANGUAGE DETECTION AND TRANSLATION
    language_detection: {
        keywords: ['detect language', 'identify language', 'language detection', 'translate', 'translation'],
        response: () => `🌍 **Language Detection & Translation**

## 🔍 **Automatic Language Detection**

I can automatically detect the language you're using and respond in the same language. Here's how it works:

### **Detection Methods:**
- **Text Analysis**: Analyze characters and patterns
- **Keyword Recognition**: Identify language-specific keywords
- **Context Understanding**: Understand context to determine language
- **User Preference**: Remember your language preference

### **Supported Languages:**
- **Indian Languages**: Hindi, Telugu, Tamil, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi
- **International Languages**: English, Spanish, French, German, Chinese, Japanese, Arabic, Russian, Portuguese
- **Total Support**: 20+ languages

## 🔄 **Translation Services**

### **Between Languages:**
- Translate from any supported language to any other
- Maintain context and meaning
- Preserve technical terminology
- Cultural adaptation

### **Translation Features:**
- **Real-time Translation**: Instant translation as you type
- **Batch Translation**: Translate multiple documents
- **Technical Translation**: Specialized technical terminology
- **Cultural Translation**: Adapt to cultural context

## 🎯 **How to Use Language Features:**

### **Automatic Detection:**
Just type in your preferred language, and I'll respond automatically!

### **Manual Language Selection:**
- "Respond in Hindi"
- "Speak to me in Telugu"
- "Use Tamil for this conversation"
- "Switch to English"

### **Translation Requests:**
- "Translate this to Spanish: [text]"
- "What is [text] in French?"
- "Convert [text] to German"
- "Explain in Chinese: [concept]"

## 📊 **Language Statistics:**

### **Most Used Languages:**
1. **English** - Global communication
2. **Hindi** - National language
3. **Telugu** - Regional preference
4. **Tamil** - Regional preference
5. **Spanish** - International

### **Language Support Coverage:**
- **Reading**: 100% support for all languages
- **Writing**: 100% support for all languages
- **Speaking**: Voice support for major languages
- **Technical**: Specialized terminology support

## 🔧 **Advanced Language Features:**

### **Code-Switching:**
- Mix languages in the same conversation
- Seamless transition between languages
- Context-aware language switching
- Cultural code-switching support

### **Dialect Support:**
- Regional dialects for major languages
- Cultural variations
- Local terminology
- Regional expressions

### **Academic Language:**
- Subject-specific terminology
- Technical vocabulary
- Academic writing styles
- Research language support

## 🌟 **Language Learning Support:**

### **Language Learning:**
- Learn new languages with AI assistance
- Practice conversations
- Vocabulary building
- Grammar assistance

### **Cultural Learning:**
- Cultural context understanding
- Regional customs and traditions
- Cultural sensitivity training
- Cross-cultural communication

## 🚀 **Start Multi-Language Conversation!**

Try these examples:
- "नमस्ते, मैं हिंदी में बात करना चाहता हूँ"
- "నమస్కారం, నేను తెలుగులో మాట్లాడాలను"
- "வணக்கம், நான் தமிழில் பேச விரும்புகிறேன்"
- "Hello, I want to speak in English"
- "Hola, quiero hablar en español"

Ready to communicate in your preferred language? 🌍`
    },

    default: {
        response: (userMessage) => `🌍 **Universal Multi-Language VUAI Agent**

I can communicate with you in **20+ languages** including Indian and international languages!

## 🗣️ **Choose Your Language:**

### **🇮🇳 Indian Languages:**
- **Hindi** (हिंदी) - Type: "हिंदी में बात करें"
- **Telugu** (తెలుగు) - Type: "తెలుగులో మాట్లాడండి"
- **Tamil** (தமிழ்) - Type: "தமிழில் பேசுங்கள்"
- **Bengali** (বাংলা) - Type: "বাংলায় কথা বলুন"
- **Marathi** (मराठी) - Type: "मराठीत बोला"
- **Gujarati** (ગુજરાતી) - Type: "ગુજરાતીમાં બોલો"
- **Kannada** (ಕನ್ನಡ) - Type: "ಕನ್ನಡದಲ್ಲಿ ಮಾತಾಡಿ"
- **Malayalam** (മലയാളം) - Type: "മലയാളത്ത് സംസാരിക്കൂ"
- **Punjabi** (ਪੰਾਜਾਬੀ) - Type: "ਪੰਾਜਾਬੀ ਵਿੱਚ ਗੱਲ਼ੋ"

### **🌍 International Languages:**
- **English** - Type: "Speak in English"
- **Spanish** (Español) - Type: "Habla en español"
- **French** (Français) - Type: "Parlez en français"
- **German** (Deutsch) - Type: "Sprechen Sie Deutsch"
- **Chinese** (中文) - Type: "用中文说话"
- **Japanese** (日本語) - Type: "日本語で話す"
- **Arabic** (العربية) - Type: "تحدث باللغة العربية"
- **Russian** (Русский) - Type: "Говорите на русском"
- **Portuguese** (Português) - Type: "Fale em português"

## 🎓 **Role-Specific Language Support:**

### **Students (विद्यार्थी):**
- Study materials in your language
- Technical explanations in native language
- Exam preparation in preferred language
- Assignment help in your language

### **Faculty (शिक्षक):**
- Teaching support in multiple languages
- Research collaboration across languages
- Student communication in native language
- Academic documentation in preferred language

### **Admin (प्रशासन):**
- System administration in multiple languages
- User support in native language
- Documentation in preferred language
- Team communication in your language

## 💬 **How to Start:**

1. **Type in Your Language**: Simply start typing in your preferred language
2. **Automatic Detection**: I'll detect your language and respond accordingly
3. **Language Switch**: Ask me to switch languages anytime
4. **Translation**: Request translation between languages

## 🌟 **Examples:**

**Student:**
- "मुझे भौतिकी की समझ हिंदी में चाहिए"
- "ఫిజిక్స్ గురించి తెలుగులో వివరించండి"
- "இயற்பியல் தமிழில் விளக்கவும்"

**Faculty:**
- "मैं छात्रों को हिंदी में पढ़ा सकता हूँ"
- "విద్యార్థులతో తెలుగులో మాట్లాడగలను"
- "மாணவர்களுடன் தமிழில் உரையாடலாம்"

**Admin:**
- "सिस्टम प्रबंधन हिंदी में कर सकते हैं"
- "సిస్టమ్ నిర్వహణ తెలుగులో చేయగలను"
- "கணினி மேலாண்மை தமிழில் செய்யலாம்"

## 🚀 **Start Multi-Language Conversation!**

Just type in your preferred language, and I'll respond in the same language. No special commands needed!

Ready to communicate in your language? 🌍`
    }
};

// Language Detection Helper Function
function detectLanguage(text) {
    const textLower = text.toLowerCase();
    
    // Hindi detection
    if (/[\u0900-\u097F]/.test(text)) return 'hindi';
    
    // Telugu detection
    if (/[\u0C00-\u0C7F]/.test(text)) return 'telugu';
    
    // Tamil detection
    if (/[\u0B80-\u0BFF]/.test(text)) return 'tamil';
    
    // Bengali detection
    if (/[\u0980-\u09FF]/.test(text)) return 'bengali';
    
    // Marathi detection
    if (/[\u0900-\u097F]/.test(text) && /[\u093C]/.test(text)) return 'marathi';
    
    // Gujarati detection
    if (/[\u0A80-\u0AFF]/.test(text)) return 'gujarati';
    
    // Kannada detection
    if (/[\u0C80-\u0CFF]/.test(text)) return 'kannada';
    
    // Malayalam detection
    if (/[\u0D00-\u0D7F]/.test(text)) return 'malayalam';
    
    // Punjabi detection
    if (/[\u0A00-\u0A7F]/.test(text)) return 'punjabi';
    
    // Chinese detection
    if (/[\u4E00-\u9FFF]/.test(text)) return 'chinese';
    
    // Japanese detection
    if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) return 'japanese';
    
    // Arabic detection
    if (/[\u0600-\u06FF]/.test(text)) return 'arabic';
    
    // Russian detection
    if (/[\u0400-\u04FF]/.test(text)) return 'russian';
    
    // Spanish keywords
    if (/\b(hola|gracias|por favor|de|en|con|para|por|el|la|los|las|un|una|unos|unas)\b/.test(textLower)) return 'spanish';
    
    // French keywords
    if (/\b(bonjour|merci|s'il vous plaît|de|en|avec|pour|par|le|la|les|un|une|des)\b/.test(textLower)) return 'french';
    
    // German keywords
    if (/\b(hallo|danke|bitte|der|die|das|ein|eine|mit|für|von|zu|nach|auf)\b/.test(textLower)) return 'german';
    
    // Portuguese keywords
    if (/\b(olá|obrigado|por favor|de|em|com|para|por|o|a|os|as|um|uma|uns|umas)\b/.test(textLower)) return 'portuguese';
    
    // Default to English
    return 'english';
}

module.exports.detectLanguage = detectLanguage;
