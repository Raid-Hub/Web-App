"use client"

import Image from "next/image"
import QuestionMark from "~/components/icons/QuestionMark"
import UserIcon from "~/components/icons/UserIcon"
import { useSession } from "~/hooks/app/useSession"

export const AccountIconContent = () => {
    const { data: session, status } = useSession()

    if (status === "loading") return <QuestionMark color="white" className="size-8" />
    else if (status === "unauthenticated") return <UserIcon color="white" className="size-8" />
    else if (status === "authenticated") {
        const icon = session.user.image
        if (!icon) return <QuestionMark color="white" className="size-8" />

        return <Image src={icon} alt="profile" unoptimized width={32} height={32} />
    } else {
        throw new Error("Invalid status")
    }
}
