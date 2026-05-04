"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import React from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { z } from "zod"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { trpc } from "~/lib/trpc"

const errMsg = "Invalid API key format: "
const zFormSchema = z.object({
    apiKey: z
        .string()
        .min(20, { message: errMsg + "too few characters" })
        .max(30, { message: errMsg + "too many characters" })
})

type FormSchemaType = z.infer<typeof zFormSchema>

export const SpeedrunAPIKeyDialog = React.forwardRef<
    HTMLDialogElement,
    { refetchSocials: () => void }
>(function SpeedrunAPIKeyDialog({ refetchSocials }, ref) {
    const closeModal = () => {
        if (typeof ref === "object") {
            ref?.current?.close()
        }
    }
    const {
        mutate: updateAPIKey,
        isError,
        error,
        isLoading
    } = trpc.user.createSpeedrunComAccount.useMutation({
        onSuccess() {
            closeModal()
            refetchSocials()
            reset()
        }
    })
    const {
        handleSubmit,
        register,
        formState: { errors },
        reset
    } = useForm<FormSchemaType>({
        resolver: zodResolver(zFormSchema)
    })

    const onSubmit: SubmitHandler<FormSchemaType> = data => {
        updateAPIKey(data)
    }

    const err = isError ? error : errors.apiKey

    return (
        <dialog
            ref={ref}
            className="border-border bg-popover text-popover-foreground fixed top-1/2 left-1/2 z-50 max-h-[min(90vh,40rem)] w-[min(100%-1.5rem,36rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border p-6 shadow-xl backdrop:bg-black/50 open:backdrop:bg-black/50 [&::backdrop]:bg-black/60">
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-3 right-3"
                onClick={closeModal}
                aria-label="Close">
                ×
            </Button>
            <h3 className="pr-10 text-lg font-semibold tracking-tight">Connect Speedrun.com</h3>
            <div className="text-muted-foreground mt-3 space-y-3 text-sm leading-relaxed">
                <p>
                    Paste your secret API key below. You can find it at{" "}
                    <Link
                        href="https://www.speedrun.com/settings/api#:~:text=Show%20API-,Key,-English"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-hyperlink font-medium underline-offset-2 hover:underline">
                        speedrun.com/settings/api
                    </Link>
                    .
                </p>
                <p>
                    We will not ask for your username or password. We only use the key once to
                    verify you own the account, then discard it.
                </p>
                <h4 className="text-foreground font-medium">Steps</h4>
                <ol className="list-decimal space-y-1.5 pl-5">
                    <li>
                        Log in to{" "}
                        <Link
                            href="https://www.speedrun.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-hyperlink hover:underline">
                            speedrun.com
                        </Link>
                    </li>
                    <li>Open your user menu → Settings</li>
                    <li>Under Developers, open API Key → Show API Key</li>
                    <li>Copy the key and paste it here, then submit</li>
                </ol>
                <p>
                    You may regenerate the key on speedrun.com afterward if you prefer. We do not
                    store the key on our servers after verification.
                </p>
            </div>
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
                <div className="min-w-0 flex-1 space-y-2">
                    <Label htmlFor="speedrun-api-key">API key</Label>
                    <Input
                        id="speedrun-api-key"
                        type="text"
                        autoComplete="off"
                        placeholder="Paste your API key"
                        {...register("apiKey")}
                    />
                </div>
                <Button type="submit" disabled={isLoading} className="shrink-0">
                    {isLoading ? "Submitting…" : "Submit"}
                </Button>
            </form>
            {err ? (
                <p className="text-destructive mt-3 text-sm" role="alert">
                    {"message" in err && typeof err.message === "string"
                        ? err.message
                        : "Request failed"}
                </p>
            ) : null}
        </dialog>
    )
})
