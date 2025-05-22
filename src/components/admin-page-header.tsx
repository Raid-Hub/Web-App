export function AdminPageHeader(props: { title?: string; description?: string }) {
    return (
        <div className="flex flex-col justify-between gap-4 p-3 md:flex-row md:items-center">
            <div>
                <h1 className="text-xl font-bold md:text-2xl">{props.title}</h1>
                <p className="text-white/60">{props.description}</p>
            </div>
        </div>
    )
}
