// All sound is synthesised with WebAudio — no audio files, no network.
// Gobbles, footsteps, corn pops, a farmer's shout, oven hiss, knife whoosh,
// and a little autumn banjo-ish loop made of plucked triangle waves.
export function createAudio() {
  let ctx = null;
  let master = null;
  let musicTimer = null;
  let step = 0;

  function ensure() {
    if (ctx) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
    return true;
  }

  function tone(freq, dur, type, vol, slideTo) {
    if (!ensure()) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const t = ctx.currentTime;
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t + dur);
    gain.gain.setValueAtTime(vol || 0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain); gain.connect(master);
    osc.start(t); osc.stop(t + dur + 0.02);
  }

  function noise(dur, vol, filterFreq) {
    if (!ensure()) return;
    const len = Math.floor(ctx.sampleRate * dur);
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = filterFreq || 1200;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    src.connect(filter); filter.connect(gain); gain.connect(master);
    src.start();
  }

  const MELODY = [392, 494, 587, 494, 659, 587, 494, 440, 392, 494, 587, 784, 659, 587, 494, 440];
  const BASS = [98, 98, 147, 98, 131, 98, 147, 110];

  return {
    unlock() { if (ensure() && ctx.state === 'suspended') ctx.resume(); },
    gobble() {
      // A descending wobble: the turkey's panic call.
      for (let i = 0; i < 3; i++) {
        setTimeout(() => tone(620 - i * 90, 0.09, 'sawtooth', 0.08, 380 - i * 60), i * 70);
      }
    },
    jump() { tone(300, 0.16, 'square', 0.1, 640); },
    land() { noise(0.07, 0.1, 500); },
    corn() { tone(880, 0.08, 'triangle', 0.16); setTimeout(() => tone(1320, 0.1, 'triangle', 0.14), 55); },
    goldenCorn() { [660, 880, 1100, 1320].forEach((f, i) => setTimeout(() => tone(f, 0.12, 'triangle', 0.16), i * 70)); },
    hurt() { tone(220, 0.25, 'sawtooth', 0.2, 90); noise(0.15, 0.12, 900); },
    spotted() { tone(980, 0.12, 'square', 0.14); setTimeout(() => tone(980, 0.12, 'square', 0.14), 160); },
    farmerShout() { tone(180, 0.3, 'sawtooth', 0.16, 120); },
    knifeWhoosh() { noise(0.18, 0.16, 2600); },
    ovenHiss() { noise(0.4, 0.08, 3400); },
    hide() { noise(0.2, 0.07, 700); },
    stageClear() { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, 0.16, 'triangle', 0.16), i * 110)); },
    escaped() { [523, 659, 784, 1047, 1319].forEach((f, i) => setTimeout(() => tone(f, 0.22, 'triangle', 0.18), i * 130)); },
    caught() { tone(330, 0.5, 'sawtooth', 0.18, 82); },
    click() { tone(700, 0.05, 'square', 0.08); },
    startMusic() {
      if (!ensure() || musicTimer) return;
      musicTimer = setInterval(() => {
        tone(MELODY[step % MELODY.length], 0.16, 'triangle', 0.07);
        if (step % 2 === 0) tone(BASS[(step / 2) % BASS.length | 0], 0.24, 'sine', 0.09);
        step++;
      }, 210);
    },
    stopMusic() { if (musicTimer) { clearInterval(musicTimer); musicTimer = null; } },
    setMuted(muted) { if (master) master.gain.value = muted ? 0 : 0.5; },
  };
}
