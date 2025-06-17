import { type SVGComponent } from "~/components/SVG"
import styles from "./account.module.css"

export default function Connection({
    unlink,
    link,
    serviceName,
    username,
    Icon
}: {
    username: string | null
    serviceName: string
    link: () => void
    unlink: () => void
    Icon: SVGComponent
}) {
    const canLink = !username

    return (
        <div className={styles["glossy-bg"]}>
            <div className={styles["connection-head"]}>
                <h3>{serviceName}</h3>
                <i>{username}</i>
                <div className={styles["social-icon-container"]}>
                    <Icon color="white" sx={35} className="size-8 text-white" />
                </div>
            </div>
            <div className={styles.buttons}>
                <button onClick={link} disabled={!canLink}>
                    Add {serviceName}
                </button>
                <button onClick={unlink} disabled={canLink}>
                    Unlink {serviceName}
                </button>
            </div>
        </div>
    )
}
