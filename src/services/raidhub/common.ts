import type {
    RaidHubAPIResponse,
    RaidHubAPISuccessResponse,
    RaidHubGetPath,
    RaidHubPostPath
} from "~/services/raidhub/types"
import { RaidHubError } from "./RaidHubError"
import type { paths } from "./openapi"

export async function getRaidHubApi<
    T extends RaidHubGetPath,
    P = "parameters" extends keyof paths[T]["get"] ? paths[T]["get"]["parameters"] : null,
    R = paths[T]["get"]["responses"][200]["content"]["application/json"] extends RaidHubAPISuccessResponse<
        infer D
    >
        ? D
        : never
>(
    path: T,
    pathParams: "path" extends keyof P ? P["path"] : null,
    queryParams: "query" extends keyof P ? P["query"] : null,
    config?: Omit<RequestInit, "method" | "body">
): Promise<RaidHubAPISuccessResponse<R>> {
    const url = new URL(
        path.replace(/{([^}]+)}/g, (_, paramName) => {
            // @ts-expect-error types don't really work here
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
            return pathParams[paramName]
        }),
        process.env.RAIDHUB_API_URL
    )
    Object.entries(queryParams ?? {}).forEach(([key, value]) => {
        if (value !== undefined) url.searchParams.set(key, String(value))
    })

    return fetchRaidHub<R>(url, {
        ...config,
        headers: createHeaders(config?.headers),
        method: "GET"
    })
}

export async function postRaidHubApi<
    T extends RaidHubPostPath,
    M extends string & keyof paths[T],
    P = "parameters" extends keyof paths[T][M] ? paths[T][M]["parameters"] : null,
    R = "responses" extends keyof paths[T][M]
        ? 200 extends keyof paths[T][M]["responses"]
            ? "content" extends keyof paths[T][M]["responses"][200]
                ? "application/json" extends keyof paths[T][M]["responses"][200]["content"]
                    ? paths[T][M]["responses"][200]["content"]["application/json"] extends RaidHubAPISuccessResponse<
                          infer D
                      >
                        ? D
                        : 1
                    : 2
                : 3
            : 4
        : 5
>(
    path: T,
    method: M,
    body: "requestBody" extends keyof paths[T][M]
        ? "content" extends keyof paths[T][M]["requestBody"]
            ? "application/json" extends keyof paths[T][M]["requestBody"]["content"]
                ? paths[T][M]["requestBody"]["content"]["application/json"]
                : never
            : never
        : never,
    pathParams: "path" extends keyof P ? P["path"] : null,
    queryParams?: "query" extends keyof P ? P["query"] : null,
    config?: Omit<RequestInit, "method" | "body">
): Promise<RaidHubAPISuccessResponse<R>> {
    const url = new URL(
        path.replace(/{([^}]+)}/g, (_, paramName) => {
            // @ts-expect-error types don't really work here
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
            return pathParams[paramName]
        }),
        process.env.RAIDHUB_API_URL
    )
    Object.entries(queryParams ?? {}).forEach(([key, value]) => {
        url.searchParams.set(key, String(value))
    })

    return fetchRaidHub<R>(url, {
        ...config,
        headers: createHeaders({ "Content-Type": "application/json", ...config?.headers }),
        method: method.toUpperCase(),
        body: JSON.stringify(body)
    })
}

function createHeaders(init?: HeadersInit) {
    const headers = new Headers(init)
    const apiKey = process.env.RAIDHUB_API_KEY
    if (apiKey) {
        headers.set("x-api-key", apiKey)
    }

    if (typeof window === "undefined") {
        headers.set(
            "Origin",
            process.env.DEPLOY_URL ??
                (process.env.VERCEL_URL
                    ? `https://${process.env.VERCEL_URL}`
                    : `https://localhost:${process.env.PORT ?? 3000}`)
        )
    }

    return headers
}

async function fetchRaidHub<R>(url: URL, init: RequestInit): Promise<RaidHubAPISuccessResponse<R>> {
    const res = await fetch(url, init)

    let data: RaidHubAPIResponse<R>
    try {
        data = (await res.json()) as RaidHubAPIResponse<R>
    } catch (err) {
        if (!res.ok) {
            throw new Error("RaidHub API returned " + res.status)
        } else {
            throw err
        }
    }

    if (data.success) {
        return data
    } else {
        throw new RaidHubError(data)
    }
}
