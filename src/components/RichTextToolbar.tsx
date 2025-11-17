import React from 'react';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, PenTool, Highlighter } from 'lucide-react';

interface Props {
    exec: (cmd: string, val?: string) => void;
    activeStyles: string[];
    onToggleCanvas: () => void;
    onShowHighlightMenu: (open: boolean) => void;
    highlightColor?: string | null;
}

export default function RichTextToolbar({ exec, activeStyles, onToggleCanvas, onShowHighlightMenu, highlightColor }: Props) {
    return (
        <div className="bg-gradient-to-r from-slate-50 to-blue-50/30 border-b border-slate-200/60 p-6">
            <div className="flex flex-wrap items-center gap-4">
                <button onClick={() => exec('bold')} className={`p-3 rounded-xl ${activeStyles.includes('bold') ? 'bg-blue-100 text-blue-600' : 'text-slate-600'}`} title="Bold"><Bold size={20} /></button>
                <button onClick={() => exec('italic')} className={`p-3 rounded-xl ${activeStyles.includes('italic') ? 'bg-blue-100 text-blue-600' : 'text-slate-600'}`} title="Italic"><Italic size={20} /></button>
                <button onClick={() => exec('underline')} className={`p-3 rounded-xl ${activeStyles.includes('underline') ? 'bg-blue-100 text-blue-600' : 'text-slate-600'}`} title="Underline"><Underline size={20} /></button>
                <div className="w-px h-8 bg-slate-300/60"></div>
                <button onClick={() => exec('justifyLeft')} className="p-3 rounded-xl text-slate-600" title="Align Left"><AlignLeft size={20} /></button>
                <button onClick={() => exec('justifyCenter')} className="p-3 rounded-xl text-slate-600" title="Align Center"><AlignCenter size={20} /></button>
                <button onClick={() => exec('justifyRight')} className="p-3 rounded-xl text-slate-600" title="Align Right"><AlignRight size={20} /></button>
                <div className="w-px h-8 bg-slate-300/60"></div>
                <button onClick={onToggleCanvas} className={`p-3 rounded-xl ${highlightColor ? 'bg-purple-100 text-purple-600' : 'text-slate-600'}`} title="Drawing Tool"><PenTool size={20} /></button>
                <button onClick={() => onShowHighlightMenu(true)} className="p-3 rounded-xl text-slate-600" title="Highlight"><Highlighter size={20} /></button>
            </div>
        </div>
    );
}
