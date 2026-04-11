/**
 * Seeds local SQLite (APP_ENV=local) with a PgcrMulti + fixed instance ids — see e2e/constants.ts.
 */
import "dotenv/config"

import {
    E2E_MULTI_INSTANCE_FIRST,
    E2E_MULTI_INSTANCE_SECOND
} from "../e2e/constants"
import { PrismaClient } from "@prisma/client"

const DEFAULT_MULTI_ID = "01KNYVV8NXWK2P4188VNQZTZJM"
/** Placeholder owner — must exist as bungie_user for FK. */
const SEED_OWNER_ID = "4611686018488107374"

async function main() {
    if (process.env.APP_ENV !== "local") {
        console.log("e2e-seed: skipping (APP_ENV is not local)")
        return
    }

    const multiId = process.env.E2E_MULTI_ID ?? DEFAULT_MULTI_ID
    const i1 = E2E_MULTI_INSTANCE_FIRST
    const i2 = E2E_MULTI_INSTANCE_SECOND

    const prisma = new PrismaClient()

    await prisma.user.upsert({
        where: { id: SEED_OWNER_ID },
        create: {
            id: SEED_OWNER_ID,
            role_: "USER"
        },
        update: {}
    })

    await prisma.pgcrMulti.upsert({
        where: { id: multiId },
        create: {
            id: multiId,
            ownerId: SEED_OWNER_ID,
            name: "E2E seed multi",
            instances: {
                create: [{ instanceId: i1 }, { instanceId: i2 }]
            }
        },
        update: {
            name: "E2E seed multi",
            instances: {
                deleteMany: {},
                create: [{ instanceId: i1 }, { instanceId: i2 }]
            }
        }
    })

    await prisma.$disconnect()
    console.log("e2e-seed: ok", { multiId, instances: [i1, i2] })
}

main().catch(e => {
    console.error(e)
    process.exit(1)
})
