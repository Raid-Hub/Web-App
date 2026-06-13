"use client"

import Image from "next/image"

export const HomeLogo = () => {
    return (
        <div className="relative flex h-16 items-center justify-center">
            <Image
                src="/logo.png"
                alt=""
                className="absolute size-16 opacity-10"
                width={64}
                height={64}
            />
            <h1 className="relative font-sans text-4xl font-extrabold tracking-widest whitespace-nowrap text-white uppercase sm:text-5xl">
                Raid
                <span className="text-raidhub">Hub</span>
            </h1>
        </div>
    )
}
