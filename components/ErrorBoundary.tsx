import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component that catches JavaScript errors anywhere in the child
 * component tree and displays a fallback UI instead of crashing the entire app.
 *
 * @example
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error details for debugging
    console.error('Error Boundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Optional: Send error to error tracking service
    // Example: logErrorToService(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="bg-red-50 border-b border-red-200 px-6 py-4 flex items-center space-x-3">
              <div className="bg-red-500 text-white p-3 rounded-lg">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-red-900">Oops! Something went wrong</h1>
                <p className="text-sm text-red-700">The application encountered an unexpected error</p>
              </div>
            </div>

            {/* Error Details */}
            <div className="px-6 py-6 space-y-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-2">Error Message</h2>
                <div className="bg-slate-100 rounded-lg p-4 border border-slate-200">
                  <p className="text-sm text-slate-800 font-mono">
                    {this.state.error?.toString() || 'Unknown error'}
                  </p>
                </div>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <div>
                  <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-2">Stack Trace</h2>
                  <div className="bg-slate-100 rounded-lg p-4 border border-slate-200 max-h-64 overflow-y-auto">
                    <pre className="text-xs text-slate-700 font-mono whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-800">
                      <strong>What you can do:</strong> Try refreshing the page or resetting the calculator.
                      If the problem persists, please report this issue on our GitHub repository.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-end space-x-3">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-opacity-90 transition-colors flex items-center space-x-2"
              >
                <RefreshCw size={16} />
                <span>Reload Page</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
