import Image from "next/image"
import Link from "next/link"

export const CheckpointLogo = () => {
    return (
        <div className="relative flex w-full flex-col items-start py-2">
            <div>
                <Image
                    src="/d2checkpoint.png"
                    alt="d2checkpoint"
                    width={70}
                    height={70}
                    priority
                    className="absolute -z-1 w-40 opacity-25"
                />
            </div>
            <h1 className="text-2xl font-bold">Checkpoints</h1>
            <span>
                All checkpoints provided by{" "}
                <Link href="https://d2checkpoint.com/" className="font-semibold hover:underline">
                    d2checkpoint.com
                </Link>
            </span>
            <span>
                Visit their site for more information and{" "}
                <Link href="https://d2checkpoint.com/faq" className="font-semibold hover:underline">
                    FAQ
                </Link>
                s
            </span>
        </div>
    )
}
