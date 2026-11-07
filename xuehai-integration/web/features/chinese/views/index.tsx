import { useEffect, useMemo, useState } from 'react';
import type { GradeId, CharacterItem, WordItem, SentenceItem } from '../data/index.ts';
import type { PublicExamQuestion } from '../data/examBank.ts';
import { ChineseFrame as Frame, ChineseGradePicker as GradePicker, ChineseNotice as Notice, ChineseCard as Card, ChineseSpeakButton as SpeakButton, ChineseSearch as Search, ChineseHandwritingPad as HandwritingPad } from '../components/ChineseUI.tsx';
import { getReviewSchedule, sortReviewQueue } from '../reviewAlgorithm.ts';
import { GRADES_LIST, CHARACTERS_DATA, WORDS_DATA, SENTENCES_DATA, ESSAYS_DATA, PREVIEW_GUIDES } from '../data/index.ts';
import { CHINESE_EXAM_BANK } from '../data/examBank.ts';
import {
  getChineseProgress, saveChineseProgress, getChineseCharacters, saveChineseCharacters,
  getChineseWords, saveChineseWords, getChineseSentences, saveChineseSentences,
  recordChineseCharacterPractice, recordChineseWordPractice, recordChineseSentencePractice,
  submitChineseExam, submitChineseEssay, getChineseWrongQuestions, saveChineseWrongQuestion,
  getChineseExams, getChineseEssays, getChinesePreviews, completeChinesePreview, recordChineseStudySession, resolveChineseWrongQuestion,
} from '../api.ts';

