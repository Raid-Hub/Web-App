import { useSession } from "next-auth/react"
import { UseLocalStorage } from "../../hooks/util/useLocalStorage"
import styles from "../../styles/pages/pgcr.module.css"
import { useLocale } from "../app/LocaleManager"
import ToggleSwitch from "../reusable/ToggleSwitch"
import PinPCRCell from "./PinPGCRCell"
import { usePGCRContext } from "../../pages/pgcr/[activityId]"

export type PGCRSettings = {
    showScore: boolean
}

type PGCRSettingsMenuProps = UseLocalStorage<PGCRSettings>

const PGCRSettingsMenu = ({ value, save }: PGCRSettingsMenuProps) => {
    const { data: sessionData } = useSession()
    const { pgcr } = usePGCRContext()
    const { strings } = useLocale()

    return (
        <div className={styles["settings-menu-dropdown"]}>
            <div>
                <span>{strings.showScore}</span>
                <ToggleSwitch
                    label="show-score"
                    value={value?.showScore ?? false}
                    onToggle={state => save(old => ({ ...old, showScore: state }))}
                    size={20}
                />
            </div>

            <hr
                style={{
                    border: "none",
                    height: "1px",
                    width: "100%",
                    backgroundColor: "#888888"
                }}
            />

            {sessionData?.user.destinyMembershipId &&
                pgcr?.players
                    ?.map(p => p.membershipId)
                    .includes(sessionData.user.destinyMembershipId) && (
                    <PinPCRCell destinyMembershipId={sessionData.user.destinyMembershipId} />
                )}
        </div>
    )
}

export default PGCRSettingsMenu
