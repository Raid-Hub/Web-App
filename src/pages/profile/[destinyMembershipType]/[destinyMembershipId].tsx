import ProfileWrapper from "../../../components/profile/ProfileWrapper"
import { GetStaticProps, NextPage } from "next"
import { InitialProfileProps } from "../../../types/profile"
import { zUniqueDestinyProfile } from "../../../util/server/zod"
import prisma from "../../../util/server/prisma"

const ProfilePage: NextPage<InitialProfileProps> = props => {
    return <ProfileWrapper {...props} />
}

export const getStaticPaths = () => {
    return {
        paths: [],
        fallback: "blocking"
    }
}

export const getStaticProps: GetStaticProps<InitialProfileProps> = async ({ params }) => {
    try {
        const props = zUniqueDestinyProfile.parse(params)
        const vanity = await prisma.vanity
            .findUnique({
                where: {
                    destinyMembershipId_destinyMembershipType: props
                }
            })
            .catch(console.error)

        if (vanity?.string) {
            return {
                redirect: {
                    permanent: true,
                    destination: `/${vanity.string.toLowerCase()}`
                }
            }
        } else {
            return {
                revalidate: 3600 * 24,
                props
            }
        }
    } catch {
        return { notFound: true }
    }
}

export default ProfilePage
