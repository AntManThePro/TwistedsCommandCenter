import React, { useRef, useEffect, useState, useCallback, memo } from 'react';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const STEPS = 16;
const TRACKS = [
  { id: 'kick',   label: '🥁 Kick',    color: '#ff0080' },
  { id: 'snare',  label: '🔔 Snare',   color: '#ffcc00' },
  { id: 'hihat',  label: '🎩 Hi-Hat',  color: '#60efff' },
  { id: 'bass',   label: '🎸 Bass',    color: '#00ff87' },
  { id: 'lead',   label: '🎹 Lead',    color: '#c084fc' },
] as const;

type TrackId = typeof TRACKS[number]['id'];

// Default pattern: each track has 16 booleans
const DEFAULT_PATTERN: Record<TrackId, boolean[]> = {
  kick:  [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0].map(Boolean),
  snare: [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0].map(Boolean),
  hihat: [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0].map(Boolean),
  bass:  [1,0,0,1, 0,0,1,0, 1,0,0,0, 0,1,0,0].map(Boolean),
  lead:  [0,0,0,0, 0,1,0,0, 0,0,0,1, 0,0,1,0].map(Boolean),
};

// ---------------------------------------------------------------------------
// Audio synthesis helpers — all pure Web Audio API, no samples
// ---------------------------------------------------------------------------
function makeAudioContext(): AudioContext {
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  return new Ctx();
}

function playKick(ctx: AudioContext, t: number, vol: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain); gain.connect(ctx.destination);
  osc.frequency.setValueAtTime(160, t);
  osc.frequency.exponentialRampToValueAtTime(0.01, t + 0.3);
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
  osc.start(t); osc.stop(t + 0.31);
}

function playSnare(ctx: AudioContext, t: number, vol: number) {
  // Noise component
  const buf = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource();
  noise.buffer = buf;
  const noiseGain = ctx.createGain();
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.value = 3000;
  noise.connect(noiseFilter); noiseFilter.connect(noiseGain); noiseGain.connect(ctx.destination);
  noiseGain.gain.setValueAtTime(vol * 0.8, t);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
  noise.start(t); noise.stop(t + 0.16);

  // Tone component
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(200, t);
  osc.connect(oscGain); oscGain.connect(ctx.destination);
  oscGain.gain.setValueAtTime(vol * 0.5, t);
  oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
  osc.start(t); osc.stop(t + 0.11);
}

