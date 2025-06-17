"use client"

import { useLocale } from "~/components/providers/LocaleManager"
import { useRaidHubPlayerPopulation } from "~/services/raidhub/useRaidHubPlayerPopulation"
import { PopulationGraph } from "./PopulationGraph"

export default function Page() {
    const { locale } = useLocale()
    const query = useRaidHubPlayerPopulation()

    const now = new Date()
    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)

    return (
        <div>
            <h1 style={{ marginBottom: "0.2rem" }}>Hourly Player Population</h1>
            <div style={{ marginBottom: "1.25rem" }}>
                <i>
                    {yesterday.toLocaleDateString(locale, {
                        dateStyle: "medium"
                    })}
                    {" - "}
                    {now.toLocaleDateString(locale, {
                        dateStyle: "medium"
                    })}
                </i>
            </div>
            {query.isSuccess && <PopulationGraph data={query.data} />}
        </div>
    )
}
