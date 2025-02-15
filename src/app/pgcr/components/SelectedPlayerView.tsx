"use client"

import { Collection } from "@discordjs/collection"
import { useMemo } from "react"
import styled from "styled-components"
import { $media } from "~/app/layout/media"
import { useLocale } from "~/app/layout/wrappers/LocaleManager"
import { BackgroundImage } from "~/components/BackgroundImage"
import { Card } from "~/components/Card"
import { TabSelector } from "~/components/TabSelector"
import { Container } from "~/components/layout/Container"
import { Flex } from "~/components/layout/Flex"
import { H4 } from "~/components/typography/H4"
import { useClassDefinition, useItemDefinition } from "~/hooks/dexie"
import { useRaidHubResolvePlayer } from "~/services/raidhub/hooks"
import {
    type RaidHubInstanceCharacter,
    type RaidHubInstancePlayerExtended
} from "~/services/raidhub/types"
import { bungieEmblemUrl } from "~/util/destiny"
import { getBungieDisplayName } from "~/util/destiny/getBungieDisplayName"
import { formattedNumber, secondsToHMS } from "~/util/presentation/formatting"
import { usePgcrQueryParams } from "../hooks/usePgcrQueryParams"
import { useResolveCharacter } from "../hooks/useResolveCharacter"
import { DisplayName } from "./DisplayName"
import { WeaponsGrid } from "./WeaponsGrid"

export const SelectedPlayerView = (props: {
    selectedPlayer: RaidHubInstancePlayerExtended
    deselect: () => void
}) => {
    const { locale } = useLocale()
    const { validatedSearchParams, remove } = usePgcrQueryParams()
    const selectedCharacterId = validatedSearchParams.get("character")

    const selectedCharacter = selectedCharacterId
        ? props.selectedPlayer.characters.find(c => c.characterId === selectedCharacterId)
        : null

    const stats = useEntryStats(props.selectedPlayer, selectedCharacter)

    const { data: resolvedPlayer } = useRaidHubResolvePlayer(
        props.selectedPlayer.playerInfo.membershipId,
        {
            enabled: props.selectedPlayer.playerInfo.membershipType === 0,
            placeholderData: props.selectedPlayer.playerInfo
        }
    )

    const displayName = getBungieDisplayName(resolvedPlayer!, {
        excludeCode: false
    })

    const emblem = useItemDefinition(
        Number(selectedCharacter?.emblemHash ?? props.selectedPlayer.characters[0].emblemHash ?? 0)
    )

    return (
        <Flex $direction="column" $crossAxis="flex-start" $padding={0}>
            <SelectedPlayer
                $aspectRatio={{ width: 474, height: 96 }}
                onClick={props.deselect}
                $fullWidth>
                <Flex $fullWidth>
                    <DisplayName
                        membershipId={props.selectedPlayer.playerInfo.membershipId}
                        membershipType={resolvedPlayer?.membershipType ?? 0}
                        displayName={displayName}></DisplayName>
                </Flex>
                <BackgroundImage
                    style={
                        stats.completed
                            ? {}
                            : {
                                  filter: "grayscale(100%) brightness(0.5)"
                              }
                    }
                    brightness={0.85}
                    position="left"
                    opacity={0.95}
                    src={bungieEmblemUrl(emblem)}
                    alt={emblem?.displayProperties.name ?? ""}
                />
            </SelectedPlayer>
            <Card
                $color="dark"
                $opacity={20}
                $fullWidth
                style={{ padding: "1em" }}
                $borderRadius={5}>
                {props.selectedPlayer.characters.length > 1 && (
                    <TabSelector>
                        <H4
                            $mBlock={0.2}
                            aria-selected={selectedCharacterId === null}
                            onClick={() => remove("character")}
                            style={{
                                padding: "0.5rem"
                            }}>
                            All Classes
                        </H4>
                        {props.selectedPlayer.characters.map(c => (
                            <CharacterTab key={c.characterId} character={c} />
                        ))}
                    </TabSelector>
                )}
                <H4>Stats</H4>
                <Flex $wrap $align="flex-start" $padding={0} $gap={0.5}>
                    <Stat>
                        <div>Time Played</div>
                        <div>
                            {secondsToHMS(stats.timePlayedSeconds, true)}
                            {stats.timePlayedSeconds === 32767 ? "*" : ""}
                        </div>
                    </Stat>
                    {!!stats.score && (
                        <Stat>
                            <div>Score</div>
                            <div>{formattedNumber(stats.score, locale)}</div>
                        </Stat>
                    )}
                    <Stat>
                        <div>Kills</div>
                        <div>{formattedNumber(stats.kills, locale)}</div>
                    </Stat>
                    <Stat>
                        <div>Assists</div>
                        <div>{formattedNumber(stats.assists, locale)}</div>
                    </Stat>
                    <Stat>
                        <div>Deaths</div>
                        <div>{formattedNumber(stats.deaths, locale)}</div>
                    </Stat>
                    <Stat>
                        <div>Precision Kills</div>
                        <div>{formattedNumber(stats.precisionKills, locale)}</div>
                    </Stat>
                    <Stat>
                        <div>Super Kills</div>
                        <div>{formattedNumber(stats.superKills, locale)}</div>
                    </Stat>
                    <Stat>
                        <div>Melee Kills</div>
                        <div>{formattedNumber(stats.meleeKills, locale)}</div>
                    </Stat>
                    <Stat>
                        <div>Grenade Kills</div>
                        <div>{formattedNumber(stats.grenadeKills, locale)}</div>
                    </Stat>
                </Flex>
                <H4>Weapon Kills</H4>
                <WeaponsGrid weapons={stats.weapons} />
            </Card>
        </Flex>
    )
}

