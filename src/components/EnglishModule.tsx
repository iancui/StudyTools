// 墨韵中文 英语学习模块
// ============================================================
// 工单: 英语学习 V1 - 辞书基础
//
// 范围:
//   - 单词学习: 即将开放 (不实现假功能)
//   - 单词复习: 即将开放
//   - 辞书: 真实实现 (列表 + 导入)
//
// UI 风格与中文模块保持一致 (米色背景 / 红色主色 / 衬线字体).
// 不实现假功能, 单词学习 / 复习只显示友好"即将开放"占位.

import React, { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  ChevronDown,
  FileUp,
  Loader2,
  PlusCircle,
  Sparkles,
  Lock,
} from "lucide-react";

import { useAuth } from "../contexts/AuthContext";
import { ApiError } from "../api/client";
import {
  EnglishDictionaryDTO,
  EnglishWordDTO,
  ImportDictionaryResult,
  importEnglishDictionary,
  listEnglishDictionaries,
  listEnglishWords,
} from "../api/english";

type SubPage = "home" | "list" | "import";

export const EnglishModule: React.FC = () => {
  const [sub, setSub] = useState<SubPage>("home");

  return (
    <section className="space-y-5">
      <header className="text-center py-2">
        <h1 className="text-2xl font-bold font-serif-sc text-[#24292E] mb-1">
          英语学习
        </h1>
        <p className="text-xs text-[#57606A]">
          管理你的英语辞书, 为单词学习做基础
        </p>
      </header>

      {sub === "home" && (
        <HomePage
          onGoDictionaryList={() => setSub("list")}
          onGoDictionaryImport={() => setSub("import")}
        />
      )}

      {sub === "list" && (
        <DictionaryListView
          onGoImport={() => setSub("import")}
          onBack={() => setSub("home")}
        />
      )}

      {sub === "import" && (
        <ImportDictionaryView onDone={() => setSub("list")} />
      )}
    </section>
  );
};

// ============================================================
// 首页: 3 个入口
// ============================================================

interface HomePageProps {
  onGoDictionaryList: () => void;
  onGoDictionaryImport: () => void;
}

const HomePage: React.FC<HomePageProps> = ({
  onGoDictionaryList,
  onGoDictionaryImport,
}) => {
  return (
    <div className="space-y-4">
      {/* 3 个入口按钮 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <ComingSoonCard
          icon="📖"
          title="单词学习"
          desc="基于辞书进行英语单词学习"
        />
        <ComingSoonCard
          icon="🔄"
          title="单词复习"
          desc="智能复习已学单词"
        />
        <button
          onClick={onGoDictionaryList}
          className="bg-white border border-[#E6E1D8] rounded-xl p-5 text-left hover:border-[#B83A2D] hover:shadow-sm transition-all"
        >
          <div className="text-2xl mb-2">📚</div>
          <div className="font-serif-sc font-bold text-[#24292E] text-base mb-1">
            辞书
          </div>
          <div className="text-xs text-[#57606A]">
            管理你的英语辞书, 查看与导入单词
          </div>
        </button>
      </div>

      {/* 快捷导入入口 */}
      <div className="bg-white border border-[#E6E1D8] rounded-xl p-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-sm font-bold text-[#24292E] mb-1">
              还没有辞书?
            </div>
            <p className="text-xs text-[#57606A]">
              通过 CSV 导入即可, 字段: word,meaning,phonetic,pos,phonics
            </p>
          </div>
          <button
            onClick={onGoDictionaryImport}
            className="flex items-center gap-1 px-4 py-2 text-xs font-medium text-white bg-[#B83A2D] rounded-md hover:bg-[#9F3221] transition-colors"
          >
            <PlusCircle size={13} />
            导入辞书
          </button>
        </div>
      </div>
    </div>
  );
};

interface ComingSoonCardProps {
  icon: string;
  title: string;
  desc: string;
}

const ComingSoonCard: React.FC<ComingSoonCardProps> = ({
  icon,
  title,
  desc,
}) => {
  return (
    <div className="bg-[#FAF8F5] border border-dashed border-[#DDD7CD] rounded-xl p-5 relative">
      <div className="text-2xl mb-2 opacity-50">{icon}</div>
      <div className="font-serif-sc font-bold text-[#8C8273] text-base mb-1">
        {title}
      </div>
      <div className="text-xs text-[#8C8273]">{desc}</div>
      <div className="mt-3 inline-flex items-center gap-1 px-2 py-0.5 text-[10px] text-[#8C8273] bg-white border border-[#E6E1D8] rounded-full">
        <Lock size={10} />
        即将开放
      </div>
    </div>
  );
};

// ============================================================
// 辞书列表
// ============================================================

interface DictionaryListViewProps {
  onGoImport: () => void;
  onBack: () => void;
}

