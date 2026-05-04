import "server-only"

/** Only expose stable worker-written codes to the client (avoid leaking HTTP bodies or stack text from Turso). */
export function sanitizeLinkedRoleSyncErrorCode(raw: string | null | undefined): string | null {
    if (raw == null) {
        return null
    }
    const t = raw.trim()
    if (t.length === 0) {
        return null
    }
    if (t.length > 64) {
        return "sync_error"
    }
    if (!/^[\w.-]+$/.test(t)) {
        return "sync_error"
    }
    return t
}
