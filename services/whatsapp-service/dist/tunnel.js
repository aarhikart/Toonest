"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tunnelManager = exports.TunnelManager = void 0;
const child_process_1 = require("child_process");
class TunnelManager {
    child = null;
    currentUrl = null;
    status = 'stopped';
    lastError = null;
    pendingPromise = null;
    constructor() { }
    getStatus() {
        return {
            status: this.status,
            isRunning: this.status === 'running' && Boolean(this.currentUrl),
            url: this.currentUrl,
            error: this.lastError
        };
    }
    async startTunnel(port = 5001, forceRestart = false) {
        if (this.currentUrl && this.status === 'running' && !forceRestart) {
            return this.currentUrl;
        }
        if (this.pendingPromise && !forceRestart) {
            return this.pendingPromise;
        }
        this.stopTunnel();
        this.status = 'starting';
        this.lastError = null;
        this.currentUrl = null;
        this.pendingPromise = new Promise((resolve, reject) => {
            const isWindows = process.platform === 'win32';
            const cmd = isWindows ? 'npx.cmd' : 'npx';
            const args = ['cloudflared', 'tunnel', '--url', `http://localhost:${port}`];
            console.log(`[TunnelManager] Launching: ${cmd} ${args.join(' ')}`);
            let proc;
            try {
                proc = (0, child_process_1.spawn)(cmd, args, {
                    shell: true,
                    env: { ...process.env, NO_UPDATE_NOTIFIER: '1' }
                });
                this.child = proc;
            }
            catch (err) {
                this.status = 'error';
                this.lastError = err.message;
                this.pendingPromise = null;
                return reject(err);
            }
            let resolved = false;
            const timeout = setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    this.pendingPromise = null;
                    if (this.currentUrl) {
                        resolve(this.currentUrl);
                    }
                    else {
                        this.status = 'error';
                        this.lastError = 'Timed out waiting for Cloudflare Tunnel URL (25s)';
                        reject(new Error(this.lastError));
                    }
                }
            }, 25000);
            const handleOutput = (data) => {
                const text = data.toString();
                // Regex to capture trycloudflare URL
                const match = text.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
                if (match && !resolved) {
                    this.currentUrl = match[0];
                    this.status = 'running';
                    this.lastError = null;
                    resolved = true;
                    clearTimeout(timeout);
                    this.pendingPromise = null;
                    console.log(`[TunnelManager] Live Tunnel Established: ${this.currentUrl}`);
                    resolve(this.currentUrl);
                }
            };
            proc.stdout?.on('data', handleOutput);
            proc.stderr?.on('data', handleOutput);
            proc.on('error', (err) => {
                console.error('[TunnelManager] Spawn error:', err.message);
                this.status = 'error';
                this.lastError = err.message;
                if (!resolved) {
                    resolved = true;
                    clearTimeout(timeout);
                    this.pendingPromise = null;
                    reject(err);
                }
            });
            proc.on('exit', (code, signal) => {
                console.log(`[TunnelManager] Process exited with code ${code}, signal ${signal}`);
                if (this.status === 'running' || this.status === 'starting') {
                    this.status = 'stopped';
                    this.currentUrl = null;
                }
                this.child = null;
            });
        });
        return this.pendingPromise;
    }
    stopTunnel() {
        if (this.child) {
            console.log('[TunnelManager] Stopping active tunnel...');
            try {
                if (process.platform === 'win32' && this.child.pid) {
                    const { execSync } = require('child_process');
                    try {
                        execSync(`taskkill /pid ${this.child.pid} /T /F`, { stdio: 'ignore' });
                    }
                    catch { }
                }
                else {
                    this.child.kill('SIGTERM');
                }
            }
            catch (err) {
                console.warn('[TunnelManager] Error stopping tunnel:', err.message);
            }
            this.child = null;
        }
        if (process.platform === 'win32') {
            try {
                const { execSync } = require('child_process');
                execSync('taskkill /IM cloudflared.exe /F', { stdio: 'ignore' });
            }
            catch { }
        }
        this.status = 'stopped';
        this.currentUrl = null;
        this.pendingPromise = null;
    }
}
exports.TunnelManager = TunnelManager;
exports.tunnelManager = new TunnelManager();
