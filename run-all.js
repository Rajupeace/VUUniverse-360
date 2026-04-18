const { spawn, execSync } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

// ============================================================
//   Vu UniVerse360 — Unified Server Launcher v2.1
//   Starts: NestJS Backend (5000) + AI Agent (8000) + Frontend (3000)
// ============================================================

const ROOT = __dirname;
const NEST_DIR = path.join(ROOT, 'backend-nest');
const AI_AGENT_DIR = path.join(ROOT, 'ai-agent');
const BACKEND_DIST = path.join(NEST_DIR, 'dist', 'main.js');
const BACKEND_DIST_EXISTS = fs.existsSync(BACKEND_DIST);
const IS_WIN = os.platform() === 'win32';

// Load root .env into this process so services inherit it
const dotenvPath = path.join(ROOT, '.env');
if (fs.existsSync(dotenvPath)) {
    require('fs').readFileSync(dotenvPath, 'utf8').split('\n').forEach(line => {
        const [k, ...v] = line.replace(/\r/, '').split('=');
        if (k && k.trim() && !k.startsWith('#') && v.length) {
            process.env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
        }
    });
    console.log('  ✓ Loaded .env from project root');
} else {
    console.warn('  ⚠ No .env found at project root — servers may not connect to MongoDB');
}

// ─── Colour helpers ─────────────────────────────────────────
const C = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    red: '\x1b[31m',
    magenta: '\x1b[35m',
    gray: '\x1b[90m',
    bold: '\x1b[1m',
};

const TAG_COLORS = {
    NEST: C.green,
    FRONTEND: C.cyan,
    AI_AGENT: C.magenta,
};

function log(tag, msg, isErr = false) {
    const color = TAG_COLORS[tag] || C.yellow;
    const prefix = `${color}[${tag}]${C.reset}`;
    const text = isErr ? `${C.red}${msg}${C.reset}` : msg;
    console.log(`${prefix} ${text}`);
}

// ─── Free a port (Windows) ───────────────────────────────────
function freePort(port) {
    try {
        if (IS_WIN) {
            const out = execSync(
                `netstat -ano | findstr ":${port} "`,
                { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }
            );
            out.split('\n')
                .filter(l => l.includes('LISTENING'))
                .forEach(line => {
                    const pid = line.trim().split(/\s+/).pop();
                    if (pid && /^\d+$/.test(pid) && parseInt(pid) > 0) {
                        try { execSync(`taskkill /pid ${pid} /F /T`, { stdio: 'ignore' }); } catch (_) { }
                    }
                });
        } else {
            execSync(`lsof -ti:${port} | xargs kill -9 >/dev/null 2>&1 || true`, { shell: true, stdio: 'ignore' });
        }
    } catch (_) { }
}

const processes = [];
let shuttingDown = false;

// ─── Spawn a service ─────────────────────────────────────────
function startService(tag, command, args, cwd, env = {}, autoRestart = true) {
    const cmdStr = `${command} ${args.join(' ')}`;
    log(tag, `${C.gray}Starting: ${cmdStr}${C.reset}`);

    const shellEnv = { ...process.env, ...env };
    // On Mac/Linux, ensure common paths are included
    if (!IS_WIN) {
        shellEnv.PATH = `${shellEnv.PATH}:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/bin`;
    }

    const proc = spawn(command, args, {
        cwd,
        shell: true,
        env: shellEnv,
        stdio: 'pipe',
        windowsHide: true,
    });

    proc.stdout.on('data', data => {
        data.toString().trim().split('\n').forEach(line => {
            if (line.trim()) log(tag, line.trimEnd());
        });
    });

    proc.stderr.on('data', data => {
        data.toString().trim().split('\n').forEach(line => {
            const l = line.toLowerCase();
            // Filter common noise
            if (
                l.includes('experimentalwarning') ||
                l.includes('deprecationwarning') ||
                l.includes('duplicate schema index') ||
                l.includes('compilewarning') ||
                l.includes('npm warn') ||
                !line.trim()
            ) return;
            // NestJS logs on stderr for some things — print without error color if it's a LOG
            const isNestLog = /\[Nest\]|\[NestFactory\]|\[RoutesResolver\]|\[RouterExplorer\]|\[NestApplication\]|\[InstanceLoader\]/.test(line);
            log(tag, line.trimEnd(), !isNestLog);
        });
    });

    proc.on('close', code => {
        log(tag, `Process exited (code ${code})`, code !== 0 && code !== null);
        if (!shuttingDown && autoRestart && code !== 0 && code !== null) {
            log(tag, `Restarting in 4 seconds...`);
            setTimeout(() => startService(tag, command, args, cwd, env, autoRestart), 4000);
        }
    });

    processes.push(proc);
    return proc;
}

