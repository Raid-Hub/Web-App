import { type Metadata } from "next"

export default async function Page() {
    return (
        <div className="p-6">
            <h3 className="mb-4 text-2xl font-bold">Admin Dashboard</h3>
            <p className="text-muted-foreground mb-4">
                This is the admin dashboard. It is boring right now. Use the sidebar to navigate to
                the different sections.
            </p>
        </div>
    )
}

export const metadata: Metadata = {
    title: "Admin Dashboard"
}
