import React, { useRef, useState, useEffect } from "react";

export default function DrawCanvas({ onSave }: { onSave: (dataUrl: string) => void }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [drawing, setDrawing] = useState(false);
    const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

    useEffect(() => {
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext("2d");
            if (ctx) {
                ctx.lineWidth = 2;
                ctx.lineCap = "round";
                setContext(ctx);
            }
        }
    }, []);

    const startDrawing = (e: React.MouseEvent) => {
        if (!context) return;
        context.beginPath();
        context.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        setDrawing(true);
    };

    const draw = (e: React.MouseEvent) => {
        if (!drawing || !context) return;
        context.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        context.stroke();
    };

    const stopDrawing = () => {
        setDrawing(false);
        if (canvasRef.current) {
            onSave(canvasRef.current.toDataURL());
        }
    };

    return (
        <div>
            <canvas
                ref={canvasRef}
                width={500}
                height={300}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                className="border rounded bg-white"
            />
        </div>
    );
}
