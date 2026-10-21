import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('YOYO CAKES Uncaught UI Exception:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[var(--color-brand-cream)] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-[var(--color-brand-primary-light)]/40 shadow-elevated text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--color-brand-error)]/10 text-[var(--color-brand-error)] flex items-center justify-center mx-auto mb-5">
              <AlertTriangle size={32} />
            </div>

            <span className="text-xs font-semibold tracking-widest uppercase text-[var(--color-brand-primary-dark)] block mb-1">
              YOYO CAKES Bakery
            </span>
            <h1 className="font-heading text-2xl font-bold text-[var(--color-brand-chocolate)] mb-3">
              Something Needs a Fresh Bake
            </h1>
            <p className="text-sm text-[var(--color-brand-muted)] leading-relaxed mb-6">
              An unexpected hiccup occurred while preparing this page. Don't worry, your cart and preferences are safe!
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={this.handleReload}
                className="btn-secondary text-xs px-5 py-2.5 flex items-center justify-center gap-2"
              >
                <RotateCcw size={16} /> Reload Page
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="btn-primary text-xs px-5 py-2.5 flex items-center justify-center gap-2"
              >
                <Home size={16} /> Back to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
