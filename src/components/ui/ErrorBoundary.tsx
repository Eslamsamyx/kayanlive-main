'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} onReset={() => this.setState({ hasError: false })} />;
    }

    return this.props.children;
  }
}

function ErrorFallback({ error, onReset }: { error?: Error; onReset: () => void }) {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div
        className="max-w-md w-full p-8 rounded-[25px] text-center"
        style={{
          background: 'rgba(255, 255, 255, 0.01)',
          backdropFilter: 'blur(50.5px)',
          WebkitBackdropFilter: 'blur(50.5px)',
          border: '2px solid rgba(122, 253, 214, 0.3)'
        }}
      >
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-red-600/20 rounded-[20px]">
            <AlertTriangle className="w-12 h-12 text-red-400" />
          </div>
        </div>

        <h1
          className="text-2xl font-bold text-white mb-4"
          style={{ fontFamily: '"Poppins", sans-serif' }}
        >
          Something went wrong
        </h1>

        <p
          className="text-[#888888] mb-6"
          style={{ fontFamily: '"Poppins", sans-serif' }}
        >
          {error?.message || 'An unexpected error occurred. Please try again.'}
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onReset}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-[#7afdd6] text-[#2c2c2b] rounded-[15px] font-medium hover:opacity-80 transition-opacity"
            style={{ fontFamily: '"Poppins", sans-serif' }}
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <button
            onClick={() => router.push('/admin')}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-white/10 text-white rounded-[15px] font-medium hover:bg-white/20 transition-colors"
            style={{ fontFamily: '"Poppins", sans-serif' }}
          >
            <Home className="w-4 h-4" />
            Go Home
          </button>
        </div>

        {process.env.NODE_ENV === 'development' && error && (
          <details className="mt-6 text-left">
            <summary className="text-[#888888] cursor-pointer text-sm mb-2">
              Technical Details
            </summary>
            <pre className="text-xs text-red-400 bg-black/20 p-3 rounded-lg overflow-auto">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

export default ErrorBoundary;