import { revalidateTag } from "next/cache"
import { Button } from "~/shad/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/shad/card"

const purgeManifest = async () => {
    "use server"
    revalidateTag("manifest")
}

export function PurgeManifestForm() {
    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Reset Cache</CardTitle>
                <CardDescription>
                    Refresh the manifest data and clear the current cache
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={purgeManifest} className="space-y-4">
                    <div className="text-muted-foreground text-sm">
                        This action will purge the current manifest cache and fetch the latest data.
                        This may take a moment to complete.
                    </div>
                    <Button type="submit" className="w-full">
                        Refresh Manifest
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="text-muted-foreground mb-2 text-xs">
                Only use this when you need to update to the latest game data
            </CardFooter>
        </Card>
    )
}
