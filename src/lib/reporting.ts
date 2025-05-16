import { z } from "zod"

export const pgcrReportReasons = [
    { id: "cheating", label: "General Cheating" },
    { id: "networkmanipulation", label: "Network Manipulation" },
    { id: "offensive", label: "Offensive Player Names" },
    { id: "cheatercarry", label: "Cheater Carrying Others" }
]

export const pgcrReportHeuristics = [
    { id: "playercount", label: "Player Count Too Low" },
    { id: "speed", label: "Completion Time Too Quick" },
    { id: "heavykills", label: "Heavy Weapon Kills Too High" },
    { id: "grenadekills", label: "Grenade Kills Too High" },
    { id: "superkills", label: "Super Kills Too High" }
]

export const zPgcrReport = z.object({
    categories: z.array(z.string()).min(1, "Please select at least one reason"),
    heuristics: z.array(z.string()),
    explanation: z
        .string()
        .min(1, "Please provide a detailed explanation")
        .max(500, "Explanation must be 500 characters or less"),
    suspectedPlayers: z
        .array(z.string())
        .min(1, "Please select at least one player")
        .max(7, "You can only report up to 7 players at a time")
})
