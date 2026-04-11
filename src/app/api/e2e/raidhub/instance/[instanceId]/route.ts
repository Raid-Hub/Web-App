import { NextResponse } from "next/server"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { type RaidHubInstanceExtended } from "~/services/raidhub/types"

const fixturePath = (instanceId: string) =>
    path.resolve(process.cwd(), "e2e", "fixtures", `${instanceId}.json`)

export async function GET(_request: Request, { params }: { params: { instanceId: string } }) {
    try {
        const fixture = await readFile(fixturePath(params.instanceId), "utf8")
        const response = JSON.parse(fixture) as RaidHubInstanceExtended

        return NextResponse.json({
            minted: new Date().toISOString(),
            success: true,
            response
        })
    } catch {
        return NextResponse.json(
            {
                minted: new Date().toISOString(),
                success: false,
                code: "InstanceNotFoundError",
                error: {
                    instanceId: params.instanceId
                }
            },
            {
                status: 404
            }
        )
    }
}
