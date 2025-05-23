"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import React from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { z } from "zod"
import { trpc } from "~/lib/trpc"
import styles from "./account.module.css"

const errMsg = "Invalid API Key format: "
const zFormSchema = z.object({
    apiKey: z
        .string()
        .min(20, { message: errMsg + "too few characters" })
        .max(30, { message: errMsg + "too many characters" })
})

type FormSchemaType = z.infer<typeof zFormSchema>

export default React.forwardRef<HTMLDialogElement, { refetchSocials: () => void }>(
    function SpeedrunAPIKeyModal({ refetchSocials }, ref) {
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
            <dialog className={[styles["api-key-modal"], styles["glossy-bg"]].join(" ")} ref={ref}>
                <button onClick={closeModal} className={styles["api-key-modal-close-button"]}>
                    x
                </button>
                <h3>Connect with Speedrun.com</h3>
                <p>
                    In order to authenticate with speedrun.com, you must paste your secret API key
                    into the text box below. You can access this key at{" "}
                    <Link
                        href="https://www.speedrun.com/settings/api#:~:text=Show%20API-,Key,-English"
                        target="_blank">
                        speedrun.com/settings/api
                    </Link>
                </p>
                <p>
                    We will not ask for your username or password, though you might be prompted to
                    log in or create an account on speedrun.com if you are not logged in already.
                </p>
                <h4>Full steps:</h4>
                <ol>
                    <li>
                        Login to{" "}
                        <Link href="https://www.speedrun.com/" target="_blank">
                            www.speedrun.com
                        </Link>
                    </li>
                    <li>Click on your user icon in the top right corner</li>
                    <li>
                        Select <em>Settings</em> in the drop down
                    </li>
                    <li>
                        Scroll down to the panel labeled <em>Developers</em>
                    </li>
                    <li>
                        Click <em>API Key</em>
                    </li>
                    <li>
                        Click <em>Show API Key</em>
                    </li>
                    <li>Copy the key</li>
                    <li>Paste the key into the text box on this page</li>
                    <li>
                        Press <em>Submit</em>
                    </li>
                </ol>
                <p>
                    We do not store your API key on our servers. We only use it to verify that you
                    own the account you are linking, and then the key is discarded. If you like, you
                    may click <em>Regenerate</em> next to your API key on speedrun.com to take extra
                    precaution.
                </p>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <input
                        type="text"
                        id="api-key"
                        placeholder="Paste your API Key"
                        {...register("apiKey")}
                    />
                    <button type="submit" disabled={isLoading}>
                        Submit
                    </button>
                    {err && <div className={styles["api-key-modal-err"]}>{err.message}</div>}
                </form>
            </dialog>
        )
    }
)
