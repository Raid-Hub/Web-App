import { useEffect, useState } from "react"
import { useLocalStorageObject } from "~/hooks/util/useLocalStorage"
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
        <th>
            {isEditing ? (
                <>
                    <div>
                        <label style={{ fontSize: "12px", fontWeight: 400 }}>{label}</label>
                    </div>
                    <input
                        type="text"
                        value={editingLabel}
                        onChange={e => setEditingLabel(e.target.value)}
                        placeholder="Enter column name"
                    />
                    <div>
                        <select
                            className="bg-black"
                            id="selector"
                            value={editingDataType}
                            onChange={e =>
                                setEditingDataType(e.target.value as keyof typeof ColumnFormats)
                            }>
                            {Object.keys(ColumnFormats).map(key => (
                                <option key={key} value={key}>
                                    {key}
                                </option>
                            ))}
                        </select>
                    </div>
                </>
            ) : (
                customLabel
            )}
        </th>
    )
}