const useEntryStats = (
    selectedPlayer: RaidHubInstancePlayerExtended,
    selectedCharacter?: RaidHubInstanceCharacter | null
) =>
    useMemo((): {
        completed: boolean
        score: number
        kills: number
        assists: number
        deaths: number
        precisionKills: number
        superKills: number
        meleeKills: number
        grenadeKills: number
        timePlayedSeconds: number
        weapons: Collection<number, { kills: number; precisionKills: number }>
    } => {
        if (!selectedCharacter) {
            return selectedPlayer.characters.reduce(
                (acc, c) => ({
                    completed: acc.completed || c.completed,
                    kills: acc.kills + c.kills,
                    assists: acc.assists + c.assists,
                    deaths: acc.deaths + c.deaths,
                    precisionKills: acc.precisionKills + c.precisionKills,
                    superKills: acc.superKills + c.superKills,
                    meleeKills: acc.meleeKills + c.meleeKills,
                    grenadeKills: acc.grenadeKills + c.grenadeKills,
                    score: acc.score + c.score,
                    timePlayedSeconds: acc.timePlayedSeconds,
                    weapons: acc.weapons
                        .merge(
                            new Collection(
                                c.weapons.map(c => [
                                    Number(c.weaponHash),
                                    {
                                        kills: c.kills,
                                        precisionKills: c.precisionKills
                                    }
                                ])
                            ),
                            c1 => ({ keep: true, value: c1 }),
                            c2 => ({ keep: true, value: c2 }),
                            (c1, c2) => ({
                                keep: true,
                                value: {
                                    ...c1,
                                    kills: c1.kills + c2.kills,
                                    precisionKills: c1.precisionKills + c2.precisionKills
                                }
                            })
                        )
                        .sort((a, b) => b.kills - a.kills)
                }),
                {
                    completed: false as boolean,
                    score: 0,
                    kills: 0,
                    assists: 0,
                    deaths: 0,
                    precisionKills: 0,
                    superKills: 0,
                    meleeKills: 0,
                    grenadeKills: 0,
                    timePlayedSeconds: selectedPlayer.timePlayedSeconds,
                    weapons: new Collection<number, { kills: number; precisionKills: number }>()
                }
            )
        } else {
            return {
                completed: selectedCharacter.completed,
                score: selectedCharacter.score,
                kills: selectedCharacter.kills,
                assists: selectedCharacter.assists,
                deaths: selectedCharacter.deaths,
                precisionKills: selectedCharacter.precisionKills,
                superKills: selectedCharacter.superKills,
                meleeKills: selectedCharacter.meleeKills,
                grenadeKills: selectedCharacter.grenadeKills,
                timePlayedSeconds: selectedCharacter.timePlayedSeconds,
                weapons: new Collection(
                    selectedCharacter.weapons.map(c => [
                        Number(c.weaponHash),
                        {
                            kills: c.kills,
                            precisionKills: c.precisionKills
                        }
                    ])
                ).sort((a, b) => b.kills - a.kills)
            }
        }
    }, [selectedCharacter, selectedPlayer])

const CharacterTab = (props: { character: RaidHubInstanceCharacter }) => {
    const { validatedSearchParams, set } = usePgcrQueryParams()
    const { data: classHash } = useResolveCharacter(props.character, {
        forceOnLargePGCR: true,
        select: data => data.character.data?.classHash ?? null
    })
    const characterClass = useClassDefinition(classHash ?? 0)
    const className = characterClass?.displayProperties.name ?? "Unknown"
    return (
        <H4
            $mBlock={0.2}
            aria-selected={validatedSearchParams.get("character") === props.character.characterId}
            onClick={() => set("character", props.character.characterId)}
            style={{
                padding: "0.5rem"
            }}>
            {className}
        </H4>
    )
}

const SelectedPlayer = styled(Container)`
    border-radius: 8px;
    overflow: hidden;

    border: 1px solid ${({ theme }) => theme.colors.border.light};
    cursor: pointer;
    display: flex;
    max-width: 474px;
`

const Stat = styled(Flex)`
    &:hover {
        transform: scale(1.02);
    }
    background-color: color-mix(in srgb, ${({ theme }) => theme.colors.background.dark}, #0000 30%);

    font-size: 1.25rem;
    ${$media.max.mobile`
        font-size: 1rem;
    `}

    & *:nth-child(1) {
        font-weight: 200;
    }

    & *:nth-child(2) {
        font-size: 1.625rem;
    }

    ${$media.max.mobile`
    & *:nth-child(2) {
        font-size: 1.125rem;
    }
`}
`

Stat.defaultProps = {
    $padding: 0.5,
    $crossAxis: "flex-start",
    $direction: "column",
    $gap: 0.2
}
