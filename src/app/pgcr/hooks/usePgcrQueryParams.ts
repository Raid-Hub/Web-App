import { z } from "zod"
import { useQueryParams } from "~/hooks/util/useQueryParams"
import { type PGCRPageParams } from "../types"

export const usePGCRQueryParams = () =>
    useQueryParams<PGCRPageParams>(
        z.object({
            player: z
                .string()
                .regex(/^\d{19}$/)
                .optional(),
            character: z
                .string()
                .regex(/^\d{19}$/)
                .optional()
        })
    )
