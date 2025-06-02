"use client"

import { css } from "styled-components"
import { o } from "~/util/o"
import { deviceSizes } from "./theme"

const deviceMediaQuery = <T extends keyof typeof deviceSizes>(
    dir: "min" | "max",
    device: T,
    inverted: boolean,
    value: TemplateStringsArray,
    ...values: (
        | string
        | number
        | undefined
        | ((dimensions: (typeof deviceSizes)[T]) => string | number)
    )[]
) => css`
    @media (${inverted ? (dir === "max" ? "min" : "max") : dir}-width: ${deviceSizes[device][dir] +
        (inverted ? (dir === "max" ? 1 : -1) : 0)}px) {
        ${String.raw(
            value,
            ...values.map(val => (typeof val === "function" ? val(deviceSizes[device]) : val))
        )}
    }
`
const queries = (dir: "min" | "max", opts?: { inverted: true }) =>
    o.mapValues(deviceSizes, k => deviceMediaQuery.bind(null, dir, k, !!opts?.inverted))

export const $media = {
    invert: {
        min: queries("min", {
            inverted: true
        }),
        max: queries("max", {
            inverted: true
        })
    },
    min: queries("min"),
    max: queries("max")
}
