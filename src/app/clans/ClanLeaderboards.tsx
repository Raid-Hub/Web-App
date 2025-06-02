"use client"

import { useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { useCallback, useState } from "react"
import styled from "styled-components"
import { ClanBannerComponent } from "~/components/ClanBanner"
import { Panel } from "~/components/Panel"
import NextArrow from "~/components/icons/NextArrow"
import PreviousArrow from "~/components/icons/PreviousArrow"
import PreviousArrowSkip from "~/components/icons/PreviousArrowSkip"
import ReloadArrow from "~/components/icons/ReloadArrow"
import { Container } from "~/components/layout/Container"
import { Flex } from "~/components/layout/Flex"
import { useLocale } from "~/components/providers/LocaleManager"
import { type ClanStatsColumns } from "~/services/raidhub/types"
import { useClanStatsLeaderboard } from "~/services/raidhub/useClanStatsLeaderboard"
import { formattedNumber, secondsToYDHMS } from "~/util/presentation/formatting"

type THParams = { title: string; setSortColumn: () => void; isActive: boolean }

const ROWS_PER_PAGE = 50

export const ClanLeaderboards = () => {
    const { locale } = useLocale()

    const [page, setPage] = useState(1)
    const isFirstPage = page === 1
    const canGoBack = page > 1

    const [sortColumn, setSortColumn] = useState<ClanStatsColumns | undefined>(undefined)
    const { data, isLoading, isFetching, isError, error } = useClanStatsLeaderboard({
        page,
        column: sortColumn,
        count: ROWS_PER_PAGE
    })
    const queryClient = useQueryClient()

    const registerHeading = useCallback(
        (columnName: ClanStatsColumns, title?: string): THParams => ({
            isActive: sortColumn === columnName,
            title:
                title ??
                columnName
                    .split("_")
                    .map(s => s.charAt(0).toUpperCase() + s.substring(1))
                    .join(" "),
            setSortColumn: () => setSortColumn(old => (columnName !== old ? columnName : undefined))
        }),
        [sortColumn]
    )

    if (isError) {
        return <div>Something went wrong. {error.message}</div>
    }

    return (
        <>
            <Panel>
                <Flex $padding={0}>
                    <ReloadArrow
                        sx={25}
                        color="white"
                        hoverColor="orange"
                        pointer
                        onClick={() =>
                            queryClient.refetchQueries([
                                "raidhub",
                                "leaderboard",
                                "clan",
                                sortColumn ?? "weighted_contest_score",
                                page
                            ])
                        }
                    />
                    <PreviousArrowSkip
                        sx={20}
                        color={!isFirstPage ? "white" : "gray"}
                        hoverColor="orange"
                        pointer
                        aria-disabled={isFirstPage}
                        onClick={!isFirstPage ? () => setPage(1) : undefined}
                    />
                    <PreviousArrow
                        sx={20}
                        color={canGoBack ? "white" : "gray"}
                        hoverColor="orange"
                        pointer
                        aria-disabled={!canGoBack}
                        onClick={
                            canGoBack ? () => setPage(page => Math.max(1, page - 1)) : undefined
                        }
                    />
                    <NextArrow
                        sx={20}
                        color="white"
                        hoverColor="orange"
                        pointer
                        onClick={() => setPage(page => page + 1)}
                    />
                </Flex>
            </Panel>
            <ClanTableContainer>
                <ClanTable>
                    <thead>
                        <tr>
                            <th
                                style={{
                                    minWidth: "50px",
                                    position: "sticky",
                                    left: 0,
                                    zIndex: 2,
                                    backgroundColor: "#000000"
                                }}>
                                #
                            </th>
                            <th
                                style={{
                                    position: "sticky",
                                    left: "50px",
                                    zIndex: 2,
                                    backgroundColor: "#000000"
                                }}>
                                Clan
                            </th>
                            <TH
                                {...registerHeading(
                                    "weighted_contest_score",
                                    "Weighted World First Score"
                                )}
                            />
                            <TH
                                {...registerHeading(
                                    "total_contest_score",
                                    "Total World First Score"
                                )}
                            />
                            <TH {...registerHeading("fresh_clears", "Full Clears")} />
                            <TH {...registerHeading("average_fresh_clears", "Avg Full Clears")} />
                            <TH {...registerHeading("clears")} />
                            <TH {...registerHeading("average_clears", "Avg Clears")} />
                            <TH {...registerHeading("sherpas")} />
                            <TH {...registerHeading("average_sherpas", "Avg Sherpas")} />
                            <TH {...registerHeading("time_played_seconds", "In Raid Time")} />
                            <TH
                                {...registerHeading(
                                    "average_time_played_seconds",
                                    "Avg In Raid Time"
                                )}
                            />
                        </tr>
                    </thead>
                    <tbody>
                        {!isLoading && !isFetching
                            ? data.map((entry, idx) => (
                                  <ClanTR key={entry.clan.groupId}>
                                      <ClanRank>{(page - 1) * ROWS_PER_PAGE + idx + 1}</ClanRank>
                                      <ClanTH>
                                          <Link
                                              href={`/clan/${entry.clan.groupId}`}
                                              style={{ color: "unset" }}>
                                              <Flex
                                                  $align="flex-start"
                                                  $paddingX={0.5}
                                                  $paddingY={0.2}>
                                                  <ClanBannerComponent
                                                      id={entry.clan.groupId}
                                                      data={entry.clan.clanBannerData}
                                                      sx={4}
                                                  />
                                                  <div
                                                      style={{
                                                          flex: 1
                                                      }}>
                                                      <div>{entry.clan.name}</div>
                                                      <div
                                                          style={{
                                                              fontWeight: 300
                                                          }}>{`[${entry.clan.callSign}]`}</div>
                                                  </div>
                                              </Flex>
                                          </Link>
                                      </ClanTH>
                                      <ClanTD>
                                          {formattedNumber(entry.weightedContestScore, locale, 3)}
                                      </ClanTD>
                                      <ClanTD>
                                          {formattedNumber(entry.totalContestScore, locale, 3)}
                                      </ClanTD>
                                      <ClanTD>
                                          {formattedNumber(entry.freshClears, locale, 0)}
                                      </ClanTD>
                                      <ClanTD>
                                          {formattedNumber(entry.averageFreshClears, locale, 0)}
                                      </ClanTD>
                                      <ClanTD>{formattedNumber(entry.clears, locale, 0)}</ClanTD>
                                      <ClanTD>
                                          {formattedNumber(entry.averageClears, locale, 0)}
                                      </ClanTD>
                                      <ClanTD>{formattedNumber(entry.sherpas, locale, 0)}</ClanTD>
                                      <ClanTD>
                                          {formattedNumber(entry.averageSherpas, locale, 0)}
                                      </ClanTD>
                                      <ClanTD>{secondsToYDHMS(entry.timePlayedSeconds, 3)}</ClanTD>
                                      <ClanTD>
                                          {secondsToYDHMS(entry.averageTimePlayedSeconds, 3)}
                                      </ClanTD>
                                  </ClanTR>
                              ))
                            : Array.from({ length: ROWS_PER_PAGE }, (_, idx) => (
                                  <ClanTR key={idx}>
                                      <ClanRank>{(page - 1) * ROWS_PER_PAGE + idx + 1}</ClanRank>
                                      <ClanTH />
                                      <ClanTD />
                                      <ClanTD />
                                      <ClanTD />
                                      <ClanTD />
                                      <ClanTD />
                                      <ClanTD />
                                      <ClanTD />
                                      <ClanTD />
                                      <ClanTD />
                                      <ClanTD />
                                  </ClanTR>
                              ))}
                    </tbody>
                </ClanTable>
            </ClanTableContainer>
        </>
    )
}

const ClanTableContainer = styled(Container)`
    width: 100%;
    overflow-x: scroll;
    overflow-y: auto;
    max-height: max(400px, 100vh);
    border: 1px solid #8f8f8f;
`

const ClanTable = styled.table`
    border-collapse: collapse;
    border-spacing: 0;
    border: 1px solid #8f8f8f;

    position: "sticky";

    & thead {
        z-index: 2;
        position: sticky;
        top: 0;
    }

    font-size: min(max(0.75rem, 1vw), 1rem);
    width: 100%;
`

const ClanRank = styled.td`
    text-align: center;

    position: sticky;
    left: 0;
    z-index: 1;
`

const ClanTH = styled.th`
    min-width: 12rem;
    max-width: 12rem;

    position: sticky;
    left: 50px;
    z-index: 1;
`

const ClanTD = styled.td`
    text-align: center;
`

const ClanTR = styled.tr`
    &:nth-child(even)  > * {
        background-color: #1a1a1a;
    }
    &:nth-child(odd) > * {
        background-color: #0d0d0d;
    }
}
`

const TH = ({ isActive, title, setSortColumn }: THParams) => {
    return (
        <ClanHeaderTH onClick={setSortColumn} $isActive={isActive}>
            <div>
                {title} {isActive ? "▼" : ""}
            </div>
        </ClanHeaderTH>
    )
}

const ClanHeaderTH = styled.th<{
    $isActive?: boolean
}>`
    height: 3rem;
    min-width: 16ch;
    max-width: 16ch;
    cursor: pointer;
    padding: 0.25rem 0.75rem;

    background-color: ${({ $isActive }) => ($isActive ? "#202020" : "#000000")};

    transition: background-color 0.1s;

    &:hover {
        background-color: #fa8b14;
    }

    position: relative;
    & div {
        height: 100%;
    }
`
