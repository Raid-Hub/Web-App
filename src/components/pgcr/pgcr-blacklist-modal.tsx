import { Ban } from "lucide-react"
import { useForm } from "react-hook-form"
import { usePGCRContext } from "~/hooks/pgcr/ClientStateManager"
import { useRaidHubBlacklist } from "~/services/raidhub/useRaidHubBlacklist"
import { Button } from "~/shad/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "~/shad/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/shad/form"
import { Textarea } from "~/shad/textarea"

interface BlacklistModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: (blacklisted: boolean) => void
}

export const BlacklistModal = ({ open, onOpenChange, onSuccess }: BlacklistModalProps) => {
    const { data } = usePGCRContext()

    const form = useForm<{ reason: string }>({
        defaultValues: { reason: "" }
    })

    const reason = form.watch("reason")

    const blacklistMutation = useRaidHubBlacklist(data.instanceId, {
        onSuccess: blacklisted => {
            onSuccess(blacklisted)
            form.reset()
            onOpenChange(false)
        },
        onError: error => {
            form.setError("reason", { message: error.message })
        }
    })

    const handleSubmit = form.handleSubmit(({ reason }) => {
        blacklistMutation.mutate({
            removeBlacklist: false,
            reason
        })
    })

    return (
        <Dialog
            open={open}
            onOpenChange={nextOpen => {
                if (!nextOpen) {
                    form.reset()
                }
                onOpenChange(nextOpen)
            }}>
            <DialogContent className="sm:max-w-md">
                <Form {...form}>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Ban className="h-5 w-5 text-red-500" />
                                Blacklist Instance
                            </DialogTitle>
                            <DialogDescription>
                                Add this instance to the blacklist. It will be removed from
                                leaderboards and will not appear as a tag on participant profiles.
                            </DialogDescription>
                        </DialogHeader>
                        <FormField
                            control={form.control}
                            name="reason"
                            rules={{ required: "A reason is required" }}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Reason</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            className="h-24 resize-none text-sm"
                                            placeholder="Enter reason for blacklisting this instance..."
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={blacklistMutation.isLoading}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="destructive"
                                disabled={blacklistMutation.isLoading || !reason.trim()}>
                                {blacklistMutation.isLoading ? "Blacklisting..." : "Blacklist Instance"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
