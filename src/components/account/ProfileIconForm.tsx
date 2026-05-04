"use client"

import { useState, type ChangeEventHandler } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { toast } from "sonner"
import { useSession } from "~/hooks/app/useSession"
import { trpc } from "~/lib/trpc"
import { uploadProfileIcon } from "~/services/s3/uploadProfileIcon"
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"

type FormValues = {
    image: File
}

export function ProfileIconForm() {
    const { data: session, update: updateSession } = useSession()
    const [imageSrc, setImageSrc] = useState<string | null>(null)
    const [err, setErr] = useState<Error | null>(null)
    const { mutateAsync: createPresignedURL } = trpc.user.generatePresignedIconURL.useMutation()
    const {
        mutate: optimisticProfileUpdate,
        isLoading,
        error
    } = trpc.user.update.useMutation({
        onSuccess: () => {
            void updateSession()
            toast.success("Profile icon updated")
        }
    })

    const { handleSubmit, setValue, resetField } = useForm<FormValues>({
        defaultValues: {}
    })

    const onSubmit: SubmitHandler<FormValues> = async data => {
        try {
            const primaryProfile = session?.user.profiles.find(
                p => p.destinyMembershipId === session.primaryDestinyMembershipId
            )
            if (data && primaryProfile) {
                const fileType = data.image.type
                if (!fileType) {
                    setErr(new Error("Please try again"))
                    return
                }

                const signedURL = await createPresignedURL({ fileType: fileType })

                const successfulUpload = await uploadProfileIcon(data.image, signedURL)
                if (!successfulUpload) {
                    setErr(new Error("Failed to upload image"))
                    return
                }

                const newIconUrl = signedURL.url + signedURL.fields.key

                optimisticProfileUpdate({
                    data: {
                        image: newIconUrl
                    },
                    destinyMembershipId: primaryProfile.destinyMembershipId
                })
            } else {
                setErr(new Error("Please try again"))
            }
        } catch (e) {
            console.error(e)
        }
    }

    const handleFileChange: ChangeEventHandler<HTMLInputElement> = event => {
        const file = event.target.files?.[0]
        if (file) {
            if (file.size > 256_000) {
                setErr(new Error("File too large. Maximum size is 256 KB."))
                resetField("image")
                setImageSrc(null)
                return
            }
            setErr(null)
            setValue("image", file)
            setImageSrc(URL.createObjectURL(file))
        }
    }

    return (
        <Card className="rounded-xl border-border/60 shadow-sm">
            <CardContent className="pt-6">
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
                    {imageSrc ? (
                        <div className="border-border/60 size-14 shrink-0 overflow-hidden rounded-lg border">
                            {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
                            <img src={imageSrc} alt="Selected icon preview" className="size-full object-cover" />
                        </div>
                    ) : null}
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                        <Label htmlFor="account-icon-file" className="text-muted-foreground">
                            Image file
                        </Label>
                        <Input
                            id="account-icon-file"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="cursor-pointer file:cursor-pointer"
                        />
                    </div>
                    <Button type="submit" disabled={isLoading} className="shrink-0">
                        {isLoading ? "Saving…" : "Save icon"}
                    </Button>
                </form>
                {err ? (
                    <p className="text-destructive mt-3 text-sm" role="alert">
                        {err.message}
                    </p>
                ) : null}
                {error ? (
                    <p className="text-destructive mt-3 text-sm" role="alert">
                        {error.message}
                    </p>
                ) : null}
            </CardContent>
        </Card>
    )
}
