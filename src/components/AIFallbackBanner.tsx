import React from 'react';
import { Sparkles } from 'lucide-react';

interface Props {
    message: string;
    onDismiss: () => void;
}

export default function AIFallbackBanner({ message, onDismiss }: Props) {
    return (
        <div className="fixed top-4 right-4 z-50 bg-amber-100 border border-amber-300 text-amber-900 px-4 py-2 rounded-lg shadow">
            <div className="flex items-center gap-3">
                <Sparkles size={16} />
                <div className="text-sm">{message}</div>
                <button className="ml-3 text-amber-900 underline" onClick={onDismiss}>Dismiss</button>
            </div>
        </div>
    );
}
