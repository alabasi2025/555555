import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Check if it's a tRPC error
    if (this.isTRPCError(error)) {
      console.error('tRPC Error:', this.getTRPCErrorMessage(error));
    }

    // Check if it's a network error
    if (this.isNetworkError(error)) {
      console.error('Network Error:', error.message);
    }
  }

  isTRPCError(error: Error): boolean {
    return error.message.includes('TRPC') || error.message.includes('tRPC');
  }

  isNetworkError(error: Error): boolean {
    return (
      error.message.includes('Network') ||
      error.message.includes('fetch') ||
      error.message.includes('Failed to fetch')
    );
  }

  getTRPCErrorMessage(error: Error): string {
    try {
      const match = error.message.match(/message: "(.+?)"/);  
      return match ? match[1] : error.message;
    } catch {
      return error.message;
    }
  }

  getErrorMessage(): string {
    const { error } = this.state;
    if (!error) return 'حدث خطأ غير متوقع';

    if (this.isTRPCError(error)) {
      return `خطأ في الاتصال بالخادم: ${this.getTRPCErrorMessage(error)}`;
    }

    if (this.isNetworkError(error)) {
      return 'خطأ في الاتصال بالشبكة. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.';
    }

    return error.message || 'حدث خطأ غير متوقع';
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-8 bg-background">
          <div className="flex flex-col items-center w-full max-w-2xl p-8">
            <AlertTriangle
              size={48}
              className="text-destructive mb-6 flex-shrink-0"
            />

            <h2 className="text-xl mb-4">عذراً، حدث خطأ!</h2>

            <p className="text-muted-foreground mb-4">{this.getErrorMessage()}</p>

            <div className="p-4 w-full rounded bg-muted overflow-auto mb-6">
              <pre className="text-sm text-muted-foreground whitespace-break-spaces">
                {this.state.error?.stack}
              </pre>
            </div>

            <button
              onClick={() => window.location.reload()}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg",
                "bg-primary text-primary-foreground",
                "hover:opacity-90 cursor-pointer"
              )}
            >
              <RotateCcw size={16} />
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
