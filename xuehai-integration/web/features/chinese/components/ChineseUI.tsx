import { useEffect, useRef, type ReactNode, type PointerEvent } from 'react';
import type { GradeId } from '../data/chinese.ts';
import { GRADES_LIST } from '../data/index.ts';
import { stopChineseSpeech, speakChinese } from '../speech.ts';

export interface ChineseViewContext {
  navigate: (route: string) => void;
}

export function ChineseFrame({ctx,title,subtitle,children}:{ctx:ChineseViewContext;title:string;subtitle:string;children?:ReactNode}) {
  useEffect(()=>()=>stopChineseSpeech(),[]);
  return <section className="space-y-5">
    <header className="rounded-3xl border border-[#E7EEF8] bg-white p-6 shadow-sm">
      <p className="text-sm text-[#7890B0]">CHINESE · 语文学习</p>
      <h1 className="mt-2 text-2xl font-bold">{title}</h1>
      <p className="mt-2 text-sm text-[#607797]">{subtitle}</p>
    </header>
    {children}
    <button type="button" onClick={()=>ctx.navigate('/chinese')} className="text-sm text-blue-700">返回语文首页</button>
  </section>;
}

export function ChineseGradePicker({value,onChange}:{value:GradeId;onChange:(value:GradeId)=>void}) {
  return <label className="flex items-center gap-2 text-sm text-[#607797]">学习年级
    <select value={value} onChange={e=>onChange(e.target.value as GradeId)} className="rounded-xl border border-[#D9E5F4] bg-white px-3 py-2 text-[#29466F]">
      {GRADES_LIST.map(grade=><option key={grade.id} value={grade.id}>{grade.name}</option>)}
    </select>
  </label>;
}

export function ChineseNotice({children,error=false}:{children:ReactNode;error?:boolean}) {
  return <p role="status" aria-live="polite" className={`rounded-xl px-3 py-2 text-sm ${error?'bg-rose-50 text-rose-700':'bg-blue-50 text-blue-700'}`}>{children}</p>;
}

export function ChineseCard({title,meta,children}:{title:string;meta?:string;children?:ReactNode}) {
  return <article className="rounded-2xl border border-[#E7EEF8] bg-white p-4 shadow-sm">
    <div className="flex flex-wrap justify-between gap-2"><h2 className="font-semibold text-[#29466F]">{title}</h2>{meta&&<span className="text-xs text-[#7890B0]">{meta}</span>}</div>
    {children&&<div className="mt-3 space-y-2 text-sm text-[#526B8D]">{children}</div>}
  </article>;
}

export function ChineseSpeakButton({text,label='朗读'}:{text:string;label?:string}) {
  return <button type="button" onClick={()=>speakChinese(text)} className="rounded-lg border border-[#D9E5F4] px-3 py-1.5 text-xs text-[#29466F] hover:bg-[#F7FAFF]">{label}</button>;
}

export function ChineseSearch({value,onChange,placeholder}:{value:string;onChange:(value:string)=>void;placeholder:string}) {
  return <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-[#D9E5F4] bg-white px-3 py-2 text-sm sm:max-w-xs"/>;
}

/** 米字格书写画布；笔迹仅保留在当前页面，不上传原始图像。 */
export function ChineseHandwritingPad() {
  const canvasRef=useRef<HTMLCanvasElement|null>(null);
  const drawing=useRef(false);
  const paintGrid=()=>{
    const canvas=canvasRef.current;
    if(!canvas)return;
    const ratio=window.devicePixelRatio||1;
    const rect=canvas.getBoundingClientRect();
    canvas.width=Math.max(1,Math.floor(rect.width*ratio));
    canvas.height=Math.floor(300*ratio);
    const context=canvas.getContext('2d');
    if(!context)return;
    context.scale(ratio,ratio);
    const width=rect.width,height=300;
    context.fillStyle='#fff';context.fillRect(0,0,width,height);
    context.strokeStyle='#d9e5f4';context.lineWidth=1;context.setLineDash([5,5]);
    context.strokeRect(1,1,width-2,height-2);
    context.beginPath();
    context.moveTo(width/2,0);context.lineTo(width/2,height);
    context.moveTo(0,height/2);context.lineTo(width,height/2);
    context.moveTo(0,0);context.lineTo(width,height);
    context.moveTo(width,0);context.lineTo(0,height);
    context.stroke();context.setLineDash([]);
  };
  useEffect(()=>{
    paintGrid();
    const onResize=()=>paintGrid();
    window.addEventListener('resize',onResize);
    return()=>window.removeEventListener('resize',onResize);
  },[]);
  const point=(event:PointerEvent<HTMLCanvasElement>)=>{
    const rect=event.currentTarget.getBoundingClientRect();
    return {x:event.clientX-rect.left,y:event.clientY-rect.top};
  };
  const down=(event:PointerEvent<HTMLCanvasElement>)=>{
    const canvas=event.currentTarget,context=canvas.getContext('2d');
    if(!context)return;
    canvas.setPointerCapture(event.pointerId);
    const p=point(event);drawing.current=true;
    context.beginPath();context.moveTo(p.x,p.y);context.lineWidth=4;
    context.lineCap='round';context.lineJoin='round';context.strokeStyle='#29466F';
  };
  const move=(event:PointerEvent<HTMLCanvasElement>)=>{
    if(!drawing.current)return;
    const context=event.currentTarget.getContext('2d');
    if(!context)return;
    const p=point(event);context.lineTo(p.x,p.y);context.stroke();
  };
  const up=()=>{drawing.current=false;};
  return <div className="space-y-2">
    <canvas ref={canvasRef} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onPointerLeave={up} className="h-[300px] w-full touch-none rounded-xl border border-[#D9E5F4] bg-white" aria-label="米字格书写画布"/>
    <div className="flex items-center justify-between"><span className="text-xs text-[#7890B0]">在米字格中书写；笔迹仅在当前页面临时显示。</span><button type="button" onClick={paintGrid} className="rounded-lg border px-3 py-1.5 text-sm">清空画布</button></div>
  </div>;
}
