// 墨韵中文 前端 拍照复习生字 (工单 14)
// ============================================================
//
// 第一版目标:
//   打开摄像头 → 拍照 → 预览 → 确认 → 识别图中汉字 →
//   与当前课程/复习范围的生字库比较 → 显示识别结果 → 生成本次复习结果.
//
// OCR 方案选型:
//   浏览器没有可靠的原生中文 OCR API. 当前项目无 OCR 依赖.
//   为了不引入需要 API Key 的外部 AI 服务, 也不提交密钥,
//   第一版采用"用户手动勾选识别到的字"的方式:
//     - 摄像头拍照 + 预览 + 确认流程完整可用
//     - 系统把当前复习范围内的生字完整列出
//     - 用户根据照片实际看到的字勾选
//     - 系统对比目标生字库, 给出 ✓ 已识别 / 未识别 列表
//   后续若引入浏览器端 OCR 库 (如 tesseract.js), 只需替换
//   recognizeCharacters 函数, UI 其他部分保持不变.
//
// 不引入新依赖, 不修改数据库, 不影响首屏 bundle.

import React, { useEffect, useRef, useState } from "react";
import { Camera, CheckCircle2, RotateCcw, X, Sparkles, RefreshCw } from "lucide-react";
import { CharacterItem } from "../types/chinese";

interface PhotoReviewProps {
  /** 当前复习范围的生字 (来自教材或 curriculum). */
  charactersList: CharacterItem[];
  /** 已掌握生字 ID (用于结果统计). */
  masteredIds: string[];
  /** 完成本次复习后回调. */
  onComplete?: (recognizedIds: string[]) => void;
}

type Phase = "idle" | "camera" | "preview" | "result";

