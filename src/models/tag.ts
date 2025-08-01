export enum Tag {
    CHECKPOINT = "Checkpoint",
    SOLO = "Solo",
    DUO = "Duo",
    TRIO = "Trio",
    CHALLENGE = "Challenge",
    DAY_ONE = "Day One",
    CONTEST = "Contest",
    WEEK_ONE = "Week One",
    MASTER = "Master",
    PRESTIGE = "Prestige",
    FLAWLESS = "Flawless",
    ABILITIES_ONLY = "Abilities Only",
    FRESH = "Full",
    GUIDEDGAMES = "Guided Games",
    ALL_FEATS = "Max Feats"
}

export const TagForLowMan = {
    1: Tag.SOLO,
    2: Tag.DUO,
    3: Tag.TRIO
}
