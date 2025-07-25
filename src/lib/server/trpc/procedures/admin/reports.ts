import { type PGCRReportStatus } from "@prisma/client"
import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { adminProcedure } from "../.."

export interface PGCRReportDetails {
    reportId: number
    status: PGCRReportStatus
    instanceId: string
    players: string[]
    heuristics: string[]
    categories: string[]
    explanation: string
    isReporterInInstance: boolean
    reporter: {
        id: string
        name: string | null
        image: string | null
        destinyMembershipId: string
    }
    createdAt: Date
    closedAt: Date | null
    closedBy: {
        id: string
        name: string | null
        image: string | null
    } | null
}

export const reportDetails = adminProcedure
    .input(
        z.object({
            reportId: z.number().int().min(1)
        })
    )
    .query(async ({ ctx, input }) => {
        const report = await ctx.prisma.pgcrReport.findUnique({
            include: {
                reporter: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        profiles: {
                            where: {
                                isPrimary: true
                            },
                            select: {
                                destinyMembershipId: true
                            }
                        }
                    }
                },
                closedBy: {
                    select: {
                        id: true,
                        name: true,
                        image: true
                    }
                }
            },
            omit: {
                reporterId: true,
                closedById: true
            },
            where: {
                reportId: input.reportId
            }
        })

        if (!report) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: `Report with ID ${input.reportId} not found`
            })
        }

        const {
            reporter: { profiles: reporterProfiles, ...reporter },
            players,
            heuristics,
            categories,
            ...rest
        } = report

        const result: PGCRReportDetails = {
            ...rest,
            reporter: {
                ...reporter,
                destinyMembershipId: reporterProfiles.map(p => p.destinyMembershipId)[0]
            },
            players: players.split(",").map(p => p.trim()),
            heuristics: heuristics
                .split(",")
                .map(h => h.trim())
                .filter(h => h.length > 0),
            categories: categories
                .split(",")
                .map(c => c.trim())
                .filter(c => c.length > 0)
        }

        return result
    })

export const recentReports = adminProcedure
    .input(
        z.object({
            page: z.number().int().min(1).default(1),
            limit: z.number().int().min(1).max(500).default(100),
            sort: z.enum(["createdAt", "closedAt"]).default("createdAt"),
            sortOrder: z.enum(["asc", "desc"]).default("desc"),
            status: z.enum(["PENDING", "ACCEPTED", "REJECTED"]).nullable(),
            searchQuery: z.string().optional()
        })
    )
    .query(async ({ ctx, input }) => {
        const reports = await ctx.prisma.pgcrReport.findMany({
            skip: (input.page - 1) * input.limit,
            take: input.limit,
            include: {
                reporter: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        profiles: {
                            where: {
                                isPrimary: true
                            },
                            select: {
                                destinyMembershipId: true
                            }
                        }
                    }
                },
                closedBy: {
                    select: {
                        id: true,
                        name: true,
                        image: true
                    }
                }
            },
            omit: {
                reporterId: true,
                closedById: true
            },
            where: {
                status: input.status ?? undefined,
                OR: input.searchQuery
                    ? [
                          { instanceId: { contains: input.searchQuery } },
                          { players: { contains: input.searchQuery } },
                          { heuristics: { contains: input.searchQuery } },
                          { categories: { contains: input.searchQuery } },
                          { explanation: { contains: input.searchQuery } }
                      ]
                    : undefined
            },
            orderBy: {
                [input.sort]: input.sortOrder
            }
        })

        return reports.map(
            ({
                reporter: { profiles: reporterProfiles, ...reporter },
                players,
                heuristics,
                categories,
                ...rest
            }): PGCRReportDetails => ({
                ...rest,
                reporter: {
                    ...reporter,
                    destinyMembershipId: reporterProfiles.map(p => p.destinyMembershipId)[0]
                },
                players: players.split(",").map(p => p.trim()),
                heuristics: heuristics
                    .split(",")
                    .map(h => h.trim())
                    .filter(h => h.length > 0),
                categories: categories
                    .split(",")
                    .map(c => c.trim())
                    .filter(c => c.length > 0)
            })
        )
    })

export const closeReport = adminProcedure
    .input(
        z.object({
            reportId: z.number().int().min(1),
            status: z.enum(["ACCEPTED", "REJECTED"]),
            notes: z.string().optional()
        })
    )
    .mutation(async ({ ctx, input }) => {
        const report = await ctx.prisma.pgcrReport.findUnique({
            where: {
                reportId: input.reportId
            }
        })

        if (!report) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: `Report with ID ${input.reportId} not found`
            })
        }

        if (report.status !== "PENDING") {
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: `Report with ID ${input.reportId} is already closed`
            })
        }

        return await ctx.prisma.pgcrReport.update({
            data: {
                status: input.status,
                closedBy: {
                    connect: {
                        id: ctx.session.user.id
                    }
                },
                closedAt: new Date()
            },
            where: {
                reportId: input.reportId
            }
        })
    })

export const closeManyReports = adminProcedure
    .input(
        z.object({
            instanceId: z.string(),
            status: z.enum(["ACCEPTED", "REJECTED"]),
            notes: z.string().optional()
        })
    )
    .mutation(async ({ ctx, input }) => {
        const updated = await ctx.prisma.pgcrReport.updateManyAndReturn({
            where: {
                instanceId: input.instanceId,
                status: "PENDING"
            },
            data: {
                status: input.status,
                closedById: ctx.session.user.id,
                closedAt: new Date()
            }
        })

        if (updated.length === 0) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: `No reports found for instance ID ${input.instanceId} with status PENDING`
            })
        }

        return updated
    })

export const deleteReport = adminProcedure
    .input(
        z.object({
            reportId: z.number().int().min(1)
        })
    )
    .mutation(async ({ ctx, input }) => {
        const report = await ctx.prisma.pgcrReport.findUnique({
            where: {
                reportId: input.reportId
            }
        })

        if (!report) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: `Report with ID ${input.reportId} not found`
            })
        }

        return await ctx.prisma.pgcrReport.delete({
            where: {
                reportId: input.reportId
            }
        })
    })
