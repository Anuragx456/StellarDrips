"use client";

import { Component, type ReactNode, type ErrorInfo } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
          <span className="text-4xl">⚠️</span>
          <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200">
            Something went wrong
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center max-w-md">
            {this.state.error?.message ?? "An unexpected error occurred."}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="rounded-lg bg-[var(--brand)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--brand-hover)] transition-colors cursor-pointer"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
