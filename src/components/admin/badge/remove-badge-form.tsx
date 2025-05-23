"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import z from "zod"
import { trpc } from "~/lib/trpc"

import { Button } from "~/shad/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/shad/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/shad/form"
import { Input } from "~/shad/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/shad/select"

const formSchema = z.object({
    destinyMembershipId: z.string().min(1, { message: "Membership ID is required" }),
    badgeId: z.string().min(1, { message: "Badge is required" })
})

type FormValues = z.infer<typeof formSchema>

export function RemoveBadgeForm() {
    const { mutate, isLoading, isError, error, isSuccess, data } =
        trpc.admin.removeBadge.useMutation()
    const { data: allBadges } = trpc.admin.listBadges.useQuery()

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            destinyMembershipId: "",
            badgeId: ""
        }
    })

    function onSubmit(values: FormValues) {
        mutate(values)
    }

    return (
        <Card className="w-full max-w-[600px]">
            <CardHeader>
                <CardTitle>Remove a Badge</CardTitle>
                <CardDescription>
                    Remove a badge from a user by their Destiny Membership ID
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="destinyMembershipId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Destiny Membership ID</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="Enter membership ID"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="badgeId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Badge</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a badge" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {allBadges?.map(badge => (
                                                <SelectItem key={badge.id} value={badge.id}>
                                                    {badge.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button
                            type="submit"
                            disabled={isLoading}
                            variant="destructive"
                            className="w-full">
                            {isLoading ? "Removing..." : "Remove Badge"}
                        </Button>

                        {isError && (
                            <div className="bg-destructive/15 text-destructive mt-4 rounded-md p-3 text-sm">
                                <pre className="overflow-auto">
                                    {JSON.stringify(error.data, null, 2)}
                                </pre>
                            </div>
                        )}

                        {isSuccess && (
                            <div className="bg-primary/15 mt-4 rounded-md p-3 text-sm">
                                <div className="font-medium">Remaining badges for {data.name}:</div>
                                {data.badges.length > 0 ? (
                                    <ul className="mt-2 list-inside list-disc">
                                        {data.badges.map(badge => (
                                            <li key={badge.id}>{badge.name}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-muted-foreground mt-2">
                                        No badges remaining
                                    </p>
                                )}
                            </div>
                        )}
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
