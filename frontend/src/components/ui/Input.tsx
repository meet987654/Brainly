import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  placeholder: string;
  type?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ placeholder, type = "text", className = "", ...props }, ref) => {
    return (
      <div>
        <input
          ref={ref}
          placeholder={placeholder}
          type={type}
          {...props}
          className={`w-full px-4 py-3 bg-slate-800/50 border border-purple-500/30 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500/50 focus:bg-slate-800/60 outline-none transition-all duration-300 backdrop-blur-sm hover:border-purple-500/50 ${className}`}
        />
      </div>
    );
  }
);

Input.displayName = "Input";