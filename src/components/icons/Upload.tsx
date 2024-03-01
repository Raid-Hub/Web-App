import { SVG, type SVGWrapperProps } from "../SVG"

export default function UploadIcon(props: SVGWrapperProps) {
    return (
        <SVG viewBox="0 0 32 32" {...props}>
            <polygon points="11 18 12.41 19.41 15 16.83 15 29 17 29 17 16.83 19.59 19.41 21 18 16 13 11 18" />
            <path d="M23.5,22H23V20h.5a4.5,4.5,0,0,0,.36-9L23,11l-.1-.82a7,7,0,0,0-13.88,0L9,11,8.14,11a4.5,4.5,0,0,0,.36,9H9v2H8.5A6.5,6.5,0,0,1,7.2,9.14a9,9,0,0,1,17.6,0A6.5,6.5,0,0,1,23.5,22Z" />
        </SVG>
    )
}
