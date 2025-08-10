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
    highlightTerms?: string[];
}

export default function RichTextEditor({
    content,
    onChange,
    readOnly = false,
    highlightTerms = [],
}: Props) {
    const ref = useRef<HTMLDivElement | null>(null);
    const savedSelection = useRef<Range | null>(null);
    const [activeStyles, setActiveStyles] = useState<string[]>([]);
    const [highlightColor, setHighlightColor] = useState<string | null>(null);
    const [showHighlightMenu, setShowHighlightMenu] = useState(false);
    const isInternalUpdate = useRef(false);

    const highlightColors = [
        { name: 'Yellow', value: '#fef3c7', textColor: '#92400e' },
        { name: 'Green', value: '#dcfce7', textColor: '#166534' },
        { name: 'Blue', value: '#dbeafe', textColor: '#1e40af' },
        { name: 'Pink', value: '#fce7f3', textColor: '#be185d' },
        { name: 'Orange', value: '#fed7aa', textColor: '#c2410c' }
    ];

    // Save selection with better handling
    const saveSelection = () => {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            if (!range.collapsed) {
                savedSelection.current = range.cloneRange();
            }
        }
    };

    // Restore selection with improved positioning
    const restoreSelection = () => {
        const sel = window.getSelection();
        if (sel && savedSelection.current) {
            sel.removeAllRanges();
            sel.addRange(savedSelection.current);
        }
    };

    // Apply prop highlights with better styling
    useEffect(() => {
        if (!ref.current) return;
        if (!highlightTerms.length) {
            if (ref.current.innerHTML !== content) {
                ref.current.innerHTML = content;
            }
            return;
        }

        // Save current cursor position before applying highlights
        const sel = window.getSelection();
        let cursorPosition = null;
        if (sel && sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            if (!range.collapsed) {
                // If there's a selection, save it
                savedSelection.current = range.cloneRange();
            } else {
                // If cursor is collapsed, save cursor position
                cursorPosition = {
                    node: range.startContainer,
                    offset: range.startOffset
                };
            }
        }

        isInternalUpdate.current = true;
        let html = content;
        highlightTerms.forEach(term => {
            if (term.trim()) {
                const regex = new RegExp(`\\b(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\b`, 'gi');
                html = html.replace(regex, `<span class="inline-block bg-yellow-200 text-yellow-800 px-1 py-0.5 rounded font-medium" data-glossary-term="${term}">$1</span>`);
            }
        });
        ref.current.innerHTML = html;

        // Restore cursor position after applying highlights
        setTimeout(() => {
            if (cursorPosition) {
                try {
                    // Find the text node and restore cursor position
                    const walker = document.createTreeWalker(
                        ref.current!,
                        NodeFilter.SHOW_TEXT,
                        null
                    );

                    let textNode;
                    let currentOffset = 0;
                    let targetNode = null;
                    let targetOffset = 0;

                    while (textNode = walker.nextNode()) {
                        const nodeLength = textNode.textContent?.length || 0;
                        if (textNode === cursorPosition.node) {
                            targetNode = textNode;
                            targetOffset = Math.min(cursorPosition.offset, nodeLength);
                            break;
                        }
                        currentOffset += nodeLength;
                    }

                    if (targetNode) {
                        const newRange = document.createRange();
                        newRange.setStart(targetNode, targetOffset);
                        newRange.collapse(true);
                        sel?.removeAllRanges();
                        sel?.addRange(newRange);
                    }
                } catch (error) {
                    console.log('Could not restore exact cursor position, using fallback');
                    // Fallback: place cursor at end of content
                    if (ref.current && ref.current.lastChild) {
                        const range = document.createRange();
                        range.selectNodeContents(ref.current);
                        range.collapse(false);
                        sel?.removeAllRanges();
                        sel?.addRange(range);
                    }
                }
            } else if (savedSelection.current) {
                // Restore saved selection
                restoreSelection();
            }

            isInternalUpdate.current = false;
        }, 0);
    }, [content, highlightTerms]);

    // Handle typing with better content cleaning and cursor preservation
    const handleInput = () => {
        if (isInternalUpdate.current) return;

        // Save cursor position before cleaning content
        const sel = window.getSelection();
        let cursorPosition = null;
        if (sel && sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            if (range.collapsed) {
                cursorPosition = {
                    node: range.startContainer,
                    offset: range.startOffset
                };
            }
        }

        if (ref.current) {
            const cleanContent = ref.current.innerHTML
                .replace(/<span class="[^"]*" data-glossary-term="[^"]*">([^<]*)<\/span>/gi, '$1')
                .replace(/<mark class="prop-highlight">([^<]*)<\/mark>/gi, '$1');
            onChange(cleanContent);

            // Restore cursor position after content update
            if (cursorPosition && sel) {
                setTimeout(() => {
                    try {
                        // Find the text node and restore cursor position
                        const walker = document.createTreeWalker(
                            ref.current!,
                            NodeFilter.SHOW_TEXT,
                            null
                        );

                        let textNode;
                        let targetNode = null;
                        let targetOffset = 0;

                        while (textNode = walker.nextNode()) {
                            if (textNode === cursorPosition.node) {
                                targetNode = textNode;
                                targetOffset = Math.min(cursorPosition.offset, textNode.textContent?.length || 0);
                                break;
                            }
                        }

                        if (targetNode) {
                            const newRange = document.createRange();
                            newRange.setStart(targetNode, targetOffset);
                            newRange.collapse(true);
                            sel.removeAllRanges();
                            sel.addRange(newRange);
                        }
                    } catch (error) {
                        // If restoration fails, place cursor at end
                        if (ref.current && ref.current.lastChild) {
                            const range = document.createRange();
                            range.selectNodeContents(ref.current);
                            range.collapse(false);
                            sel.removeAllRanges();
                            sel.addRange(range);
                        }
                    }
                }, 0);
            }
        }
    };

    // Update active toolbar states
    const updateActiveStyles = () => {
        const styles: string[] = [];
        if (document.queryCommandState('bold')) styles.push('bold');
        if (document.queryCommandState('italic')) styles.push('italic');
        if (document.queryCommandState('underline')) styles.push('underline');
        setActiveStyles(styles);
    };

    // Improved custom highlight function
    const toggleHighlight = (color: string) => {
        if (readOnly) return;

        restoreSelection();
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;

        const range = sel.getRangeAt(0);
        if (range.collapsed) return;

        // Check if already highlighted with same color
        const parent = range.startContainer.parentElement;
        if (parent && parent.dataset && parent.dataset.highlightColor === color) {
            // Remove highlight
            const textNode = document.createTextNode(parent.textContent || '');
            parent.replaceWith(textNode);

            // Set cursor at the end of the text
            const newRange = document.createRange();
            newRange.setStartAfter(textNode);
            newRange.collapse(true);
            sel.removeAllRanges();
            sel.addRange(newRange);
        } else {
            // Apply highlight
            const span = document.createElement('span');
            span.style.backgroundColor = color;
            span.dataset.highlightColor = color;
            span.className = 'inline-block rounded px-1 py-0.5';

            // Extract and wrap content
            const contents = range.extractContents();
            span.appendChild(contents);
            range.insertNode(span);

            // Set cursor after the highlight
            const newRange = document.createRange();
            newRange.setStartAfter(span);
            newRange.collapse(true);
            sel.removeAllRanges();
            sel.addRange(newRange);
        }

        // Update content without triggering the highlight effect
        if (ref.current) {
            const currentContent = ref.current.innerHTML;
            onChange(currentContent);
        }

        updateActiveStyles();
        setHighlightColor(color);
        setShowHighlightMenu(false);
    };

    // Exec command wrapper
    const exec = (cmd: string, val?: string) => {
        if (readOnly) return;
        document.execCommand(cmd, false, val ?? undefined);
        if (ref.current) onChange(ref.current.innerHTML);
        updateActiveStyles();
    };

    // Event listeners
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

    const fonts = ['Arial', 'Times New Roman', 'Courier New', 'Verdana', 'Georgia'];
    const fontSizes = ['8px', '10px', '12px', '14px', '18px', '24px', '36px', '48px'];

    return (
        <div className="w-full bg-white text-gray-900 rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            {!readOnly && (
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 p-4">
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Font Family */}
                        <select
                            onChange={(e) => exec('fontName', e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors"
                            defaultValue=""
                        >
                            <option value="" disabled className="text-gray-500">Font</option>
                            {fonts.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>

                        {/* Font Size */}
                        <select
                            onChange={(e) => exec('fontSize', String(fontSizes.indexOf(e.target.value) + 1))}
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors"
                            defaultValue=""
                        >
                            <option value="" disabled className="text-gray-500">Size</option>
                            {fontSizes.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>

                        {/* Divider */}
                        <div className="w-px h-6 bg-gray-300"></div>

                        {/* Bold / Italic / Underline */}
                        {[
                            { icon: Bold, cmd: 'bold', style: 'bold', title: 'Bold' },
                            { icon: Italic, cmd: 'italic', style: 'italic', title: 'Italic' },
                            { icon: Underline, cmd: 'underline', style: 'underline', title: 'Underline' }
                        ].map(({ icon: Icon, cmd, style, title }) => (
                            <button
                                key={cmd}
                                onClick={() => exec(cmd)}
                                className={`p-2.5 rounded-lg hover:bg-gray-200 transition-colors ${activeStyles.includes(style)
                                    ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-200'
                                    : 'text-gray-600 hover:text-gray-800'
                                    }`}
                                title={title}
                            >
                                <Icon size={18} />
                            </button>
                        ))}

                        {/* Divider */}
                        <div className="w-px h-6 bg-gray-300"></div>

                        {/* Align */}
                        {[
                            { icon: AlignLeft, cmd: 'justifyLeft', title: 'Align Left' },
                            { icon: AlignCenter, cmd: 'justifyCenter', title: 'Align Center' },
                            { icon: AlignRight, cmd: 'justifyRight', title: 'Align Right' }
                        ].map(({ icon: Icon, cmd, title }) => (
                            <button
                                key={cmd}
                                onClick={() => exec(cmd)}
                                className="p-2.5 rounded-lg hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-colors"
                                title={title}
                            >
                                <Icon size={18} />
                            </button>
                        ))}

                        {/* Divider */}
                        <div className="w-px h-6 bg-gray-300"></div>

                        {/* Highlight */}
                        <div className="relative highlight-menu">
                            <button
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    saveSelection();
                                    setShowHighlightMenu(p => !p);
                                }}
                                className={`p-2.5 rounded-lg border-2 transition-all ${highlightColor
                                    ? 'border-gray-300 bg-white'
                                    : 'border-gray-300 hover:border-gray-400'
                                    } flex items-center gap-2 hover:bg-gray-50`}
                                title="Highlight Text"
                                style={{ backgroundColor: highlightColor || undefined }}
                            >
                                <Highlighter size={18} className="text-gray-600" />
                                <span className="text-sm font-medium text-gray-700">Highlight</span>
                            </button>

                            {showHighlightMenu && (
                                <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl p-3 z-50 min-w-[200px]">
                                    <div className="text-sm font-medium text-gray-700 mb-3">Choose Highlight Color</div>
                                    <div className="grid grid-cols-5 gap-2">
                                        {highlightColors.map((color) => (
                                            <button
                                                key={color.value}
                                                onMouseDown={(e) => {
                                                    e.preventDefault();
                                                    toggleHighlight(color.value);
                                                }}
                                                className="w-10 h-10 rounded-lg border-2 border-gray-200 hover:border-gray-400 hover:scale-110 transition-all duration-200 cursor-pointer"
                                                style={{
                                                    backgroundColor: color.value,
                                                    color: color.textColor
                                                }}
                                                title={color.name}
                                            >
                                                <span className="text-xs font-bold">H</span>
                                            </button>
                                        ))}
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                        <button
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                setShowHighlightMenu(false);
                                            }}
                                            className="w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Editable Area */}
            <div
                ref={ref}
                contentEditable={!readOnly}
                onInput={handleInput}
                onFocus={() => {
                    // Ensure cursor is visible when editor gains focus
                    if (ref.current && !readOnly) {
                        const sel = window.getSelection();
                        if (sel && sel.rangeCount === 0) {
                            // If no selection, place cursor at end
                            const range = document.createRange();
                            range.selectNodeContents(ref.current);
                            range.collapse(false);
                            sel.removeAllRanges();
                            sel.addRange(range);
                        }
                    }
                }}
                className={`min-h-[300px] p-6 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-inset ${readOnly ? 'bg-gray-50 text-gray-600' : 'bg-white'
                    } prose prose-sm max-w-none`}
                suppressContentEditableWarning
                spellCheck
                style={{ caretColor: '#3b82f6' }}
            />

            {/* Drawing Area */}
            <div className="border-t border-gray-200 bg-gray-50 p-4">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Drawing Canvas</h2>
                <DrawCanvas
                    onSave={(dataUrl: string) => {
                        console.log('Canvas saved:', dataUrl);
                    }}
                />
            </div>
        </div>
    );
}
