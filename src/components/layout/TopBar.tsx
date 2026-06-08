import { Utensils } from "lucide-react";

interface TopBarProps {
  title?: string;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  showLogo?: boolean;
}

export function TopBar({ title, leftAction, rightAction, showLogo = false }: TopBarProps) {
  return (
    <header className="flex items-center justify-between px-4 py-1 h-[52px] bg-white border-b border-grey-100 shrink-0 sticky top-0 z-50">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {showLogo && (
          <div className="flex items-center gap-2">
            <div className="w-[30px] h-[30px] bg-primary rounded-[9px] flex items-center justify-center shrink-0">
              <Utensils className="w-4 h-4 text-white" />
            </div>
            <span className="text-[17px] font-bold text-grey-900 tracking-[-0.4px]">
              밥친구
            </span>
          </div>
        )}
        {leftAction && !showLogo && leftAction}
        {title && !showLogo && (
          <h1 className="text-[17px] font-semibold text-grey-900 tracking-[-0.3px] flex-1 text-center">
            {title}
          </h1>
        )}
      </div>
      <div className="flex items-center justify-end flex-1 shrink-0">
        {rightAction}
      </div>
    </header>
  );
}
