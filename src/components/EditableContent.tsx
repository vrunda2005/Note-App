import React, { useRef, useEffect } from 'react';

interface Props {
    html: string;
    onInput: () => void;
    readOnly?: boolean;
    // optional external ref so parent components can access the contentEditable DOM
    contentRef?: React.RefObject<HTMLDivElement | null>;
}

export default function EditableContent({ html, onInput, readOnly = false, contentRef }: Props) {
    const internalRef = useRef<HTMLDivElement | null>(null);
    const ref = contentRef ?? internalRef;

    useEffect(() => {
        if (!ref || !('current' in ref) || !ref.current) return;
        if (ref.current.innerHTML !== html) ref.current.innerHTML = html;
    }, [html, ref]);

    return (
        <div
            ref={ref as any}
            contentEditable={!readOnly}
            onInput={onInput}
            className={`min-h-[400px] p-8 focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:ring-inset ${readOnly ? 'bg-slate-50/80 text-slate-600' : 'bg-white'} prose prose-slate max-w-none prose-headings:text-slate-800 prose-p:text-slate-700 prose-strong:text-slate-800 prose-em:text-slate-700`}
            suppressContentEditableWarning
            spellCheck
            style={{ caretColor: '#3b82f6' }}
        />
    );
}
