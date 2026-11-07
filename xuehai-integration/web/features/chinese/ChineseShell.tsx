import type { ReactNode } from 'react';

export interface ChineseShellProps {
  user: any;
  navigate: (route: string) => void;
  children: ReactNode;
}

/** 语文独立外壳；不实现登录、不保存会话、不覆盖学海全局鉴权。 */
export function ChineseShell({ user, navigate, children }: ChineseShellProps) {
  const nickname = user?.nickname || user?.username || '';
  const isParent = user?.accountType === 'PARENT';
  const isAdmin = user?.roles?.includes('ADMIN') || user?.role === 'ADMIN';

  if (!user) {
    window.dispatchEvent(new CustomEvent('linguastep:auth-required'));
    return (
      <main className="min-h-screen bg-[#F7FAFF] px-4 py-16 text-center text-[#29466F]">
        <h1 className="text-2xl font-semibold">语文学习</h1>
        <p className="mt-3">请先登录后继续学习</p>
      </main>
    );
  }

  const links = [
    ['首页', '/chinese'], ['生字', '/chinese/characters'], ['词语', '/chinese/words'],
    ['句子', '/chinese/sentences'], ['作文', '/chinese/essays'], ['预习', '/chinese/preview'],
    ['复习', '/chinese/review'], ['测验', '/chinese/exam'], ['档案', '/chinese/archive'],
    ['设置', '/chinese/settings'],
  ] as const;

  return (
    <div className="min-h-screen bg-[#F7FAFF] text-[#29466F]">
      <header className="border-b border-[#E7EEF8] bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <button type="button" onClick={() => navigate('/chinese')} className="text-lg font-bold">学海 · 语文</button>
          <div className="flex items-center gap-2 text-sm">
            <span>{nickname}</span>
            {isParent && <span className="rounded-full bg-blue-50 px-2 py-1 text-xs">家长</span>}
            {isAdmin && <span className="rounded-full bg-slate-100 px-2 py-1 text-xs">ADMIN</span>}
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 pb-3">
          {links.map(([label, path]) => (
            <button key={path} type="button" onClick={() => navigate(path)}
              className="shrink-0 rounded-full border border-[#E7EEF8] bg-white px-3 py-1.5 text-sm hover:bg-[#F0F6FF]">{label}</button>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
      <footer className="border-t border-[#E7EEF8] bg-white py-4 text-center text-xs text-[#7890B0]">学海语文学习模块</footer>
    </div>
  );
}
