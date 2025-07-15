import { cn } from "~/lib/tw"

export function Spinner({ stroke, className }: { stroke: number; className?: string }) {
    return (
        <div
            className={cn(
                "border-t-raidhub aspect-square animate-spin rounded-full border-t-1",
                className
            )}
            style={{
                borderWidth: stroke,
                padding: stroke
            }}
        />
    )
}
