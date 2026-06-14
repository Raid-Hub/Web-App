import { useEffect, useState } from "react"
import { useLocalStorageObject } from "~/hooks/util/useLocalStorage"
import { Input } from "~/shad/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "~/shad/select"
import { TableHead } from "~/shad/table"
import { ColumnFormats } from "./formats"

export const ColumnLabel = ({
    label,
    isEditing,
    setColumnFn
}: {
    label: string
    isEditing: boolean
    setColumnFn: (label: string, fn: (typeof ColumnFormats)[keyof typeof ColumnFormats]) => void
}) => {
    const [isMounted, setIsMounted] = useState(false)
    const [customLabel, saveLabel] = useLocalStorageObject<string>({
        storageKey: "admin-query-table-column-label",
        paramKey: label,
        defaultValue: label
    })

    const [customDataType, saveDataType] = useLocalStorageObject<keyof typeof ColumnFormats>({
        storageKey: "admin-query-table-data-type",
        paramKey: label,
        defaultValue: "string"
    })

    const [editingLabel, setEditingLabel] = useState(customLabel)
    const [editingDataType, setEditingDataType] = useState(customDataType)

    useEffect(() => {
        setEditingLabel(customLabel)
    }, [customLabel])

    useEffect(() => {
        setEditingDataType(customDataType)
    }, [customDataType])

    useEffect(() => {
        setIsMounted(true)
        if (isMounted && !isEditing) {
            saveLabel(editingLabel)
            saveDataType(editingDataType)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEditing])

    useEffect(
        () => setColumnFn(label, ColumnFormats[editingDataType]),
        [editingDataType, label, setColumnFn]
    )

    return (
        <TableHead>
            {isEditing ? (
                <div className="space-y-2">
                    <div>
                        <label className="text-xs font-normal text-white/60">{label}</label>
                    </div>
                    <Input
                        type="text"
                        value={editingLabel}
                        onChange={e => setEditingLabel(e.target.value)}
                        placeholder="Enter column name"
                        className="h-8 border-zinc-700/50 bg-zinc-900/90 text-xs text-zinc-200"
                    />
                    <Select
                        value={editingDataType}
                        onValueChange={value => setEditingDataType(value as keyof typeof ColumnFormats)}>
                        <SelectTrigger className="h-8 border-zinc-700/50 bg-zinc-900/90 text-xs text-zinc-200">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="border-zinc-700/50 bg-zinc-900 text-zinc-200">
                            {Object.keys(ColumnFormats).map(key => (
                                <SelectItem
                                    key={key}
                                    value={key}
                                    className="text-xs focus:bg-zinc-800 focus:text-zinc-100">
                                    {key}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            ) : (
                customLabel
            )}
        </TableHead>
    )
}
