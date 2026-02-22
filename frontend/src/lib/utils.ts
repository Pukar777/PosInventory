import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function getStorageUrl(path: string) {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    // Remove leading slash if present to avoid double slashes
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${import.meta.env.VITE_API_BASE_URL}/storage/${cleanPath}`;
}
