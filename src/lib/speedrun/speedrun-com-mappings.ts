export type RTABoardCategory =
    | "standard"
    | "any-percent"
    | "trio"
    | "prestige"
    | "trio-all-encounters"

export const destiny2GameId = "4d7y5zd7"

export const SpeedrunPlacementIcons = {
    base: "https://www.speedrun.com/static/theme/prdlmnwn/",
    variants: {
        [1]: "1st",
        [2]: "2nd",
        [3]: "3rd"
    }
}

export const SpeedrunVariables: Record<
    string,
    {
        categoryId: string
        variable?: {
            variableId: string
            values: Partial<Record<RTABoardCategory, { id: string; displayName: string }>>
        }
    }
> = {
    leviathan: {
        categoryId: "jdzvzqvk",
        variable: {
            variableId: "68kmerkl",
            values: {
                standard: { id: "4qy4j26q", displayName: "Normal" },
                prestige: { id: "mln3zvoq", displayName: "Prestige" }
            }
        }
    },
    eaterofworlds: {
        categoryId: "824r4ygd"
    },
    spireofstars: {
        categoryId: "9d8g973k"
    },
    lastwish: {
        categoryId: "02qlzqpk",
        variable: {
            variableId: "j84km3wn",
            values: {
                standard: { id: "8107wkol", displayName: "All Encounters" },
                trio: { id: "810292jq", displayName: "Trio All Encounters" },
                "any-percent": { id: "9qjdxk7q", displayName: "Any %" }
            }
        }
    },
    scourgeofthepast: {
        categoryId: "mkernrnd",
        variable: {
            variableId: "5ly7jpgl",
            values: {
                "any-percent": { id: "mln32enq", displayName: "Any %" },
                standard: { id: "4qy467dq", displayName: "No Major Glitches" }
            }
        }
    },
    crownofsorrow: {
        categoryId: "8241elw2"
    },
    gardenofsalvation: {
        categoryId: "7dgng872",
        variable: {
            variableId: "wl3d3gy8",
            values: {
                standard: { id: "4lxn3041", displayName: "Any %" },
                trio: { id: "814z3kvl", displayName: "Trio" }
            }
        }
    },
    deepstonecrypt: {
        categoryId: "zd3oymnd",
        variable: {
            variableId: "789dj59n",
            values: {
                standard: { id: "zqo4dmx1", displayName: "Any %" },
                trio: { id: "013g3wxl", displayName: "Trio" }
            }
        }
    },
    vaultofglass: {
        categoryId: "q25x58vk",
        variable: {
            variableId: "e8mqrmwn",
            values: {
                standard: { id: "jqzj7eml", displayName: "Any %" },
                trio: { id: "klrgw42q", displayName: "Trio" }
            }
        }
    },
    vowofthedisciple: {
        categoryId: "7kj909n2",
        variable: {
            variableId: "gnx2yo48",
            values: {
                standard: { id: "q75vror1", displayName: "Any %" },
                trio: { id: "1gnw26ol", displayName: "Trio" }
            }
        }
    },
    kingsfall: {
        categoryId: "9kvlp902",
        variable: {
            variableId: "9l75odz8",
            values: {
                standard: { id: "192joekq", displayName: "Any %" },
                trio: { id: "12v6yjkq", displayName: "Trio" }
            }
        }
    },
    rootofnightmares: {
        categoryId: "9d88x6ld",
        variable: {
            variableId: "jlzxvz78",
            values: {
                standard: { id: "lx5v72r1", displayName: "Any %" },
                trio: { id: "14o50mjq", displayName: "Trio" }
            }
        }
    },
    crotasend: {
        categoryId: "wdm1pm3d",
        variable: {
            variableId: "onv91378",
            values: {
                standard: { id: "1py4nxg1", displayName: "Any %" },
                trio: { id: "qke98znq", displayName: "Trio" }
            }
        }
    },
    salvationsedge: {
        categoryId: "9kvzop8d"
    }
}
