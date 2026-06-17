/**
 * Browser storage access that survives Safari private mode and disabled storage.
 * Import this module instead of using `localStorage` directly.
 */

export function safeGetItem(key: string): string | null {
    try {
        return localStorage.getItem(key)
    } catch {
        return null
    }
}

export function safeSetItem(key: string, value: string): void {
    try {
        localStorage.setItem(key, value)
    } catch {
        // Private browsing / disabled storage — caller keeps in-memory state only.
    }
}

export function safeRemoveItem(key: string): void {
    try {
        localStorage.removeItem(key)
    } catch {
        // noop
    }
}
