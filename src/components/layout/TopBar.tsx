import { Utensils } from "lucide-react";

interface TopBarProps {
  title?: string;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  showLogo?: boolean;
}

export function TopBar({ title, leftAction, rightAction, showLogo = false }: TopBarProps) {
  return (
    <header className="relative flex items-center h-[52px] px-4 bg-white border-b border-grey-100 shrink-0 sticky top-0 z-50">
      <div className="flex items-center">
        {showLogo ? (
          <div className="flex items-center gap-2">
            <div className="w-[30px] h-[30px] bg-primary rounded-[9px] flex items-center justify-center shrink-0">
              <Utensils className="w-4 h-4 text-white" />
            </div>
            <span className="text-[17px] font-bold text-grey-900 tracking-[-0.4px]">
              밥친구
            </span>
          </div>
        ) : (
          leftAction
        )}
      </div>

      {title && !showLogo && (
        <h1 className="absolute inset-x-0 text-center text-[17px] font-semibold text-grey-900 tracking-[-0.3px] pointer-events-none">
          {title}
        </h1>
      )}

      <div className="ml-auto flex items-center">
        {rightAction}
      </div>
    </header>
  );
}
