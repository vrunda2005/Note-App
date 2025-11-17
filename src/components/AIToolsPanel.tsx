import React from 'react';
import { Sparkles, Palette, Eye, BookOpen } from 'lucide-react';

interface Props {
    onSuggestTags: () => void;
    onGrammarCheck: () => void;
    onReadability: () => void;
    onSummarize: () => void;
    onGlossary: () => void;
    disabled: boolean;
    glossaryCount: number;
}

export default function AIToolsPanel({ onSuggestTags, onGrammarCheck, onReadability, onSummarize, onGlossary, disabled, glossaryCount }: Props) {
    return (
        <div className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 border border-blue-200/40 rounded-2xl p-4 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Sparkles size={22} className="text-blue-600" />
                AI-Powered Tools
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <button onClick={onSuggestTags} disabled={disabled} className="flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg text-xs md:text-sm">
                    <Sparkles size={16} />
                    Suggest Tags
                </button>
                <button onClick={onGrammarCheck} disabled={disabled} className="flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg text-xs md:text-sm">
                    <Palette size={16} />
                    Check Grammar
                </button>
                <button onClick={onReadability} disabled={disabled} className="flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg text-xs md:text-sm">
                    <Eye size={16} />
                    Readability
                </button>
                <button onClick={onSummarize} disabled={disabled} className="flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg text-xs md:text-sm">
                    <BookOpen size={16} />
                    Summarize
                </button>
                <button onClick={onGlossary} disabled={disabled} className="flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-amber-900 rounded-lg text-xs md:text-sm relative">
                    <Sparkles size={16} />
                    Glossary
                    {glossaryCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{glossaryCount}</span>
                    )}
                </button>
            </div>
        </div>
    );
}
