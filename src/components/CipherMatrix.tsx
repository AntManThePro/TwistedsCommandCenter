import React, { useRef, useEffect, useState, useCallback, memo } from 'react';

// ---------------------------------------------------------------------------
// Cipher implementations
// ---------------------------------------------------------------------------
type CipherKind = 'caesar' | 'rot13' | 'vigenere' | 'xor' | 'base64' | 'binary' | 'atbash';

function caesarEncode(text: string, shift: number): string {
  return text.replace(/[a-zA-Z]/g, ch => {
    const base = ch >= 'a' ? 97 : 65;
    return String.fromCharCode(((ch.charCodeAt(0) - base + shift + 26) % 26) + base);
  });
}

function vigenereEncode(text: string, key: string): string {
  if (!key) return text;
  const k = key.toLowerCase().replace(/[^a-z]/g, '') || 'key';
  let ki = 0;
  return text.replace(/[a-zA-Z]/g, ch => {
    const base = ch >= 'a' ? 97 : 65;
    const shift = k.charCodeAt(ki % k.length) - 97;
    ki++;
    return String.fromCharCode(((ch.charCodeAt(0) - base + shift) % 26) + base);
  });
}

function xorEncode(text: string, key: string): string {
  const k = key || 'NEXUS';
  return text
    .split('')
    .map((ch, i) => {
      const xored = ch.charCodeAt(0) ^ k.charCodeAt(i % k.length);
      return xored >= 32 && xored < 127
        ? String.fromCharCode(xored)
        : `\\x${xored.toString(16).padStart(2, '0')}`;
    })
    .join('');
}

function toBinary(text: string): string {
  return text
    .split('')
    .map(ch => ch.charCodeAt(0).toString(2).padStart(8, '0'))
    .join(' ');
}