interface ViewProps { ctx: { navigate: (route: string) => void } }
function useGrade(){const [grade,setGrade]=useState<GradeId>('g3');useEffect(()=>{let live=true;void getChineseProgress().then((p:any)=>{if(live&&p&&GRADES_LIST.some(x=>x.id===p.grade))setGrade(p.grade);}).catch(()=>{});return()=>{live=false;};},[]);return {grade,setGrade};}
function useRemoteIds(kind:'characters'|'words'|'sentences'){
  const [ids,setIds]=useState<string[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState('');
  useEffect(()=>{let live=true;const load=kind==='characters'?getChineseCharacters:kind==='words'?getChineseWords:getChineseSentences;
    void load().then(rows=>{if(!live)return;const state=kind==='sentences'?'is_completed':'is_mastered',key=kind==='characters'?'character_id':kind==='words'?'word_id':'sentence_id';setIds(rows.filter(r=>Boolean(r[state])).map(r=>String(r[key])));})
    .catch(e=>{if(live)setError(e instanceof Error?e.message:'读取学习记录失败');}).finally(()=>{if(live)setLoading(false);});
    return()=>{live=false;};
  },[kind]);
  const persist=async(next:string[])=>{if(kind==='characters')await saveChineseCharacters(next);else if(kind==='words')await saveChineseWords(next);else await saveChineseSentences(next);setIds(next);};
  return {ids,loading,error,persist};
}

export function ChineseHomeView({ctx}:ViewProps){
  const {grade,setGrade}=useGrade();const [progress,setProgress]=useState<any>(null),[error,setError]=useState('');
  const [startedAt,setStartedAt]=useState<number|null>(null),[seconds,setSeconds]=useState(0),[sessionId,setSessionId]=useState(''),[timerNotice,setTimerNotice]=useState(''),[saving,setSaving]=useState(false);
  useEffect(()=>{let live=true;void getChineseProgress().then(p=>{if(live)setProgress(p);}).catch(e=>{if(live)setError(e instanceof Error?e.message:'学习概览暂不可用');});return()=>{live=false;};},[]);
  useEffect(()=>{if(startedAt===null)return;const timer=window.setInterval(()=>setSeconds(Math.floor((Date.now()-startedAt)/1000)),1000);return()=>window.clearInterval(timer);},[startedAt]);
  // 离开首页时尽力保存已满一分钟的计时；sessionId 由服务端唯一键防重。
  useEffect(()=>{
    if(startedAt===null||!sessionId)return;
    const sessionStart=startedAt, activeSessionId=sessionId;
    return()=>{
      const minutes=Math.floor((Date.now()-sessionStart)/60000);
      if(minutes>=1)void recordChineseStudySession(minutes,activeSessionId).catch(error=>console.warn('离开页面时保存学习计时失败',error));
    };
  },[startedAt,sessionId]);
  const links=[['生字学习','/chinese/characters','汉字、拼音、部首与笔画'],['笔顺练习','/chinese/characters/practice','书写与自我检查'],['词语学习','/chinese/words','词义、近反义词和例句'],['句子学习','/chinese/sentences','修辞、文言和仿写'],['作文练习','/chinese/essays','审题、提纲和写作'],['预习','/chinese/preview','课前导读'],['复习','/chinese/review','巩固尚未掌握的内容'],['测验','/chinese/exam','题库与自动评分'],['学习档案','/chinese/archive','错题、测验和作文记录'],['学习设置','/chinese/settings','年级、学期和教材版本']];
  const changeGrade=async(next:GradeId)=>{
    setGrade(next);
    try{
      await saveChineseProgress({grade:next,semester:progress?.semester||'s1',textbookVersion:progress?.textbook_version||'default'});
      setProgress((current:any)=>({...current,grade:next}));
      setError('');
    }catch(e){setError(e instanceof Error?e.message:'年级设置保存失败');}
  };
  const start=()=>{setSessionId(crypto.randomUUID());setStartedAt(Date.now());setSeconds(0);setTimerNotice('计时已开始，结束时保存本次学习时长。');};
  const stop=async()=>{if(startedAt===null)return;const minutes=Math.floor((Date.now()-startedAt)/60000);if(minutes<1){setTimerNotice('至少学习 1 分钟后才能保存本次计时。');return;}setSaving(true);try{const saved=await recordChineseStudySession(minutes,sessionId);setProgress((p:any)=>({...p,total_study_minutes:saved.totalStudyMinutes}));setStartedAt(null);setSeconds(0);setSessionId('');setTimerNotice(`已保存 ${saved.durationMinutes} 分钟学习时长。`);}catch(e){setTimerNotice(e instanceof Error?e.message:'计时保存失败；请重试，重复提交不会重复累计。');}finally{setSaving(false);}};
  const clock=`${String(Math.floor(seconds/3600)).padStart(2,'0')}:${String(Math.floor(seconds%3600/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
  return <Frame ctx={ctx} title="语文学习首页" subtitle="从识字、词语到阅读表达，循序渐进建立语文能力。">
    <GradePicker value={grade} onChange={v=>void changeGrade(v)}/>{error&&<Notice error>{error}</Notice>}
    {progress&&<div className="grid gap-3 sm:grid-cols-3"><Card title={String(progress.grade||'未设置')} meta="学习年级"/><Card title={String(progress.total_study_minutes??0)} meta="累计学习分钟"/><Card title={String(progress.textbook_version||'默认教材')} meta="教材版本"/></div>}
    <Card title="学习计时" meta="服务端保存 · 防重复提交"><div className="flex flex-wrap items-center justify-between gap-3"><strong className="text-3xl tabular-nums text-[#29466F]">{clock}</strong>{startedAt===null?<button onClick={start} className="rounded-lg bg-[#29466F] px-4 py-2 text-white">开始计时</button>:<button disabled={saving} onClick={()=>void stop()} className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50">{saving?'保存中…':'结束并保存'}</button>}</div>{timerNotice&&<p className="text-sm text-[#607797]">{timerNotice}</p>}<p className="text-xs text-[#7890B0]">学习时长按整分钟保存，单次最多计入 4 小时；计时不会产生积分。</p></Card>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{links.map(([name,path,desc])=><button key={path} onClick={()=>ctx.navigate(path)} className="rounded-2xl border border-[#E7EEF8] bg-white p-5 text-left shadow-sm hover:shadow-md"><strong>{name}</strong><span className="mt-2 block text-sm text-[#607797]">{desc}</span></button>)}</div>
  </Frame>;
}
export function ChineseCharactersView({ctx}:ViewProps){
  const {grade,setGrade}=useGrade();const remote=useRemoteIds('characters');const [query,setQuery]=useState(''),[selected,setSelected]=useState<CharacterItem|null>(null),[answer,setAnswer]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false),[practiceEventId,setPracticeEventId]=useState('');
  const items=CHARACTERS_DATA[grade]||[],filtered=items.filter(x=>[x.char,x.pinyin,x.radical,...x.meanings].join(' ').toLowerCase().includes(query.toLowerCase()));
  const practice=async()=>{if(!selected)return;const ok=answer.trim()===selected.char;const eventId=practiceEventId||crypto.randomUUID();setPracticeEventId(eventId);setBusy(true);try{await recordChineseCharacterPractice(selected.id,ok?'correct':'wrong',eventId);if(ok&&!remote.ids.includes(selected.id))await remote.persist([...remote.ids,selected.id]);if(ok)await resolveChineseWrongQuestion(selected.id);if(!ok)await saveChineseWrongQuestion({questionId:selected.id,questionType:'character',requestId:eventId,questionContent:\`看拼音写汉字：\${selected.pinyin}\`});setPracticeEventId('');setNotice(ok?'回答正确，练习已保存。':\`正确汉字是「\${selected.char}」，已加入错题记录。\`);}catch(e){setNotice(e instanceof Error?e.message:'保存失败；可重试，练习事件不会重复累计。');}finally{setBusy(false);}};
  const toggle=async()=>{if(!selected)return;const next=remote.ids.includes(selected.id)?remote.ids.filter(x=>x!==selected.id):[...remote.ids,selected.id];try{await remote.persist(next);setNotice('掌握状态已保存。');}catch(e){setNotice(e instanceof Error?e.message:'保存失败');}};
  return <Frame ctx={ctx} title="生字学习" subtitle="查看读音、字义和易错发音，通过练习巩固记忆。">
    <div className="flex flex-wrap justify-between gap-3"><GradePicker value={grade} onChange={v=>{setGrade(v);setSelected(null);}}/><Search value={query} onChange={setQuery} placeholder="搜索汉字、拼音或字义"/></div>
    {remote.loading&&<Notice>正在读取掌握记录…</Notice>}{remote.error&&<Notice error>{remote.error}</Notice>}{notice&&<Notice>{notice}</Notice>}
    <p className="text-sm text-[#607797]">本年级 {items.length} 字 · 已掌握 {items.filter(x=>remote.ids.includes(x.id)).length} 字</p>
    <div className="grid gap-3 lg:grid-cols-[1fr_0.9fr]"><div className="grid gap-2 sm:grid-cols-2">{filtered.map(x=><button key={x.id} onClick={()=>{setSelected(x);setAnswer('');}} className={`rounded-2xl border p-3 text-left ${selected?.id===x.id?'border-blue-400 bg-blue-50':'border-[#E7EEF8] bg-white'}`}><strong className="text-2xl">{x.char}</strong><span className="ml-3 text-sm">{x.pinyin}</span><span className="mt-1 block text-xs text-[#7890B0]">{x.meanings[0]}</span></button>)}</div>
    {selected?<Card title={selected.char} meta={selected.pinyin}><p>部首：{selected.radical} · 结构：{selected.structure} · {selected.strokeCount}画</p><div className="flex gap-2"><SpeakButton text={selected.char} label="朗读汉字"/><SpeakButton text={selected.pinyin} label="朗读拼音"/><SpeakButton text={selected.exampleSentence} label="朗读例句"/></div><p>{selected.meanings.join('；')}</p><p>组词：{selected.phrases.join('、')}</p><p>例句：{selected.exampleSentence}</p>{selected.mnemonic&&<p>识记提示：{selected.mnemonic}</p>}{selected.phoneticTrap&&<p className="rounded-lg bg-amber-50 p-2 text-amber-800">{selected.phoneticTrap.label}：{selected.phoneticTrap.tip}</p>}<button onClick={()=>void toggle()} className="rounded-lg bg-[#29466F] px-3 py-2 text-white">{remote.ids.includes(selected.id)?'取消掌握':'标记已掌握'}</button><button onClick={()=>ctx.navigate('/chinese/characters/practice')} className="ml-2 rounded-lg border px-3 py-2">笔顺练习</button><label className="block">看拼音写汉字<input value={answer} onChange={e=>setAnswer(e.target.value)} placeholder={selected.pinyin} className="mt-1 w-full rounded-lg border px-3 py-2"/></label><button disabled={busy||!answer.trim()} onClick={()=>void practice()} className="rounded-lg bg-blue-600 px-3 py-2 text-white disabled:opacity-50">提交练习</button></Card>:<div className="rounded-2xl border border-dashed p-8 text-center text-sm text-[#7890B0]">选择一个汉字查看讲解与练习。</div>}</div>
  </Frame>;
}

export function ChineseCharacterPracticeView({ctx}:ViewProps){
  const {grade,setGrade}=useGrade();
  const [index,setIndex]=useState(0),[answer,setAnswer]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false),[eventId,setEventId]=useState(''),[strokeIndex,setStrokeIndex]=useState(0);
  const items=CHARACTERS_DATA[grade]||[];
  const item=items[index%Math.max(items.length,1)];
  const strokes=item?.strokeOrderSteps||[];
  const submit=async()=>{
    if(!item)return;
    const ok=answer.trim()===item.char;
    setBusy(true);
    try{
      const key=eventId||crypto.randomUUID();
      setEventId(key);
      await recordChineseCharacterPractice(item.id,ok?'correct':'wrong',key);
      if(ok){
        const rows=await getChineseCharacters();
        const ids=rows.filter(r=>r.is_mastered).map(r=>String(r.character_id));
        if(!ids.includes(item.id))await saveChineseCharacters([...ids,item.id]);
        await resolveChineseWrongQuestion(item.id);
      }else{
        await saveChineseWrongQuestion({questionId:item.id,questionType:'character-writing',requestId:key,questionContent:'目标字 '+item.char+'，笔顺：'+item.strokeOrderHint});
      }
      setEventId('');
      setNotice(ok?'自我检查通过，练习已记录。':'目标字是「'+item.char+'」，请对照笔顺提示再练。');
    }catch(e){setNotice(e instanceof Error?e.message:'保存失败');}
    finally{setBusy(false);}
  };
  return <Frame ctx={ctx} title="笔顺与书写练习" subtitle="逐笔学习并自我检查；当前版本不提供 AI 手写识别。">
    <GradePicker value={grade} onChange={v=>{setGrade(v);setIndex(0);setAnswer('');setStrokeIndex(0);}}/>
    {item&&<Card title={item.char} meta={item.pinyin}>
      <p>{item.strokeOrderHint}</p>
      <HandwritingPad targetChar={item.char}/>
      {strokes.length>0&&<div className="rounded-xl bg-[#F7FAFF] p-3">
        <div className="flex items-center justify-between gap-2"><strong>笔顺分步提示</strong><span className="text-xs text-[#7890B0]">{Math.min(strokeIndex+1,strokes.length)} / {strokes.length}</span></div>
        <div className="mt-3 flex items-center gap-3">
          <span className="grid h-14 w-14 place-items-center rounded-xl border border-blue-200 bg-white text-3xl font-bold text-[#29466F]">{strokes[strokeIndex]||'完成'}</span>
          <span className="text-sm text-[#607797]">{strokeIndex<strokes.length?'第 '+(strokeIndex+1)+' 笔：'+strokes[strokeIndex]:'笔顺提示已完成，请结合米字格完整书写。'}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button disabled={strokeIndex===0} onClick={()=>setStrokeIndex(i=>Math.max(0,i-1))} className="rounded-lg border px-3 py-2 disabled:opacity-40">上一笔</button>
          <button disabled={strokeIndex>=strokes.length} onClick={()=>setStrokeIndex(i=>Math.min(strokes.length,i+1))} className="rounded-lg bg-[#29466F] px-3 py-2 text-white disabled:opacity-40">下一笔</button>
          <button onClick={()=>setStrokeIndex(0)} className="rounded-lg border px-3 py-2">重看笔顺</button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">{strokes.map((stroke,i)=><span key={i} className={'rounded-lg border px-2 py-1 text-sm '+(i===strokeIndex?'border-blue-400 bg-blue-100 text-blue-800':'border-[#E7EEF8] bg-white text-[#7890B0]')}>{i+1}. {stroke}</span>)}</div>
      </div>}
      <label>完成书写后输入目标字<input value={answer} onChange={e=>setAnswer(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2"/></label>
      <div className="flex gap-2">
        <button disabled={busy||!answer.trim()} onClick={()=>void submit()} className="rounded-lg bg-[#29466F] px-3 py-2 text-white">检查并记录</button>
        <button onClick={()=>{setIndex(i=>(i+1)%items.length);setAnswer('');setNotice('');setStrokeIndex(0);}} className="rounded-lg border px-3 py-2">下一个</button>
      </div>
      {notice&&<Notice>{notice}</Notice>}
    </Card>}
  </Frame>;
}

export function ChineseWordsView({ctx}:ViewProps){
  const {grade,setGrade}=useGrade();const remote=useRemoteIds('words');const [query,setQuery]=useState(''),[notice,setNotice]=useState(''),[eventIds,setEventIds]=useState<Record<string,string>>({});const items=WORDS_DATA[grade]||[];const filtered=items.filter(x=>[x.word,x.pinyin,x.definition,x.pos].join(' ').toLowerCase().includes(query.toLowerCase()));
  const practice=async(item:WordItem,correct:boolean)=>{const eventId=eventIds[item.id]||crypto.randomUUID();setEventIds(v=>({...v,[item.id]:eventId}));try{await recordChineseWordPractice(item.id,correct?'correct':'wrong',eventId);if(correct&&!remote.ids.includes(item.id))await remote.persist([...remote.ids,item.id]);if(correct)await resolveChineseWrongQuestion(item.id);if(!correct)await saveChineseWrongQuestion({questionId:item.id,questionType:'word',requestId:eventId,questionContent:item.word+'：'+item.definition});setEventIds(v=>{const n={...v};delete n[item.id];return n;});setNotice(correct?'已记录掌握状态。':'已加入错题记录，稍后复习。');}catch(e){setNotice(e instanceof Error?e.message:'保存失败；可重试，练习事件不会重复累计。');}};
  const toggle=async(item:WordItem)=>{const next=remote.ids.filter(x=>x!==item.id);try{await remote.persist(next);setNotice('已取消掌握状态。');}catch(e){setNotice(e instanceof Error?e.message:'保存失败');}};
  return <Frame ctx={ctx} title="词语学习" subtitle="结合词义、词性、近反义词和例句积累表达。"><div className="flex flex-wrap justify-between gap-3"><GradePicker value={grade} onChange={setGrade}/><Search value={query} onChange={setQuery} placeholder="搜索词语、拼音或释义"/></div>{remote.loading&&<Notice>读取掌握记录…</Notice>}{remote.error&&<Notice error>{remote.error}</Notice>}{notice&&<Notice>{notice}</Notice>}<p className="text-sm text-[#607797]">已掌握 {items.filter(x=>remote.ids.includes(x.id)).length}/{items.length}</p><div className="grid gap-3 md:grid-cols-2">{filtered.map(x=><Card key={x.id} title={x.word} meta={x.pinyin}><p>{x.pos} · {x.definition}</p><p>近义词：{x.synonyms.join('、')||'暂无'}</p><p>反义词：{x.antonyms.join('、')||'暂无'}</p><p>例句：{x.exampleSentence}</p><div className="flex gap-2"><SpeakButton text={x.word}/><SpeakButton text={x.exampleSentence} label="朗读例句"/></div>{x.culturalNote&&<p>文化拓展：{x.culturalNote}</p>}<div className="flex flex-wrap gap-2"><button onClick={()=>void practice(x,true)} className="rounded-lg bg-[#29466F] px-3 py-2 text-white">我已掌握</button><button onClick={()=>void practice(x,false)} className="rounded-lg border border-rose-200 px-3 py-2 text-rose-700">仍需练习</button>{remote.ids.includes(x.id)&&<button onClick={()=>void toggle(x)} className="rounded-lg border px-3 py-2">取消掌握</button>}</div></Card>)}</div></Frame>;
}

export function ChineseSentencesView({ctx}:ViewProps){
  const {grade,setGrade}=useGrade();
  const remote=useRemoteIds('sentences');
  const [category,setCategory]=useState('all');
  const [reveal,setReveal]=useState<Record<string,boolean>>({});
  const [drafts,setDrafts]=useState<Record<string,string>>({});
  const [notice,setNotice]=useState('');
  const [busyId,setBusyId]=useState('');
  const [eventIds,setEventIds]=useState<Record<string,string>>({});
  const [requestIds,setRequestIds]=useState<Record<string,string>>({});
  const items=SENTENCES_DATA[grade]||[];
  const filtered=items.filter(x=>category==='all'||x.category===category);

  const mark=async(item:SentenceItem,ok:boolean)=>{
    const eventId=eventIds[item.id]||crypto.randomUUID();
    setEventIds(v=>({...v,[item.id]:eventId}));
    setBusyId(item.id);
    try{
      await recordChineseSentencePractice(item.id,ok?'correct':'wrong',eventId);
      if(ok&&!remote.ids.includes(item.id))await remote.persist([...remote.ids,item.id]);
      if(!ok)await saveChineseWrongQuestion({questionId:item.id,questionType:'sentence',requestId:eventId,questionContent:item.originalText});
      setEventIds(v=>{const n={...v};delete n[item.id];return n;});
      setNotice(ok?'完成记录已保存。':'已加入错题，建议稍后重练。');
    }catch(e){setNotice(e instanceof Error?e.message:'保存失败；可重试，练习事件不会重复累计。');}
    finally{setBusyId('');}
  };

  const saveImitation=async(item:SentenceItem)=>{
    const content=(drafts[item.id]||'').trim();
    if([...content].length<8){setNotice('再多写一些内容，至少完成一个完整句子。');return;}
    const requestId=requestIds[item.id]||crypto.randomUUID();
    const eventId=eventIds[item.id]||crypto.randomUUID();
    setRequestIds(v=>({...v,[item.id]:requestId}));
    setEventIds(v=>({...v,[item.id]:eventId}));
    setBusyId(item.id);
    try{
      const characterCount=[...content].length;
      const paragraphCount=content.split(/\n\s*\n/).filter(Boolean).length;
      await submitChineseEssay({
        requestId,essayId:item.id,title:item.title,
        prompt:item.practicePrompt,content,
        feedback:{overview:'学生自主完成的仿写记录；本次不使用 AI 评分。',characterCount,paragraphCount},
      });
      await recordChineseSentencePractice(item.id,'correct',eventId);
      if(!remote.ids.includes(item.id))await remote.persist([...remote.ids,item.id]);
      await resolveChineseWrongQuestion(item.id);
      setDrafts(v=>({...v,[item.id]:''}));
      setRequestIds(v=>{const n={...v};delete n[item.id];return n;});
      setEventIds(v=>{const n={...v};delete n[item.id];return n;});
      setNotice('仿写内容和完成记录已保存。');
    }catch(e){setNotice(e instanceof Error?e.message:'仿写保存失败；可以安全重试。');}
    finally{setBusyId('');}
  };

  return <Frame ctx={ctx} title="句子学习" subtitle="研习修辞、文言名句、病句诊治和经典仿写。">
    <div className="flex flex-wrap gap-3">
      <GradePicker value={grade} onChange={setGrade}/>
      <select value={category} onChange={e=>setCategory(e.target.value)} className="rounded-xl border px-3 py-2 text-sm">
        <option value="all">全部句式</option><option value="rhetoric">修辞赏析</option><option value="classical">文言名句</option><option value="error_correction">病句诊治</option><option value="imitation">经典仿写</option>
      </select>
    </div>
    {remote.loading&&<Notice>读取完成记录…</Notice>}
    {remote.error&&<Notice error>{remote.error}</Notice>}
    {notice&&<Notice>{notice}</Notice>}
    <p className="text-sm text-[#607797]">已完成 {items.filter(x=>remote.ids.includes(x.id)).length}/{items.length}</p>
    <div className="space-y-3">
      {filtered.map(item=><Card key={item.id} title={item.title} meta={item.categoryLabel}>
        <p className="font-medium">“{item.originalText}”</p>
        <SpeakButton text={item.originalText} label="朗读原句"/>
        <p>{item.analysis}</p>
        {item.modernTranslation&&<p>译文：{item.modernTranslation}</p>}
        {item.keyDevices&&<p>关键手法：{item.keyDevices.join('、')}</p>}
        <p>练习要求：{item.practicePrompt}</p>
        {item.category==='imitation'&&<label className="block text-sm">我的仿写
          <textarea rows={4} value={drafts[item.id]||''} onChange={e=>setDrafts(v=>({...v,[item.id]:e.target.value}))} placeholder="结合原句特点，写出自己的句子…" className="mt-1 w-full rounded-xl border border-[#D9E5F4] p-3 leading-7"/>
        </label>}
        <div className="flex flex-wrap gap-2">
          <button onClick={()=>setReveal(v=>({...v,[item.id]:!v[item.id]}))} className="rounded-lg border px-3 py-2">{reveal[item.id]?'隐藏参考答案':'查看参考答案'}</button>
          {item.category==='imitation'
            ? <button disabled={busyId===item.id||!(drafts[item.id]||'').trim()} onClick={()=>void saveImitation(item)} className="rounded-lg bg-[#29466F] px-3 py-2 text-white disabled:opacity-50">{busyId===item.id?'保存中…':'保存仿写并标记完成'}</button>
            : <button disabled={busyId===item.id} onClick={()=>void mark(item,true)} className="rounded-lg bg-[#29466F] px-3 py-2 text-white disabled:opacity-50">我已掌握</button>}
          <button disabled={busyId===item.id} onClick={()=>void mark(item,false)} className="rounded-lg border border-rose-200 px-3 py-2 text-rose-700 disabled:opacity-50">仍需练习</button>
        </div>
        {reveal[item.id]&&<Notice>{item.practiceAnswer}</Notice>}
        {remote.ids.includes(item.id)&&<p className="text-xs text-emerald-700">已完成并同步</p>}
      </Card>)}
    </div>
  </Frame>;
}

function evaluateEssayDraft(content:string){
  const text=content.trim();
  const paragraphs=text.split(/\n\s*\n/).map(x=>x.trim()).filter(Boolean);
  const sentences=(text.match(/[。！？!?；;]/g)||[]).length;
  const suggestions:string[]=[];
  if([...text].length<200)suggestions.push('篇幅偏短：可以补充具体场景、人物动作或细节描写。');
  if(paragraphs.length<3)suggestions.push('建议分段：尝试安排开头点题、中间展开、结尾收束。');
  if(sentences<4)suggestions.push('注意句子层次：检查标点，避免多个意思挤在同一句里。');
  if(!/(首先|其次|然后|因此|然而|同时|最后|例如|比如)/.test(text))suggestions.push('可以加入恰当的过渡词，让段落之间的逻辑更清楚。');
  if(!suggestions.length)suggestions.push('结构和基本表达检查较完整；请再检查错别字、标点和题意是否扣紧。');
  return {characterCount:[...text].length,paragraphCount:paragraphs.length,sentenceCount:sentences,suggestions};
}

export function ChineseEssaysView({ctx}:ViewProps){
  const {grade,setGrade}=useGrade();const items=ESSAYS_DATA[grade]||[];const [selectedId,setSelectedId]=useState(''),[content,setContent]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false),[requestId,setRequestId]=useState(()=>crypto.randomUUID());const selected=items.find(x=>x.id===selectedId)||items[0];const feedback=useMemo(()=>evaluateEssayDraft(content),[content]);
  const submit=async()=>{if(!selected||!content.trim()){setNotice('请先选择题目并完成写作。');return;}setBusy(true);try{await submitChineseEssay({requestId,essayId:selected.id,title:selected.title,prompt:selected.promptText,content,feedback:{overview:'规则化写作自检（非 AI 评分）',...feedback}});setNotice('作文已保存，可在学习档案中查看。');setRequestId(crypto.randomUUID());}catch(e){setNotice(e instanceof Error?e.message:'作文保存失败');}finally{setBusy(false);}};
  return <Frame ctx={ctx} title="作文练习" subtitle="先审题列纲，再完成写作；保存原文供后续批改。"><GradePicker value={grade} onChange={v=>{setGrade(v);setSelectedId('');setContent('');setRequestId(crypto.randomUUID());}}/><div className="grid gap-3 lg:grid-cols-[0.7fr_1.3fr]"><div className="space-y-2">{items.map(x=><button key={x.id} onClick={()=>{setSelectedId(x.id);setContent('');setRequestId(crypto.randomUUID());}} className={`w-full rounded-xl border p-3 text-left text-sm ${selected?.id===x.id?'border-blue-400 bg-blue-50':'border-[#E7EEF8] bg-white'}`}>{x.title}</button>)}</div>{selected&&<Card title={selected.title} meta={selected.gradeTier}><p>写作任务：{selected.promptText}</p><p>提纲建议：{selected.outlineAdvice.join('；')}</p><p>写作技巧：{selected.keyTechniques.join('、')}</p><details className="rounded-xl bg-[#F7FAFF] p-3"><summary className="cursor-pointer font-medium">展开范文参考</summary><h3 className="font-semibold">{selected.modelEssay.title}</h3>{selected.modelEssay.paragraphs.map((p,i)=><p key={i}>{p}</p>)}</details><textarea rows={12} value={content} onChange={e=>{setContent(e.target.value);setRequestId(crypto.randomUUID());}} placeholder="在这里完成作文…" className="w-full rounded-xl border p-3 leading-7"/><div className="rounded-xl bg-[#F7FAFF] p-3"><p className="font-medium">写作自检（不代表考试评分）</p><p>字数 {feedback.characterCount} · 段落 {feedback.paragraphCount} · 句末标点 {feedback.sentenceCount}</p><ul className="list-disc pl-5">{feedback.suggestions.map((item,i)=><li key={i}>{item}</li>)}</ul></div><button disabled={busy||!content.trim()} onClick={()=>void submit()} className="rounded-lg bg-[#29466F] px-4 py-2 text-white disabled:opacity-50">{busy?'保存中…':'保存作文'}</button></Card>}</div>{notice&&<Notice>{notice}</Notice>}</Frame>;
}

export function ChinesePreviewView({ctx}:ViewProps){
  const {grade,setGrade}=useGrade();const [step,setStep]=useState(0),[hints,setHints]=useState<Record<number,boolean>>({}),[completed,setCompleted]=useState<string[]>([]),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false);
  const guide=PREVIEW_GUIDES[grade],steps=guide?.steps||[],current=steps[step],guideId=`preview-${grade}`;
  useEffect(()=>{let live=true;void getChinesePreviews().then(rows=>{if(live)setCompleted(rows.map(x=>x.guide_id));}).catch(e=>{if(live)setNotice(e instanceof Error?e.message:'预习记录读取失败');});return()=>{live=false;};},[]);
  const finish=async()=>{setBusy(true);try{await completeChinesePreview(guideId);setCompleted(v=>v.includes(guideId)?v:[...v,guideId]);setNotice('本次预习已完成并保存。');}catch(e){setNotice(e instanceof Error?e.message:'预习保存失败');}finally{setBusy(false);}};
  return <Frame ctx={ctx} title="课前预习" subtitle="按导读步骤了解背景、重点字词和思考问题；完成记录保存到学海。"><GradePicker value={grade} onChange={v=>{setGrade(v);setStep(0);setHints({});setNotice('');}}/>{guide?<Card title={guide.lessonTitle} meta={`第 ${Math.min(step+1,steps.length)} / ${steps.length} 步`}>{current&&<><h3 className="font-semibold">{current.title}</h3><p>{current.description}</p><ul className="list-disc pl-5">{current.keyPoints.map((x,i)=><li key={i}>{x}</li>)}</ul></>}<div className="flex gap-2"><button disabled={!step} onClick={()=>setStep(v=>v-1)} className="rounded-lg border px-3 py-2 disabled:opacity-40">上一步</button><button disabled={step>=steps.length-1} onClick={()=>setStep(v=>v+1)} className="rounded-lg bg-[#29466F] px-3 py-2 text-white disabled:opacity-40">下一步</button></div>{guide.questions.map((q,i)=><div key={i} className="rounded-xl bg-[#F7FAFF] p-3"><p className="font-medium">{q.question}</p><button onClick={()=>setHints(v=>({...v,[i]:!v[i]}))} className="mt-2 text-sm text-blue-700">{hints[i]?'隐藏提示':'查看思考提示'}</button>{hints[i]&&<p className="mt-2">{q.hint}</p>}</div>)}<button disabled={busy||completed.includes(guideId)} onClick={()=>void finish()} className="rounded-lg bg-[#29466F] px-4 py-2 text-white disabled:opacity-50">{completed.includes(guideId)?'已完成预习':busy?'保存中…':'完成本次预习'}</button></Card>:<Notice error>当前年级暂无预习导读内容。</Notice>}{notice&&<Notice>{notice}</Notice>}</Frame>;
}

export function ChineseReviewView({ctx}:ViewProps){
  const {grade,setGrade}=useGrade();
  const [charRows,setCharRows]=useState<any[]>([]);
  const [wordRows,setWordRows]=useState<any[]>([]);
  const [sentenceRows,setSentenceRows]=useState<any[]>([]);
  const [wrongRows,setWrongRows]=useState<any[]>([]);
  const [eventIds,setEventIds]=useState<Record<string,string>>({});
  const [loading,setLoading]=useState(true),[notice,setNotice]=useState('');
  const [busyId,setBusyId]=useState('');

  const load=async()=>{
    const [characters,words,sentences,wrong]=await Promise.all([
      getChineseCharacters(),getChineseWords(),getChineseSentences(),getChineseWrongQuestions(),
    ]);
    setCharRows(characters);setWordRows(words);setSentenceRows(sentences);
    setWrongRows(wrong.filter(x=>!x.is_resolved));
  };
  useEffect(()=>{let live=true;void Promise.all([getChineseCharacters(),getChineseWords(),getChineseSentences(),getChineseWrongQuestions()])
    .then(([c,w,s,wrong])=>{if(!live)return;setCharRows(c);setWordRows(w);setSentenceRows(s);setWrongRows(wrong.filter(x=>!x.is_resolved));})
    .catch(e=>{if(live)setNotice(e instanceof Error?e.message:'复习记录读取失败');})
    .finally(()=>{if(live)setLoading(false);});
    return()=>{live=false;};
  },[]);

  const charMap=new Map(charRows.map(x=>[String(x.character_id),x]));
  const wordMap=new Map(wordRows.map(x=>[String(x.word_id),x]));
  const sentenceMap=new Map(sentenceRows.map(x=>[String(x.sentence_id),x]));
  const candidates=[
    ...(CHARACTERS_DATA[grade]||[]).map(item=>({id:item.id,title:item.char,meta:item.pinyin,kind:'character' as const,stats:charMap.get(item.id)})),
    ...(WORDS_DATA[grade]||[]).map(item=>({id:item.id,title:item.word,meta:item.pinyin,kind:'word' as const,stats:wordMap.get(item.id)})),
    ...(SENTENCES_DATA[grade]||[]).map(item=>({id:item.id,title:item.title,meta:item.categoryLabel,kind:'sentence' as const,stats:sentenceMap.get(item.id)})),
  ];
  const todo=sortReviewQueue(candidates.map(item=>{
    const stats=item.stats;
    const mastered=Boolean(item.kind==='sentence'?stats?.is_completed:stats?.is_mastered);
    const schedule=getReviewSchedule({
      isMastered:mastered,
      practiceCount:Number(stats?.practice_count||0),
      correctCount:Number(stats?.correct_count||0),
      wrongCount:Number(stats?.wrong_count||0),
      lastPracticedAt:stats?.last_practiced_at||null,
    });
    return {...item,...schedule};
  }).filter(item=>item.due));

  const mark=async(item:typeof todo[number],correct:boolean)=>{
    const eventId=eventIds[item.id]||crypto.randomUUID();
    setEventIds(v=>({...v,[item.id]:eventId}));setBusyId(item.id);
    try{
      if(item.kind==='character')await recordChineseCharacterPractice(item.id,correct?'correct':'wrong',eventId);
      else if(item.kind==='word')await recordChineseWordPractice(item.id,correct?'correct':'wrong',eventId);
      else await recordChineseSentencePractice(item.id,correct?'correct':'wrong',eventId);
      if(correct){
        if(item.kind==='character')await saveChineseCharacters([...new Set([...charRows.filter(x=>x.is_mastered).map(x=>String(x.character_id)),item.id])]);
        else if(item.kind==='word')await saveChineseWords([...new Set([...wordRows.filter(x=>x.is_mastered).map(x=>String(x.word_id)),item.id])]);
        else await saveChineseSentences([...new Set([...sentenceRows.filter(x=>x.is_completed).map(x=>String(x.sentence_id)),item.id])]);
        await resolveChineseWrongQuestion(item.id);
      }else{
        await saveChineseWrongQuestion({questionId:item.id,questionType:item.kind,requestId:eventId,questionContent:item.title});
      }
      setEventIds(v=>{const n={...v};delete n[item.id];return n;});
      await load();
      setNotice(correct?'本次复习已保存，下一轮将按记忆情况安排。':'已记录本次错误，并加入错题本。');
    }catch(e){setNotice(e instanceof Error?e.message:'复习记录保存失败；可重试，练习事件不会重复累计。');}
    finally{setBusyId('');}
  };

  const resolve=async(row:any)=>{
    try{await resolveChineseWrongQuestion(String(row.question_id));setWrongRows(rows=>rows.filter(x=>x.question_id!==row.question_id));setNotice('错题已标记为解决。');}
    catch(e){setNotice(e instanceof Error?e.message:'错题状态保存失败');}
  };

  return <Frame ctx={ctx} title="复习巩固" subtitle="依据掌握状态、练习正确率和最近练习时间安排复习，优先处理逾期与易错内容。">
    <GradePicker value={grade} onChange={setGrade}/>
    {loading&&<Notice>正在整理复习清单…</Notice>}
    {notice&&<Notice>{notice}</Notice>}
    <p className="text-sm text-[#607797]">今日待复习 {todo.length} 项 · 未解决错题 {wrongRows.length} 项</p>
    <div className="grid gap-3 sm:grid-cols-2">
      {todo.slice(0,60).map(item=><Card key={item.id} title={item.title} meta={item.meta}>
        <p className="text-xs text-[#7890B0]">{item.reason} · 练习 {Number(item.stats?.practice_count||0)} 次 · 错误 {Number(item.stats?.wrong_count||0)} 次</p>
        <div className="flex gap-2">
          <button disabled={busyId===item.id} onClick={()=>void mark(item,true)} className="rounded-lg bg-[#29466F] px-3 py-2 text-white disabled:opacity-50">本次已掌握</button>
          <button disabled={busyId===item.id} onClick={()=>void mark(item,false)} className="rounded-lg border border-rose-200 px-3 py-2 text-rose-700 disabled:opacity-50">仍需练习</button>
        </div>
      </Card>)}
    </div>
    <Card title="历史错题">
      <div className="space-y-2">
        {wrongRows.map(row=><div key={row.question_id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[#F7FAFF] p-3">
          <div><p className="font-medium">{row.question_content||row.question_id}</p><p className="text-xs text-[#7890B0]">错误 {row.wrong_count} 次 · {row.question_type}</p></div>
          <button onClick={()=>void resolve(row)} className="rounded-lg border px-3 py-2">标记已解决</button>
        </div>)}
      </div>
    </Card>
    {!loading&&!todo.length&&!wrongRows.length&&<Notice>当前没有到期的复习内容或未解决错题，继续保持。</Notice>}
  </Frame>;
}

function hash(s:string){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function stableQuestion(q:PublicExamQuestion){
  if(!q.options)return {q};
  const options=q.options.map((value,i)=>({value,rank:hash(q.id+':'+i)})).sort((a,b)=>a.rank-b.rank).map(x=>x.value);
  return {q:{...q,options}};
}

export function ChineseExamView({ctx}:ViewProps){
  const {grade,setGrade}=useGrade();
  const [answers,setAnswers]=useState<Record<string,string>>({});
  const [result,setResult]=useState<{score:number;correct:number;total:number}|null>(null);
  const [graded,setGraded]=useState<Record<string,{correct:boolean;correctAnswer:string;explanation:string}>>({});
  const [notice,setNotice]=useState('');
  const [busy,setBusy]=useState(false);
  const [requestId,setRequestId]=useState(()=>crypto.randomUUID());
  const [startedAt,setStartedAt]=useState(()=>Date.now());
  const questions=useMemo(()=>([...(CHINESE_EXAM_BANK[grade]||[])].sort((a,b)=>hash(a.id)-hash(b.id)).slice(0,10).map(stableQuestion)),[grade]);

  const submit=async()=>{
    if(!questions.length)return;
    if(questions.some(({q})=>!String(answers[q.id]||'').trim())){
      setNotice('还有题目没有作答，请检查后再提交。');
      return;
    }
    const answerSet=Object.fromEntries(questions.map(({q})=>[q.id,answers[q.id]||'']));
    setBusy(true);setNotice('');
    try{
      const response=await submitChineseExam({requestId,grade,durationSeconds:Math.max(0,Math.floor((Date.now()-startedAt)/1000)),answers:answerSet});
      const feedback=(response?.gradedAnswers||{}) as Record<string,{correct:boolean;correctAnswer:string;explanation:string}>;
      const correct=Object.values(feedback).filter(item=>item.correct).length;
      setResult({score:Number(response?.score??0),correct:Number(response?.correct_questions??correct),total:Number(response?.total_questions??questions.length)});
      setGraded(feedback);
      setRequestId(crypto.randomUUID());setStartedAt(Date.now());
      setNotice(response?.pointsAward?.awarded?'测验已核验并保存，奖励由学海积分服务处理。':'测验已由服务端题库核验并保存；错题已自动归档。由于尚未关联正式课次，本次不发放积分。');
    }catch(e){
      setNotice(e instanceof Error?e.message:'测验提交失败；可以安全重试。');
    }finally{setBusy(false);}
  };

  return <Frame ctx={ctx} title="年级综合测验" subtitle="题目和选择题选项顺序稳定；服务端独立核验答案、逐题反馈并自动归档错题。">
    <GradePicker value={grade} onChange={v=>{setGrade(v);setAnswers({});setResult(null);setGraded({});setNotice('');setRequestId(crypto.randomUUID());setStartedAt(Date.now());}}/>
    <p className="text-xs text-[#7890B0]">本次测验由服务端题库独立核对答案；题库为年级综合题，尚未映射正式课次，因此暂不发放积分。</p>
    <div className="space-y-3">
      {questions.map(({q})=><Card key={q.id} title={q.question} meta={`${q.difficulty} · ${q.category}`}>
        {q.type==='choice'&&q.options?.map((option,i)=><label key={i} className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#E7EEF8] p-2">
          <input type="radio" name={q.id} checked={answers[q.id]===option} disabled={Boolean(result)} onChange={()=>setAnswers(v=>({...v,[q.id]:option}))}/>{option}
        </label>)}
        {q.type==='fill'&&<input value={answers[q.id]||''} disabled={Boolean(result)} onChange={e=>setAnswers(v=>({...v,[q.id]:e.target.value}))} className="w-full rounded-lg border px-3 py-2" placeholder="请输入答案"/>}
        {result&&graded[q.id]&&<Notice error={!graded[q.id].correct}>{graded[q.id].correct?'回答正确。':'需要巩固。'} 参考答案：{graded[q.id].correctAnswer}。{graded[q.id].explanation}</Notice>}
      </Card>)}
    </div>
    <button disabled={busy||!questions.length||Boolean(result)} onClick={()=>void submit()} className="rounded-xl bg-[#29466F] px-5 py-3 text-white disabled:opacity-50">{busy?'提交中…':'提交测验并评分'}</button>
    {!result&&notice&&!busy&&<button onClick={()=>{setAnswers({});setGraded({});setNotice('');setRequestId(crypto.randomUUID());setStartedAt(Date.now());}} className="rounded-lg border px-3 py-2">放弃本次并重新开始</button>}
    {result&&<div className="space-y-2">
      <Notice>得分 {result.score} 分，答对 {result.correct}/{result.total} 题。</Notice>
      <button onClick={()=>{setAnswers({});setResult(null);setGraded({});setNotice('');setRequestId(crypto.randomUUID());setStartedAt(Date.now());}} className="rounded-lg border px-3 py-2">重新测验</button>
    </div>}
    {notice&&<Notice>{notice}</Notice>}
  </Frame>;
}

export function ChineseArchiveView({ctx}:ViewProps){
  const [progress,setProgress]=useState<any>(null),[wrong,setWrong]=useState<any[]>([]),[exams,setExams]=useState<any[]>([]),[essays,setEssays]=useState<any[]>([]),[previews,setPreviews]=useState<any[]>([]),[chars,setChars]=useState<any[]>([]),[words,setWords]=useState<any[]>([]),[sentences,setSentences]=useState<any[]>([]),[loading,setLoading]=useState(true),[notice,setNotice]=useState('');
  useEffect(()=>{let live=true;Promise.all([getChineseProgress(),getChineseWrongQuestions(),getChineseExams(),getChineseEssays(),getChinesePreviews(),getChineseCharacters(),getChineseWords(),getChineseSentences()]).then(([p,w,e,a,pr,c,wo,se])=>{if(!live)return;setProgress(p);setWrong(w);setExams(e);setEssays(a);setPreviews(pr);setChars(c);setWords(wo);setSentences(se);}).catch(e=>{if(live)setNotice(e instanceof Error?e.message:'档案读取失败');}).finally(()=>{if(live)setLoading(false);});return()=>{live=false;};},[]);
  const masteredChars=chars.filter(x=>x.is_mastered).length,masteredWords=words.filter(x=>x.is_mastered).length,completedSentences=sentences.filter(x=>x.is_completed).length;
  return <Frame ctx={ctx} title="学习档案" subtitle="汇总服务端保存的学习配置、掌握情况、预习、错题、测验和作文记录。">{loading&&<Notice>正在读取档案…</Notice>}{notice&&<Notice error>{notice}</Notice>}<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Card title={String(progress?.total_study_minutes??0)} meta="累计学习分钟"/><Card title={String(masteredChars)} meta="已掌握生字"/><Card title={String(masteredWords)} meta="已掌握词语"/><Card title={String(completedSentences)} meta="已完成句子"/><Card title={String(previews.length)} meta="预习记录"/><Card title={String(wrong.filter(x=>!x.is_resolved).length)} meta="待解决错题"/><Card title={String(exams.length)} meta="测验次数"/><Card title={String(essays.length)} meta="作文记录"/></div><Card title="学习配置"><p>年级：{String(progress?.grade||'未设置')}</p><p>学期：{String(progress?.semester||'未设置')}</p><p>教材：{String(progress?.textbook_version||'未设置')}</p></Card><Card title="最近测验">{exams.slice(0,8).map((x,i)=><p key={String(x.id||i)}>{x.created_at||''} · {x.score} 分 · {x.passed?'达标':'继续努力'}</p>)}</Card><Card title="最近作文">{essays.slice(0,8).map((x,i)=><p key={String(x.id||i)}>{x.title||'作文练习'} · {x.word_count||0} 字 · {x.created_at||''}</p>)}</Card><Card title="待解决错题">{wrong.filter(x=>!x.is_resolved).slice(0,12).map((x,i)=><p key={String(x.id||i)}>{x.question_content||x.question_id} · 错误 {x.wrong_count} 次</p>)}</Card></Frame>;
}
export function ChineseSettingsView({ctx}:ViewProps){
  const [grade,setGrade]=useState<GradeId>('g3'),[semester,setSemester]=useState<'s1'|'s2'>('s1'),[version,setVersion]=useState('default'),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[notice,setNotice]=useState('');
  useEffect(()=>{let live=true;void getChineseProgress().then((p:any)=>{if(!live||!p)return;if(GRADES_LIST.some(x=>x.id===p.grade))setGrade(p.grade);setSemester(p.semester==='s2'?'s2':'s1');setVersion(String(p.textbook_version||'default'));}).catch(e=>{if(live)setNotice(e instanceof Error?e.message:'设置读取失败');}).finally(()=>{if(live)setLoading(false);});return()=>{live=false;};},[]);
  const save=async()=>{setBusy(true);try{await saveChineseProgress({grade,semester,textbookVersion:version});setNotice('学习设置已保存到学海。');}catch(e){setNotice(e instanceof Error?e.message:'设置保存失败');}finally{setBusy(false);}};
  return <Frame ctx={ctx} title="语文学习设置" subtitle="设置学习年级、学期和教材版本；配置由学海服务端保存。">{loading&&<Notice>正在读取设置…</Notice>}<Card title="学习年级"><GradePicker value={grade} onChange={setGrade}/></Card><Card title="学习学期"><div className="flex gap-2"><button onClick={()=>setSemester('s1')} className={`rounded-lg border px-4 py-2 ${semester==='s1'?'border-blue-400 bg-blue-50':''}`}>上册</button><button onClick={()=>setSemester('s2')} className={`rounded-lg border px-4 py-2 ${semester==='s2'?'border-blue-400 bg-blue-50':''}`}>下册</button></div></Card><Card title="教材版本"><input value={version} onChange={e=>setVersion(e.target.value)} className="w-full rounded-lg border px-3 py-2"/></Card><button disabled={busy} onClick={()=>void save()} className="rounded-xl bg-[#29466F] px-5 py-3 text-white">{busy?'保存中…':'保存设置'}</button>{notice&&<Notice>{notice}</Notice>}</Frame>;
}
