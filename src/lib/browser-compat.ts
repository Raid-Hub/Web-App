/**
 * Early client shims for third-party scripts and embedded browsers that assume
 * APIs our app does not provide. Loaded from instrumentation-client before React.
 */
export function installBrowserCompatShims(): void {
    if (typeof window === "undefined") {
        return
    }

    // Tampermonkey "open in new tab" scripts set SVGAElement.target (read-only in modern browsers).
    try {
        const proto = window.SVGAElement?.prototype
        if (proto) {
            const descriptor = Object.getOwnPropertyDescriptor(proto, "target")
            if (descriptor && !descriptor.set) {
                Object.defineProperty(proto, "target", {
                    ...descriptor,
                    set() {
                        return
                    },
                    configurable: true
                })
            }
        }
    } catch {
        // Read-only prototype in some environments — safe to continue.
    }

    // In-app browsers inject sendDataToNative expecting window.webkit.messageHandlers.
    try {
        if (!("webkit" in window)) {
            const messageHandlers = new Proxy(
                {},
                {
                    get: () => ({
                        postMessage: () => {
                            return
                        }
                    })
                }
            )

            Object.defineProperty(window, "webkit", {
                value: { messageHandlers },
                configurable: true
            })
        }
    } catch {
        // Cannot define webkit — continue without shim.
    }
}
