"use client"

import { match } from "@formatjs/intl-localematcher"
import { type DestinyManifestLanguage } from "bungie-net-core/manifest"
import { userAgentFromString } from "next/server"
import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

const d2ManifestLocales = [
    "en",
    "fr",
    "de",
    "es",
    "es-mx",
    "it",
    "ja",
    "ko",
    "pl",
    "pt-br",
    "ru",
    "zh-chs",
    "zh-cht"
] as const satisfies DestinyManifestLanguage[]

const LanguageContext = createContext<
    | {
          locale: string
          manifestLanguage: DestinyManifestLanguage
          userAgent: ReturnType<typeof userAgentFromString>
      }
    | undefined
>(undefined)

export function LocaleManager({ children }: { children: ReactNode }) {
    const [locale, setLocale] = useState<string>("en-US")
    const [userAgent, setUserAgent] = useState(userAgentFromString(""))
    const [manifestLanguage, setManifestLanguage] = useState<DestinyManifestLanguage>("en")

    useEffect(() => {
        setLocale(navigator.language)
        const matchedLanguage = match(
            navigator.languages,
            d2ManifestLocales.map(locale => {
                const transformedLocale = locale
                    .replace(/-chs$/i, "-Hans")
                    .replace(/-cht$/i, "-Hant")

                return transformedLocale
            }),
            "en"
        )
        setManifestLanguage(
            matchedLanguage
                .toLowerCase()
                .replace(/-hans$/i, "-chs")
                .replace(/-hant$/i, "-cht") as DestinyManifestLanguage
        )

        setUserAgent(userAgentFromString(navigator.userAgent ?? ""))

        document.documentElement.setAttribute("lang", matchedLanguage)
    }, [])

    return (
        <LanguageContext.Provider
            value={{
                locale,
                manifestLanguage,
                userAgent
            }}>
            {children}
        </LanguageContext.Provider>
    )
}

export const useLocale = () => {
    const context = useContext(LanguageContext)
    if (!context) throw new Error("useLocale must be used within a LocaleManager")
    return context
}
