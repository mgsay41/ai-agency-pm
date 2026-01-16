"use client";

import { Component, ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Error boundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-[#171717]">
                Something went wrong
              </h1>
              <p className="text-sm text-[#525252]">
                We encountered an unexpected error. Please try again.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-[#FEF2F2] border border-[#FCA5A5] rounded-lg p-4">
                <p className="text-sm text-[#DC2626] font-mono">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => this.setState({ hasError: false })}
                variant="outline"
                className="border-[#E5E5E5]"
              >
                Try Again
              </Button>
              <Button
                onClick={() => window.location.href = "/"}
                className="bg-[#18181B] hover:bg-[#27272A]"
              >
                Go Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
