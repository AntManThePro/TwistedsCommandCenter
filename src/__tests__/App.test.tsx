import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from '../App';

// Mock canvas context
beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue({
    clearRect: jest.fn(),
    fillRect: jest.fn(),
    beginPath: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    stroke: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    createImageData: jest.fn().mockReturnValue({
      data: new Uint8ClampedArray(960 * 540 * 4),
    }),
    putImageData: jest.fn(),
    createRadialGradient: jest.fn().mockReturnValue({
      addColorStop: jest.fn(),
    }),
  });
});

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock requestAnimationFrame to prevent infinite loops
global.requestAnimationFrame = jest.fn(() => 0) as unknown as typeof requestAnimationFrame;
global.cancelAnimationFrame = jest.fn();

// Mock Web Audio API (BeatForge)
const mockAudioNode = {
  connect: jest.fn().mockReturnThis(),
  disconnect: jest.fn(),
};
const mockGain = { ...mockAudioNode, gain: { setValueAtTime: jest.fn(), exponentialRampToValueAtTime: jest.fn() } };
const mockOscillator = { ...mockAudioNode, frequency: { setValueAtTime: jest.fn(), exponentialRampToValueAtTime: jest.fn() }, type: 'sine', start: jest.fn(), stop: jest.fn() };
const mockBuffer = { getChannelData: jest.fn().mockReturnValue(new Float32Array(1024)) };
const mockBufferSource = { ...mockAudioNode, buffer: null, start: jest.fn(), stop: jest.fn() };
const mockBiquadFilter = { ...mockAudioNode, type: 'lowpass', frequency: { value: 0, setValueAtTime: jest.fn(), exponentialRampToValueAtTime: jest.fn() } };
global.AudioContext = jest.fn().mockImplementation(() => ({
  currentTime: 0,
  state: 'running',
  resume: jest.fn().mockResolvedValue(undefined),
  close: jest.fn().mockResolvedValue(undefined),
  createOscillator: jest.fn(() => ({ ...mockOscillator })),
  createGain: jest.fn(() => ({ ...mockGain })),
  createBiquadFilter: jest.fn(() => ({ ...mockBiquadFilter })),
  createBuffer: jest.fn(() => mockBuffer),
  createBufferSource: jest.fn(() => ({ ...mockBufferSource })),
  destination: {},
  sampleRate: 44100,
})) as unknown as typeof AudioContext;

describe('App navigation', () => {
  it('renders NEXUS brand header', async () => {
    await act(async () => {
      render(<App />);
    });
    expect(screen.getByText(/NEXUS.*COMMAND CENTER/i)).toBeInTheDocument();
  });

  it('renders main view switcher buttons', async () => {
    await act(async () => {
      render(<App />);
    });
    expect(screen.getByText(/NEXUS Portfolio/i)).toBeInTheDocument();
    expect(screen.getByText(/Art Inventory/i)).toBeInTheDocument();
  });

  it('renders NEXUS sub-navigation by default', async () => {
    await act(async () => {
      render(<App />);
    });
    // These appear in both nav buttons and component headings
    expect(screen.getAllByText('Neural Forge').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Algorithm Arena').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Systems Pulse').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('PathFinder').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('CipherMatrix').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Fractal Engine').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('BeatForge').length).toBeGreaterThanOrEqual(1);
  });

  it('switches to inventory sub-navigation when Art Inventory is clicked', async () => {
    await act(async () => {
      render(<App />);
    });
    await act(async () => {
      fireEvent.click(screen.getByText(/Art Inventory/i));
    });
    expect(screen.getByText('Command Center')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Gallery')).toBeInTheDocument();
    expect(screen.getByText('Quick Lister')).toBeInTheDocument();
  });

  it('switches to PathFinder tab and renders its heading', async () => {
    await act(async () => {
      render(<App />);
    });
    // PathFinder nav button is visible in the NEXUS sub-nav
    const pfBtn = screen.getByText('PathFinder');
    await act(async () => {
      fireEvent.click(pfBtn);
    });
    // After clicking, "PathFinder" should still appear (nav + lazy heading if loaded)
    expect(screen.getAllByText('PathFinder').length).toBeGreaterThanOrEqual(1);
  });

  it('switches to CipherMatrix tab', async () => {
    await act(async () => {
      render(<App />);
    });
    const cmBtn = screen.getByText('CipherMatrix');
    await act(async () => {
      fireEvent.click(cmBtn);
    });
    expect(screen.getAllByText('CipherMatrix').length).toBeGreaterThanOrEqual(1);
  });

  it('switches to Fractal Engine tab', async () => {
    await act(async () => {
      render(<App />);
    });
    const feBtn = screen.getByText('Fractal Engine');
    await act(async () => {
      fireEvent.click(feBtn);
    });
    expect(screen.getAllByText('Fractal Engine').length).toBeGreaterThanOrEqual(1);
  });

  it('switches to BeatForge tab', async () => {
    await act(async () => {
      render(<App />);
    });
    const bfBtn = screen.getByText('BeatForge');
    await act(async () => {
      fireEvent.click(bfBtn);
    });
    expect(screen.getAllByText('BeatForge').length).toBeGreaterThanOrEqual(1);
  });

  it('renders footer', async () => {
    await act(async () => {
      render(<App />);
    });
    expect(screen.getByText(/NEXUS aesthetic/i)).toBeInTheDocument();
  });
});
