import styled from "styled-components"
import { WeaponIcon } from "~/components/WeaponIcon"
import { Flex } from "~/components/layout/Flex"
import { useLocale } from "~/components/providers/LocaleManager"
import { useItemDefinition } from "~/hooks/dexie"
import { type RaidHubWeaponMetric } from "~/services/raidhub/types"
import { formattedNumber } from "~/util/presentation/formatting"

export const WeaponTableRow = ({ weapon, rank }: { weapon: RaidHubWeaponMetric; rank: number }) => {
    const { locale } = useLocale()
    const definition = useItemDefinition(weapon.hash)
    const displayName = definition?.displayProperties.name ?? "Unknown"
    return (
        <tr>
            <Td>{rank}</Td>
            <Td>
                <WeaponIdentifiers>
                    <WeaponIcon
                        size={40}
                        alt={displayName}
                        icon={definition?.displayProperties.icon}
                        iconWatermark={definition?.iconWatermark}
                    />
                    <span>{displayName}</span>
                </WeaponIdentifiers>
            </Td>
            <Td>{formattedNumber(weapon.totalKills, locale)}</Td>
            <Td>{formattedNumber(weapon.totalUsage, locale)}</Td>
        </tr>
    )
}

const Td = styled.td`
    height: 4rem;
`

const WeaponIdentifiers = styled(Flex).attrs({
    $align: "flex-start",
    $padding: 0
})`
    min-width: 20ch;
`
