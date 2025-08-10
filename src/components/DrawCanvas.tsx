// src/components/DrawCanvas.tsx
import React, { useRef, useState, useEffect } from 'react';
import { PenTool, Eraser, Trash2, Download, Palette, X } from 'lucide-react';

interface DrawCanvasProps {
    onSave: (dataUrl: string) => void;
    onCancel?: () => void;
}

const DrawCanvas: React.FC<DrawCanvasProps> = ({ onSave, onCancel }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [drawing, setDrawing] = useState(false);
    const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
    const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
    const [brushSize, setBrushSize] = useState(3);
    const [brushColor, setBrushColor] = useState('#000000');

    const colors = [
        '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
        '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080',
        '#008000', '#ffc0cb', '#a52a2a', '#808080', '#ffd700'
    ];

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = 800;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.lineWidth = brushSize;
            ctx.strokeStyle = brushColor;
            setContext(ctx);
            // Set white background
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }, []);

    useEffect(() => {
        if (context) {
            context.lineWidth = brushSize;
            context.strokeStyle = tool === 'eraser' ? '#ffffff' : brushColor;
        }
    }, [context, brushSize, brushColor, tool]);

    const startDrawing = (e: React.MouseEvent) => {
        if (!context) return;
        setDrawing(true);
        const rect = canvasRef.current!.getBoundingClientRect();
        context.beginPath();
        context.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    };

    const draw = (e: React.MouseEvent) => {
        if (!drawing || !context) return;
        const rect = canvasRef.current!.getBoundingClientRect();
        if (tool === 'eraser') {
            context.save();
            context.globalCompositeOperation = 'destination-out';
            context.arc(e.clientX - rect.left, e.clientY - rect.top, brushSize / 2, 0, Math.PI * 2);
            context.fill();
            context.restore();
        } else {
            context.lineTo(e.clientX - rect.left, e.clientY - rect.top);
            context.stroke();
        }
    };

    const stopDrawing = () => {
        if (!context) return;
        context.closePath();
        setDrawing(false);
    };

    const clearCanvas = () => {
        if (!context || !canvasRef.current) return;
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    };

    const saveCanvas = () => {
        if (!canvasRef.current) return;
        const dataUrl = canvasRef.current.toDataURL('image/png');
        onSave(dataUrl);
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6 max-w-[900px] mx-auto">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-xl border border-slate-200/40">
                <div className="flex items-center gap-4">
                    {/* Tool Selection */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setTool('pen')}
                            className={`p-3 rounded-xl border-2 transition-all duration-200 ${tool === 'pen'
                                    ? 'border-blue-500 bg-blue-100/80 text-blue-600 shadow-md'
                                    : 'border-slate-200/60 text-slate-600 hover:border-slate-300/60 hover:bg-slate-100/60'
                                }`}
                            title="Pen Tool"
                        >
                            <PenTool size={20} />
                        </button>
                        <button
                            onClick={() => setTool('eraser')}
                            className={`p-3 rounded-xl border-2 transition-all duration-200 ${tool === 'eraser'
                                    ? 'border-red-500 bg-red-100/80 text-red-600 shadow-md'
                                    : 'border-slate-200/60 text-slate-600 hover:border-slate-300/60 hover:bg-slate-100/60'
                                }`}
                            title="Eraser Tool"
                        >
                            <Eraser size={20} />
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="w-px h-8 bg-slate-300/60"></div>

                    {/* Brush Size */}
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-slate-700">Size:</span>
                        <input
                            type="range"
                            min="1"
                            max="20"
                            value={brushSize}
                            onChange={(e) => setBrushSize(Number(e.target.value))}
                            className="w-24 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                        />
                        <span className="text-sm text-slate-600 w-8">{brushSize}px</span>
                    </div>

                    {/* Divider */}
                    <div className="w-px h-8 bg-slate-300/60"></div>

                    {/* Color Palette */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-700">Color:</span>
                        <div className="flex gap-1">
                            {colors.map((color) => (
                                <button
                                    key={color}
                                    onClick={() => setBrushColor(color)}
                                    className={`w-6 h-6 rounded-lg border-2 transition-all duration-200 hover:scale-110 ${brushColor === color
                                            ? 'border-slate-800 shadow-lg'
                                            : 'border-slate-300/60 hover:border-slate-400/60'
                                        }`}
                                    style={{ backgroundColor: color }}
                                    title={color}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={clearCanvas}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                        title="Clear Canvas"
                    >
                        <Trash2 size={18} />
                        <span className="text-sm font-medium">Clear</span>
                    </button>

                    {onCancel && (
                        <button
                            onClick={onCancel}
                            className="flex items-center gap-2 px-4 py-2.5 bg-slate-200/80 text-slate-700 rounded-xl hover:bg-slate-300/80 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                            title="Cancel"
                        >
                            <X size={18} />
                            <span className="text-sm font-medium">Cancel</span>
                        </button>
                    )}

                    <button
                        onClick={saveCanvas}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                        title="Save Drawing"
                    >
                        <Download size={18} />
                        <span className="text-sm font-medium">Save</span>
                    </button>
                </div>
            </div>

            {/* Canvas */}
            <div className="flex justify-center">
                <div className="relative">
                    <canvas
                        ref={canvasRef}
                        className="border-2 border-slate-200/60 rounded-xl cursor-crosshair shadow-lg hover:shadow-xl transition-shadow duration-200"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        style={{
                            cursor: tool === 'eraser' ? 'crosshair' : 'crosshair',
                            filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))'
                        }}
                    />

                    {/* Drawing Cursor Indicator */}
                    {drawing && (
                        <div
                            className="absolute pointer-events-none rounded-full border-2 border-slate-400 bg-slate-200/20"
                            style={{
                                width: brushSize,
                                height: brushSize,
                                left: 0,
                                top: 0,
                                transform: 'translate(-50%, -50%)'
                            }}
                        />
                    )}
                </div>
            </div>

            {/* Instructions */}
            <div className="mt-6 text-center">
                <p className="text-sm text-slate-500">
                    {tool === 'pen'
                        ? `Drawing with ${brushSize}px brush in ${brushColor === '#000000' ? 'black' : brushColor}`
                        : `Erasing with ${brushSize}px eraser`
                    }
                </p>
            </div>

            <style jsx>{`
                .slider::-webkit-slider-thumb {
                    appearance: none;
                    height: 20px;
                    width: 20px;
                    border-radius: 50%;
                    background: #3b82f6;
                    cursor: pointer;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                
                .slider::-moz-range-thumb {
                    height: 20px;
                    width: 20px;
                    border-radius: 50%;
                    background: #3b82f6;
                    cursor: pointer;
                    border: none;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
            `}</style>
        </div>
    );
};

export default DrawCanvas;