import React, { useEffect, useRef, useState } from 'react';
import DrawCanvas from './DrawCanvas';
import {
    Bold,
    Italic,
    Underline,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Highlighter,
    PenTool,
    Image,
    Palette
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
    const [showDrawingCanvas, setShowDrawingCanvas] = useState(false);
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
        <div className="w-full bg-white text-slate-800 rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
            {!readOnly && (
                <div className="bg-gradient-to-r from-slate-50 to-blue-50/30 border-b border-slate-200/60 p-6">
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Font Family */}
                        <select
                            onChange={(e) => exec('fontName', e.target.value)}
                            className="border border-slate-200/60 rounded-xl px-4 py-2.5 text-sm bg-white/80 hover:border-slate-300/60 focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 backdrop-blur-sm"
                            defaultValue=""
                        >
                            <option value="" disabled className="text-slate-500">Font</option>
                            {fonts.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>

                        {/* Font Size */}
                        <select
                            onChange={(e) => exec('fontSize', String(fontSizes.indexOf(e.target.value) + 1))}
                            className="border border-slate-200/60 rounded-xl px-4 py-2.5 text-sm bg-white/80 hover:border-slate-300/60 focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 backdrop-blur-sm"
                            defaultValue=""
                        >
                            <option value="" disabled className="text-slate-500">Size</option>
                            {fontSizes.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>

                        {/* Divider */}
                        <div className="w-px h-8 bg-slate-300/60"></div>

                        {/* Bold / Italic / Underline */}
                        {[
                            { icon: Bold, cmd: 'bold', style: 'bold', title: 'Bold' },
                            { icon: Italic, cmd: 'italic', style: 'italic', title: 'Italic' },
                            { icon: Underline, cmd: 'underline', style: 'underline', title: 'Underline' }
                        ].map(({ icon: Icon, cmd, style, title }) => (
                            <button
                                key={cmd}
                                onClick={() => exec(cmd)}
                                className={`p-3 rounded-xl hover:bg-slate-200/60 transition-all duration-200 ${activeStyles.includes(style)
                                    ? 'bg-blue-100/80 text-blue-600 ring-2 ring-blue-200/60 shadow-md'
                                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100/60'
                                    }`}
                                title={title}
                            >
                                <Icon size={20} />
                            </button>
                        ))}

                        {/* Divider */}
                        <div className="w-px h-8 bg-slate-300/60"></div>

                        {/* Align */}
                        {[
                            { icon: AlignLeft, cmd: 'justifyLeft', title: 'Align Left' },
                            { icon: AlignCenter, cmd: 'justifyCenter', title: 'Align Center' },
                            { icon: AlignRight, cmd: 'justifyRight', title: 'Align Right' }
                        ].map(({ icon: Icon, cmd, title }) => (
                            <button
                                key={cmd}
                                onClick={() => exec(cmd)}
                                className="p-3 rounded-xl hover:bg-slate-200/60 text-slate-600 hover:text-slate-800 transition-all duration-200"
                                title={title}
                            >
                                <Icon size={20} />
                            </button>
                        ))}

                        {/* Divider */}
                        <div className="w-px h-8 bg-slate-300/60"></div>

                        {/* Drawing Tool */}
                        <button
                            onClick={() => setShowDrawingCanvas(!showDrawingCanvas)}
                            className={`p-3 rounded-xl transition-all duration-200 ${showDrawingCanvas
                                ? 'bg-gradient-to-r from-purple-100/80 to-pink-100/80 text-purple-600 ring-2 ring-purple-200/60 shadow-md'
                                : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100/60'
                                }`}
                            title="Drawing Tool"
                        >
                            <PenTool size={20} />
                        </button>

                        {/* Highlight */}
                        <div className="relative highlight-menu">
                            <button
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    saveSelection();
                                    setShowHighlightMenu(p => !p);
                                }}
                                className={`p-3 rounded-xl border-2 transition-all duration-200 ${highlightColor
                                    ? 'border-slate-300 bg-white/80 shadow-md'
                                    : 'border-slate-200/60 hover:border-slate-300/60'
                                    } flex items-center gap-2 hover:bg-slate-100/60`}
                                title="Highlight Text"
                                style={{ backgroundColor: highlightColor || undefined }}
                            >
                                <Highlighter size={20} className="text-slate-600" />
                                <span className="text-sm font-medium text-slate-700">Highlight</span>
                            </button>

                            {showHighlightMenu && (
                                <div className="absolute top-full left-0 mt-3 bg-white/95 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-2xl p-4 z-50 min-w-[220px]">
                                    <div className="text-sm font-medium text-slate-700 mb-4">Choose Highlight Color</div>
                                    <div className="grid grid-cols-5 gap-3">
                                        {highlightColors.map((color) => (
                                            <button
                                                key={color.value}
                                                onMouseDown={(e) => {
                                                    e.preventDefault();
                                                    toggleHighlight(color.value);
                                                }}
                                                className="w-12 h-12 rounded-xl border-2 border-slate-200/60 hover:border-slate-400/60 hover:scale-110 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
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
                                    <div className="mt-4 pt-4 border-t border-slate-100/60">
                                        <button
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                setShowHighlightMenu(false);
                                            }}
                                            className="w-full px-4 py-2.5 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-50/80 rounded-xl transition-all duration-200"
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
                className={`min-h-[400px] p-8 focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:ring-inset ${readOnly ? 'bg-slate-50/80 text-slate-600' : 'bg-white'
                    } prose prose-slate max-w-none prose-headings:text-slate-800 prose-p:text-slate-700 prose-strong:text-slate-800 prose-em:text-slate-700`}
                suppressContentEditableWarning
                spellCheck
                style={{ caretColor: '#3b82f6' }}
            />

            {/* Drawing Canvas - Toggleable */}
            {showDrawingCanvas && (
                <div className="border-t border-slate-200/60 bg-gradient-to-r from-purple-50/50 to-pink-50/50 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                            <PenTool size={22} className="text-purple-600" />
                            Drawing Canvas
                        </h3>
                        <button
                            onClick={() => setShowDrawingCanvas(false)}
                            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100/60 rounded-lg transition-all duration-200"
                        >
                            ×
                        </button>
                    </div>
                    <DrawCanvas
                        onSave={(dataUrl: string) => {
                            console.log('Canvas saved:', dataUrl);
                            // Here you could insert the drawing into the editor
                            // or save it as an attachment
                        }}
                        onCancel={() => setShowDrawingCanvas(false)}
                    />
                </div>
            )}
        </div>
    );
}
