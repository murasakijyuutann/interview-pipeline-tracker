import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost" | "danger";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-indigo-600 hover:bg-indigo-500 text-white",
  ghost:   "bg-transparent hover:bg-gray-800 text-gray-300 border border-gray-700",
  danger:  "bg-transparent hover:bg-red-950 text-red-400 border border-red-800",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`rounded px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
    />
  );
}
