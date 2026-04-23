import { TableCell } from "~/shad/table"
import { type ColumnFormats } from "./formats"

export const Cell = ({
    value,
    Formatter
}: {
    value: unknown
    Formatter: (typeof ColumnFormats)[keyof typeof ColumnFormats]
}) => {
    return (
        <TableCell>
            {value !== null ? (
                <Formatter
                    // @ts-expect-error Unkown type assigned to never
                    value={value}
                />
            ) : null}
        </TableCell>
    )
}
