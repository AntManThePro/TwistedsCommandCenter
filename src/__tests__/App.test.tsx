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

  it('renders footer', async () => {
    await act(async () => {
      render(<App />);
    });
    expect(screen.getByText(/NEXUS aesthetic/i)).toBeInTheDocument();
  });
});
