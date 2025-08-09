import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { trpc } from "~/lib/trpc"
import { Button } from "~/shad/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "~/shad/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel } from "~/shad/form"
import { Input } from "~/shad/input"

type MultiConfirmationModalProps = {
    open: boolean
    onClose: () => void
    instances: string[]
}

export const MultiConfirmationModal = ({
    open,
    onClose,
    instances
}: MultiConfirmationModalProps) => {
    const form = useForm<{ viewName: string }>({
        defaultValues: { viewName: "" }
    })

    const router = useRouter()

    const createMutation = trpc.multi.create.useMutation({
        onSuccess: multi => {
            router.push(`/multi/${multi.id}`)
        }
    })

    const handleSubmit = form.handleSubmit(data => {
        createMutation.mutate({ name: data.viewName, instances })
    })

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Multi-View</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="viewName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>View Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Give your multi-view a name"
                                            autoComplete="off"
                                            type="text"
                                            {...field}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button
                                type="submit"
                                variant="constructive"
                                disabled={createMutation.isLoading}>
                                {!createMutation.isLoading ? "Create Multi-View" : "Creating..."}
                            </Button>
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
