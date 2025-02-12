"use client"

import { useForm } from "react-hook-form"
import { Flex } from "~/components/layout/Flex"
import { trpc } from "../trpc"

type FormState = {
    destinyMembershipId: string
    badgeId: string
}

export const RemoveBadgeForm = () => {
    const { mutate, isLoading, isError, error, isSuccess, data } =
        trpc.admin.removeBadge.useMutation()
    const { data: allBadges } = trpc.admin.listBadges.useQuery()

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<FormState>()

    return (
        <form onSubmit={handleSubmit(state => mutate(state))} style={{ maxWidth: "600px" }}>
            <h2>Remove a Badge</h2>
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
                <label>Badge</label>
                <select {...register("badgeId", { required: true })}>
                    {allBadges?.map(badge => (
                        <option key={badge.id} value={badge.id}>
                            {badge.name}
                        </option>
                    ))}
                </select>
                {errors.badgeId && <span>This field is required</span>}
            </Flex>

            <input type="submit" disabled={isLoading} />
            <div>
                {isError && <pre>{JSON.stringify(error.data, null, 2)}</pre>}
                {isSuccess && (
                    <div>
                        <div>Badges for {data.name}:</div>
                        <ul>
                            {data.badges.map(badge => (
                                <li key={badge.id}>{badge.name}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </form>
    )
}
