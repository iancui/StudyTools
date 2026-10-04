import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw, Eye, EyeOff, Sparkles, Check, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface HandwritingCanvasProps {
  targetChar: string;
  pinyin?: string;
  onMastered?: () => void;
}

export const HandwritingCanvas: React.FC<HandwritingCanvasProps> = ({
  targetChar,
  pinyin,
  onMastered
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [strokeHistory, setStrokeHistory] = useState<ImageData[]>([]);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [strokeWidth, setStrokeWidth] = useState(8);

  const getCanvasContext = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext('2d');
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = getCanvasContext();
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setStrokeHistory([]);
    setHasDrawn(false);
  };

  // Resize canvas for sharp retina display
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const size = 260;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#22252A'; // Traditional Chinese calligraphy ink color
      ctx.lineWidth = strokeWidth;
    }
  }, [strokeWidth]);

  // When targetChar changes, clear drawing
  useEffect(() => {
    clearCanvas();
  }, [targetChar]);

  const saveState = () => {
    const canvas = canvasRef.current;
    const ctx = getCanvasContext();
    if (!canvas || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setStrokeHistory(prev => [...prev.slice(-10), data]);
    setHasDrawn(true);
  };

  const undoLastStroke = () => {
    const canvas = canvasRef.current;
    const ctx = getCanvasContext();
    if (!canvas || !ctx || strokeHistory.length === 0) return;

    const newHistory = [...strokeHistory];
    newHistory.pop(); // Remove current
    const previous = newHistory[newHistory.length - 1];

    if (previous) {
      ctx.putImageData(previous, 0, 0);
      setStrokeHistory(newHistory);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setStrokeHistory([]);
      setHasDrawn(false);
    }
  };

  const getPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    } else if ('clientX' in e) {
      return {
        x: (e as React.MouseEvent<HTMLCanvasElement>).clientX - rect.left,
        y: (e as React.MouseEvent<HTMLCanvasElement>).clientY - rect.top
      };
    }
    return { x: 0, y: 0 };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const ctx = getCanvasContext();
    if (!ctx) return;

    saveState();
    setIsDrawing(true);
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 0.5, y + 0.5); // single point
    ctx.stroke();
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const ctx = getCanvasContext();
    if (!ctx) return;

    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const ctx = getCanvasContext();
    if (ctx) ctx.closePath();
  };

  const handleFinishPractice = () => {
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#B83A2D', '#D97706', '#16A34A', '#24292E']
    });
    if (onMastered) {
      onMastered();
    }
  };

  return (
    <div className="flex flex-col items-center select-none">
      {/* Tianzige / Mizige Container */}
      <div className="relative w-[260px] h-[260px] rounded-lg border-2 border-[#B83A2D]/40 mizige-bg overflow-hidden shadow-inner">
        {/* Subtle decorative corners */}
        <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-[#B83A2D]/60 pointer-events-none" />
        <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-[#B83A2D]/60 pointer-events-none" />
        <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-[#B83A2D]/60 pointer-events-none" />
        <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-[#B83A2D]/60 pointer-events-none" />

        {/* Ghost character guide for tracing (描红) */}
        {showGuide && (
          <div 
            className="absolute inset-0 flex items-center justify-center pointer-events-none font-serif-sc text-[180px] leading-none text-[#24292E]/15 font-bold transition-opacity select-none"
            style={{ textShadow: '0 0 1px rgba(0,0,0,0.05)' }}
          >
            {targetChar}
          </div>
        )}

        {/* Drawing canvas */}
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="relative z-10 w-full h-full cursor-crosshair touch-none"
        />
      </div>

      {/* Control bar */}
      <div className="flex items-center justify-between w-full max-w-[260px] mt-3 text-xs text-[#57606A]">
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#EFECE6] text-[#24292E] hover:bg-[#E4DFD5] transition-colors"
          title="切换描红指引"
        >
          {showGuide ? <EyeOff size={13} /> : <Eye size={13} />}
          <span>{showGuide ? '隐藏底字' : '显示描红'}</span>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            onClick={undoLastStroke}
            disabled={strokeHistory.length === 0}
            className="p-1.5 rounded bg-[#EFECE6] text-[#24292E] hover:bg-[#E4DFD5] disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="撤销一笔"
          >
            <RotateCcw size={13} />
          </button>

          <button
            onClick={clearCanvas}
            disabled={!hasDrawn}
            className="p-1.5 rounded bg-[#EFECE6] text-[#24292E] hover:bg-[#E4DFD5] disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="重写清空"
          >
            <Trash2 size={13} />
          </button>

          <button
            onClick={handleFinishPractice}
            disabled={!hasDrawn}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#1B4D3E] text-white hover:bg-[#153D31] disabled:opacity-35 disabled:pointer-events-none transition-colors"
            title="完成书写练习"
          >
            <Check size={13} />
            <span>练好</span>
          </button>
        </div>
      </div>
    </div>
  );
};
