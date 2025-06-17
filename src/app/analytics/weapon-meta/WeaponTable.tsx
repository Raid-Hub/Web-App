import { Table } from "~/components/Table"
import { Container } from "~/components/__deprecated__/layout/Container"
import { type RaidHubWeaponMetric } from "~/services/raidhub/types"
import { WeaponTableRow } from "./WeaponTableRow"

export const WeaponTable = ({
    title,
    data
}: {
    title: string
    data: readonly RaidHubWeaponMetric[]
}) => {
    const id = title.toLowerCase()
    return (
        <Container as="section" id={id}>
            <h2>{title} Weapons</h2>
            <Table $padding={0.5}>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Weapon</th>
                        <th>Kills</th>
                        <th>Uses</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((weapon, idx) => (
                        <WeaponTableRow key={weapon.hash} weapon={weapon} rank={idx + 1} />
                    ))}
                </tbody>
            </Table>
        </Container>
    )
}
