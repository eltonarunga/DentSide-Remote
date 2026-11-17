import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public readonly props!: Props;

  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-on-surface p-4 font-body">
          <div className="max-w-md w-full bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant">
            <h2 className="text-2xl font-bold text-on-surface mb-3 tracking-tight font-headline">
              Something went wrong
            </h2>
            <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
              An unexpected error occurred. Please refresh the page to restore your session.
            </p>
            <div className="bg-surface-container p-4 rounded-xl border border-outline-variant text-xs font-mono text-on-surface break-words mb-6 overflow-auto max-h-40">
              {this.state.error?.message}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white py-3 px-5 rounded-xl text-sm font-semibold transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
