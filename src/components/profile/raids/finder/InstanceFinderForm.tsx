import { zodResolver } from "@hookform/resolvers/zod"
import Image from "next/image"
import { FormProvider, useFieldArray, useForm, useFormContext } from "react-hook-form"
import styled from "styled-components"
import { type DefaultTheme } from "styled-components/dist/types"
import { z } from "zod"
import { usePageProps } from "~/components/PageWrapper"
import { Flex } from "~/components/__deprecated__/layout/Flex"
import { Grid } from "~/components/__deprecated__/layout/Grid"
import { useRaidHubManifest } from "~/components/providers/RaidHubManifestManager"
import { useSeasons } from "~/hooks/dexie"
import { type ProfileProps } from "~/lib/profile/types"
import { type InstanceFinderQuery } from "~/services/raidhub/types"
import { useRaidHubResolvePlayer } from "~/services/raidhub/useRaidHubResolvePlayer"
import { bungieProfileIconUrl, getBungieDisplayName } from "~/util/destiny"
import { FinderPlayerSearch } from "./InstanceFinderPlayerSearch"

const zPreprocessEmptyStringAsUndefined = <T extends "boolean" | "number" | "string">(
    type: T
): z.ZodEffects<
    z.ZodOptional<ReturnType<(typeof z)[T]>>,
    z.output<ReturnType<(typeof z)[T]>> | undefined,
    unknown
> => {
    const effect = z.preprocess(
        input => (input === "" ? undefined : input),
        z.coerce[type]().optional()
    )
    // @ts-expect-error Not gonna bother perfecting the generic type here
    return effect
}

type FormState = z.input<typeof FormSchema>
const FormSchema = z.object({
    players: z
        .array(
            z.object({
                membershipId: z.string(),
                displayName: z.string().nullable(),
                bungieGlobalDisplayName: z.string().nullable(),
                bungieGlobalDisplayNameCode: z.string().nullable(),
                iconPath: z.string().nullable()
            })
        )
        .nullable(),
    activityId: zPreprocessEmptyStringAsUndefined("number"),
    versionId: zPreprocessEmptyStringAsUndefined("number"),
    completed: zPreprocessEmptyStringAsUndefined("boolean"),
    fresh: zPreprocessEmptyStringAsUndefined("boolean"),
    flawless: zPreprocessEmptyStringAsUndefined("boolean"),
    playerCount: zPreprocessEmptyStringAsUndefined("number"),
    minPlayerCount: zPreprocessEmptyStringAsUndefined("number"),
    maxPlayerCount: zPreprocessEmptyStringAsUndefined("number"),
    minDurationSeconds: zPreprocessEmptyStringAsUndefined("number"),
    maxDurationSeconds: zPreprocessEmptyStringAsUndefined("number"),
    season: zPreprocessEmptyStringAsUndefined("number"),
    minSeason: zPreprocessEmptyStringAsUndefined("number"),
    maxSeason: zPreprocessEmptyStringAsUndefined("number"),
    minDate: zPreprocessEmptyStringAsUndefined("string"),
    maxDate: zPreprocessEmptyStringAsUndefined("string")
})

const booleanOptions = [
    { value: true, label: "Yes" },
    { value: false, label: "No" }
]

const playerCountOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1}`
}))

export const InstanceFinderForm = ({
    onSubmit
}: {
    onSubmit: (data: InstanceFinderQuery) => void
}) => {
    const { destinyMembershipId } = usePageProps<ProfileProps>()
    const player = useRaidHubResolvePlayer(destinyMembershipId)

    const form = useForm({
        resolver: zodResolver(FormSchema)
    })
    const playersArray = useFieldArray({
        control: form.control,
        name: "players"
    })

    const { listedRaidIds, listedVerions, getActivityString, getVersionString } =
        useRaidHubManifest()
    const activityOptions = listedRaidIds.map(id => ({
        value: id,
        label: getActivityString(id)
    }))

    const versionOptions = listedVerions.map(id => ({
        value: id,
        label: getVersionString(id)
    }))

    const seasonsOptions =
        useSeasons({ reversed: true })
            ?.filter(s => s.seasonNumber <= 26)
            .map(season => ({
                value: season.seasonNumber,
                label: season.displayProperties.name || "Red War"
            })) ?? []

    return (
        <FormProvider {...form}>
            <Form
                onSubmit={form.handleSubmit(({ players, ...restOfData }) => {
                    onSubmit({
                        ...restOfData,
                        membershipIds: players?.length
                            ? players.map(player => player.membershipId)
                            : undefined
                    })
                })}>
                <Flex $direction="column" $align="flex-start" $crossAxis="flex-start" $fullWidth>
                    <Label>Players</Label>
                    <p
                        style={{
                            margin: 0,
                            fontSize: "0.75rem"
                        }}>
                        You may select up to 6 additional players
                    </p>
                    <FinderPlayerSearch onSelect={player => playersArray.append(player)} />
                    <PlayerGrid>
                        {player.data && <SinglePlayerDisplay player={player.data} />}
                        {playersArray.fields.map((field, index) => (
                            <SinglePlayerDisplay player={field} key={field.membershipId}>
                                <Button
                                    type="button"
                                    $color="destructive"
                                    onClick={() => playersArray.remove(index)}>
                                    Remove
                                </Button>
                            </SinglePlayerDisplay>
                        ))}
                    </PlayerGrid>
                </Flex>
                <Flex $direction="column" $align="flex-start" $crossAxis="flex-start">
                    <Select label="Activity" options={activityOptions} field="activityId" />
                    <Select label="Version" options={versionOptions} field="versionId" />
                </Flex>
                <Flex $direction="column" $align="flex-start" $crossAxis="flex-start">
                    <Select label="Completed" options={booleanOptions} field="completed" />
                    <Select label="Fresh" options={booleanOptions} field="fresh" />
                    <Select label="Flawless" options={booleanOptions} field="flawless" />
                </Flex>
                <Flex $direction="column" $align="flex-start" $crossAxis="flex-start">
                    <Select label="Player Count" options={playerCountOptions} field="playerCount" />
                    <Select
                        label="Min Player Count"
                        options={playerCountOptions}
                        field="minPlayerCount"
                    />
                    <Select
                        label="Max Player Count"
                        options={playerCountOptions}
                        field="maxPlayerCount"
                    />
                </Flex>
                <Flex $direction="column" $align="flex-start" $crossAxis="flex-start">
                    <Input
                        label="Min Duration (seconds)"
                        type="number"
                        field="minDurationSeconds"
                    />
                    <Input
                        label="Max Duration (seconds)"
                        type="number"
                        field="maxDurationSeconds"
                    />
                </Flex>
                <Flex $direction="column" $align="flex-start" $crossAxis="flex-start">
                    <Select label="Season" field="season" options={seasonsOptions} />
                    <Select label="Min Season" field="minSeason" options={seasonsOptions} />
                    <Select label="Max Season" field="maxSeason" options={seasonsOptions} />
                </Flex>
                <Flex $direction="column" $align="flex-start" $crossAxis="flex-start">
                    <Input label="Min Date" type="date" field="minDate" />
                    <Input label="Max Date" type="date" field="maxDate" />
                </Flex>
                <Flex $padding={0} $fullWidth>
                    <Button type="submit" $color="info">
                        Search
                    </Button>
                    <Button
                        style={{ flex: 1 }}
                        type="reset"
                        $color="destructive"
                        onClick={() => {
                            form.reset()
                            playersArray.remove()
                        }}>
                        Clear
                    </Button>
                </Flex>
            </Form>
        </FormProvider>
    )
}

function SinglePlayerDisplay({
    player,
    children
}: {
    player: NonNullable<FormState["players"]>[number]
    children?: React.ReactNode
}) {
    return (
        <SinglePlayerDisplayStyled>
            <Image
                src={bungieProfileIconUrl(player.iconPath)}
                unoptimized
                alt={player.displayName ?? ""}
                width={48}
                height={48}
            />
            <div>{getBungieDisplayName(player)}</div>
            {children}
        </SinglePlayerDisplayStyled>
    )
}

function Input({
    label,
    type = "text",
    field
}: {
    label: string
    type?: string
    field: keyof FormState
}) {
    const { register } = useFormContext<FormState>()
    return (
        <InputContainer>
            <Label>{label}</Label>
            <InputField type={type} {...register(field)} />
        </InputContainer>
    )
}

function Select<T extends keyof FormState>({
    label,
    field,
    options
}: {
    label: string
    field: T
    options: {
        value: Exclude<FormState[T], undefined>
        label: string
    }[]
}) {
    const { register } = useFormContext<FormState>()
    return (
        <InputContainer>
            <Label>{label}</Label>
            <SelectField {...register(field)}>
                <option value="" className="bg-black">
                    Not Selected
                </option>
                {options.map(option => (
                    <option
                        key={String(option.value)}
                        value={String(option.value)}
                        className="bg-black">
                        {option.label}
                    </option>
                ))}
            </SelectField>
        </InputContainer>
    )
}

const Form = styled.form`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 16px;
    padding: 16px;
    border: 1px solid color-mix(in srgb, ${({ theme }) => theme.colors.border.medium}, #0000 50%);
`

const PlayerGrid = styled(Grid).attrs({
    $minCardWidth: 350,
    $minCardWidthMobile: 275
})`
    width: 100%;

    row-gap: 8px;
    column-gap: 32px;

    padding: 8px;
`

const SinglePlayerDisplayStyled = styled.div`
    display: flex;
    border: 1px solid color-mix(in srgb, ${({ theme }) => theme.colors.border.medium}, #0000 50%);

    justify-content: flex-start;
    align-items: center;
    gap: 1em;

    & button {
        flex: 0;
        margin-right: 1em;
        margin-left: auto;
    }
`

const InputContainer = styled.div`
    display: flex;
    flex-direction: column;
`

const Label = styled.label`
    font-size: 14px;
    margin-bottom: 4px;
`

const InputField = styled.input`
    padding: 8px;
    border: 1px solid color-mix(in srgb, ${({ theme }) => theme.colors.border.medium}, #0000 50%);
`

const SelectField = styled.select`
    padding: 8px;
    border: 1px solid color-mix(in srgb, ${({ theme }) => theme.colors.border.medium}, #0000 50%);
`

const Button = styled.button<{
    $color: keyof DefaultTheme["colors"]["button"]
}>`
    padding: 8px 16px;
    background-color: ${({ theme, $color }) => theme.colors.button[$color]};
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;

    width: 100%;

    transition: background-color 0.1s;
    &:hover {
        background-color: color-mix(
            in srgb,
            ${({ theme, $color }) => theme.colors.button[$color]},
            #0000 50%
        );
    }
`
