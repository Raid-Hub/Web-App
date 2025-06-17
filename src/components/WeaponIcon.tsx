"use client"

import Image from "next/image"
import styled from "styled-components"
import { $media } from "~/lib/media"
import { bungieIconUrl, bungieItemWatermarkUrl } from "~/util/destiny"
import { Container } from "./__deprecated__/layout/Container"

export const WeaponIcon = (props: {
    size: number
    sizeMobile?: number
    alt: string
    icon?: string
    iconWatermark?: string
}) => (
    <WeaponIconContainer $size={props.size} $sizeMobile={props.sizeMobile}>
        <Image src={bungieIconUrl(props.icon)} alt={props.alt} fill unoptimized />
        <Image src={bungieItemWatermarkUrl(props.iconWatermark)} alt="" fill unoptimized />
    </WeaponIconContainer>
)

const WeaponIconContainer = styled(Container)<{
    $size: number
    $sizeMobile?: number
}>`
    width: ${({ $size }) => $size}px;
    height: ${({ $size }) => $size}px;
    ${props =>
        props.$sizeMobile &&
        $media.max.mobile`
        width: ${props.$sizeMobile}px;
        height: ${props.$sizeMobile}px;
    `}
`
