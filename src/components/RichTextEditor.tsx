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

interface Props {
    content: string;
    onChange: (html: string) => void;
    readOnly?: boolean;
    aiLoading?: boolean;
}

export default function RichTextEditor({
    content,
    onChange,
    readOnly = false
}: Props) {
    const ref = useRef<HTMLDivElement | null>(null);
    const [activeStyles, setActiveStyles] = useState<string[]>([]);
    const [highlightColor, setHighlightColor] = useState<string | null>(null);
    const [showHighlightMenu, setShowHighlightMenu] = useState(false);

    const highlightColors = ['yellow', 'lightgreen', 'lightblue', 'pink', 'orange'];

    // Ensure editor content stays in sync
    useEffect(() => {
        if (!ref.current) return;
        if (ref.current.innerHTML !== content) ref.current.innerHTML = content;
    }, [content]);

    // Detect active styles
    const updateActiveStyles = () => {
        const styles: string[] = [];

        if (document.queryCommandState('bold')) styles.push('bold');
        if (document.queryCommandState('italic')) styles.push('italic');
        if (document.queryCommandState('underline')) styles.push('underline');

        const currentColor = document.queryCommandValue('hiliteColor'); // works better in Chrome
        if (
            currentColor &&
            currentColor !== 'transparent' &&
            currentColor !== 'rgb(0, 0, 0)'
        ) {
            styles.push('highlight');
            setHighlightColor(currentColor);
        } else {
            setHighlightColor(null);
        }

        setActiveStyles(styles);
    };

    // Toggle highlight color
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

        onChange(ref.current?.innerHTML ?? '');
        updateActiveStyles();
        setShowHighlightMenu(false);
    };

    // Generic execCommand wrapper
    const exec = (cmd: string, val?: string) => {
        if (readOnly) return;
        document.execCommand(cmd, false, val ?? undefined);
        onChange(ref.current?.innerHTML ?? '');
        updateActiveStyles();
    };

    // Watch selection changes
    useEffect(() => {
        document.addEventListener('selectionchange', updateActiveStyles);
        return () => {
            document.removeEventListener('selectionchange', updateActiveStyles);
        };
    }, []);

    // Close color menu on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (!(e.target as HTMLElement).closest('.highlight-menu')) {
                setShowHighlightMenu(false);
            }
        };
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, []);

    return (
        <div className="w-full bg-white text-gray-900 p-3 rounded shadow-sm border border-gray-300">
            {!readOnly && (
                <div className="mb-3 flex flex-wrap gap-2 border-b border-gray-200 pb-2 items-center">
                    {/* Bold */}
                    <button
                        onClick={() => exec('bold')}
                        className={`p-2 rounded hover:bg-gray-100 ${activeStyles.includes('bold') ? 'bg-blue-100 text-blue-600' : ''
                            }`}
                        title="Bold"
                    >
                        <Bold size={16} />
                    </button>

                    {/* Italic */}
                    <button
                        onClick={() => exec('italic')}
                        className={`p-2 rounded hover:bg-gray-100 ${activeStyles.includes('italic') ? 'bg-blue-100 text-blue-600' : ''
                            }`}
                        title="Italic"
                    >
                        <Italic size={16} />
                    </button>

                    {/* Underline */}
                    <button
                        onClick={() => exec('underline')}
                        className={`p-2 rounded hover:bg-gray-100 ${activeStyles.includes('underline')
                            ? 'bg-blue-100 text-blue-600'
                            : ''
                            }`}
                        title="Underline"
                    >
                        <Underline size={16} />
                    </button>

                    {/* Align Left */}
                    <button
                        onClick={() => exec('justifyLeft')}
                        className="p-2 rounded hover:bg-gray-100"
                        title="Align Left"
                    >
                        <AlignLeft size={16} />
                    </button>

                    {/* Align Center */}
                    <button
                        onClick={() => exec('justifyCenter')}
                        className="p-2 rounded hover:bg-gray-100"
                        title="Align Center"
                    >
                        <AlignCenter size={16} />
                    </button>

                    {/* Align Right */}
                    <button
                        onClick={() => exec('justifyRight')}
                        className="p-2 rounded hover:bg-gray-100"
                        title="Align Right"
                    >
                        <AlignRight size={16} />
                    </button>

                    {/* Highlight */}
                    <div className="relative highlight-menu">
                        <button
                            onClick={() =>
                                highlightColor
                                    ? toggleHighlight(highlightColor)
                                    : setShowHighlightMenu((prev) => !prev)
                            }
                            className={`p-2 rounded border flex items-center gap-1 ${activeStyles.includes('highlight') ? 'bg-blue-100' : ''
                                }`}
                            title="Highlight"
                            style={{
                                backgroundColor:
                                    highlightColor && highlightColor !== 'transparent'
                                        ? highlightColor
                                        : undefined
                            }}
                        >
                            <Highlighter size={16} />
                        </button>

                        {showHighlightMenu && (
                            <div className="absolute mt-1 bg-white border rounded shadow p-1 flex gap-1 z-10">
                                {highlightColors.map((c) => (
                                    <div
                                        key={c}
                                        onClick={() => toggleHighlight(c)}
                                        className="w-5 h-5 rounded cursor-pointer border hover:scale-110 transition-transform"
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Font Size */}
                    <select
                        onChange={(e) => exec('fontSize', e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                    >
                        <option value="3">Normal</option>
                        <option value="5">Large</option>
                        <option value="1">Small</option>
                    </select>

                    {/* Font Family */}
                    <select
                        onChange={(e) => exec('fontName', e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                    >
                        <option value="Arial">Arial</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Courier New">Courier New</option>
                        <option value="Verdana">Verdana</option>
                        <option value="Georgia">Georgia</option>
                    </select>
                </div>
            )}

            {/* Editable area */}
            <div
                ref={ref}
                contentEditable={!readOnly}
                onInput={() => onChange(ref.current?.innerHTML ?? '')}
                className={`min-h-[300px] border border-gray-300 p-3 rounded ${readOnly ? 'bg-gray-100' : 'bg-white'
                    } focus:outline-none focus:ring-2 focus:ring-blue-400`}
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
