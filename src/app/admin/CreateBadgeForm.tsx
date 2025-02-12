"use client"

import { useForm } from "react-hook-form"
import { CloudflareIcon } from "~/components/CloudflareImage"
import { Flex } from "~/components/layout/Flex"
import { trpc } from "../trpc"

type FormState = {
    id: string
    name: string
    description: string
    iconFileName: string
}

export const CreateBadgeForm = () => {
    const utils = trpc.useUtils()
    const { mutate, isLoading, isError, error, isSuccess, data } =
        trpc.admin.createBadge.useMutation({
            onSuccess: () => {
                void utils.admin.listBadges.refetch()
            }
        })

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<FormState>()

    return (
        <form onSubmit={handleSubmit(state => mutate(state))} style={{ maxWidth: "600px" }}>
            <h2>Badge Creation</h2>
            <Flex $align="flex-start" $padding={0.5}>
                <label>Badge Id</label>
                <input {...register("id", { required: true })} type="text" autoComplete="off" />
                {errors.id && <span>This field is required</span>}
            </Flex>
            <Flex $align="flex-start" $padding={0.5}>
                <label>Badge Name</label>
                <input {...register("name", { required: true })} type="text" autoComplete="off" />
                {errors.name && <span>This field is required</span>}
            </Flex>
            <Flex $align="flex-start" $padding={0.5}>
                <label>Badge Description</label>
                <input
                    {...register("description", { required: true })}
                    type="text"
                    autoComplete="off"
                />
                {errors.description && <span>This field is required</span>}
            </Flex>
            <Flex $align="flex-start" $padding={0.5}>
                <label>Filename</label>
                <input
                    {...register("iconFileName", { required: true })}
                    type="text"
                    autoComplete="off"
                />
                {errors.iconFileName && <span>This field is required</span>}
            </Flex>

            <input type="submit" disabled={isLoading} />
            <div>
                {isError && <pre>{JSON.stringify(error.data, null, 2)}</pre>}
                {isSuccess && (
                    <div>
                        <span>
                            Created badge {data.id}: {data.name} with description:{" "}
                            {data.description}
                        </span>
                        <CloudflareIcon path={data.icon} alt={data.name} width={24} height={24} />
                    </div>
                )}
            </div>
        </form>
    )
}
