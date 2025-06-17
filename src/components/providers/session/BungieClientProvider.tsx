"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import ClientBungieClient from "~/services/bungie/ClientBungieClient"

const BungieClientContext = createContext<ClientBungieClient | undefined>(undefined)

export const BungieClientProvider = (props: { children: ReactNode }) => {
    const [bungieClient] = useState(() => new ClientBungieClient())
    return (
        <BungieClientContext.Provider value={bungieClient}>
            {props.children}
        </BungieClientContext.Provider>
    )
}

export const useBungieClient = () => {
    const ctx = useContext(BungieClientContext)
    if (!ctx) throw Error("Cannot use useBungieClient outside a child of BungieClientProvider")
    return ctx
}
