// Programming Languages Knowledge Base
module.exports = {
    python: {
        keywords: ['python', 'learn python', 'python code', 'python programming'],
        response: () => `🐍 **Python Programming**\n\nPython is a high-level, dynamically typed language known for its readability and vast ecosystem (AI, Web, Data Science).\n\n*Resources to learn:*\n- [Official Docs](https://docs.python.org/3/)\n- W3Schools or Codecademy\n\nNeed a specific Python snippet? Just ask! 💻\n\n{{NAVIGATE: advanced}}`
    },

    java: {
        keywords: ['java', 'learn java', 'java code', 'java programming', 'spring boot'],
        response: () => `☕ **Java Programming**\n\nJava is a robust, object-oriented language widely used for enterprise applications and Android development.\n\n*Key Concepts:*\n- OOP (Inheritance, Polymorphism)\n- JVM, JRE, JDK\n- Multithreading\n\nWould you like a quick example of a Java class? 🚀\n\n{{NAVIGATE: advanced}}`
    },

    javascript: {
        keywords: ['javascript', 'js', 'learn javascript', 'web development', 'frontend', 'react', 'node'],
        response: () => `🌐 **JavaScript & Web Development**\n\nJavaScript is the language of the web! It powers everything from interactive frontends (React, Vue) to scalable backends (Node.js).\n\n*Core topics:*\n- DOM Manipulation\n- ES6+ (Arrow functions, Promises, Async/Await)\n\nWant to know how to build a quick React component? ⚛️\n\n{{NAVIGATE: advanced}}`
    },

    cpp: {
        keywords: ['c++', 'cpp', 'learn c++', 'c plus plus', 'competitive programming'],
        response: () => `⚙️ **C++ Programming**\n\nC++ is an incredibly fast, compiled language used for system programming, game engines, and competitive programming.\n\n*Key features:*\n- STL (Standard Template Library)\n- Pointers and Memory Management\n- Classes and Objects\n\nAsk me if you need help with a specific DSA implementation in C++!\n\n{{NAVIGATE: advanced}}`
    },

    c: {
        keywords: ['c language', 'c programming', 'learn c'],
        response: () => `🖥️ **C Programming**\n\nC is the mother of all modern languages. It gives you deep control over system memory.\n\n*Important topics:*\n- Pointers\n- Structs\n- Dynamic Memory Allocation (malloc, calloc)\n\n{{NAVIGATE: advanced}}`
    },
    
    sql: {
        keywords: ['sql', 'database', 'mysql', 'postgres', 'query', 'dbms'],
        response: () => `🗄️ **SQL & Databases**\n\nStructured Query Language (SQL) is used to manage and query relational databases.\n\n*Commands to know:*\n- DDL (CREATE, ALTER, DROP)\n- DML (SELECT, INSERT, UPDATE, DELETE)\n- Joins (INNER, LEFT, RIGHT)\n\n{{NAVIGATE: advanced}}`
    }
};
