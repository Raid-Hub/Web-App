import { SubmitHandler, useForm } from "react-hook-form"
import { trpc } from "~/util/trpc"
import { z } from "zod"
import { zDeleteVanity } from "~/util/zod"
import styles from "~/styles/pages/admin.module.css"
import { zodResolver } from "@hookform/resolvers/zod"

type FormValues = z.infer<typeof zDeleteVanity>

export default function RemoveVanityForm() {
    const {
        mutate: create,
        isLoading: isDeleting,
        isSuccess,
        isError,
        error,
        data
    } = trpc.admin.vanity.delete.useMutation()

    const { handleSubmit, register } = useForm<FormValues>({
        resolver: zodResolver(zDeleteVanity)
    })

    const onSubmit: SubmitHandler<FormValues> = async data => {
        create(data)
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <h3>delete vanity</h3>
            <div className={styles["form-content"]}>
                <div className={styles["form-element"]}>
                    <label>Vanity string</label>
                    <input type="text" {...register("vanity")} />
                </div>
            </div>
            <button type="submit" disabled={isDeleting}>
                Submit
            </button>
            {isSuccess && (
                <div style={{ color: "green" }}>
                    {`Deleted vanity ${data.vanity} from user ${data.name}`}
                </div>
            )}
            {isError && <div style={{ color: "red" }}>Error {<span>{error.message}</span>}</div>}
        </form>
    )
}
