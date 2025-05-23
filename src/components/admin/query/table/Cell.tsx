import { type ColumnFormats } from "./formats"

export const Cell = ({
    value,
    Formatter
}: {
    value: unknown
    Formatter: (typeof ColumnFormats)[keyof typeof ColumnFormats]
}) => {
    return (
        <td>
            {value !== null ? (
                <Formatter
                    // @ts-expect-error Unkown type assigned to never
                    value={value}
                />
            ) : null}
        </td>
    )
}
