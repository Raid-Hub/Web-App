"use client"

import type { GlobalAlert, GlobalAlertLevel } from "bungie-net-core/models"
import Link from "next/link"
import { useMemo } from "react"
import styled from "styled-components"
import { Panel } from "~/components/__deprecated__/Panel"
import { Container } from "~/components/__deprecated__/layout/Container"
import { useCommonSettings, useGlobalAlerts } from "~/services/bungie/hooks"
import { formattedTimeSince } from "~/util/presentation/formatting"

const commonQueryOptions = {
    staleTime: 1000 * 60 * 15,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true
}

const offlineSoonTodayAlertKeys = [
    "D2-OfflineSoonToday",
    "All-OfflineSoonToday",
    "D2-OfflineNowNoEndTime"
]
const offlineSoonTomorrowAlertKeys = ["D2-OfflineSoonTomorrow", "All-OfflineSoonTomorrow"]

export const DestinyServiceStatusBanner = () => {
    const { data: d2ServersOnline } = useCommonSettings<boolean | null>({
        ...commonQueryOptions,
        refetchInterval: isEnabled => {
            const utcHour = new Date().getUTCHours()
            const hoursFromReset = Math.abs(utcHour - 17)
            return 3 * (hoursFromReset + 1) * (isEnabled ? 3 : 1) * 60000
        },
        select: settings => settings.systems.Destiny2?.enabled ?? null
    })
    const { data: alerts } = useGlobalAlerts(
        { includestreaming: true },
        {
            ...commonQueryOptions,
            refetchInterval: () => {
                const utcHour = new Date().getUTCHours()
                // Refetch every 5 minutes if near reset
                return (utcHour >= 17 && d2ServersOnline === false ? 5 : 60) * 60000
            }
        }
    )

    const filteredAlerts = useMemo(() => {
        const utcHour = new Date().getUTCHours()
        const utcDayOfWeek = new Date().getUTCDay()

        // Remove D2-OfflineSoonToday if:
        // - Servers are offline
        // - Past reset today
        // - More than 12 hours until next reset

        const alertsPruned = alerts?.filter(
            alert => !offlineSoonTomorrowAlertKeys.includes(alert.AlertKey)
        )

        const canShowOfflineTodayAlerts =
            d2ServersOnline && utcDayOfWeek === 2 && (utcHour < 17 || utcHour >= 5)

        return canShowOfflineTodayAlerts
            ? alertsPruned
            : alertsPruned?.filter(alert => !offlineSoonTodayAlertKeys.includes(alert.AlertKey))
    }, [d2ServersOnline, alerts])

    return (
        <Container $fullWidth>
            {d2ServersOnline === false && <Destiny2OfflineBanner />}
            {filteredAlerts?.map(alert => (
                <Destiny2AlertBanner key={alert.AlertKey} alert={alert} />
            ))}
        </Container>
    )
}

const Destiny2OfflineBanner = () => (
    <StyledDestiny2OfflineBanner>
        Destiny 2 game servers are currently offline.
    </StyledDestiny2OfflineBanner>
)

const Destiny2AlertBanner = (props: { alert: GlobalAlert }) => {
    const timestamp = new Date(props.alert.AlertTimestamp)
    return (
        <StyledDestiny2AlertBanner $alertLevel={props.alert.AlertLevel}>
            <Link target="_blank" href={props.alert.AlertLink} style={{ color: "unset" }}>
                <div dangerouslySetInnerHTML={{ __html: props.alert.AlertHtml }} />
                <div
                    style={{
                        fontSize: "0.875rem",
                        marginTop: "0.25rem"
                    }}>
                    Posted {formattedTimeSince(timestamp)}
                </div>
            </Link>
        </StyledDestiny2AlertBanner>
    )
}

const StyledDestiny2OfflineBanner = styled(Panel).attrs({ $fullWidth: true })`
    background-color: ${props => props.theme.colors.background.info};
`

const StyledDestiny2AlertBanner = styled(Panel).attrs({ $fullWidth: true })<{
    $alertLevel: GlobalAlertLevel
}>`
    background-color: ${props => {
        switch (props.$alertLevel) {
            case 1:
                return props.theme.colors.background.info
            case 2:
            case 3:
                return props.theme.colors.background.warning
            default:
                return props.theme.colors.background.medium
        }
    }};

    color: ${props => {
        switch (props.$alertLevel) {
            case 2:
            case 3:
                return "black"
            default:
                return props.theme.colors.text.white
        }
    }};
`
