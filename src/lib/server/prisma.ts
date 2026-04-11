import "server-only"

import path from "node:path"
import { createClient } from "@libsql/client"
import { PrismaLibSQL } from "@prisma/adapter-libsql"
import { PrismaClient } from "@prisma/client"
import { saferFetch } from "./saferFetch"

export type PrismaClientWithExtensions = ReturnType<typeof createPrismaWithExtension>

interface GlobalThisWithPrisma {
    prisma?: PrismaClientWithExtensions
}
const globalForPrisma = globalThis as unknown as GlobalThisWithPrisma

const localSqliteUrl = `file:${path.resolve(process.cwd(), "prisma", "raidhub-sqlite.db")}`

const createPrismaWithExtension = () => {
    const libSQL = createClient(
        process.env.APP_ENV === "local"
            ? { url: localSqliteUrl }
            : {
                  url: process.env.TURSO_DATABASE_URL!,
                  authToken: process.env.TURSO_AUTH_TOKEN,
                  fetch: async (request: Request) => {
                      return await saferFetch(request, {
                          cache: "no-store"
                      })
                  }
              }
    )

    return new PrismaClient({
        log: process.env.APP_ENV === "local" ? ["query", "error", "warn"] : ["error"],
        adapter: new PrismaLibSQL(libSQL)
    }).$extends({
        name: "roleEnum",
        result: {
            user: {
                role: {
                    needs: {
                        role_: true
                    },
                    compute: data => data.role_ as "USER" | "ADMIN"
                }
            }
        }
    })
}

export const prisma = globalForPrisma.prisma ?? createPrismaWithExtension()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