function playHiHat(ctx: AudioContext, t: number, vol: number, open: boolean) {
  const buf = ctx.createBuffer(1, ctx.sampleRate * (open ? 0.2 : 0.05), ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 7000;
  const gain = ctx.createGain();
  src.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
  const dur = open ? 0.18 : 0.04;
  gain.gain.setValueAtTime(vol * 0.6, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
  src.start(t); src.stop(t + dur + 0.01);
}

function playBass(ctx: AudioContext, t: number, vol: number, step: number) {
  const SCALE = [55, 55, 65.4, 49, 73.4, 65.4, 49, 58.3]; // A1, A1, C2, G1, D2…
  const freq = SCALE[step % SCALE.length];
  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(300, t);
  filter.frequency.exponentialRampToValueAtTime(80, t + 0.3);
  const gain = ctx.createGain();
  osc.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
  osc.frequency.setValueAtTime(freq, t);
  gain.gain.setValueAtTime(vol * 0.7, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
  osc.start(t); osc.stop(t + 0.26);
}

function playLead(ctx: AudioContext, t: number, vol: number, step: number) {
  const SCALE = [523.25, 587.33, 659.25, 698.46, 783.99, 880, 987.77, 1046.5]; // C5 major
  const freq = SCALE[step % SCALE.length];
  const osc = ctx.createOscillator();
  osc.type = 'square';
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 1800;
  const gain = ctx.createGain();
  osc.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
  osc.frequency.setValueAtTime(freq, t);
  gain.gain.setValueAtTime(vol * 0.25, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
  osc.start(t); osc.stop(t + 0.19);
}

// ---------------------------------------------------------------------------
// BeatForge component
// ---------------------------------------------------------------------------
const BeatForge = memo(function BeatForge() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const schedulerIdRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const nextBeatTimeRef = useRef(0);
  const currentStepRef = useRef(0);
  const patternRef = useRef<Record<TrackId, boolean[]>>(
    JSON.parse(JSON.stringify(DEFAULT_PATTERN))
  );
  const bpmRef = useRef(120);
  const volRef = useRef(0.8);

  const [playing, setPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [bpm, setBpm] = useState(120);
  const [vol, setVol] = useState(0.8);
  const [pattern, setPattern] = useState<Record<TrackId, boolean[]>>(
    JSON.parse(JSON.stringify(DEFAULT_PATTERN))
  );
  const [muteState, setMuteState] = useState<Record<TrackId, boolean>>({
    kick: false, snare: false, hihat: false, bass: false, lead: false,
  });
  const muteRef = useRef<Record<TrackId, boolean>>({
    kick: false, snare: false, hihat: false, bass: false, lead: false,
  });

  // Keep refs in sync
  useEffect(() => { bpmRef.current = bpm; }, [bpm]);
  useEffect(() => { volRef.current = vol; }, [vol]);

  // Scheduler — fires every 25ms, schedules notes ~100ms ahead
  const scheduleNotes = useCallback(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const scheduleAhead = 0.1; // seconds

    while (nextBeatTimeRef.current < ctx.currentTime + scheduleAhead) {
      const step = currentStepRef.current;
      const t = nextBeatTimeRef.current;
      const pat = patternRef.current;
      const mute = muteRef.current;
      const v = volRef.current;

      if (pat.kick[step] && !mute.kick)   playKick(ctx, t, v);
      if (pat.snare[step] && !mute.snare) playSnare(ctx, t, v);
      if (pat.hihat[step] && !mute.hihat) playHiHat(ctx, t, v * 0.8, step % 8 === 4);
      if (pat.bass[step] && !mute.bass)   playBass(ctx, t, v, step);
      if (pat.lead[step] && !mute.lead)   playLead(ctx, t, v, step);

      const secPerBeat = 60 / bpmRef.current / 4; // 16th notes
      nextBeatTimeRef.current += secPerBeat;
      currentStepRef.current = (step + 1) % STEPS;
    }
  }, []);

  // UI step update — separate RAF loop
  useEffect(() => {
    if (!playing) { setCurrentStep(-1); return; }
    let rafId: number;
    let lastStep = -1;
    const update = () => {
      if (!audioCtxRef.current) return;
      const ctx = audioCtxRef.current;
      const secPerBeat = 60 / bpmRef.current / 4;
      // Estimate step from audio time
      const elapsed = ctx.currentTime - (nextBeatTimeRef.current - secPerBeat * STEPS);
      const step = Math.floor((elapsed / secPerBeat)) % STEPS;
      if (step !== lastStep) {
        lastStep = step;
        setCurrentStep((currentStepRef.current + STEPS - 1) % STEPS);
      }
      rafId = requestAnimationFrame(update);
    };
    rafId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafId);
  }, [playing]);

  const start = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = makeAudioContext();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    currentStepRef.current = 0;
    nextBeatTimeRef.current = ctx.currentTime + 0.05;
    schedulerIdRef.current = setInterval(scheduleNotes, 25);
    setPlaying(true);
  }, [scheduleNotes]);

  const stop = useCallback(() => {
    if (schedulerIdRef.current) clearInterval(schedulerIdRef.current);
    setPlaying(false);
    setCurrentStep(-1);
  }, []);

  const toggleCell = useCallback((trackId: TrackId, step: number) => {
    patternRef.current[trackId][step] = !patternRef.current[trackId][step];
    setPattern(prev => ({
      ...prev,
      [trackId]: prev[trackId].map((v, i) => i === step ? !v : v),
    }));
  }, []);

  const clearTrack = useCallback((trackId: TrackId) => {
    patternRef.current[trackId] = Array(STEPS).fill(false);
    setPattern(prev => ({ ...prev, [trackId]: Array(STEPS).fill(false) }));
  }, []);

  const randomizeTrack = useCallback((trackId: TrackId) => {
    const density = trackId === 'kick' || trackId === 'snare' ? 0.3 : 0.25;
    const next = Array.from({ length: STEPS }, () => Math.random() < density);
    patternRef.current[trackId] = next;
    setPattern(prev => ({ ...prev, [trackId]: next }));
  }, []);

  const toggleMute = useCallback((trackId: TrackId) => {
    muteRef.current[trackId] = !muteRef.current[trackId];
    setMuteState(prev => ({ ...prev, [trackId]: !prev[trackId] }));
  }, []);

  const clearAll = useCallback(() => {
    TRACKS.forEach(({ id }) => {
      patternRef.current[id] = Array(STEPS).fill(false);
    });
    setPattern({
      kick: Array(STEPS).fill(false),
      snare: Array(STEPS).fill(false),
      hihat: Array(STEPS).fill(false),
      bass: Array(STEPS).fill(false),
      lead: Array(STEPS).fill(false),
    });
  }, []);

  const resetPattern = useCallback(() => {
    patternRef.current = JSON.parse(JSON.stringify(DEFAULT_PATTERN));
    setPattern(JSON.parse(JSON.stringify(DEFAULT_PATTERN)));
  }, []);

  // Cleanup
  useEffect(() => () => {
    if (schedulerIdRef.current) clearInterval(schedulerIdRef.current);
    audioCtxRef.current?.close();
  }, []);

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <div style={panelStyle}>
        <h2 style={{ margin: '0 0 0.3rem', color: 'var(--green)' }}>BeatForge</h2>
        <p style={{ margin: '0 0 0.7rem', color: '#b5e9ef', fontSize: '0.9rem' }}>
          Web Audio API step sequencer — 5 tracks, 16 steps, synthesized entirely in the browser.
          No samples. Click cells to program patterns, toggle mute, or randomize tracks.
        </p>

        {/* Transport controls */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem 0.7rem', alignItems: 'center', marginBottom: '0.7rem' }}>
          <button onClick={playing ? stop : start} style={playBtnStyle(playing)}>
            {playing ? '⏹ Stop' : '▶ Play'}
          </button>
          <button onClick={clearAll} style={smallBtnStyle('var(--pink)')}>🗑 Clear All</button>
          <button onClick={resetPattern} style={smallBtnStyle('var(--cyan)')}>⟳ Reset</button>
          <label style={labelStyle}>
            BPM ({bpm}):
            <input type="range" min={60} max={200} value={bpm}
              onChange={e => setBpm(Number(e.target.value))}
              style={{ accentColor: 'var(--green)', width: '90px' }} />
          </label>
          <label style={labelStyle}>
            Volume:
            <input type="range" min={0.1} max={1} step={0.05} value={vol}
              onChange={e => setVol(Number(e.target.value))}
              style={{ accentColor: 'var(--yellow)', width: '70px' }} />
          </label>
        </div>

        {/* Step grid */}
        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: '520px' }}>
            {/* Step numbers header */}
            <div style={{ display: 'grid', gridTemplateColumns: '90px repeat(16, 1fr)', gap: '3px', marginBottom: '4px' }}>
              <div />
              {Array.from({ length: STEPS }, (_, i) => (
                <div key={i} style={{
                  textAlign: 'center',
                  fontSize: '0.6rem',
                  color: i === currentStep ? 'var(--green)' : i % 4 === 0 ? 'var(--cyan)' : '#445',
                  fontWeight: i % 4 === 0 ? 700 : 400,
                }}>
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Tracks */}
            {TRACKS.map(track => (
              <div key={track.id} style={{
                display: 'grid',
                gridTemplateColumns: '90px repeat(16, 1fr)',
                gap: '3px',
                marginBottom: '5px',
                alignItems: 'center',
              }}>
                {/* Track label + controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', paddingRight: '4px' }}>
                  <button
                    onClick={() => toggleMute(track.id)}
                    title="Mute"
                    style={{
                      width: '18px', height: '18px',
                      border: `1px solid ${muteState[track.id] ? 'rgba(255,0,0,0.5)' : track.color + '66'}`,
                      background: muteState[track.id] ? 'rgba(255,0,0,0.15)' : 'transparent',
                      color: muteState[track.id] ? '#ff4444' : track.color,
                      borderRadius: '3px', cursor: 'pointer', fontSize: '0.6rem', padding: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >M</button>
                  <span style={{ color: track.color, fontSize: '0.72rem', whiteSpace: 'nowrap', letterSpacing: '0.02em' }}>
                    {track.label}
                  </span>
                </div>

                {/* Step buttons */}
                {Array.from({ length: STEPS }, (_, step) => {
                  const active = pattern[track.id][step];
                  const isCurrent = step === currentStep && playing;
                  return (
                    <button
                      key={step}
                      onClick={() => toggleCell(track.id, step)}
                      style={{
                        height: '28px',
                        border: `1px solid ${active ? track.color : step % 4 === 0 ? 'rgba(96,239,255,0.2)' : 'rgba(96,239,255,0.08)'}`,
                        background: active
                          ? (isCurrent ? track.color : `${track.color}44`)
                          : (isCurrent ? 'rgba(255,255,255,0.12)' : 'rgba(8,14,24,0.7)'),
                        borderRadius: '3px',
                        cursor: 'pointer',
                        boxShadow: active && isCurrent ? `0 0 8px ${track.color}` : 'none',
                        transition: 'background 0.05s, box-shadow 0.05s',
                      }}
                    />
                  );
                })}
              </div>
            ))}

            {/* Per-track randomize row */}
            <div style={{ display: 'grid', gridTemplateColumns: '90px repeat(5, 1fr)', gap: '4px', marginTop: '4px' }}>
              <div />
              {TRACKS.map(track => (
                <button key={track.id} onClick={() => randomizeTrack(track.id)}
                  style={{
                    fontSize: '0.65rem', padding: '3px 4px',
                    border: `1px solid ${track.color}44`,
                    background: 'rgba(8,14,24,0.7)',
                    color: track.color, borderRadius: '3px', cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}>
                  🎲 {track.label.split(' ')[1]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Beat indicator */}
        <div style={{ display: 'flex', gap: '3px', marginTop: '0.6rem' }}>
          {Array.from({ length: STEPS }, (_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: '4px',
                background: i === currentStep && playing
                  ? (i % 4 === 0 ? 'var(--green)' : 'var(--cyan)')
                  : i % 4 === 0 ? 'rgba(96,239,255,0.2)' : 'rgba(96,239,255,0.06)',
                borderRadius: '2px',
                transition: 'background 0.05s',
                boxShadow: i === currentStep && playing ? '0 0 6px var(--green)' : 'none',
              }}
            />
          ))}
        </div>

        <div style={{ marginTop: '0.4rem', color: '#89b9c0', fontSize: '0.75rem' }}>
          {playing
            ? `▶ ${bpm} BPM — step ${currentStep + 1}/16`
            : 'Click ▶ Play to start. Click any cell to toggle it. Scroll for more controls.'}
        </div>
      </div>
    </div>
  );
});

const panelStyle: React.CSSProperties = {
  background: 'var(--panel)',
  border: '1px solid var(--line)',
  borderRadius: '0.8rem',
  padding: '0.8rem',
};

function playBtnStyle(playing: boolean): React.CSSProperties {
  return {
    border: `1px solid ${playing ? 'var(--pink)' : 'var(--green)'}`,
    background: playing ? 'rgba(255,0,128,0.15)' : 'rgba(0,255,135,0.12)',
    color: playing ? 'var(--pink)' : 'var(--green)',
    padding: '0.5rem 1rem',
    cursor: 'pointer',
    borderRadius: '0.45rem',
    boxShadow: `0 0 14px ${playing ? 'rgba(255,0,128,0.3)' : 'rgba(0,255,135,0.25)'}`,
    fontSize: '0.9rem',
    fontWeight: 600,
  };
}

function smallBtnStyle(color: string): React.CSSProperties {
  return {
    border: `1px solid ${color}44`,
    background: 'rgba(8,14,24,0.8)',
    color,
    padding: '0.4rem 0.6rem',
    cursor: 'pointer',
    borderRadius: '0.45rem',
    fontSize: '0.82rem',
  };
}

const labelStyle: React.CSSProperties = {
  color: '#b5e9ef',
  fontSize: '0.82rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
};

export default BeatForge;
