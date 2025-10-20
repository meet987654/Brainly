import type { ReactElement } from "react";

interface SideBarItemProps {
    icon: ReactElement;
    text: string;
    active?: boolean;
    onClick?: () => void;
}

export function SideBarItem({ icon, text, active = false, onClick }: SideBarItemProps) {
    return (
        <div 
            onClick={onClick} 
            className={`flex font-medium text-sm sm:text-base md:text-[17px] items-center gap-2 sm:gap-3 px-3 md:px-4 py-2 sm:py-2.5 md:py-3 rounded-xl cursor-pointer transition-all duration-300 text-slate-200 ${
                active 
                    ? 'bg-purple-500/30 text-white border border-purple-400/40 translate-x-1' 
                    : 'hover:bg-purple-500/20 hover:text-white hover:translate-x-1 group border border-transparent hover:border-purple-400/30'
            }`}
        >
            <div className="min-w-[20px] sm:min-w-[24px] md:min-w-[28px] transition-all duration-300 group-hover:rotate-6 group-hover:scale-110 flex items-center justify-center">
                {icon}
            </div>
            <div className="truncate">{text}</div>
        </div>
    );
}