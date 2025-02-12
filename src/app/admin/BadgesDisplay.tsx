"use client"

import { CloudflareIcon } from "~/components/CloudflareImage"
import { trpc } from "../trpc"

export const BadgesDisplay = () => {
    const { data: allBadges } = trpc.admin.listBadges.useQuery()

    if (!allBadges) {
        return <div>Loading...</div>
    }

    return (
        <div>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Icon</th>
                    </tr>
                </thead>
                <tbody>
                    {allBadges.map(badge => (
                        <tr key={badge.id}>
                            <td>
                                <pre>{badge.id}</pre>
                            </td>
                            <td>{badge.name}</td>
                            <td>{badge.description}</td>
                            <td
                                style={{
                                    maxWidth: "50px",
                                    position: "relative"
                                }}>
                                <CloudflareIcon path={badge.icon} fill alt="" objectFit="contain" />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
