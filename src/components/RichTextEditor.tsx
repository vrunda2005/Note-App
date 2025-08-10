import React, { useEffect, useRef, useState } from 'react';
import DrawCanvas from './DrawCanvas';
import {
    Bold,
    Italic,
    Underline,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Highlighter
} from 'lucide-react';

// Define the props for the component
interface Props {
    content: string;
    onChange: (html: string) => void;
    readOnly?: boolean;
    aiLoading?: boolean;
    highlightTerms?: string[]; // This prop will contain the terms to highlight
}

export default function RichTextEditor({
    content,
    onChange,
    readOnly = false,
    highlightTerms = [], // Default to an empty array if not provided
}: Props) {
    const ref = useRef<HTMLDivElement | null>(null);
    const [activeStyles, setActiveStyles] = useState<string[]>([]);
    const [highlightColor, setHighlightColor] = useState<string | null>(null);
    const [showHighlightMenu, setShowHighlightMenu] = useState(false);
    const isInternalUpdate = useRef(false); // Ref to prevent update loops

    const highlightColors = ['yellow', 'lightgreen', 'lightblue', 'pink', 'orange'];

    // --- LOGIC TO APPLY HIGHLIGHTING FROM PROPS ---
    useEffect(() => {
        if (!ref.current) return;

        // Prevent this effect from running if the content is already what it should be
        if (ref.current.innerHTML === content && !highlightTerms.length) return;

        isInternalUpdate.current = true; // Signal that the next update is internal

        let newContent = content;
        if (highlightTerms.length > 0) {
            // This regex ensures we only highlight whole words
            highlightTerms.forEach(term => {
                const regex = new RegExp(`\\b(${term})\\b`, 'gi');
                newContent = newContent.replace(regex, `<mark style="background-color: #FFD700;">$1</mark>`);
            });
        }

        // Only update the DOM if the content has actually changed
        if (ref.current.innerHTML !== newContent) {
            ref.current.innerHTML = newContent;
        }

        // Use a timeout to reset the flag after the DOM update cycle
        setTimeout(() => {
            isInternalUpdate.current = false;
        }, 0);

    }, [content, highlightTerms]); // Rerun when content or terms change

    // Handle user input from the editor
    const handleInput = () => {
        // Don't trigger onChange from our own highlighting logic
        if (isInternalUpdate.current) return;
        if (ref.current) {
            // When the user types, remove our <mark> tags before sending the content up
            const cleanContent = ref.current.innerHTML.replace(/<mark[^>]*>|<\/mark>/gi, "");
            onChange(cleanContent);
        }
    };

    // Detect active styles at the cursor
    const updateActiveStyles = () => {
        const styles: string[] = [];
        if (document.queryCommandState('bold')) styles.push('bold');
        if (document.queryCommandState('italic')) styles.push('italic');
        if (document.queryCommandState('underline')) styles.push('underline');
        const currentColor = document.queryCommandValue('hiliteColor');
        if (currentColor && currentColor !== 'transparent' && currentColor !== 'rgb(0, 0, 0)') {
            styles.push('highlight');
            setHighlightColor(currentColor);
        } else {
            setHighlightColor(null);
        }
        setActiveStyles(styles);
    };

    // Toggle user-applied highlight color
    const toggleHighlight = (color: string) => {
        if (readOnly) return;
        const cmd = 'hiliteColor';
        const normalize = (val: string) => val.replace(/\s/g, '').toLowerCase();
        const currentColor = normalize(document.queryCommandValue(cmd));
        const chosenColor = normalize(color);
        if (currentColor === chosenColor) {
            document.execCommand(cmd, false, 'transparent');
            setHighlightColor(null);
        } else {
            document.execCommand(cmd, false, color);
            setHighlightColor(color);
        }
        if (ref.current) onChange(ref.current.innerHTML);
        updateActiveStyles();
        setShowHighlightMenu(false);
    };

    // Generic execCommand wrapper for other formatting
    const exec = (cmd: string, val?: string) => {
        if (readOnly) return;
        document.execCommand(cmd, false, val ?? undefined);
        if (ref.current) onChange(ref.current.innerHTML);
        updateActiveStyles();
    };

    // Add event listeners
    useEffect(() => {
        document.addEventListener('selectionchange', updateActiveStyles);
        const handleClick = (e: MouseEvent) => {
            if (!(e.target as HTMLElement).closest('.highlight-menu')) {
                setShowHighlightMenu(false);
            }
        };
        document.addEventListener('click', handleClick);
        return () => {
            document.removeEventListener('selectionchange', updateActiveStyles);
            document.removeEventListener('click', handleClick);
        };
    }, []);

    return (
        <div className="w-full bg-white text-gray-900 p-3 rounded shadow-sm border border-gray-300">
            {!readOnly && (
                <div className="mb-3 flex flex-wrap gap-2 border-b border-gray-200 pb-2 items-center">
                    {/* Bold */}
                    <button onClick={() => exec('bold')} className={`p-2 rounded hover:bg-gray-100 ${activeStyles.includes('bold') ? 'bg-blue-100 text-blue-600' : ''}`} title="Bold">
                        <Bold size={16} />
                    </button>
                    {/* Italic */}
                    <button onClick={() => exec('italic')} className={`p-2 rounded hover:bg-gray-100 ${activeStyles.includes('italic') ? 'bg-blue-100 text-blue-600' : ''}`} title="Italic">
                        <Italic size={16} />
                    </button>
                    {/* Underline */}
                    <button onClick={() => exec('underline')} className={`p-2 rounded hover:bg-gray-100 ${activeStyles.includes('underline') ? 'bg-blue-100 text-blue-600' : ''}`} title="Underline">
                        <Underline size={16} />
                    </button>
                    {/* Align Left */}
                    <button onClick={() => exec('justifyLeft')} className="p-2 rounded hover:bg-gray-100" title="Align Left">
                        <AlignLeft size={16} />
                    </button>
                    {/* Align Center */}
                    <button onClick={() => exec('justifyCenter')} className="p-2 rounded hover:bg-gray-100" title="Align Center">
                        <AlignCenter size={16} />
                    </button>
                    {/* Align Right */}
                    <button onClick={() => exec('justifyRight')} className="p-2 rounded hover:bg-gray-100" title="Align Right">
                        <AlignRight size={16} />
                    </button>
                    {/* Highlight Menu */}
                    <div className="relative highlight-menu">
                        <button onClick={() => highlightColor ? toggleHighlight(highlightColor) : setShowHighlightMenu((p) => !p)} className={`p-2 rounded border flex items-center gap-1 ${activeStyles.includes('highlight') ? 'bg-blue-100' : ''}`} title="Highlight" style={{ backgroundColor: highlightColor && highlightColor !== 'transparent' ? highlightColor : undefined }}>
                            <Highlighter size={16} />
                        </button>
                        {showHighlightMenu && (
                            <div className="absolute mt-1 bg-white border rounded shadow p-1 flex gap-1 z-10">
                                {highlightColors.map((c) => (
                                    <div key={c} onClick={() => toggleHighlight(c)} className="w-5 h-5 rounded cursor-pointer border hover:scale-110 transition-transform" style={{ backgroundColor: c }} />
                                ))}
                            </div>
                        )}
                    </div>
                    {/* Font Size & Family Selects */}
                </div>
            )}

            {/* Editable area */}
            <div
                ref={ref}
                contentEditable={!readOnly}
                onInput={handleInput} // Use the corrected input handler
                className={`min-h-[300px] border border-gray-300 p-3 rounded ${readOnly ? 'bg-gray-100' : 'bg-white'} focus:outline-none focus:ring-2 focus:ring-blue-400`}
                suppressContentEditableWarning
                spellCheck
            />

            {/* Drawing area */}
            <h2 className="mt-4 mb-2 font-semibold text-gray-700">Draw</h2>
            <DrawCanvas
                onSave={(dataUrl: string) => {
                    console.log('Canvas saved:', dataUrl);
                }}
            />
        </div>
    );
}
