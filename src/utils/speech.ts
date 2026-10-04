/**
 * Web Speech API speech synthesis utility for Chinese (Mandarin zh-CN)
 */

let activeUtterance: SpeechSynthesisUtterance | null = null;

export const speakChinese = (text: string, rate: number = 0.9, onEnd?: () => void): boolean => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser environment');
    return false;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const cleanText = text.trim();
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
    activeUtterance = null;
    if (onEnd) onEnd();
  };

  utterance.onerror = (e) => {
    console.warn('Speech synthesis error:', e);
    activeUtterance = null;
    if (onEnd) onEnd();
  };

  activeUtterance = utterance;
  window.speechSynthesis.speak(utterance);
  return true;
};

export const stopSpeech = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  activeUtterance = null;
};
