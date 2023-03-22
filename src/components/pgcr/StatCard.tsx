import { useLanguage } from "../../hooks/language"
import { PGCREntry } from "../../models/pgcr/Entry"
import { Icons } from "../../util/icons"
import styles from '../../styles/pgcr.module.css'
import { LocalizedStrings } from "../../util/localized-strings"

const StatCards = ({ entry }: { entry: PGCREntry }) => {
    const language = useLanguage()
    const strings = LocalizedStrings[language]
    const statsData: {
      icon: string,
      name: string,
      value: number | string
    }[] = [
        {
          icon: Icons.KILLS,
          name: strings.kills.toLocaleUpperCase(),
          value: entry.stats.kills
        },
        {
          icon: Icons.DEATHS,
          name: strings.deaths.toLocaleUpperCase(),
          value: entry.stats.deaths
        },
        {
          icon: Icons.ASSISTS,
          name: strings.assists.toLocaleUpperCase(),
          value: entry.stats.assists
        },
        {
          icon: Icons.ABILITIES,
          name: strings.abilityKills.toLocaleUpperCase(),
          value: entry.stats.abilityKills
        },
        {
          icon: Icons.TIME,
          name: strings.timeSpent.toLocaleUpperCase(),
          value: entry.stats.timePlayed
        },
        {
          icon: Icons.UNKNOWN,
          name: strings.mostUsedWeapon.toLocaleUpperCase(),
          value: entry.stats.weapons.first()?.name[language] ?? strings.none
        }
      ]
    return (<>
      {statsData.map((stat, idx) => (
        <div key={idx} className={[styles["soft-rectangle"], styles["entry-card"], styles["character-stat"]].join(' ')}>
          <img
            src={stat.icon}
            alt={stat.name + ": " + stat.value}
            className={styles["stat-icon"]} />
          <div className={styles["summary-stat-info"]}>
            <span className={[styles["summary-stat-name"], styles["contained-span"]].join(" ")}>{stat.name}</span>
            <span className={[styles["summary-stat-value"], styles["contained-span"]].join(" ")}>{stat.value}</span>
          </div>
        </div>
      ))}
    </>)
  }

  export default StatCards;