import React from 'react';

type Variants = "primary" | "secondary" | "gradient" | "outline";

interface ButtonProps {
  variant: Variants;
  size: "small" | "medium" | "large";
  text: string;
  onClick: () => void;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  disabled?: boolean;
  fullWidth?: boolean;
  loading?: boolean;
}

const variantStyles = {
  primary:
    "bg-purple-500 hover:bg-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-200",
  secondary:
    "bg-purple-100 hover:bg-purple-200 text-purple-700 border border-purple-200 hover:border-purple-300 transition-all duration-200",
  gradient:
    "bg-gradient-to-r from-purple-600 to-purple-300 hover:from-purple-500 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300",
  outline:
    "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 hover:border-gray-400 transition-all duration-200"
};

const defaultStyles = "inline-flex items-center justify-center gap-2 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#6d7bff] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

const sizeStyles: Record<ButtonProps["size"], string> = {
  small: "px-3 py-1.5 text-sm",
  medium: "px-4 py-2 text-base",
  large: "px-6 py-3 text-lg",
};

export const Button = ({
  variant,
  size,
  text,
  onClick,
  startIcon,
  endIcon,
  disabled = false,
  fullWidth ,
  loading 

}: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${defaultStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${fullWidth ? ' w-full flex justify-center items-center' : ''}${loading ? ' opacity-50 cursor-not-allowed' : ''}`}
    >
      {startIcon && <span className="flex-shrink-0">{startIcon}</span>}
      <span>{text}</span>
      {endIcon && <span className="flex-shrink-0">{endIcon}</span>}
    </button>
  );
};