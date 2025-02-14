import type { DefaultTheme } from "styled-components"

export const deviceSizes = {
    tiny: { min: 0, max: 340 },
    mobile: { min: 320, max: 768 },
    tablet: { min: 640, max: 1024 },
    laptop: { min: 1025, max: 2560 },
    desktop: { min: 1440, max: 9999 }
} as const satisfies Record<string, { min: number; max: number }>

export const theme: DefaultTheme = {
    colors: {
        icon: {
            white: "rgb(255, 255, 255)",
            lightGray: "rgb(164, 164, 164)",
            gray: "rgb(103, 103, 103)",
            orange: "rgb(255, 100, 57)",
            success: "rgb(57, 195, 131)",
            error: "rgb(245, 103, 98)",
            twitch: "rgb(100, 65, 165)",
            twitter: "rgb(29, 161, 242)",
            youtube: "rgb(241, 45, 45)",
            bungie: "rgb(154, 213, 236)",
            discord: "rgb(104, 118, 167)"
        },
        text: {
            white: "rgb(255, 255, 255)",
            primary: "rgb(253, 253, 253)",
            secondary: "rgb(183, 183, 183)",
            tertiary: "rgb(105, 105, 105)",
            orange: "rgb(255, 140, 57)"
        },
        border: {
            light: "rgb(255, 255, 255)",
            medium: "rgb(170, 170, 170)",
            dark: "rgb(64, 64, 64)"
        },
        background: {
            light: "rgb(107, 107, 107)",
            medium: "rgb(51, 51, 51)",
            dark: "rgb(8, 8, 8)",
            brandDim: "#FF832940",
            error: "#f3453f",
            info: "rgb(37, 150, 190)",
            warning: "rgb(253, 211, 52)"
        },
        brand: {
            light: "rgb(255, 140, 57, 0.8)",
            primary: "rgb(240, 128, 47, 1)"
        },
        button: {
            green: "rgb(57, 195, 131)",
            destructive: "rgb(160, 79, 79)",
            info: "rgb(37, 150, 190)"
        },
        highlight: {
            orange: "rgb(255, 140, 57)"
        }
    }
}

declare module "styled-components" {
    export interface DefaultTheme {
        colors: {
            icon: {
                white: string
                lightGray: string
                gray: string
                orange: string
                success: string
                error: string
                twitch: string
                twitter: string
                youtube: string
                bungie: string
                discord: string
            }
            text: {
                white: string
                primary: string
                secondary: string
                tertiary: string
                orange: string
            }
            border: {
                light: string
                medium: string
                dark: string
            }
            background: {
                light: string
                medium: string
                dark: string
                info: string
                warning: string
                error: string
                brandDim: string
            }
            brand: {
                light: string
                primary: string
            }
            button: {
                green: string
                destructive: string
                info: string
            }
            highlight: {
                orange: string
            }
        }
    }
}
