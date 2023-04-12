import styles from '../../styles/profile.module.css';
import { RaidCardBackground, RaidDifficulty } from "../../util/raid";
import { LocalStrings } from "../../util/localized-strings";
import { RaidInfo } from "../../models/pgcr/raid";
import Link from 'next/link';

type ActivityCardProps = {
  strings: LocalStrings
  info: RaidInfo
  completed: boolean
  activityId: any,
  completionDate: Date
}

const ActivityCard = ({ info, strings, completed, activityId, completionDate }: ActivityCardProps) => {
  const difficultyString = [RaidDifficulty.CHALLENGEKF, RaidDifficulty.CHALLENGEVOG].includes(info.difficulty) ?
    strings.difficulty[info.difficulty]
    : info.isDayOne(completionDate) ? strings.dayOne
      : info.isContest(completionDate) ? strings.contest
        : info.difficulty !== RaidDifficulty.NORMAL ?
          strings.difficulty[info.difficulty] : ""
  return (
    <Link
      href={`/pgcr/${activityId}`}
      target="_blank"
      rel="noopener noreferrer"
      className={styles["activity"]}>
      <div className={styles["activity-content"]}>
        <img src={RaidCardBackground[info.raid]} className={styles["activity-content-img"]} />
        <p className={styles["activity-title"]}>
          {`${difficultyString ? difficultyString + " " : ""}${strings.raidNames[info.raid]}`}
        </p>
      </div>

      <div className={styles["success-layer"]}>
        <p style={{ color: completed ? "#98e07b" : "#FF0000" }}>
          {completed ? strings.success : strings.incompleteRaid}
        </p>
      </div>
    </Link>
  )
}

export default ActivityCard;