export interface Report {
    reportId: number
    instanceId: string
    categories: string
    heuristics: string
    players: string
    explanation: string
    status: string
    isReporterInInstance: boolean
    reporterId: string
    assigneeId: string | null
    createdAt: string
    updatedAt: string
}