function toBase64(text: string): string {
  // Prefer TextEncoder so arbitrary Unicode is supported without exceptions.
  if (typeof TextEncoder !== 'undefined') {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(text);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  // Fallbacks for environments without TextEncoder.
  try {
    return btoa(text);
  } catch {
    // Last-resort legacy fallback; may not handle all inputs but avoids crashes.
    return btoa(unescape(encodeURIComponent(text)));
  }
}

function atbashEncode(text: string): string {
  return text.replace(/[a-zA-Z]/g, ch => {
    const base = ch >= 'a' ? 97 : 65;
    return String.fromCharCode(base + 25 - (ch.charCodeAt(0) - base));
  });
}

function encode(text: string, cipher: CipherKind, key: string, shift: number): string {
  switch (cipher) {
    case 'caesar': return caesarEncode(text, shift);
    case 'rot13': return caesarEncode(text, 13);
    case 'vigenere': return vigenereEncode(text, key);
    case 'xor': return xorEncode(text, key);
    case 'base64': return toBase64(text);
    case 'binary': return toBinary(text);
    case 'atbash': return atbashEncode(text);
  }
}

// ---------------------------------------------------------------------------
// Canvas "data river" animation
// ---------------------------------------------------------------------------
interface DataColumn {
  x: number;
  chars: string[];
  y: number;       // current head position
  speed: number;
  color: string;
}

const NEXUS_COLORS = ['#00ff87', '#60efff', '#ff0080', '#ffcc00'];
const MATRIX_CHARS = '01アイウエオカキクケコ∑Δ∇∫αβγ!@#$%^&*~<>?⟨⟩';

function randomChar(): string {
  return MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const CipherMatrix = memo(function CipherMatrix() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colsRef = useRef<DataColumn[]>([]);
  const animIdRef = useRef<number>(0);

  const [cipher, setCipher] = useState<CipherKind>('caesar');
  const [inputText, setInputText] = useState('Hello NEXUS');
  const [key, setKey] = useState('NEXUS');
  const [shift, setShift] = useState(7);
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  // Re-encode whenever inputs change
  useEffect(() => {
    setOutput(encode(inputText, cipher, key, shift));
  }, [inputText, cipher, key, shift]);

  // -------------------------------------------------------------------------
  // Canvas animation
  // -------------------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth ?? 700;
      canvas.height = 200;

      const charW = 14;
      const count = Math.floor(canvas.width / charW);
      colsRef.current = Array.from({ length: count }, (_, i) => ({
        x: i * charW + 7,
        chars: Array.from({ length: 20 }, randomChar),
        y: Math.random() * -canvas.height,
        speed: 1.5 + Math.random() * 3,
        color: NEXUS_COLORS[i % NEXUS_COLORS.length],
      }));
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      ctx.fillStyle = 'rgba(5,7,13,0.18)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = '12px monospace';

      for (const col of colsRef.current) {
        col.y += col.speed;
        if (col.y > canvas.height + 200) {
          col.y = -20 - Math.random() * 200;
          col.speed = 1.5 + Math.random() * 3;
        }

        // Randomly mutate chars
        if (Math.random() < 0.08) {
          const idx = Math.floor(Math.random() * col.chars.length);
          col.chars[idx] = randomChar();
        }

        for (let i = 0; i < col.chars.length; i++) {
          const cy = col.y - i * 14;
          if (cy < -14 || cy > canvas.height + 14) continue;
          const brightness = 1 - i / col.chars.length;
          ctx.globalAlpha = brightness * 0.85;
          ctx.fillStyle = col.color;
          ctx.fillText(col.chars[i], col.x - 6, cy);
        }
      }
      ctx.globalAlpha = 1;

      animIdRef.current = requestAnimationFrame(draw);
    };
    animIdRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animIdRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const copyOutput = useCallback(() => {
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }, [output]);

  // -------------------------------------------------------------------------
  // Diff highlight — char positions that changed
  // -------------------------------------------------------------------------
  const diffHighlight = useCallback((a: string, b: string) => {
    const maxLen = Math.max(a.length, b.length);
    return Array.from({ length: maxLen }, (_, i) => a[i] !== b[i]);
  }, []);

  const diffs = diffHighlight(inputText, output);

  const cipherLabels: Record<CipherKind, string> = {
    caesar: 'Caesar Cipher',
    rot13: 'ROT-13',
    vigenere: 'Vigenère',
    xor: 'XOR Cipher',
    base64: 'Base64',
    binary: 'Binary',
    atbash: 'Atbash',
  };

  const needsKey = cipher === 'vigenere' || cipher === 'xor';
  const needsShift = cipher === 'caesar';

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      {/* Info panel */}
      <div style={panelStyle}>
        <h2 style={{ margin: '0 0 0.3rem', color: 'var(--pink)' }}>CipherMatrix</h2>
        <p style={{ margin: '0 0 0.7rem', color: '#b5e9ef', fontSize: '0.9rem' }}>
          Real-time encryption visualizer. Type any message and watch it transform through classic
          cipher algorithms — character by character, live.
        </p>

        {/* Cipher selector */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.6rem' }}>
          {(Object.keys(cipherLabels) as CipherKind[]).map(c => (
            <button key={c} onClick={() => setCipher(c)} style={btnStyle(cipher === c)}>
              {cipherLabels[c]}
            </button>
          ))}
        </div>

        {/* Parameters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '0.6rem', alignItems: 'center' }}>
          {needsKey && (
            <label style={labelStyle}>
              Key:
              <input
                type="text"
                value={key}
                maxLength={32}
                onChange={e => setKey(e.target.value)}
                style={inputStyle}
              />
            </label>
          )}
          {needsShift && (
            <label style={labelStyle}>
              Shift ({shift}):
              <input
                type="range"
                min={1}
                max={25}
                value={shift}
                onChange={e => setShift(Number(e.target.value))}
                style={{ accentColor: 'var(--pink)', width: '100px' }}
              />
            </label>
          )}
        </div>

        {/* I/O grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
          <div>
            <div style={{ color: 'var(--cyan)', fontSize: '0.78rem', marginBottom: '0.3rem', letterSpacing: '0.06em' }}>
              PLAINTEXT INPUT
            </div>
            <textarea
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              maxLength={500}
              rows={4}
              style={textAreaStyle('#60efff')}
              spellCheck={false}
            />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
              <span style={{ color: 'var(--pink)', fontSize: '0.78rem', letterSpacing: '0.06em' }}>
                ENCRYPTED OUTPUT
              </span>
              <button onClick={copyOutput} style={copyBtnStyle}>
                {copied ? '✅ Copied' : '📋 Copy'}
              </button>
            </div>
            <div
              style={{
                ...textAreaStyle('#ff0080'),
                fontFamily: 'monospace',
                wordBreak: 'break-all',
                overflowY: 'auto' as const,
                whiteSpace: 'pre-wrap',
                minHeight: '96px',
              }}
              role="region"
              aria-label="encrypted output"
            >
              {output.split('').map((ch, i) => (
                <span
                  key={i}
                  style={{ color: diffs[i] ? 'var(--yellow)' : 'var(--pink)' }}
                >
                  {ch}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1.2rem', flexWrap: 'wrap' }}>
          <Stat label="Input chars" value={inputText.length} color="var(--cyan)" />
          <Stat label="Output chars" value={output.length} color="var(--pink)" />
          <Stat
            label="Changed"
            value={diffs.filter(Boolean).length}
            color="var(--yellow)"
          />
          <Stat label="Algorithm" value={cipherLabels[cipher]} color="var(--green)" />
        </div>
      </div>

      {/* Matrix canvas */}
      <div style={{ position: 'relative', borderRadius: '0.8rem', overflow: 'hidden', border: '1px solid var(--line)' }}>
        <canvas
          ref={canvasRef}
          style={{ width: '100%', display: 'block', background: 'rgba(3,6,12,0.95)' }}
          aria-label="CipherMatrix data-rain animation"
        />
        <div style={{
          position: 'absolute',
          bottom: '0.5rem',
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'rgba(96,239,255,0.4)',
          fontSize: '0.7rem',
          letterSpacing: '0.12em',
          pointerEvents: 'none',
        }}>
          NEXUS // CIPHER DATA STREAM
        </div>
      </div>
    </div>
  );
});

