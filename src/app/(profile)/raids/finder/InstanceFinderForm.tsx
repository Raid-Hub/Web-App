import { zodResolver } from "@hookform/resolvers/zod"
import Image from "next/image"
import { FormProvider, useFieldArray, useForm, useFormContext } from "react-hook-form"
import styled from "styled-components"
import { z } from "zod"
import { useRaidHubManifest } from "~/app/layout/wrappers/RaidHubManifestManager"
import { Flex } from "~/components/layout/Flex"
import { Grid } from "~/components/layout/Grid"
import { usePageProps } from "~/components/layout/PageWrapper"
import { useSeasons } from "~/hooks/dexie"
import { type InstanceFinderQuery } from "~/services/raidhub/types"
import { useRaidHubResolvePlayer } from "~/services/raidhub/useRaidHubResolvePlayer"
import { bungieProfileIconUrl, getBungieDisplayName } from "~/util/destiny"
import { type ProfileProps } from "../../types"
import { FinderPlayerSearch } from "./FinderPlayerSearch"

type FormState = z.infer<typeof FormSchema>
const FormSchema = z.preprocess(
    data => {
        if (typeof data === "object") {
            for (const key in data) {
                // @ts-expect-error override
                if (data[key] === "") {
                    // @ts-expect-error override
                    data[key] = undefined
                }
            }
        }
        return data
    },
    z.object({
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
            .optional(),
        activityId: z.coerce.number().optional(),
        versionId: z.coerce.number().optional(),
        completed: z.coerce.boolean().optional(),
        fresh: z.coerce.boolean().optional(),
        flawless: z.coerce.boolean().optional(),
        playerCount: z.coerce.number().optional(),
        minPlayerCount: z.coerce.number().optional(),
        maxPlayerCount: z.coerce.number().optional(),
        minDurationSeconds: z.coerce.number().optional(),
        maxDurationSeconds: z.coerce.number().optional(),
        season: z.coerce.number().optional(),
        minSeason: z.coerce.number().optional(),
        maxSeason: z.coerce.number().optional(),
        minDate: z.string().optional(),
        maxDate: z.string().optional()
    })
)

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

    const form = useForm<FormState>({
        resolver: zodResolver(FormSchema)
    })
    const playersArray = useFieldArray({
        control: form.control,
        name: "players"
    })

    const { listedRaids, listedVerions, getActivityString, getVersionString } = useRaidHubManifest()
    const activityOptions = listedRaids.map(id => ({
        value: id,
        label: getActivityString(id)
    }))

    const versionOptions = listedVerions.map(id => ({
        value: id,
        label: getVersionString(id)
    }))

    const seasons = useSeasons({ reversed: true })
    console.log(seasons)
    const seasonsOptions =
        seasons
            ?.filter(s => s.seasonNumber <= 26)
            .map(season => ({
                value: season.seasonNumber,
                label: season.displayProperties.name || "Red War"
            })) ?? []

    return (
        <FormProvider {...form}>
            <Form
                onSubmit={form.handleSubmit(({ players, ...data }) => {
                    onSubmit({
                        membershipIds: players?.length
                            ? players.map(player => player.membershipId)
                            : undefined,
                        ...data
                    })
                })}>
                <Flex $direction="column" $align="flex-start" $crossAxis="flex-start" $fullWidth>
                    <Label>Players</Label>
                    <FinderPlayerSearch onSelect={player => playersArray.append(player)} />
                    <Grid
                        $fullWidth
                        style={{
                            rowGap: "8px",
                            columnGap: "32px"
                        }}>
                        {player.data && <SinglePlayerDisplay player={player.data} />}
                        {playersArray.fields.map((field, index) => (
                            <SinglePlayerDisplay player={field} key={field.membershipId}>
                                <Button type="button" onClick={() => playersArray.remove(index)}>
                                    Remove
                                </Button>
                            </SinglePlayerDisplay>
                        ))}
                    </Grid>
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
                    <Input label="Min Duration (sec)" type="number" field="minDurationSeconds" />
                    <Input label="Max Duration (sec)" type="number" field="maxDurationSeconds" />
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
                <button
                    type="reset"
                    style={{
                        alignSelf: "flex-end"
                    }}
                    onClick={() => {
                        form.reset()
                        playersArray.remove()
                    }}>
                    Clear
                </button>
                <Button type="submit">Submit</Button>
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
        <Flex $align="flex-start">
            <Image
                src={bungieProfileIconUrl(player.iconPath)}
                unoptimized
                alt={player.displayName ?? ""}
                width={48}
                height={48}
            />
            <div>{getBungieDisplayName(player)}</div>
            {children}
        </Flex>
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
                <option value="">Not Selected</option>
                {options.map(option => (
                    <option key={String(option.value)} value={String(option.value)}>
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
    border-radius: 8px;
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
    border: 1px solid #ccc;
    border-radius: 4px;
`

const SelectField = styled.select`
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
`

const Button = styled.button`
    padding: 8px 16px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;

    width: 100%;

    &:hover {
        background-color: #0056b3;
    }
`
