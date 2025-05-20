import { Tabs, TabsList, TabsTrigger } from "~/shad/tabs"

interface ReportingTabsProps {
    activeTab: string
    onTabChange: (value: string) => void
}

const tabs = [
    { value: "all", label: "All" },
    { value: "PENDING", label: "Pending" },
    { value: "ACCEPTED", label: "Accepted" },
    { value: "REJECTED", label: "Rejected" }
]

export function ReportingTabs({ activeTab, onTabChange }: ReportingTabsProps) {
    return (
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
            <TabsList className="flex w-full min-w-min rounded-none border-b border-white/10 bg-black/40">
                {tabs.map(tab => (
                    <TabsTrigger key={tab.value} value={tab.value} className="rounded-none">
                        {tab.label}
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
    )
}
