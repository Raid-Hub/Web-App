import Image from "next/image"
import { z } from "zod"
import { bungieProfileIconUrl } from "~/util/destiny"
import { formattedNumber, formattedTimeSince, secondsToYDHMS } from "~/util/presentation/formatting"

export const ColumnFormats = {
    string: (props: { value: string }) => <>{props.value.toString()}</>,
    number: (props: { value: number }) => <>{formattedNumber(props.value, "en-US")}</>,
    time: (props: { value: string }) => (
        <>
            {new Date(props.value).toLocaleTimeString(undefined, {
                timeZone: "America/Los_Angeles"
            })}
        </>
    ),
    date: (props: { value: string }) => <>{new Date(props.value).toLocaleDateString()}</>,
    datetime: (props: { value: string }) => <>{new Date(props.value).toLocaleString()}</>,
    duration: (props: { value: number }) => <>{secondsToYDHMS(props.value)}</>,
    bungieIcon: (props: { value: string }) => {
        const url = z.string().url().safeParse(bungieProfileIconUrl(props.value))
        return url.success ? (
            <Image src={url.data} width={50} height={50} alt="" unoptimized />
        ) : (
            <span>Invalid Image</span>
        )
    },
    timeSince: (props: { value: string }) => <>{formattedTimeSince(new Date(props.value))}</>
}
