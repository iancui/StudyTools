/**
 * Web Speech API speech synthesis utility for Chinese (Mandarin zh-CN)
 *
 * 工单 14: 修复生字朗读串音问题.
 *   - 点击"朗读生字"只朗读目标汉字本身, 不带拼音/释义/按钮文本/说明文字.
 *   - 中文语音 lang 使用 zh-CN.
 *   - 每次播放前正确取消前一个 utterance, 避免串音.
 *   - 如果 UI 同时有"朗读拼音", 必须单独调用 speakPinyin.
 *   - 不改变其他模块正常朗读功能 (例句/词语仍走 speakChinese).
 */

let activeUtterance: SpeechSynthesisUtterance | null = null;

/**
 * 取字符串中第一个汉字 (用于"只朗读目标生字"的严格场景).
 * 如果传入 "绒 róng" 也只会朗读 "绒".
 */
const pickFirstChineseChar = (text: string): string => {
  if (!text) return '';
  // 匹配 CJK 统一汉字范围
  const match = text.match(/[\u4e00-\u9fff]/);
  return match ? match[0] : '';
};

/**
 * 朗读一个汉字 (仅朗读该汉字本身, 不会带拼音/释义/按钮文本等).
 * 用于"朗读生字"按钮. 如果传入多字符, 也只朗读第一个汉字.
 */
export const speakChar = (charText: string, rate: number = 0.9, onEnd?: () => void): boolean => {
  const target = pickFirstChineseChar(charText);
  if (!target) return false;
  return speakChinese(target, rate, onEnd);
};

/**
 * 朗读拼音 (独立调用, 与汉字朗读分开).
 * 拼音会被朗读为字母逐个发音 (浏览器对纯英文字符串默认按字母读).
 */
export const speakPinyin = (pinyin: string, rate: number = 0.9, onEnd?: () => void): boolean => {
  const clean = (pinyin || '').trim();
  if (!clean) return false;
  return speakChinese(clean, rate, onEnd);
};

/**
 * 朗读任意中文文本 (例句/词语等). 会保留传入文本全部内容.
 */
export const speakChinese = (text: string, rate: number = 0.9, onEnd?: () => void): boolean => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser environment');
    return false;
  }

  // 每次播放前正确取消前一个 utterance, 避免串音
  window.speechSynthesis.cancel();
  activeUtterance = null;

  const cleanText = (text || '').trim();
  if (!cleanText) return false;

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = 'zh-CN';
  utterance.rate = rate; // 0.8 to 1.0 for comfortable learning pace
  utterance.pitch = 1.0;

  // Try to find a high quality Mandarin voice if available
  const voices = window.speechSynthesis.getVoices();
  const zhVoice = voices.find(v => v.lang.startsWith('zh-CN') || v.lang === 'zh_CN' || v.lang.startsWith('zh'));
  if (zhVoice) {
    utterance.voice = zhVoice;
  }

  utterance.onend = () => {
    if (activeUtterance === utterance) {
      activeUtterance = null;
    }
    if (onEnd) onEnd();
  };

  utterance.onerror = (e) => {
    console.warn('Speech synthesis error:', e);
    if (activeUtterance === utterance) {
      activeUtterance = null;
    }
    if (onEnd) onEnd();
  };

  activeUtterance = utterance;
  // 使用 setTimeout 确保 cancel 完成后再 speak, 避免某些浏览器串音
  setTimeout(() => {
    window.speechSynthesis.speak(utterance);
  }, 0);
  return true;
};

export const stopSpeech = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  activeUtterance = null;
};
