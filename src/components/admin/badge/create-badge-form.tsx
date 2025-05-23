"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Image from "next/image"
import { useForm } from "react-hook-form"
import z from "zod"
import { trpc } from "~/lib/trpc"

import { Button } from "~/shad/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/shad/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/shad/form"
import { Input } from "~/shad/input"
import { Textarea } from "~/shad/textarea"

const formSchema = z.object({
    id: z.string().min(1, { message: "Badge ID is required" }),
    name: z.string().min(1, { message: "Badge name is required" }),
    description: z.string().min(1, { message: "Description is required" }),
    iconFileName: z.string().min(1, { message: "Icon filename is required" })
})

type FormValues = z.infer<typeof formSchema>

export function CreateBadgeForm() {
    const utils = trpc.useUtils()
    const { mutate, isLoading, isError, error, isSuccess, data } =
        trpc.admin.createBadge.useMutation({
            onSuccess: () => {
                void utils.admin.listBadges.refetch()
            }
        })

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            id: "",
            name: "",
            description: "",
            iconFileName: ""
        }
    })

    function onSubmit(values: FormValues) {
        mutate(values)
    }

    return (
        <Card className="w-full max-w-[600px]">
            <CardHeader>
                <CardTitle>Badge Creation</CardTitle>
                <CardDescription>Create a new badge in the system</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Badge ID</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter badge ID" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Badge Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter badge name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Badge Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Enter badge description"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="iconFileName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Icon Filename</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter icon filename" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isLoading} className="w-full">
                            {isLoading ? "Creating..." : "Create Badge"}
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
                                <div className="flex items-center gap-2">
                                    <span>
                                        Created badge {data.id}: {data.name} with description:{" "}
                                        {data.description}
                                    </span>
                                    <div className="relative h-6 w-6">
                                        <Image
                                            src={data.icon || "/placeholder.svg"}
                                            alt={data.name}
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
