import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div
          style={{
            minHeight: '200px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            background: 'rgba(255, 0, 128, 0.05)',
            border: '1px solid rgba(255, 0, 128, 0.4)',
            borderRadius: '0.8rem',
            color: '#ff0080',
            textAlign: 'center',
          }}
        >
          <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>⚠ Component Error</h2>
          <p style={{ color: '#b5e9ef', fontSize: '0.9rem', marginBottom: '1rem' }}>
            {this.state.error?.message ?? 'An unexpected error occurred.'}
          </p>
          <button
            onClick={this.handleReset}
            style={{
              border: '1px solid rgba(255,0,128,0.5)',
              background: 'rgba(255,0,128,0.12)',
              color: '#ffd4eb',
              padding: '0.4rem 0.8rem',
              borderRadius: '0.45rem',
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
