import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AgentHQ, { AGENT_ROSTER } from '../../components/AgentHQ';

describe('AgentHQ', () => {
  it('renders the heading', () => {
    render(<AgentHQ />);
    expect(screen.getByText(/AGENT HQ.*DELEGATION MATRIX/i)).toBeInTheDocument();
  });

  it('renders all agents in the roster', () => {
    render(<AgentHQ />);
    for (const agent of AGENT_ROSTER) {
      expect(screen.getByTestId(`agent-card-${agent.id}`)).toBeInTheDocument();
    }
  });

  it('renders agent codenames', () => {
    render(<AgentHQ />);
    expect(screen.getAllByText('PixelReaper').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('PriceOracle').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('GalleryGhost').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('SalesBanshee').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('DataVoodoo').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('CryptoMuse').length).toBeGreaterThanOrEqual(1);
  });

  it('shows detail panel for the first agent by default', () => {
    render(<AgentHQ />);
    const detail = screen.getByTestId('agent-detail');
    expect(detail).toBeInTheDocument();
    // First agent is PixelReaper
    expect(detail.textContent).toContain('PixelReaper');
  });

  it('selects a different agent on card click', () => {
    render(<AgentHQ />);
    // Click on PriceOracle card
    fireEvent.click(screen.getByTestId('agent-card-price-oracle'));
    const detail = screen.getByTestId('agent-detail');
    expect(detail.textContent).toContain('PriceOracle');
  });

  it('shows the selected agent tools in the detail panel', () => {
    render(<AgentHQ />);
    // PixelReaper is selected by default — verify its tools appear
    expect(screen.getByTestId('tool-vision-ai')).toBeInTheDocument();
    expect(screen.getByTestId('tool-seo-opt')).toBeInTheDocument();
    expect(screen.getByTestId('tool-copy-gen')).toBeInTheDocument();
  });

  it('switches tool loadout when another agent is selected', () => {
    render(<AgentHQ />);
    fireEvent.click(screen.getByTestId('agent-card-data-voodoo'));
    expect(screen.getByTestId('tool-stats-engine')).toBeInTheDocument();
    expect(screen.getByTestId('tool-trend-det')).toBeInTheDocument();
    expect(screen.getByTestId('tool-dash-builder')).toBeInTheDocument();
  });

  it('AGENT_ROSTER has 6 agents', () => {
    expect(AGENT_ROSTER).toHaveLength(6);
  });

  it('every agent has at least 3 tools', () => {
    for (const agent of AGENT_ROSTER) {
      expect(agent.tools.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('renders status indicators', () => {
    render(<AgentHQ />);
    // At least one status label should be present
    const activeLabels = screen.queryAllByText(/ACTIVE/);
    const idleLabels = screen.queryAllByText(/IDLE/);
    expect(activeLabels.length + idleLabels.length).toBeGreaterThan(0);
  });
});
