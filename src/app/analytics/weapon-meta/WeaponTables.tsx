import { Flex } from "~/components/__deprecated__/layout/Flex"
import { useRaidHubWeeklyWeaponMeta } from "~/services/raidhub/useRaidHubWeeklyWeaponMeta"
import { WeaponTable } from "./WeaponTable"

export const WeaponTables = ({ sort, count }: { sort: "kills" | "usage"; count: number }) => {
    const query = useRaidHubWeeklyWeaponMeta({ sort, count })

    if (query.isLoading) return <div>Loading...</div>
    if (query.isError) return <div>Error: {query.error.message}</div>

    return (
        <Flex $padding={0} $gap={3} $align="flex-start" $crossAxis="flex-start" $wrap>
            <WeaponTable title="Kinetic" data={query.data.kinetic} />
            <WeaponTable title="Energy" data={query.data.energy} />
            <WeaponTable title="Power" data={query.data.power} />
        </Flex>
    )
}
