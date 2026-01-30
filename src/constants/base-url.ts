export const BASE_URL =
    typeof window !== 'undefined' && (window as any).APP_BASE_URL
        ? (window as any).APP_BASE_URL.replace(/\/$/, '')
        : (process.env.BASE_URL ?? 'http://localhost:3333')