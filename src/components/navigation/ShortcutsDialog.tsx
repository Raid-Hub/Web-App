"use client"

import { useLocale } from "~/components/providers/LocaleManager"
import { KEYBOARD_SHORTCUTS } from "~/lib/navigation/shortcuts"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "~/shad/dialog"

function ShortcutKeys({ keys, modKey }: { keys: readonly string[]; modKey: string }) {
    return (
        <span className="flex items-center gap-1">
            {keys.map(key => {
                const label =
                    key === "mod"
                        ? modKey
                        : key === "shift"
                          ? "⇧"
                          : key.length === 1
                            ? key.toUpperCase()
                            : key

                return (
                    <kbd
                        key={key}
                        className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs font-medium text-zinc-200">
                        {label}
                    </kbd>
                )
            })}
        </span>
    )
}

export function ShortcutsDialog(props: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const { userAgent } = useLocale()
    const modKey = userAgent.device.vendor?.toLowerCase().includes("apple") ? "⌘" : "Ctrl"

    return (
        <Dialog open={props.open} onOpenChange={props.onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Keyboard shortcuts</DialogTitle>
                    <DialogDescription>
                        On a profile page, Teammates and Instance Finder switch tabs. Elsewhere,
                        they open your profile on that tab.
                    </DialogDescription>
                </DialogHeader>
                <ul className="space-y-2">
                    {KEYBOARD_SHORTCUTS.map(shortcut => (
                        <li
                            key={shortcut.label}
                            className="flex items-center justify-between gap-4 text-sm">
                            <span>{shortcut.label}</span>
                            <ShortcutKeys keys={shortcut.keys} modKey={modKey} />
                        </li>
                    ))}
                </ul>
            </DialogContent>
        </Dialog>
    )
}