export const PhotoReview: React.FC<PhotoReviewProps> = ({
  charactersList,
  masteredIds,
  onComplete,
}) => {
  const [phase, setPhase] = useState<Phase>("idle");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [recognizedIds, setRecognizedIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 启动摄像头
  const startCamera = async () => {
    setError(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError("当前浏览器不支持摄像头, 请使用 Chrome / Edge / Safari 最新版");
        return;
      }
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      setStream(s);
      setPhase("camera");
      // 等待 video 元素挂载后绑定 srcObject
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "无法访问摄像头";
      setError(msg);
    }
  };

  // 拍照
  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);
    const url = canvas.toDataURL("image/jpeg", 0.85);
    setPhotoUrl(url);
    stopStream();
    setPhase("preview");
  };

  // 取消, 释放摄像头
  const cancelCamera = () => {
    stopStream();
    setPhase("idle");
  };

  // 取消预览, 重新拍
  const retake = () => {
    setPhotoUrl(null);
    setRecognizedIds([]);
    startCamera();
  };

  // 确认照片, 进入"勾选识别到的字"阶段
  const confirmPhoto = () => {
    setPhase("result");
  };

  // 停止摄像头流
  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
    }
    setStream(null);
  };

  // 组件卸载或离开 camera 阶段时释放
  useEffect(() => {
    return () => stopStream();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 切换某字"识别到/未识别"勾选
  const toggleRecognized = (id: string) => {
    setRecognizedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // 完成本次复习
  const handleComplete = () => {
    if (onComplete) onComplete(recognizedIds);
    setPhase("idle");
    setPhotoUrl(null);
    setRecognizedIds([]);
  };

  const targetChars = charactersList;
  const recognizedSet = new Set(recognizedIds);
  const recognizedInTarget = targetChars.filter((c) => recognizedSet.has(c.id));
  const missedInTarget = targetChars.filter((c) => !recognizedSet.has(c.id));
  const accuracy = targetChars.length > 0
    ? Math.round((recognizedInTarget.length / targetChars.length) * 100)
    : 0;

  return (
    <div className="bg-white border border-[#E6E1D8] rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#F0ECE4]">
        <div className="flex items-center gap-2">
          <Camera size={18} className="text-[#B83A2D]" />
          <h3 className="text-base font-bold font-serif-sc text-[#24292E]">
            拍照复习生字
          </h3>
        </div>
        {phase !== "idle" && (
          <button
            onClick={() => {
              stopStream();
              setPhase("idle");
              setPhotoUrl(null);
              setRecognizedIds([]);
            }}
            className="text-xs text-[#57606A] hover:text-[#B83A2D] flex items-center gap-1"
          >
            <X size={13} /> 关闭
          </button>
        )}
      </div>

      {error && (
        <div className="text-xs text-[#B83A2D] bg-[#FEF2F2] border border-[#FCA5A5] rounded p-2.5">
          {error}
        </div>
      )}

      {/* Phase: idle - 入口 */}
      {phase === "idle" && (
        <div className="text-center py-6 space-y-3">
          <p className="text-xs text-[#57606A]">
            打开摄像头拍下课本或字卡, 然后勾选照片中出现的字, 系统会自动对比当前范围的生字.
          </p>
          <button
            onClick={startCamera}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-[#B83A2D] text-white hover:bg-[#9E2F23] transition-colors"
          >
            <Camera size={14} />
            <span>打开摄像头</span>
          </button>
          {targetChars.length === 0 && (
            <div className="text-[11px] text-[#8C8273]">
              当前范围没有可复习的生字, 请先选择课程.
            </div>
          )}
        </div>
      )}

      {/* Phase: camera - 实时预览 + 拍照 */}
      {phase === "camera" && (
        <div className="space-y-3">
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-auto max-h-[480px] object-contain"
            />
            <div className="absolute inset-0 pointer-events-none border-2 border-[#B83A2D]/30 rounded-lg" />
          </div>
          <canvas ref={canvasRef} className="hidden" />
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={cancelCamera}
              className="px-3 py-1.5 text-xs font-medium rounded-md bg-white border border-[#DDD7CD] text-[#57606A] hover:bg-[#F2ECE0]"
            >
              取消
            </button>
            <button
              onClick={takePhoto}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-md bg-[#B83A2D] text-white hover:bg-[#9E2F23]"
            >
              <Camera size={14} /> 拍照
            </button>
          </div>
        </div>
      )}

      {/* Phase: preview - 照片预览 */}
      {phase === "preview" && photoUrl && (
        <div className="space-y-3">
          <div className="bg-black rounded-lg overflow-hidden">
            <img
              src={photoUrl}
              alt="拍摄的生字"
              className="w-full h-auto max-h-[480px] object-contain"
            />
          </div>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={retake}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-white border border-[#DDD7CD] text-[#57606A] hover:bg-[#F2ECE0]"
            >
              <RotateCcw size={13} /> 重拍
            </button>
            <button
              onClick={confirmPhoto}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-md bg-[#B83A2D] text-white hover:bg-[#9E2F23]"
            >
              <CheckCircle2 size={14} /> 确认照片
            </button>
          </div>
        </div>
      )}

      {/* Phase: result - 勾选识别结果 */}
      {phase === "result" && (
        <div className="space-y-4">
          <div className="text-xs text-[#57606A] bg-[#FAF8F5] p-2.5 rounded border border-[#EDE7DC]">
            请对照照片, 勾选你能在照片中看到的字. 系统会自动对比目标生字, 生成复习结果.
          </div>

          {photoUrl && (
            <div className="bg-black rounded-lg overflow-hidden max-h-48">
              <img
                src={photoUrl}
                alt="拍摄的生字"
                className="w-full h-auto max-h-48 object-contain"
              />
            </div>
          )}

          {/* 目标生字勾选列表 */}
          <div>
            <div className="text-[11px] font-bold text-[#8C8273] uppercase tracking-wider mb-2">
              当前范围生字 (共 {targetChars.length} 字)
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {targetChars.map((c) => {
                const checked = recognizedIds.includes(c.id);
                const mastered = masteredIds.includes(c.id);
                return (
                  <button
                    key={c.id}
                    onClick={() => toggleRecognized(c.id)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-xs transition-colors ${
                      checked
                        ? "bg-[#FAF6EE] border-[#B83A2D] text-[#24292E]"
                        : "bg-[#FAF8F5] border-[#DDD7CD] text-[#57606A] hover:bg-[#F2ECE0]"
                    }`}
                  >
                    <span className="font-serif-sc text-xl font-bold">
                      {c.char}
                    </span>
                    <span className="font-mono text-[10px]">
                      {c.pinyin || "-"}
                    </span>
                    <span className="text-[10px]">
                      {checked ? "✓ 识别到" : mastered ? "已掌握" : "未识别"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 结果统计 */}
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[#F0ECE4]">
            <div className="text-center p-3 rounded-lg bg-[#EBF7EE] border border-[#C6E9CC]">
              <div className="text-xl font-bold font-mono text-[#16A34A]">
                {recognizedInTarget.length}
              </div>
              <div className="text-[10px] text-[#57606A]">已识别</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-[#FEF2F2] border border-[#FCA5A5]">
              <div className="text-xl font-bold font-mono text-[#B83A2D]">
                {missedInTarget.length}
              </div>
              <div className="text-[10px] text-[#57606A]">未识别</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-[#FAF6EE] border border-[#ECD9BF]">
              <div className="text-xl font-bold font-mono text-[#92400E]">
                {accuracy}%
              </div>
              <div className="text-[10px] text-[#57606A]">本范围覆盖率</div>
            </div>
          </div>

          {/* 未识别列表 (重点复习) */}
          {missedInTarget.length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-[#B83A2D] flex items-center gap-1.5">
                <Sparkles size={13} />
                <span>建议重点复习 (未在照片中识别到)</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {missedInTarget.map((c) => (
                  <span
                    key={c.id}
                    className="px-2 py-1 text-xs font-serif-sc font-bold bg-[#FAF8F5] border border-[#DDD7CD] rounded text-[#24292E]"
                  >
                    {c.char}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F0ECE4]">
            <button
              onClick={retake}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-white border border-[#DDD7CD] text-[#57606A] hover:bg-[#F2ECE0]"
            >
              <RefreshCw size={13} /> 重新拍摄
            </button>
            <button
              onClick={handleComplete}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-md bg-[#B83A2D] text-white hover:bg-[#9E2F23]"
            >
              <CheckCircle2 size={14} /> 完成本次复习
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
