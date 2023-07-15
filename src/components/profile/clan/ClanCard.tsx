import styles from "../../../styles/pages/profile/clan.module.css"
import { useClan } from "../../../hooks/bungie/useClan"
import Loading from "../../global/Loading"
import ClanBanner from "./ClanBanner"
import { BungieMembershipType } from "bungie-net-core/lib/models"
import { ErrorHandler } from "../../../types/generic"
import { fixClanName } from "../../../util/destiny/fixClanName"

type ClanCardProps = {
    membershipId: string
    membershipType: BungieMembershipType
    errorHandler: ErrorHandler
}

const ClanCard = ({ membershipId, membershipType, errorHandler }: ClanCardProps) => {
    const { clan, isLoading } = useClan({
        membershipId,
        membershipType,
        errorHandler
    })
    return isLoading ? (
        <Loading wrapperClass={styles["card-loading"]} />
    ) : (
        clan && (
            <div className={styles["clan"]}>
                <div className={styles["clan-banner-container"]}>
                    <ClanBanner {...clan.clanBanner} />
                </div>
                <div className={styles["desc"]}>
                    <span className={styles["desc-title"]}>
                        {fixClanName(clan.name) + ` [${clan.clanInfo.clanCallsign}]`}
                    </span>
                    <span className={styles["desc-subtitle"]}>{clan?.motto}</span>
                    <div className={styles["desc-text-wrapper"]}>
                        <p className={styles["desc-text"]}>{urlHighlight(clan?.about ?? "")}</p>
                    </div>
                </div>
            </div>
        )
    )
}

const urlRegex =
    /(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/gim

function urlHighlight(str: string): JSX.Element[] {
    const elements: JSX.Element[] = []
    let match
    let lastIndex = 0
    let key = 0
    while ((match = urlRegex.exec(str))) {
        // Capture the non-matching substring before the matched URL
        if (match.index > lastIndex) {
            elements.push(<span key={key++}>{str.substring(lastIndex, match.index)}</span>)
        }
        // Capture the matched URL
        let url = match[0]
        elements.push(
            <a key={key++} href={url} target="_blank" rel="noopener noreferrer">
                {url}
            </a>
        )
        lastIndex = urlRegex.lastIndex
    }
    // Capture the final non-matching substring after the last matched URL
    if (lastIndex < str.length) {
        elements.push(<span key={lastIndex}>{str.substring(lastIndex)}</span>)
    }
    return elements
}

export default ClanCard