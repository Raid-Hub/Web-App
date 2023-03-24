import { FC } from 'react';
import { useLanguage } from '../../hooks/language';
import { Activity } from '../../models/pgcr/Activity';
import styles from '../../styles/pgcr.module.css';
import { LocalizedStrings } from '../../util/localized-strings';
import { ActivityPlacements } from '../../util/server-connection';

interface ActivityHeaderProps {
  placements: ActivityPlacements | null
  activity: Activity | null
}

const ActivityHeader = ({ activity, placements }: ActivityHeaderProps) => {
  const language = useLanguage()
  if (placements && activity) activity.placements = placements
  const strings = LocalizedStrings[language]
  const checkpointDisclaimer = strings.checkPointDisclaimer
  const incomplete = strings.incompleteRaid
  return (
    <div className={styles["activity-card-header-container"]}>
      <div id={styles["activity-card-header"]}>
        <div id={styles["left-info"]}>
          <div id={styles["raid-info-top"]}>
            <span id={styles["completion-time"]}>{
              activity?.completionDate.toLocaleDateString(navigator.language, {
                month: "long",
                day: "numeric",
                year: "numeric"
              }) ?? "Loading..."}
            </span>
          </div>
          <div id={styles["raid-name"]}>
            <span>{activity ? strings.raidNames[activity.name].toUpperCase() : strings.loading}</span>
          </div>
          {activity?.speed.fresh === null && <div id={styles["cp-error"]}>
            <p>{checkpointDisclaimer}</p>
          </div>}
        </div>
        <div id={styles["right-info"]}>
          <div className={styles.duration}>
            {activity?.speed.complete ? activity?.speed.duration.split(" ").map((t, idx) => (
              <span key={idx}>
                <b>{t.substring(0, t.length - 1)}</b>
                {t[t.length - 1]}
              </span>
            )) : <span><b>{incomplete}</b></span>}
          </div>
        </div>
      </div>
      <div id={styles["tags-container"]}>
        {activity?.tags.map((tag, idx) => (
          <div key={idx} className={[styles["soft-rectangle"], styles.tag].join(" ")}>{tag}</div>
        ))}
      </div>
    </div>
  );
}

export default ActivityHeader;
