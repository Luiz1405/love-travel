import { type HTMLAttributes } from 'react';
import clsx from 'clsx';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={clsx('rounded-lg bg-white shadow-sm ring-1 ring-black/5', className)} {...props} />
    )
}