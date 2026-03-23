import type { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from 'clsx';


type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    leftIcon?: ReactNode;
};

export function Button({
    variant = 'primary',
    size = 'md',
    leftIcon,
    className,
    children,
    ...props
}: ButtonProps) {
    const base = 'inline-flex items-center justify-center rounded-md font-medium transition-shadow focus:outline-none focus:ring-2 focus:ring-offset-2';
    const variants = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-400',
        ghost: 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 focus:ring-blue-400',
    };
    const sizes = {
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4',
        lg: 'h-11 px-5 text-lg',
    };
    return (
        <button className={clsx(base, variants[variant], sizes[size], className)} {...props}>
            {leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
        </button>
    )
}