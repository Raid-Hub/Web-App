import {
    type Control,
    type FieldPath,
    type FieldPathValue,
    type FieldValues
} from "react-hook-form"
import { Button } from "./button"
import { Checkbox } from "./checkbox"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./form"

interface Option<T> {
    id: string
    label: React.ReactNode
    value: T
}

type FieldPathsForArray<TFieldValues extends FieldValues> = keyof {
    [K in FieldPath<TFieldValues> as Exclude<FieldPathValue<TFieldValues, K>, undefined> extends
        | readonly unknown[]
        | unknown[]
        ? K
        : never]: true
} &
    FieldPath<TFieldValues>

interface MultiSelectProps<F extends FieldValues, K extends FieldPathsForArray<F>> {
    options: Option<Exclude<FieldPathValue<F, K>, undefined>[number]>[]
    name: K
    control: Control<F>
    label: string
    description?: string
    showSelectAllButton?: boolean
    showUnselectAllButton?: boolean
}

function MultiSelect<F extends FieldValues, K extends FieldPathsForArray<F>>({
    options,
    name,
    control,
    label,
    description,
    showSelectAllButton = false,
    showUnselectAllButton = false
}: MultiSelectProps<F, K>) {
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
                            const values = field.value as Option<
                                Exclude<FieldPathValue<F, K>, undefined>
                            >[]
                            const stringifiedOption = JSON.stringify(option.value)
                            const isSelected = values.some(
                                value => JSON.stringify(value) === stringifiedOption
                            )
                            return (
                                <FormItem
                                    key={option.id}
                                    className="flex flex-row items-center space-y-0 space-x-3">
                                    <FormControl>
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={checked => {
                                                const newValue = checked
                                                    ? [...values, option.value]
                                                    : values.filter(
                                                          v =>
                                                              JSON.stringify(v) !==
                                                              stringifiedOption
                                                      )
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