const DictionaryListView: React.FC<DictionaryListViewProps> = ({
  onGoImport,
  onBack,
}) => {
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dictionaries, setDictionaries] = useState<
    EnglishDictionaryDTO[]
  >([]);
  const [activeId, setActiveId] = useState<number | null>(null);

  const loadList = React.useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const data = await listEnglishDictionaries(accessToken);
      setDictionaries(data);
      if (data.length > 0 && activeId === null) {
        setActiveId(data[0].id);
      }
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "获取辞书列表失败"
      );
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={onBack}
          className="text-xs text-[#57606A] hover:text-[#B83A2D] transition-colors"
        >
          ← 返回英语首页
        </button>
        <button
          onClick={onGoImport}
          className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-white bg-[#B83A2D] rounded-md hover:bg-[#9F3221] transition-colors"
        >
          <PlusCircle size={13} />
          导入新辞书
        </button>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-[#24292E]">
          我的辞书 ({dictionaries.length})
        </h2>
      </div>

      {loading && (
        <div className="p-4 text-center text-xs text-[#57606A] bg-white border border-[#E6E1D8] rounded-xl">
          正在加载辞书列表...
        </div>
      )}

      {error && !loading && (
        <div className="p-4 text-center text-xs text-[#B83A2D] bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl">
          {error}
        </div>
      )}

      {!loading && !error && dictionaries.length === 0 && (
        <div className="p-6 text-center bg-white border border-[#E6E1D8] rounded-xl">
          <BookOpen
            size={28}
            className="mx-auto text-[#8C8273] mb-2"
          />
          <div className="text-sm font-medium text-[#24292E] mb-1">
            还没有辞书
          </div>
          <p className="text-xs text-[#57606A] mb-3">
            导入一个 CSV 辞书, 即可查看单词数量与详情
          </p>
          <button
            onClick={onGoImport}
            className="px-4 py-2 text-xs font-medium text-white bg-[#B83A2D] rounded-md hover:bg-[#9F3221] transition-colors"
          >
            导入第一个辞书
          </button>
        </div>
      )}

      {!loading && !error && dictionaries.length > 0 && (
        <ul className="space-y-2">
          {dictionaries.map((d) => (
            <DictionaryCard
              key={d.id}
              dictionary={d}
              active={activeId === d.id}
              onToggle={() =>
                setActiveId((prev) =>
                  prev === d.id ? null : d.id
                )
              }
            />
          ))}
        </ul>
      )}
    </div>
  );
};

interface DictionaryCardProps {
  dictionary: EnglishDictionaryDTO;
  active: boolean;
  onToggle: () => void;
}

