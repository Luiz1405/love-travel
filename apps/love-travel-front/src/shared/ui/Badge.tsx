import type { HTMLAttributes } from "react";
import clsx from 'clsx';

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
    color?: 'green' | 'blue' | 'gray';
};

export function Badge({ color = 'blue', className, ...props }: BadgeProps) {
    const colors = {
        green: 'bg-green-100 text-green-800',
        blue: 'bg-blue-100 text-blue-800',
        gray: 'bg-gray-100 text-gray-800',
    };
    return (
        <span className={clsx('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', colors[color], className)} {...props} />
    )
}