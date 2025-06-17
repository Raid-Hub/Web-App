"use client"

import { ClipboardCopy, FileCheck } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "~/shad/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "~/shad/tooltip"

export const CopyButton = ({ text }: { text: string }) => {
    const [isCopied, setIsCopied] = useState(false)

    const handleCopy = async () => {
        await navigator.clipboard.writeText(text)
        setIsCopied(true)
    }
    useEffect(() => {
        if (isCopied) {
            const unsetTimeout = setTimeout(() => setIsCopied(false), 5000) // Reset after 5 seconds

            return () => {
                clearTimeout(unsetTimeout)
            }
        }
    }, [isCopied])

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    type="button"
                    onClick={handleCopy}
                    aria-label={isCopied ? "Copied!" : "Copy to clipboard"}
                    variant="outline">
                    {isCopied ? <FileCheck className="text-green-400" /> : <ClipboardCopy />}
                </Button>
            </TooltipTrigger>
            <TooltipContent>{isCopied ? "Copied!" : "Copy to clipboard"}</TooltipContent>
        </Tooltip>
    )
}
