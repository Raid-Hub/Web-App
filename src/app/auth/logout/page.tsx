import { redirect } from "next/navigation"
import { getServerSession } from "~/lib/server/auth"
import { SignOut } from "./SignOut"

export default async function Page() {
    const session = await getServerSession()
    if (!session) {
        redirect("/")
    } else {
        return <SignOut />
    }
}
