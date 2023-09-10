import Image from "next/image"
import Link from "next/link"
import styles from "~/styles/pages/home.module.css"
import RaidCardBackground from "~/images/raid-backgrounds"
import { ListedRaid, RaidsWithReprisedContest, ReprisedRaid } from "~/types/raids"
import { LocalStrings } from "~/util/presentation/localized-strings"
import { SpeedrunVariableValues } from "~/data/speedrun-com-mappings"
import { RaidToUrlPaths } from "~/util/destiny/raidUtils"

type HomeRaidCardProps = {
    raid: ListedRaid
    strings: LocalStrings
}

const HomeRaidCard = ({ raid, strings }: HomeRaidCardProps) => {
    return (
        <div id={RaidToUrlPaths[raid]} className={styles["home-raid-card"]}>
            <div className={styles["card-image-header"]}>
                <Image
                    priority
                    unoptimized={false}
                    width={320}
                    height={180}
                    src={RaidCardBackground[raid]}
                    alt={`header for ${strings.raidNames[raid]}`}
                />
                <h3>{strings.raidNames[raid]}</h3>
            </div>
            <div className={styles["card-content"]}>
                <div className={styles["content-section"]}>
                    <Link href={`/leaderboards/${RaidToUrlPaths[raid]}/worldfirst`}>
                        <h4>{strings.worldFirstLeaderboards}</h4>
                    </Link>
                </div>

                <div className={styles["content-section"]}>
                    <h4>{strings.rtaSpeedrunLeaderboards}</h4>
                    <ul>
                        {Object.keys(SpeedrunVariableValues[raid]).length ? (
                            Object.entries(SpeedrunVariableValues[raid]).map(
                                ([type, { id, name: key }]) => (
                                    <li key={id}>
                                        <Link
                                            href={`/leaderboards/${
                                                RaidToUrlPaths[raid]
                                            }/speedrun/rta/${encodeURIComponent(type)}`}>
                                            {strings.leaderboards[key]}
                                        </Link>
                                    </li>
                                )
                            )
                        ) : (
                            <li>
                                <Link href={`/leaderboards/${RaidToUrlPaths[raid]}/speedrun/rta`}>
                                    {strings.leaderboards.anyPercent}
                                </Link>
                            </li>
                        )}
                    </ul>
                </div>
                <div className={styles["content-section"]}>
                    <h4>{strings.apiSpeedrunLeaderboards}</h4>
                    <ul>
                        <li>{strings.comingSoon}</li>
                    </ul>
                </div>
                <div className={styles["content-section"]}>
                    <h4>{strings.clearsLeaderboards}</h4>
                    <ul>
                        <li>{strings.comingSoon}</li>
                    </ul>
                </div>
                <div className={styles["content-section"]}>
                    <h4>{strings.otherLeaderboards}</h4>
                    <ul>
                        {RaidsWithReprisedContest.includes(raid as ReprisedRaid) ? (
                            <li>
                                <Link href={`/leaderboards/${RaidToUrlPaths[raid]}/nochallenge`}>
                                    {strings.noChallenge}
                                </Link>
                            </li>
                        ) : (
                            <li>{strings.comingSoon}</li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default HomeRaidCard