function Stat({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
      <span style={{ color: '#89b9c0', fontSize: '0.7rem', letterSpacing: '0.05em' }}>{label}</span>
      <span style={{ color, fontSize: '0.9rem', fontWeight: 600 }}>{value}</span>
    </div>
  );
}

const panelStyle: React.CSSProperties = {
  background: 'var(--panel)',
  border: '1px solid var(--line)',
  borderRadius: '0.8rem',
  padding: '0.8rem',
};

function btnStyle(active: boolean): React.CSSProperties {
  return {
    border: `1px solid ${active ? 'var(--pink)' : 'rgba(255,0,128,0.25)'}`,
    background: active ? 'rgba(255,0,128,0.15)' : 'rgba(8,14,24,0.8)',
    color: active ? '#ff80bf' : '#c2f9ff',
    padding: '0.38rem 0.6rem',
    cursor: 'pointer',
    borderRadius: '0.45rem',
    boxShadow: active ? '0 0 10px rgba(255,0,128,0.3)' : 'none',
    fontSize: '0.8rem',
  };
}

const labelStyle: React.CSSProperties = {
  color: '#b5e9ef',
  fontSize: '0.82rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
};

const inputStyle: React.CSSProperties = {
  background: 'rgba(8,14,24,0.9)',
  border: '1px solid rgba(96,239,255,0.3)',
  color: '#dffcff',
  padding: '0.3rem 0.5rem',
  borderRadius: '0.4rem',
  fontSize: '0.85rem',
  fontFamily: 'monospace',
  width: '120px',
};

function textAreaStyle(accentColor: string): React.CSSProperties {
  return {
    background: 'rgba(5,10,18,0.9)',
    border: `1px solid ${accentColor}44`,
    color: '#dffcff',
    padding: '0.5rem',
    borderRadius: '0.5rem',
    fontSize: '0.85rem',
    fontFamily: 'monospace',
    resize: 'vertical' as const,
    width: '100%',
    boxSizing: 'border-box' as const,
  };
}

const copyBtnStyle: React.CSSProperties = {
  background: 'rgba(255,0,128,0.12)',
  border: '1px solid rgba(255,0,128,0.35)',
  color: '#ff80bf',
  padding: '0.2rem 0.5rem',
  borderRadius: '0.4rem',
  cursor: 'pointer',
  fontSize: '0.75rem',
};

export default CipherMatrix;
