import React, { useState } from 'react';
import RichTextEditor from './RichTextEditor';
import { PlusCircle, X } from 'lucide-react';

interface Props {
    title: string;
    content: string;
    tags: string[];
    aiLoading: boolean;
    passwordProtected: boolean;
    onTitleChange: (t: string) => void;
    onContentChange: (html: string) => void;
    onTagsChange: (tags: string[]) => void;
    onSuggestTags: () => void;
    onGrammarCheck: () => void;
    onGenerateSummary: () => void;
    onGlossaryHighlight: () => void;
    glossaryTerms: string[];
}

export default function NoteEditor({
    title,
    content,
    tags,
    aiLoading,
    passwordProtected,
    onTitleChange,
    onContentChange,
    onTagsChange,
    onSuggestTags,
    onGrammarCheck,
    onGenerateSummary,
    onGlossaryHighlight,
    glossaryTerms,
}: Props) {
    const [newTag, setNewTag] = useState('');



    const addTag = () => {
        const t = newTag.trim();
        if (!t) return;
        if (!tags.includes(t)) onTagsChange([...tags, t]);
        setNewTag('');
    };

    return (
        <div className="space-y-8">
            {/* Title input */}
            <div>
                <label className="block text-sm font-medium text-slate-600 mb-3">Note Title</label>
                <input
                    value={title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    placeholder="Enter a meaningful title for your note..."
                    disabled={passwordProtected}
                    className="w-full px-6 py-4 text-slate-800 bg-white/80 border border-slate-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 disabled:bg-slate-100/60 disabled:text-slate-500 disabled:cursor-not-allowed transition-all duration-200 backdrop-blur-sm text-lg font-medium placeholder-slate-400"
                />
            </div>

            {/* Rich text editor */}
            <div>
                <label className="block text-sm font-medium text-slate-600 mb-3">Note Content</label>
                <RichTextEditor
                    content={content}
                    onChange={onContentChange}
                    readOnly={passwordProtected}
                    highlightTerms={glossaryTerms}
                />
            </div>

            {/* Tags Section */}
            <div className="bg-gradient-to-r from-slate-50/80 to-blue-50/40 border border-slate-200/60 rounded-2xl p-6 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Tags & Organization
                </h3>

                {/* Existing Tags */}
                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-3 mb-4">
                        {tags.map((t) => (
                            <span
                                key={t}
                                className="flex items-center gap-2 bg-gradient-to-r from-blue-100/80 to-indigo-100/80 text-blue-800 px-4 py-2 rounded-xl text-sm font-medium border border-blue-200/60 shadow-sm hover:shadow-md transition-all duration-200"
                            >
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                {t}
                                <button
                                    onClick={() => onTagsChange(tags.filter((x) => x !== t))}
                                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-200/60 rounded-full p-1 transition-all duration-200"
                                    title="Remove tag"
                                >
                                    <X size={14} />
                                </button>
                            </span>
                        ))}
                    </div>
                )}

                {/* Add Tag Input */}
                <div className="flex gap-3">
                    <input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') addTag();
                        }}
                        placeholder="Add a new tag to organize your note..."
                        className="flex-1 px-4 py-3 bg-white/80 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 transition-all duration-200 backdrop-blur-sm placeholder-slate-400"
                    />
                    <button
                        onClick={addTag}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
                    >
                        <PlusCircle size={18} />
                        Add Tag
                    </button>
                </div>
            </div>
        </div>
    );
}