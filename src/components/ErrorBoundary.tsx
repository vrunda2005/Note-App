// components/ErrorBoundary.tsx
"use client";

import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";

function ErrorFallback({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
            <h1 className="text-2xl font-bold text-red-600">Something went wrong</h1>
            <p className="mt-2 text-gray-500">{error.message}</p>
            <button
                onClick={resetErrorBoundary}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
                Try again
            </button>
        </div>
    );
}

export default function ErrorBoundary({ children }: { children: React.ReactNode }) {
    return (
        <ReactErrorBoundary
            FallbackComponent={ErrorFallback}
            onReset={() => {
                // Optional: refresh page or reset global state
                window.location.reload();
            }}
        >
            {children}
        </ReactErrorBoundary>
    );
}
