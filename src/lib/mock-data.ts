import type { Report } from "./types"

// Mock data for reports
export const mockReports: Report[] = [
    {
        reportId: 1,
        instanceId: "12345678",
        categories: "Cheating",
        heuristics: "Aimbot",
        players: "Player1, Player2",
        explanation: "Suspicious aim behavior throughout the match",
        status: "PENDING",
        isReporterInInstance: true,
        reporterId: "reporter123",
        assigneeId: null,
        createdAt: "2025-05-15T10:30:00Z",
        updatedAt: "2025-05-15T10:30:00Z"
    },
    {
        reportId: 2,
        instanceId: "23456789",
        categories: "Cheating",
        heuristics: "Wallhack",
        players: "Player3, Player4",
        explanation: "Player tracking through walls",
        status: "IN_PROGRESS",
        isReporterInInstance: true,
        reporterId: "reporter456",
        assigneeId: "admin123",
        createdAt: "2025-05-14T15:45:00Z",
        updatedAt: "2025-05-15T09:20:00Z"
    },
    {
        reportId: 3,
        instanceId: "34567890",
        categories: "Harassment",
        heuristics: "Verbal Abuse",
        players: "Player5",
        explanation: "Toxic behavior in chat",
        status: "RESOLVED",
        isReporterInInstance: true,
        reporterId: "reporter789",
        assigneeId: "admin456",
        createdAt: "2025-05-13T08:15:00Z",
        updatedAt: "2025-05-15T11:10:00Z"
    },
    {
        reportId: 4,
        instanceId: "45678901",
        categories: "Cheating",
        heuristics: "Speed Hack",
        players: "Player6",
        explanation: "Player moving at impossible speeds",
        status: "REJECTED",
        isReporterInInstance: true,
        reporterId: "reporter012",
        assigneeId: "admin789",
        createdAt: "2025-05-12T14:20:00Z",
        updatedAt: "2025-05-14T16:30:00Z"
    },
    {
        reportId: 5,
        instanceId: "56789012",
        categories: "Cheating",
        heuristics: "Aimbot, Wallhack",
        players: "Player7, Player8",
        explanation: "Multiple suspicious behaviors",
        status: "PENDING",
        isReporterInInstance: false,
        reporterId: "reporter345",
        assigneeId: null,
        createdAt: "2025-05-11T09:45:00Z",
        updatedAt: "2025-05-11T09:45:00Z"
    }
]

// Mock data for report details
export const mockReportDetails = {
    instanceId: "12345678",
    blacklist: {
        instanceId: "12345678",
        reportSource: "WebReport",
        reportId: 1,
        cheatCheckVersion: "1.2.3",
        reason: "Multiple players using aim assistance",
        createdAt: "2025-05-15T10:30:00Z"
    },
    flags: [
        {
            flaggedAt: "2025-05-15T10:25:00Z",
            cheatCheckVersion: "1.2.3",
            cheatProbability: 0.85,
            cheatCheckBitmask: {
                value: 5, // Example bitmask value
                description: "Aim assistance + ESP detection"
            }
        }
    ],
    players: [
        {
            playerInfo: {
                id: "player123",
                name: "SuspiciousPlayer1",
                platform: "PC"
            },
            flags: [
                {
                    flaggedAt: "2025-05-15T10:25:00Z",
                    cheatCheckVersion: "1.2.3",
                    cheatProbability: 0.92,
                    cheatCheckBitmask: {
                        value: 1,
                        description: "Aim assistance"
                    }
                }
            ],
            clears: 15,
            cheatLevel: 3,
            blacklistedInstances: [
                {
                    instanceId: "11223344",
                    instanceDate: "2025-05-10T14:30:00Z",
                    reason: "Aim assistance",
                    individualReason: "Player using aim assistance",
                    createdAt: "2025-05-10T16:45:00Z"
                }
            ],
            otherRecentFlags: [
                {
                    instanceId: "22334455",
                    flaggedAt: "2025-05-08T09:15:00Z",
                    cheatCheckVersion: "1.2.2",
                    cheatProbability: 0.78,
                    cheatCheckBitmask: {
                        value: 1,
                        description: "Aim assistance"
                    }
                }
            ]
        },
        {
            playerInfo: {
                id: "player456",
                name: "SuspiciousPlayer2",
                platform: "PC"
            },
            flags: [
                {
                    flaggedAt: "2025-05-15T10:25:00Z",
                    cheatCheckVersion: "1.2.3",
                    cheatProbability: 0.65,
                    cheatCheckBitmask: {
                        value: 4,
                        description: "ESP detection"
                    }
                }
            ],
            clears: 27,
            cheatLevel: 2,
            blacklistedInstances: [],
            otherRecentFlags: []
        }
    ]
}
