"use client"

import { DialogDescription } from "@radix-ui/react-dialog"
import { PictureInPicture2, XIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { type PGCRPageProps } from "~/lib/pgcr/types"
import { Button } from "~/shad/button"
import { Dialog, DialogClose, DialogContent, DialogTitle } from "~/shad/dialog"

export default function PgcrInterceptorLayout({
    children,
    params
}: PGCRPageProps & { children: React.ReactNode }) {
    const router = useRouter()

    return (
        <Dialog
            open
            modal={false}
            onOpenChange={s => {
                if (!s) {
                    router.back()
                }
            }}>
            <div className="bg-background/50 fixed inset-0 z-10 backdrop-blur-[2px]" />
            <DialogContent className="flex h-screen w-full flex-col overflow-y-auto border-none p-0 sm:max-w-[600px] md:my-16 lg:max-w-[1000px] [&>button:last-child]:hidden">
                <DialogTitle asChild>
                    <div className="hidden" />
                </DialogTitle>
                <DialogDescription asChild>
                    <div className="hidden" />
                </DialogDescription>
                {children}
                <div className="bg-background/50 absolute top-4 right-4 flex flex-col rounded-sm">
                    <DialogClose asChild>
                        <Button className="hover:bg-background/80 cursor-pointer" variant="ghost">
                            <XIcon className="size-6" />
                        </Button>
                    </DialogClose>
                    <Button
                        className="hover:bg-background/80 cursor-pointer"
                        variant="ghost"
                        asChild>
                        <a href={`/pgcr/${params.instanceId}`} className="flex items-center gap-2">
                            <PictureInPicture2 className="size-6" />
                        </a>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