const DictionaryCard: React.FC<DictionaryCardProps> = ({
  dictionary,
  active,
  onToggle,
}) => {
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [words, setWords] = useState<EnglishWordDTO[]>([]);

  useEffect(() => {
    if (!active) {
      setWords([]);
      setError(null);
      return;
    }
    let cancelled = false;
    (async () => {
      if (!accessToken) return;
      setLoading(true);
      setError(null);
      try {
        const data = await listEnglishWords(
          accessToken,
          dictionary.id
        );
        if (!cancelled) setWords(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError
              ? err.message
              : "加载单词失败"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [active, accessToken, dictionary.id]);

  return (
    <li className="bg-white border border-[#E6E1D8] rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#FAF8F5] transition-colors"
      >
        <div className="min-w-0">
          <div className="text-sm font-bold text-[#24292E] truncate">
            {dictionary.name}
          </div>
          {dictionary.description && (
            <div className="text-xs text-[#57606A] truncate mt-0.5">
              {dictionary.description}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-3">
          <span className="text-xs font-mono text-[#B83A2D] font-bold">
            {dictionary.wordCount} 词
          </span>
          <ChevronDown
            size={14}
            className={`text-[#8C8273] transition-transform ${
              active ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {active && (
        <div className="border-t border-[#E6E1D8] p-4">
          {loading && (
            <div className="text-xs text-[#57606A] text-center py-2">
              正在加载单词...
            </div>
          )}
          {error && (
            <div className="text-xs text-[#B83A2D] text-center py-2">
              {error}
            </div>
          )}
          {!loading && !error && words.length === 0 && (
            <div className="text-xs text-[#8C8273] text-center py-2">
              这个辞书没有单词
            </div>
          )}
          {!loading && !error && words.length > 0 && (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto">
              {words.map((w) => (
                <li
                  key={w.id}
                  className="text-xs border border-[#E6E1D8] rounded-md px-2.5 py-2"
                >
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-bold text-[#24292E]">
                      {w.word}
                    </span>
                    {w.phonetic && (
                      <span className="text-[#8C8273] font-mono">
                        /{w.phonetic}/
                      </span>
                    )}
                    {w.pos && (
                      <span className="text-[#B83A2D]">
                        {w.pos}
                      </span>
                    )}
                  </div>
                  <div className="text-[#57606A] mt-0.5">
                    {w.meaning}
                  </div>
                  {w.phonics && (
                    <div className="text-[10px] text-[#8C8273] mt-0.5">
                      自然拼读: {w.phonics}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </li>
  );
};

// ============================================================
// 导入辞书
// ============================================================

const SAMPLE_CSV = `word,meaning,phonetic,pos,phonics
apple,苹果,ˈæpl,noun,ap-ple
banana,香蕉,bəˈnɑːnə,noun,ban-an-a
cat,猫,kæt,noun,c-a-t`;

interface ImportDictionaryViewProps {
  onDone: () => void;
}

const ImportDictionaryView: React.FC<ImportDictionaryViewProps> = ({
  onDone,
}) => {
  const { accessToken } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [csvText, setCsvText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportDictionaryResult | null>(
    null
  );

  const canSubmit = useMemo(() => {
    return (
      !!accessToken &&
      !submitting &&
      name.trim().length > 0 &&
      csvText.trim().length > 0
    );
  }, [accessToken, submitting, name, csvText]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !accessToken) return;
    setSubmitting(true);
    setError(null);
    setResult(null);
    try {
      const r = await importEnglishDictionary(accessToken, {
        name: name.trim(),
        description: description.trim() || null,
        csvText,
      });
      setResult(r);
      setName("");
      setDescription("");
      setCsvText("");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "导入失败, 请稍后重试"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-[#E6E1D8] rounded-xl p-4 sm:p-5 space-y-4"
    >
      <button
        type="button"
        onClick={onDone}
        className="text-xs text-[#57606A] hover:text-[#B83A2D] transition-colors"
      >
        ← 返回辞书列表
      </button>

      <div>
        <label className="block text-xs font-bold text-[#24292E] mb-1">
          辞书名称 <span className="text-[#B83A2D]">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={200}
          placeholder="例如: 三年级英语核心词"
          className="w-full text-sm px-3 py-2 border border-[#DDD7CD] rounded-lg focus:outline-none focus:border-[#B83A2D] transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-[#24292E] mb-1">
          描述 (可选)
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
          placeholder="例如: 人教版三年级上册"
          className="w-full text-sm px-3 py-2 border border-[#DDD7CD] rounded-lg focus:outline-none focus:border-[#B83A2D] transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-[#24292E] mb-1">
          CSV 内容 <span className="text-[#B83A2D]">*</span>
        </label>
        <p className="text-[11px] text-[#57606A] mb-2">
          字段固定:{" "}
          <code className="text-[#B83A2D]">
            word,meaning,phonetic,pos,phonics
          </code>
          。word / meaning 必填, 其余可空, 空行跳过, 同辞书内 word 去重。
        </p>
        <textarea
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          rows={10}
          placeholder={SAMPLE_CSV}
          className="w-full text-xs font-mono px-3 py-2 border border-[#DDD7CD] rounded-lg focus:outline-none focus:border-[#B83A2D] transition-colors resize-y"
        />
        <div className="flex justify-between mt-1">
          <button
            type="button"
            onClick={() => setCsvText(SAMPLE_CSV)}
            className="text-[11px] text-[#8C8273] hover:text-[#B83A2D] underline"
          >
            填入示例 CSV
          </button>
          <span className="text-[11px] text-[#8C8273]">
            支持 .csv 直接复制粘贴
          </span>
        </div>
      </div>

      {error && (
        <div className="p-3 text-xs text-[#B83A2D] bg-[#FEF2F2] border border-[#FCA5A5] rounded-md">
          {error}
        </div>
      )}

      {result && (
        <div className="p-3 text-xs text-[#24292E] bg-[#F0FDF4] border border-[#86EFAC] rounded-md space-y-1">
          <div className="font-bold flex items-center gap-1">
            <Sparkles size={12} className="text-[#B83A2D]" />
            导入成功: {result.dictionaryName}
          </div>
          <div>
            实际导入:{" "}
            <span className="font-mono text-[#B83A2D]">
              {result.importedCount}
            </span>{" "}
            词
          </div>
          <div>
            跳过:{" "}
            <span className="font-mono">
              {result.skippedCount}
            </span>{" "}
            行 (空行 / 缺字段 / 重复 word)
          </div>
          <button
            type="button"
            onClick={onDone}
            className="mt-2 px-3 py-1 text-xs font-medium text-[#B83A2D] border border-[#B83A2D] rounded hover:bg-[#B83A2D] hover:text-white transition-colors"
          >
            查看辞书列表
          </button>
        </div>
      )}

      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onDone}
          className="px-3 py-1.5 text-xs font-medium text-[#57606A] border border-[#DDD7CD] rounded-md hover:bg-[#FAF8F5] transition-colors"
        >
          取消
        </button>
        <button
          type="submit"
          disabled={!canSubmit}
          className="flex items-center gap-1 px-4 py-1.5 text-xs font-medium text-white bg-[#B83A2D] rounded-md hover:bg-[#9F3221] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <Loader2 size={13} className="animate-spin" />
              导入中...
            </>
          ) : (
            <>
              <FileUp size={13} />
              导入
            </>
          )}
        </button>
      </div>
    </form>
  );
};
