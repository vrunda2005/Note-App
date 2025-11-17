import React, { useEffect, useRef, useState } from 'react';
import DrawCanvas from './DrawCanvas';
import RichTextToolbar from './RichTextToolbar';
import EditableContent from './EditableContent';
import { PenTool } from 'lucide-react';
// Note: removed unused imports (useNotes, getAllNotes) for clarity

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
    const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);
    // Flag used to ignore internal DOM updates when reflecting content prop -> innerHTML
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

    // Enhanced glossary highlighting with tooltips
    useEffect(() => {
        if (!ref.current) return;
        if (!highlightTerms.length) {
            if (ref.current.innerHTML !== content) {
                ref.current.innerHTML = content;
            }
            return;
        }
        // Save current cursor position before applying highlights

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

        // Create a unique identifier for each term to avoid conflicts
        highlightTerms.forEach((term, index) => {
            if (term.trim()) {
                const regex = new RegExp(`\\b(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\b`, 'gi');
                html = html.replace(regex, `<span class="glossary-term inline-block bg-yellow-200 text-yellow-800 px-1 py-0.5 rounded font-medium cursor-help" data-glossary-term="${term}" data-term-index="${index}">$1</span>`);
            }
        });

        ref.current.innerHTML = html;

        // Add event listeners for tooltips
        const glossaryTerms = ref.current.querySelectorAll('.glossary-term');
        glossaryTerms.forEach((termElement) => {
            termElement.addEventListener('mouseenter', (e) => {
                const target = e.target as HTMLElement;
                const term = target.dataset.glossaryTerm;
                if (term) {
                    const rect = target.getBoundingClientRect();
                    setTooltip({
                        text: `Glossary term: ${term}`,
                        x: rect.left + rect.width / 2,
                        y: rect.top - 10
                    });
                }
            });

            termElement.addEventListener('mouseleave', () => {
                setTooltip(null);
            });
        });

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
        // Ignore events triggered by internal programmatic updates
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
                // unwrap glossary-term spans inserted by highlighting
                .replace(/<span class="[^"]*" data-glossary-term="[^"]*" data-term-index="[^"]*">([^<]*)<\/span>/gi, '$1')
                // unwrap our highlight wrapper
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
        <div className="w-full bg-white text-slate-800 rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden relative">
            {/* Tooltip */}
            {tooltip && (
                <div
                    className="fixed z-50 bg-slate-800 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none"
                    style={{
                        left: tooltip.x,
                        top: tooltip.y,
                        transform: 'translateX(-50%)'
                    }}
                >
                    {tooltip.text}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"></div>
                </div>
            )}

            {!readOnly && (
                <RichTextToolbar
                    exec={exec}
                    activeStyles={activeStyles}
                    onToggleCanvas={() => setShowDrawingCanvas(p => !p)}
                    onShowHighlightMenu={(open: boolean) => setShowHighlightMenu(open)}
                    highlightColor={highlightColor}
                />
            )}

            {/* Editable Area */}
            <EditableContent
                html={content}
                onInput={handleInput}
                readOnly={readOnly}
                contentRef={ref}
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
