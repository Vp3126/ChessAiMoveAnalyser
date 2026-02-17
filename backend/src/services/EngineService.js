const { spawn } = require('child_process');
const path = require('path');
require('dotenv').config();

class EngineService {
    static analyze(fen, depth = 3) {
        return new Promise((resolve, reject) => {
            const enginePath = path.resolve(__dirname, '../../', process.env.ENGINE_PATH || '../engine-cpp/engine.exe');
            console.log(`[ENGINE] Spawning: ${enginePath}`);
            console.log(`[ENGINE] Params: --fen "${fen}" --depth ${depth}`);

            const child = spawn(enginePath, ['--fen', fen, '--depth', depth.toString()]);

            let output = '';
            let errorOutput = '';

            child.stdout.on('data', (data) => {
                output += data.toString();
            });

            child.stderr.on('data', (data) => {
                errorOutput += data.toString();
                console.error(`[ENGINE-STDERR] ${data}`);
            });

            child.on('close', (code) => {
                console.log(`[ENGINE] Process closed with code ${code}`);
                if (code !== 0) {
                    return reject(new Error(`Engine exited with code ${code}: ${errorOutput}`));
                }
                try {
                    console.log(`[ENGINE] Raw output length: ${output.length} chars`);
                    const result = JSON.parse(output);
                    resolve(result);
                } catch (e) {
                    console.error(`[ENGINE] JSON Parse Error. Raw output: ${output}`);
                    reject(new Error(`Failed to parse engine output: ${output}`));
                }
            });

            // Set a timeout
            setTimeout(() => {
                child.kill();
                reject(new Error('Engine analysis timed out after 30 seconds'));
            }, 30000);
        });
    }
}

module.exports = EngineService;
