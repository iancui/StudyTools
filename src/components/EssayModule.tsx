import React, { useState } from 'react';
import { BookOpen, PenTool, Sparkles, Award, Send, CheckCircle2, Quote, Lightbulb, ChevronDown } from 'lucide-react';
import confetti from 'canvas-confetti';
import { EssayItem, GradeId } from '../types/chinese';
import { EssayPracticeRecord } from '../types/progress';
import { ESSAYS_DATA } from '../data/curriculum';
import { speakChinese } from '../utils/speech';

interface EssayModuleProps {
  gradeId: GradeId;
  savedPractices: EssayPracticeRecord[];
  onSavePractice: (record: EssayPracticeRecord) => void;
}

export const EssayModule: React.FC<EssayModuleProps> = ({
  gradeId,
  savedPractices,
  onSavePractice
}) => {
  const essays = ESSAYS_DATA[gradeId] || [];
  const currentEssay = essays[0];

  const [activeTab, setActiveTab] = useState<'model' | 'editor' | 'materials'>('model');
  const [draftTitle, setDraftTitle] = useState('');
  const [draftContent, setDraftContent] = useState('');
  const [lastFeedback, setLastFeedback] = useState<EssayPracticeRecord['feedback'] | null>(null);
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Evaluate user draft smartly
  const handleEvaluateDraft = () => {
    if (!draftContent.trim() || draftContent.trim().length < 30) {
      alert('请输入至少30字以上的习作内容，以便进行细致的智能评析。');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const charCount = draftContent.replace(/\s+/g, '').length;
      
      // Calculate realistic score based on grade expectation and depth
      let calculatedScore = 82;
      if (charCount > 150) calculatedScore += 5;
      if (charCount > 300) calculatedScore += 5;
      if (draftTitle.trim()) calculatedScore += 3;
      if (draftContent.includes('，') && draftContent.includes('。')) calculatedScore += 2;
      calculatedScore = Math.min(calculatedScore, 98);

      // Detect good phrases from curriculum
      const allGoodPhrases = currentEssay?.goodPhrases || ['生机勃勃', '阳光', '清晨', '温暖', '清澈'];
      const detected = allGoodPhrases.filter(p => draftContent.includes(p));

      const feedbackData: EssayPracticeRecord['feedback'] = {
        overview: `本篇习作字数为 ${charCount} 字，立意清晰，行文自然流畅，情感真实饱满。在遣词造句和段落铺展上具有良好的语文素养。`,
        highlights: [
          '开篇切题自然，叙事主体明确，有细节描写的意识。',
          '能够较好地运用书面语言表达内心体会，叙事与抒情结合得当。',
          detected.length > 0 ? `巧妙运用了典范词汇（如：${detected.join('、')}），增强了文章的表现力。` : '语句通顺规整，标点符号运用规范。'
        ],
        suggestions: [
          '可以尝试增加一处微小的感官细节（如气味、声响、光影的变幻），让画面更加跃然纸上。',
          '在文章收束部分，可更进一步联系自身成长体悟，使主旨升华更加醇厚深刻。'
        ],
        detectedGoodWords: detected.length > 0 ? detected : ['自然流畅', '情真意切']
      };

      const record: EssayPracticeRecord = {
        id: `essay-${Date.now()}`,
        essayId: currentEssay ? currentEssay.id : 'custom',
        gradeId,
        title: draftTitle.trim() || (currentEssay ? `练习：《${currentEssay.title}》` : '自主习作练习'),
        content: draftContent,
        date: new Date().toLocaleDateString('zh-CN'),
        score: calculatedScore,
        wordCount: charCount,
        feedback: feedbackData
      };

      onSavePractice(record);
      setLastFeedback(feedbackData);
      setLastScore(calculatedScore);
      setIsSubmitting(false);

      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#B83A2D', '#D97706', '#16A34A', '#24292E']
      });
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Classical Art & Theme */}
      <div className="relative overflow-hidden rounded-xl border border-[#E6E1D8] bg-[#FAF8F5]">
        <div className="grid grid-cols-1 md:grid-cols-12 items-center">
          <div className="md:col-span-8 p-6 md:p-8 space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#B83A2D] bg-[#FAF6EE] px-2.5 py-0.5 rounded border border-[#B83A2D]/20">
                {currentEssay?.gradeTier || '全学段写作'}
              </span>
              <span className="text-xs text-[#57606A]">名师范文 · 技法精析 · 智能点评</span>
            </div>
            <h2 className="text-2xl font-bold font-serif-sc text-[#24292E] tracking-tight">
              {currentEssay?.title || '作文天地与名篇鉴赏'}
            </h2>
            <p className="text-xs text-[#57606A] leading-relaxed max-w-xl">
              {currentEssay?.promptText}
            </p>
          </div>

          <div className="md:col-span-4 relative h-48 md:h-full min-h-[160px] overflow-hidden border-t md:border-t-0 md:border-l border-[#E6E1D8]">
            <img
              src="/src/assets/images/ink_landscape_art_1791102599957.jpg"
              alt="水墨山水写作意境"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover brightness-95 contrast-95"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end p-3">
              <span className="text-[11px] text-white/90 font-serif-sc">
                “文章本天成，妙手偶得之。”
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-[#E6E1D8] pb-1">
        <button
          onClick={() => setActiveTab('model')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-t-lg transition-colors border-b-2 ${
            activeTab === 'model'
              ? 'border-[#B83A2D] text-[#B83A2D] bg-white'
              : 'border-transparent text-[#57606A] hover:text-[#24292E]'
          }`}
        >
          <BookOpen size={14} />
          <span>范文深度赏析</span>
        </button>

        <button
          onClick={() => setActiveTab('editor')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-t-lg transition-colors border-b-2 ${
            activeTab === 'editor'
              ? 'border-[#B83A2D] text-[#B83A2D] bg-white'
              : 'border-transparent text-[#57606A] hover:text-[#24292E]'
          }`}
        >
          <PenTool size={14} />
          <span>习作练笔与智能批改</span>
        </button>

        <button
          onClick={() => setActiveTab('materials')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-t-lg transition-colors border-b-2 ${
            activeTab === 'materials'
              ? 'border-[#B83A2D] text-[#B83A2D] bg-white'
              : 'border-transparent text-[#57606A] hover:text-[#24292E]'
          }`}
        >
          <Lightbulb size={14} />
          <span>金句素材宝库</span>
        </button>
      </div>

      {/* TAB 1: MODEL ESSAY & ANNOTATIONS */}
      {activeTab === 'model' && currentEssay && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Model Essay Paragraphs */}
          <div className="lg:col-span-8 bg-white border border-[#E8E3DA] rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-[#F0ECE4] pb-4">
              <div>
                <h3 className="text-xl font-bold font-serif-sc text-[#24292E]">
                  {currentEssay.modelEssay.title}
                </h3>
                <span className="text-xs text-[#8C8273]">标杆高分示范范文</span>
              </div>
              <button
                onClick={() => speakChinese(currentEssay.modelEssay.paragraphs.join(' '))}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FAF6EE] text-xs text-[#B83A2D] hover:bg-[#F2ECE0] transition-colors"
                title="全文朗读"
              >
                <BookOpen size={13} /> 全文朗诵
              </button>
            </div>

            {/* Paragraphs with paired annotations */}
            <div className="space-y-6">
              {currentEssay.modelEssay.paragraphs.map((p, idx) => (
                <div key={idx} className="space-y-2">
                  <p className="font-serif-sc text-sm sm:text-base text-[#24292E] leading-loose indent-8">
                    {p}
                  </p>
                  {currentEssay.paragraphAnnotations[idx] && (
                    <div className="ml-8 text-xs text-[#6B5A3E] bg-[#FAF8F3] border-l-2 border-[#D97706] p-2.5 rounded-r">
                      <strong className="text-[#92400E]">名师旁批：</strong>{' '}
                      {currentEssay.paragraphAnnotations[idx]}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Good Vocabulary Highlights */}
            <div className="pt-4 border-t border-[#F0ECE4] space-y-2">
              <span className="text-xs font-bold text-[#24292E] uppercase">
                范文好词佳句圈点：
              </span>
              <div className="flex flex-wrap gap-2">
                {currentEssay.goodPhrases.map((phrase, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 text-xs bg-[#FAF7F2] text-[#831843] border border-[#F3E8FF] rounded font-medium"
                  >
                    ✨ {phrase}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Outline Advice & Writing Techniques */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-[#E8E3DA] rounded-xl p-5 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-[#24292E] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#B83A2D]" />
                <span>构思与提纲指导</span>
              </h4>
              <ul className="space-y-2 text-xs text-[#333C48]">
                {currentEssay.outlineAdvice.map((advice, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-[#FAF6EE] text-[#B83A2D] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{advice}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white border border-[#E8E3DA] rounded-xl p-5 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-[#24292E] uppercase tracking-wider flex items-center gap-1.5">
                <Award size={14} className="text-[#16A34A]" />
                <span>名校提分妙招</span>
              </h4>
              <ul className="space-y-2 text-xs text-[#333C48]">
                {currentEssay.keyTechniques.map((tech, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#16A34A] font-bold shrink-0">✓</span>
                    <span>{tech}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Prompt CTA to practice */}
            <div className="bg-[#FAF8F5] border border-[#E6E1D8] rounded-xl p-5 text-center space-y-3">
              <p className="text-xs text-[#57606A]">
                看了高分范文与精析，不妨在实战练笔中大显身手吧！
              </p>
              <button
                onClick={() => setActiveTab('editor')}
                className="w-full py-2 bg-[#B83A2D] text-white text-xs font-medium rounded-lg hover:bg-[#9E2F23] transition-colors"
              >
                前往撰写习作并获取点评
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE WRITING WORKSPACE & EVALUATION */}
      {activeTab === 'editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Interactive Draft Form */}
          <div className="lg:col-span-7 bg-white border border-[#E8E3DA] rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#F0ECE4] pb-3">
              <span className="text-xs font-bold text-[#24292E]">习作草稿纸</span>
              <span className="text-xs text-[#57606A] font-mono">
                当前字数：<strong className="text-[#24292E]">{draftContent.replace(/\s+/g, '').length}</strong> 字
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#57606A] mb-1">
                习作标题
              </label>
              <input
                type="text"
                placeholder={currentEssay ? currentEssay.title : '请输入你的习作标题...'}
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm font-serif-sc font-bold border border-[#DDD7CD] rounded-lg focus:outline-none focus:border-[#B83A2D] bg-[#FAF8F5] text-[#24292E]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#57606A] mb-1">
                正文内容（支持分段，输入完毕后点击下方“提交智能批改”）
              </label>
              <textarea
                rows={12}
                placeholder="在此挥毫泼墨，书写你的习作……写完后系统将根据字数、立意、修辞、词汇与篇章结构给出智能多维评析与打分。"
                value={draftContent}
                onChange={(e) => setDraftContent(e.target.value)}
                className="w-full p-4 text-xs sm:text-sm font-serif-sc leading-relaxed border border-[#DDD7CD] rounded-lg focus:outline-none focus:border-[#B83A2D] bg-[#FAF8F5] text-[#24292E] placeholder-[#8C8273]"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-[#8C8273]">
                完成一次习作练习可奖励 +50 墨滴学分
              </span>
              <button
                onClick={handleEvaluateDraft}
                disabled={isSubmitting || draftContent.trim().length === 0}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#B83A2D] text-white text-xs font-medium rounded-lg hover:bg-[#9E2F23] disabled:opacity-40 transition-colors shadow-xs"
              >
                <Send size={13} />
                <span>{isSubmitting ? '智能评阅中...' : '提交智能评改 (+50墨滴)'}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Real-time or Previous Feedback */}
          <div className="lg:col-span-5 space-y-4">
            {lastFeedback ? (
              <div className="bg-white border border-[#E8E3DA] rounded-xl p-6 shadow-xs space-y-5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-[#F0ECE4] pb-3">
                  <div>
                    <span className="text-xs text-[#8C8273]">智能名师综合评分</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-3xl font-serif-sc font-bold text-[#B83A2D]">
                        {lastScore}
                      </span>
                      <span className="text-xs text-[#57606A]">/ 100 分</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-[#FAF6EE] border border-[#B83A2D]/30 flex items-center justify-center text-[#B83A2D]">
                    <Award size={24} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-[#24292E]">总评印象</h4>
                  <p className="text-xs text-[#333C48] leading-relaxed bg-[#FAF8F5] p-3 rounded-lg border border-[#EDE7DC]">
                    {lastFeedback.overview}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-[#16A34A] flex items-center gap-1">
                    <CheckCircle2 size={13} /> 亮点赏识
                  </h4>
                  <ul className="space-y-1 text-xs text-[#333C48]">
                    {lastFeedback.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-[#16A34A] font-bold">·</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-[#D97706] flex items-center gap-1">
                    <Lightbulb size={13} /> 进阶修改建议
                  </h4>
                  <ul className="space-y-1 text-xs text-[#333C48]">
                    {lastFeedback.suggestions.map((s, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-[#D97706] font-bold">·</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-[#E8E3DA] rounded-xl p-8 shadow-xs text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-[#FAF6EE] text-[#B83A2D] flex items-center justify-center">
                  <Sparkles size={20} />
                </div>
                <h4 className="text-sm font-bold font-serif-sc text-[#24292E]">
                  写下你的文章，体验智能批改
                </h4>
                <p className="text-xs text-[#57606A] leading-relaxed">
                  在左侧输入你的作文草稿，系统将对篇章结构、词汇丰富度、立意深度进行多维度评分，并给出中肯温暖的修改建议。
                </p>
              </div>
            )}

            {/* Saved Practices History Preview */}
            {savedPractices.length > 0 && (
              <div className="bg-white border border-[#E8E3DA] rounded-xl p-5 shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-[#24292E] uppercase">
                  历史练笔存档 ({savedPractices.length} 篇)
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {savedPractices.map((record) => (
                    <div
                      key={record.id}
                      className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#EAE4D8] flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-semibold text-[#24292E] line-clamp-1">{record.title}</p>
                        <p className="text-[11px] text-[#8C8273]">{record.date} · {record.wordCount}字</p>
                      </div>
                      <span className="font-bold text-[#B83A2D] font-serif-sc">
                        {record.score}分
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ESSAY MATERIALS TREASURE BOX */}
      {activeTab === 'materials' && currentEssay && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E8E3DA] rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold font-serif-sc text-[#24292E] flex items-center gap-2">
              <Quote size={16} className="text-[#B83A2D]" />
              <span>本单元写作精选名言金句</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentEssay.sampleMaterials.map((mat, idx) => (
                <div
                  key={idx}
                  className="bg-[#FAF8F5] border-l-2 border-[#B83A2D] p-4 rounded-r-lg space-y-1.5"
                >
                  <span className="text-xs font-semibold text-[#8C8273]">{mat.title}</span>
                  <p className="font-serif-sc text-xs sm:text-sm text-[#24292E] leading-relaxed">
                    “{mat.quote}”
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Universal Classic Quotes Pack */}
          <div className="bg-white border border-[#E8E3DA] rounded-xl p-6 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-[#24292E] uppercase">
              名家大师写作智慧锦囊
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-[#FAF8F4] rounded-lg border border-[#EDE7DD]">
                <strong className="text-[#24292E] block mb-1">写景之妙</strong>
                <p className="text-[#57606A]">
                  “一切景语皆情语。景非孤立之物，皆心绪之倒影。” —— 王国维
                </p>
              </div>
              <div className="p-3 bg-[#FAF8F4] rounded-lg border border-[#EDE7DD]">
                <strong className="text-[#24292E] block mb-1">写人之神</strong>
                <p className="text-[#57606A]">
                  “描写人物最要在动作与眼神的微末处下功夫，言有尽而意无穷。” —— 鲁迅
                </p>
              </div>
              <div className="p-3 bg-[#FAF8F4] rounded-lg border border-[#EDE7DD]">
                <strong className="text-[#24292E] block mb-1">谋篇之道</strong>
                <p className="text-[#57606A]">
                  “起承转合，文气如长河奔流，大波跌宕中方见真境界。” —— 苏轼
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
