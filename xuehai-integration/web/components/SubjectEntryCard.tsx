import type { ReactNode } from 'react';

export interface SubjectEntryCardProps {
  title: string;
  subtitle: string;
  description?: string;
  onClick: () => void;
  icon?: ReactNode;
}

/** 学科选择页通用卡片；不耦合具体学科或路由。 */
export function SubjectEntryCard({title,subtitle,description,onClick,icon}:SubjectEntryCardProps) {
  return (
    <button type="button" onClick={onClick}
      className="group rounded-2xl border border-[#E7EEF8] bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center gap-3">
        {icon&&<span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F0F6FF] text-[#29466F]">{icon}</span>}
        <div><div className="text-xl font-semibold text-[#29466F]">{title}</div><p className="mt-1 text-sm text-[#607797]">{subtitle}</p></div>
      </div>
      {description&&<p className="mt-3 text-sm text-[#7890B0]">{description}</p>}
    </button>
  );
}
