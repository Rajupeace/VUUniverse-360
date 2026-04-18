const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

console.log('========================================================');
console.log('      Vu UniVerse360 - UNIFIED CONTROLLER');
console.log('========================================================\n');

const processes = [];

// Wrapper function to spawn processes
function startService(name, command, args, cwd, customEnv = {}) {
    console.log(`[+] Starting ${name}...`);
    const proc = spawn(command, args, {
        cwd: cwd,
        shell: true,
        env: { ...process.env, ...customEnv },
        stdio: 'pipe'
    });

    proc.stdout.on('data', (data) => {
        const lines = data.toString().trim().split('\n');
        lines.forEach(line => {
            if (line.trim()) console.log(`[${name}] ${line.trimEnd()}`);
        });
    });

    proc.stderr.on('data', (data) => {
        const lines = data.toString().trim().split('\n');
        lines.forEach(line => {
            if (line.trim()) console.log(`[${name}] ${line.trimEnd()}`);
        });
    });

    proc.on('close', (code) => {
        console.log(`[${name}] Exited with code ${code}`);
    });

    processes.push(proc);
    return proc;
}

// 1. Start Backend (Node.js / Express — port 5000)
const backendPath = path.join(__dirname, 'backend');
startService('BACKEND', 'node', ['index.js'], backendPath);

// 2. Start AI Agent (Python FastAPI — port 8000)
const aiAgentPath = path.join(__dirname, 'backend', 'ai_agent');
startService('AI_AGENT', 'python', ['main.py'], aiAgentPath, { USE_MOCK_LLM: '1' });

// 3. Start Frontend (React — port 3000) after a short delay
setTimeout(() => {
    startService('FRONTEND', 'npm', ['start'], __dirname, { PORT: '3000', BROWSER: 'none' });
}, 3000);

console.log('========================================================');
console.log('  ALL SERVICES LAUNCHING...');
console.log('  Frontend : http://localhost:3000  (starts in ~3s)');
console.log('  Backend  : http://localhost:5000');
console.log('  AI Agent : http://localhost:8000');
console.log('  Press Ctrl+C to stop all services.');
console.log('========================================================\n');

// Graceful shutdown handling
function shutdown() {
    console.log('\nShutting down all services...');
    processes.forEach(proc => {
        try {
            if (os.platform() === 'win32') {
                execSync(`taskkill /pid ${proc.pid} /T /F`, { stdio: 'ignore' });
            } else {
                proc.kill('SIGTERM');
            }
        } catch (e) {
            // Ignore
        }
    });
    console.log('Shutdown complete.');
    process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
