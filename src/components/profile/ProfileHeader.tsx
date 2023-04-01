import styles from '../../styles/profile.module.css';

interface ProfileHeaderProps {
}

const ProfileHeader = ({ }: ProfileHeaderProps) => {
    return (
        <div className={styles["card-header"]}
            style={{backgroundImage: "url('https://www.bungie.net/img/destiny_content/pgcr/raid_beanstalk.jpg')"}}>
            <img className={styles["pin"]} src="images/Pin.png" alt=""/>

                <div className={styles["card-header-text"]}>
                    <p className={styles["card-header-title"]}>last wish</p>

                    <div className={styles["card-badge"]}>
                        <img src="images/Diamond.png" alt=""/>
                            <p>Trio Flawless</p>
                    </div>
                </div>
                <div className={styles["card-header-subtext"]}>
                    <p>Achieved on February 23rd, 2022</p>

                    <div className={styles["card-header-time"]}>
                        <img src="images/speed.png" alt=""/>
                            <p>34m 15s</p>
                    </div>
                </div>
        </div>
    )
}

export default ProfileHeader;