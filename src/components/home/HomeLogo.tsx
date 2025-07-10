"use client"

import Image from "next/image"

export const HomeLogo = () => {
    return (
        <div className="flex h-24 items-center justify-center lg:h-32 2xl:h-40">
            <Image
                src="/logo.png"
                alt=""
                className="absolute left-1/2 size-24 -translate-x-1/2 opacity-10 lg:size-32 2xl:size-40"
                width={70}
                height={70}
            />
            <h1 className="font-sans text-6xl font-extrabold tracking-widest whitespace-nowrap text-white uppercase md:text-2xl lg:text-4xl xl:text-6xl">
                Raid
                <span className="text-raidhub text-shadow-raidhub drop-shadow text-shadow-[0_0_3rem]">
                    Hub
                </span>
            </h1>
        </div>
    )
}
