"use client"

import Markdown from "react-markdown"
import { useDialog } from "~/components/Dialog"
import { Panel } from "~/components/__deprecated__/Panel"
import { Flex } from "~/components/__deprecated__/layout/Flex"
import { DiscordIconOld } from "~/components/icons/DiscordIcon"
import RulesIcon from "~/components/icons/Rules"
import { SpeedrunIcon } from "~/components/icons/SpeedrunIcon"
import UploadIcon from "~/components/icons/Upload"
import { useRaidHubManifest } from "~/components/providers/RaidHubManifestManager"
import { SpeedrunVariables, type RTABoardCategory } from "~/lib/speedrun/speedrun-com-mappings"
import { useSpeedrunComRules } from "~/services/speedrun-com/useSpeedrunComRules"
import { includedIn } from "~/util/helpers"
import { ExtLink, TooltipWrapper } from "../../../../LeaderboardSplashComponents"

export const SpeedrunComControls = (props: {
    raidId: number
    raidPath: string
    category?: RTABoardCategory
}) => {
    const { sunsetRaidIds, getActivityString } = useRaidHubManifest()
    const { Dialog: RulesDialog, open: openRules } = useDialog()

    const getURL = () => {
        const url = new URL("https://www.speedrun.com/destiny2")

        const categoryId = SpeedrunVariables[props.raidPath].categoryId
        const variable = SpeedrunVariables[props.raidPath].variable
        const id = props.category ? (variable?.values[props.category]?.id ?? null) : null
        url.searchParams.set(
            "x",
            `${categoryId}${variable && id ? `-${variable.variableId}.${id}` : ""}`
        )

        return url
    }

    const getSubmitRunURL = () => {
        const url = getURL()
        url.pathname += "/runs/new"
        url.searchParams.set("rules", "game")
        return url
    }

    const { data: rules } = useSpeedrunComRules({
        categoryId: SpeedrunVariables[props.raidPath]?.categoryId
    })

    return (
        <Flex $padding={0}>
            <Panel $static>
                <Flex as="nav" $padding={0} $gap={0.75} style={{ alignSelf: "flex-end" }}>
                    <TooltipWrapper id="src-page" title="Speedrun.com Page">
                        <ExtLink href={getURL()}>
                            <SpeedrunIcon className="size-7" />
                        </ExtLink>
                    </TooltipWrapper>
                    <TooltipWrapper id="src-rules" title="Category Rules">
                        <RulesIcon sx={25} onClick={openRules} pointer />
                    </TooltipWrapper>
                    {!includedIn(sunsetRaidIds, props.raidId) && (
                        <TooltipWrapper id="src-submit" title="Submit Run">
                            <ExtLink href={getSubmitRunURL()}>
                                <UploadIcon sx={25} />
                            </ExtLink>
                        </TooltipWrapper>
                    )}
                    <TooltipWrapper id="src-discord" title="Speedrun Community Discord">
                        <ExtLink href="https://discord.gg/d2speedrun">
                            <DiscordIconOld sx={25} color="white" />
                        </ExtLink>
                    </TooltipWrapper>
                </Flex>
            </Panel>
            <RulesDialog style={{ maxWidth: "800px" }}>
                <h1> Submission Rules - {getActivityString(props.raidId)}</h1>
                <Markdown
                    components={{
                        h1: "h2",
                        h2: "h3",
                        h3: "h4"
                    }}>
                    {rules}
                </Markdown>
            </RulesDialog>
        </Flex>
    )
}
