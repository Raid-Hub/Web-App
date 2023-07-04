import { Vanity } from "../util/raidhub/special"
import ProfileWrapper from "../components/profile/ProfileWrapper"
import { InitialProfileProps } from "../types/profile"
import { GetStaticPropsResult } from "next"

export async function getServerSideProps({
    params
}: {
    params: { vanity: string }
}): Promise<GetStaticPropsResult<InitialProfileProps>> {
    const vanity = Vanity[params.vanity.toLowerCase()]
    if (!vanity) return { notFound: true }
    const details = Vanity[params.vanity.toLowerCase()]
    return { props: details }
}

export default ProfileWrapper
