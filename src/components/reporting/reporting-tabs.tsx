import { Tabs, TabsList, TabsTrigger } from "~/shad/tabs"

interface ReportingTabsProps {
    activeTab: string
    onTabChange: (value: string) => void
}

export function ReportingTabs({ activeTab, onTabChange }: ReportingTabsProps) {
    return (
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
            <TabsList className="grid grid-cols-4 rounded-none border-b border-white/10 bg-black/40">
                <TabsTrigger value="all" className="rounded-none data-[state=active]:bg-black/40">
                    All
                </TabsTrigger>
                <TabsTrigger
                    value="pending"
                    className="rounded-none data-[state=active]:bg-black/40">
                    Pending
                </TabsTrigger>
                <TabsTrigger
                    value="in_progress"
                    className="rounded-none data-[state=active]:bg-black/40">
                    In Progress
                </TabsTrigger>
                <TabsTrigger
                    value="resolved"
                    className="rounded-none data-[state=active]:bg-black/40">
                    Resolved
                </TabsTrigger>
            </TabsList>
        </Tabs>
    )
}
