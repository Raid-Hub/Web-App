export const fetchWithErrorLog: typeof fetch = async (...args) => {
    return await fetch(...args).catch(async (err: Error) => {
        console.error("Fetch error:", err, args)
        throw err
    })
}
