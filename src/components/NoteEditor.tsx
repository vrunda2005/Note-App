import React, { useState } from 'react';
import RichTextEditor from './RichTextEditor';
import { Lightbulb, SpellCheck, FileText, PlusCircle, X } from 'lucide-react';

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
    glossaryTerms: string[]; // Accept the new prop
    // highlightTerms: string[];
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
    glossaryTerms, // Destructure the new prop
    // highlightTerms,
}: Props) {
    const [newTag, setNewTag] = useState('');

    const addTag = () => {
        const t = newTag.trim();
        if (!t) return;
        if (!tags.includes(t)) onTagsChange([...tags, t]);
        setNewTag('');
    };

    return (
        <div>
            {/* Title input */}
            <input
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="Note Title"
                disabled={passwordProtected}
                className="mb-3 p-2 bg-gray-800 border border-gray-700 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-900 disabled:text-gray-500"
            />

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
                <button
                    onClick={onSuggestTags}
                    disabled={aiLoading}
                    className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50"
                >
                    <Lightbulb size={16} />
                    Suggest Tags
                </button>

                <button
                    onClick={onGrammarCheck}
                    disabled={aiLoading}
                    className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition disabled:opacity-50"
                >
                    <SpellCheck size={16} />
                    Check Grammar
                </button>

                <button
                    onClick={onGenerateSummary}
                    disabled={aiLoading}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
                >
                    <FileText size={16} />
                    Summarize
                </button>

                <button
                    onClick={onGlossaryHighlight}
                    disabled={aiLoading}
                    className="flex items-center gap-2 px-3 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-600 transition disabled:opacity-50"
                >
                    <Lightbulb size={16} />
                    Glossary Highlight
                </button>
            </div>

            {/* Rich text editor */}
            <RichTextEditor
                content={content}
                onChange={onContentChange}
                readOnly={passwordProtected}
                aiLoading={aiLoading}
                highlightTerms={glossaryTerms} // Pass the terms to the editor
            />

            {/* Tags */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
                {tags.map((t) => (
                    <span
                        key={t}
                        className="flex items-center gap-1 bg-gray-700 text-gray-200 px-3 py-1 rounded-full text-sm "
                    >
                        {t}
                        <button
                            onClick={() => onTagsChange(tags.filter((x) => x !== t))}
                            className="ml-1 text-gray-400 hover:text-white"
                        >
                            <X size={14} />
                        </button>
                    </span>
                ))}
            </div>

            {/* Add tag input */}
            <div className="mt-3 flex gap-2">
                <input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') addTag();
                    }}
                    placeholder="Add a new tag..."
                    className="bg-gray-800 border border-gray-700 px-2 py-1 rounded flex-grow focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                    onClick={addTag}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                    <PlusCircle size={16} />
                    Add
                </button>
            </div>
        </div>
    );
}