export const getRaidSplash = (raid: string | number): keyof typeof R2RaidSplash | null => {
    switch (raid) {
        case "leviathan":
        case 1:
            return "leviathanSplash"
        case "eaterofworlds":
        case 2:
            return "eaterOfWorldsSplash"
        case "spireofstars":
        case 3:
            return "spireOfStarsSplash"
        case "lastwish":
        case 4:
            return "lastWishSplash"
        case "scourgeofthepast":
        case 5:
            return "scourgeOfThePastSplash"
        case "crownofsorrow":
        case 6:
            return "crownOfSorrowSplash"
        case "gardenofsalvation":
        case 7:
            return "gardenOfSalvationSplash"
        case "deepstonecrypt":
        case 8:
            return "deepStoneCryptSplash"
        case "vaultofglass":
        case 9:
            return "vaultOfGlassSplash"
        case "vowofthedisciple":
        case 10:
            return "vowOfTheDiscipleSplash"
        case "kingsfall":
        case 11:
            return "kingsFallSplash"
        case "rootofnightmares":
        case 12:
            return "rootOfNightmaresSplash"
        case "crotasend":
        case 13:
            return "crotasEndSplash"
        case "salvationsedge":
        case 14:
            return "salvationsEdgeSplash"
        case "pantheon":
        case 101:
            return "pantheonSplash"
        default:
            return null
    }
}

export const R2RaidSplash = {
    leviathanSplash: {
        path: "splash/leviathan",
        variants: {
            tiny: "tiny.jpg",
            small: "small.jpg",
            medium: "medium.jpg"
        }
    },
    eaterOfWorldsSplash: {
        path: "splash/eow",
        variants: {
            tiny: "tiny.jpg",
            small: "small.jpg",
            medium: "medium.jpg",
            large: "large.jpg"
        }
    },
    spireOfStarsSplash: {
        path: "splash/spire",
        variants: {
            tiny: "tiny.jpg",
            small: "small.jpg",
            medium: "medium.jpg"
        }
    },
    lastWishSplash: {
        path: "splash/wish",
        variants: {
            tiny: "tiny.jpg",
            small: "small.jpg",
            medium: "medium.jpg"
        }
    },
    scourgeOfThePastSplash: {
        path: "splash/scourge",
        variants: {
            tiny: "tiny.jpg",
            small: "small.jpg",
            medium: "medium.jpg",
            large: "large.jpg"
        }
    },
    crownOfSorrowSplash: {
        path: "splash/crown",
        variants: {
            tiny: "tiny.jpg",
            small: "small.jpg",
            medium: "medium.jpg"
        }
    },
    gardenOfSalvationSplash: {
        path: "splash/gos",
        variants: {
            tiny: "tiny.jpg",
            small: "small.jpg",
            medium: "medium.jpg",
            large: "large.jpg",
            xlarge: "xlarge.jpg"
        }
    },
    deepStoneCryptSplash: {
        path: "splash/dsc",
        variants: {
            tiny: "tiny.jpg",
            small: "small.jpg",
            medium: "medium.jpg",
            large: "large.jpg"
        }
    },
    vaultOfGlassSplash: {
        path: "splash/vog",
        variants: {
            tiny: "tiny.jpg",
            small: "small.jpg",
            medium: "medium.jpg"
        }
    },
    vowOfTheDiscipleSplash: {
        path: "splash/vow",
        variants: {
            tiny: "tiny.jpg",
            small: "small.jpg",
            medium: "medium.jpg",
            large: "large.jpg",
            xlarge: "xlarge.jpg"
        }
    },
    kingsFallSplash: {
        path: "splash/kf",
        variants: {
            tiny: "tiny.jpg",
            small: "small.jpg",
            medium: "medium.jpg",
            large: "large.jpg"
        }
    },
    rootOfNightmaresSplash: {
        path: "splash/ron",
        variants: {
            tiny: "tiny.jpg",
            small: "small.jpg",
            medium: "medium.jpg"
        }
    },
    crotasEndSplash: {
        path: "splash/crota",
        variants: {
            tiny: "tiny.jpg",
            small: "small.jpg",
            medium: "medium.jpg"
        }
    },
    pantheonSplash: {
        path: "splash/pantheon",
        variants: {
            small: "small.png",
            large: "large.png"
        }
    },
    salvationsEdgeSplash: {
        path: "splash/edge",
        variants: {
            tiny: "tiny.jpg",
            small: "small.jpg",
            medium: "medium.jpg"
        }
    }
}
