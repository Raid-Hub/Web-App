import { GetStaticProps, InferGetStaticPropsType, NextPage } from "next"
import { InitialProfileProps } from "~/types/profile"
import { zUniqueDestinyProfile } from "~/util/zod"
import prisma from "~/server/prisma"
import Profile from "~/components/profile/Profile"
import { prefetchDestinyProfile, prefetchRaidHubProfile } from "~/server/serverQueryClient"
import { DehydratedState, Hydrate } from "@tanstack/react-query"

const ProfilePage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = props => {
    return (
        <Hydrate state={props.dehydratedState}>
            <Profile {...props} />
        </Hydrate>
    )
}

export const getStaticPaths = () => {
    return {
        paths: [],
        fallback: "blocking"
    }
}

export const getStaticProps: GetStaticProps<
    InitialProfileProps & { dehydratedState: DehydratedState }
> = async ({ params }) => {
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
            const [trpcState, bungieState] = await Promise.all([
                prefetchRaidHubProfile(props.destinyMembershipId),
                prefetchDestinyProfile(props)
            ])

            return {
                revalidate: 3600 * 24,
                props: {
                    ...props,
                    dehydratedState: bungieState,
                    trpcState: trpcState
                }
            }
        }
    } catch (e) {
        console.error(e)
        return { notFound: true }
    }
}

export default ProfilePage
