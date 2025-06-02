import { memo, useMemo, useState } from "react"
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    Tooltip,
    XAxis,
    YAxis,
    type TooltipProps
} from "recharts"
import styled from "styled-components"
import { Container } from "~/components/layout/Container"
import { useLocale } from "~/components/providers/LocaleManager"
import { useRaidHubManifest } from "~/components/providers/RaidHubManifestManager"
import { type RaidHubMetricsPopulationRollingDayResponse } from "~/services/raidhub/types"
import { formattedNumber } from "~/util/presentation/formatting"

const colors: Record<number, string> = {
    4: "#fffcd1",
    7: "#97fcbb",
    8: "#979efc",
    9: "#a7d9fc",
    10: "#fa947a",
    11: "#facb7a",
    12: "#fcbdff",
    13: "#80e083",
    14: "#ff5773"
}

export const PopulationGraph = memo(function PopulationGraph({
    data
}: {
    data: RaidHubMetricsPopulationRollingDayResponse
}) {
    const [selectedLine, setSelectedLine] = useState<number | null>(null)
    const { locale, userAgent } = useLocale()
    const { activeRaids, getActivityDefinition } = useRaidHubManifest()

    const isMobile = userAgent.device.type === "mobile"
    const width = isMobile ? 350 : 1150
    const height = isMobile ? 350 : 500

    const values = useMemo(
        () =>
            data
                .toReversed()
                .slice(isMobile ? -12 : 0)
                .map(({ population, hour }) => {
                    const ts = new Date(hour).getTime()
                    const now = Date.now()
                    return {
                        timestamp: ts,
                        population: Object.fromEntries(
                            Object.entries(population).map(([k, val]) => {
                                const hoursBehindNow = Math.min((now - ts) / 3600_000, 4)
                                const estimateRatioReported =
                                    (hoursBehindNow / 4) **
                                    (0.6 + (hoursBehindNow <= 1 ? (1 - hoursBehindNow) * 0.3 : 0))

                                return [k, Math.round(val / estimateRatioReported)]
                            })
                        )
                    }
                }),
        [isMobile, data]
    )

    return (
        <Container
            style={{
                overflowX: "auto",
                overflowY: "hidden"
            }}>
            <LineChart
                width={width}
                height={height}
                data={values}
                margin={
                    isMobile
                        ? { top: 20, right: 0, left: 0, bottom: 20 }
                        : { top: 20, right: 20, left: 20, bottom: 20 }
                }
                style={{
                    width: width,
                    height: height,
                    marginBottom: isMobile ? "100px" : "40px"
                }}>
                <CartesianGrid stroke="#d4d4d474" strokeDasharray="2 2" />
                <XAxis
                    allowDecimals
                    hide={false}
                    orientation="bottom"
                    height={50}
                    mirror={false}
                    xAxisId={0}
                    type="category"
                    padding={{ left: 0, right: 0 }}
                    allowDataOverflow={false}
                    scale="auto"
                    reversed={false}
                    allowDuplicatedCategory
                    dataKey="timestamp"
                    tickFormatter={(value: number) =>
                        new Date(value).toLocaleTimeString(locale, {
                            hour: "2-digit",
                            minute: "2-digit"
                        })
                    }
                    label={isMobile ? undefined : { value: "Hour", position: "insideBottom" }}
                />
                <YAxis
                    allowDuplicatedCategory
                    allowDecimals
                    hide={false}
                    orientation="left"
                    width={80}
                    mirror={false}
                    yAxisId={0}
                    type="number"
                    padding={{ top: 0, bottom: 0 }}
                    allowDataOverflow={false}
                    scale="auto"
                    reversed={false}
                    label={
                        isMobile
                            ? undefined
                            : {
                                  value: "Players per Hour",
                                  angle: -90,
                                  position: "insideLeft"
                              }
                    }
                />
                <Tooltip content={<CustomTooltip />} offset={80} />
                <Legend
                    wrapperStyle={{ width: "100%", bottom: -10 }}
                    height={60}
                    onClick={data => {
                        const raidId = Number((data.dataKey as string).split(".")[1])
                        setSelectedLine(old => (old === raidId ? null : raidId))
                    }}
                />
                {activeRaids.map(raidId => (
                    <Line
                        key={raidId}
                        dataKey={`population.${raidId}`}
                        name={getActivityDefinition(raidId)?.name ?? "Unknown"}
                        type="natural"
                        stroke={colors[raidId] ?? "white"}
                        strokeWidth={raidId === selectedLine ? 5 : 1}
                        dot={false}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                ))}
            </LineChart>
            <p>
                Note: Values for recent hours are adjusted in order to compensate for incomplete
                data. Expect some skew at the beginning of the hour.
            </p>
        </Container>
    )
})

// This is a workaround for a limitation in the recharts library
XAxis.defaultProps = undefined
YAxis.defaultProps = undefined

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    const { locale } = useLocale()
    if (active && payload?.length) {
        return (
            <StyledTooltip>
                <p>{new Date(label as number).toLocaleString(locale)}</p>
                {payload
                    .toSorted((a, b) => b.value! - a.value!)
                    .map(p => (
                        <p key={p.dataKey} style={{ color: p.stroke }}>
                            {p.name}: {formattedNumber(p.value ?? 0, locale)}
                        </p>
                    ))}
                <hr />
                <p>
                    <strong>
                        Total:{" "}
                        {formattedNumber(
                            payload.reduce((acc, p) => acc + (p.value ?? 0), 0),
                            locale
                        )}
                    </strong>
                </p>
            </StyledTooltip>
        )
    }

    return null
}

const StyledTooltip = styled.div`
    background-color: black;
    padding: 8px 15px;
    border: 1px solid white;
    font-size: 0.875rem;
    p {
        color: white;
    }
`
