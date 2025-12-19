import { type ClassValue, clsx } from 'clsx';
// import { twMerge } from 'tailwind-merge'; // Not used as we are avoiding Tailwind

export function cn(...inputs: ClassValue[]) {
    return clsx(inputs);
}
