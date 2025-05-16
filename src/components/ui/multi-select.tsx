import {
    type Control,
    type FieldPath,
    type FieldPathValue,
    type FieldValues
} from "react-hook-form"
import { Button } from "./button"
import { Checkbox } from "./checkbox"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./form"

interface Option {
    id: string
    label: string
}

type FieldPathsForArray<TFieldValues extends FieldValues> = keyof {
    [K in FieldPath<TFieldValues> as FieldPathValue<TFieldValues, K> extends unknown[]
        ? K
        : never]: true
} &
    FieldPath<TFieldValues>

interface MultiSelectProps<F extends FieldValues> {
    options: Option[]
    name: FieldPathsForArray<F>
    control: Control<F>
    label: string
    description?: string
    showSelectAllButton?: boolean
    showUnselectAllButton?: boolean
}

function MultiSelect<F extends FieldValues>({
    options,
    name,
    control,
    label,
    description,
    showSelectAllButton = false,
    showUnselectAllButton = false
}: MultiSelectProps<F>) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <div className="mb-1">
                        <FormLabel>{label}</FormLabel>
                        <FormDescription>{description}</FormDescription>
                    </div>
                    <div className="flex flex-col space-y-2">
                        {options.map(option => {
                            const fieldValue = field.value as string[]
                            return (
                                <FormItem
                                    key={option.id}
                                    className="flex flex-row items-center space-y-0 space-x-3">
                                    <FormControl>
                                        <Checkbox
                                            checked={fieldValue.includes(option.id)}
                                            onCheckedChange={checked => {
                                                const newValue = checked
                                                    ? [...fieldValue, option.id]
                                                    : fieldValue.filter(v => v !== option.id)
                                                field.onChange(newValue)
                                            }}
                                        />
                                    </FormControl>
                                    <FormLabel className="font-normal">{option.label}</FormLabel>
                                </FormItem>
                            )
                        })}
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {showSelectAllButton && (
                            <FormLabel className="font-normal">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    onClick={() => {
                                        const newValue = options.map(o => o.id)
                                        field.onChange(newValue)
                                    }}>
                                    Select All
                                </Button>
                            </FormLabel>
                        )}
                        {showUnselectAllButton && (
                            <FormLabel className="font-normal">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    onClick={() => {
                                        field.onChange([])
                                    }}>
                                    Unselect All
                                </Button>
                            </FormLabel>
                        )}
                    </div>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}

export { MultiSelect }
