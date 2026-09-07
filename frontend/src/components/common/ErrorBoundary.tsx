import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '../ui/Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#fcf9f2] font-sans text-[#1c1c18]">
          <div className="max-w-md w-full rounded-3xl border border-[#e5e2da] bg-[#f1eee7] p-8 text-center space-y-6 shadow-xl">
            <div className="h-14 w-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-xs">
              <AlertTriangle className="h-7 w-7" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-extrabold text-[#1c1c18] font-headline">
                Something unexpected happened
              </h1>
              <p className="text-xs text-[#484742] leading-relaxed">
                The application encountered a visual rendering issue. You can safely return to the home overview.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 rounded-xl bg-[#fcf9f2] border border-[#e5e2da] text-[11px] text-[#787770] font-mono text-left truncate">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() => window.location.reload()}
                leftIcon={<RefreshCw className="h-4 w-4" />}
              >
                Reload Page
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                onClick={this.handleReset}
                leftIcon={<Home className="h-4 w-4" />}
              >
                Go to Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
