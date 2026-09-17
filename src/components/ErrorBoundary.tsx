import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCw, Home, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught runtime error caught by ErrorBoundary:", error, errorInfo);
    this.setState({ error, errorInfo });

    // Auto-recover from CSS preload failures or stale chunk mismatches
    const msg = (error?.message || "").toLowerCase();
    if (
      msg.includes("unable to preload css") ||
      msg.includes("failed to fetch dynamically imported module") ||
      msg.includes("dynamically imported module") ||
      msg.includes("loading chunk")
    ) {
      const key = "eb_preload_retry_ts";
      const last = sessionStorage.getItem(key);
      const now = Date.now();
      if (!last || now - parseInt(last, 10) > 8000) {
        sessionStorage.setItem(key, now.toString());
        window.location.reload();
      }
    }
  }

  private handleReset = () => {
    // Reset body style locks in case of error
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-2xl border border-white/10 bg-slate-900/90 p-6 sm:p-8 text-center space-y-5 shadow-2xl backdrop-blur-md">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto shadow-inner">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">
                কিছু সমস্যা হয়েছে (Something went wrong)
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                পেজটি লোড করার সময় একটি ত্রুটি দেখা দিয়েছে। নিচের বাটনগুলোতে ক্লিক করে পেজটি আবার চালু করতে পারেন।
              </p>
              {this.state.error && (
                <div className="mt-3 p-3 rounded-lg bg-black/50 text-left overflow-x-auto space-y-2 border border-red-500/20">
                  <p className="text-[11px] font-mono text-red-300 font-semibold break-all">
                    {this.state.error.message || String(this.state.error)}
                  </p>
                  {this.state.error.stack && (
                    <details className="text-[10px] font-mono text-gray-400">
                      <summary className="cursor-pointer hover:text-gray-200">View Stack Trace</summary>
                      <pre className="mt-1 whitespace-pre-wrap text-gray-400 max-h-40 overflow-y-auto">
                        {this.state.error.stack}
                      </pre>
                    </details>
                  )}
                  {this.state.errorInfo?.componentStack && (
                    <details className="text-[10px] font-mono text-gray-400">
                      <summary className="cursor-pointer hover:text-gray-200">View Component Stack</summary>
                      <pre className="mt-1 whitespace-pre-wrap text-gray-400 max-h-40 overflow-y-auto">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
              <Button
                onClick={() => {
                  this.handleReset();
                  try {
                    sessionStorage.clear();
                  } catch (e) {}
                  window.location.href = window.location.pathname + (window.location.search ? window.location.search + '&_r=' : '?_r=') + Date.now();
                }}
                className="w-full sm:w-auto bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs rounded-xl h-10 px-4 flex items-center justify-center gap-2 shadow-md"
              >
                <RefreshCw className="w-4 h-4" />
                <span>ক্লিয়ার ক্যাশ ও রিলোড (Reload)</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  this.handleReset();
                  window.location.href = "/courses";
                }}
                className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10 font-semibold text-xs rounded-xl h-10 px-4 flex items-center justify-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-brand-400" />
                <span>সকল কোর্স দেখুন (Courses)</span>
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
