"use client"

import { ShieldAlert } from "lucide-react"
import { useState } from "react"
import { trpc } from "~/lib/trpc"
import { useReportedInstance } from "~/services/raidhub/useReportedInstance"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/shad/tabs"
import { ActionsTab } from "./tabs/actions-tab"
import { InstanceInfoTab } from "./tabs/instance-info-tab"
import { ReportDetailsTab } from "./tabs/report-details-tab"

interface ReportDetailsProps {
    reportId: number
    instanceId: string
}

export function ReportPanel({ reportId, instanceId }: ReportDetailsProps) {
    const [activeTab, setActiveTab] = useState("details")

    const {
        data: report,
        isLoading: isReportLoading,
        isError: isReportError,
        error: reportErrorData
    } = trpc.admin.reporting.details.useQuery({ reportId })
    const { data: standing, isLoading, isError, error } = useReportedInstance(instanceId)
    if (isReportLoading) {
        return (
            <div className="flex-1 self-center p-4 text-center">
                <p className="text-white/60">Loading report details...</p>
            </div>
        )
    } else if (isLoading) {
        return (
            <div className="flex-1 self-center p-4 text-center">
                <p className="text-white/60">Loading instance details...</p>
            </div>
        )
    } else if (isReportError) {
        return (
            <div className="flex-1 self-center p-4 text-center">
                <p className="text-red-500">
                    Error loading report details: {reportErrorData.message}
                </p>
            </div>
        )
    } else if (isError) {
        return (
            <div className="flex-1 self-center p-4 text-center">
                <p className="text-red-500">
                    Error loading instance details: {(error as Error).message}
                </p>
            </div>
        )
    }

    return (
        <div className="flex h-full max-w-full flex-1 flex-col">
            <div className="flex grow-0 flex-row items-start justify-between border-b border-white/10 p-4">
                <div>
                    <h2 className="flex items-center gap-2 text-lg font-medium">
                        <ShieldAlert className="text-raidhub h-5 w-5" />
                        Report #{report.reportId} - Instance #{report.instanceId}
                    </h2>
                    <p className="text-sm text-white/60">
                        Reported on {report.createdAt.toLocaleDateString()}
                    </p>
                </div>
            </div>

            <Tabs
                defaultValue="details"
                value={activeTab}
                onValueChange={setActiveTab}
                className="max-h-full min-h-0 gap-0">
                <TabsList className="rounded-none border-r border-b border-white/10 bg-black/40">
                    <TabsTrigger
                        value="details"
                        className="rounded-none data-[state=active]:bg-black/40">
                        Report Details
                    </TabsTrigger>
                    <TabsTrigger
                        value="instance"
                        className="rounded-none data-[state=active]:bg-black/40">
                        Instance Info
                    </TabsTrigger>
                    <TabsTrigger
                        value="actions"
                        className="rounded-none data-[state=active]:bg-black/40">
                        Actions
                    </TabsTrigger>
                </TabsList>

                <div className="min-h-0 flex-1 overflow-y-auto p-4">
                    <TabsContent value="details" className="mt-0 flex">
                        <ReportDetailsTab
                            key={report.reportId}
                            report={report}
                            players={standing.players}
                        />
                    </TabsContent>

                    <TabsContent value="instance" className="mt-0 flex">
                        <InstanceInfoTab key={report.reportId} standing={standing} />
                    </TabsContent>

                    <TabsContent value="actions" className="mt-0 flex">
                        <ActionsTab key={report.reportId} report={report} standing={standing} />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    )
}
