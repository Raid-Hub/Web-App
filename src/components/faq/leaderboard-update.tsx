"use client"

export const LeaderboardUpdateAnswer = () => {
    return (
        <p suppressHydrationWarning>
            All individual leaderboards refresh once per day, around{" "}
            {new Date(Date.UTC(2025, 0, 0, 10, 0, 0)).toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
                timeZoneName: "shortGeneric"
            })}
            . If you have recently completed a raid, it will not count towards your clears rank
            until the next daily refresh.
        </p>
    )
}
