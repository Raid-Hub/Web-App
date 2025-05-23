"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useForm } from "react-hook-form"
import z from "zod"
import { trpc } from "~/lib/trpc"

import { Button } from "~/shad/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/shad/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/shad/form"
import { Input } from "~/shad/input"

const formSchema = z.object({
    destinyMembershipId: z.string().min(1, { message: "Membership ID is required" }),
    vanity: z.string().min(1, { message: "Vanity string is required" })
})

type FormValues = z.infer<typeof formSchema>

export function AddVanityForm() {
    const { mutate, isLoading, isError, error, isSuccess, data } =
        trpc.admin.createVanity.useMutation()

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            destinyMembershipId: "",
            vanity: ""
        }
    })

    function onSubmit(values: FormValues) {
        mutate(values)
    }

    return (
        <Card className="w-full max-w-[600px]">
            <CardHeader>
                <CardTitle>Vanity Creation</CardTitle>
                <CardDescription>Create a custom vanity URL for a user</CardDescription>
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
                            name="vanity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Vanity String</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter vanity URL" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isLoading} className="w-full">
                            {isLoading ? "Creating..." : "Create Vanity"}
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
                                <span>
                                    Vanity updated for {data.user?.name ?? data.destinyMembershipId}
                                    :{" "}
                                    <Link
                                        href={`/${data.vanity}`}
                                        className="text-primary font-medium underline">
                                        /{data.vanity}
                                    </Link>
                                </span>
                            </div>
                        )}
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
