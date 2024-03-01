"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { useSearch } from "~/hooks/useSearch"
import { bungieProfileIconUrl } from "~/util/destiny/bungie-icons"
import { getUserName } from "~/util/destiny/bungieName"
import { usePortal } from "../../components/Portal"
import styles from "./guardians.module.css"

export default function Search({ addMember }: { addMember: (membershipId: string) => void }) {
    const ref = useRef<HTMLDivElement>(null)

    const { enteredText, results, handleFormSubmit, handleInputChange } = useSearch()

    const [isShowingResults, setIsShowingResults] = useState(false)

    // control the hiding of the search bar
    useEffect(() => {
        if (isShowingResults) {
            const handleClickOutside = (e: MouseEvent) => {
                if (!ref.current?.parentNode?.contains(e.target as Node)) {
                    setIsShowingResults(false)
                }
            }

            document.addEventListener("click", handleClickOutside)

            return () => {
                document.removeEventListener("click", handleClickOutside)
            }
        } else {
            const handleClickIn = (e: MouseEvent) => {
                if (ref.current?.contains(e.target as Node)) {
                    setIsShowingResults(true)
                }
            }

            document.addEventListener("click", handleClickIn)

            return () => {
                document.removeEventListener("click", handleClickIn)
            }
        }
    }, [isShowingResults])

    useEffect(() => setIsShowingResults(true), [enteredText])

    const { sendThroughPortal } = usePortal()

    return (
        <div className={styles["search"]} ref={ref}>
            <form onSubmit={handleFormSubmit}>
                <input
                    autoFocus
                    type="text"
                    name="search"
                    autoComplete="off"
                    placeholder={"Search for a Guardian"}
                    value={enteredText}
                    onChange={handleInputChange}
                />
            </form>
            {isShowingResults &&
                sendThroughPortal(
                    <ol className={styles["search-results"]}>
                        {results.map((user, idx) => (
                            <li
                                key={idx}
                                className={styles["search-result"]}
                                onClick={() => {
                                    addMember(user.membershipId)
                                    setIsShowingResults(false)
                                }}>
                                <Image
                                    width={45}
                                    height={45}
                                    alt={getUserName(user)}
                                    unoptimized
                                    src={bungieProfileIconUrl(user.iconPath)}
                                />
                                <p>{getUserName(user)}</p>
                            </li>
                        ))}
                    </ol>
                )}
        </div>
    )
}
