import { PurgeManifestForm } from "./purge-manifest-form"

export function CacheDashboard() {
    return (
        <div className="flex w-full flex-col items-center justify-center gap-6 p-6">
            <PurgeManifestForm />
        </div>
    )
}
