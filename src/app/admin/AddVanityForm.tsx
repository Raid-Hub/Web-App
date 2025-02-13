"use client"

import Link from "next/link"
import { useForm } from "react-hook-form"
import { Flex } from "~/components/layout/Flex"
import { trpc } from "../trpc"

type FormState = {
    destinyMembershipId: string
    vanity: string
}

export const AddVanityForm = () => {
    const { mutate, isLoading, isError, error, isSuccess, data } =
        trpc.admin.createVanity.useMutation()

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<FormState>()

    return (
        <form onSubmit={handleSubmit(state => mutate(state))} style={{ maxWidth: "600px" }}>
            <h2>Vanity Creation</h2>
            <Flex $align="flex-start" $padding={0.5}>
                <label>Destiny Membership Id</label>
                <input
                    {...register("destinyMembershipId", { required: true })}
                    type="number"
                    autoComplete="off"
                />
                {errors.destinyMembershipId && <span>This field is required</span>}
            </Flex>
            <Flex $align="flex-start" $padding={0.5}>
                <label>Vanity String</label>
                <input {...register("vanity", { required: true })} type="text" autoComplete="off" />
                {errors.vanity && <span>This field is required</span>}
            </Flex>

            <input type="submit" disabled={isLoading} />
            <div>
                {isError && <pre>{JSON.stringify(error.data, null, 2)}</pre>}
                {isSuccess && (
                    <span>
                        Vanity updated for {data.user?.name ?? data.destinyMembershipId}:{" "}
                        <Link href={`/${data.vanity}`}>/{data.vanity}</Link>
                    </span>
                )}
            </div>
        </form>
    )
}
