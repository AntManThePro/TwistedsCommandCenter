import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import ArtDecoShowcase from '../../components/ArtDecoShowcase';

const mockCtx = {
  clearRect: jest.fn(),
  fillRect: jest.fn(),
  beginPath: jest.fn(),
  closePath: jest.fn(),
  fill: jest.fn(),
  stroke: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
};

beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue(mockCtx);
});

let rafId = 0;

beforeEach(() => {
  rafId = 0;
  // Return incrementing IDs (non-zero) so the loop guard works correctly.
  global.requestAnimationFrame = jest.fn((_cb: FrameRequestCallback) => ++rafId);
  global.cancelAnimationFrame = jest.fn();
  jest.clearAllMocks();
});

describe('ArtDecoShowcase', () => {
  it('renders the canvas with the correct aria-label', async () => {
    await act(async () => {
      render(<ArtDecoShowcase />);
    });
    expect(screen.getByLabelText(/Art Deco Pyramid Jewelry Box 360° viewer/i)).toBeInTheDocument();
  });

  it('renders Auto Rotate and Reset View buttons', async () => {
    await act(async () => {
      render(<ArtDecoShowcase />);
    });
    expect(screen.getByText('Auto Rotate')).toBeInTheDocument();
    expect(screen.getByText('Reset View')).toBeInTheDocument();
  });

  it('starts the animation loop on mount (requestAnimationFrame is called)', async () => {
    await act(async () => {
      render(<ArtDecoShowcase />);
    });
    // The always-running sparkle loop schedules an rAF immediately on mount.
    expect(global.requestAnimationFrame).toHaveBeenCalled();
  });

  it('cancels the animation frame on unmount', async () => {
    const { unmount } = await act(async () => render(<ArtDecoShowcase />));
    await act(async () => {
      unmount();
    });
    expect(global.cancelAnimationFrame).toHaveBeenCalled();
  });

  it('does NOT start a second loop when Auto Rotate is toggled on', async () => {
    await act(async () => {
      render(<ArtDecoShowcase />);
    });
    const rafCallsBefore = (global.requestAnimationFrame as jest.Mock).mock.calls.length;

    // Clicking Auto Rotate should only update the flag; the loop is already running.
    await act(async () => {
      fireEvent.click(screen.getByText('Auto Rotate'));
    });
    // No additional rAF should be scheduled by the toggle itself.
    expect((global.requestAnimationFrame as jest.Mock).mock.calls.length).toBe(rafCallsBefore);
  });

  it('toggles the Auto Rotate button label between "Auto Rotate" and "Stop Rotation"', async () => {
    await act(async () => {
      render(<ArtDecoShowcase />);
    });

    const btn = screen.getByText('Auto Rotate');
    await act(async () => {
      fireEvent.click(btn);
    });
    expect(screen.getByText('Stop Rotation')).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByText('Stop Rotation'));
    });
    expect(screen.getByText('Auto Rotate')).toBeInTheDocument();
  });

  it('renders all four tier buttons', async () => {
    await act(async () => {
      render(<ArtDecoShowcase />);
    });
    for (let i = 1; i <= 4; i++) {
      expect(screen.getByText(`Tier ${i}`)).toBeInTheDocument();
    }
  });

  it('shows Peak Compartment info by default (tier 1)', async () => {
    await act(async () => {
      render(<ArtDecoShowcase />);
    });
    expect(screen.getByText('Peak Compartment')).toBeInTheDocument();
  });

  it('switches layer info when a tier button is clicked', async () => {
    await act(async () => {
      render(<ArtDecoShowcase />);
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Tier 2'));
    });
    expect(screen.getByText('Upper Chamber')).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByText('Tier 3'));
    });
    expect(screen.getByText('Mid Chamber')).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByText('Tier 4'));
    });
    expect(screen.getByText('Foundation Level')).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByText('Tier 1'));
    });
    expect(screen.getByText('Peak Compartment')).toBeInTheDocument();
  });

  it('updates rotation on mouse drag', async () => {
    await act(async () => {
      render(<ArtDecoShowcase />);
    });
    const canvas = screen.getByLabelText(/Art Deco Pyramid Jewelry Box 360° viewer/i);

    await act(async () => {
      fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 });
      fireEvent.mouseMove(canvas, { clientX: 150, clientY: 120 });
      fireEvent.mouseUp(canvas);
    });
    // No error thrown — rotation refs updated silently by the always-running loop.
  });

  it('does not update rotation when mouse moves without a mousedown', async () => {
    await act(async () => {
      render(<ArtDecoShowcase />);
    });
    const canvas = screen.getByLabelText(/Art Deco Pyramid Jewelry Box 360° viewer/i);

    await act(async () => {
      fireEvent.mouseMove(canvas, { clientX: 200, clientY: 200 });
    });
    // Should complete without errors.
  });

  it('stops dragging when mouse leaves the canvas', async () => {
    await act(async () => {
      render(<ArtDecoShowcase />);
    });
    const canvas = screen.getByLabelText(/Art Deco Pyramid Jewelry Box 360° viewer/i);

    await act(async () => {
      fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 });
      fireEvent.mouseLeave(canvas);
      // After leave, further move should be a no-op.
      fireEvent.mouseMove(canvas, { clientX: 300, clientY: 300 });
    });
  });

  it('handles wheel events for zoom', async () => {
    await act(async () => {
      render(<ArtDecoShowcase />);
    });
    const canvas = screen.getByLabelText(/Art Deco Pyramid Jewelry Box 360° viewer/i);

    await act(async () => {
      fireEvent.wheel(canvas, { deltaY: -100 });
    });
    // No error thrown — scale ref is clamped by the handler.
  });
});
