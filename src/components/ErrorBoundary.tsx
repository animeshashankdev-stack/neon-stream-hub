import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props { children: ReactNode }
interface State { error: Error | null }

/** Prevents a blank white screen when a page throws at render time. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("App crashed:", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="min-h-screen bg-[#1a1a2e] text-white flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center space-y-4">
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="text-sm text-white/60 break-words">{this.state.error.message}</p>
          <button
            onClick={() => { window.location.href = "/"; }}
            className="px-5 py-2.5 rounded-xl bg-[#4ade80] text-[#1a1a2e] font-semibold"
          >
            Back to home
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;