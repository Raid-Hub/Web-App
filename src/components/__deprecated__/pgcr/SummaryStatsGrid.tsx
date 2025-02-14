"use client"

import { useMemo } from "react"
import { usePGCRContext } from "~/app/pgcr/PGCRStateManager"
import { type SVGComponent } from "~/components/SVG"
import Ammo from "~/components/icons/Ammo"
import Assist from "~/components/icons/Assist"
import Crosshairs from "~/components/icons/Crosshairs"
import Crown from "~/components/icons/Crown"
import Death from "~/components/icons/Death"
import Grenade from "~/components/icons/Grenade"
import Intellect from "~/components/icons/Intellect"
import Kill from "~/components/icons/Kill"
import Melee from "~/components/icons/Melee"
import Trophy from "~/components/icons/Trophy"
import Users from "~/components/icons/Users"
import { useItemDefinition } from "~/hooks/dexie"
import { useRaidHubResolvePlayer } from "~/services/raidhub/useRaidHubResolvePlayer"
import { getBungieDisplayName } from "~/util/destiny"
import { useLocale } from "../../../app/layout/wrappers/LocaleManager"
import { formattedNumber } from "../../../util/presentation/formatting"
import styles from ".//pgcr.module.css"

/** @deprecated */
const SummaryStatsGrid = () => {
    const { locale } = useLocale()
    const { data, sortScores } = usePGCRContext()

    const mostUsedWeaponHash = useMemo(() => {
        const record =
            data?.players
                .map(p => p.characters.map(c => c.weapons))
                .flat(2)
                .reduce(
                    (acc, curr) => ({
                        ...acc,
                        [curr.weaponHash]: (acc[curr.weaponHash] ?? 0) + curr.kills
                    }),
                    {} as Record<string, number>
                ) ?? {}

        if (!Object.keys(record).length) return "0"

        return Object.entries(record).reduce((acc, curr) => (curr[1] > acc[1] ? curr : acc))[0]
    }, [data])

    const stats = useMemo(
        () =>
            data?.players
                .flatMap(p => p.characters)
                .reduce(
                    (acc, curr) => ({
                        kills: acc.kills + curr.kills,
                        deaths: acc.deaths + curr.deaths,
                        assists: acc.assists + curr.assists,
                        superKills: acc.superKills + curr.superKills,
                        grenadeKills: acc.grenadeKills + curr.grenadeKills,
                        meleeKills: acc.meleeKills + curr.meleeKills,
                        precisionKills: acc.precisionKills + curr.precisionKills,
                        characters: acc.characters + 1
                    }),
                    {
                        kills: 0,
                        deaths: 0,
                        assists: 0,
                        superKills: 0,
                        grenadeKills: 0,
                        meleeKills: 0,
                        precisionKills: 0,
                        characters: 0
                    }
                ),
        [data]
    )

    const weapon = useItemDefinition(Number(mostUsedWeaponHash) ?? 73015)

    const mvpId = sortScores.firstKey()
    const { data: resolvedPlayer } = useRaidHubResolvePlayer(mvpId ?? "0", {
        enabled: !!sortScores.size,
        initialData: data?.players.find(p => p.playerInfo.membershipId === mvpId)?.playerInfo
    })

    const statsData: {
        Icon: SVGComponent
        name: string
        value: number | string
    }[] = [
        ...(data?.completed
            ? [
                  {
                      Icon: Crown,
                      name: "MVP",
                      value:
                          mvpId && resolvedPlayer
                              ? getBungieDisplayName(resolvedPlayer, { excludeCode: true })
                              : "???"
                  }
              ]
            : []),
        ...(data?.score
            ? [
                  {
                      Icon: Trophy,
                      name: "Score",
                      value: formattedNumber(data.score, locale)
                  }
              ]
            : []),
        {
            Icon: Kill,
            name: "Total Kills",
            value: formattedNumber(stats?.kills ?? 0, locale)
        },
        {
            Icon: Death,
            name: "Total Deaths",
            value: formattedNumber(stats?.deaths ?? 0, locale)
        },
        {
            Icon: Assist,
            name: "Total Assists",
            value: formattedNumber(stats?.assists ?? 0, locale)
        },
        {
            Icon: Crosshairs,
            name: "Overal K/D",
            value: formattedNumber(
                stats?.deaths === 0 ? Infinity : (stats?.kills ?? 0) / (stats?.deaths ?? 1),
                locale
            )
        },
        {
            Icon: Grenade,
            name: "Grenade Kills",
            value: formattedNumber(stats?.grenadeKills ?? 0, locale)
        },
        {
            Icon: Melee,
            name: "Melee Kills",
            value: formattedNumber(stats?.meleeKills ?? 0, locale)
        },
        {
            Icon: Intellect,
            name: "Super Kills",
            value: formattedNumber(stats?.superKills ?? 0, locale)
        },
        {
            Icon: Users,
            name: "Characters Used",
            value: formattedNumber(stats?.characters ?? 0, locale)
        },
        {
            Icon: Ammo,
            name: "Most Used Weapon",
            value: weapon?.displayProperties.name ?? "None"
        }
    ]
    return (
        <section className={styles["summary-stats"]}>
            {statsData.map(({ Icon, name, value }, idx) => (
                <div key={idx} className={styles["summary-stat"]}>
                    <div className={styles["summary-stat-content"]}>
                        <div className={styles["stat-icon-container"]}>
                            <Icon sx={40} color="white" />
                        </div>
                        <div className={styles["summary-stat-info"]}>
                            <span
                                className={[
                                    styles["summary-stat-name"],
                                    styles["contained-span"]
                                ].join(" ")}>
                                {name}
                            </span>
                            <span
                                className={[
                                    styles["summary-stat-value"],
                                    styles["contained-span"]
                                ].join(" ")}>
                                {value}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </section>
    )
}

export default SummaryStatsGrid
