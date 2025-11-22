import React from "react";

interface CardProps {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = "", onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`
            group relative bg-white dark:bg-white/95 dark:bg-slate-800/60 backdrop-blur-xl
            rounded-3xl border border-slate-200 dark:border-slate-700/50
            shadow-sm dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]
            transition-all duration-300 ease-out
            md:hover:-translate-y-1 md:hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] dark:md:hover:shadow-[0_20px_40px_rgb(0,0,0,0.4)]
            md:hover:bg-white/100 dark:md:hover:bg-slate-800/80
            overflow-hidden
            ${onClick ? "cursor-pointer" : ""}
            ${className}
          `}
    >
      {/* Subtle top highlight for 3D feel */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-slate-500/30 opacity-50"></div>

      {children}
    </div>
  );
};

export default Card;
