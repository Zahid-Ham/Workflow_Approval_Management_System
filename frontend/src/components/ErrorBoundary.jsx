import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.errorContainer}>
          <div style={styles.card}>
            <h2 style={styles.title}>Something went wrong</h2>
            <p style={styles.message}>
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </p>
            <button
              style={styles.button}
              onClick={() => window.location.reload()}
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles = {
  errorContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#1a1a1a',
    color: '#ffffff',
    fontFamily: 'system-ui, sans-serif',
    padding: '20px',
  },
  card: {
    backgroundColor: '#2d2d2d',
    padding: '30px',
    borderRadius: '8px',
    maxWidth: '500px',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
  },
  title: {
    margin: '0 0 15px 0',
    color: '#ff4d4d',
    fontSize: '24px',
  },
  message: {
    color: '#cccccc',
    marginBottom: '20px',
    fontSize: '16px',
    lineHeight: '1.5',
  },
  button: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    transition: 'background-color 0.2s',
  },
};

export default ErrorBoundary;
