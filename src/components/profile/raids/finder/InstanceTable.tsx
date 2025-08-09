"use client"

import Link from "next/link"
import { memo, useState } from "react"
import { Table } from "~/components/Table"
import Checkmark from "~/components/icons/Checkmark"
import Xmark from "~/components/icons/Xmark"
import { useLocale } from "~/components/providers/LocaleManager"
import { useRaidHubManifest } from "~/components/providers/RaidHubManifestManager"
import { useSeasons } from "~/hooks/dexie"
import { type RaidHubInstanceWithPlayers } from "~/services/raidhub/types"
import { Button } from "~/shad/button"
import { Checkbox } from "~/shad/checkbox"
import { toCustomTimeString } from "~/util/presentation/formatting"
import { MultiConfirmationModal } from "./MultiConfirmationModal"

export const InstanceTable = (props: { instances: readonly RaidHubInstanceWithPlayers[] }) => {
    const [selectedInstances, setSelectedInstances] = useState<Array<string>>([])
    const [isSelectAll, setIsSelectAll] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <>
            <Button
                disabled={!selectedInstances.length}
                className="mb-2 rounded-sm"
                onClick={() => setIsModalOpen(true)}>
                Create multi-view for {selectedInstances.length} instances
            </Button>
            <MultiConfirmationModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                instances={selectedInstances}
            />
            <Table style={{ width: "100%" }}>
                <thead>
                    <tr>
                        <th>
                            <Checkbox
                                checked={isSelectAll}
                                onCheckedChange={() => {
                                    setIsSelectAll(prev => {
                                        if (prev) {
                                            setSelectedInstances([])
                                        } else {
                                            const allInstanceIds = props.instances.map(
                                                instance => instance.instanceId
                                            )
                                            setSelectedInstances(allInstanceIds)
                                        }
                                        return !prev
                                    })
                                }}
                            />
                        </th>
                        <th>Instance ID</th>
                        <th>Complete</th>
                        <th>Activity</th>
                        <th>Date Completed</th>
                        <th>Season</th>
                        <th>Attributes</th>
                        <th>Players</th>
                    </tr>
                </thead>
                <tbody>
                    {props.instances.map(instance => (
                        <InstanceTableRow
                            key={instance.instanceId}
                            instance={instance}
                            isSelected={selectedInstances.includes(instance.instanceId)}
                            setIsSelected={id => {
                                const newSelectedInstances = [...selectedInstances]
                                if (newSelectedInstances.includes(id)) {
                                    newSelectedInstances.splice(newSelectedInstances.indexOf(id), 1)
                                } else {
                                    newSelectedInstances.push(id)
                                }
                                setSelectedInstances(newSelectedInstances)
                            }}
                        />
                    ))}
                </tbody>
            </Table>
        </>
    )
}

const useAtttributes = (instance: RaidHubInstanceWithPlayers) => {
    const attributes: string[] = []
    if (instance.flawless) {
        attributes.push("Flawless")
    }
    if (instance.fresh) {
        attributes.push("Fresh")
    }
    if (instance.completed) {
        if (instance.playerCount === 1) {
            attributes.push("Solo")
        } else if (instance.playerCount === 2) {
            attributes.push("Duo")
        } else if (instance.playerCount === 3) {
            attributes.push("Trio")
        }
    }

    return attributes
}

const InstanceTableRow = memo(
    ({
        instance,
        isSelected,
        setIsSelected
    }: {
        instance: RaidHubInstanceWithPlayers
        isSelected: boolean
        setIsSelected: (id: string) => void
    }) => {
        const { getActivityString, getVersionString } = useRaidHubManifest()
        const { locale } = useLocale()
        const seasons = useSeasons()
        const seasonName = seasons?.[instance.season - 1].displayProperties.name

        const attrs = useAtttributes(instance)

        return (
            <tr>
                <td>
                    <Checkbox
                        onCheckedChange={() => setIsSelected(instance.instanceId)}
                        checked={isSelected}
                    />
                </td>

                <td>
                    <Link href={`/pgcr/${instance.instanceId}`}>{instance.instanceId}</Link>
                </td>
                <td>{instance.completed ? <Checkmark sx={20} /> : <Xmark sx={20} />}</td>
                <td>
                    {`${getActivityString(instance.activityId)}: ${getVersionString(
                        instance.versionId
                    )}`}{" "}
                </td>
                <td>{toCustomTimeString(new Date(instance.dateCompleted), locale)}</td>
                <td>{seasonName ?? "Loading..."}</td>
                <td>
                    {attrs.map(attribute => (
                        <div key={attribute}>{attribute}</div>
                    ))}
                </td>
                <td>
                    {instance.players
                        .slice(0, 10)
                        .map(player => player.bungieGlobalDisplayName ?? player.displayName)
                        .join(", ")}
                </td>
            </tr>
        )
    }
)
InstanceTableRow.displayName = "InstanceTableRow"
