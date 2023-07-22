import { S3 } from "aws-sdk"
import { protectSession } from "../../../../util/server/sessionProtection"
import { NextApiHandler, NextApiRequest } from "next"
import { UserImageCreateResponse } from "../../../../types/api"
import { userId } from "../[userId]"
import formidable from "formidable"
import fs from "fs"
import prisma from "../../../../util/server/prisma"
import { IncomingForm } from "formidable"
import path, { join } from "path"
import { v4 as uuidv4 } from "uuid"

const s3 = new S3({
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY
})

const handler: NextApiHandler = async (req, res) => {
    if (req.method === "PUT") {
        const _userId = userId(req)
        const validSession = await protectSession({
            req,
            res,
            userId: _userId
        })
        if (_userId && validSession) {
            await uploadImage(req, _userId)
                .then(imageUrl =>
                    prisma.user.update({
                        where: {
                            id: _userId
                        },
                        data: {
                            image: imageUrl
                        },
                        select: {
                            image: true
                        }
                    })
                )
                .then(result =>
                    res.status(201).json({
                        success: true,
                        error: undefined,
                        data: {
                            imageUrl: result.image!
                        }
                    } satisfies UserImageCreateResponse)
                )
                .catch(err =>
                    res.status(500).json({
                        success: false,
                        error: "Failed to edit profile picture",
                        data: err
                    } satisfies UserImageCreateResponse)
                )
        } else {
            return res.status(401).json({
                success: false,
                error: "Unauthorized",
                data: null
            } satisfies UserImageCreateResponse)
        }
    } else {
        res.status(405).json({
            success: false,
            error: "Method not allowed",
            data: null
        } satisfies UserImageCreateResponse)
    }
}

export const config = {
    api: {
        bodyParser: false
    }
}

export default handler

const supportedFileTypes = ["image/jpeg", "image/png", "image/gif"]

async function uploadImage(req: NextApiRequest, userId: string) {
    return new Promise<string>((resolve, reject) => {
        const form = new IncomingForm({
            maxFiles: 1,
            maxFileSize: 2 * 1024 * 1024 // 2 mb
        })
        form.parse(req, async (error, _, { file: files }) => {
            if (error) {
                return reject(error)
            }
            try {
                const file = Array.isArray(files) ? files[0] : files
                if (supportedFileTypes.includes(file.mimetype!)) {
                    let url: Promise<string>
                    switch (process.env.APP_ENV) {
                        case "production":
                        case "beta":
                        case "staging":
                        case "preview":
                            url = uploadToS3({
                                file,
                                userId
                            })
                            break
                        default:
                            url = saveLocally({
                                file,
                                userId
                            })
                    }
                    return await url.then(resolve).catch(reject)
                } else {
                    reject("Unsupported file type: " + file.mimetype)
                }
            } catch (e) {
                reject(e)
            }
        })
    })
}

// this is only used in local dev environments
async function saveLocally({ file, userId }: { file: formidable.File; userId: string }) {
    const uuid = uuidv4()
    const uploadFolder = path.join(__dirname, "../../../../../../public")
    const fileName = `/profile-${userId}-${uuid}-icon.png`
    const destination = join(uploadFolder, fileName)

    const filePath = await new Promise<string>((resolve, reject) => {
        fs.rename(file.filepath, destination, err => {
            if (err) {
                reject(err)
            } else {
                resolve(fileName)
            }
        })
    })

    fs.readdir(uploadFolder, (err, files) => {
        if (err) {
            console.error("Error reading directory:", err)
            return
        }

        files.forEach(file => {
            if (file.includes(`profile-${userId}-`) && !file.includes(uuid)) {
                const fileToDelete = path.join(uploadFolder, file)
                fs.unlink(fileToDelete, err => {
                    if (err) {
                        console.error("Error deleting file:", fileToDelete, err)
                    } else {
                        console.log("Deleted file:", fileToDelete)
                    }
                })
            }
        })
    })

    return filePath
}

async function uploadToS3({ file, userId }: { file: formidable.File; userId: string }) {
    const uuid = uuidv4()
    const newLocation = await s3
        .upload({
            Bucket: process.env.AWS_S3_BUCKET_NAME!,
            Key: `profile/${userId}/${uuid}.png`,
            ContentType: file.mimetype!,
            Body: fs.createReadStream(file.filepath),
            Expires:
                process.env.APP_ENV === "preview"
                    ? new Date(Date.now() + 30 * 24 * 3600 * 1000)
                    : undefined
        })
        .promise()
        .then(res => res.Location)

    try {
        s3.listObjectsV2({
            Bucket: process.env.AWS_S3_BUCKET_NAME!,
            Prefix: `profile/${userId}/`
        })
            .promise()
            .then(data => {
                const Objects =
                    (data.Contents?.filter(({ Key }) => !Key?.includes(uuid)).map(({ Key }) => ({
                        Key
                    })) as {
                        Key: string
                    }[]) ?? []

                if (Objects.length === 0) {
                    return
                }

                s3.deleteObjects({
                    Bucket: process.env.AWS_S3_BUCKET_NAME!,
                    Delete: {
                        Objects
                    }
                })
                    .promise()
                    .then(() => console.log(`Deleted ${Objects.length} images for user: ${userId}`))
            })
    } catch (err) {
        console.error("Error deleting objects:", err)
    }

    return newLocation
}