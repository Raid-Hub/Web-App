"use client"
import "katex/dist/katex.min.css"
import { BlockMath } from "react-katex"

export const WFRAnswer = () => {
    const raidNumber = 15
    const placement = 26
    const wfrExample = (Math.pow(1.25, raidNumber - 1) / Math.sqrt(placement)).toFixed(3)

    return (
        <div className="space-y-4">
            <p>
                <strong>WFR</strong> (World First Rating) measures your placements in World First
                races. Newer raids are weighted more heavily, and higher placements award
                proportionally more points. This allows for an accurate rating of players at the
                current moment. The formula for calculating WFR Score is:
            </p>

            <BlockMath
                math={`\\sum_{raid=1}^{\\text{total raids}} \\frac{1.25^{(raid-1)}}{\\sqrt{\\text{placement(raid)}}}`}
            />

            <p className="text-center">
                For example, if you placed <strong>{placement}th</strong> in The Desert Perpetual,
                the {raidNumber}th raid, your partial WFR for that raid would be:
            </p>

            <BlockMath
                math={`\\frac{1.25^{(${raidNumber}-1)}}{\\sqrt{${placement}}} \\approx ${wfrExample}`}
            />
        </div>
    )
}
