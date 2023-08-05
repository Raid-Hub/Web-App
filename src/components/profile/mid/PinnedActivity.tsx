import styles from "../../../styles/pages/profile/mid.module.css"
import Loading from "../../global/Loading"
import { Eager, Pin, Time } from "../../../images/icons"
import { toCustomDateString } from "../../../util/presentation/formatting"
import { ErrorHandler } from "../../../types/generic"
import { useActivity } from "../../../hooks/bungie/useActivity"
import { useLocale } from "../../app/LocaleManager"
import Image from "next/image"
import RaidBanners from "../../../images/raid-banners"
import Link from "next/link"

type PinnedActivityProps = {
    isLoading: boolean
    activityId: string | null | undefined
    isPinned: boolean
    errorHandler: ErrorHandler
}

const PinnedActivity = ({
    activityId,
    errorHandler,
    isPinned,
    isLoading: isLoadingData
}: PinnedActivityProps) => {
    const { pgcr, isLoading: isLoadingActivity } = useActivity({ activityId, errorHandler })
    const { locale, strings } = useLocale()
    return isLoadingData || isLoadingActivity ? (
        <Loading wrapperClass={styles["pinned-activity-loading"]} />
    ) : (
        pgcr && (
            <Link href={`/pgcr/${activityId}`} className={styles["pinned-activity"]}>
                {pgcr.raid !== null && (
                    <Image
                        className={styles["pinned-background"]}
                        src={RaidBanners[pgcr.raid]}
                        alt="Pinned activity"
                        fill
                        priority
                    />
                )}
                {isPinned ? (
                    <Image className={styles["pin-icon"]} src={Pin} alt="pinned" />
                ) : (
                    <Image className={styles["recent-icon"]} src={Time} alt="pinned" />
                )}

                <div className={styles["pinned-activity-text"]}>
                    <p className={styles["pinned-activity-title"]}>{pgcr.title(strings)}</p>
                </div>
                <div className={styles["pinned-activity-subtext"]}>
                    <p>{toCustomDateString(pgcr.completionDate, locale)}</p>

                    <div className={styles["pinned-activity-time"]}>
                        <Image src={Eager} alt="" style={{ width: "20px", height: "20px" }} />
                        <span>{pgcr.speed.string(strings)}</span>
                    </div>
                </div>
            </Link>
        )
    )
}

export default PinnedActivity