// ─── Graceful shutdown ───────────────────────────────────────
function shutdown() {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log('\n\n' + C.red + '  Shutting down all services...' + C.reset);
    processes.forEach(proc => {
        try {
            if (IS_WIN && proc.pid) {
                execSync(`taskkill /pid ${proc.pid} /T /F`, { stdio: 'ignore' });
            } else {
                proc.kill('SIGTERM');
            }
        } catch (_) { }
    });
    // Kill any lingering python processes started by us
    if (IS_WIN) {
        try { execSync('taskkill /im python.exe /F', { stdio: 'ignore' }); } catch (_) { }
    }
    console.log(C.green + '  All services stopped. Goodbye!\n' + C.reset);
    process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// ============================================================
//   LAUNCH SEQUENCE
// ============================================================

console.log('\n========================================================');
console.log('       Vu UniVerse360 — UNIFIED CONTROLLER v2.1');
console.log('========================================================\n');

// Free ports
console.log(`${C.yellow}  Clearing ports 3001, 5001, 8000...${C.reset}`);
[3000, 3001, 5001, 8000].forEach(freePort);
console.log(`${C.green}  Ports cleared.\n${C.reset}`);

// ─── 1. NestJS Backend — port 5001 ──────────────────────────
if (BACKEND_DIST_EXISTS) {
    log('NEST', `Using compiled dist (production) → dist/main.js`);
    startService('NEST', 'node', ['dist/main.js'], NEST_DIR, {
        NODE_ENV: 'production',
        PORT: '5001',
    });
} else {
    log('NEST', `No dist found — starting in watch/dev mode`);
    startService('NEST', IS_WIN ? 'npm.cmd' : 'npm', ['run', 'start:dev'], NEST_DIR, {
        NODE_ENV: 'development',
        PORT: '5001',
    });
}

// ─── 2. AI Agent — port 8000 ────────────────────────────────
const agentExists = fs.existsSync(path.join(AI_AGENT_DIR, 'main.py'));
if (agentExists) {
    const pyCmd = IS_WIN ? 'python' : 'python3';
    startService('AI_AGENT', pyCmd, ['main.py'], AI_AGENT_DIR, {
        USE_MOCK_LLM: '1',
        PORT: '8000',
    });
} else {
    log('AI_AGENT', `ai_agent/main.py not found — AI Agent skipped`, true);
}

// ─── 3. Frontend — port 3001 (delayed to let backend boot) ──
// On Windows, use npm.cmd directly; on Unix, use npm
const npmCmd = IS_WIN ? 'npm.cmd' : 'npm';

setTimeout(() => {
    startService(
        'FRONTEND',
        npmCmd,
        ['start'],
        ROOT,
        {
            PORT: '3000',
            BROWSER: 'none',
            GENERATE_SOURCEMAP: 'false',
            REACT_APP_API_URL: 'http://localhost:5001',
        }
    );
}, 6000);

// ─── Banner ──────────────────────────────────────────────────
console.log(`${C.bold}${C.green}
  ╔══════════════════════════════════════════════════════╗
  ║          ALL SERVICES LAUNCHING...                   ║
  ║                                                      ║
  ║   🌐  Frontend  →  http://localhost:3000  (in ~6s)  ║
  ║   🔌  NestJS    →  http://localhost:5001/api         ║
  ║   🤖  AI Agent  →  http://localhost:8000             ║
  ║                                                      ║
  ║   Press  Ctrl+C  to stop all services.               ║
  ╚══════════════════════════════════════════════════════╝
${C.reset}`);
