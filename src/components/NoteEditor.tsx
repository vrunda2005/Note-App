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
        <div className="space-y-6">
            {/* Title input */}
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Note Title</label>
                <input
                    value={title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    placeholder="Enter note title..."
                    disabled={passwordProtected}
                    className="w-full px-4 py-3 text-blue-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                />
            </div>

            {/* AI Tools Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                    <Lightbulb size={20} />
                    AI-Powered Tools
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <button
                        onClick={onSuggestTags}
                        disabled={aiLoading}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                    >
                        <Lightbulb size={16} />
                        <span className="text-sm font-medium">Suggest Tags</span>
                    </button>

                    <button
                        onClick={onGrammarCheck}
                        disabled={aiLoading}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                    >
                        <SpellCheck size={16} />
                        <span className="text-sm font-medium">Check Grammar</span>
                    </button>

                    <button
                        onClick={onGenerateSummary}
                        disabled={aiLoading}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                    >
                        <FileText size={16} />
                        <span className="text-sm font-medium">Summarize</span>
                    </button>

                    <button
                        onClick={onGlossaryHighlight}
                        disabled={aiLoading}
                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all shadow-sm hover:shadow-md ${glossaryTerms.length > 0
                            ? 'bg-yellow-500 text-yellow-900 border-2 border-yellow-600'
                            : 'bg-yellow-500 text-black hover:bg-yellow-600'
                            }`}
                    >
                        <Lightbulb size={16} />
                        <span className="text-sm font-medium">
                            {glossaryTerms.length > 0 ? `${glossaryTerms.length} Terms` : 'Glossary Highlight'}
                        </span>
                    </button>
                </div>

                {/* Glossary Terms Display */}
                {glossaryTerms.length > 0 && (
                    <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-yellow-800">Highlighted Terms:</span>
                            <button
                                onClick={() => onGlossaryHighlight()}
                                className="text-xs text-yellow-600 hover:text-yellow-800 underline"
                            >
                                Refresh
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {glossaryTerms.map((term, index) => (
                                <span
                                    key={index}
                                    className="inline-block bg-yellow-200 text-yellow-800 px-2 py-1 rounded-md text-xs font-medium"
                                >
                                    {term}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {aiLoading && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-blue-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-sm">Processing...</span>
                    </div>
                )}
            </div>

            {/* Rich text editor */}
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Note Content</label>
                <RichTextEditor
                    content={content}
                    onChange={onContentChange}
                    readOnly={passwordProtected}
                    highlightTerms={glossaryTerms}
                />
            </div>

            {/* Tags Section */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Tags</h3>

                {/* Existing Tags */}
                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                        {tags.map((t) => (
                            <span
                                key={t}
                                className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm font-medium border border-blue-200"
                            >
                                {t}
                                <button
                                    onClick={() => onTagsChange(tags.filter((x) => x !== t))}
                                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                                    title="Remove tag"
                                >
                                    <X size={14} />
                                </button>
                            </span>
                        ))}
                    </div>
                )}

                {/* Add Tag Input */}
                <div className="flex gap-2">
                    <input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') addTag();
                        }}
                        placeholder="Add a new tag..."
                        className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                    <button
                        onClick={addTag}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
                    >
                        <PlusCircle size={16} />
                        Add Tag
                    </button>
                </div>
            </div>
        </div>
    );
}