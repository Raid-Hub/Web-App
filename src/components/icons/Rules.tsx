import { SVG, type SVGWrapperProps } from "../SVG"

export default function RulesIcon(props: SVGWrapperProps) {
    return (
        <SVG
            viewBox="0 0 32 32"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            xmlSpace="preserve"
            {...props}>
            <path
                d="M25.7,9.3l-7-7C18.5,2.1,18.3,2,18,2H8C6.9,2,6,2.9,6,4v24c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2V10C26,9.7,25.9,9.5,25.7,9.3
	z M18,4.4l5.6,5.6H18V4.4z M24,28H8V4h8v6c0,1.1,0.9,2,2,2h6V28z"
            />
            <rect x="10" y="22" width="12" height="2" />
            <rect x="10" y="16" width="12" height="2" />
        </SVG>
    )
}
