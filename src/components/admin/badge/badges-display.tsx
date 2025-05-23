"use client"

import Image from "next/image"
import { trpc } from "~/lib/trpc"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/shad/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/shad/table"

export function BadgesDisplay() {
    const { data: allBadges, isLoading } = trpc.admin.listBadges.useQuery()

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>All Badges</CardTitle>
                <CardDescription>List of all available badges in the system</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex h-24 items-center justify-center">
                        <div className="text-muted-foreground text-sm">Loading badges...</div>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="w-[80px]">Icon</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {allBadges?.map(badge => (
                                <TableRow key={badge.id}>
                                    <TableCell className="font-mono text-xs">{badge.id}</TableCell>
                                    <TableCell>{badge.name}</TableCell>
                                    <TableCell>{badge.description}</TableCell>
                                    <TableCell>
                                        <div className="relative h-10 w-10">
                                            <Image
                                                src={badge.icon || "/placeholder.svg"}
                                                alt={badge.name}
                                                fill
                                                className="object-contain"
                                            />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    )
}
