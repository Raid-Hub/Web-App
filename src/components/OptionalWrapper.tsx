import { type ReactNode } from "react"

export const OptionalWrapper = <
    T,
    C extends ReactNode,
    NNT = T extends NonNullable<T> ? NonNullable<T> : never
>(props: {
    condition: T
    children: C
    wrapper: (props: { children: C; value: NNT }) => ReactNode
}) =>
    !props.condition ? (
        props.children
    ) : (
        <props.wrapper value={props.condition as NNT}>{props.children}</props.wrapper>
    )
