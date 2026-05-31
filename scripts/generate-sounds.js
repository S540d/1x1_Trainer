/**
 * Generates minimal WAV sound assets for the 1x1 Trainer app.
 * Run once: node scripts/generate-sounds.js
 */
const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 22050;

function sineWave(freq, durationMs, amp = 0.55) {
  const n = Math.floor(SAMPLE_RATE * durationMs / 1000);
  const attack = Math.floor(SAMPLE_RATE * 0.010); // 10 ms
  const release = Math.floor(SAMPLE_RATE * 0.040); // 40 ms
  return Float32Array.from({ length: n }, (_, i) => {
    const env = Math.min(1, i / attack) * Math.min(1, (n - i) / release);
    return Math.sin(2 * Math.PI * freq * i / SAMPLE_RATE) * amp * env;
  });
}

function concat(...arrays) {
  const total = arrays.reduce((s, a) => s + a.length, 0);
  const out = new Float32Array(total);
  let off = 0;
  for (const a of arrays) { out.set(a, off); off += a.length; }
  return out;
}

function writeWav(filename, data) {
  const numSamples = data.length;
  const dataBytes = numSamples * 2;
  const buf = Buffer.alloc(44 + dataBytes);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + dataBytes, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);            // PCM
  buf.writeUInt16LE(1, 22);            // mono
  buf.writeUInt32LE(SAMPLE_RATE, 24);
  buf.writeUInt32LE(SAMPLE_RATE * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(dataBytes, 40);
  for (let i = 0; i < numSamples; i++) {
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, data[i])) * 32767), 44 + i * 2);
  }
  fs.writeFileSync(filename, buf);
  console.log(`  ${path.basename(filename)}  (${(buf.length / 1024).toFixed(1)} KB)`);
}

const dir = path.join(__dirname, '../assets/sounds');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

console.log('Generating sound assets...');

writeWav(path.join(dir, 'correct.wav'),
  concat(sineWave(880, 80, 0.50), sineWave(1319, 110, 0.42)));

writeWav(path.join(dir, 'incorrect.wav'),
  sineWave(210, 200, 0.32));

writeWav(path.join(dir, 'perfect.wav'),
  concat(sineWave(523, 80), sineWave(659, 80), sineWave(784, 80), sineWave(1047, 160, 0.58)));

writeWav(path.join(dir, 'level_up.wav'),
  concat(sineWave(392, 70, 0.48), sineWave(494, 70, 0.48), sineWave(587, 70, 0.48), sineWave(784, 130, 0.55)));

writeWav(path.join(dir, 'badge_unlock.wav'),
  concat(sineWave(1047, 60, 0.40), sineWave(1319, 60, 0.40), sineWave(1047, 55, 0.36), sineWave(1568, 130, 0.46)));

console.log('Done.');
