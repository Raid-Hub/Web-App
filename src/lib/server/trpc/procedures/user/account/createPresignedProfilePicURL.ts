import { S3Client } from "@aws-sdk/client-s3"
import { createPresignedPost } from "@aws-sdk/s3-presigned-post"
import { TRPCError } from "@trpc/server"
import { v4 } from "uuid"
import { z } from "zod"
import { protectedProcedure } from "../../.."

const s3 = new S3Client({
    region: process.env.AWS_S3_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY!
    }
})

export const createPresignedProfilePicURL = protectedProcedure
    .input(
        z.object({
            fileType: z.string()
        })
    )
    .mutation(async ({ input, ctx }) => {
        const userId = ctx.session.user.id

        let ext = ""
        try {
            ext = input.fileType.includes("svg+xml") ? "svg" : input.fileType.split("/")[1]
        } catch (e) {
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Invalid file type."
            })
        }

        const uuid = v4()
        return createPresignedPost(s3, {
            Bucket: process.env.AWS_S3_BUCKET_NAME!,
            Key: `profile/${userId}/${uuid}.${ext}`,
            Expires: 30,
            Conditions: [["content-length-range", 0, 256000]]
        })
    })
