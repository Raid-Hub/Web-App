"use client"

import { MoreHorizontal, ShieldAlert } from "lucide-react"
import { useState } from "react"
import { ActionsTab } from "~/components/reporting/tabs/actions-tab"
import { InstanceInfoTab } from "~/components/reporting/tabs/instance-info-tab"
import { PlayersTab } from "~/components/reporting/tabs/players-tab"
import { ReportDetailsTab } from "~/components/reporting/tabs/report-details-tab"
import { mockReportDetails, mockReports } from "~/lib/mock-data"
import { Button } from "~/shad/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "~/shad/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/shad/tabs"

interface ReportDetailsProps {
    reportId: number
}

export function ReportDetails({ reportId }: ReportDetailsProps) {
    const [activeTab, setActiveTab] = useState("details")
    const report = mockReports.find(r => r.reportId === reportId)

    if (!report) return null

    return (
        <div className="col-span-3 overflow-hidden rounded-sm border border-white/10 bg-black/30 backdrop-blur-sm md:col-span-2">
            <div className="flex flex-row items-start justify-between border-b border-white/10 p-4">
                <div>
                    <h2 className="flex items-center gap-2 text-lg font-medium">
                        <ShieldAlert className="h-5 w-5 text-orange-500" />
                        Report #{reportId} - Instance #{mockReportDetails.instanceId}
                    </h2>
                    <p className="text-sm text-white/60">Reported on {report.createdAt}</p>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        className="rounded-sm border-white/10 bg-black/90">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem>Mark as Resolved</DropdownMenuItem>
                        <DropdownMenuItem>Blacklist Instance</DropdownMenuItem>
                        <DropdownMenuItem>Reject Report</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="rounded-none border-b border-white/10 bg-black/40">
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
                        value="players"
                        className="rounded-none data-[state=active]:bg-black/40">
                        Players
                    </TabsTrigger>
                    <TabsTrigger
                        value="actions"
                        className="rounded-none data-[state=active]:bg-black/40">
                        Actions
                    </TabsTrigger>
                </TabsList>

                <div className="p-4">
                    <TabsContent value="details" className="mt-0">
                        <ReportDetailsTab report={report} />
                    </TabsContent>

                    <TabsContent value="instance" className="mt-0">
                        <InstanceInfoTab reportDetails={mockReportDetails} />
                    </TabsContent>

                    <TabsContent value="players" className="mt-0">
                        <PlayersTab players={mockReportDetails.players} />
                    </TabsContent>

                    <TabsContent value="actions" className="mt-0">
                        <ActionsTab />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    )
}
