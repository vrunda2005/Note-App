import React, { useState, useEffect } from 'react';
import { Note } from '@/types';
import { useNotes } from '@/hooks/useNotes';
import {
    Share2,
    Download,
    Lock,
    LockOpen,
    Sparkles,
    PenTool,
    ArrowLeft,
    Clock
} from 'lucide-react';
import PasswordModal from './PasswordModal';
import AIFallbackBanner from './AIFallbackBanner';

interface AppHeaderProps {
    selectedNote: Note;
    updateNote: (note: Partial<Note> & { id: string }) => Promise<void>;
    onToggleDrawMode: () => void;
    isDrawMode: boolean;
    isAiSidebarOpen: boolean;
    onToggleAiSidebar: () => void;
    unlockedContent?: string | null;
    setUnlockedContent?: (noteId: string, content: string | null) => void;
    forceShowPasswordModal?: boolean;
}

const AppHeader: React.FC<AppHeaderProps> = ({
    selectedNote,
    updateNote,
    onToggleDrawMode,
    isDrawMode,
    isAiSidebarOpen,
    onToggleAiSidebar,
    unlockedContent,
    setUnlockedContent,
    forceShowPasswordModal,
}) => {
    const { encryptNote, decryptNote, shareNote: shareNoteWithEmail } = useNotes();
    const [passwordModal, setPasswordModal] = useState(false);
    const [decryptionError, setDecryptionError] = useState("");
    const [isDecrypting, setIsDecrypting] = useState(false);
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [aiFallbackNotice, setAiFallbackNotice] = useState<string | null>(null);

    useEffect(() => {
        // If the note is password protected and not already unlocked in-memory,
        // prompt for password when this component first receives the note OR when
        // the parent explicitly requests it via forceShowPasswordModal.
        if ((selectedNote.passwordProtected && !unlockedContent) || forceShowPasswordModal) {
            if (selectedNote.passwordProtected && !unlockedContent) {
                setPasswordModal(true);
            }
        }
    }, [selectedNote.id]);

    // Listen for AI fallback events dispatched from useAI
    useEffect(() => {
        const handler = (e: Event) => {
            const detail: any = (e as CustomEvent).detail || {};
            const modelUsed = detail.modelUsed || 'local-fallback';
            // Build a richer message when attemptedModels are provided
            let message = `AI backend used local fallback (${modelUsed}). Results may be approximate.`;
            if (detail.attemptedModels && Array.isArray(detail.attemptedModels) && detail.attemptedModels.length > 0) {
                const attempted = detail.attemptedModels.map((m: any) => `${m.model}${m.ok ? '' : ' (failed)'}`).join(', ');
                message = `AI backend used local fallback (${modelUsed}). Attempted: ${attempted}. Results may be approximate.`;
            }
            if (detail.task) message += ` Task: ${detail.task}.`;
            setAiFallbackNotice(message);
        };
        window.addEventListener('ai:fallback', handler as EventListener);
        return () => window.removeEventListener('ai:fallback', handler as EventListener);
    }, []);

    /** -------------------------
     * Password Protect / Unlock
     * -------------------------- */
    const handleEncryptNote = async () => {
        const password = prompt("Enter a password to protect this note:");
        if (password) await encryptNote(selectedNote, password);
    };

    const handlePasswordSubmit = async (password: string) => {
        setIsDecrypting(true);
        try {
            const decrypted = await decryptNote(selectedNote, password);
            if (decrypted !== null) {
                // Keep the note marked as password protected in storage, but set
                // unlocked content in-memory so the UI can display the plaintext.
                if (setUnlockedContent) setUnlockedContent(selectedNote.id, decrypted);
                setPasswordModal(false);
            } else {
                setDecryptionError("Incorrect password");
            }
        } finally {
            setIsDecrypting(false);
        }
    };

    /** -------------------------
     * PDF Export & Share
     * -------------------------- */
    const exportToPDF = async () => {
        try {
            // Dynamic import to avoid SSR issues
            const jsPDF = (await import('jspdf')).default;

            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const margin = 20;
            const maxWidth = pageWidth - (margin * 2);

            // Add title
            doc.setFontSize(20);
            doc.setFont('helvetica', 'bold');
            doc.text(selectedNote.title || 'Untitled Note', margin, 30);

            // Add content (strip HTML tags)
            const plainText = selectedNote.content?.replace(/<[^>]*>/g, '') || '';
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');

            // Split text into lines that fit the page width
            const lines = doc.splitTextToSize(plainText, maxWidth);
            let yPosition = 50;

            lines.forEach((line: string) => {
                if (yPosition > doc.internal.pageSize.getHeight() - 20) {
                    doc.addPage();
                    yPosition = 20;
                }
                doc.text(line, margin, yPosition);
                yPosition += 7;
            });

            // Add metadata
            doc.setFontSize(10);
            doc.text(`Created: ${new Date(selectedNote.lastModified).toLocaleDateString()}`, margin, yPosition + 10);
            if (selectedNote.tags && selectedNote.tags.length > 0) {
                doc.text(`Tags: ${selectedNote.tags.join(', ')}`, margin, yPosition + 20);
            }

            // Save the PDF
            doc.save(`${selectedNote.title || 'note'}.pdf`);
        } catch (error) {
            console.error('Error exporting to PDF:', error);
            alert('Failed to export PDF. Please try again.');
        }
    };

    const copyToClipboard = async () => {
        try {
            const noteText = `${selectedNote.title || 'Untitled'}\n\n${selectedNote.content?.replace(/<[^>]*>/g, '') || ''}`;
            await navigator.clipboard.writeText(noteText);
            alert('Note copied to clipboard!');
            setShareModalOpen(false);
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            alert('Failed to copy to clipboard');
        }
    };

    return (
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-40 w-full flex-shrink-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 gap-3">
                    {/* Left: Title & Last Modified */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="flex flex-col min-w-0">
                            <h2 className="text-lg font-bold text-slate-800 truncate">
                                {selectedNote.title || "Untitled Note"}
                            </h2>
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                                <Clock size={12} />
                                {selectedNote.lastModified
                                    ? new Date(selectedNote.lastModified).toLocaleString()
                                    : "Just now"}
                            </span>
                        </div>
                    </div>

                    {/* Right: Actions Row */}
                    <div className="flex items-center gap-2 flex-wrap sm:justify-end">
                        {/* Lock/Unlock Button */}
                        {selectedNote.passwordProtected ? (
                            unlockedContent ? (
                                <button
                                    onClick={() => setUnlockedContent && setUnlockedContent(selectedNote.id, null)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 rounded-xl text-xs font-semibold border border-amber-200 transition"
                                >
                                    <LockOpen size={14} />
                                    Lock
                                </button>
                            ) : (
                                <button
                                    onClick={() => setPasswordModal(true)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition shadow-sm"
                                >
                                    <Lock size={14} />
                                    Unlock
                                </button>
                            )
                        ) : (
                            <button
                                onClick={() => handleEncryptNote()}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition"
                            >
                                <Lock size={14} />
                                Protect
                            </button>
                        )}

                        {/* Draw Mode Toggle */}
                        <button
                            onClick={onToggleDrawMode}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${isDrawMode
                                ? "bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-600"
                                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                                }`}
                            title={isDrawMode ? "Back to text mode" : "Switch to draw mode"}
                        >
                            {isDrawMode ? (
                                <>
                                    <ArrowLeft size={14} />
                                    Text Mode
                                </>
                            ) : (
                                <>
                                    <PenTool size={14} />
                                    Draw Canvas
                                </>
                            )}
                        </button>

                        {/* Share Button */}
                        <button
                            onClick={() => setShareModalOpen(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-xs font-semibold transition shadow-sm"
                            title="Share Note"
                        >
                            <Share2 size={14} />
                            Share
                        </button>

                        {/* Export PDF Button */}
                        <button
                            onClick={exportToPDF}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold transition"
                            title="Export to PDF"
                        >
                            <Download size={14} />
                            Export PDF
                        </button>

                        {/* AI Copilot Toggle */}
                        <button
                            onClick={onToggleAiSidebar}
                            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${isAiSidebarOpen
                                ? 'bg-gradient-to-r from-blue-600 to-purple-700 text-white scale-105 shadow-md'
                                : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:opacity-90 shadow-sm'
                                }`}
                            title="AI Copilot"
                        >
                            <Sparkles size={14} />
                            AI Copilot
                        </button>

                        {/* AI Fallback Banner */}
                        {aiFallbackNotice && (
                            <AIFallbackBanner message={aiFallbackNotice} onDismiss={() => setAiFallbackNotice(null)} />
                        )}
                    </div>
                </div>
            </div>

            {/* Share Modal */}
            {shareModalOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
                    onClick={() => setShareModalOpen(false)}
                >
                    <div
                        className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <Share2 size={22} className="text-purple-600" />
                            Share Note
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Share with email</label>
                                <form
                                    onSubmit={async (e) => {
                                        e.preventDefault();
                                        const email = (e.target as any).email.value;
                                        if (email) {
                                            const success = await shareNoteWithEmail(selectedNote.id, email);
                                            if (success) {
                                                alert('Note shared successfully!');
                                                (e.target as any).reset();
                                            } else {
                                                alert('Failed to share note');
                                            }
                                        }
                                    }}
                                    className="flex gap-2"
                                >
                                    <input
                                        name="email"
                                        type="email"
                                        placeholder="user@example.com"
                                        className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                    >
                                        Share
                                    </button>
                                </form>
                            </div>

                            <div className="border-t pt-4">
                                <p className="text-sm text-slate-600 mb-2">
                                    Or copy content to clipboard:
                                </p>
                                <button
                                    onClick={copyToClipboard}
                                    className="w-full px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium border border-slate-200"
                                >
                                    Copy to Clipboard
                                </button>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setShareModalOpen(false)}
                                className="px-4 py-2 text-slate-500 hover:text-slate-700 font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Password Modal */}
            {passwordModal && (
                <PasswordModal
                    passwordError={decryptionError}
                    isLoading={isDecrypting}
                    onSubmit={handlePasswordSubmit}
                    onCancel={() => setPasswordModal(false)}
                />
            )}
        </header>
    );
};

export default AppHeader;
